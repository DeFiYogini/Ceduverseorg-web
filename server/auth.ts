import type { Express, Request, Response, NextFunction, RequestHandler } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { users, accounts, profiles, teamUsers, teams, cooperativeMemberships, termsVersions, userTermsAcceptances, otpCodes } from "@shared/schema";
import { eq, and, sql, lte, inArray, notInArray } from "drizzle-orm";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "./email";

// Demo accounts — loaded from DEMO_ACCOUNTS env var (JSON array) or empty if not set
type DemoAccount = { email: string; fullName: string; role: "socio_estudiante" | "admin" | "socio_comercial" | "superadmin" | "socio_instructor" | "empresa"; isOrgAdmin?: boolean };

function loadDemoAccounts(): DemoAccount[] {
  const raw = process.env.DEMO_ACCOUNTS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    console.error("[auth] Invalid DEMO_ACCOUNTS JSON — demo accounts disabled");
    return [];
  }
}

const DEMO_ACCOUNTS = loadDemoAccounts();

function findDemoAccount(email: string) {
  return DEMO_ACCOUNTS.find(d => d.email === email.trim().toLowerCase());
}

const JWT_SECRET: string = process.env.SESSION_SECRET!;
if (!process.env.SESSION_SECRET) {
  console.error("[FATAL] SESSION_SECRET environment variable is required for JWT signing");
  process.exit(1);
}
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const JWT_EXPIRY = "7d";

declare global {
  namespace Express {
    interface Request {
      supabaseUserId?: string;
    }
  }
}

// Periodic cleanup of expired OTP codes from the database
setInterval(async () => {
  try {
    await db.delete(otpCodes).where(lte(otpCodes.expiresAt, new Date()));
  } catch (err: any) {
    console.error("[auth] OTP cleanup error:", err.message);
  }
}, 60_000);

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function signJwt(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

function verifyJwt(token: string): { userId: string; email: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    return payload;
  } catch {
    return null;
  }
}

async function ensureLocalUser(userId: string, email: string, fullName?: string): Promise<void> {
  if (!email) {
    throw new Error("User has no email");
  }

  await db.insert(users)
    .values({ id: userId, email, password: crypto.randomBytes(32).toString("hex") })
    .onConflictDoNothing({ target: users.id });

  await db.insert(accounts)
    .values({ id: userId })
    .onConflictDoNothing({ target: accounts.id });

  await db.insert(profiles)
    .values({ id: userId, fullName: fullName || null })
    .onConflictDoNothing({ target: profiles.id });
}

export function setupAuth(app: Express): void {
  app.post("/api/auth/send-code", async (req: Request, res: Response) => {
    try {
      const { email, fullName, joinCoop, phone, curp } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Correo electrónico requerido" });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ message: "Correo electrónico inválido" });
      }

      const demo = findDemoAccount(normalizedEmail);
      if (demo) {
        let [existingUser] = await db.select().from(users).where(eq(users.email, normalizedEmail));
        let userId: string;
        if (existingUser) {
          userId = existingUser.id;
          await db.update(accounts).set({ userRole: demo.role, accountSetup: 4 }).where(eq(accounts.id, userId));
        } else {
          userId = crypto.randomUUID();
          await ensureLocalUser(userId, normalizedEmail, demo.fullName);
          await db.update(accounts).set({ userRole: demo.role, accountSetup: 4 }).where(eq(accounts.id, userId));
          if (demo.isOrgAdmin) {
            const teamId = `demo-empresa-${userId.slice(0, 8)}`;
            await db.insert(teams).values({ id: teamId, name: "Demo Empresa S.A. de C.V.", description: "Organización demo para pruebas", plan: "impulsa", status: "active" }).onConflictDoNothing();
            await db.insert(teamUsers).values({ teamId, userId, role: "admin" }).onConflictDoNothing();
          }
        }
        const token = signJwt(userId, normalizedEmail);
        const profile = await db.select().from(profiles).where(eq(profiles.id, userId));
        const account = await storage.getAccount(userId);
        return res.json({
          success: true,
          autoLogin: true,
          token,
          user: { id: userId, email: normalizedEmail, fullName: profile[0]?.fullName || demo.fullName, role: account?.userRole || demo.role },
        });
      }

      // Check for recent OTP to prevent spam (must wait 30s between requests)
      const [existing] = await db.select().from(otpCodes)
        .where(eq(otpCodes.email, normalizedEmail))
        .orderBy(sql`created_at DESC`)
        .limit(1);
      if (existing && (new Date(existing.createdAt).getTime() + 30_000) > Date.now()) {
        return res.status(429).json({ message: "Espera antes de solicitar otro código" });
      }

      // Delete any previous OTPs for this email
      await db.delete(otpCodes).where(eq(otpCodes.email, normalizedEmail));

      const code = generateOtp();
      await db.insert(otpCodes).values({
        email: normalizedEmail,
        code,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
        fullName: fullName || null,
        joinCoop: joinCoop || false,
        phone: phone || null,
        curp: curp || null,
      });
      await sendOtpEmail(normalizedEmail, code);

      res.json({ success: true, message: "Código enviado" });
    } catch (err: any) {
      console.error("[auth] send-code error:", err.message);
      res.status(500).json({ message: err.message || "Error al enviar el código" });
    }
  });

  app.post("/api/auth/verify-code", async (req: Request, res: Response) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ message: "Correo y código requeridos" });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const [entry] = await db.select().from(otpCodes)
        .where(eq(otpCodes.email, normalizedEmail))
        .orderBy(sql`created_at DESC`)
        .limit(1);

      if (!entry) {
        return res.status(400).json({ message: "No hay código pendiente. Solicita uno nuevo." });
      }

      if (new Date() > new Date(entry.expiresAt)) {
        await db.delete(otpCodes).where(eq(otpCodes.email, normalizedEmail));
        return res.status(400).json({ message: "El código ha expirado. Solicita uno nuevo." });
      }

      const newAttempts = entry.attempts + 1;
      if (newAttempts > 5) {
        await db.delete(otpCodes).where(eq(otpCodes.email, normalizedEmail));
        return res.status(429).json({ message: "Demasiados intentos. Solicita un nuevo código." });
      }

      await db.update(otpCodes).set({ attempts: newAttempts }).where(eq(otpCodes.id, entry.id));

      if (entry.code !== code.toString().trim()) {
        return res.status(400).json({ message: "Código incorrecto" });
      }

      // OTP verified — delete it
      await db.delete(otpCodes).where(eq(otpCodes.email, normalizedEmail));

      let [existingUser] = await db.select().from(users).where(eq(users.email, normalizedEmail));

      let userId: string;
      let isNewUser = false;
      if (existingUser) {
        userId = existingUser.id;
        if (entry.fullName) {
          await db.update(profiles)
            .set({ fullName: entry.fullName })
            .where(eq(profiles.id, userId));
        }
      } else {
        isNewUser = true;
        userId = crypto.randomUUID();
        await ensureLocalUser(userId, normalizedEmail, entry.fullName || undefined);
      }

      if (entry.phone) {
        await db.update(profiles)
          .set({ phoneNumber: entry.phone })
          .where(eq(profiles.id, userId));
      }

      let membershipNumber: string | null = null;
      if (entry.joinCoop) {
        const [existingMembership] = await db.select().from(cooperativeMemberships).where(eq(cooperativeMemberships.userId, userId));
        if (!existingMembership) {
          const { generateMembershipCode } = await import("./seed-terms");
          membershipNumber = await generateMembershipCode();

          const acceptanceData = `${normalizedEmail}|${entry.fullName || ''}|${new Date().toISOString()}|accepted_statutes`;
          const acceptanceHash = crypto.createHash('sha256').update(acceptanceData).digest('hex');

          await db.insert(cooperativeMemberships).values({
            userId,
            fullName: entry.fullName || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            membershipNumber,
            membershipType: "consumo",
            status: "activo",
            acceptedStatutes: true,
            acceptanceHash,
          });

          await db.update(accounts)
            .set({ referralCode: membershipNumber })
            .where(eq(accounts.id, userId));
        } else {
          membershipNumber = existingMembership.membershipNumber;
        }
      }

      const token = signJwt(userId, normalizedEmail);

      const profile = await db.select().from(profiles).where(eq(profiles.id, userId));
      const account = await storage.getAccount(userId);

      res.json({
        token,
        user: {
          id: userId,
          email: normalizedEmail,
          fullName: profile[0]?.fullName || entry.fullName || null,
          role: account?.userRole || "socio_estudiante",
          membershipNumber,
        },
      });
    } catch (err: any) {
      console.error("[auth] verify-code error:", err.message);
      res.status(500).json({ message: "Error al verificar el código" });
    }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const token = authHeader.slice(7);
      const session = resolveToken(token);
      if (!session) {
        return res.status(401).json({ message: "Token inválido o expirado" });
      }

      const [user] = await db.select().from(users).where(eq(users.id, session.userId));
      if (!user) {
        return res.status(401).json({ message: "Usuario no encontrado" });
      }

      const profile = await db.select().from(profiles).where(eq(profiles.id, session.userId));
      const account = await storage.getAccount(session.userId);

      res.json({
        id: session.userId,
        email: user.email,
        fullName: profile[0]?.fullName || null,
        role: account?.userRole || "socio_estudiante",
      });
    } catch (err: any) {
      console.error("[auth] me error:", err.message);
      res.status(500).json({ message: "Error de autenticación" });
    }
  });
}

function resolveToken(token: string): { userId: string } | null {
  const adminSession = verifyAdminToken(token);
  if (adminSession) return adminSession;

  const jwtPayload = verifyJwt(token);
  if (jwtPayload) return { userId: jwtPayload.userId };

  return null;
}

export const optionalAuth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const session = resolveToken(token);
      if (session) {
        req.supabaseUserId = session.userId;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

export const requireAuth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const token = authHeader.slice(7);
    const session = resolveToken(token);
    if (!session) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    req.supabaseUserId = session.userId;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireAdmin: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const token = authHeader.slice(7);
    const session = resolveToken(token);
    if (!session) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    req.supabaseUserId = session.userId;

    const account = await storage.getAccount(session.userId);
    if (!account || (account.userRole !== "admin" && account.userRole !== "superadmin")) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    next();
  } catch (err) {
    next(err);
  }
};

export const requireSuperadmin: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const token = authHeader.slice(7);
    const session = resolveToken(token);
    if (!session) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    req.supabaseUserId = session.userId;

    const account = await storage.getAccount(session.userId);
    if (!account || account.userRole !== "superadmin") {
      return res.status(403).json({ message: "Acceso denegado — se requiere superadmin" });
    }

    next();
  } catch (err) {
    next(err);
  }
};

export const requireAdminOrPartner: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const token = authHeader.slice(7);
    const session = resolveToken(token);
    if (!session) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    req.supabaseUserId = session.userId;

    const account = await storage.getAccount(session.userId);
    if (!account || (account.userRole !== "admin" && account.userRole !== "superadmin" && account.userRole !== "socio_comercial" && account.userRole !== "partner" && account.userRole !== "director")) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    next();
  } catch (err) {
    next(err);
  }
};

export const requirePartner: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const token = authHeader.slice(7);
    const session = resolveToken(token);
    if (!session) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    req.supabaseUserId = session.userId;

    const account = await storage.getAccount(session.userId);
    if (!account || (account.userRole !== "socio_comercial" && account.userRole !== "partner" && account.userRole !== "director" && account.userRole !== "superadmin")) {
      return res.status(403).json({ message: "Acceso denegado — se requiere rol de socio comercial" });
    }

    next();
  } catch (err) {
    next(err);
  }
};

export const requireOrgAdmin = (teamIdParam: string = "id"): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.supabaseUserId) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const teamId = req.params[teamIdParam] as string;
      if (!teamId) {
        return res.status(400).json({ message: "ID de equipo requerido" });
      }

      const account = await storage.getAccount(req.supabaseUserId);
      if (account?.userRole === "superadmin") {
        return next();
      }

      const [membership] = await db.select()
        .from(teamUsers)
        .where(and(eq(teamUsers.teamId, teamId), eq(teamUsers.userId, req.supabaseUserId)));

      if (!membership || membership.role !== "admin") {
        return res.status(403).json({ message: "Acceso denegado — se requiere ser administrador del equipo" });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

const adminTokens = new Map<string, { userId: string; expiresAt: number }>();

function generateAdminToken(userId: string): string {
  const token = `sa_${crypto.randomBytes(32).toString("hex")}`;
  adminTokens.set(token, {
    userId,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000),
  });
  return token;
}

function verifyAdminToken(token: string): { userId: string } | null {
  if (!token.startsWith("sa_")) return null;
  const session = adminTokens.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    adminTokens.delete(token);
    return null;
  }
  return { userId: session.userId };
}

export const requireInstructor: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const token = authHeader.slice(7);
    const session = resolveToken(token);
    if (!session) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    req.supabaseUserId = session.userId;

    const account = await storage.getAccount(session.userId);
    if (!account || (!account.isInstructor && account.userRole !== "socio_instructor" && !["admin", "superadmin"].includes(account.userRole))) {
      return res.status(403).json({ message: "Acceso denegado — se requiere rol de instructor" });
    }

    next();
  } catch (err) {
    next(err);
  }
};

export async function adminLogin(email: string, password: string): Promise<{ token: string; userId: string } | null> {
  const bcrypt = await import("bcryptjs");
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) return null;

  // Support both bcrypt and legacy sha256 hashes (migrate on successful login)
  let passwordValid = false;
  if (user.password.startsWith("$2")) {
    passwordValid = await bcrypt.default.compare(password, user.password);
  } else {
    const sha256Hash = crypto.createHash("sha256").update(password).digest("hex");
    passwordValid = user.password === sha256Hash;
    if (passwordValid) {
      // Migrate legacy hash to bcrypt
      const bcryptHash = await bcrypt.default.hash(password, 10);
      await db.update(users).set({ password: bcryptHash }).where(eq(users.id, user.id));
    }
  }
  if (!passwordValid) return null;

  const account = await storage.getAccount(user.id);
  if (!account || account.userRole !== "superadmin") return null;

  const token = generateAdminToken(user.id);
  return { token, userId: user.id };
}

const TERMS_EXEMPT_PREFIXES = [
  "/api/terms",
  "/api/auth",
  "/api/user/accept-terms",
];

const TERMS_EXEMPT_EXACT = [
  "/api/auth/me",
  "/api/me/account",
];

export const checkPendingTerms: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.supabaseUserId) return next();

    const url = req.originalUrl.split("?")[0];

    if (!url.startsWith("/api/")) return next();

    if (TERMS_EXEMPT_EXACT.includes(url)) return next();
    if (TERMS_EXEMPT_PREFIXES.some(p => url.startsWith(p))) return next();

    const account = await storage.getAccount(req.supabaseUserId);
    const userRole = account?.userRole || "socio_estudiante";

    const activeVersions = await db.select().from(termsVersions)
      .where(and(eq(termsVersions.isActive, true), eq(termsVersions.isBlocking, true)));

    const applicableVersions = activeVersions.filter(v =>
      v.requiredForRoles && v.requiredForRoles.includes(userRole)
    );

    if (applicableVersions.length === 0) return next();

    const acceptances = await db.select().from(userTermsAcceptances)
      .where(eq(userTermsAcceptances.userId, req.supabaseUserId));

    const acceptedVersionIds = new Set(acceptances.map(a => a.termsVersionId));
    const pendingVersions = applicableVersions.filter(v => !acceptedVersionIds.has(v.id));

    if (pendingVersions.length === 0) return next();

    return res.status(403).json({
      code: "TERMS_PENDING",
      message: "Debes aceptar los documentos legales pendientes antes de continuar.",
      pendingCount: pendingVersions.length,
    });
  } catch (err) {
    next(err);
  }
};

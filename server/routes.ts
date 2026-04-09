import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { requireAuth, optionalAuth, requireAdmin, requireAdminOrPartner, requireSuperadmin, requirePartner, requireOrgAdmin, requireInstructor, checkPendingTerms } from "./auth";

import { registerFinancieroRoutes } from "./financiero-routes";
import storeRoutes from "./store-routes";
import { registerExternalApiRoutes } from "./external-api";
import { sendKitEmail, sendSamConfirmationEmail, sendSamReminderEmail, sendSamPartnerNotificationEmail, sendEmployeeInvitationEmail } from "./email";
import { db } from "./db";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  insertCourseSchema,
  insertAchievementSchema,
  insertTeamSchema,
  insertCourseUserSchema,
  insertAchievementUserSchema,
  insertTeamUserSchema,
  insertLeadSchema,
  insertOrgObjectiveSchema,
  insertReferralCodeSchema,
  insertStudentProfileSchema,
  users,
  accounts,
  profiles,
  teams,
  teamUsers,
  courseUsers,
  orgObjectives,
  userObjectives,
  referralCodes,
  courses,
  certificateRequests,
  achievements,
  achievementUsers,
  learningInterests,
  academyCoursesCache,
  studioCourses,
  companyPayments,
  companyWallets,
  walletTransactions,
  dispersions,
  partnerCommissions,
  prospects,
  monthlyContributions,
  contributionAuditLog,
  invoices,
  empresasProspectos,
  contactosProspectos,
  interaccionesProspectos,
  enriquecimiento,
  contactGroups,
  savedFilters,
  instructorProfiles,
  instructorCourses,
  instructorApplications,
  courseModules,
  blogPosts,
  newsletterSubscribers,
  insurancePlans,
  insuranceEnrollments,
  insertInsuranceEnrollmentSchema,
  cooperativeMemberships,
  termsVersions,
  userTermsAcceptances,
  apiKeys,
  apiRequestLogs,
  instructorAvatars,
  heygenVideoJobs,
  heygenUsageTracking,
  liveAvatarSessions,
  liveAvatarMessages,
  instructorAvailability,
  instructorSessionConfig,
  privateSessions,
  sessionParticipants,
  instructorReviews,
  type EmpresaProspecto,
  userContactCards,
  roleDefinitions,
  roleChangeLog,
  globalConfig,
  employeeInvitations,
  samRequests,
} from "@shared/schema";
import { eq, and, or, sql, count, desc, asc, gte, lte, inArray, ilike, type SQL } from "drizzle-orm";
import * as facturapi from "./services/facturapi";
import { heygenService } from "./services/heygen";
import { r2Storage } from "./services/r2-storage";
import { liveAvatarService } from "./services/liveavatar";
import { tutorAIService } from "./services/tutor-ai";
import { dailyService } from "./services/daily";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import crypto from "crypto"
import bcrypt from "bcryptjs";
import { getAdminApiKey, getBankInfo } from "./env";
import rateLimit from "express-rate-limit";

// Rate limiter for resource-intensive admin endpoints (5 requests per 15 minutes)
const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas solicitudes. Intenta de nuevo en 15 minutos." },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {

  registerExternalApiRoutes(app);

  app.get("/propuestas/pyrotech", (_req, res) => {
    const proposalFile = "propuestas/pyrotech/index.html";
    const prodPath = path.resolve(process.cwd(), "dist/public", proposalFile);
    const devPath = path.resolve(process.cwd(), "client/public", proposalFile);
    const filePath = fs.existsSync(prodPath) ? prodPath : devPath;
    res.sendFile(filePath, (err) => {
      if (err) res.status(404).send("Página no encontrada");
    });
  });

  app.use(optionalAuth, checkPendingTerms);

  app.get("/api/auth/me", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) { next(err); }
  });

  app.get("/api/role-definitions", requireAuth, async (_req, res, next) => {
    try {
      const defs = await db.select().from(roleDefinitions);
      res.json(defs);
    } catch (err) { next(err); }
  });

  app.get("/api/role-definition/:roleKey", requireAuth, async (req, res, next) => {
    try {
      const [def] = await db.select().from(roleDefinitions).where(eq(roleDefinitions.roleKey, req.params.roleKey));
      if (!def) return res.status(404).json({ message: "Rol no encontrado" });
      res.json(def);
    } catch (err) { next(err); }
  });

  app.get("/api/admin/role-change-log", requireAuth, requireSuperadmin, async (req, res, next) => {
    try {
      const { rows: logs } = await db.execute(sql`
        SELECT rcl.*, u.email as user_email, cb.email as changed_by_email
        FROM role_change_log rcl
        LEFT JOIN users u ON rcl.user_id = u.id
        LEFT JOIN users cb ON rcl.changed_by = cb.id
        ORDER BY rcl.created_at DESC
        LIMIT 200
      `);
      const formatted = (logs as any[]).map(l => ({
        id: l.id,
        userId: l.user_id,
        userEmail: l.user_email,
        changedBy: l.changed_by,
        changedByEmail: l.changed_by_email,
        previousRole: l.previous_role,
        newRole: l.new_role,
        reason: l.reason,
        ipAddress: l.ip_address,
        createdAt: l.created_at,
      }));
      res.json(formatted);
    } catch (err) { next(err); }
  });

  app.get("/api/admin/config", requireAuth, requireSuperadmin, async (_req, res, next) => {
    try {
      const configs = await db.select().from(globalConfig).orderBy(globalConfig.category, globalConfig.key);
      res.json(configs);
    } catch (err) { next(err); }
  });

  app.patch("/api/admin/config/:key", requireAuth, requireSuperadmin, async (req, res, next) => {
    try {
      const configKey = req.params.key;
      const { value } = req.body;
      if (value === undefined) return res.status(400).json({ message: "Valor requerido" });

      const [existing] = await db.select().from(globalConfig).where(eq(globalConfig.key, configKey));
      if (!existing) return res.status(404).json({ message: "Configuración no encontrada" });

      let coerced = value;
      if (existing.valueType === "boolean") {
        if (typeof value !== "boolean") return res.status(400).json({ message: "Se esperaba un valor booleano" });
        coerced = value;
      } else if (existing.valueType === "number") {
        const num = Number(value);
        if (isNaN(num)) return res.status(400).json({ message: "Se esperaba un valor numérico" });
        coerced = num;
      } else if (existing.valueType === "string") {
        if (typeof value !== "string") return res.status(400).json({ message: "Se esperaba un valor de texto" });
        coerced = value;
      }

      const [updated] = await db.update(globalConfig)
        .set({ value: coerced, updatedBy: req.supabaseUserId!, updatedAt: new Date() })
        .where(eq(globalConfig.key, configKey))
        .returning();

      res.json(updated);
    } catch (err) { next(err); }
  });

  app.get("/api/terms/pending", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const account = await storage.getAccount(userId);
      const userRole = account?.userRole || "socio_estudiante";

      const activeVersions = await db.select().from(termsVersions)
        .where(eq(termsVersions.isActive, true));

      const applicableVersions = activeVersions.filter(v =>
        v.requiredForRoles && v.requiredForRoles.includes(userRole)
      );

      const acceptances = await db.select().from(userTermsAcceptances)
        .where(eq(userTermsAcceptances.userId, userId));

      const acceptedVersionIds = new Set(acceptances.map(a => a.termsVersionId));
      const pending = applicableVersions.filter(v => !acceptedVersionIds.has(v.id));

      res.json({ pending, total: applicableVersions.length, accepted: acceptedVersionIds.size });
    } catch (err) { next(err); }
  });

  app.post("/api/user/accept-terms", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { versionIds } = req.body;

      if (!Array.isArray(versionIds) || versionIds.length === 0) {
        return res.status(400).json({ message: "Se requiere al menos un versionId" });
      }

      const acceptSchema = z.object({ versionIds: z.array(z.string().uuid()).min(1).max(10) });
      const parsed = acceptSchema.safeParse({ versionIds });
      if (!parsed.success) {
        return res.status(400).json({ message: "Formato inválido de versionIds" });
      }

      const account = await storage.getAccount(userId);
      const userRole = account?.userRole || "socio_estudiante";

      const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "";
      const userAgent = req.headers["user-agent"] || "";
      const [userRow] = await db.select().from(users).where(eq(users.id, userId));
      const profile = await storage.getProfile(userId);

      let acceptedCount = 0;
      let membershipNumber: string | null = null;

      for (const versionId of parsed.data.versionIds) {
        const [version] = await db.select().from(termsVersions)
          .where(and(eq(termsVersions.id, versionId), eq(termsVersions.isActive, true)));
        if (!version) continue;

        if (!version.requiredForRoles || !version.requiredForRoles.includes(userRole)) continue;

        const now = new Date();
        const acceptanceData = `${userId}|${versionId}|${now.toISOString()}|${ip}|${userAgent}`;
        const acceptanceHash = crypto.createHash("sha256").update(acceptanceData).digest("hex");

        const [acceptance] = await db.insert(userTermsAcceptances).values({
          userId,
          termsVersionId: versionId,
          acceptedAt: now,
          acceptanceIp: ip,
          acceptanceUserAgent: userAgent,
          acceptanceHash,
        }).onConflictDoNothing().returning();

        if (acceptance) acceptedCount++;

        if (version.docType === "adhesion_cooperativa") {
          const [existingMembership] = await db.select().from(cooperativeMemberships)
            .where(eq(cooperativeMemberships.userId, userId));

          if (!existingMembership) {
            const { generateMembershipCode } = await import("./seed-terms");
            membershipNumber = await generateMembershipCode();

            const memberName = profile?.fullName || userRow?.email?.split("@")[0] || "Usuario";
            const memberEmail = userRow?.email || "";

            await db.insert(cooperativeMemberships).values({
              userId,
              fullName: memberName,
              email: memberEmail,
              membershipNumber,
              membershipType: "consumo",
              status: "activo",
              acceptedStatutes: true,
              acceptanceIp: ip,
              acceptanceUserAgent: userAgent,
              acceptanceHash,
            }).onConflictDoNothing();

            await db.update(accounts)
              .set({ referralCode: membershipNumber })
              .where(eq(accounts.id, userId));

            createOrUpdateContactCard(userId, { title: "Socio Cooperativo" }).catch(() => {});
          } else {
            membershipNumber = existingMembership.membershipNumber;
          }
        }
      }

      res.json({ accepted: acceptedCount, membershipNumber });
    } catch (err) { next(err); }
  });

  app.get("/api/terms/history", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const acceptances = await db.select({
        id: userTermsAcceptances.id,
        termsVersionId: userTermsAcceptances.termsVersionId,
        acceptedAt: userTermsAcceptances.acceptedAt,
        acceptanceIp: userTermsAcceptances.acceptanceIp,
        acceptanceHash: userTermsAcceptances.acceptanceHash,
        docType: termsVersions.docType,
        version: termsVersions.version,
        title: termsVersions.title,
      })
        .from(userTermsAcceptances)
        .innerJoin(termsVersions, eq(userTermsAcceptances.termsVersionId, termsVersions.id))
        .where(eq(userTermsAcceptances.userId, userId))
        .orderBy(desc(userTermsAcceptances.acceptedAt));

      res.json(acceptances);
    } catch (err) { next(err); }
  });

  app.get("/api/admin/terms", requireAdmin, async (_req, res, next) => {
    try {
      const versions = await db.select().from(termsVersions).orderBy(desc(termsVersions.publishedAt));

      const allAccounts = await db.select({ id: accounts.id, userRole: accounts.userRole }).from(accounts);

      const stats = await Promise.all(versions.map(async (v) => {
        const [acceptedCount] = await db.select({ count: count() }).from(userTermsAcceptances)
          .where(eq(userTermsAcceptances.termsVersionId, v.id));

        const applicableUsers = allAccounts.filter(a =>
          v.requiredForRoles && v.requiredForRoles.includes(a.userRole || "socio_estudiante")
        );
        const totalUsers = applicableUsers.length;

        return {
          ...v,
          acceptedCount: acceptedCount?.count || 0,
          pendingCount: Math.max(0, totalUsers - (acceptedCount?.count || 0)),
          totalUsers,
        };
      }));

      res.json(stats);
    } catch (err) { next(err); }
  });

  app.post("/api/admin/terms/versions", requireAdmin, async (req, res, next) => {
    try {
      const { docType, version, title, summary, contentUrl, isBlocking, requiredForRoles } = req.body;

      if (!docType || !version || !title) {
        return res.status(400).json({ message: "Tipo, versión y título son requeridos" });
      }

      await db.update(termsVersions)
        .set({ isActive: false })
        .where(eq(termsVersions.docType, docType));

      const [newVersion] = await db.insert(termsVersions).values({
        docType,
        version,
        title,
        summary: summary || null,
        contentUrl: contentUrl || null,
        isBlocking: isBlocking !== false,
        isActive: true,
        requiredForRoles: requiredForRoles || ["socio_estudiante", "socio_instructor", "socio_comercial", "director", "empresa", "empresa_rh", "admin", "superadmin"],
        publishedBy: req.supabaseUserId,
      }).returning();

      res.status(201).json(newVersion);
    } catch (err) { next(err); }
  });

  app.get("/api/admin/terms/acceptances", requireAdmin, async (req, res, next) => {
    try {
      const versionId = req.query.versionId as string | undefined;

      const baseQuery = db.select({
        id: userTermsAcceptances.id,
        userId: userTermsAcceptances.userId,
        termsVersionId: userTermsAcceptances.termsVersionId,
        acceptedAt: userTermsAcceptances.acceptedAt,
        acceptanceIp: userTermsAcceptances.acceptanceIp,
        acceptanceHash: userTermsAcceptances.acceptanceHash,
        docType: termsVersions.docType,
        version: termsVersions.version,
        title: termsVersions.title,
      })
        .from(userTermsAcceptances)
        .innerJoin(termsVersions, eq(userTermsAcceptances.termsVersionId, termsVersions.id));

      const conditions = versionId ? eq(userTermsAcceptances.termsVersionId, versionId) : undefined;
      const acceptances = conditions
        ? await baseQuery.where(conditions).orderBy(desc(userTermsAcceptances.acceptedAt)).limit(100)
        : await baseQuery.orderBy(desc(userTermsAcceptances.acceptedAt)).limit(100);

      res.json(acceptances);
    } catch (err) { next(err); }
  });

  app.get("/api/courses", async (_req, res, next) => {
    try {
      const courses = await storage.listCourses();
      res.json(courses);
    } catch (err) { next(err); }
  });

  app.get("/api/courses/:id", async (req, res, next) => {
    try {
      const id = String(req.params.id);
      const course = await storage.getCourse(id);
      if (!course) return res.status(404).json({ message: "Curso no encontrado" });
      res.json(course);
    } catch (err) { next(err); }
  });

  app.post("/api/courses", requireAdmin, async (req, res, next) => {
    try {
      const parsed = insertCourseSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
      const course = await storage.createCourse(parsed.data);
      res.status(201).json(course);
    } catch (err) { next(err); }
  });

  app.patch("/api/courses/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = String(req.params.id);
      const course = await storage.updateCourse(id, req.body);
      if (!course) return res.status(404).json({ message: "Curso no encontrado" });
      res.json(course);
    } catch (err) { next(err); }
  });

  app.delete("/api/courses/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = String(req.params.id);
      const deleted = await storage.deleteCourse(id);
      if (!deleted) return res.status(404).json({ message: "Curso no encontrado" });
      res.json({ message: "Curso eliminado" });
    } catch (err) { next(err); }
  });

  app.get("/api/achievements", async (_req, res, next) => {
    try {
      const achievements = await storage.listAchievements();
      res.json(achievements);
    } catch (err) { next(err); }
  });

  app.post("/api/achievements", requireAdmin, async (req, res, next) => {
    try {
      const parsed = insertAchievementSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
      const achievement = await storage.createAchievement(parsed.data);
      res.status(201).json(achievement);
    } catch (err) { next(err); }
  });

  app.get("/api/teams", requireAuth, async (_req, res, next) => {
    try {
      const teams = await storage.listTeams();
      res.json(teams);
    } catch (err) { next(err); }
  });

  app.post("/api/teams", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertTeamSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
      const team = await storage.createTeam(parsed.data);
      res.status(201).json(team);
    } catch (err) { next(err); }
  });

  app.get("/api/teams/:id/members", requireAuth, async (req, res, next) => {
    try {
      const teamId = String(req.params.id);
      const members = await storage.getTeamMembers(teamId);
      const isMember = members.some(m => m.userId === req.supabaseUserId!);
      if (!isMember) {
        return res.status(403).json({ message: "No tienes permisos en este equipo" });
      }
      res.json(members);
    } catch (err) { next(err); }
  });

  app.post("/api/teams/:id/members", requireAuth, async (req, res, next) => {
    try {
      const teamId = String(req.params.id);
      const currentMembers = await storage.getTeamMembers(teamId);
      const isTeamMember = currentMembers.some(m => m.userId === req.supabaseUserId!);
      if (!isTeamMember) {
        return res.status(403).json({ message: "No tienes permisos en este equipo" });
      }
      const data = { ...req.body, teamId };
      const parsed = insertTeamUserSchema.safeParse(data);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
      const member = await storage.addTeamMember(parsed.data);
      res.status(201).json(member);
    } catch (err) { next(err); }
  });

  app.delete("/api/teams/:id/members/:userId", requireAuth, async (req, res, next) => {
    try {
      const teamId = String(req.params.id);
      const targetUserId = String(req.params.userId);
      const currentMembers = await storage.getTeamMembers(teamId);
      const callerMembership = currentMembers.find(m => m.userId === req.supabaseUserId!);
      if (!callerMembership) {
        return res.status(403).json({ message: "No tienes permisos en este equipo" });
      }
      const removed = await storage.removeTeamMember(teamId, targetUserId);
      if (!removed) return res.status(404).json({ message: "Miembro no encontrado" });
      res.json({ message: "Miembro eliminado" });
    } catch (err) { next(err); }
  });

  app.get("/api/me/courses", requireAuth, async (req, res, next) => {
    try {
      const courses = await storage.getUserCourses(req.supabaseUserId!);
      res.json(courses);
    } catch (err) { next(err); }
  });

  app.post("/api/me/courses", requireAuth, async (req, res, next) => {
    try {
      const data = { ...req.body, userId: req.supabaseUserId! };
      const parsed = insertCourseUserSchema.safeParse(data);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
      const enrollment = await storage.enrollCourse(parsed.data);
      res.status(201).json(enrollment);
    } catch (err) { next(err); }
  });

  app.patch("/api/me/courses/:courseId", requireAuth, async (req, res, next) => {
    try {
      const courseId = String(req.params.courseId);
      const { completed } = req.body;
      if (typeof completed !== "number" || completed < 0 || completed > 100) {
        return res.status(400).json({ message: "El progreso debe ser un número entre 0 y 100" });
      }
      if (completed > 0) {
        const modules = await storage.getCourseModules(courseId);
        const hasAudio = modules.some(m => !!m.audioUrl);
        if (hasAudio) {
          const userCourses = await storage.getUserCourses(req.supabaseUserId!);
          const enrollment = userCourses.find(uc => uc.courseId === courseId);
          if (enrollment && (enrollment.listeningProgress || 0) < 95) {
            return res.status(403).json({ message: "Debes escuchar al menos el 95% del audio antes de marcar secciones como completadas" });
          }
        }
      }
      const record = await storage.updateCourseProgress(req.supabaseUserId!, courseId, completed);
      if (!record) return res.status(404).json({ message: "Inscripción no encontrada" });

      if (completed === 100) {
        try {
          const userId = req.supabaseUserId!;
          const [courseRow] = await db.select().from(courses).where(eq(courses.id, courseId));
          if (courseRow?.slug) {
            const achievementSlug = `logro-${courseRow.slug}`;
            const [achievement] = await db.select().from(achievements).where(eq(achievements.slug, achievementSlug));
            if (achievement) {
              const [existing] = await db.select().from(achievementUsers)
                .where(and(eq(achievementUsers.userId, userId), eq(achievementUsers.achievementId, achievement.id), eq(achievementUsers.certType, "diploma")));
              if (!existing) {
                await db.insert(achievementUsers).values({ userId, achievementId: achievement.id, status: "active", certType: "diploma", isActive: true });
              }
            }
            const [primerCurso] = await db.select().from(achievements).where(eq(achievements.slug, "primer-curso"));
            if (primerCurso) {
              const [ep] = await db.select().from(achievementUsers).where(and(eq(achievementUsers.userId, userId), eq(achievementUsers.achievementId, primerCurso.id)));
              if (!ep) await db.insert(achievementUsers).values({ userId, achievementId: primerCurso.id, status: "active", certType: "diploma", isActive: true });
            }
          }
        } catch (err) {
          console.error("[course-progress] Error granting achievements:", err);
        }
      }

      res.json(record);
    } catch (err) { next(err); }
  });

  const listeningRateLimit = new Map<string, number>();
  app.patch("/api/me/courses/:courseId/listening", requireAuth, async (req, res, next) => {
    try {
      const courseId = String(req.params.courseId);
      const userId = req.supabaseUserId!;
      const { listeningProgress } = req.body;
      if (typeof listeningProgress !== "number" || listeningProgress < 0 || listeningProgress > 100) {
        return res.status(400).json({ message: "El progreso de escucha debe ser un número entre 0 y 100" });
      }
      const rateKey = `${userId}:${courseId}`;
      const now = Date.now();
      const lastUpdate = listeningRateLimit.get(rateKey) || 0;
      if (now - lastUpdate < 3000) {
        return res.status(429).json({ message: "Demasiadas actualizaciones. Espera unos segundos." });
      }
      listeningRateLimit.set(rateKey, now);
      const userCourses = await storage.getUserCourses(userId);
      const enrollment = userCourses.find(uc => uc.courseId === courseId);
      if (!enrollment) return res.status(404).json({ message: "Inscripción no encontrada" });
      const currentPct = enrollment.listeningProgress || 0;
      const maxIncrement = 5;
      const newPct = Math.min(100, Math.max(currentPct, Math.min(listeningProgress, currentPct + maxIncrement)));
      if (newPct <= currentPct) {
        if (currentPct >= 95 && (enrollment.completed || 0) < 100) {
          try {
            await storage.updateCourseProgress(userId, courseId, 100);
            const [courseRow] = await db.select().from(courses).where(eq(courses.id, courseId));
            if (courseRow?.slug) {
              const achievementSlug = `logro-${courseRow.slug}`;
              const [achievement] = await db.select().from(achievements).where(eq(achievements.slug, achievementSlug));
              if (achievement) {
                const [existing] = await db.select().from(achievementUsers)
                  .where(and(eq(achievementUsers.userId, userId), eq(achievementUsers.achievementId, achievement.id), eq(achievementUsers.certType, "diploma")));
                if (!existing) {
                  await db.insert(achievementUsers).values({ userId, achievementId: achievement.id, status: "active", certType: "diploma", isActive: true });
                }
              }
              const [primerCurso] = await db.select().from(achievements).where(eq(achievements.slug, "primer-curso"));
              if (primerCurso) {
                const [ep] = await db.select().from(achievementUsers).where(and(eq(achievementUsers.userId, userId), eq(achievementUsers.achievementId, primerCurso.id)));
                if (!ep) await db.insert(achievementUsers).values({ userId, achievementId: primerCurso.id, status: "active", certType: "diploma", isActive: true });
              }
            }
            return res.json({ ...enrollment, completed: 100, autoCompleted: true });
          } catch (err) {
            console.error("[listening] Error retroactive auto-complete:", err);
          }
        }
        return res.json(enrollment);
      }
      const record = await storage.updateListeningProgress(userId, courseId, newPct);
      if (!record) return res.status(404).json({ message: "Inscripción no encontrada" });

      const currentCompleted = enrollment.completed || 0;
      const crossedThreshold = newPct >= 95 && currentCompleted < 100;
      if (crossedThreshold) {
        try {
          await storage.updateCourseProgress(userId, courseId, 100);

          const [courseRow] = await db.select().from(courses).where(eq(courses.id, courseId));
          if (courseRow?.slug) {
            const achievementSlug = `logro-${courseRow.slug}`;
            const [achievement] = await db.select().from(achievements).where(eq(achievements.slug, achievementSlug));
            if (achievement) {
              const [existing] = await db.select().from(achievementUsers)
                .where(and(
                  eq(achievementUsers.userId, userId),
                  eq(achievementUsers.achievementId, achievement.id),
                  eq(achievementUsers.certType, "diploma")
                ));
              if (!existing) {
                await db.insert(achievementUsers).values({
                  userId,
                  achievementId: achievement.id,
                  status: "active",
                  certType: "diploma",
                  isActive: true,
                });
              }
            }

            const [primerCurso] = await db.select().from(achievements).where(eq(achievements.slug, "primer-curso"));
            if (primerCurso) {
              const [existingPrimer] = await db.select().from(achievementUsers)
                .where(and(eq(achievementUsers.userId, userId), eq(achievementUsers.achievementId, primerCurso.id)));
              if (!existingPrimer) {
                await db.insert(achievementUsers).values({
                  userId,
                  achievementId: primerCurso.id,
                  status: "active",
                  certType: "diploma",
                  isActive: true,
                });
              }
            }
          }
        } catch (err) {
          console.error("[listening] Error auto-completing course:", err);
        }
      }

      res.json({ ...record, autoCompleted: crossedThreshold });
    } catch (err) { next(err); }
  });

  app.delete("/api/me/courses/:courseId", requireAuth, async (req, res, next) => {
    try {
      const courseId = String(req.params.courseId);
      const removed = await storage.unenrollCourse(req.supabaseUserId!, courseId);
      if (!removed) return res.status(404).json({ message: "Inscripción no encontrada" });
      res.json({ message: "Desinscrito del curso" });
    } catch (err) { next(err); }
  });

  app.get("/api/me/achievements", requireAuth, async (req, res, next) => {
    try {
      const achievements = await storage.getUserAchievements(req.supabaseUserId!);
      res.json(achievements);
    } catch (err) { next(err); }
  });

  app.get("/api/me/profile", requireAuth, async (req, res, next) => {
    try {
      const profile = await storage.getProfile(req.supabaseUserId!);
      if (!profile) return res.status(404).json({ message: "Perfil no encontrado" });
      res.json(profile);
    } catch (err) { next(err); }
  });

  app.patch("/api/me/profile", requireAuth, async (req, res, next) => {
    try {
      const allowedFields = ["fullName", "country", "city", "phoneNumber", "walletAddress", "interest", "genre"];
      const updates: Record<string, any> = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }
      const profile = await storage.updateProfile(req.supabaseUserId!, updates);
      if (!profile) return res.status(404).json({ message: "Perfil no encontrado" });
      const existingCard = await storage.getContactCardByUserId(req.supabaseUserId!);
      if (existingCard) {
        const cardUpdates: Record<string, any> = {};
        if (updates.phoneNumber !== undefined) cardUpdates.phone = updates.phoneNumber;
        if (updates.fullName !== undefined) {
          cardUpdates.displayName = updates.fullName;
          cardUpdates.avatarInitials = getInitialsFromName(updates.fullName);
        }
        if (Object.keys(cardUpdates).length > 0) {
          storage.updateContactCard(existingCard.id, cardUpdates).catch(() => {});
        }
      }
      res.json(profile);
    } catch (err) { next(err); }
  });

  app.get("/api/me/account", requireAuth, async (req, res, next) => {
    try {
      const account = await storage.getAccount(req.supabaseUserId!);
      if (!account) return res.status(404).json({ message: "Cuenta no encontrada" });
      res.json(account);
    } catch (err) { next(err); }
  });

  app.post("/api/leads", async (req, res, next) => {
    try {
      const parsed = insertLeadSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
      const lead = await storage.createLead(parsed.data);

      sendKitEmail(lead.email, lead.fullName).catch((err) => {
        console.error("[leads] Failed to send kit email:", err.message);
      });

      res.status(201).json(lead);
    } catch (err) { next(err); }
  });

  app.get("/api/me/teams", requireAuth, async (req, res, next) => {
    try {
      const userTeams = await storage.getUserTeams(req.supabaseUserId!);
      res.json(userTeams);
    } catch (err) { next(err); }
  });

  app.post("/api/me/team", requireAuth, async (req, res, next) => {
    try {
      const { name, description, industry, collaborators, rfc, razonSocial, regimenFiscal, codigoPostalFiscal } = req.body;
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ message: "El nombre de la organización es requerido" });
      }
      const teamId = `org-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const teamDesc = [
        description || "",
        industry ? `Industria: ${industry}` : "",
        collaborators ? `Colaboradores: ${collaborators}` : "",
      ].filter(Boolean).join(" | ");
      const teamData: Record<string, any> = {
        id: teamId,
        name: name.trim(),
        description: teamDesc || null,
      };
      if (rfc && typeof rfc === "string" && rfc.trim().length >= 12) teamData.rfc = rfc.trim().toUpperCase();
      if (razonSocial && typeof razonSocial === "string") teamData.razonSocial = razonSocial.trim();
      if (regimenFiscal && typeof regimenFiscal === "string") teamData.regimenFiscal = regimenFiscal.trim();
      if (codigoPostalFiscal && typeof codigoPostalFiscal === "string" && codigoPostalFiscal.trim().length === 5) teamData.codigoPostalFiscal = codigoPostalFiscal.trim();
      const team = await storage.createTeam(teamData);
      await storage.addTeamMember({
        teamId: team.id,
        userId: req.supabaseUserId!,
        role: "admin",
      });
      res.status(201).json(team);
    } catch (err) { next(err); }
  });

  app.patch("/api/me/account", requireAuth, async (req, res, next) => {
    try {
      const updates: Record<string, any> = {};
      if (req.body.accountSetup !== undefined) {
        updates.accountSetup = req.body.accountSetup;
      }
      if (req.body.referredBy && typeof req.body.referredBy === "string") {
        const existingAccount = await db.select().from(accounts).where(eq(accounts.id, req.supabaseUserId!));
        const alreadyReferred = existingAccount.length > 0 && existingAccount[0].referredBy;
        if (!alreadyReferred) {
          const [ref] = await db.select().from(referralCodes).where(
            and(eq(referralCodes.code, req.body.referredBy), eq(referralCodes.isActive, true))
          );
          if (ref) {
            updates.referredBy = req.body.referredBy;
            await db.update(referralCodes)
              .set({ usageCount: ref.usageCount + 1 })
              .where(eq(referralCodes.id, ref.id));
          }
        }
      }
      const account = await storage.updateAccount(req.supabaseUserId!, updates);
      if (!account) return res.status(404).json({ message: "Cuenta no encontrada" });
      res.json(account);
    } catch (err) { next(err); }
  });

  app.get("/api/courses/:id/modules", optionalAuth, async (req, res, next) => {
    try {
      const courseId = String(req.params.id);
      const modules = await storage.getCourseModules(courseId);
      modules.sort((a, b) => a.order - b.order);
      if (!req.supabaseUserId) {
        const gated = modules.map((m, i) => {
          if (i === 0) return m;
          return { ...m, contentHtml: null, videoUrl: null, audioUrl: null };
        });
        return res.json(gated);
      }
      res.json(modules);
    } catch (err) { next(err); }
  });

  app.get("/api/courses/:courseId/modules/:moduleId", optionalAuth, async (req, res, next) => {
    try {
      const courseId = String(req.params.courseId);
      const mod = await storage.getCourseModule(String(req.params.moduleId));
      if (!mod || mod.courseId !== courseId) return res.status(404).json({ message: "Módulo no encontrado" });
      if (!req.supabaseUserId) {
        const allModules = await storage.getCourseModules(courseId);
        allModules.sort((a, b) => a.order - b.order);
        const modIndex = allModules.findIndex(m => m.id === mod.id);
        if (modIndex > 0) {
          return res.status(401).json({ message: "Crea una cuenta para acceder a este módulo" });
        }
      }
      res.json(mod);
    } catch (err) { next(err); }
  });

  app.get("/api/courses/:id/quiz", optionalAuth, async (req, res, next) => {
    try {
      const courseId = String(req.params.id);
      const quiz = await storage.getQuizByCourse(courseId);
      if (!quiz) return res.status(404).json({ message: "Este curso aún no tiene evaluación" });
      if (!req.supabaseUserId) {
        return res.json({ quiz: { id: quiz.id, title: quiz.title, description: (quiz as any).description || null, passingScore: quiz.passingScore, timeLimit: (quiz as any).timeLimit || null }, questions: [] });
      }
      const questions = await storage.getQuizQuestions(quiz.id);
      questions.sort((a, b) => a.order - b.order);
      const safeQuestions = questions.map(q => ({
        id: q.id,
        order: q.order,
        question: q.question,
        options: q.options,
      }));
      res.json({ quiz, questions: safeQuestions });
    } catch (err) { next(err); }
  });

  app.post("/api/courses/:id/quiz/submit", requireAuth, async (req, res, next) => {
    try {
      const courseId = String(req.params.id);
      const userId = req.supabaseUserId!;
      const { answers } = req.body;
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: "Se requieren las respuestas" });
      }

      const quiz = await storage.getQuizByCourse(courseId);
      if (!quiz) return res.status(404).json({ message: "Evaluación no encontrada" });

      const questions = await storage.getQuizQuestions(quiz.id);
      questions.sort((a, b) => a.order - b.order);

      let correct = 0;
      const results = questions.map((q, i) => {
        const userAnswer = answers[i] ?? -1;
        const isCorrect = userAnswer === q.correctIndex;
        if (isCorrect) correct++;
        return {
          questionId: q.id,
          question: q.question,
          options: q.options,
          userAnswer,
          correctIndex: q.correctIndex,
          isCorrect,
          explanation: q.explanation,
        };
      });

      const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
      const passed = score >= quiz.passingScore;

      const attempt = await storage.createQuizAttempt({
        userId,
        quizId: quiz.id,
        score,
        passed,
        answers: results,
      });

      if (passed) {
        const course = await storage.getCourse(courseId);
        if (course) {
          const achievementSlug = `logro-${course.slug}`;
          let achievement = await storage.getAchievementBySlug(achievementSlug);
          if (!achievement) {
            achievement = await storage.createAchievement({
              slug: achievementSlug,
              name: `Diploma: ${course.title}`,
              shortDescription: `Aprobó la evaluación del curso "${course.title}"`,
              description: `Diploma Digital de Participación obtenido al aprobar con éxito la evaluación del curso ${course.title}. Verificable en blockchain.`,
              category: course.areaTematica || "STPS",
              value: 1000,
              icon: "award",
            });
          }
          const existing = await storage.getUserAchievements(userId);
          const alreadyHas = existing.some(a => a.achievementId === achievement!.id);
          if (!alreadyHas) {
            const profile = await storage.getProfile(userId);
            await storage.awardAchievement({
              userId,
              achievementId: achievement.id,
              isActive: true,
              status: "active",
              contractAddress: profile?.walletAddress || null,
              tokenId: null,
            });
          }
        }
      }

      res.json({ score, passed, passingScore: quiz.passingScore, results, attemptId: attempt.id });
    } catch (err) { next(err); }
  });

  app.get("/api/me/quiz-attempts", requireAuth, async (req, res, next) => {
    try {
      const attempts = await storage.getAllUserQuizAttempts(req.supabaseUserId!);
      res.json(attempts);
    } catch (err) { next(err); }
  });

  // ==================== CERTIFICATE REQUESTS (STUDENT) ====================

  app.post("/api/me/certificates", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { courseId, certType } = req.body;
      if (!courseId || !certType) {
        return res.status(400).json({ message: "courseId y certType son requeridos" });
      }
      if (!["dc3", "sep"].includes(certType)) {
        return res.status(400).json({ message: "certType debe ser dc3 o sep" });
      }
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Curso no encontrado" });
      }
      if (certType === "dc3" && !course.dc3Disponible) {
        return res.status(400).json({ message: "Este curso no ofrece constancia DC-3" });
      }
      const quiz = await storage.getQuizByCourse(courseId);
      if (quiz) {
        const attempts = await storage.getQuizAttempts(userId, quiz.id);
        const passed = attempts.some((a: any) => a.score >= (quiz.passingScore || 70));
        if (!passed) {
          return res.status(400).json({ message: "Debes aprobar la evaluación antes de solicitar un certificado" });
        }
      }
      const existing = await storage.getCertificateRequestsByUser(userId);
      const duplicate = existing.find(r => r.courseId === courseId && r.certType === certType);
      if (duplicate) {
        if (duplicate.status === "rechazado") {
          const updated = await storage.updateCertificateRequest(duplicate.id, { status: "solicitado", rejectReason: null });
          return res.status(200).json(updated);
        }
        return res.status(409).json({ message: "Ya tienes una solicitud para este certificado", request: duplicate });
      }
      const request = await storage.createCertificateRequest({
        userId,
        courseId,
        certType,
        status: "solicitado",
      });
      res.status(201).json(request);
    } catch (err) { next(err); }
  });

  app.get("/api/me/certificates", requireAuth, async (req, res, next) => {
    try {
      const requests = await storage.getCertificateRequestsByUser(req.supabaseUserId!);
      res.json(requests);
    } catch (err) { next(err); }
  });

  app.get("/api/academy/courses/:id/quiz", async (req, res, next) => {
    try {
      const academyCourseId = parseInt(String(req.params.id));
      if (isNaN(academyCourseId)) return res.status(400).json({ message: "ID inválido" });

      let quiz = await storage.getQuizByAcademyCourse(academyCourseId);
      if (quiz) {
        const questions = await storage.getQuizQuestions(quiz.id);
        questions.sort((a, b) => a.order - b.order);
        const safeQuestions = questions.map(q => ({
          id: q.id, order: q.order, question: q.question, options: q.options,
        }));
        return res.json({ quiz, questions: safeQuestions });
      }

      const { getCachedCurriculum, getCachedCourse } = await import("./academy-sync");
      const curriculum = await getCachedCurriculum(academyCourseId);
      if (!curriculum || !curriculum.curriculum || curriculum.curriculum.length === 0) {
        return res.status(404).json({ message: "No se pudo generar evaluación para este curso" });
      }

      const courseDetails = await getCachedCourse(academyCourseId);
      const courseTitle = courseDetails?.post_title || curriculum.title || `Curso ${academyCourseId}`;

      const units = curriculum.curriculum.filter((item: any) => item.type === "unit");
      const generatedQuestions: { question: string; options: string[]; correctIndex: number; explanation: string }[] = [];

      for (const unit of units.slice(0, 8)) {
        const title = unit.title || "";
        if (title.length < 5) continue;

        generatedQuestions.push({
          question: `¿Cuál es el tema principal del módulo "${title}"?`,
          options: [
            `Comprensión y aplicación de ${title.toLowerCase()}`,
            `Historia general de la educación`,
            `Técnicas de administración financiera`,
            `Fundamentos de programación web`,
          ],
          correctIndex: 0,
          explanation: `Este módulo se enfoca en "${title}", que es parte del curriculum del curso "${courseTitle}".`,
        });
      }

      if (generatedQuestions.length === 0) {
        return res.status(404).json({ message: "El curso no tiene suficiente contenido para generar una evaluación" });
      }

      quiz = await storage.createQuiz({
        courseId: null,
        academyCourseId,
        title: `Evaluación: ${courseTitle}`,
        description: `Evaluación generada automáticamente para el curso "${courseTitle}" de Ceduverse Academy.`,
        passingScore: 70,
        timeLimit: null,
      });

      for (let i = 0; i < generatedQuestions.length; i++) {
        const gq = generatedQuestions[i];
        await storage.createQuizQuestion({
          quizId: quiz.id,
          order: i + 1,
          question: gq.question,
          options: gq.options,
          correctIndex: gq.correctIndex,
          explanation: gq.explanation,
        });
      }

      const questions = await storage.getQuizQuestions(quiz.id);
      questions.sort((a, b) => a.order - b.order);
      const safeQuestions = questions.map(q => ({
        id: q.id, order: q.order, question: q.question, options: q.options,
      }));

      res.json({ quiz, questions: safeQuestions });
    } catch (err) { next(err); }
  });

  app.post("/api/academy/courses/:id/quiz/submit", requireAuth, async (req, res, next) => {
    try {
      const academyCourseId = parseInt(String(req.params.id));
      const userId = req.supabaseUserId!;
      const { answers } = req.body;
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: "Se requieren las respuestas" });
      }

      const quiz = await storage.getQuizByAcademyCourse(academyCourseId);
      if (!quiz) return res.status(404).json({ message: "Evaluación no encontrada" });

      const questions = await storage.getQuizQuestions(quiz.id);
      questions.sort((a, b) => a.order - b.order);

      let correct = 0;
      const results = questions.map((q, i) => {
        const userAnswer = answers[i] ?? -1;
        const isCorrect = userAnswer === q.correctIndex;
        if (isCorrect) correct++;
        return {
          questionId: q.id, question: q.question, options: q.options,
          userAnswer, correctIndex: q.correctIndex, isCorrect, explanation: q.explanation,
        };
      });

      const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
      const passed = score >= quiz.passingScore;

      const attempt = await storage.createQuizAttempt({
        userId, quizId: quiz.id, score, passed, answers: results,
      });

      if (passed) {
        const achievementSlug = `logro-academy-${academyCourseId}`;
        let achievement = await storage.getAchievementBySlug(achievementSlug);
        if (!achievement) {
          achievement = await storage.createAchievement({
            slug: achievementSlug,
            name: `Diploma Academy: ${quiz.title.replace("Evaluación: ", "")}`,
            shortDescription: `Aprobó la evaluación del curso Academy #${academyCourseId}`,
            category: "Academy",
            value: 1000,
            icon: "graduation-cap",
          });
        }
        const existing = await storage.getUserAchievements(userId);
        const alreadyHas = existing.some(a => a.achievementId === achievement!.id);
        if (!alreadyHas) {
          const profile = await storage.getProfile(userId);
          await storage.awardAchievement({
            userId, achievementId: achievement.id, isActive: true, status: "active",
            contractAddress: profile?.walletAddress || null, tokenId: null,
          });
        }
      }

      res.json({ score, passed, passingScore: quiz.passingScore, results, attemptId: attempt.id });
    } catch (err) { next(err); }
  });

  app.get("/api/academy/courses", async (req, res, next) => {
    try {
      const { getCachedCourses } = await import("./academy-sync");
      const search = req.query.search as string | undefined;
      const rawLimit = parseInt(req.query.limit as string);
      const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 100;
      const rawPage = parseInt(req.query.page as string);
      const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
      const result = await getCachedCourses({ search: search || undefined, page, limit });
      res.json(result);
    } catch (err) { next(err); }
  });

  app.get("/api/academy/courses/:id", async (req, res, next) => {
    try {
      const courseId = parseInt(String(req.params.id));
      if (isNaN(courseId)) return res.status(400).json({ message: "ID de curso inválido" });
      const { getCachedCourse } = await import("./academy-sync");
      const course = await getCachedCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Curso no encontrado" });
      }
      res.json(course);
    } catch (err) { next(err); }
  });

  app.get("/api/academy/courses/:id/curriculum", async (req, res, next) => {
    try {
      const courseId = parseInt(String(req.params.id));
      if (isNaN(courseId)) return res.status(400).json({ message: "ID de curso inválido" });

      function normalizeCurriculum(raw: any): any {
        if (!raw) return null;
        const items = raw.curriculum_items || raw.curriculum || [];
        const itemsArray = Array.isArray(items) ? items : Object.values(items);
        const curriculum = itemsArray.map((item: any, idx: number) => ({
          type: item.type || "unit",
          title: item.title || item.post_title || `Lección ${idx + 1}`,
          ID: item.id || item.ID,
          unit_type: item.unit_type || item.type,
          duration: item.duration || "",
          index: idx,
          content: item.content || item.post_content || "",
        }));
        return {
          course_id: raw.course?.id || courseId,
          title: raw.course?.title || "",
          total_items: raw.total_items || curriculum.length,
          curriculum,
        };
      }

      const { getCachedCurriculum } = await import("./academy-sync");
      const rawCurriculum = await getCachedCurriculum(courseId);
      if (!rawCurriculum) {
        return res.status(404).json({ message: "Currículum no encontrado" });
      }
      res.json(normalizeCurriculum(rawCurriculum));
    } catch (err) { next(err); }
  });

  app.get("/api/academy/products", async (_req, res, next) => {
    try {
      res.json([]);
    } catch (err) { next(err); }
  });

  app.get("/api/academy/stats", async (_req, res, next) => {
    try {
      const { getSyncStatus } = await import("./academy-sync");
      const syncStatus = getSyncStatus();
      const countResult = await db.execute(sql`SELECT count(*) as total FROM academy_courses_cache WHERE status = 'publish'`);
      const cachedTotal = Number((countResult as any).rows?.[0]?.total || (countResult as any)[0]?.total || 0);
      res.json({
        site: "https://ceducap.academy",
        timestamp: new Date().toISOString(),
        courses: { total: cachedTotal, published: cachedTotal },
        sync: syncStatus,
      });
    } catch (err) { next(err); }
  });

  app.post("/api/academy/sync", requireAdmin, async (_req, res, next) => {
    try {
      const { getSyncStatus } = await import("./academy-sync");
      res.json({ status: "skipped_not_configured", synced: 0, errors: 0, removed: 0, message: "Live sync disabled — using cached data", sync: getSyncStatus() });
    } catch (err) { next(err); }
  });

  // ==================== ADMIN CERTIFICATE MANAGEMENT ====================

  app.get("/api/admin/certificates", requireAuth, requireAdmin, async (_req, res, next) => {
    try {
      const allRequests = await storage.listCertificateRequests();
      const enriched = await Promise.all(allRequests.map(async (r) => {
        const profile = await storage.getProfile(r.userId);
        const course = await storage.getCourse(r.courseId);
        return {
          ...r,
          studentName: profile?.fullName || "Sin nombre",
          studentEmail: (await storage.getUser(r.userId))?.email || "",
          courseTitle: course?.title || "Curso no encontrado",
          courseSlug: course?.slug || "",
        };
      }));
      res.json(enriched);
    } catch (err) { next(err); }
  });

  app.patch("/api/admin/certificates/:id", requireAuth, requireAdmin, async (req, res, next) => {
    try {
      const id = req.params.id as string;
      const { status, rejectReason, pdfUrl } = req.body;
      const request = await storage.getCertificateRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Solicitud no encontrada" });
      }

      const validStatuses = ["solicitado", "en_proceso", "emitido", "rechazado"];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ message: `Status inválido. Opciones: ${validStatuses.join(", ")}` });
      }

      const allowedTransitions: Record<string, string[]> = {
        solicitado: ["en_proceso", "emitido", "rechazado"],
        en_proceso: ["emitido", "rechazado"],
        emitido: [],
        rechazado: ["solicitado"],
      };
      if (status && status !== request.status) {
        const allowed = allowedTransitions[request.status] || [];
        if (!allowed.includes(status)) {
          return res.status(400).json({ message: `No se puede cambiar de "${request.status}" a "${status}"` });
        }
      }

      if (status === "rechazado" && (!rejectReason || !rejectReason.trim())) {
        return res.status(400).json({ message: "Se requiere un motivo de rechazo" });
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (rejectReason !== undefined) updateData.rejectReason = rejectReason;
      if (pdfUrl !== undefined) updateData.pdfUrl = pdfUrl;

      if (status === "emitido") {
        if (request.achievementUserId) {
          const finalPdf = pdfUrl || request.pdfUrl || null;
          if (finalPdf) {
            await storage.updateAchievementUser(request.achievementUserId, { pdfUrl: finalPdf });
          }
        } else {
          const finalPdf = pdfUrl || request.pdfUrl || null;
          if (!finalPdf) {
            return res.status(400).json({ message: "Se requiere subir un PDF antes de emitir" });
          }
          const course = await storage.getCourse(request.courseId);
          if (!course) {
            return res.status(404).json({ message: "Curso no encontrado" });
          }
          const achievementSlug = `logro-${course.slug}`;
          let achievement = await storage.getAchievementBySlug(achievementSlug);
          if (!achievement) {
            achievement = await storage.createAchievement({
              slug: achievementSlug,
              name: `Diploma: ${course.title}`,
              shortDescription: `Aprobó la evaluación del curso "${course.title}"`,
              description: `Diploma Digital de Participación obtenido al aprobar con éxito la evaluación del curso ${course.title}. Verificable en blockchain.`,
              category: course.areaTematica || "STPS",
              value: 1000,
              icon: "award",
            });
          }
          const profile = await storage.getProfile(request.userId);
          const simAddress = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
          const simTokenId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
          const certAchievement = await storage.awardAchievement({
            userId: request.userId,
            achievementId: achievement.id,
            isActive: true,
            status: "active",
            certType: request.certType,
            contractAddress: profile?.walletAddress || simAddress,
            tokenId: simTokenId,
            pdfUrl: finalPdf,
          });
          updateData.achievementUserId = certAchievement.id;
        }
      }

      const updated = await storage.updateCertificateRequest(id as string, updateData);
      res.json(updated);
    } catch (err) { next(err); }
  });

  const certUploadDir = path.join(process.cwd(), "uploads", "certificates");
  if (!fs.existsSync(certUploadDir)) {
    fs.mkdirSync(certUploadDir, { recursive: true });
  }
  const certUpload = multer({
    storage: multer.diskStorage({
      destination: certUploadDir,
      filename: (_req: any, file: Express.Multer.File, cb: any) => {
        const ext = path.extname(file.originalname);
        cb(null, `cert-${_req.params.id}-${Date.now()}${ext}`);
      },
    }),
    fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(new Error("Solo se aceptan archivos PDF"));
      }
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  app.post("/api/admin/certificates/:id/upload", requireAuth, requireAdmin, certUpload.single("pdf"), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se recibió archivo PDF" });
      }
      const pdfUrl = `/uploads/certificates/${req.file.filename}`;
      const updated = await storage.updateCertificateRequest(req.params.id as string, { pdfUrl });
      res.json({ pdfUrl, request: updated });
    } catch (err) { next(err); }
  });

  // ==================== ADMIN OVERVIEW ====================

  app.get("/api/admin/overview", requireAuth, requireAdmin, async (_req, res, next) => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [userCount] = await db.select({ count: count() }).from(users);
      const [teamCount] = await db.select({ count: count() }).from(teams).where(eq(teams.status, "active"));
      const [partnerCount] = await db.select({ count: count() }).from(accounts).where(inArray(accounts.userRole, ["socio_comercial", "partner", "director"]));
      const [instructorCount] = await db.select({ count: count() }).from(accounts).where(inArray(accounts.userRole, ["socio_instructor", "instructor"]));
      const [courseCompletions] = await db.select({ count: count() }).from(courseUsers).where(eq(courseUsers.completed, 100));
      const [orgObjCount] = await db.select({ count: count() }).from(orgObjectives);
      const [completionsThisMonth] = await db.select({ count: count() }).from(courseUsers)
        .where(and(eq(courseUsers.completed, 100), gte(courseUsers.updatedAt, startOfMonth)));
      const [certsTotal] = await db.select({ count: count() }).from(certificateRequests)
        .where(sql`${certificateRequests.status} = 'emitido'`);

      const [revRow] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(companyPayments)
        .where(and(
          eq(companyPayments.status, "confirmed"),
          sql`${companyPayments.periodMonth} = ${now.getMonth() + 1}`,
          sql`${companyPayments.periodYear} = ${now.getFullYear()}`
        ));
      const monthlyRevenue = Number(revRow?.total || 0);

      const allThreads = await storage.getAllSupportThreads();
      let unansweredSupportThreads = 0;
      for (const thread of allThreads) {
        if (thread.status !== "open") continue;
        const msgs = await storage.getSupportMessages(thread.id);
        const lastMsg = msgs[msgs.length - 1];
        const staffRoles = ["admin", "advisor", "superadmin"];
        if (!lastMsg || !staffRoles.includes(lastMsg.senderRole)) unansweredSupportThreads++;
      }

      const [odRow] = await db.select({ count: count() })
        .from(companyPayments).where(eq(companyPayments.status, "overdue"));
      const overduePayments = Number(odRow?.count || 0);

      const recentUsersRows = await db.select({ id: users.id, email: users.email, createdAt: users.createdAt, fullName: profiles.fullName })
        .from(users).leftJoin(profiles, eq(users.id, profiles.id)).orderBy(desc(users.createdAt)).limit(8);

      const userGrowth: { week: string; count: number }[] = [];
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const [wk] = await db.select({ count: count() }).from(users)
          .where(and(gte(users.createdAt, weekStart), sql`${users.createdAt} < ${weekEnd}`));
        userGrowth.push({
          week: weekStart.toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
          count: Number(wk?.count || 0),
        });
      }

      const revenueByMonth: { month: string; amount: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const [rev] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
          .from(companyPayments)
          .where(and(
            eq(companyPayments.status, "confirmed"),
            sql`${companyPayments.periodMonth} = ${m.getMonth() + 1}`,
            sql`${companyPayments.periodYear} = ${m.getFullYear()}`
          ));
        revenueByMonth.push({
          month: m.toLocaleDateString("es-MX", { month: "short", year: "2-digit" }),
          amount: Number(rev?.total || 0),
        });
      }

      const recentCerts = await db.select({ id: certificateRequests.id, status: certificateRequests.status, createdAt: certificateRequests.createdAt })
        .from(certificateRequests).orderBy(desc(certificateRequests.createdAt)).limit(10);
      const recentPayments = await db.select({ id: companyPayments.id, amount: companyPayments.amount, status: companyPayments.status, createdAt: companyPayments.createdAt })
        .from(companyPayments).orderBy(desc(companyPayments.createdAt)).limit(10);

      const [pendingInstructorApps] = await db.select({ count: count() })
        .from(instructorApplications)
        .where(eq(instructorApplications.status, "pending_review"));

      const recentActivity: { type: string; description: string; time: string; _ts: number }[] = [];
      for (const c of recentCerts) {
        const statusLabel = c.status === "solicitado" ? "Solicitud" : c.status === "emitido" ? "Emitido" : c.status === "en_proceso" ? "En proceso" : c.status;
        recentActivity.push({ type: "cert", description: `Certificado: ${statusLabel}`,
          time: new Date(c.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }), _ts: new Date(c.createdAt).getTime() });
      }
      for (const p of recentPayments) {
        recentActivity.push({ type: "payment", description: `Pago: $${Number(p.amount).toLocaleString("es-MX")} (${p.status === "confirmed" ? "Confirmado" : p.status === "pending" ? "Pendiente" : p.status})`,
          time: new Date(p.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }), _ts: new Date(p.createdAt).getTime() });
      }
      recentActivity.sort((a, b) => b._ts - a._ts);

      res.json({
        totalUsers: userCount.count, totalOrgs: teamCount.count, totalPartners: partnerCount.count,
        totalInstructors: instructorCount.count,
        coursesCompleted: courseCompletions.count, completionsThisMonth: completionsThisMonth?.count || 0,
        totalObjectives: orgObjCount.count, certsEmitted: certsTotal?.count || 0, monthlyRevenue,
        unansweredSupportThreads, overduePayments, pendingInstructorApps: pendingInstructorApps?.count || 0,
        recentUsers: recentUsersRows,
        recentActivity: recentActivity.slice(0, 20), userGrowth, revenueByMonth,
      });
    } catch (err) { next(err); }
  });

  // ==================== SUPERADMIN ROUTES ====================

  app.get("/api/admin/stats", requireAuth, requireAdmin, async (_req, res, next) => {
    try {
      const [userCount] = await db.select({ count: count() }).from(users);
      const [teamCount] = await db.select({ count: count() }).from(teams);
      const [partnerCount] = await db.select({ count: count() }).from(accounts).where(inArray(accounts.userRole, ["socio_comercial", "partner", "director"]));
      const [courseCompletions] = await db.select({ count: count() }).from(courseUsers).where(eq(courseUsers.completed, 100));
      const [orgObjCount] = await db.select({ count: count() }).from(orgObjectives);
      res.json({
        totalUsers: userCount.count,
        totalOrgs: teamCount.count,
        totalPartners: partnerCount.count,
        coursesCompleted: courseCompletions.count,
        totalObjectives: orgObjCount.count,
      });
    } catch (err) { next(err); }
  });

  app.get("/api/admin/orgs", requireAuth, requireAdmin, async (_req, res, next) => {
    try {
      const allTeams = await db.select().from(teams);
      const result = [];
      for (const team of allTeams) {
        const members = await db.select({ count: count() }).from(teamUsers).where(eq(teamUsers.teamId, team.id));
        let partnerName = null;
        if (team.partnerId) {
          const p = await storage.getProfile(team.partnerId);
          partnerName = p?.fullName || null;
        }
        const objectives = await db.select().from(orgObjectives).where(eq(orgObjectives.teamId, team.id));
        result.push({
          ...team,
          memberCount: members[0].count,
          partnerName,
          objectiveCount: objectives.length,
        });
      }
      res.json(result);
    } catch (err) { next(err); }
  });

  app.get("/api/admin/orgs/:id", requireAuth, requireAdmin, async (req, res, next) => {
    try {
      const team = await storage.getTeam(String(req.params.id));
      if (!team) return res.status(404).json({ message: "Organización no encontrada" });

      const members = await db.select({ teamUser: teamUsers, profile: profiles, account: accounts })
        .from(teamUsers)
        .innerJoin(profiles, eq(teamUsers.userId, profiles.id))
        .innerJoin(accounts, eq(teamUsers.userId, accounts.id))
        .where(eq(teamUsers.teamId, team.id));

      const memberData = [];
      for (const m of members) {
        const userCourses = await db.select().from(courseUsers).where(eq(courseUsers.userId, m.teamUser.userId));
        memberData.push({
          userId: m.teamUser.userId,
          fullName: m.profile.fullName,
          role: m.teamUser.role,
          coursesEnrolled: userCourses.length,
          coursesCompleted: userCourses.filter(c => c.completed === 100).length,
          avgProgress: userCourses.length > 0 ? Math.round(userCourses.reduce((sum, c) => sum + (c.completed || 0), 0) / userCourses.length) : 0,
        });
      }

      const objectives = await db.select({ objective: orgObjectives, course: courses })
        .from(orgObjectives)
        .innerJoin(courses, eq(orgObjectives.courseId, courses.id))
        .where(eq(orgObjectives.teamId, team.id));

      let partnerName = null;
      if (team.partnerId) {
        const p = await storage.getProfile(team.partnerId);
        partnerName = p?.fullName || null;
      }

      const memberIds = members.map(m => m.teamUser.userId);

      const contributions = memberIds.length > 0
        ? await db.select().from(monthlyContributions).where(eq(monthlyContributions.teamId, team.id)).orderBy(desc(monthlyContributions.generatedAt)).limit(12)
        : [];

      const certificates = memberIds.length > 0
        ? await db.select().from(certificateRequests).where(
            sql`${certificateRequests.userId} = ANY(${memberIds})`
          ).orderBy(desc(certificateRequests.createdAt)).limit(20)
        : [];

      res.json({
        ...team,
        partnerName,
        members: memberData,
        objectives: objectives.map(o => ({ ...o.objective, courseTitle: o.course.title, courseSlug: o.course.slug })),
        contributions: contributions.map(c => ({
          id: c.id,
          month: c.periodMonth,
          year: c.periodYear,
          totalAmount: Number(c.grossAmount),
          cfdiStatus: c.cfdiStatus,
          generatedAt: c.generatedAt,
        })),
        certificateCount: certificates.length,
      });
    } catch (err) { next(err); }
  });

  app.patch("/api/admin/orgs/:id", requireAuth, requireAdmin, async (req, res, next) => {
    try {
      const teamId = String(req.params.id);
      const team = await storage.getTeam(teamId);
      if (!team) return res.status(404).json({ message: "Organización no encontrada" });
      const { rfc, feePercent, contractUrl, plan, status } = req.body;
      const updateFields: Record<string, unknown> = { updatedAt: new Date() };
      if (rfc !== undefined) updateFields.rfc = rfc;
      if (feePercent !== undefined) updateFields.feePercent = String(feePercent);
      if (contractUrl !== undefined) updateFields.contractUrl = contractUrl;
      if (plan !== undefined) updateFields.plan = plan;
      if (status !== undefined) updateFields.status = status;
      await db.update(teams).set(updateFields).where(eq(teams.id, teamId));
      const updated = await storage.getTeam(teamId);
      res.json(updated);
    } catch (err) { next(err); }
  });

  app.post("/api/admin/orgs/:id/objectives", requireAuth, requireAdmin, async (req, res, next) => {
    try {
      const teamId = String(req.params.id);
      const team = await storage.getTeam(teamId);
      if (!team) return res.status(404).json({ message: "Organización no encontrada" });

      const { courseId } = req.body;
      if (!courseId) return res.status(400).json({ message: "courseId requerido" });

      const course = await storage.getCourse(courseId);
      if (!course) return res.status(404).json({ message: "Curso no encontrado" });

      const existing = await db.select().from(orgObjectives)
        .where(and(eq(orgObjectives.teamId, teamId), eq(orgObjectives.courseId, courseId)));
      if (existing.length > 0) return res.status(409).json({ message: "Este objetivo ya está asignado a la organización" });

      const [obj] = await db.insert(orgObjectives).values({
        teamId,
        courseId,
        assignedBy: req.supabaseUserId!,
        status: "active",
      }).returning();

      res.status(201).json(obj);
    } catch (err) { next(err); }
  });

  app.delete("/api/admin/orgs/:id/objectives/:objId", requireAuth, requireAdmin, async (req, res, next) => {
    try {
      const result = await db.delete(orgObjectives)
        .where(and(eq(orgObjectives.id, String(req.params.objId)), eq(orgObjectives.teamId, String(req.params.id))))
        .returning();
      if (result.length === 0) return res.status(404).json({ message: "Objetivo no encontrado" });
      res.json({ message: "Objetivo eliminado" });
    } catch (err) { next(err); }
  });

  app.get("/api/admin/partners", requireAuth, requireAdmin, async (_req, res, next) => {
    try {
      const partnersRaw = await db.select()
        .from(accounts)
        .innerJoin(users, eq(accounts.id, users.id))
        .innerJoin(profiles, eq(accounts.id, profiles.id))
        .where(inArray(accounts.userRole, ["socio_comercial", "partner", "director"]));
      const partners = partnersRaw.map(r => ({ user: r.users, account: r.accounts, profile: r.profiles }));

      const result = [];
      for (const p of partners) {
        const codes = await db.select().from(referralCodes).where(eq(referralCodes.ownerId, p.user.id));
        const referredOrgs = await db.select({ count: count() }).from(teams).where(eq(teams.partnerId, p.user.id));
        result.push({
          userId: p.user.id,
          email: p.user.email,
          fullName: p.profile.fullName,
          referralCodes: codes.length,
          totalUsage: codes.reduce((sum, c) => sum + c.usageCount, 0),
          referredOrgs: referredOrgs[0].count,
        });
      }
      res.json(result);
    } catch (err) { next(err); }
  });

  app.post("/api/admin/partners", requireAuth, requireSuperadmin, async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email requerido" });

      const user = await storage.getUserByEmail(email);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

      await storage.updateAccount(user.id, { userRole: "socio_comercial" });
      const account = await storage.getAccount(user.id);
      res.json({ message: "Usuario promovido a socio comercial", account });
    } catch (err) { next(err); }
  });

  app.patch("/api/admin/users/:id/role", requireAuth, requireSuperadmin, async (req, res, next) => {
    try {
      const { role, reason } = req.body;
      if (!reason || typeof reason !== "string" || reason.trim().length < 3) {
        return res.status(400).json({ message: "Se requiere una razón para el cambio de rol (mínimo 3 caracteres)" });
      }
      const ROLE_MAP: Record<string, string> = { user: "socio_estudiante", partner: "socio_comercial", instructor: "socio_instructor", moderator: "socio_estudiante" };
      const mappedRole = ROLE_MAP[role] || role;
      const validRoles = ["socio_estudiante", "socio_instructor", "socio_comercial", "director", "empresa", "empresa_rh", "admin", "superadmin"];
      if (!mappedRole || !validRoles.includes(mappedRole)) {
        return res.status(400).json({ message: "Rol inválido" });
      }
      const targetUserId = String(req.params.id);
      const user = await storage.getUser(targetUserId);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

      const previousAccount = await storage.getAccount(targetUserId);
      const previousRole = previousAccount?.userRole || "socio_estudiante";

      await storage.updateAccount(targetUserId, { userRole: mappedRole });

      const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "";
      await db.insert(roleChangeLog).values({
        userId: targetUserId,
        changedBy: req.supabaseUserId!,
        previousRole,
        newRole: mappedRole,
        reason: req.body.reason,
        ipAddress: ip,
      });

      res.json({ message: "Rol actualizado", userId: targetUserId, newRole: mappedRole });
    } catch (err) { next(err); }
  });

  app.get("/api/admin/users", requireAuth, requireAdmin, async (_req, res, next) => {
    try {
      const allUsersRaw = await db.select()
        .from(users)
        .leftJoin(accounts, eq(users.id, accounts.id))
        .leftJoin(profiles, eq(users.id, profiles.id));
      const allUsers = allUsersRaw.map(r => ({ user: r.users, account: r.accounts, profile: r.profiles }));

      const allTeamUsers = await db.select({ userId: teamUsers.userId, teamName: teams.name })
        .from(teamUsers)
        .innerJoin(teams, eq(teamUsers.teamId, teams.id));

      const userTeamMap = new Map<string, string>();
      for (const tu of allTeamUsers) {
        if (!userTeamMap.has(tu.userId)) userTeamMap.set(tu.userId, tu.teamName);
      }

      const lastAccessRows = await db.select({
        userId: courseUsers.userId,
        lastAccess: sql<string>`MAX(${courseUsers.updatedAt})`,
      }).from(courseUsers).groupBy(courseUsers.userId);

      const lastAccessMap = new Map<string, string>();
      for (const row of lastAccessRows) {
        if (row.lastAccess) lastAccessMap.set(row.userId, row.lastAccess);
      }

      res.json(allUsers.map(u => ({
        id: u.user.id,
        email: u.user.email,
        fullName: u.profile?.fullName || null,
        role: u.account?.userRole || "socio_estudiante",
        accountType: u.account?.accountType || null,
        accountSetup: u.account?.accountSetup || 0,
        country: u.profile?.country || null,
        city: u.profile?.city || null,
        phoneNumber: u.profile?.phoneNumber || null,
        walletAddress: u.profile?.walletAddress || null,
        interest: u.profile?.interest || [],
        genre: u.profile?.genre || null,
        createdAt: u.user.createdAt,
        teamName: userTeamMap.get(u.user.id) || null,
        lastAccessAt: lastAccessMap.get(u.user.id) || null,
      })));
    } catch (err) { next(err); }
  });

  app.get("/api/admin/users/:id", requireAuth, requireAdmin, async (req, res, next) => {
    try {
      const userId = String(req.params.id);
      const [row] = await db.select()
        .from(users)
        .leftJoin(accounts, eq(users.id, accounts.id))
        .leftJoin(profiles, eq(users.id, profiles.id))
        .where(eq(users.id, userId));

      if (!row) return res.status(404).json({ message: "Usuario no encontrado" });

      const userData = { user: row.users, account: row.accounts, profile: row.profiles };

      const userEnrollments = await db.select()
        .from(courseUsers)
        .where(eq(courseUsers.userId, userId));

      const userAchievements = await db.select()
        .from(achievementUsers)
        .where(eq(achievementUsers.userId, userId));

      const userTeamsList = await db.select({ team: teams, membership: teamUsers })
        .from(teamUsers)
        .leftJoin(teams, eq(teamUsers.teamId, teams.id))
        .where(eq(teamUsers.userId, userId));

      const roleHistory = await db.select()
        .from(roleChangeLog)
        .where(eq(roleChangeLog.userId, userId))
        .orderBy(desc(roleChangeLog.createdAt))
        .limit(10);

      const userCerts = await db.select({
        id: certificateRequests.id,
        certType: certificateRequests.certType,
        status: certificateRequests.status,
        createdAt: certificateRequests.createdAt,
      }).from(certificateRequests)
        .where(eq(certificateRequests.userId, userId))
        .orderBy(desc(certificateRequests.createdAt))
        .limit(10);

      const enrolledCourses = await db.select({
        courseId: courseUsers.courseId,
        courseSlug: courseUsers.courseSlug,
        completed: courseUsers.completed,
        enrolledAt: courseUsers.createdAt,
        courseTitle: courses.title,
      }).from(courseUsers)
        .leftJoin(courses, eq(courseUsers.courseId, courses.id))
        .where(eq(courseUsers.userId, userId))
        .orderBy(desc(courseUsers.createdAt))
        .limit(20);

      const instructorCourses = await db.select({
        id: courses.id,
        slug: courses.slug,
        title: courses.title,
      }).from(courses)
        .where(eq(courses.instructorId, userId))
        .limit(20);

      const termsHistory = await db.select({
        id: userTermsAcceptances.id,
        acceptedAt: userTermsAcceptances.acceptedAt,
        versionTitle: termsVersions.title,
        versionType: termsVersions.type,
      }).from(userTermsAcceptances)
        .leftJoin(termsVersions, eq(userTermsAcceptances.termsVersionId, termsVersions.id))
        .where(eq(userTermsAcceptances.userId, userId))
        .orderBy(desc(userTermsAcceptances.acceptedAt))
        .limit(10);

      const isCoopMember = userData.account?.isCooperativeMember ?? false;

      res.json({
        id: userData.user.id,
        email: userData.user.email,
        fullName: userData.profile?.fullName || null,
        role: userData.account?.userRole || "socio_estudiante",
        accountType: userData.account?.accountType || null,
        accountSetup: userData.account?.accountSetup || 0,
        country: userData.profile?.country || null,
        city: userData.profile?.city || null,
        phoneNumber: userData.profile?.phoneNumber || null,
        walletAddress: userData.profile?.walletAddress || null,
        interest: userData.profile?.interest || [],
        genre: userData.profile?.genre || null,
        referralCode: userData.account?.referralCode || null,
        referredBy: userData.account?.referredBy || null,
        isCooperativeMember: isCoopMember,
        createdAt: userData.user.createdAt,
        enrollments: userEnrollments.length,
        completedCourses: userEnrollments.filter(e => e.completed >= 100).length,
        achievements: userAchievements.length,
        teams: userTeamsList.map(t => ({
          id: t.team?.id,
          name: t.team?.name,
          role: t.membership.role,
        })),
        roleHistory: roleHistory.map(r => ({
          previousRole: r.previousRole,
          newRole: r.newRole,
          reason: r.reason,
          changedAt: r.createdAt,
        })),
        certificates: userCerts,
        enrolledCourses,
        instructorCourses,
        termsHistory,
      });
    } catch (err) { next(err); }
  });

  app.patch("/api/admin/users/:id/account-type", requireAuth, requireSuperadmin, async (req, res, next) => {
    try {
      const { accountType } = req.body;
      const validTypes = ["free", "premium", "admin"];
      if (!accountType || !validTypes.includes(accountType)) {
        return res.status(400).json({ message: "Tipo de cuenta inválido" });
      }
      const user = await storage.getUser(String(req.params.id));
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

      await storage.updateAccount(String(req.params.id), { accountType });
      res.json({ message: "Tipo de cuenta actualizado", userId: String(req.params.id), newAccountType: accountType });
    } catch (err) { next(err); }
  });

  app.patch("/api/admin/users/:id/profile", requireAuth, requireAdmin, async (req, res, next) => {
    try {
      const userId = String(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

      const { fullName, country, city, phoneNumber } = req.body;
      const updateData: Record<string, any> = {};
      if (fullName !== undefined) updateData.fullName = fullName;
      if (country !== undefined) updateData.country = country;
      if (city !== undefined) updateData.city = city;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

      await storage.updateProfile(userId, updateData);
      res.json({ message: "Perfil actualizado" });
    } catch (err) { next(err); }
  });

  // ==================== PARTNER ROUTES ====================

  app.get("/api/partner/stats", requireAuth, requirePartner, async (req, res, next) => {
    try {
      const partnerId = req.supabaseUserId!;
      const partnerOrgs = await db.select().from(teams).where(eq(teams.partnerId, partnerId));
      const activeOrgs = partnerOrgs.filter(o => o.status === "active").length;
      const codes = await db.select().from(referralCodes).where(eq(referralCodes.ownerId, partnerId));
      const activeCodes = codes.filter(c => c.isActive).length;
      const totalUsage = codes.reduce((sum, c) => sum + c.usageCount, 0);

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const [monthlyRow] = await db.select({ total: sql<number>`COALESCE(SUM(${partnerCommissions.amount}), 0)` })
        .from(partnerCommissions).where(and(
          eq(partnerCommissions.partnerId, partnerId),
          eq(partnerCommissions.periodMonth, currentMonth),
          eq(partnerCommissions.periodYear, currentYear),
        ));
      const monthlyCommission = Number(monthlyRow?.total) || 0;

      const [totalRow] = await db.select({ total: sql<number>`COALESCE(SUM(${partnerCommissions.amount}), 0)` })
        .from(partnerCommissions).where(eq(partnerCommissions.partnerId, partnerId));
      const totalCommission = Number(totalRow?.total) || codes.reduce((sum, c) => sum + (c.usageCount * c.commission), 0);

      let trainedCollaborators = 0;
      for (const org of partnerOrgs) {
        const [completedCount] = await db.select({ count: count() })
          .from(courseUsers)
          .innerJoin(teamUsers, eq(courseUsers.userId, teamUsers.userId))
          .where(and(eq(teamUsers.teamId, org.id), eq(courseUsers.completed, 100)));
        trainedCollaborators += completedCount.count;
      }

      let dc3Sold = 0;
      for (const org of partnerOrgs) {
        const [dc3Count] = await db.select({ count: count() })
          .from(certificateRequests)
          .innerJoin(teamUsers, eq(certificateRequests.userId, teamUsers.userId))
          .where(and(eq(teamUsers.teamId, org.id), eq(certificateRequests.certType, "dc3")));
        dc3Sold += dc3Count.count;
      }

      res.json({
        activeCompanies: activeOrgs,
        monthlyCommission,
        trainedCollaborators,
        dc3Sold,
        totalOrgs: partnerOrgs.length,
        totalCodes: activeCodes,
        totalUsage,
        totalCommission,
      });
    } catch (err) { next(err); }
  });

  app.get("/api/partner/orgs", requireAuth, requirePartner, async (req, res, next) => {
    try {
      const partnerId = req.supabaseUserId!;
      const orgs = await db.select().from(teams).where(eq(teams.partnerId, partnerId));
      const result = [];
      for (const org of orgs) {
        const [memberCount] = await db.select({ count: count() }).from(teamUsers).where(eq(teamUsers.teamId, org.id));
        result.push({ ...org, memberCount: memberCount.count });
      }
      res.json(result);
    } catch (err) { next(err); }
  });

  app.get("/api/partner/referrals", requireAuth, requirePartner, async (req, res, next) => {
    try {
      const partnerId = req.supabaseUserId!;
      const codes = await db.select().from(referralCodes).where(eq(referralCodes.ownerId, partnerId));
      res.json(codes);
    } catch (err) { next(err); }
  });

  app.post("/api/partner/referrals", requireAuth, requirePartner, async (req, res, next) => {
    try {
      const partnerId = req.supabaseUserId!;
      const { label, commission } = req.body;
      const code = `P-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const [ref] = await db.insert(referralCodes).values({
        code,
        ownerId: partnerId,
        ownerType: "socio_comercial",
        label: label || null,
        commission: commission || 10,
        isActive: true,
      }).returning();
      res.status(201).json(ref);
    } catch (err) { next(err); }
  });

  app.get("/api/partner/commissions", requireAuth, requirePartner, async (req, res, next) => {
    try {
      const partnerId = req.supabaseUserId!;
      const commissions = await db.select({
        commission: partnerCommissions,
        teamName: teams.name,
      }).from(partnerCommissions)
        .leftJoin(teams, eq(partnerCommissions.teamId, teams.id))
        .where(eq(partnerCommissions.partnerId, partnerId))
        .orderBy(desc(partnerCommissions.periodYear), desc(partnerCommissions.periodMonth));
      res.json(commissions.map(c => ({
        ...c.commission,
        teamName: c.teamName || "Organización",
      })));
    } catch (err) { next(err); }
  });

  // ==================== INSTRUCTOR ROUTES ====================

  app.get("/api/instructor/courses", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;

      const instructorCourses = await db.select().from(courses).where(eq(courses.instructorId, userId));

      const result = [];
      for (const course of instructorCourses) {
        const [enrolled] = await db.select({ count: count() }).from(courseUsers).where(eq(courseUsers.courseId, course.id));
        const [completed] = await db.select({ count: count() }).from(courseUsers).where(
          and(eq(courseUsers.courseId, course.id), eq(courseUsers.completed, 100))
        );
        const [avgRow] = await db.select({ avg: sql<number>`COALESCE(AVG(${courseUsers.completed}), 0)` })
          .from(courseUsers).where(eq(courseUsers.courseId, course.id));

        result.push({
          ...course,
          enrolledCount: enrolled?.count || 0,
          completedCount: completed?.count || 0,
          avgProgress: Math.round(avgRow?.avg || 0),
        });
      }
      res.json(result);
    } catch (err) { next(err); }
  });

  app.post("/api/instructor/courses", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { title, description } = req.body;
      if (!title || typeof title !== "string" || title.trim().length < 3) {
        return res.status(400).json({ message: "El nombre del curso debe tener al menos 3 caracteres" });
      }
      const slug = title.trim().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
        + "-" + Date.now().toString(36);
      const [profile] = await db.select({ fullName: profiles.fullName }).from(profiles).where(eq(profiles.id, userId));
      const [newCourse] = await db.insert(courses).values({
        slug,
        title: title.trim(),
        description: description?.trim() || null,
        instructorId: userId,
        instructor: profile?.fullName || "Instructor",
      }).returning();
      res.json(newCourse);
    } catch (err) { next(err); }
  });

  app.get("/api/instructor/stats", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;

      const instructorCourses = await db.select().from(courses).where(eq(courses.instructorId, userId));
      const courseIds = instructorCourses.map(c => c.id);

      let totalEnrolled = 0;
      let totalCompleted = 0;
      let totalProgress = 0;
      let enrollmentCount = 0;
      let totalCertificates = 0;

      for (const cid of courseIds) {
        const [enrolled] = await db.select({ count: count() }).from(courseUsers).where(eq(courseUsers.courseId, cid));
        const [completed] = await db.select({ count: count() }).from(courseUsers).where(
          and(eq(courseUsers.courseId, cid), eq(courseUsers.completed, 100))
        );
        const allEnrollments = await db.select().from(courseUsers).where(eq(courseUsers.courseId, cid));
        totalEnrolled += enrolled.count;
        totalCompleted += completed.count;
        for (const e of allEnrollments) {
          totalProgress += e.completed;
          enrollmentCount++;
        }
        const [certCount] = await db.select({ count: count() }).from(certificateRequests).where(
          and(eq(certificateRequests.courseId, cid), eq(certificateRequests.status, "emitido"))
        );
        totalCertificates += certCount.count;
      }

      res.json({
        totalCourses: instructorCourses.length,
        totalEnrolled,
        totalCompleted,
        totalCertificates,
        avgProgress: enrollmentCount > 0 ? Math.round(totalProgress / enrollmentCount) : 0,
      });
    } catch (err) { next(err); }
  });

  app.get("/api/instructor/students", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;

      const instructorCourses = await db.select().from(courses).where(eq(courses.instructorId, userId));

      const studentMap = new Map<string, { userId: string; fullName: string | null; email: string; courses: { title: string; progress: number }[] }>();

      for (const course of instructorCourses) {
        const enrollments = await db.select({ cu: courseUsers, u: users, p: profiles })
          .from(courseUsers)
          .innerJoin(users, eq(courseUsers.userId, users.id))
          .leftJoin(profiles, eq(courseUsers.userId, profiles.id))
          .where(eq(courseUsers.courseId, course.id));

        for (const row of enrollments) {
          const existing = studentMap.get(row.cu.userId);
          const courseEntry = { title: course.title, progress: row.cu.completed };
          if (existing) {
            existing.courses.push(courseEntry);
          } else {
            studentMap.set(row.cu.userId, {
              userId: row.cu.userId,
              fullName: row.p?.fullName || null,
              email: row.u.email,
              courses: [courseEntry],
            });
          }
        }
      }

      res.json(Array.from(studentMap.values()));
    } catch (err) { next(err); }
  });

  app.get("/api/instructor/profile", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const [profile] = await db.select().from(instructorProfiles).where(eq(instructorProfiles.id, userId));
      if (!profile) {
        await db.insert(instructorProfiles).values({ id: userId });
        const [newProfile] = await db.select().from(instructorProfiles).where(eq(instructorProfiles.id, userId));
        return res.json(newProfile);
      }
      res.json(profile);
    } catch (err) { next(err); }
  });

  app.put("/api/instructor/profile", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { bio, specialty, bankName, bankClabe, profileImageUrl } = req.body;
      const [existing] = await db.select().from(instructorProfiles).where(eq(instructorProfiles.id, userId));
      if (!existing) {
        await db.insert(instructorProfiles).values({ id: userId, bio, specialty, bankName, bankClabe, profileImageUrl });
      } else {
        await db.update(instructorProfiles).set({ bio, specialty, bankName, bankClabe, profileImageUrl }).where(eq(instructorProfiles.id, userId));
      }
      const [updated] = await db.select().from(instructorProfiles).where(eq(instructorProfiles.id, userId));
      res.json(updated);
    } catch (err) { next(err); }
  });

  app.get("/api/instructor/my-courses", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const result = await db.select().from(instructorCourses).where(eq(instructorCourses.instructorId, userId)).orderBy(desc(instructorCourses.createdAt));
      res.json(result);
    } catch (err) { next(err); }
  });

  app.post("/api/instructor/my-courses", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { title, description, category, level, durationHours, certificationType, isFree, price, availableForAll, tags, nomsRelated, modules, quizzes, status } = req.body;
      const [course] = await db.insert(instructorCourses).values({
        instructorId: userId,
        title,
        description,
        category,
        level,
        durationHours: durationHours ? parseInt(durationHours) : null,
        certificationType: certificationType || "nft",
        isFree: isFree !== false,
        price: price || "0",
        availableForAll: availableForAll !== false,
        tags: tags || [],
        nomsRelated: nomsRelated || [],
        modules: modules || [],
        quizzes: quizzes || [],
        status: status || "draft",
        publishedAt: status === "review" ? new Date() : null,
      }).returning();
      res.json(course);
    } catch (err) { next(err); }
  });

  app.get("/api/instructor/my-courses/:id", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const [course] = await db.select().from(instructorCourses).where(and(eq(instructorCourses.id, req.params.id), eq(instructorCourses.instructorId, userId)));
      if (!course) return res.status(404).json({ message: "Curso no encontrado" });
      res.json(course);
    } catch (err) { next(err); }
  });

  app.patch("/api/instructor/my-courses/:id", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const [existing] = await db.select().from(instructorCourses).where(and(eq(instructorCourses.id, req.params.id), eq(instructorCourses.instructorId, userId)));
      if (!existing) return res.status(404).json({ message: "Curso no encontrado" });

      const { title, description, category, level, durationHours, certificationType, isFree, price, availableForAll, tags, nomsRelated, modules, quizzes, status } = req.body;
      const updateData: Record<string, any> = { updatedAt: new Date() };
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (level !== undefined) updateData.level = level;
      if (durationHours !== undefined) updateData.durationHours = durationHours ? parseInt(durationHours) : null;
      if (certificationType !== undefined) updateData.certificationType = certificationType;
      if (isFree !== undefined) updateData.isFree = isFree;
      if (price !== undefined) updateData.price = price;
      if (availableForAll !== undefined) updateData.availableForAll = availableForAll;
      if (tags !== undefined) updateData.tags = tags;
      if (nomsRelated !== undefined) updateData.nomsRelated = nomsRelated;
      if (modules !== undefined) updateData.modules = modules;
      if (quizzes !== undefined) updateData.quizzes = quizzes;
      if (status !== undefined) {
        updateData.status = status;
        if (status === "review" && !existing.publishedAt) updateData.publishedAt = new Date();
      }

      await db.update(instructorCourses).set(updateData).where(eq(instructorCourses.id, req.params.id));
      const [updated] = await db.select().from(instructorCourses).where(eq(instructorCourses.id, req.params.id));
      res.json(updated);
    } catch (err) { next(err); }
  });

  app.delete("/api/instructor/my-courses/:id", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const [existing] = await db.select().from(instructorCourses).where(and(eq(instructorCourses.id, req.params.id), eq(instructorCourses.instructorId, userId)));
      if (!existing) return res.status(404).json({ message: "Curso no encontrado" });
      await db.delete(instructorCourses).where(eq(instructorCourses.id, req.params.id));
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  app.get("/api/instructor/courses/:courseId/modules", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const [course] = await db.select().from(courses).where(and(eq(courses.id, req.params.courseId), eq(courses.instructorId, userId)));
      if (!course) return res.status(404).json({ message: "Curso no encontrado o no autorizado" });

      const modules = await db.select().from(courseModules).where(eq(courseModules.courseId, course.id)).orderBy(courseModules.order);
      res.json({ course, modules });
    } catch (err) { next(err); }
  });

  const audioUploadDir = path.join(process.cwd(), "audio-cache");
  if (!fs.existsSync(audioUploadDir)) fs.mkdirSync(audioUploadDir, { recursive: true });
  const audioUpload = multer({
    storage: multer.diskStorage({
      destination: audioUploadDir,
      filename: (_req: any, file: Express.Multer.File, cb: any) => {
        const ext = path.extname(file.originalname);
        const name = `instructor_${Date.now()}${ext}`;
        cb(null, name);
      },
    }),
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
      const allowed = [".mp3", ".wav", ".m4a", ".ogg", ".webm"];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.includes(ext)) cb(null, true);
      else cb(new Error("Solo se permiten archivos de audio (mp3, wav, m4a, ogg, webm)"));
    },
  });

  app.post("/api/instructor/courses/:courseId/modules/:moduleId/audio", requireAuth, requireInstructor, audioUpload.single("audio"), async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { courseId, moduleId } = req.params;

      const [course] = await db.select().from(courses).where(and(eq(courses.id, courseId), eq(courses.instructorId, userId)));
      if (!course) return res.status(403).json({ message: "No autorizado para este curso" });

      const [mod] = await db.select().from(courseModules).where(and(eq(courseModules.id, moduleId), eq(courseModules.courseId, courseId)));
      if (!mod) return res.status(404).json({ message: "Módulo no encontrado" });

      if (!req.file) return res.status(400).json({ message: "No se proporcionó archivo de audio" });

      const newAudioUrl = req.file.filename;

      await db.update(courseModules).set({ audioUrl: newAudioUrl }).where(eq(courseModules.id, moduleId));

      res.json({ success: true, audioUrl: newAudioUrl, message: "Audio reemplazado exitosamente" });
    } catch (err) { next(err); }
  });

  app.delete("/api/instructor/courses/:courseId/modules/:moduleId/audio", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { courseId, moduleId } = req.params;

      const [course] = await db.select().from(courses).where(and(eq(courses.id, courseId), eq(courses.instructorId, userId)));
      if (!course) return res.status(403).json({ message: "No autorizado para este curso" });

      const [mod] = await db.select().from(courseModules).where(and(eq(courseModules.id, moduleId), eq(courseModules.courseId, courseId)));
      if (!mod) return res.status(404).json({ message: "Módulo no encontrado" });

      if (mod.audioUrl) {
        const filePath = path.join(audioUploadDir, mod.audioUrl);
        if (fs.existsSync(filePath) && mod.audioUrl.startsWith("instructor_")) {
          fs.unlinkSync(filePath);
        }
      }

      await db.update(courseModules).set({ audioUrl: null }).where(eq(courseModules.id, moduleId));
      res.json({ success: true, message: "Audio eliminado" });
    } catch (err) { next(err); }
  });

  app.patch("/api/instructor/courses/:courseId/modules/:moduleId/content", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { courseId, moduleId } = req.params;
      const { contentHtml } = req.body;

      const [course] = await db.select().from(courses).where(and(eq(courses.id, courseId), eq(courses.instructorId, userId)));
      if (!course) return res.status(403).json({ message: "No autorizado para este curso" });

      const [mod] = await db.select().from(courseModules).where(and(eq(courseModules.id, moduleId), eq(courseModules.courseId, courseId)));
      if (!mod) return res.status(404).json({ message: "Módulo no encontrado" });

      if (typeof contentHtml !== "string") return res.status(400).json({ message: "Contenido inválido" });
      if (contentHtml.length > 500000) return res.status(400).json({ message: "Contenido demasiado largo" });

      const cleanHtml = sanitizeHtml(contentHtml, {
        allowedTags: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "ul", "ol", "li", "strong", "b", "em", "i", "u", "blockquote", "a", "span", "div", "table", "thead", "tbody", "tr", "th", "td", "hr", "sub", "sup"],
        allowedAttributes: { a: ["href", "target", "rel"], span: ["class"], div: ["class"] },
        allowedSchemes: ["http", "https"],
      });

      await db.update(courseModules).set({ contentHtml: cleanHtml }).where(eq(courseModules.id, moduleId));
      res.json({ success: true, message: "Contenido actualizado" });
    } catch (err) { next(err); }
  });

  app.get("/api/instructor/commissions", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const instructorCoursesData = await db.select().from(courses).where(eq(courses.instructorId, userId));
      const courseIds = instructorCoursesData.map(c => c.id);

      let totalDc3 = 0;
      let totalSep = 0;
      for (const cid of courseIds) {
        const [dc3Count] = await db.select({ count: count() }).from(certificateRequests).where(
          and(eq(certificateRequests.courseId, cid), eq(certificateRequests.certType, "dc3"), eq(certificateRequests.status, "emitido"))
        );
        const [sepCount] = await db.select({ count: count() }).from(certificateRequests).where(
          and(eq(certificateRequests.courseId, cid), eq(certificateRequests.certType, "sep"), eq(certificateRequests.status, "emitido"))
        );
        totalDc3 += dc3Count?.count || 0;
        totalSep += sepCount?.count || 0;
      }

      const [profileRow] = await db.select().from(instructorProfiles).where(eq(instructorProfiles.id, userId));
      const commissionRate = parseFloat(profileRow?.commissionRate || "15") / 100;

      let totalEnrolled = 0;
      for (const cid of courseIds) {
        const [enrolled] = await db.select({ count: count() }).from(courseUsers).where(eq(courseUsers.courseId, cid));
        totalEnrolled += enrolled?.count || 0;
      }

      const DC3_PRICE = 399;
      const SEP_PRICE = 1999;
      const DC3_COMMISSION_PCT = 0.40;
      const SEP_COMMISSION_PCT = 0.10;
      const REFERRAL_PER_COMPANY = 500;

      const dc3Commission = Math.round(totalDc3 * DC3_PRICE * DC3_COMMISSION_PCT);
      const sepCommission = Math.round(totalSep * SEP_PRICE * SEP_COMMISSION_PCT);
      const residualBase = totalEnrolled * 200;
      const residualCommission = Math.round(residualBase * commissionRate);
      const referralCommission = 0;

      res.json({
        commissionRate: parseFloat(profileRow?.commissionRate || "15"),
        totalDc3,
        totalSep,
        dc3Commission,
        dc3CommissionPct: DC3_COMMISSION_PCT * 100,
        dc3Price: DC3_PRICE,
        sepCommission,
        sepCommissionPct: SEP_COMMISSION_PCT * 100,
        sepPrice: SEP_PRICE,
        residualCommission,
        referralCommission,
        totalCommission: dc3Commission + sepCommission + residualCommission + referralCommission,
        totalEnrolled,
        courseBreakdown: instructorCoursesData.map(c => ({
          courseId: c.id,
          title: c.title,
        })),
      });
    } catch (err) { next(err); }
  });

  app.get("/api/instructor/certificates", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const instructorCoursesData = await db.select().from(courses).where(eq(courses.instructorId, userId));
      const courseIds = instructorCoursesData.map(c => c.id);

      if (courseIds.length === 0) return res.json([]);

      const certs = await db.select({
        cert: certificateRequests,
        user: users,
        profile: profiles,
      })
        .from(certificateRequests)
        .innerJoin(users, eq(certificateRequests.userId, users.id))
        .leftJoin(profiles, eq(certificateRequests.userId, profiles.id))
        .where(inArray(certificateRequests.courseId, courseIds))
        .orderBy(desc(certificateRequests.createdAt));

      const courseMap = new Map(instructorCoursesData.map(c => [c.id, c.title]));

      res.json(certs.map(r => ({
        id: r.cert.id,
        type: r.cert.certType,
        status: r.cert.status,
        studentName: r.profile?.fullName || r.user.email,
        studentEmail: r.user.email,
        courseTitle: courseMap.get(r.cert.courseId) || "Curso desconocido",
        createdAt: r.cert.createdAt,
      })));
    } catch (err) { next(err); }
  });

  app.get("/api/instructor/analytics", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const instructorCoursesData = await db.select().from(courses).where(eq(courses.instructorId, userId));
      const courseIds = instructorCoursesData.map(c => c.id);

      const courseAnalytics = [];
      for (const course of instructorCoursesData) {
        const [enrolled] = await db.select({ count: count() }).from(courseUsers).where(eq(courseUsers.courseId, course.id));
        const [completed] = await db.select({ count: count() }).from(courseUsers).where(
          and(eq(courseUsers.courseId, course.id), eq(courseUsers.completed, 100))
        );
        const [avgRow] = await db.select({ avg: sql<number>`COALESCE(AVG(${courseUsers.completed}), 0)` })
          .from(courseUsers).where(eq(courseUsers.courseId, course.id));
        const [certCount] = await db.select({ count: count() }).from(certificateRequests).where(
          and(eq(certificateRequests.courseId, course.id), eq(certificateRequests.status, "emitido"))
        );

        courseAnalytics.push({
          courseId: course.id,
          title: course.title,
          slug: course.slug,
          enrolledCount: enrolled?.count || 0,
          completedCount: completed?.count || 0,
          completionRate: enrolled?.count ? Math.round(((completed?.count || 0) / enrolled.count) * 100) : 0,
          avgProgress: Math.round(avgRow?.avg || 0),
          certificates: certCount?.count || 0,
        });
      }

      const totalEnrolled = courseAnalytics.reduce((s, c) => s + c.enrolledCount, 0);
      const totalCompleted = courseAnalytics.reduce((s, c) => s + c.completedCount, 0);
      const totalCerts = courseAnalytics.reduce((s, c) => s + c.certificates, 0);
      const overallCompletionRate = totalEnrolled ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

      res.json({
        summary: {
          totalCourses: instructorCoursesData.length,
          totalEnrolled,
          totalCompleted,
          totalCertificates: totalCerts,
          overallCompletionRate,
        },
        courses: courseAnalytics,
      });
    } catch (err) { next(err); }
  });

  // ==================== HEYGEN DIGITAL TWIN ====================

  app.get("/api/heygen/status", requireAuth, async (req, res) => {
    res.json({ configured: heygenService.isConfigured });
  });

  app.get("/api/heygen/voices", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      if (!heygenService.isConfigured) {
        return res.json({ voices: [] });
      }
      const data = await heygenService.listVoices();
      const voices = data?.data?.voices || data?.voices || [];
      const spanishVoices = voices.filter((v: any) =>
        v.language?.toLowerCase().includes("spanish") || v.language?.toLowerCase().includes("es")
      );
      res.json(spanishVoices);
    } catch (err) {
      console.error("[heygen/voices] Error fetching voices:", err);
      res.json([]);
    }
  });

  app.get("/api/heygen/avatar/me", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const [avatar] = await db.select().from(instructorAvatars).where(eq(instructorAvatars.instructorId, userId));
      res.json({ avatar: avatar || null, hasAvatar: !!avatar, heygenConfigured: heygenService.isConfigured });
    } catch (err) { next(err); }
  });

  const registerAvatarSchema = z.object({
    heygen_avatar_id: z.string().min(3).max(200),
    heygen_voice_id: z.string().min(3).max(200),
    consent_accepted: z.literal(true, { errorMap: () => ({ message: "Debes aceptar el consentimiento" }) }),
  });

  const generateModuleVideoSchema = z.object({
    course_id: z.string().min(1),
    module_id: z.string().min(1),
    script_text: z.string().min(50, "El guión debe tener al menos 50 caracteres").max(10000),
    title: z.string().optional(),
  });

  app.post("/api/heygen/avatar/register", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const parsed = registerAvatarSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message || "Datos inválidos" });
      }
      const { heygen_avatar_id, heygen_voice_id } = parsed.data;

      const existing = await db.select().from(instructorAvatars).where(eq(instructorAvatars.instructorId, userId));
      if (existing.length > 0) {
        await db.update(instructorAvatars).set({
          heygenAvatarId: heygen_avatar_id,
          heygenVoiceId: heygen_voice_id,
          avatarStatus: "ready",
          voiceStatus: "ready",
          consentAccepted: true,
          consentAcceptedAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(instructorAvatars.instructorId, userId));
        const [updated] = await db.select().from(instructorAvatars).where(eq(instructorAvatars.instructorId, userId));
        return res.json({ success: true, message: "Digital Twin actualizado", avatar: updated });
      }

      const [avatar] = await db.insert(instructorAvatars).values({
        instructorId: userId,
        heygenAvatarId: heygen_avatar_id,
        heygenVoiceId: heygen_voice_id,
        avatarStatus: "ready",
        voiceStatus: "ready",
        consentAccepted: true,
        consentAcceptedAt: new Date(),
      }).returning();

      res.json({ success: true, message: "Digital Twin registrado exitosamente", avatar });
    } catch (err) { next(err); }
  });

  const twinVideoUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });

  app.post("/api/heygen/avatar/upload-consent", requireAuth, requireInstructor, twinVideoUpload.single("video"), async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No se recibió el video" });
      if (!r2Storage.isConfigured) return res.status(503).json({ message: "Almacenamiento no configurado" });

      const userId = req.supabaseUserId!;
      const r2Key = `avatars/instructor-${userId}/consent-${Date.now()}.webm`;
      const r2Url = await r2Storage.uploadBuffer(req.file.buffer, r2Key, "video/webm");

      const existing = await db.select().from(instructorAvatars).where(eq(instructorAvatars.instructorId, userId));
      if (existing.length > 0) {
        await db.update(instructorAvatars).set({
          consentVideoR2Url: r2Url,
          consentVideoR2Key: r2Key,
          consentAccepted: true,
          consentAcceptedAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(instructorAvatars.instructorId, userId));
      } else {
        await db.insert(instructorAvatars).values({
          instructorId: userId,
          consentVideoR2Url: r2Url,
          consentVideoR2Key: r2Key,
          consentAccepted: true,
          consentAcceptedAt: new Date(),
        });
      }

      res.json({ success: true, url: r2Url });
    } catch (err) { next(err); }
  });

  app.post("/api/heygen/avatar/upload-training", requireAuth, requireInstructor, twinVideoUpload.single("video"), async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No se recibió el video" });
      if (!r2Storage.isConfigured) return res.status(503).json({ message: "Almacenamiento no configurado" });

      const userId = req.supabaseUserId!;
      const r2Key = `avatars/instructor-${userId}/training-${Date.now()}.webm`;
      const r2Url = await r2Storage.uploadBuffer(req.file.buffer, r2Key, "video/webm");

      const existing = await db.select().from(instructorAvatars).where(eq(instructorAvatars.instructorId, userId));
      if (existing.length > 0) {
        await db.update(instructorAvatars).set({
          trainingVideoR2Url: r2Url,
          trainingVideoR2Key: r2Key,
          updatedAt: new Date(),
        }).where(eq(instructorAvatars.instructorId, userId));
      } else {
        await db.insert(instructorAvatars).values({
          instructorId: userId,
          trainingVideoR2Url: r2Url,
          trainingVideoR2Key: r2Key,
        });
      }

      res.json({ success: true, url: r2Url });
    } catch (err) { next(err); }
  });

  app.post("/api/heygen/avatar/create-twin", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      if (!heygenService.isConfigured) return res.status(503).json({ message: "HeyGen API no configurada" });

      const userId = req.supabaseUserId!;
      const [avatar] = await db.select().from(instructorAvatars).where(eq(instructorAvatars.instructorId, userId));
      if (!avatar?.consentVideoR2Url || !avatar?.trainingVideoR2Url) {
        return res.status(400).json({ message: "Debes grabar el video de consentimiento y el video de entrenamiento primero" });
      }

      const [userRow] = await db.select().from(users).where(eq(users.id, userId));
      const instructorName = userRow?.fullName || userRow?.email?.split("@")[0] || "Instructor";

      const twinResult = await heygenService.createDigitalTwin(
        avatar.trainingVideoR2Url,
        avatar.consentVideoR2Url,
        `Ceduverse - ${instructorName}`
      );

      let voiceResult = { voice_id: "" };
      try {
        voiceResult = await heygenService.cloneVoice(
          avatar.trainingVideoR2Url,
          `Ceduverse Voice - ${instructorName}`
        );
      } catch (e) {
        console.error("Voice clone failed (non-blocking):", e);
      }

      await db.update(instructorAvatars).set({
        heygenAvatarId: twinResult.avatar_id,
        heygenVoiceId: voiceResult.voice_id || null,
        heygenCreationRequestId: twinResult.request_id,
        avatarStatus: "processing",
        voiceStatus: voiceResult.voice_id ? "processing" : "pending",
        processingStartedAt: new Date(),
        processingError: null,
        updatedAt: new Date(),
      }).where(eq(instructorAvatars.instructorId, userId));

      res.json({
        success: true,
        message: "Tu Digital Twin está siendo creado. Esto puede tomar 5-30 minutos.",
        avatar_id: twinResult.avatar_id,
      });
    } catch (err: any) {
      const userId = req.supabaseUserId!;
      const detailedError = err.message || "Error desconocido";
      console.error("[create-twin] Error creating Digital Twin:", detailedError, err);
      await db.update(instructorAvatars).set({
        avatarStatus: "failed",
        processingError: detailedError,
        updatedAt: new Date(),
      }).where(eq(instructorAvatars.instructorId, userId));
      res.status(500).json({ message: detailedError, success: false });
    }
  });

  app.get("/api/heygen/avatar/creation-status", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const [avatar] = await db.select().from(instructorAvatars).where(eq(instructorAvatars.instructorId, userId));

      if (!avatar?.heygenAvatarId) {
        return res.json({ status: "not_started" });
      }

      if (avatar.avatarStatus === "ready") {
        return res.json({ status: "ready", avatar_id: avatar.heygenAvatarId });
      }

      try {
        const heygenStatus = await heygenService.checkDigitalTwinStatus(avatar.heygenAvatarId);

        if (heygenStatus.status === "complete" && avatar.avatarStatus !== "ready") {
          await db.update(instructorAvatars).set({
            avatarStatus: "ready",
            voiceStatus: "ready",
            updatedAt: new Date(),
          }).where(eq(instructorAvatars.instructorId, userId));
          return res.json({ status: "ready", avatar_id: avatar.heygenAvatarId });
        } else if (heygenStatus.status === "failed") {
          await db.update(instructorAvatars).set({
            avatarStatus: "failed",
            processingError: heygenStatus.error || "Error desconocido en HeyGen",
            updatedAt: new Date(),
          }).where(eq(instructorAvatars.instructorId, userId));
          return res.json({ status: "failed", error: heygenStatus.error });
        }

        res.json({
          status: heygenStatus.status,
          avatar_id: avatar.heygenAvatarId,
          started_at: avatar.processingStartedAt,
        });
      } catch {
        res.json({
          status: avatar.avatarStatus,
          avatar_id: avatar.heygenAvatarId,
          started_at: avatar.processingStartedAt,
        });
      }
    } catch (err) { next(err); }
  });

  app.get("/api/heygen/debug/test-r2-urls", requireAuth, requireSuperadmin, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const targetUserId = (req.query.userId as string) || userId;
      const [avatar] = await db.select().from(instructorAvatars).where(eq(instructorAvatars.instructorId, targetUserId));
      if (!avatar) return res.json({ message: "No avatar record found", userId: targetUserId });

      const results: Record<string, any> = {
        userId: targetUserId,
        consentVideoR2Url: avatar.consentVideoR2Url || null,
        trainingVideoR2Url: avatar.trainingVideoR2Url || null,
        avatarStatus: avatar.avatarStatus,
        consentUrlAccessible: false,
        trainingUrlAccessible: false,
      };

      if (avatar.consentVideoR2Url) {
        try {
          const headRes = await fetch(avatar.consentVideoR2Url, { method: "HEAD" });
          results.consentUrlAccessible = headRes.ok;
          results.consentUrlStatus = headRes.status;
          results.consentUrlContentType = headRes.headers.get("content-type");
        } catch (e: any) {
          results.consentUrlError = e.message;
        }
      }

      if (avatar.trainingVideoR2Url) {
        try {
          const headRes = await fetch(avatar.trainingVideoR2Url, { method: "HEAD" });
          results.trainingUrlAccessible = headRes.ok;
          results.trainingUrlStatus = headRes.status;
          results.trainingUrlContentType = headRes.headers.get("content-type");
        } catch (e: any) {
          results.trainingUrlError = e.message;
        }
      }

      res.json(results);
    } catch (err) { next(err); }
  });

  app.post("/api/heygen/avatar/regenerate", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const [avatar] = await db.select().from(instructorAvatars).where(eq(instructorAvatars.instructorId, userId));

      if (avatar?.heygenAvatarId) {
        try { await heygenService.deleteDigitalTwin(avatar.heygenAvatarId); } catch {}
      }

      await db.update(instructorAvatars).set({
        heygenAvatarId: null,
        heygenVoiceId: null,
        avatarStatus: "pending",
        voiceStatus: "pending",
        processingError: null,
        consentVideoR2Url: null,
        trainingVideoR2Url: null,
        consentVideoR2Key: null,
        trainingVideoR2Key: null,
        heygenCreationRequestId: null,
        processingStartedAt: null,
        updatedAt: new Date(),
      }).where(eq(instructorAvatars.instructorId, userId));

      res.json({ success: true, message: "Puedes grabar tu Digital Twin de nuevo" });
    } catch (err) { next(err); }
  });

  const avatarPreferencesSchema = z.object({
    avatarStyle: z.enum(["normal", "circle", "closeUp"]).optional(),
    backgroundType: z.enum(["color", "image"]).optional(),
    backgroundColor: z.string().optional(),
    backgroundImageUrl: z.string().url().optional().or(z.literal("")),
    voiceSpeed: z.number().min(0.5).max(2.0).optional(),
    orientation: z.enum(["landscape", "portrait", "square"]).optional(),
    selectedVoiceId: z.string().optional(),
    useClonedVoice: z.boolean().optional(),
  });

  app.patch("/api/heygen/avatar/preferences", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const parsed = avatarPreferencesSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message || "Datos inválidos" });
      }

      const [avatar] = await db.select().from(instructorAvatars).where(eq(instructorAvatars.instructorId, userId));
      if (!avatar) {
        return res.status(404).json({ message: "No tienes un registro de Digital Twin" });
      }

      const currentPrefs = avatar.avatarPreferences || {};
      const newPrefs = { ...currentPrefs, ...parsed.data };
      if (newPrefs.backgroundImageUrl === "") delete newPrefs.backgroundImageUrl;

      await db.update(instructorAvatars).set({
        avatarPreferences: newPrefs,
        updatedAt: new Date(),
      }).where(eq(instructorAvatars.instructorId, userId));

      const [updated] = await db.select().from(instructorAvatars).where(eq(instructorAvatars.instructorId, userId));
      res.json({ success: true, avatar: updated });
    } catch (err) { next(err); }
  });

  app.post("/api/heygen/avatar/generate-preview", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      if (!heygenService.isConfigured) {
        return res.status(503).json({ message: "HeyGen API no configurada" });
      }
      const userId = req.supabaseUserId!;
      const [avatar] = await db.select().from(instructorAvatars).where(eq(instructorAvatars.instructorId, userId));
      if (!avatar || avatar.avatarStatus !== "ready") {
        return res.status(400).json({ message: "Primero debes registrar tu Digital Twin" });
      }

      const [userRow] = await db.select().from(users).where(eq(users.id, userId));
      const instructorName = userRow?.fullName || userRow?.email?.split("@")[0] || "Instructor";

      const previewScript = `Hola, soy ${instructorName}, o mejor dicho, soy tu gemelo digital. ` +
        `Probablemente te preguntes qué es un gemelo digital. Déjame explicarte: gracias a la inteligencia artificial de HeyGen, ` +
        `se ha creado una réplica digital de mi apariencia y mi voz. Esto significa que puedo generar videolecciones de forma automática ` +
        `para cada módulo de mis cursos, sin necesidad de grabar cada video manualmente. ` +
        `Además, mis estudiantes pueden tener sesiones de tutoría en vivo conmigo, bueno, con mi gemelo digital, ` +
        `a través de LiveAvatar. Es como tener una clase particular con tu instructor disponible cuando la necesites. ` +
        `Te invito a crear tu primer curso conmigo en Ceduverse. ¡Será una experiencia increíble de aprendizaje!`;

      const prefs = avatar.avatarPreferences || {};
      const voiceId = (!prefs.useClonedVoice && prefs.selectedVoiceId)
        ? prefs.selectedVoiceId
        : avatar.heygenVoiceId!;

      const result = await heygenService.generateAvatarVideo(
        avatar.heygenAvatarId!,
        voiceId,
        previewScript,
        `Preview - ${instructorName}`,
        prefs
      );

      if (result.data?.video_id) {
        await db.insert(heygenVideoJobs).values({
          instructorId: userId,
          heygenVideoId: result.data.video_id,
          jobStatus: "processing",
          scriptText: previewScript,
        });

        await db.update(instructorAvatars).set({
          previewVideoId: result.data.video_id,
          updatedAt: new Date(),
        }).where(eq(instructorAvatars.instructorId, userId));

        return res.json({ success: true, video_id: result.data.video_id, message: "Video de presentación en generación (~60 segundos)" });
      }

      res.status(500).json({ message: "No se pudo iniciar la generación del video" });
    } catch (err) { next(err); }
  });

  app.post("/api/heygen/video/generate-module", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      if (!heygenService.isConfigured) {
        return res.status(503).json({ message: "HeyGen API no configurada" });
      }
      const userId = req.supabaseUserId!;
      const parsed = generateModuleVideoSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message || "Datos inválidos" });
      }
      const { course_id, module_id, script_text, title } = parsed.data;

      const [avatar] = await db.select().from(instructorAvatars).where(eq(instructorAvatars.instructorId, userId));
      if (!avatar || avatar.avatarStatus !== "ready") {
        return res.status(400).json({ message: "No tienes un Digital Twin activo" });
      }

      const prefs = avatar.avatarPreferences || {};
      const voiceId = (!prefs.useClonedVoice && prefs.selectedVoiceId)
        ? prefs.selectedVoiceId
        : avatar.heygenVoiceId!;

      const result = await heygenService.generateAvatarVideo(
        avatar.heygenAvatarId!,
        voiceId,
        script_text,
        `${title || "Módulo"} - Curso ${course_id}`,
        prefs
      );

      if (result.data?.video_id) {
        await db.insert(heygenVideoJobs).values({
          instructorId: userId,
          courseId: course_id,
          moduleId: module_id,
          heygenVideoId: result.data.video_id,
          jobStatus: "processing",
          scriptText: script_text,
        });
        return res.json({ success: true, video_id: result.data.video_id, message: "Video del módulo en generación" });
      }

      res.status(500).json({ message: "No se pudo iniciar la generación" });
    } catch (err) { next(err); }
  });

  app.get("/api/heygen/video/status/:videoId", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      if (!heygenService.isConfigured) {
        return res.status(503).json({ message: "HeyGen API no configurada" });
      }
      const userId = req.supabaseUserId!;
      const { videoId } = req.params;

      const [job] = await db.select().from(heygenVideoJobs).where(
        and(eq(heygenVideoJobs.heygenVideoId, videoId), eq(heygenVideoJobs.instructorId, userId))
      );
      if (!job) return res.status(404).json({ message: "Video no encontrado" });

      const status = await heygenService.getVideoStatus(videoId);

      if (status.data?.status === "completed") {
        await db.update(heygenVideoJobs).set({
          jobStatus: "completed",
          videoUrl: status.data.video_url,
          videoDurationSeconds: Math.round(status.data.duration || 0),
          completedAt: new Date(),
        }).where(eq(heygenVideoJobs.heygenVideoId, videoId));

        if (job.moduleId && job.courseId) {
          await db.update(courseModules).set({
            heygenVideoUrl: status.data.video_url,
            heygenVideoId: videoId,
            videoStatus: "completed",
          }).where(and(eq(courseModules.id, job.moduleId), eq(courseModules.courseId, job.courseId)));
        }

        if (!job.moduleId && !job.courseId && job.instructorId) {
          const [avatarRow] = await db.select().from(instructorAvatars).where(eq(instructorAvatars.instructorId, job.instructorId));
          if (avatarRow?.previewVideoId === videoId) {
            await db.update(instructorAvatars).set({
              previewVideoUrl: status.data.video_url,
              updatedAt: new Date(),
            }).where(eq(instructorAvatars.instructorId, job.instructorId));
          }
        }
      } else if (status.data?.status === "failed") {
        await db.update(heygenVideoJobs).set({
          jobStatus: "failed",
          errorMessage: status.data.error || "Error desconocido",
        }).where(eq(heygenVideoJobs.heygenVideoId, videoId));
      }

      res.json(status);
    } catch (err) { next(err); }
  });

  app.get("/api/heygen/video/module/:courseId/:moduleId", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { courseId, moduleId } = req.params;
      const jobs = await db.select().from(heygenVideoJobs).where(
        and(
          eq(heygenVideoJobs.courseId, courseId),
          eq(heygenVideoJobs.moduleId, moduleId),
          eq(heygenVideoJobs.instructorId, userId),
          eq(heygenVideoJobs.jobStatus, "completed")
        )
      ).orderBy(desc(heygenVideoJobs.createdAt)).limit(1);
      res.json({ video: jobs[0] || null });
    } catch (err) { next(err); }
  });

  app.get("/api/heygen/jobs", requireAuth, requireInstructor, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const jobs = await db.select().from(heygenVideoJobs)
        .where(eq(heygenVideoJobs.instructorId, userId))
        .orderBy(desc(heygenVideoJobs.createdAt))
        .limit(50);
      res.json(jobs);
    } catch (err) { next(err); }
  });

  app.post("/api/heygen/webhook", async (req, res) => {
    const { event_type, data } = req.body;
    if (!event_type || !data?.video_id) return res.status(400).json({ message: "Invalid payload" });

    const [job] = await db.select().from(heygenVideoJobs).where(eq(heygenVideoJobs.heygenVideoId, data.video_id));
    if (!job) return res.status(404).json({ message: "Unknown video_id" });

    if (event_type === "avatar_video.success") {
      await db.update(heygenVideoJobs).set({
        jobStatus: "completed",
        videoUrl: data.video_url,
        videoDurationSeconds: Math.round(data.duration || 0),
        completedAt: new Date(),
      }).where(eq(heygenVideoJobs.heygenVideoId, data.video_id));

      if (job.moduleId && job.courseId) {
        await db.update(courseModules).set({
          heygenVideoUrl: data.video_url,
          heygenVideoId: data.video_id,
          videoStatus: "completed",
        }).where(and(eq(courseModules.id, job.moduleId), eq(courseModules.courseId, job.courseId)));
      }

      if (!job.moduleId && !job.courseId && job.instructorId) {
        const [avatarRow] = await db.select().from(instructorAvatars).where(eq(instructorAvatars.instructorId, job.instructorId));
        if (avatarRow?.previewVideoId === data.video_id) {
          await db.update(instructorAvatars).set({
            previewVideoUrl: data.video_url,
            updatedAt: new Date(),
          }).where(eq(instructorAvatars.instructorId, job.instructorId));
        }
      }
    }

    if (event_type === "avatar_video.fail") {
      await db.update(heygenVideoJobs).set({
        jobStatus: "failed",
        errorMessage: data.error || "Error en generación de video",
      }).where(eq(heygenVideoJobs.heygenVideoId, data.video_id));
    }

    res.json({ received: true });
  });

  app.get("/api/heygen/usage", requireAuth, requireSuperadmin, async (req, res, next) => {
    try {
      const jobs = await db.select().from(heygenVideoJobs);
      const completed = jobs.filter(j => j.jobStatus === "completed");
      const totalDuration = completed.reduce((sum, j) => sum + (j.videoDurationSeconds || 0), 0);
      const totalCredits = completed.reduce((sum, j) => sum + (j.creditsConsumed || 0), 0);
      const avatars = await db.select().from(instructorAvatars);

      res.json({
        total_videos_generated: completed.length,
        total_duration_minutes: Math.round(totalDuration / 60),
        total_credits_consumed: totalCredits,
        estimated_monthly_cost_usd: totalCredits * 0.5,
        jobs_pending: jobs.filter(j => j.jobStatus === "processing").length,
        jobs_failed: jobs.filter(j => j.jobStatus === "failed").length,
        total_avatars: avatars.length,
        avatars_ready: avatars.filter(a => a.avatarStatus === "ready").length,
      });
    } catch (err) { next(err); }
  });

  // ==================== LIVEAVATAR (TUTOR IA EN VIVO) ====================

  app.post("/api/liveavatar/token", requireAuth, async (_req, res, next) => {
    try {
      if (!liveAvatarService.isConfigured) return res.status(503).json({ message: "LiveAvatar no está configurado" });
      const token = await liveAvatarService.getSessionToken();
      res.json({ token });
    } catch (err) { next(err); }
  });

  app.post("/api/liveavatar/session", requireAuth, async (req, res, next) => {
    try {
      const schema = z.object({ courseId: z.string(), instructorId: z.string().uuid() });
      const { courseId, instructorId } = schema.parse(req.body);
      const userId = req.supabaseUserId!;

      const session = await db.insert(liveAvatarSessions).values({
        studentId: userId,
        instructorId,
        courseId,
        sessionStatus: "active",
        startedAt: new Date(),
      }).returning();

      res.json(session[0]);
    } catch (err) { next(err); }
  });

  app.post("/api/liveavatar/chat", requireAuth, async (req, res, next) => {
    try {
      const schema = z.object({
        sessionId: z.string().uuid(),
        question: z.string().min(1).max(2000),
        courseTitle: z.string().optional(),
      });
      const { sessionId, question, courseTitle } = schema.parse(req.body);
      const userId = req.supabaseUserId!;

      const [session] = await db.select().from(liveAvatarSessions)
        .where(and(eq(liveAvatarSessions.id, sessionId), eq(liveAvatarSessions.studentId, userId)));
      if (!session) return res.status(404).json({ message: "Sesión no encontrada" });

      await db.insert(liveAvatarMessages).values({ sessionId, role: "user", content: question });

      const history = await db.select().from(liveAvatarMessages)
        .where(eq(liveAvatarMessages.sessionId, sessionId));

      const courseContext = await tutorAIService.getCourseContext(session.courseId);
      const answer = await tutorAIService.generateResponse(
        question, courseTitle || "Curso de Capacitación", courseContext,
        history.map(m => ({ role: m.role, content: m.content }))
      );

      await db.insert(liveAvatarMessages).values({ sessionId, role: "assistant", content: answer });
      await db.update(liveAvatarSessions)
        .set({ messagesCount: sql`${liveAvatarSessions.messagesCount} + 2` })
        .where(eq(liveAvatarSessions.id, sessionId));

      res.json({ answer });
    } catch (err) { next(err); }
  });

  app.post("/api/liveavatar/end", requireAuth, async (req, res, next) => {
    try {
      const { sessionId } = z.object({ sessionId: z.string().uuid() }).parse(req.body);
      const userId = req.supabaseUserId!;

      const [session] = await db.select().from(liveAvatarSessions)
        .where(and(eq(liveAvatarSessions.id, sessionId), eq(liveAvatarSessions.studentId, userId)));
      if (!session) return res.status(404).json({ message: "Sesión no encontrada" });

      const durationSeconds = session.startedAt
        ? Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000)
        : 0;

      await db.update(liveAvatarSessions).set({
        sessionStatus: "completed",
        endedAt: new Date(),
        durationSeconds,
      }).where(eq(liveAvatarSessions.id, sessionId));

      res.json({ success: true, durationSeconds });
    } catch (err) { next(err); }
  });

  app.get("/api/liveavatar/history/:courseId", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const courseId = req.params.courseId;
      const sessions = await db.select().from(liveAvatarSessions)
        .where(and(eq(liveAvatarSessions.studentId, userId), eq(liveAvatarSessions.courseId, courseId)))
        .orderBy(desc(liveAvatarSessions.createdAt));
      res.json(sessions);
    } catch (err) { next(err); }
  });

  // ==================== PRIVATE SESSIONS (DAILY.CO) ====================

  app.get("/api/instructor-session-config/:instructorId", requireAuth, async (req, res, next) => {
    try {
      const instructorId = req.params.instructorId;
      const [config] = await db.select().from(instructorSessionConfig)
        .where(eq(instructorSessionConfig.instructorId, instructorId));
      res.json(config || null);
    } catch (err) { next(err); }
  });

  app.put("/api/instructor-session-config", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const acct = await db.select().from(accounts).where(eq(accounts.userId, userId));
      if (!acct.length || (!acct[0].isInstructor && acct[0].userRole !== "socio_instructor" && !["admin", "superadmin"].includes(acct[0].userRole))) return res.status(403).json({ message: "Solo instructores" });

      const schema = z.object({
        acceptsPrivateSessions: z.boolean(),
        sessionTypes: z.array(z.object({
          name: z.string(),
          durationMinutes: z.number().min(15).max(240),
          priceMxn: z.number().min(0),
          description: z.string().optional(),
        })).optional(),
        bioForSessions: z.string().max(1000).optional(),
        specialties: z.array(z.string()).optional(),
      });
      const data = schema.parse(req.body);

      const [existing] = await db.select().from(instructorSessionConfig)
        .where(eq(instructorSessionConfig.instructorId, userId));

      if (existing) {
        const [updated] = await db.update(instructorSessionConfig)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(instructorSessionConfig.instructorId, userId))
          .returning();
        res.json(updated);
      } else {
        const [created] = await db.insert(instructorSessionConfig)
          .values({ instructorId: userId, ...data })
          .returning();
        res.json(created);
      }
    } catch (err) { next(err); }
  });

  app.get("/api/instructor-availability/:instructorId", requireAuth, async (req, res, next) => {
    try {
      const slots = await db.select().from(instructorAvailability)
        .where(and(
          eq(instructorAvailability.instructorId, req.params.instructorId),
          eq(instructorAvailability.isActive, true)
        ));
      res.json(slots);
    } catch (err) { next(err); }
  });

  app.put("/api/instructor-availability", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const acct = await db.select().from(accounts).where(eq(accounts.userId, userId));
      if (!acct.length || (!acct[0].isInstructor && acct[0].userRole !== "socio_instructor" && !["admin", "superadmin"].includes(acct[0].userRole))) return res.status(403).json({ message: "Solo instructores" });

      const schema = z.object({
        slots: z.array(z.object({
          dayOfWeek: z.number().min(0).max(6),
          startTime: z.string(),
          endTime: z.string(),
          timezone: z.string().optional(),
        })),
      });
      const { slots } = schema.parse(req.body);

      await db.delete(instructorAvailability).where(eq(instructorAvailability.instructorId, userId));

      if (slots.length > 0) {
        await db.insert(instructorAvailability).values(
          slots.map(s => ({ instructorId: userId, ...s }))
        );
      }

      const result = await db.select().from(instructorAvailability)
        .where(eq(instructorAvailability.instructorId, userId));
      res.json(result);
    } catch (err) { next(err); }
  });

  app.post("/api/private-sessions", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const acct = await db.select().from(accounts).where(eq(accounts.userId, userId));
      if (!acct.length || (!acct[0].isInstructor && acct[0].userRole !== "socio_instructor" && !["admin", "superadmin"].includes(acct[0].userRole))) return res.status(403).json({ message: "Solo instructores" });

      const schema = z.object({
        courseId: z.string().optional(),
        sessionType: z.string(),
        title: z.string().min(1).max(200),
        description: z.string().max(2000).optional(),
        scheduledDate: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        timezone: z.string().optional(),
        durationMinutes: z.number().min(15).max(240),
        priceMxn: z.number().min(0),
        maxStudents: z.number().min(1).max(50).optional(),
      });
      const data = schema.parse(req.body);

      const instructorPayout = +(data.priceMxn * 0.50).toFixed(2);
      const ceduverseCommission = +(data.priceMxn * 0.50).toFixed(2);

      if (!dailyService.isConfigured) return res.status(503).json({ message: "Videollamadas no configuradas" });

      const room = await dailyService.createRoom({
        isPrivate: true,
        maxParticipants: (data.maxStudents || 1) + 1,
        expiresInSeconds: 86400,
      });

      const ownerToken = await dailyService.createMeetingToken({
        roomName: room.name,
        userName: "Instructor",
        isOwner: true,
      });

      const [session] = await db.insert(privateSessions).values({
        instructorId: userId,
        courseId: data.courseId,
        sessionType: data.sessionType,
        title: data.title,
        description: data.description,
        scheduledDate: data.scheduledDate,
        startTime: data.startTime,
        endTime: data.endTime,
        timezone: data.timezone || "America/Monterrey",
        durationMinutes: data.durationMinutes,
        priceMxn: data.priceMxn.toString(),
        instructorPayoutMxn: instructorPayout.toString(),
        ceduverseCommissionMxn: ceduverseCommission.toString(),
        maxStudents: data.maxStudents || 1,
        dailyRoomName: room.name,
        dailyRoomUrl: room.url,
        dailyRoomToken: ownerToken,
        sessionStatus: "scheduled",
        createdBy: userId,
      }).returning();

      res.json(session);
    } catch (err) { next(err); }
  });

  app.get("/api/private-sessions", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const acct = await db.select().from(accounts).where(eq(accounts.userId, userId));
      const isInstructor = acct.length && (acct[0].isInstructor || acct[0].userRole === "socio_instructor" || ["admin", "superadmin"].includes(acct[0].userRole));

      let sessions;
      if (isInstructor) {
        sessions = await db.select().from(privateSessions)
          .where(eq(privateSessions.instructorId, userId))
          .orderBy(desc(privateSessions.createdAt));
      } else {
        const participations = await db.select().from(sessionParticipants)
          .where(eq(sessionParticipants.studentId, userId));
        const sessionIds = participations.map(p => p.sessionId);
        if (sessionIds.length === 0) return res.json([]);
        sessions = await db.select().from(privateSessions)
          .where(inArray(privateSessions.id, sessionIds))
          .orderBy(desc(privateSessions.createdAt));
      }
      const sanitized = sessions.map(s => {
        const { dailyRoomToken, ...safe } = s;
        return isInstructor && s.instructorId === userId ? s : safe;
      });
      res.json(sanitized);
    } catch (err) { next(err); }
  });

  app.get("/api/private-sessions/available", requireAuth, async (req, res, next) => {
    try {
      const sessions = await db.select().from(privateSessions)
        .where(eq(privateSessions.sessionStatus, "scheduled"))
        .orderBy(asc(privateSessions.scheduledDate));

      const sessionsWithInstructor = await Promise.all(sessions.map(async (s) => {
        const [user] = await db.select().from(users).where(eq(users.id, s.instructorId));
        const enrolled = await db.select({ count: count() }).from(sessionParticipants)
          .where(eq(sessionParticipants.sessionId, s.id));
        return {
          ...s,
          dailyRoomToken: undefined,
          instructorName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Instructor",
          enrolledCount: enrolled[0]?.count || 0,
        };
      }));

      res.json(sessionsWithInstructor);
    } catch (err) { next(err); }
  });

  app.post("/api/private-sessions/:id/book", requireAuth, async (req, res, next) => {
    try {
      const sessionId = req.params.id;
      const userId = req.supabaseUserId!;

      const [session] = await db.select().from(privateSessions).where(eq(privateSessions.id, sessionId));
      if (!session) return res.status(404).json({ message: "Sesión no encontrada" });
      if (session.sessionStatus !== "scheduled") return res.status(400).json({ message: "Sesión no disponible" });
      if (session.instructorId === userId) return res.status(400).json({ message: "No puedes inscribirte en tu propia sesión" });

      const existing = await db.select().from(sessionParticipants)
        .where(and(eq(sessionParticipants.sessionId, sessionId), eq(sessionParticipants.studentId, userId)));
      if (existing.length) return res.status(400).json({ message: "Ya estás inscrito en esta sesión" });

      const enrolled = await db.select({ count: count() }).from(sessionParticipants)
        .where(eq(sessionParticipants.sessionId, sessionId));
      if ((enrolled[0]?.count || 0) >= session.maxStudents) {
        return res.status(400).json({ message: "Sesión llena" });
      }

      const [participant] = await db.insert(sessionParticipants).values({
        sessionId,
        studentId: userId,
        paymentStatus: "confirmed",
        paymentAmountMxn: session.priceMxn,
      }).returning();

      res.json(participant);
    } catch (err) { next(err); }
  });

  app.get("/api/private-sessions/:id/join", requireAuth, async (req, res, next) => {
    try {
      const sessionId = req.params.id;
      const userId = req.supabaseUserId!;

      const [session] = await db.select().from(privateSessions).where(eq(privateSessions.id, sessionId));
      if (!session) return res.status(404).json({ message: "Sesión no encontrada" });

      if (session.instructorId === userId) {
        return res.json({ roomUrl: session.dailyRoomUrl, token: session.dailyRoomToken, role: "instructor" });
      }

      const [participant] = await db.select().from(sessionParticipants)
        .where(and(eq(sessionParticipants.sessionId, sessionId), eq(sessionParticipants.studentId, userId)));
      if (!participant) return res.status(403).json({ message: "No estás inscrito en esta sesión" });

      if (!dailyService.isConfigured || !session.dailyRoomName) {
        return res.status(503).json({ message: "Sala no disponible" });
      }

      const [userRow] = await db.select().from(users).where(eq(users.id, userId));
      const userName = userRow ? `${userRow.firstName || ""} ${userRow.lastName || ""}`.trim() : "Estudiante";

      const token = await dailyService.createMeetingToken({
        roomName: session.dailyRoomName,
        userName,
        isOwner: false,
      });

      await db.update(sessionParticipants).set({ joinedAt: new Date() })
        .where(eq(sessionParticipants.id, participant.id));

      res.json({ roomUrl: session.dailyRoomUrl, token, role: "student" });
    } catch (err) { next(err); }
  });

  app.post("/api/private-sessions/:id/end", requireAuth, async (req, res, next) => {
    try {
      const sessionId = req.params.id;
      const userId = req.supabaseUserId!;

      const [session] = await db.select().from(privateSessions).where(eq(privateSessions.id, sessionId));
      if (!session) return res.status(404).json({ message: "Sesión no encontrada" });
      if (session.instructorId !== userId) return res.status(403).json({ message: "Solo el instructor puede finalizar" });

      await db.update(privateSessions).set({
        sessionStatus: "completed",
        updatedAt: new Date(),
      }).where(eq(privateSessions.id, sessionId));

      if (session.dailyRoomName) {
        try { await dailyService.deleteRoom(session.dailyRoomName); } catch {}
      }

      res.json({ success: true });
    } catch (err) { next(err); }
  });

  app.post("/api/private-sessions/:id/cancel", requireAuth, async (req, res, next) => {
    try {
      const sessionId = req.params.id;
      const userId = req.supabaseUserId!;

      const [session] = await db.select().from(privateSessions).where(eq(privateSessions.id, sessionId));
      if (!session) return res.status(404).json({ message: "Sesión no encontrada" });
      if (session.instructorId !== userId && session.createdBy !== userId) {
        return res.status(403).json({ message: "No tienes permisos para cancelar" });
      }

      await db.update(privateSessions).set({
        sessionStatus: "cancelled",
        updatedAt: new Date(),
      }).where(eq(privateSessions.id, sessionId));

      if (session.dailyRoomName) {
        try { await dailyService.deleteRoom(session.dailyRoomName); } catch {}
      }

      res.json({ success: true });
    } catch (err) { next(err); }
  });

  app.post("/api/instructor-reviews", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const schema = z.object({
        instructorId: z.string().uuid(),
        sessionId: z.string().uuid().optional(),
        rating: z.number().min(1).max(5),
        comment: z.string().max(1000).optional(),
      });
      const data = schema.parse(req.body);

      const [review] = await db.insert(instructorReviews).values({
        instructorId: data.instructorId,
        studentId: userId,
        sessionId: data.sessionId,
        rating: data.rating,
        comment: data.comment,
      }).returning();

      res.json(review);
    } catch (err) { next(err); }
  });

  app.get("/api/instructor-reviews/:instructorId", requireAuth, async (req, res, next) => {
    try {
      const reviews = await db.select().from(instructorReviews)
        .where(eq(instructorReviews.instructorId, req.params.instructorId))
        .orderBy(desc(instructorReviews.createdAt));

      const reviewsWithNames = await Promise.all(reviews.map(async (r) => {
        const [student] = await db.select().from(users).where(eq(users.id, r.studentId));
        return { ...r, studentName: student ? `${student.firstName || ""} ${student.lastName || ""}`.trim() : "Estudiante" };
      }));

      const avg = reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      res.json({ reviews: reviewsWithNames, averageRating: +avg.toFixed(1), totalReviews: reviews.length });
    } catch (err) { next(err); }
  });

  // ==================== ORG ADMIN / TEAM ROUTES ====================

  app.get("/api/teams/:id/objectives", requireAuth, async (req, res, next) => {
    try {
      const teamId = String(req.params.id);
      const userId = req.supabaseUserId!;

      const account = await storage.getAccount(userId);
      if (account?.userRole !== "superadmin") {
        const [membership] = await db.select().from(teamUsers)
          .where(and(eq(teamUsers.teamId, teamId), eq(teamUsers.userId, userId)));
        if (!membership) return res.status(403).json({ message: "No eres miembro de este equipo" });
      }

      const objectives = await db.select({ objective: orgObjectives, course: courses })
        .from(orgObjectives)
        .innerJoin(courses, eq(orgObjectives.courseId, courses.id))
        .where(eq(orgObjectives.teamId, teamId));

      const result = [];
      for (const o of objectives) {
        const assignments = await db.select({ userObj: userObjectives, profile: profiles })
          .from(userObjectives)
          .innerJoin(profiles, eq(userObjectives.userId, profiles.id))
          .where(eq(userObjectives.orgObjectiveId, o.objective.id));

        result.push({
          ...o.objective,
          courseTitle: o.course.title,
          courseSlug: o.course.slug,
          assignments: assignments.map(a => ({
            ...a.userObj,
            fullName: a.profile.fullName,
          })),
        });
      }
      res.json(result);
    } catch (err) { next(err); }
  });

  app.post("/api/teams/:id/objectives/:objId/assign", requireAuth, async (req, res, next) => {
    try {
      const teamId = String(req.params.id);
      const objId = String(req.params.objId);
      const userId = req.supabaseUserId!;

      const account = await storage.getAccount(userId);
      if (account?.userRole !== "superadmin") {
        const [membership] = await db.select().from(teamUsers)
          .where(and(eq(teamUsers.teamId, teamId), eq(teamUsers.userId, userId)));
        if (!membership || membership.role !== "admin") return res.status(403).json({ message: "Se requiere ser admin del equipo" });
      }

      const [objective] = await db.select().from(orgObjectives)
        .where(and(eq(orgObjectives.id, objId), eq(orgObjectives.teamId, teamId)));
      if (!objective) return res.status(404).json({ message: "Objetivo no encontrado en esta organización" });

      const { userIds } = req.body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "userIds requerido (array)" });
      }

      const teamMembers = await db.select().from(teamUsers).where(eq(teamUsers.teamId, teamId));
      const memberIdSet = new Set(teamMembers.map(m => m.userId));

      const created = [];
      for (const uid of userIds) {
        if (!memberIdSet.has(uid)) continue;

        const existing = await db.select().from(userObjectives)
          .where(and(eq(userObjectives.orgObjectiveId, objId), eq(userObjectives.userId, uid)));
        if (existing.length > 0) continue;

        const [obj] = await db.insert(userObjectives).values({
          orgObjectiveId: objId,
          userId: uid,
          assignedBy: userId,
          status: "pending",
        }).returning();
        created.push(obj);
      }
      res.status(201).json({ assigned: created.length, records: created });
    } catch (err) { next(err); }
  });

  app.get("/api/teams/:id/progress", requireAuth, async (req, res, next) => {
    try {
      const teamId = String(req.params.id);
      const userId = req.supabaseUserId!;

      const account = await storage.getAccount(userId);
      if (account?.userRole !== "superadmin") {
        const [membership] = await db.select().from(teamUsers)
          .where(and(eq(teamUsers.teamId, teamId), eq(teamUsers.userId, userId)));
        if (!membership) return res.status(403).json({ message: "No eres miembro de este equipo" });
      }

      const members = await db.select({ teamUser: teamUsers, profile: profiles })
        .from(teamUsers)
        .innerJoin(profiles, eq(teamUsers.userId, profiles.id))
        .where(eq(teamUsers.teamId, teamId));

      const result = [];
      for (const m of members) {
        const userCourses = await db.select().from(courseUsers).where(eq(courseUsers.userId, m.teamUser.userId));
        const userObjs = await db.select().from(userObjectives).where(eq(userObjectives.userId, m.teamUser.userId));
        result.push({
          userId: m.teamUser.userId,
          fullName: m.profile.fullName,
          role: m.teamUser.role,
          coursesEnrolled: userCourses.length,
          coursesCompleted: userCourses.filter(c => c.completed === 100).length,
          avgProgress: userCourses.length > 0 ? Math.round(userCourses.reduce((sum, c) => sum + (c.completed || 0), 0) / userCourses.length) : 0,
          objectivesAssigned: userObjs.length,
          objectivesCompleted: userObjs.filter(o => o.status === "completed").length,
        });
      }
      res.json(result);
    } catch (err) { next(err); }
  });

  app.post("/api/teams/:id/invite", requireAuth, async (req, res, next) => {
    try {
      const teamId = String(req.params.id);
      const userId = req.supabaseUserId!;

      const account = await storage.getAccount(userId);
      if (account?.userRole !== "superadmin") {
        const [membership] = await db.select().from(teamUsers)
          .where(and(eq(teamUsers.teamId, teamId), eq(teamUsers.userId, userId)));
        if (!membership || membership.role !== "admin") return res.status(403).json({ message: "Se requiere ser admin del equipo" });
      }

      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email requerido" });

      const invitedUser = await storage.getUserByEmail(email);
      if (!invitedUser) return res.status(404).json({ message: "Usuario no encontrado — debe registrarse primero" });

      const existing = await db.select().from(teamUsers)
        .where(and(eq(teamUsers.teamId, teamId), eq(teamUsers.userId, invitedUser.id)));
      if (existing.length > 0) return res.status(409).json({ message: "El usuario ya es miembro del equipo" });

      const [member] = await db.insert(teamUsers).values({
        teamId,
        userId: invitedUser.id,
        role: "member",
      }).returning();
      res.status(201).json(member);
    } catch (err) { next(err); }
  });

  // ==================== USER OBJECTIVES ====================

  app.get("/api/user/objectives", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const objs = await db.select({ userObj: userObjectives, orgObj: orgObjectives, course: courses })
        .from(userObjectives)
        .innerJoin(orgObjectives, eq(userObjectives.orgObjectiveId, orgObjectives.id))
        .innerJoin(courses, eq(orgObjectives.courseId, courses.id))
        .where(eq(userObjectives.userId, userId));

      res.json(objs.map(o => ({
        id: o.userObj.id,
        status: o.userObj.status,
        courseId: o.orgObj.courseId,
        courseTitle: o.course.title,
        courseSlug: o.course.slug,
        assignedAt: o.userObj.createdAt,
        completedAt: o.userObj.completedAt,
      })));
    } catch (err) { next(err); }
  });

  // ==================== REFERRAL CODE LOOKUP ====================

  app.get("/api/referral/:code", async (req, res, next) => {
    try {
      const [ref] = await db.select().from(referralCodes).where(eq(referralCodes.code, String(req.params.code)));
      if (!ref || !ref.isActive) return res.status(404).json({ message: "Código no válido" });
      const profile = await storage.getProfile(ref.ownerId);
      const account = await storage.getAccount(ref.ownerId);
      let sponsorName: string | null = null;
      if (ref.ownerType === "partner" || ref.ownerType === "socio_comercial") {
        const partnerProfile = await storage.getProfile(ref.ownerId);
        sponsorName = partnerProfile?.fullName || null;
      }
      const teamUser = await db.select().from(teamUsers).where(eq(teamUsers.userId, ref.ownerId)).limit(1);
      let teamName: string | null = null;
      if (teamUser.length > 0) {
        const team = await db.select().from(teams).where(eq(teams.id, teamUser[0].teamId)).limit(1);
        teamName = team.length > 0 ? team[0].name : null;
      }
      res.json({
        valid: true,
        ownerName: profile?.fullName || "Socio Ceduverse",
        ownerType: ref.ownerType,
        sponsorName: teamName || sponsorName,
      });
    } catch (err) { next(err); }
  });

  app.get("/api/me/referral", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;

      const account = await storage.getAccount(userId);
      if (account?.referralCode) {
        const existing = await db.select().from(referralCodes).where(
          and(eq(referralCodes.code, account.referralCode), eq(referralCodes.isActive, true))
        ).limit(1);
        const usageCount = existing.length > 0 ? existing[0].usageCount : 0;
        return res.json({ code: account.referralCode, usageCount });
      }

      const existing = await db.select().from(referralCodes).where(
        and(eq(referralCodes.ownerId, userId), eq(referralCodes.isActive, true))
      ).limit(1);

      if (existing.length > 0) {
        return res.json({ code: existing[0].code, usageCount: existing[0].usageCount });
      }

      const profile = await storage.getProfile(userId);
      const nameSlug = (profile?.fullName || "user")
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "")
        .slice(0, 8);
      const randomSuffix = Math.random().toString(36).slice(2, 6).toUpperCase();
      const code = `${nameSlug}-${randomSuffix}`;

      const [ref] = await db.insert(referralCodes).values({
        code,
        ownerId: userId,
        ownerType: "user",
        label: "Auto-generado",
        commission: 0,
      }).returning();

      res.json({ code: ref.code, usageCount: 0 });
    } catch (err) { next(err); }
  });

  // ==================== AI STUDIO ====================

  app.get("/api/studio/courses", optionalAuth, async (req, res, next) => {
    try {
      const { category, search, page, limit } = req.query;
      const result = await storage.getStudioCourses({
        category: category as string | undefined,
        search: search as string | undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      if (category === "Onboarding" && result.courses.length > 0) {
        let allowedSubcategories: string[] = ["Para Todos"];
        const userId = req.supabaseUserId;

        if (userId) {
          const account = await storage.getAccount(userId);
          const role = account?.userRole || "socio_estudiante";

          if (role === "admin" || role === "superadmin") {
            allowedSubcategories = ["Para Todos", "Empresas", "Socios"];
          } else if (role === "socio_comercial" || role === "partner" || role === "director") {
            allowedSubcategories = ["Para Todos", "Socios"];
          } else {
            const userTeams = await storage.getUserTeams(userId);
            const isTeamAdmin = userTeams.some(t => t.role === "admin");
            if (isTeamAdmin) {
              allowedSubcategories = ["Para Todos", "Empresas"];
            }
          }
        }

        const filtered = result.courses.filter(c =>
          c.subcategory && allowedSubcategories.includes(c.subcategory)
        );
        return res.json({ courses: filtered, total: filtered.length });
      }

      res.json(result);
    } catch (err) { next(err); }
  });

  app.get("/api/studio/courses/:slug", async (req, res, next) => {
    try {
      const slug = String(req.params.slug);
      const course = await storage.getStudioCourse(slug);
      if (!course) return res.status(404).json({ message: "Curso no encontrado" });
      const modules = await storage.getStudioModules(course.id);
      const quiz = await storage.getStudioQuiz(course.id);
      res.json({ course, modules, quiz });
    } catch (err) { next(err); }
  });

  app.get("/api/studio/courses/:slug/modules/:index", async (req, res, next) => {
    try {
      const slug = String(req.params.slug);
      const moduleIndex = Number(req.params.index);
      if (!Number.isFinite(moduleIndex) || moduleIndex < 0) return res.status(400).json({ message: "Índice inválido" });
      const result = await storage.getStudioModuleBySlugAndIndex(slug, moduleIndex);
      if (!result) return res.status(404).json({ message: "Módulo no encontrado" });
      res.json(result);
    } catch (err) { next(err); }
  });

  app.post("/api/studio/courses/:slug/modules/:index/generate", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const slug = String(req.params.slug);
      const moduleIndex = Number(req.params.index);
      if (!Number.isFinite(moduleIndex) || moduleIndex < 0) return res.status(400).json({ message: "Índice inválido" });

      const regenerate = req.query.regenerate === "true";
      const cached = await storage.getGeneratedContent(userId, slug, moduleIndex);
      if (cached && !regenerate) return res.json(cached);
      if (cached && regenerate) {
        await storage.deleteGeneratedContent(userId, slug, moduleIndex);
      }

      const result = await storage.getStudioModuleBySlugAndIndex(slug, moduleIndex);
      if (!result) return res.status(404).json({ message: "Módulo no encontrado" });

      const profile = await storage.getStudentProfile(userId);
      const { generateModuleContent } = await import("./ai-engine");
      const generated = await generateModuleContent(
        result.module.title,
        result.module.contentHtml,
        profile ? {
          jobTitle: profile.jobTitle || undefined,
          industry: profile.industry || undefined,
          companySize: profile.companySize || undefined,
          experienceLevel: profile.experienceLevel || undefined,
          learningGoals: profile.learningGoals || undefined,
          preferredStyle: profile.preferredStyle || undefined,
        } : null,
        result.course.title,
        result.module.description || undefined,
        result.module.references ? (result.module.references as string[]).join("; ") : undefined,
      );

      const saved = await storage.saveGeneratedContent({
        userId,
        courseSlug: slug,
        moduleIndex,
        lectureHtml: generated.lectureHtml,
        mindMap: generated.mindMap,
        reflections: generated.reflections,
        adaptiveQuiz: generated.adaptiveQuiz,
        suggestedSources: generated.suggestedSources,
        classScript: generated.classScript || null,
        personalizedFor: profile ? { jobTitle: profile.jobTitle, industry: profile.industry } : null,
        generationStatus: generated.isStub ? "failed" : (generated.adaptiveQuiz && generated.adaptiveQuiz.length > 0 ? "complete" : "partial"),
        isStub: generated.isStub || false,
      });

      res.json(saved);
    } catch (err) { next(err); }
  });

  app.delete("/api/studio/courses/:slug/modules/:index/generated", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const slug = String(req.params.slug);
      const moduleIndex = Number(req.params.index);
      if (!Number.isFinite(moduleIndex) || moduleIndex < 0) return res.status(400).json({ message: "Índice inválido" });
      const deleted = await storage.deleteGeneratedContent(userId, slug, moduleIndex);
      res.json({ deleted });
    } catch (err) { next(err); }
  });

  app.put("/api/studio/enrollments/:enrollmentId/modules/:identifier/complete", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { enrollmentId, identifier } = req.params;
      const allEnrollments = await storage.getStudioEnrollments(userId);
      const target = allEnrollments.find(e => e.id === enrollmentId);
      if (!target) return res.status(404).json({ message: "Inscripción no encontrada" });

      const progress = await storage.upsertModuleProgress(enrollmentId, identifier, {
        completed: true,
        completedAt: new Date(),
      });

      const course = await storage.getStudioCourse(target.courseIdentifier);
      if (course) {
        const modules = await storage.getStudioModules(course.id);
        const allProgress = await storage.getModuleProgressForEnrollment(enrollmentId);
        const completedCount = allProgress.filter(p => p.completed).length;
        const progressPercent = modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;
        await storage.updateStudioEnrollment(enrollmentId, { progressPercent } as any);

        if (progressPercent >= 100 && (target as any).status !== "completed") {
          await storage.updateStudioEnrollment(enrollmentId, { status: "completed" } as any);
          try {
            const slug = target.courseIdentifier;
            const individualAchSlug = `logro-${slug}`;
            let individualAch = await storage.getAchievementBySlug(individualAchSlug);
            if (!individualAch) {
              const [created] = await db.insert(achievements).values({
                slug: individualAchSlug,
                name: `Diploma: ${course.title || slug}`,
                description: `Completaste el curso ${course.title || slug}`,
                value: 1000,
                icon: "trophy",
                category: "studio",
              }).returning();
              individualAch = created;
            }
            if (individualAch) {
              const existingInd = await db.select().from(achievementUsers)
                .where(and(eq(achievementUsers.userId, userId), eq(achievementUsers.achievementId, individualAch.id), eq(achievementUsers.certType, "diploma")));
              if (existingInd.length === 0) {
                await db.insert(achievementUsers).values({ userId, achievementId: individualAch.id, status: "active", certType: "diploma", isActive: true });
              }
            }
            const [primerCurso] = await db.select().from(achievements).where(eq(achievements.slug, "primer-curso"));
            if (primerCurso) {
              const [ep] = await db.select().from(achievementUsers).where(and(eq(achievementUsers.userId, userId), eq(achievementUsers.achievementId, primerCurso.id)));
              if (!ep) await db.insert(achievementUsers).values({ userId, achievementId: primerCurso.id, status: "active", certType: "diploma", isActive: true });
            }
          } catch (achErr) {
            console.error("[studio-module] Error granting achievements:", achErr);
          }
        }
      }

      res.json(progress);
    } catch (err) { next(err); }
  });

  app.post("/api/studio/courses/:slug/modules/:index/quiz/submit", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const slug = String(req.params.slug);
      const moduleIndex = Number(req.params.index);
      if (!Number.isFinite(moduleIndex) || moduleIndex < 0) return res.status(400).json({ message: "Índice inválido" });
      const { answers, score: clientScore } = req.body;

      if (!answers || !Array.isArray(answers)) return res.status(400).json({ message: "Respuestas requeridas" });

      const generated = await storage.getGeneratedContent(userId, slug, moduleIndex);
      const quiz = generated?.adaptiveQuiz as any[] | null;
      let score = 0;
      let total = 0;

      if (quiz && quiz.length > 0) {
        total = quiz.length;
        for (let i = 0; i < quiz.length; i++) {
          if (answers[i] === quiz[i].correctIndex) score++;
        }
      } else {
        score = clientScore || 0;
        total = answers.length;
      }

      const scorePercent = total > 0 ? Math.round((score / total) * 100) : 0;
      const passed = scorePercent >= 70;

      const allEnrollments = await storage.getStudioEnrollments(userId);
      const enrollment = allEnrollments.find(e => e.courseIdentifier === slug);

      if (enrollment) {
        await storage.upsertModuleProgress(enrollment.id, `module_${moduleIndex}`, {
          quizScore: scorePercent,
        });

        if (passed) {
          const course = await storage.getStudioCourse(slug);
          if (course) {
            const modules = await storage.getStudioModules(course.id);
            const allProgress = await storage.getModuleProgressForEnrollment(enrollment.id);
            const allCompleted = modules.every((_, idx) => {
              const mp = allProgress.find(p => p.moduleIdentifier === `module_${idx}`);
              return mp?.completed;
            });

            if (allCompleted) {
              await storage.updateStudioEnrollment(enrollment.id, { status: "completed" } as any);

              try {
                const individualAchSlug = `logro-${slug}`;
                let individualAch = await storage.getAchievementBySlug(individualAchSlug);
                if (!individualAch) {
                  const courseName = course.title || slug;
                  const [created] = await db.insert(achievements).values({
                    slug: individualAchSlug,
                    name: `Diploma: ${courseName}`,
                    description: `Completaste el curso ${courseName}`,
                    value: 1000,
                    icon: "trophy",
                    category: "studio",
                  }).returning();
                  individualAch = created;
                }
                if (individualAch) {
                  const existingInd = await db.select().from(achievementUsers)
                    .where(and(eq(achievementUsers.userId, userId), eq(achievementUsers.achievementId, individualAch.id), eq(achievementUsers.certType, "diploma")));
                  if (existingInd.length === 0) {
                    await db.insert(achievementUsers).values({ userId, achievementId: individualAch.id, status: "active", certType: "diploma", isActive: true });
                  }
                }

                const [primerCurso] = await db.select().from(achievements).where(eq(achievements.slug, "primer-curso"));
                if (primerCurso) {
                  const [ep] = await db.select().from(achievementUsers).where(and(eq(achievementUsers.userId, userId), eq(achievementUsers.achievementId, primerCurso.id)));
                  if (!ep) await db.insert(achievementUsers).values({ userId, achievementId: primerCurso.id, status: "active", certType: "diploma", isActive: true });
                }

                const ONBOARDING_SLUGS = ["bienvenido-ceduverse", "guia-empresas", "guia-socios", "modelo-cooperativo", "programa-elite", "como-ganar-ceduverse", "cripto-blockchain-vaultcard"];
                if (ONBOARDING_SLUGS.includes(slug)) {
                  const ROLE_ONBOARDING_MAP: Record<string, { slugs: string[]; graduationSlug: string }> = {
                    socio_estudiante: { slugs: ["bienvenido-ceduverse", "modelo-cooperativo"], graduationSlug: "onboarding-estudiante-completo" },
                    socio_instructor: { slugs: ["bienvenido-ceduverse", "modelo-cooperativo"], graduationSlug: "onboarding-estudiante-completo" },
                    socio_comercial: { slugs: ["bienvenido-ceduverse", "modelo-cooperativo", "guia-socios", "programa-elite"], graduationSlug: "onboarding-socio-completo" },
                    director: { slugs: ["bienvenido-ceduverse", "modelo-cooperativo", "guia-socios", "programa-elite"], graduationSlug: "onboarding-director-completo" },
                    empresa: { slugs: ["bienvenido-ceduverse", "modelo-cooperativo", "guia-empresas"], graduationSlug: "onboarding-empresa-completo" },
                    empresa_rh: { slugs: ["bienvenido-ceduverse", "modelo-cooperativo", "guia-empresas"], graduationSlug: "onboarding-empresa-completo" },
                  };

                  const allEnrollmentsForAch = await storage.getStudioEnrollments(userId);
                  const completedSlugs = allEnrollmentsForAch
                    .filter(e => (e as any).status === "completed")
                    .map(e => e.courseIdentifier);

                  const account = await storage.getAccount(userId);
                  if (account) {
                    const roleConfig = ROLE_ONBOARDING_MAP[account.userRole];
                    if (roleConfig) {
                      const allRoleCoursesCompleted = roleConfig.slugs.every(s => completedSlugs.includes(s));
                      if (allRoleCoursesCompleted) {
                        const gradAch = await storage.getAchievementBySlug(roleConfig.graduationSlug);
                        if (gradAch) {
                          const existingGrad = await db.select().from(achievementUsers)
                            .where(and(eq(achievementUsers.userId, userId), eq(achievementUsers.achievementId, gradAch.id), eq(achievementUsers.certType, "diploma")));
                          if (existingGrad.length === 0) {
                            await db.insert(achievementUsers).values({ userId, achievementId: gradAch.id, status: "active", certType: "diploma", isActive: true });
                          }
                        }
                      }
                    }
                  }

                  const completedOnboarding = new Set(completedSlugs.filter(s => ONBOARDING_SLUGS.includes(s))).size;
                  if (completedOnboarding >= ONBOARDING_SLUGS.length) {
                    const expertoAch = await storage.getAchievementBySlug("experto-ceduverse");
                    if (expertoAch) {
                      const existing = await db.select().from(achievementUsers)
                        .where(and(eq(achievementUsers.userId, userId), eq(achievementUsers.achievementId, expertoAch.id), eq(achievementUsers.certType, "diploma")));
                      if (existing.length === 0) {
                        await db.insert(achievementUsers).values({ userId, achievementId: expertoAch.id, status: "active", certType: "diploma", isActive: true });
                      }
                    }
                  }
                }
              } catch (achErr) {
                console.error("[studio-quiz] Error granting achievements:", achErr);
              }
            }
          }
        }
      }

      res.json({ score, total, scorePercent, passed });
    } catch (err) { next(err); }
  });

  app.get("/api/studio/courses/:slug/modules/:index/chat/history", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const slug = String(req.params.slug);
      const moduleIndex = Number(req.params.index);
      if (!Number.isFinite(moduleIndex) || moduleIndex < 0) return res.status(400).json({ message: "Índice inválido" });
      const session = await storage.getChatSession(userId, slug, moduleIndex);
      res.json({ messages: (session?.messages as any[]) || [] });
    } catch (err) { next(err); }
  });

  app.get("/api/studio/courses/:slug/modules/:index/audio", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const slug = String(req.params.slug);
      const moduleIndex = Number(req.params.index);
      if (!Number.isFinite(moduleIndex) || moduleIndex < 0) return res.status(400).json({ message: "Índice inválido" });

      const generated = await storage.getGeneratedContent(userId, slug, moduleIndex);
      if (!generated || !generated.classScript) {
        return res.status(404).json({ status: "no_script", message: "No hay guion de clase disponible. Genera el contenido primero." });
      }

      if (generated.audioUrl) {
        const { getAudioDir } = await import("./audio-generator");
        const audioPath = path.join(getAudioDir(), generated.audioUrl);
        if (fs.existsSync(audioPath)) {
          return res.json({
            status: "ready",
            audioUrl: `/audio/${generated.audioUrl}`,
            duration: generated.audioDurationSeconds,
          });
        }
      }

      if (generated.generationStatus === "generating_audio") {
        return res.json({ status: "generating", estimatedSeconds: 30 });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ status: "unavailable", message: "Servicio de audio no configurado" });
      }

      const { generateAudioAsync } = await import("./audio-generator");
      generateAudioAsync(generated.id, generated.classScript, slug, moduleIndex, userId)
        .catch(err => console.error("[audio] Background generation failed:", err));

      return res.json({ status: "generating", estimatedSeconds: 30 });
    } catch (err) { next(err); }
  });

  app.get("/api/studio/courses/:slug/modules/:index/audio/status", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const slug = String(req.params.slug);
      const moduleIndex = Number(req.params.index);
      if (!Number.isFinite(moduleIndex) || moduleIndex < 0) return res.status(400).json({ message: "Índice inválido" });

      const generated = await storage.getGeneratedContent(userId, slug, moduleIndex);
      if (!generated) return res.status(404).json({ status: "not_found" });

      if (generated.audioUrl) {
        const { getAudioDir } = await import("./audio-generator");
        const audioPath = path.join(getAudioDir(), generated.audioUrl);
        if (fs.existsSync(audioPath)) {
          return res.json({
            status: "ready",
            audioUrl: `/audio/${generated.audioUrl}`,
            duration: generated.audioDurationSeconds,
          });
        }
      }

      if (generated.generationStatus === "generating_audio") {
        return res.json({ status: "generating" });
      }

      return res.json({ status: "pending" });
    } catch (err) { next(err); }
  });

  app.post("/api/studio/courses/:slug/modules/:index/audio/regenerate", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const slug = String(req.params.slug);
      const moduleIndex = Number(req.params.index);
      if (!Number.isFinite(moduleIndex) || moduleIndex < 0) return res.status(400).json({ message: "Índice inválido" });

      const generated = await storage.getGeneratedContent(userId, slug, moduleIndex);
      if (!generated || !generated.classScript) {
        return res.status(404).json({ message: "No hay guion de clase disponible." });
      }

      if (generated.audioUrl) {
        const { getAudioDir } = await import("./audio-generator");
        const oldPath = path.join(getAudioDir(), generated.audioUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      await storage.updateGeneratedContent(generated.id, {
        audioUrl: null,
        audioDurationSeconds: null,
        audioGeneratedAt: null,
      } as any);

      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ status: "unavailable" });
      }

      const { generateAudioAsync } = await import("./audio-generator");
      generateAudioAsync(generated.id, generated.classScript, slug, moduleIndex, userId)
        .catch(err => console.error("[audio] Regeneration failed:", err));

      return res.json({ status: "generating" });
    } catch (err) { next(err); }
  });

  app.get("/api/studio/enrollments/:enrollmentId/progress", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { enrollmentId } = req.params;
      const allEnrollments = await storage.getStudioEnrollments(userId);
      const target = allEnrollments.find(e => e.id === enrollmentId);
      if (!target) return res.status(404).json({ message: "Inscripción no encontrada" });
      const progress = await storage.getModuleProgressForEnrollment(enrollmentId);
      res.json(progress);
    } catch (err) { next(err); }
  });

  app.post("/api/studio/courses/:slug/modules/:index/chat", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const slug = String(req.params.slug);
      const moduleIndex = Number(req.params.index);
      if (!Number.isFinite(moduleIndex) || moduleIndex < 0) return res.status(400).json({ message: "Índice inválido" });
      const { message } = req.body;
      if (!message || typeof message !== "string") return res.status(400).json({ message: "Mensaje requerido" });

      const result = await storage.getStudioModuleBySlugAndIndex(slug, moduleIndex);
      if (!result) return res.status(404).json({ message: "Módulo no encontrado" });

      const session = await storage.getChatSession(userId, slug, moduleIndex);
      const history = (session?.messages as any[]) || [];

      const profile = await storage.getStudentProfile(userId);
      const { chatWithModule } = await import("./ai-engine");
      const response = await chatWithModule(
        slug,
        moduleIndex,
        result.module.title,
        result.module.contentHtml,
        message,
        history,
        profile ? {
          jobTitle: profile.jobTitle || undefined,
          industry: profile.industry || undefined,
          companySize: profile.companySize || undefined,
          experienceLevel: profile.experienceLevel || undefined,
          learningGoals: profile.learningGoals || undefined,
          preferredStyle: profile.preferredStyle || undefined,
        } : null,
        result.course.title,
      );

      const updatedMessages = [
        ...history,
        { role: "user", content: message, timestamp: new Date().toISOString() },
        { role: "assistant", content: response.message, timestamp: new Date().toISOString() },
      ];
      await storage.upsertChatSession(userId, slug, moduleIndex, updatedMessages);

      res.json(response);
    } catch (err) { next(err); }
  });

  app.post("/api/studio/enroll", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { courseSlug } = req.body;
      if (!courseSlug) return res.status(400).json({ message: "courseSlug requerido" });
      const course = await storage.getStudioCourse(courseSlug);
      if (!course) return res.status(404).json({ message: "Curso no encontrado" });
      const enrollment = await storage.createStudioEnrollment({
        userId,
        source: "studio",
        courseIdentifier: courseSlug,
      });
      res.json(enrollment);
    } catch (err) { next(err); }
  });

  app.get("/api/studio/enrollments", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const enrollments = await storage.getStudioEnrollments(userId);
      res.json(enrollments);
    } catch (err) { next(err); }
  });

  app.delete("/api/studio/enrollments/:courseSlug", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const courseSlug = String(req.params.courseSlug);
      const removed = await storage.deleteStudioEnrollment(userId, courseSlug);
      if (!removed) return res.status(404).json({ message: "Inscripción no encontrada" });
      res.json({ message: "Desinscrito del curso" });
    } catch (err) { next(err); }
  });

  app.post("/api/studio/enrollments/:enrollmentId/reset", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { enrollmentId } = req.params;
      const allEnrollments = await storage.getStudioEnrollments(userId);
      const target = allEnrollments.find(e => e.id === enrollmentId);
      if (!target) return res.status(404).json({ message: "Inscripción no encontrada" });
      await storage.resetStudioEnrollmentProgress(enrollmentId);
      res.json({ message: "Progreso reiniciado" });
    } catch (err) { next(err); }
  });

  app.get("/api/me/student-profile", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const profile = await storage.getStudentProfile(userId);
      res.json(profile || null);
    } catch (err) { next(err); }
  });

  app.put("/api/me/student-profile", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { jobTitle, industry, companySize, experienceLevel, learningGoals, preferredStyle } = req.body;
      const profile = await storage.upsertStudentProfile(userId, {
        jobTitle, industry, companySize, experienceLevel, learningGoals, preferredStyle,
      });
      res.json(profile);
    } catch (err) { next(err); }
  });

  const LEARNING_TOPICS = [
    { id: "seguridad-industrial", label: "Seguridad Industrial", icon: "🦺", category: "Seguridad" },
    { id: "normas-stps", label: "Normas STPS", icon: "📋", category: "Normatividad" },
    { id: "liderazgo", label: "Liderazgo", icon: "👑", category: "Desarrollo" },
    { id: "comunicacion", label: "Comunicación", icon: "💬", category: "Desarrollo" },
    { id: "trabajo-equipo", label: "Trabajo en Equipo", icon: "🤝", category: "Desarrollo" },
    { id: "recursos-humanos", label: "Recursos Humanos", icon: "👥", category: "Empresarial" },
    { id: "capacitacion", label: "Capacitación", icon: "🎓", category: "Empresarial" },
    { id: "ergonomia", label: "Ergonomía", icon: "🪑", category: "Seguridad" },
    { id: "primeros-auxilios", label: "Primeros Auxilios", icon: "🏥", category: "Seguridad" },
    { id: "montacargas", label: "Montacargas", icon: "🏗️", category: "Seguridad" },
    { id: "incendios", label: "Prevención de Incendios", icon: "🔥", category: "Seguridad" },
    { id: "autoestima", label: "Autoestima", icon: "💪", category: "Desarrollo" },
    { id: "conflictos", label: "Manejo de Conflictos", icon: "⚖️", category: "Desarrollo" },
    { id: "inteligencia-artificial", label: "Inteligencia Artificial", icon: "🤖", category: "Tecnología" },
    { id: "derechos-laborales", label: "Derechos Laborales", icon: "📜", category: "Normatividad" },
    { id: "higiene-alimentos", label: "Higiene y Alimentos", icon: "🍽️", category: "Seguridad" },
    { id: "epp", label: "Equipo de Protección", icon: "🥽", category: "Seguridad" },
    { id: "soldadura", label: "Soldadura y Corte", icon: "⚡", category: "Seguridad" },
    { id: "planeacion-vida", label: "Planeación de Vida", icon: "🗺️", category: "Desarrollo" },
    { id: "valores", label: "Valores y Ética", icon: "⭐", category: "Desarrollo" },
    { id: "productividad", label: "Productividad", icon: "📈", category: "Empresarial" },
    { id: "idiomas", label: "Idiomas", icon: "🌎", category: "Educación" },
    { id: "programacion", label: "Programación", icon: "💻", category: "Tecnología" },
    { id: "marketing", label: "Marketing Digital", icon: "📱", category: "Empresarial" },
    { id: "finanzas", label: "Finanzas", icon: "💰", category: "Empresarial" },
    { id: "emprendimiento", label: "Emprendimiento", icon: "🚀", category: "Empresarial" },
    { id: "salud-trabajo", label: "Salud en el Trabajo", icon: "❤️", category: "Seguridad" },
    { id: "electricidad", label: "Seguridad Eléctrica", icon: "⚡", category: "Seguridad" },
    { id: "calidad", label: "Control de Calidad", icon: "✅", category: "Empresarial" },
    { id: "diseno", label: "Diseño", icon: "🎨", category: "Tecnología" },
    { id: "pedagogia", label: "Pedagogía", icon: "📚", category: "Educación" },
    { id: "cocina", label: "Cocina y Gastronomía", icon: "👨‍🍳", category: "Oficios" },
    { id: "fotografia", label: "Fotografía", icon: "📷", category: "Creatividad" },
    { id: "psicologia", label: "Psicología", icon: "🧠", category: "Desarrollo" },
    { id: "relaciones-humanas", label: "Relaciones Humanas", icon: "🫂", category: "Desarrollo" },
    { id: "construccion", label: "Construcción", icon: "🏗️", category: "Seguridad" },
  ];

  const TOPIC_SEARCH_KEYWORDS: Record<string, string[]> = {
    "seguridad-industrial": ["seguridad", "industrial", "riesgo", "prevención", "accidente"],
    "normas-stps": ["nom", "stps", "norma", "regulación", "oficial"],
    "liderazgo": ["líder", "liderazgo", "dirección", "gerencia", "directivo"],
    "comunicacion": ["comunicación", "comunicar", "asertiva", "efectiva", "verbal"],
    "trabajo-equipo": ["equipo", "grupo", "integración", "colaboración", "team"],
    "recursos-humanos": ["recursos humanos", "rh", "talento", "personal", "nómina"],
    "capacitacion": ["capacitación", "formación", "instructor", "entrenamiento", "adiestramiento"],
    "ergonomia": ["ergonomía", "musculoesquelético", "postura", "tme"],
    "primeros-auxilios": ["primeros auxilios", "emergencia", "brigada", "evacuación"],
    "montacargas": ["montacargas", "carretilla", "carga"],
    "incendios": ["incendio", "fuego", "extintor", "brigada contra incendios"],
    "autoestima": ["autoestima", "autoconocimiento", "confianza", "autodependencia"],
    "conflictos": ["conflicto", "negociación", "mediación", "decisión"],
    "inteligencia-artificial": ["inteligencia artificial", "ia", "ai", "machine learning", "automatización"],
    "derechos-laborales": ["derecho laboral", "reforma", "ley federal", "contrato"],
    "higiene-alimentos": ["alimento", "higiene", "sanitario", "haccp", "manipulación"],
    "epp": ["equipo protección", "epp", "casco", "guantes", "lentes"],
    "soldadura": ["soldadura", "corte", "arco", "metal"],
    "planeacion-vida": ["planeación", "plan de vida", "metas", "carrera"],
    "valores": ["valores", "ética", "integridad", "cultura organizacional"],
    "productividad": ["productividad", "eficiencia", "tiempo", "procesos"],
    "idiomas": ["inglés", "idioma", "english", "francés", "language"],
    "programacion": ["programación", "código", "software", "web", "python", "javascript"],
    "marketing": ["marketing", "mercadotecnia", "redes sociales", "publicidad", "ventas"],
    "finanzas": ["finanzas", "contabilidad", "inversión", "economía", "presupuesto"],
    "emprendimiento": ["emprendimiento", "negocio", "startup", "empresa", "emprender"],
    "salud-trabajo": ["salud", "bienestar", "hábitos saludables", "estrés"],
    "electricidad": ["electricidad", "eléctrica", "energía", "voltaje"],
    "calidad": ["calidad", "mejora continua", "lean", "six sigma", "iso"],
    "diseno": ["diseño", "gráfico", "ilustración", "ux", "ui"],
    "pedagogia": ["pedagogía", "enseñanza", "educación", "didáctica", "aprendizaje"],
    "cocina": ["cocina", "gastronomía", "chef", "culinaria", "repostería"],
    "fotografia": ["fotografía", "cámara", "foto", "imagen", "video"],
    "psicologia": ["psicología", "mente", "emociones", "terapia", "comportamiento"],
    "relaciones-humanas": ["relaciones humanas", "interpersonal", "social", "empatía"],
    "construccion": ["construcción", "obra", "edificación", "estructura"],
  };

  app.get("/api/learning/topics", (_req, res) => {
    res.json(LEARNING_TOPICS);
  });

  app.get("/api/learning/interests", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const existing = await db.select().from(learningInterests)
        .where(eq(learningInterests.userId, userId))
        .orderBy(desc(learningInterests.createdAt))
        .limit(1);
      if (existing.length > 0) {
        res.json(existing[0]);
      } else {
        res.json(null);
      }
    } catch (err) { next(err); }
  });

  const VALID_TOPIC_IDS = new Set(LEARNING_TOPICS.map(t => t.id));

  app.post("/api/learning/discover", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { topics } = req.body;
      if (!Array.isArray(topics) || topics.length < 1 || topics.length > 5) {
        return res.status(400).json({ message: "Selecciona entre 1 y 5 temas" });
      }
      const validTopics = topics.filter((t: string) => VALID_TOPIC_IDS.has(t));
      if (validTopics.length === 0) {
        return res.status(400).json({ message: "Ningún tema válido seleccionado" });
      }

      const searchTerms = validTopics.flatMap((t: string) => TOPIC_SEARCH_KEYWORDS[t] || [t]);
      const searchPattern = searchTerms.map((t: string) => t.toLowerCase()).join("|");

      const academyResults = await db.select({
        id: academyCoursesCache.id,
        academyId: academyCoursesCache.academyId,
        title: academyCoursesCache.title,
        excerpt: academyCoursesCache.excerpt,
        url: academyCoursesCache.url,
      }).from(academyCoursesCache)
        .where(sql`(LOWER(${academyCoursesCache.title}) ~* ${searchPattern} OR LOWER(${academyCoursesCache.excerpt}) ~* ${searchPattern})`)
        .limit(20);

      const shuffled = academyResults.sort(() => Math.random() - 0.5);
      const topAcademy = shuffled.slice(0, 5);

      const studioResults = await db.select({
        id: studioCourses.id,
        slug: studioCourses.slug,
        title: studioCourses.title,
        description: studioCourses.description,
        category: studioCourses.category,
        icon: studioCourses.icon,
        color: studioCourses.color,
        tags: studioCourses.tags,
        dc3Available: studioCourses.dc3Available,
      }).from(studioCourses)
        .where(sql`(LOWER(${studioCourses.title}) ~* ${searchPattern} OR LOWER(${studioCourses.category}) ~* ${searchPattern} OR array_to_string(${studioCourses.tags}, ' ') ~* ${searchPattern})`)
        .limit(5);

      const topStudio = studioResults.length > 0 ? studioResults[Math.floor(Math.random() * studioResults.length)] : null;

      const stpsSuggestion = {
        type: "stps-instructor",
        title: "Clase personalizada con instructor STPS certificado",
        description: "Recibe capacitación 1-on-1 con un instructor certificado por la STPS, enfocada en tus temas de interés. Incluye constancia DC-3.",
        topics: topics.map((t: string) => LEARNING_TOPICS.find(lt => lt.id === t)?.label || t),
        ctaUrl: "https://calendly.com/ceduverse",
        ctaLabel: "Agendar clase",
        price: "$1,999 MXN",
      };

      const recommendations = {
        academy: topAcademy,
        tutorIa: topStudio,
        stpsInstructor: stpsSuggestion,
        selectedTopics: topics,
        generatedAt: new Date().toISOString(),
      };

      await db.delete(learningInterests).where(eq(learningInterests.userId, userId));

      await db.insert(learningInterests).values({
        userId,
        topics,
        recommendations,
      });

      res.json(recommendations);
    } catch (err) { next(err); }
  });

  app.delete("/api/learning/interests", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      await db.delete(learningInterests).where(eq(learningInterests.userId, userId));
      res.json({ ok: true });
    } catch (err) { next(err); }
  });

  // ─── CRM Comercial ───

  app.get("/api/crm/payments", requireAdmin, async (req, res, next) => {
    try {
      const { month, year } = req.query;
      const now = new Date();
      const m = month ? Number(month) : now.getMonth() + 1;
      const y = year ? Number(year) : now.getFullYear();
      const payments = await db.select({
        payment: companyPayments,
        teamName: teams.name,
        teamPlan: teams.plan,
      }).from(companyPayments)
        .leftJoin(teams, eq(companyPayments.teamId, teams.id))
        .where(and(eq(companyPayments.periodMonth, m), eq(companyPayments.periodYear, y)))
        .orderBy(desc(companyPayments.createdAt));
      res.json(payments);
    } catch (err) { next(err); }
  });

  app.post("/api/crm/payments", requireAdmin, async (req, res, next) => {
    try {
      const data = req.body;
      const [payment] = await db.insert(companyPayments).values({
        teamId: data.teamId,
        amount: data.amount,
        expectedAmount: data.expectedAmount,
        paymentMethod: data.paymentMethod || "spei",
        reference: data.reference,
        status: data.status || "pending",
        periodMonth: data.periodMonth,
        periodYear: data.periodYear,
        paidAt: data.paidAt ? new Date(data.paidAt) : null,
        confirmedBy: req.supabaseUserId!,
        notes: data.notes,
      }).returning();
      res.json(payment);
    } catch (err) { next(err); }
  });

  app.patch("/api/crm/payments/:id", requireAdmin, async (req, res, next) => {
    try {
      const { status, reference, notes, paidAt } = req.body;
      const updates: Record<string, unknown> = {};
      if (status) updates.status = status;
      if (reference !== undefined) updates.reference = reference;
      if (notes !== undefined) updates.notes = notes;
      if (paidAt) updates.paidAt = new Date(paidAt);
      if (status === "confirmed") updates.confirmedBy = req.supabaseUserId!;
      const [updated] = await db.update(companyPayments).set(updates).where(eq(companyPayments.id, req.params.id)).returning();
      if (!updated) return res.status(404).json({ message: "Pago no encontrado" });
      res.json(updated);
    } catch (err) { next(err); }
  });

  app.get("/api/crm/payments/summary", requireAdmin, async (req, res, next) => {
    try {
      const now = new Date();
      const m = Number(req.query.month) || now.getMonth() + 1;
      const y = Number(req.query.year) || now.getFullYear();
      const result = await db.select({
        status: companyPayments.status,
        total: sql<number>`COALESCE(SUM(${companyPayments.amount}), 0)::int`,
        cnt: sql<number>`COUNT(*)::int`,
      }).from(companyPayments)
        .where(and(eq(companyPayments.periodMonth, m), eq(companyPayments.periodYear, y)))
        .groupBy(companyPayments.status);
      res.json({ month: m, year: y, breakdown: result });
    } catch (err) { next(err); }
  });

  app.get("/api/crm/commissions", requireAdmin, async (req, res, next) => {
    try {
      const now = new Date();
      const m = Number(req.query.month) || now.getMonth() + 1;
      const y = Number(req.query.year) || now.getFullYear();
      const commissions = await db.select({
        commission: partnerCommissions,
        partnerName: profiles.fullName,
        partnerEmail: accounts.email,
        teamName: teams.name,
      }).from(partnerCommissions)
        .leftJoin(profiles, eq(partnerCommissions.partnerId, profiles.userId))
        .leftJoin(accounts, eq(partnerCommissions.partnerId, accounts.id))
        .leftJoin(teams, eq(partnerCommissions.teamId, teams.id))
        .where(and(eq(partnerCommissions.periodMonth, m), eq(partnerCommissions.periodYear, y)))
        .orderBy(desc(partnerCommissions.createdAt));
      res.json(commissions);
    } catch (err) { next(err); }
  });

  app.post("/api/crm/commissions/generate", requireAdmin, async (req, res, next) => {
    try {
      const { month, year } = req.body;
      const UMA_VALUE = 113.14;
      const PLAN_CONFIG: Record<string, { umas: number; fee: number; commPct: number }> = {
        impulsa: { umas: 6, fee: 30, commPct: 15 },
        transforma: { umas: 10, fee: 30, commPct: 8 },
        lidera: { umas: 20, fee: 30, commPct: 5 },
      };

      const confirmedPayments = await db.select({
        payment: companyPayments,
        teamPlan: teams.plan,
        partnerId: teams.partnerId,
      }).from(companyPayments)
        .leftJoin(teams, eq(companyPayments.teamId, teams.id))
        .where(and(
          eq(companyPayments.periodMonth, month),
          eq(companyPayments.periodYear, year),
          eq(companyPayments.status, "confirmed"),
        ));

      const generated: { partnerId: string; teamId: string; amount: number }[] = [];
      for (const row of confirmedPayments) {
        if (!row.partnerId) continue;
        const planKey = (row.teamPlan || "transforma").toLowerCase();
        const config = PLAN_CONFIG[planKey] || PLAN_CONFIG.transforma;
        const feeAmount = Math.round(row.payment.amount * config.fee / 100);
        const commissionAmount = Math.round(feeAmount * config.commPct / 100);
        if (commissionAmount <= 0) continue;

        const existing = await db.select().from(partnerCommissions).where(and(
          eq(partnerCommissions.partnerId, row.partnerId),
          eq(partnerCommissions.teamId, row.payment.teamId),
          eq(partnerCommissions.periodMonth, month),
          eq(partnerCommissions.periodYear, year),
        )).limit(1);
        if (existing.length > 0) continue;

        await db.insert(partnerCommissions).values({
          partnerId: row.partnerId,
          teamId: row.payment.teamId,
          paymentId: row.payment.id,
          amount: commissionAmount,
          feePercent: config.fee,
          commissionPercent: config.commPct,
          periodMonth: month,
          periodYear: year,
        });
        generated.push({ partnerId: row.partnerId, teamId: row.payment.teamId, amount: commissionAmount });
      }
      res.json({ generated: generated.length, details: generated });
    } catch (err) { next(err); }
  });

  app.patch("/api/crm/commissions/:id", requireAdmin, async (req, res, next) => {
    try {
      const { status } = req.body;
      const updates: Record<string, unknown> = { status };
      if (status === "paid") updates.paidAt = new Date();
      const [updated] = await db.update(partnerCommissions).set(updates).where(eq(partnerCommissions.id, req.params.id)).returning();
      if (!updated) return res.status(404).json({ message: "Comisión no encontrada" });
      res.json(updated);
    } catch (err) { next(err); }
  });

  app.get("/api/crm/prospects", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const acct = await db.select().from(accounts).where(eq(accounts.id, userId)).limit(1);
      const role = acct[0]?.userRole;
      const isAdminOrPartner = role === "admin" || role === "superadmin" || role === "socio_comercial" || role === "partner" || role === "director";
      if (!isAdminOrPartner) return res.status(403).json({ message: "No autorizado" });
      const isAdmin = role === "admin" || role === "superadmin";
      const where = isAdmin ? undefined : eq(prospects.partnerId, userId);
      const list = await db.select().from(prospects).where(where).orderBy(desc(prospects.createdAt));
      res.json(list);
    } catch (err) { next(err); }
  });

  app.post("/api/crm/prospects", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const acct = await db.select().from(accounts).where(eq(accounts.id, userId)).limit(1);
      const role = acct[0]?.userRole;
      if (role !== "admin" && role !== "superadmin" && role !== "socio_comercial" && role !== "partner" && role !== "director") {
        return res.status(403).json({ message: "No autorizado" });
      }
      const { companyName, contactName, contactEmail, contactPhone, collaborators, plan, stage, notes, nextFollowUp } = req.body;
      if (!companyName || typeof companyName !== "string") return res.status(400).json({ message: "Nombre de empresa requerido" });
      const validStages = ["contact", "demo", "proposal", "negotiation", "closed", "active", "lost"];
      const validPlans = ["impulsa", "transforma", "lidera"];
      const [prospect] = await db.insert(prospects).values({
        partnerId: userId,
        companyName,
        contactName: contactName || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        collaborators: collaborators ? Number(collaborators) : null,
        plan: validPlans.includes(plan) ? plan : "transforma",
        stage: validStages.includes(stage) ? stage : "contact",
        notes: notes || null,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
      }).returning();
      res.json(prospect);
    } catch (err) { next(err); }
  });

  app.patch("/api/crm/prospects/:id", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const acct = await db.select().from(accounts).where(eq(accounts.id, userId)).limit(1);
      const role = acct[0]?.userRole;
      const isAdmin = role === "admin" || role === "superadmin";
      const existing = await db.select().from(prospects).where(eq(prospects.id, req.params.id)).limit(1);
      if (!existing[0]) return res.status(404).json({ message: "Prospecto no encontrado" });
      if (!isAdmin && existing[0].partnerId !== userId) return res.status(403).json({ message: "No autorizado" });

      const updates: Record<string, unknown> = { updatedAt: new Date() };
      const allowed = ["companyName", "contactName", "contactEmail", "contactPhone", "collaborators", "plan", "stage", "notes"];
      for (const k of allowed) {
        if (req.body[k] !== undefined) updates[k] = req.body[k];
      }
      if (req.body.nextFollowUp) updates.nextFollowUp = new Date(req.body.nextFollowUp);
      const [updated] = await db.update(prospects).set(updates).where(eq(prospects.id, req.params.id)).returning();
      res.json(updated);
    } catch (err) { next(err); }
  });

  app.delete("/api/crm/prospects/:id", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const acct = await db.select().from(accounts).where(eq(accounts.id, userId)).limit(1);
      const role = acct[0]?.userRole;
      const isAdmin = role === "admin" || role === "superadmin";
      const existing = await db.select().from(prospects).where(eq(prospects.id, req.params.id)).limit(1);
      if (!existing[0]) return res.status(404).json({ message: "Prospecto no encontrado" });
      if (!isAdmin && existing[0].partnerId !== userId) return res.status(403).json({ message: "No autorizado" });
      await db.delete(prospects).where(eq(prospects.id, req.params.id));
      res.json({ ok: true });
    } catch (err) { next(err); }
  });

  app.get("/api/crm/wallets", requireAdmin, async (req, res, next) => {
    try {
      const wallets = await db.select({
        wallet: companyWallets,
        teamName: teams.name,
      }).from(companyWallets)
        .leftJoin(teams, eq(companyWallets.teamId, teams.id))
        .orderBy(asc(teams.name));
      res.json(wallets);
    } catch (err) { next(err); }
  });

  app.get("/api/crm/wallets/:teamId/transactions", requireAdmin, async (req, res, next) => {
    try {
      const teamWallets = await db.select().from(companyWallets).where(eq(companyWallets.teamId, req.params.teamId));
      const walletIds = teamWallets.map(w => w.id);
      if (walletIds.length === 0) return res.json([]);
      const txns = await db.select().from(walletTransactions)
        .where(sql`${walletTransactions.walletId} = ANY(${walletIds})`)
        .orderBy(desc(walletTransactions.createdAt));
      res.json(txns);
    } catch (err) { next(err); }
  });

  app.get("/api/crm/dispersions", requireAdmin, async (req, res, next) => {
    try {
      const list = await db.select().from(dispersions).orderBy(desc(dispersions.createdAt));
      res.json(list);
    } catch (err) { next(err); }
  });

  app.post("/api/crm/dispersions", requireAdmin, async (req, res, next) => {
    try {
      const [d] = await db.insert(dispersions).values({
        periodMonth: req.body.periodMonth,
        periodYear: req.body.periodYear,
        totalAmount: req.body.totalAmount || 0,
        companiesIncluded: req.body.companiesIncluded || 0,
        details: req.body.details,
        status: "draft",
        createdBy: req.supabaseUserId!,
      }).returning();
      res.json(d);
    } catch (err) { next(err); }
  });

  app.patch("/api/crm/dispersions/:id", requireAdmin, async (req, res, next) => {
    try {
      const updates: Record<string, unknown> = {};
      if (req.body.status) {
        updates.status = req.body.status;
        if (req.body.status === "applied") updates.appliedAt = new Date();
      }
      if (req.body.details) updates.details = req.body.details;
      const [updated] = await db.update(dispersions).set(updates).where(eq(dispersions.id, req.params.id)).returning();
      if (!updated) return res.status(404).json({ message: "Dispersión no encontrada" });
      res.json(updated);
    } catch (err) { next(err); }
  });

  // ─── Support Chat (Gestor Académico) ───

  app.get("/api/support/threads", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const threads = await storage.getSupportThreadsByUser(userId);
      res.json(threads);
    } catch (err) { next(err); }
  });

  app.post("/api/support/threads", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { subject, academyCourseId, message } = req.body;
      if (!subject || !message) return res.status(400).json({ message: "Asunto y mensaje son requeridos" });

      const thread = await storage.createSupportThread({
        userId,
        subject,
        academyCourseId: academyCourseId || null,
        status: "open",
      });

      await storage.createSupportMessage({
        threadId: thread.id,
        senderId: userId,
        senderRole: "user",
        content: message,
      });

      res.json(thread);
    } catch (err) { next(err); }
  });

  app.get("/api/support/threads/:threadId", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { threadId } = req.params;
      const thread = await storage.getSupportThread(threadId);
      if (!thread) return res.status(404).json({ message: "Conversación no encontrada" });

      const acct = await storage.getAccount(userId);
      const isStaff = acct && (acct.userRole === "admin" || acct.userRole === "superadmin" || acct.userRole === "moderator");
      if (thread.userId !== userId && !isStaff) return res.status(403).json({ message: "Sin permiso" });

      const messages = await storage.getSupportMessages(threadId);
      res.json({ thread, messages });
    } catch (err) { next(err); }
  });

  app.post("/api/support/threads/:threadId/messages", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { threadId } = req.params;
      const { content } = req.body;
      if (!content) return res.status(400).json({ message: "Mensaje requerido" });

      const thread = await storage.getSupportThread(threadId);
      if (!thread) return res.status(404).json({ message: "Conversación no encontrada" });

      const acct = await storage.getAccount(userId);
      const isStaff = acct && (acct.userRole === "admin" || acct.userRole === "superadmin" || acct.userRole === "moderator");
      if (thread.userId !== userId && !isStaff) return res.status(403).json({ message: "Sin permiso" });

      const msg = await storage.createSupportMessage({
        threadId,
        senderId: userId,
        senderRole: isStaff ? "advisor" : "user",
        content,
      });

      res.json(msg);
    } catch (err) { next(err); }
  });

  app.patch("/api/support/threads/:threadId", requireAuth, requireAdmin, async (req, res, next) => {
    try {
      const { threadId } = req.params;
      const { status } = req.body;
      if (!status || !["open", "closed"].includes(status)) return res.status(400).json({ message: "Estado inválido, debe ser 'open' o 'closed'" });

      const thread = await storage.getSupportThread(threadId);
      if (!thread) return res.status(404).json({ message: "Conversación no encontrada" });

      const updated = await storage.updateSupportThread(threadId, { status });
      res.json(updated);
    } catch (err) { next(err); }
  });

  app.get("/api/admin/support/threads", requireAuth, requireAdmin, async (_req, res, next) => {
    try {
      const threads = await storage.getAllSupportThreads();
      res.json(threads);
    } catch (err) { next(err); }
  });

  // ==================== MONTHLY CONTRIBUTIONS (SAM) ====================

  const UMA_VALUE_2026 = "113.14";

  function determinePlan(cols: number) {
    if (cols <= 10) return { plan: "impulsa", umas: 6, feePercent: 15 };
    if (cols <= 99) return { plan: "transforma", umas: 10, feePercent: 8 };
    return { plan: "lidera", umas: 20, feePercent: 5 };
  }

  app.post("/api/admin/contributions/generate", requireAuth, requireAdmin, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const user = await storage.getUser(userId);
      const now = new Date();
      const year = req.body.year || now.getFullYear();
      const month = req.body.month || (now.getMonth() + 1);

      const activeTeams = await db.select().from(teams).where(eq(teams.status, "active"));
      let generated = 0;
      const errors: string[] = [];

      for (const team of activeTeams) {
        const existing = await db.select().from(monthlyContributions)
          .where(and(
            eq(monthlyContributions.teamId, team.id),
            eq(monthlyContributions.periodYear, year),
            eq(monthlyContributions.periodMonth, month),
          ));
        if (existing.length > 0) continue;

        const memberCount = await db.select({ cnt: count() }).from(teamUsers)
          .where(eq(teamUsers.teamId, team.id));
        const cols = memberCount[0]?.cnt || 0;
        if (cols === 0) continue;

        const { plan, umas, feePercent } = determinePlan(cols);
        const umaVal = parseFloat(UMA_VALUE_2026);
        const gross = cols * umas * umaVal;
        const fee = gross * (feePercent / 100);
        const net = gross - fee;
        const dueDate = new Date(year, month - 1, 15);

        try {
          const [created] = await db.insert(monthlyContributions).values({
            teamId: team.id,
            periodYear: year,
            periodMonth: month,
            planType: plan,
            umasPerCol: umas,
            umaValue: UMA_VALUE_2026,
            activeCollaborators: cols,
            grossAmount: gross.toFixed(2),
            feePercentage: feePercent.toFixed(2),
            feeAmount: fee.toFixed(2),
            netToCooperative: net.toFixed(2),
            status: "pending",
            paymentStatus: "unpaid",
            cfdiStatus: "pending",
            dueDate,
          }).returning();

          await db.insert(contributionAuditLog).values({
            contributionId: created.id,
            action: "generated",
            actorEmail: user?.email || "system",
            metadata: { plan, cols, gross: gross.toFixed(2) },
          });

          generated++;
        } catch (err: any) {
          errors.push(`${team.name}: ${err.message}`);
        }
      }

      res.json({ generated, total: activeTeams.length, errors });
    } catch (err) { next(err); }
  });

  app.get("/api/admin/contributions", requireAuth, requireAdmin, async (req, res, next) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);

      const sams = await db.select({
        contribution: monthlyContributions,
        teamName: teams.name,
      })
        .from(monthlyContributions)
        .leftJoin(teams, eq(monthlyContributions.teamId, teams.id))
        .where(and(
          eq(monthlyContributions.periodYear, year),
          eq(monthlyContributions.periodMonth, month),
        ))
        .orderBy(desc(monthlyContributions.generatedAt));

      res.json(sams.map(s => ({ ...s.contribution, teamName: s.teamName })));
    } catch (err) { next(err); }
  });

  app.get("/api/admin/contributions/pending", requireAuth, requireAdmin, async (req, res, next) => {
    try {
      const sams = await db.select({
        contribution: monthlyContributions,
        teamName: teams.name,
      })
        .from(monthlyContributions)
        .leftJoin(teams, eq(monthlyContributions.teamId, teams.id))
        .where(eq(monthlyContributions.status, "pending"))
        .orderBy(asc(monthlyContributions.dueDate));

      res.json(sams.map(s => ({ ...s.contribution, teamName: s.teamName })));
    } catch (err) { next(err); }
  });

  app.get("/api/admin/contributions/overdue", requireAuth, requireAdmin, async (req, res, next) => {
    try {
      const sams = await db.select({
        contribution: monthlyContributions,
        teamName: teams.name,
      })
        .from(monthlyContributions)
        .leftJoin(teams, eq(monthlyContributions.teamId, teams.id))
        .where(eq(monthlyContributions.paymentStatus, "overdue"))
        .orderBy(asc(monthlyContributions.dueDate));

      res.json(sams.map(s => ({ ...s.contribution, teamName: s.teamName })));
    } catch (err) { next(err); }
  });

  app.get(["/api/teams/:teamId/contributions", "/api/companies/:teamId/contributions"], requireAuth, async (req, res, next) => {
    try {
      const { teamId } = req.params;
      const userId = req.supabaseUserId!;

      const membership = await db.select().from(teamUsers)
        .where(and(eq(teamUsers.teamId, teamId), eq(teamUsers.userId, userId)));
      const acct = await storage.getAccount(userId);
      const isAdminUser = acct && ["admin", "superadmin"].includes(acct.userRole);
      if (membership.length === 0 && !isAdminUser) {
        return res.status(403).json({ message: "Sin acceso a esta organización" });
      }

      const sams = await db.select().from(monthlyContributions)
        .where(eq(monthlyContributions.teamId, teamId))
        .orderBy(desc(monthlyContributions.periodYear), desc(monthlyContributions.periodMonth));

      checkSamAlertsForTeam(teamId).catch(() => {});

      res.json(sams);
    } catch (err) { next(err); }
  });

  app.get(["/api/teams/:teamId/contributions/current", "/api/companies/:teamId/contributions/current"], requireAuth, async (req, res, next) => {
    try {
      const { teamId } = req.params;
      const userId = req.supabaseUserId!;

      const membership = await db.select().from(teamUsers)
        .where(and(eq(teamUsers.teamId, teamId), eq(teamUsers.userId, userId)));
      const acct = await storage.getAccount(userId);
      const isAdminUser = acct && ["admin", "superadmin"].includes(acct.userRole);
      if (membership.length === 0 && !isAdminUser) {
        return res.status(403).json({ message: "Sin acceso" });
      }

      const now = new Date();
      const [current] = await db.select().from(monthlyContributions)
        .where(and(
          eq(monthlyContributions.teamId, teamId),
          eq(monthlyContributions.periodYear, now.getFullYear()),
          eq(monthlyContributions.periodMonth, now.getMonth() + 1),
        ));

      if (!current) return res.json(null);
      res.json(current);
    } catch (err) { next(err); }
  });

  app.post(["/api/teams/:teamId/contributions/:cid/confirm", "/api/companies/:teamId/contributions/:cid/confirm"], requireAuth, async (req, res, next) => {
    try {
      const { teamId, cid } = req.params;
      const userId = req.supabaseUserId!;
      const user = await storage.getUser(userId);

      const membership = await db.select().from(teamUsers)
        .where(and(eq(teamUsers.teamId, teamId), eq(teamUsers.userId, userId)));
      const isOrgAdmin = membership.some(m => m.role === "admin");
      const acct = await storage.getAccount(userId);
      const isSysAdmin = acct && ["admin", "superadmin"].includes(acct.userRole);
      if (!isOrgAdmin && !isSysAdmin) {
        return res.status(403).json({ message: "Solo el administrador puede confirmar" });
      }

      const [contribution] = await db.select().from(monthlyContributions)
        .where(and(
          eq(monthlyContributions.id, cid),
          eq(monthlyContributions.teamId, teamId),
        ));

      if (!contribution || (contribution.status !== "pending" && contribution.status !== "adjusted")) {
        return res.status(400).json({ message: "No se puede confirmar esta solicitud" });
      }

      const crypto = await import("crypto");
      const confirmDoc = JSON.stringify({
        contributionId: cid,
        companyId: teamId,
        period: `${contribution.periodYear}-${contribution.periodMonth}`,
        plan: contribution.planType,
        collaborators: contribution.adjustedCollaborators || contribution.activeCollaborators,
        amount: contribution.adjustedAmount || contribution.grossAmount,
        confirmedAt: new Date().toISOString(),
        confirmedBy: user?.email,
      });
      const hash = crypto.createHash("sha256").update(confirmDoc).digest("hex");

      const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
      const ua = req.headers["user-agent"] || "unknown";

      await db.update(monthlyContributions)
        .set({
          status: "confirmed",
          confirmedAt: new Date(),
          confirmedBy: userId,
          confirmationIp: clientIp,
          confirmationUserAgent: ua,
          confirmationHash: hash,
        })
        .where(eq(monthlyContributions.id, cid));

      await db.insert(contributionAuditLog).values({
        contributionId: cid,
        action: "confirmed",
        actorEmail: user?.email || "unknown",
        actorIp: clientIp,
        actorUserAgent: ua,
        documentHash: hash,
        metadata: {
          amount: contribution.adjustedAmount || contribution.grossAmount,
          collaborators: contribution.adjustedCollaborators || contribution.activeCollaborators,
        },
      });

      const confirmEmailData = {
        periodYear: contribution.periodYear,
        periodMonth: contribution.periodMonth || 1,
        planType: contribution.planType,
        collaborators: contribution.adjustedCollaborators || contribution.activeCollaborators,
        grossAmount: contribution.adjustedAmount || contribution.grossAmount,
        feeAmount: contribution.feeAmount,
        feePercentage: contribution.feePercentage,
        netToCooperative: contribution.netToCooperative,
        hash,
        confirmedAt: new Date().toISOString(),
        confirmedByName: user?.fullName || user?.email || "Usuario",
      };

      const orgAdmins = await db.select().from(teamUsers)
        .where(and(eq(teamUsers.teamId, teamId), eq(teamUsers.role, "admin")));
      const recipientEmails = new Set<string>();
      for (const admin of orgAdmins) {
        const adminUser = await storage.getUser(admin.userId);
        if (adminUser?.email) recipientEmails.add(adminUser.email);
      }
      if (user?.email) recipientEmails.add(user.email);

      for (const email of recipientEmails) {
        sendSamConfirmationEmail(email, confirmEmailData)
          .catch(err => console.error("[SAM] Confirmation email error:", err.message));
      }


      res.json({ success: true, hash, message: "Aportación confirmada exitosamente" });
    } catch (err) { next(err); }
  });

  app.put(["/api/teams/:teamId/contributions/:cid/adjust", "/api/companies/:teamId/contributions/:cid/adjust"], requireAuth, async (req, res, next) => {
    try {
      const { teamId, cid } = req.params;
      const userId = req.supabaseUserId!;
      const user = await storage.getUser(userId);
      const { collaborators, reason } = req.body;

      if (!collaborators || collaborators < 1) {
        return res.status(400).json({ message: "Número de colaboradores inválido" });
      }

      const membership = await db.select().from(teamUsers)
        .where(and(eq(teamUsers.teamId, teamId), eq(teamUsers.userId, userId)));
      const isOrgAdmin = membership.some(m => m.role === "admin");
      const acct = await storage.getAccount(userId);
      const isSysAdmin = acct && ["admin", "superadmin"].includes(acct.userRole);
      if (!isOrgAdmin && !isSysAdmin) {
        return res.status(403).json({ message: "Sin permisos" });
      }

      const [contribution] = await db.select().from(monthlyContributions)
        .where(and(
          eq(monthlyContributions.id, cid),
          eq(monthlyContributions.teamId, teamId),
        ));

      if (!contribution || contribution.status !== "pending") {
        return res.status(400).json({ message: "Solo se pueden ajustar solicitudes pendientes" });
      }

      const { plan, umas, feePercent } = determinePlan(collaborators);
      const umaVal = parseFloat(contribution.umaValue);
      const newGross = collaborators * umas * umaVal;
      const newFee = newGross * (feePercent / 100);
      const newNet = newGross - newFee;

      await db.update(monthlyContributions)
        .set({
          adjustedCollaborators: collaborators,
          adjustedAmount: newGross.toFixed(2),
          adjustmentReason: reason || "Ajuste de colaboradores",
          planType: plan,
          umasPerCol: umas,
          feePercentage: feePercent.toFixed(2),
          feeAmount: newFee.toFixed(2),
          netToCooperative: newNet.toFixed(2),
          grossAmount: newGross.toFixed(2),
          status: "adjusted",
        })
        .where(eq(monthlyContributions.id, cid));

      await db.insert(contributionAuditLog).values({
        contributionId: cid,
        action: "adjusted",
        actorEmail: user?.email || "unknown",
        metadata: {
          previousCollaborators: contribution.activeCollaborators,
          newCollaborators: collaborators,
          previousAmount: contribution.grossAmount,
          newAmount: newGross.toFixed(2),
          reason: reason || "Ajuste de colaboradores",
        },
      });

      res.json({
        success: true,
        newAmount: newGross.toFixed(2),
        plan,
        message: "Ajuste aplicado. Ahora puedes confirmar la aportación.",
      });
    } catch (err) { next(err); }
  });

  const SAM_MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  async function checkSamAlertsForTeam(teamId: string): Promise<void> {
    try {
      const pendingContributions = await db.select().from(monthlyContributions)
        .where(and(
          eq(monthlyContributions.teamId, teamId),
          sql`${monthlyContributions.status} IN ('pending', 'adjusted')`
        ));

      const now = new Date();

      for (const contrib of pendingContributions) {
        if (!contrib.generatedAt) continue;
        const generated = new Date(contrib.generatedAt);
        const daysSince = Math.floor((now.getTime() - generated.getTime()) / (1000 * 60 * 60 * 24));
        const monthName = SAM_MONTH_NAMES[(contrib.periodMonth || 1) - 1];
        const amount = contrib.adjustedAmount || contrib.grossAmount;

        if (daysSince >= 10 && !contrib.secondReminderSentAt) {
          const adminMembers = await db.select().from(teamUsers)
            .where(and(eq(teamUsers.teamId, contrib.teamId), eq(teamUsers.role, "admin")));
          let reminderSent = false;
          for (const member of adminMembers) {
            const adminUser = await storage.getUser(member.userId);
            if (adminUser?.email) {
              try {
                await sendSamReminderEmail(adminUser.email, monthName, contrib.periodYear, amount, daysSince, true);
                reminderSent = true;
              } catch (err: any) {
                console.error("[SAM alerts] 2nd reminder error:", err.message);
              }
            }
          }

          if (reminderSent) {
            await db.update(monthlyContributions)
              .set({ secondReminderSentAt: now })
              .where(eq(monthlyContributions.id, contrib.id));
          }

          if (!contrib.partnerNotifiedAt) {
            const team = await storage.getTeam(contrib.teamId);
            if (team) {
              let partnerNotified = false;
              for (const admin of adminMembers) {
                const adminAcct = await storage.getAccount(admin.userId);
                if (adminAcct?.referredBy) {
                  const [refCode] = await db.select().from(referralCodes)
                    .where(eq(referralCodes.code, adminAcct.referredBy));
                  if (refCode) {
                    const partnerUser = await storage.getUser(refCode.ownerId);
                    if (partnerUser?.email) {
                      try {
                        await sendSamPartnerNotificationEmail(partnerUser.email, team.name, monthName, contrib.periodYear, amount, daysSince);
                        partnerNotified = true;
                      } catch (err: any) {
                        console.error("[SAM alerts] Partner notification error:", err.message);
                      }
                    }
                  }
                  break;
                }
              }

              if (partnerNotified) {
                await db.update(monthlyContributions)
                  .set({ partnerNotifiedAt: now })
                  .where(eq(monthlyContributions.id, contrib.id));
              }
            }
          }
        } else if (daysSince >= 5 && !contrib.firstReminderSentAt) {
          const adminMembers = await db.select().from(teamUsers)
            .where(and(eq(teamUsers.teamId, contrib.teamId), eq(teamUsers.role, "admin")));
          let reminderSent = false;
          for (const member of adminMembers) {
            const adminUser = await storage.getUser(member.userId);
            if (adminUser?.email) {
              try {
                await sendSamReminderEmail(adminUser.email, monthName, contrib.periodYear, amount, daysSince, false);
                reminderSent = true;
              } catch (err: any) {
                console.error("[SAM alerts] 1st reminder error:", err.message);
              }
            }
          }

          if (reminderSent) {
            await db.update(monthlyContributions)
              .set({ firstReminderSentAt: now })
              .where(eq(monthlyContributions.id, contrib.id));
          }
        }
      }
    } catch (err) {
      console.error("[SAM alerts] Error checking alerts for team", teamId, err);
    }
  }

  app.get("/api/teams/:teamId/contributions/alerts", requireAuth, async (req, res, next) => {
    try {
      const { teamId } = req.params;
      const userId = req.supabaseUserId!;

      const membership = await db.select().from(teamUsers)
        .where(and(eq(teamUsers.teamId, teamId), eq(teamUsers.userId, userId)));
      if (membership.length === 0) {
        const acct = await storage.getAccount(userId);
        if (!acct || !["admin", "superadmin"].includes(acct.userRole)) {
          return res.status(403).json({ message: "Sin permisos" });
        }
      }

      const contributions = await db.select().from(monthlyContributions)
        .where(and(
          eq(monthlyContributions.teamId, teamId),
          sql`${monthlyContributions.status} IN ('pending', 'adjusted')`
        ));

      const now = new Date();
      const alertItems = contributions.map(c => {
        if (!c.generatedAt) return null;
        const generated = new Date(c.generatedAt);
        const daysSince = Math.floor((now.getTime() - generated.getTime()) / (1000 * 60 * 60 * 24));
        let level: "normal" | "warning" | "urgent" | "overdue" = "normal";
        if (daysSince >= 16) level = "overdue";
        else if (daysSince >= 10) level = "urgent";
        else if (daysSince >= 5) level = "warning";
        return { contributionId: c.id, periodYear: c.periodYear, periodMonth: c.periodMonth, daysSince, level, amount: c.adjustedAmount || c.grossAmount };
      }).filter(Boolean);

      res.json(alertItems);
    } catch (err) { next(err); }
  });

  app.post("/api/admin/contributions/:cid/payment", requireAuth, requireAdmin, async (req, res, next) => {
    try {
      const { cid } = req.params;
      const userId = req.supabaseUserId!;
      const user = await storage.getUser(userId);
      const { method, reference, receiptUrl } = req.body;

      const [contribution] = await db.select().from(monthlyContributions)
        .where(eq(monthlyContributions.id, cid));

      if (!contribution) {
        return res.status(404).json({ message: "Solicitud no encontrada" });
      }

      if (contribution.status !== "confirmed") {
        return res.status(400).json({ message: "La solicitud debe estar confirmada antes de registrar pago" });
      }

      await db.update(monthlyContributions)
        .set({
          paymentStatus: "paid",
          paymentDate: new Date(),
          paymentMethod: method || "spei",
          paymentReference: reference,
          paymentReceiptUrl: receiptUrl,
          status: "paid",
        })
        .where(eq(monthlyContributions.id, cid));

      await db.insert(contributionAuditLog).values({
        contributionId: cid,
        action: "payment_registered",
        actorEmail: user?.email || "admin",
        metadata: { method, reference, amount: contribution.adjustedAmount || contribution.grossAmount },
      });

      res.json({ success: true, message: "Pago registrado exitosamente" });
    } catch (err) { next(err); }
  });

  app.get(["/api/teams/:teamId/contributions/:cid/audit", "/api/companies/:teamId/contributions/:cid/audit"], requireAuth, async (req, res, next) => {
    try {
      const { teamId, cid } = req.params;
      const userId = req.supabaseUserId!;

      const acct = await storage.getAccount(userId);
      const isSysAdmin = acct && ["admin", "superadmin"].includes(acct.userRole);
      const membership = await db.select().from(teamUsers)
        .where(and(eq(teamUsers.teamId, teamId), eq(teamUsers.userId, userId)));
      if (membership.length === 0 && !isSysAdmin) {
        return res.status(403).json({ message: "Sin acceso" });
      }

      const [contribution] = await db.select().from(monthlyContributions)
        .where(and(
          eq(monthlyContributions.id, cid),
          eq(monthlyContributions.teamId, teamId),
        ));
      if (!contribution) {
        return res.status(404).json({ message: "Solicitud no encontrada para esta organización" });
      }

      const logs = await db.select().from(contributionAuditLog)
        .where(eq(contributionAuditLog.contributionId, cid))
        .orderBy(asc(contributionAuditLog.createdAt));

      res.json(logs);
    } catch (err) { next(err); }
  });

  async function seedContactCards() {
    const seedCards = [
      { slug: "danielzavala", displayName: "Dr. Daniel Zavala Estrada", title: "Socio y Director Jurídico y Fiscal", phone: "+529984919697", email: "danielzavala@ceduverse.org" },
      { slug: "leonardoherrera", displayName: "Leonardo Herrera Gasca", title: "Socio y Director Comercial Norte", phone: "+528111848109", email: "leonardoherrera@ceduverse.org" },
      { slug: "davidperez", displayName: "David Pérez Villaseñor", title: "Socio y Director Operativo", phone: "+529985933232", email: "davidperez@ceduverse.org" },
      { slug: "yuridiaiturriaga", displayName: "Psic. Yuridia Iturriaga", title: "Instructor Acreditado STPS (DC-5)", email: "yuridiaiturriaga@ceduverse.org" },
      { slug: "jorgemedina", displayName: "Ing. Jorge Armando Medina Castillo", title: "Instructor Acreditado STPS (DC-5)", email: "jorgemedina@ceduverse.org" },
    ];
    for (const card of seedCards) {
      const existing = await storage.getContactCardBySlug(card.slug);
      if (!existing) {
        await storage.createContactCard({
          slug: card.slug,
          displayName: card.displayName,
          title: card.title,
          organization: "Ceduverse",
          phone: (card as any).phone || null,
          email: card.email,
          website: "https://ceduverse.org",
          isActive: true,
        });
      }
    }
  }
  seedContactCards().catch(err => console.error("Error seeding contact cards:", err));

  function generateSlug(fullName: string): string {
    return fullName
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 50);
  }

  async function getUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 2;
    while (!(await storage.isSlugAvailable(slug, excludeId))) {
      slug = `${baseSlug}${counter}`;
      counter++;
    }
    return slug;
  }

  function getInitialsFromName(name: string): string {
    return name
      .replace(/^(Dr\.|Ing\.|Lic\.|Mtro\.|Mtra\.|Psic\.)\s*/i, "")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  async function createOrUpdateContactCard(userId: string, overrides?: Partial<{ title: string; avatarUrl: string }>) {
    const existingCard = await storage.getContactCardByUserId(userId);
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId));
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const [instructorProfile] = await db.select().from(instructorProfiles).where(eq(instructorProfiles.id, userId));

    const fullName = profile?.fullName || user?.email?.split("@")[0] || "Usuario";
    const phone = profile?.phoneNumber || null;
    const email = user?.email || null;
    const avatarUrl = overrides?.avatarUrl || instructorProfile?.profileImageUrl || null;
    const title = overrides?.title || existingCard?.title || "Socio Cooperativo";

    if (existingCard) {
      await storage.updateContactCard(existingCard.id, {
        displayName: fullName,
        title,
        phone,
        email,
        avatarUrl,
        avatarInitials: getInitialsFromName(fullName),
      });
    } else {
      const baseSlug = generateSlug(fullName);
      const slug = await getUniqueSlug(baseSlug);
      await storage.createContactCard({
        userId,
        slug,
        displayName: fullName,
        title,
        organization: "Ceduverse",
        phone,
        email,
        website: "https://ceduverse.org",
        avatarUrl,
        avatarInitials: getInitialsFromName(fullName),
        isActive: true,
      });
    }
  }

  app.get("/api/vcard/:slug", async (req, res, next) => {
    try {
      const card = await storage.getContactCardBySlug(req.params.slug);
      if (!card || !card.isActive) return res.status(404).json({ message: "Contacto no encontrado" });

      const nameParts = card.displayName.split(" ");
      const lastName = nameParts.slice(1).join(" ");
      const firstName = nameParts[0];

      const vcf = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${card.displayName}`,
        `N:${lastName};${firstName};;;`,
        `ORG:${card.organization || "Ceduverse"}`,
        `TITLE:${card.title}`,
        card.phone ? `TEL;TYPE=CELL:${card.phone}` : "",
        card.email ? `EMAIL:${card.email}` : "",
        `URL:${card.website || "https://ceduverse.org"}`,
        "END:VCARD",
      ].filter(Boolean).join("\r\n");

      res.setHeader("Content-Type", "text/vcard; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${req.params.slug}.vcf"`);
      res.send(vcf);
    } catch (err) { next(err); }
  });

  app.get("/api/vcard-data/:slug", async (req, res, next) => {
    try {
      const card = await storage.getContactCardBySlug(req.params.slug);
      if (!card || !card.isActive) return res.status(404).json({ message: "Contacto no encontrado" });
      res.json({
        fullName: card.displayName,
        title: card.title,
        phone: card.phone || "",
        email: card.email || "",
        website: card.website || "https://ceduverse.org",
        organization: card.organization || "Ceduverse",
        avatarUrl: card.avatarUrl || null,
        avatarInitials: card.avatarInitials || null,
        avatarColor: card.avatarColor || null,
      });
    } catch (err) { next(err); }
  });

  app.get("/api/me/contact-card", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const card = await storage.getContactCardByUserId(userId);
      res.json(card || null);
    } catch (err) { next(err); }
  });

  app.patch("/api/me/contact-card/slug", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { slug } = req.body;
      if (!slug || typeof slug !== "string") return res.status(400).json({ message: "Slug requerido" });

      const cleanSlug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 50);
      if (!cleanSlug || cleanSlug.length < 3) return res.status(400).json({ message: "El slug debe tener al menos 3 caracteres" });

      const card = await storage.getContactCardByUserId(userId);
      if (!card) return res.status(404).json({ message: "No tienes tarjeta de contacto" });

      const available = await storage.isSlugAvailable(cleanSlug, card.id);
      if (!available) return res.status(409).json({ message: "Este slug ya está en uso" });

      const updated = await storage.updateContactCard(card.id, { slug: cleanSlug });
      res.json(updated);
    } catch (err) { next(err); }
  });

  app.get("/api/facturapi/status", requireAdmin, (_req, res) => {
    res.json({ configured: facturapi.isConfigured(), sandbox: facturapi.isConfigured() ? facturapi.isSandboxMode() : null });
  });

  app.patch("/api/admin/orgs/:id/fiscal", requireAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        rfc: z.string().min(12).max(13).regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i, "RFC con formato inválido"),
        razonSocial: z.string().min(1),
        regimenFiscal: z.string().regex(/^\d{3}$/, "Régimen fiscal debe ser código de 3 dígitos"),
        codigoPostalFiscal: z.string().regex(/^\d{5}$/, "Código postal debe ser 5 dígitos"),
      });
      const parsed = schema.parse(req.body);

      const [team] = await db.select().from(teams).where(eq(teams.id, id));
      if (!team) return res.status(404).json({ message: "Empresa no encontrada" });

      let facturapiCustomerId = team.facturapiCustomerId;

      if (facturapi.isConfigured()) {
        if (facturapiCustomerId) {
          await facturapi.updateCustomer(facturapiCustomerId, {
            legalName: parsed.razonSocial,
            taxId: parsed.rfc,
            taxSystem: parsed.regimenFiscal,
            zip: parsed.codigoPostalFiscal,
          });
        } else {
          const customer = await facturapi.createCustomer({
            legalName: parsed.razonSocial,
            taxId: parsed.rfc,
            taxSystem: parsed.regimenFiscal,
            zip: parsed.codigoPostalFiscal,
          });
          facturapiCustomerId = customer.id;
        }
      }

      await db.update(teams).set({
        rfc: parsed.rfc,
        razonSocial: parsed.razonSocial,
        regimenFiscal: parsed.regimenFiscal,
        codigoPostalFiscal: parsed.codigoPostalFiscal,
        facturapiCustomerId,
        updatedAt: new Date(),
      }).where(eq(teams.id, id));

      const [updated] = await db.select().from(teams).where(eq(teams.id, id));
      res.json(updated);
    } catch (err) { next(err); }
  });

  app.post("/api/admin/invoices", requireAdmin, async (req, res, next) => {
    try {
      const schema = z.object({
        teamId: z.string(),
        contributionId: z.string().uuid().optional(),
        invoiceType: z.enum(["contribution", "certification"]),
        concept: z.string().min(1),
        subtotal: z.number().positive(),
        paymentForm: z.string().default("03"),
        productKey: z.string().default("86101700"),
      });
      const parsed = schema.parse(req.body);

      const [team] = await db.select().from(teams).where(eq(teams.id, parsed.teamId));
      if (!team) return res.status(404).json({ message: "Empresa no encontrada" });
      if (!team.rfc || !team.razonSocial) return res.status(400).json({ message: "Empresa sin datos fiscales completos (RFC / Razón Social)" });

      if (parsed.contributionId) {
        const [contrib] = await db.select().from(monthlyContributions)
          .where(and(eq(monthlyContributions.id, parsed.contributionId), eq(monthlyContributions.teamId, parsed.teamId)));
        if (!contrib) return res.status(400).json({ message: "La aportación no pertenece a esta empresa" });

        const existingInvoices = await db.select().from(invoices)
          .where(and(eq(invoices.contributionId, parsed.contributionId), sql`${invoices.status} != 'cancelled'`));
        if (existingInvoices.length > 0) return res.status(400).json({ message: "Ya existe una factura activa para esta aportación" });
      }

      const tax = Math.round(parsed.subtotal * 0.16 * 100) / 100;
      const total = Math.round((parsed.subtotal + tax) * 100) / 100;

      let facturapiInvoiceId: string | null = null;
      let cfdiUuid: string | null = null;
      let series: string | null = null;
      let folioNumber: number | null = null;
      let pdfUrl: string | null = null;
      let xmlUrl: string | null = null;
      let invoiceStatus: "draft" | "active" | "cancelled" = "draft";

      let resolvedCustomerId = team.facturapiCustomerId;
      if (facturapi.isConfigured() && !resolvedCustomerId && team.rfc && team.razonSocial && team.regimenFiscal && team.codigoPostalFiscal) {
        const customer = await facturapi.createCustomer({
          legalName: team.razonSocial,
          taxId: team.rfc,
          taxSystem: team.regimenFiscal,
          zip: team.codigoPostalFiscal,
        });
        resolvedCustomerId = customer.id;
        await db.update(teams).set({ facturapiCustomerId: resolvedCustomerId, updatedAt: new Date() }).where(eq(teams.id, parsed.teamId));
      }

      if (facturapi.isConfigured() && resolvedCustomerId) {
        const inv = await facturapi.createInvoice({
          customerId: resolvedCustomerId,
          items: [{
            description: parsed.concept,
            quantity: 1,
            price: parsed.subtotal,
            product_key: parsed.productKey,
          }],
          paymentForm: parsed.paymentForm,
        });
        facturapiInvoiceId = inv.id;
        cfdiUuid = inv.uuid;
        series = inv.series;
        folioNumber = inv.folio_number;
        pdfUrl = `https://www.facturapi.io/v2/invoices/${inv.id}/pdf`;
        xmlUrl = `https://www.facturapi.io/v2/invoices/${inv.id}/xml`;
        invoiceStatus = "active";
      }

      const [invoice] = await db.insert(invoices).values({
        teamId: parsed.teamId,
        contributionId: parsed.contributionId || null,
        invoiceType: parsed.invoiceType,
        facturapiInvoiceId,
        cfdiUuid,
        series,
        folioNumber,
        status: invoiceStatus,
        total: total.toString(),
        subtotal: parsed.subtotal.toString(),
        tax: tax.toString(),
        concept: parsed.concept,
        pdfUrl,
        xmlUrl,
        createdBy: req.supabaseUserId!,
      }).returning();

      if (parsed.contributionId && cfdiUuid) {
        await db.update(monthlyContributions).set({
          cfdiUuid,
          cfdiStatus: "emitido",
        }).where(eq(monthlyContributions.id, parsed.contributionId));
      }

      res.json(invoice);
    } catch (err) { next(err); }
  });

  app.get("/api/admin/invoices", requireAdmin, async (req, res, next) => {
    try {
      const teamId = req.query.teamId as string | undefined;
      let query = db.select().from(invoices).orderBy(desc(invoices.createdAt));
      if (teamId) {
        query = query.where(eq(invoices.teamId, teamId)) as typeof query;
      }
      const rows = await query.limit(200);
      res.json(rows);
    } catch (err) { next(err); }
  });

  app.get("/api/admin/invoices/:id", requireAdmin, async (req, res, next) => {
    try {
      const [invoice] = await db.select().from(invoices).where(eq(invoices.id, req.params.id));
      if (!invoice) return res.status(404).json({ message: "Factura no encontrada" });
      res.json(invoice);
    } catch (err) { next(err); }
  });

  app.post("/api/admin/invoices/:id/cancel", requireAdmin, async (req, res, next) => {
    try {
      const [invoice] = await db.select().from(invoices).where(eq(invoices.id, req.params.id));
      if (!invoice) return res.status(404).json({ message: "Factura no encontrada" });
      if (invoice.status === "cancelled") return res.status(400).json({ message: "Ya está cancelada" });

      const reason = (req.body.reason as string) || "02";

      if (invoice.facturapiInvoiceId && facturapi.isConfigured()) {
        await facturapi.cancelInvoice(invoice.facturapiInvoiceId, reason);
      }

      await db.update(invoices).set({
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationReason: reason,
      }).where(eq(invoices.id, req.params.id));

      if (invoice.contributionId) {
        await db.update(monthlyContributions).set({
          cfdiStatus: "cancelado",
        }).where(eq(monthlyContributions.id, invoice.contributionId));
      }

      const [updated] = await db.select().from(invoices).where(eq(invoices.id, req.params.id));
      res.json(updated);
    } catch (err) { next(err); }
  });

  app.get("/api/admin/invoices/:id/download/:format", requireAdmin, async (req, res, next) => {
    try {
      const format = req.params.format as "pdf" | "xml";
      if (!["pdf", "xml"].includes(format)) return res.status(400).json({ message: "Formato inválido" });

      const [invoice] = await db.select().from(invoices).where(eq(invoices.id, req.params.id));
      if (!invoice) return res.status(404).json({ message: "Factura no encontrada" });
      if (!invoice.facturapiInvoiceId) return res.status(400).json({ message: "Factura sin ID de Facturapi" });

      if (!facturapi.isConfigured()) return res.status(503).json({ message: "Facturapi no configurado" });

      const buffer = await facturapi.downloadInvoice(invoice.facturapiInvoiceId, format);
      const contentType = format === "pdf" ? "application/pdf" : "application/xml";
      const filename = `CFDI-${invoice.cfdiUuid || invoice.id}.${format}`;
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (err) { next(err); }
  });

  app.get("/api/empresa/invoices", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const userTeams = await db.select({ teamId: teamUsers.teamId })
        .from(teamUsers).where(eq(teamUsers.userId, userId));
      if (!userTeams.length) return res.json([]);

      const teamIds = userTeams.map(t => t.teamId);
      const rows = await db.select().from(invoices)
        .where(sql`${invoices.teamId} = ANY(${teamIds})`)
        .orderBy(desc(invoices.createdAt))
        .limit(100);
      res.json(rows);
    } catch (err) { next(err); }
  });

  app.get("/api/empresa/invoices/:id/download/:format", requireAuth, async (req, res, next) => {
    try {
      const format = req.params.format as "pdf" | "xml";
      if (!["pdf", "xml"].includes(format)) return res.status(400).json({ message: "Formato inválido" });

      const userId = req.supabaseUserId!;
      const [invoice] = await db.select().from(invoices).where(eq(invoices.id, req.params.id));
      if (!invoice) return res.status(404).json({ message: "Factura no encontrada" });

      const userTeams = await db.select({ teamId: teamUsers.teamId })
        .from(teamUsers).where(and(eq(teamUsers.userId, userId), eq(teamUsers.teamId, invoice.teamId)));
      if (!userTeams.length) return res.status(403).json({ message: "Sin acceso" });

      if (!invoice.facturapiInvoiceId || !facturapi.isConfigured()) {
        return res.status(400).json({ message: "Factura no disponible para descarga" });
      }

      const buffer = await facturapi.downloadInvoice(invoice.facturapiInvoiceId, format);
      const contentType = format === "pdf" ? "application/pdf" : "application/xml";
      const filename = `CFDI-${invoice.cfdiUuid || invoice.id}.${format}`;
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (err) { next(err); }
  });

  const STPS_HIGH_RISK_SCIAN = [
    "31", "32", "33", "21", "23", "48", "49", "11",
  ];

  const NOM_MAP: Record<string, string[]> = {
    "31": ["NOM-035", "NOM-006", "NOM-004"],
    "32": ["NOM-035", "NOM-010", "NOM-005"],
    "33": ["NOM-035", "NOM-004", "NOM-011"],
    "21": ["NOM-035", "NOM-023", "NOM-032"],
    "23": ["NOM-035", "NOM-009", "NOM-002"],
    "48": ["NOM-035", "NOM-087", "NOM-006"],
    "49": ["NOM-035", "NOM-006"],
    "11": ["NOM-035", "NOM-003", "NOM-007"],
    "43": ["NOM-035", "NOM-030"],
    "46": ["NOM-035", "NOM-001"],
    "51": ["NOM-035", "NOM-036"],
    "52": ["NOM-035"],
    "53": ["NOM-035"],
    "54": ["NOM-035", "NOM-036"],
    "56": ["NOM-035"],
    "61": ["NOM-035"],
    "62": ["NOM-035", "NOM-010"],
    "71": ["NOM-035"],
    "72": ["NOM-035"],
    "81": ["NOM-035"],
  };

  function calculateLeadScore(row: {
    empleadosMin?: number;
    empleadosMax?: number;
    codigoScian?: string;
    sitioWeb?: string;
    correoElectronico?: string;
    estratoPersonal?: string;
  }) {
    let sizeScore = 10;
    const avg = ((row.empleadosMin || 0) + (row.empleadosMax || 0)) / 2;
    if (avg >= 251) sizeScore = 25;
    else if (avg >= 101) sizeScore = 22;
    else if (avg >= 51) sizeScore = 18;
    else if (avg >= 11) sizeScore = 14;

    let stpsRisk = 8;
    const scian2 = (row.codigoScian || "").substring(0, 2);
    if (STPS_HIGH_RISK_SCIAN.includes(scian2)) stpsRisk = 25;
    else if (["43", "46", "62"].includes(scian2)) stpsRisk = 18;
    else if (["51", "52", "53", "54"].includes(scian2)) stpsRisk = 12;

    let digitalPresence = 0;
    if (row.sitioWeb && row.sitioWeb.trim().length > 0) digitalPresence += 8;
    if (row.correoElectronico && row.correoElectronico.trim().length > 0) digitalPresence += 7;

    let economicPotential = 0;
    if (avg >= 251) economicPotential = 15;
    else if (avg >= 101) economicPotential = 12;
    else if (avg >= 51) economicPotential = 10;
    else if (avg >= 11) economicPotential = 7;
    else if (avg >= 1) economicPotential = 3;

    return {
      total: Math.min(80, sizeScore + stpsRisk + digitalPresence + economicPotential),
      desglose: { tamaño: sizeScore, riesgoSTPS: stpsRisk, presenciaDigital: digitalPresence, potencialEconomico: economicPotential },
    };
  }

  function parseEmployeeRange(estrato: string): { min: number; max: number } {
    if (!estrato) return { min: 0, max: 0 };
    const s = estrato.toLowerCase().trim();
    if (s.includes("251") && s.includes("más")) return { min: 251, max: 500 };
    const match = s.match(/(\d+)\s*a\s*(\d+)/);
    if (match) return { min: parseInt(match[1]), max: parseInt(match[2]) };
    if (s.includes("0 a 5") || s === "0 a 5 personas") return { min: 0, max: 5 };
    if (s.includes("6 a 10")) return { min: 6, max: 10 };
    if (s.includes("11 a 30")) return { min: 11, max: 30 };
    if (s.includes("31 a 50")) return { min: 31, max: 50 };
    if (s.includes("51 a 100")) return { min: 51, max: 100 };
    if (s.includes("101 a 250")) return { min: 101, max: 250 };
    return { min: 0, max: 0 };
  }

  function normalizeName(name: string): string {
    return name.replace(/\s+/g, " ").trim()
      .replace(/\b\w/g, c => c.toUpperCase())
      .replace(/\bS\.?a\.?\s*de\s*c\.?v\.?/gi, "S.A. de C.V.")
      .replace(/\bS\.?c\.?\s*/gi, "S.C. ")
      .replace(/\bS\.?p\.?r\.?\s*de\s*r\.?l\.?/gi, "S.P.R. de R.L.");
  }

  const csvUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

  app.post("/api/denue/import", requireAdminOrPartner, csvUpload.single("file"), async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ message: "Se requiere un archivo CSV" });

      const filterMunicipios = req.body.municipios ? String(req.body.municipios).split(",").map(s => s.trim().toLowerCase()).filter(Boolean) : [];
      const filterEmpleadosMin = req.body.empleadosMin ? parseInt(req.body.empleadosMin) : 0;
      const filterEmpleadosMax = req.body.empleadosMax ? parseInt(req.body.empleadosMax) : Infinity;
      const filterScianCodes = req.body.scianCodes ? String(req.body.scianCodes).split(",").map(s => s.trim()).filter(Boolean) : [];

      let csvText = req.file.buffer.toString("utf-8");
      if (csvText.includes("�") || csvText.includes("\ufffd")) {
        const iconv = require("iconv-lite");
        csvText = iconv.decode(req.file.buffer, "latin1");
      }
      const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length < 2) return res.status(400).json({ message: "CSV vacío o sin datos" });

      const headerLine = lines[0];
      const sep = headerLine.includes("\t") ? "\t" : ",";
      const headers = headerLine.split(sep).map(h => h.replace(/"/g, "").trim().toLowerCase());

      const fieldMap: Record<string, string[]> = {
        denueId: ["id", "clee", "id_denue", "denue_id"],
        nombreComercial: ["nom_estab", "nombre_comercial", "nombre", "establecimiento", "nombre_del_establecimiento"],
        razonSocial: ["raz_social", "razon_social"],
        actividadEconomica: ["nombre_act", "actividad_economica", "actividad", "nombre_de_la_actividad"],
        codigoScian: ["codigo_act", "codigo_scian", "codigo", "codigo_de_la_clase_de_la_actividad"],
        tipoEstablecimiento: ["tipo_estab", "per_ocu", "tipo_establecimiento"],
        estratoPersonal: ["estrato", "per_ocu", "estrato_personal", "estrato_de_personal_ocupado", "personal_ocupado"],
        telefono: ["telefono", "tel", "numero_de_telefono"],
        correoElectronico: ["correoelec", "correo_e", "correo", "email", "correo_electronico"],
        sitioWeb: ["www", "sitio_web", "pagina_web", "sitio_internet"],
        tipoVialidad: ["tipo_vial", "tipo_v_e_1", "tipo_vialidad", "tipo_de_vialidad"],
        calle: ["nom_vial", "nom_v_e_1", "calle", "nombre_de_la_vialidad"],
        numExterior: ["numero_ext", "num_exterior", "numero_exterior"],
        numInterior: ["numero_int", "letra_ext", "num_interior"],
        colonia: ["nomb_asent", "e_tipo_asent", "colonia", "nombre_del_asentamiento"],
        codigoPostal: ["cod_postal", "codigo_postal"],
        municipio: ["municipio", "nom_mun", "nombre_del_municipio"],
        estado: ["entidad_federativa", "entidad", "estado", "nombre_de_la_entidad_federativa"],
        latitud: ["latitud", "lat", "y"],
        longitud: ["longitud", "lng", "lon", "x"],
        fechaAlta: ["fecha_alta", "fecha_incorporacion_al_denue"],
      };

      function findCol(field: string): number {
        const aliases = fieldMap[field] || [field];
        for (const alias of aliases) {
          const idx = headers.indexOf(alias);
          if (idx >= 0) return idx;
        }
        return -1;
      }

      function parseCsvLine(line: string): string[] {
        const result: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const c = line[i];
          if (c === '"') { inQuotes = !inQuotes; continue; }
          if (c === sep && !inQuotes) { result.push(current.trim()); current = ""; continue; }
          current += c;
        }
        result.push(current.trim());
        return result;
      }

      const batchId = `import-${Date.now()}`;
      let imported = 0;
      let skipped = 0;
      let duplicates = 0;

      const existingDenueIds = new Set<string>();
      const existing = await db.select({ denueId: empresasProspectos.denueId }).from(empresasProspectos);
      existing.forEach(e => { if (e.denueId) existingDenueIds.add(e.denueId); });

      type DenueInsertRow = typeof empresasProspectos.$inferInsert;
      const batchInserts: DenueInsertRow[] = [];
      let filtered = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        if (cols.length < 3) { skipped++; continue; }

        const getVal = (field: string) => {
          const idx = findCol(field);
          return idx >= 0 && idx < cols.length ? cols[idx] : "";
        };

        const denueId = getVal("denueId");
        if (denueId && existingDenueIds.has(denueId)) { duplicates++; continue; }

        const nombreComercial = getVal("nombreComercial");
        if (!nombreComercial || nombreComercial.trim().length === 0) { skipped++; continue; }

        const estratoStr = getVal("estratoPersonal");
        const { min: empleadosMin, max: empleadosMax } = parseEmployeeRange(estratoStr);
        const avgEmployees = (empleadosMin + empleadosMax) / 2;

        const municipioVal = getVal("municipio");
        if (filterMunicipios.length > 0 && (!municipioVal || !filterMunicipios.includes(municipioVal.toLowerCase()))) { filtered++; continue; }

        if (filterEmpleadosMin > 0 || filterEmpleadosMax < Infinity) {
          if (avgEmployees < filterEmpleadosMin || avgEmployees > filterEmpleadosMax) { filtered++; continue; }
        }

        const codigoScian = getVal("codigoScian");
        if (filterScianCodes.length > 0 && (!codigoScian || !filterScianCodes.some(f => codigoScian.startsWith(f)))) { filtered++; continue; }
        const sitioWeb = getVal("sitioWeb");
        const correoElectronico = getVal("correoElectronico");

        const score = calculateLeadScore({
          empleadosMin,
          empleadosMax,
          codigoScian,
          sitioWeb,
          correoElectronico,
          estratoPersonal: estratoStr,
        });

        const scian2 = (codigoScian || "").substring(0, 2);
        const noms = NOM_MAP[scian2] || ["NOM-035"];

        const lat = parseFloat(getVal("latitud"));
        const lon = parseFloat(getVal("longitud"));

        const record = {
          denueId: denueId || null,
          nombreComercial: normalizeName(nombreComercial),
          razonSocial: getVal("razonSocial") ? normalizeName(getVal("razonSocial")) : null,
          actividadEconomica: getVal("actividadEconomica") || null,
          codigoScian: codigoScian || null,
          tipoEstablecimiento: getVal("tipoEstablecimiento") || null,
          estratoPersonal: estratoStr || null,
          empleadosMin,
          empleadosMax,
          telefono: getVal("telefono") || null,
          correoElectronico: correoElectronico || null,
          sitioWeb: sitioWeb || null,
          tipoVialidad: getVal("tipoVialidad") || null,
          calle: getVal("calle") || null,
          numExterior: getVal("numExterior") || null,
          numInterior: getVal("numInterior") || null,
          colonia: getVal("colonia") || null,
          codigoPostal: getVal("codigoPostal") || null,
          municipio: getVal("municipio") || null,
          estado: getVal("estado") || null,
          latitud: isNaN(lat) ? null : lat,
          longitud: isNaN(lon) ? null : lon,
          leadScore: score.total,
          scoreDesglose: score.desglose,
          nomsAplicables: noms,
          importBatchId: batchId,
          fechaAlta: null,
        };

        batchInserts.push(record);
        if (denueId) existingDenueIds.add(denueId);

        if (batchInserts.length >= 200) {
          await db.insert(empresasProspectos).values(batchInserts);
          imported += batchInserts.length;
          batchInserts.length = 0;
        }
      }

      if (batchInserts.length > 0) {
        await db.insert(empresasProspectos).values(batchInserts);
        imported += batchInserts.length;
      }

      prospectStatsCacheMap.clear();
      mapCache.clear();
      res.json({
        imported,
        skipped,
        duplicates,
        filtered,
        batchId,
        total: imported + skipped + duplicates + filtered,
      });
    } catch (err) { next(err); }
  });

  const ZONA_POR_ESTADO: Record<string, string> = {
    "Ciudad de México": "Centro", "México": "Centro", "Puebla": "Centro",
    "Tlaxcala": "Centro", "Morelos": "Centro", "Hidalgo": "Centro", "Querétaro": "Centro",
    "Nuevo León": "Norte", "Chihuahua": "Norte", "Coahuila de Zaragoza": "Norte",
    "Tamaulipas": "Norte", "Sonora": "Norte", "Baja California": "Norte",
    "Baja California Sur": "Norte", "Sinaloa": "Norte", "Durango": "Norte",
    "San Luis Potosí": "Norte", "Zacatecas": "Norte", "Nayarit": "Norte",
    "Jalisco": "Bajío", "Guanajuato": "Bajío", "Aguascalientes": "Bajío",
    "Colima": "Bajío", "Michoacán de Ocampo": "Bajío",
    "Veracruz de Ignacio de la Llave": "Sur-Sureste", "Oaxaca": "Sur-Sureste",
    "Chiapas": "Sur-Sureste", "Guerrero": "Sur-Sureste", "Tabasco": "Sur-Sureste",
    "Campeche": "Sur-Sureste", "Yucatán": "Sur-Sureste", "Quintana Roo": "Sur-Sureste",
  };

  app.get("/api/denue/prospectos", requireAdminOrPartner, async (req, res, next) => {
    try {
      const { municipio, estado, zona, scian, scoreMin, scoreMax, stage, partnerId, search, enrichment, page = "1", limit = "50", sortField = "leadScore", sortDir = "desc" } = req.query as Record<string, string>;

      const validStages = ["nuevo", "contactado", "demo", "propuesta", "negociacion", "cliente"] as const;
      const conditions: SQL[] = [];

      const efos = (req.query as Record<string, string>).efos;
      const isEfosOnly = efos === "only";

      if (zona && ZONA_POR_ESTADO) {
        const estadosDeZona = Object.entries(ZONA_POR_ESTADO).filter(([, z]) => z === zona).map(([e]) => e);
        if (estadosDeZona.length > 0) {
          if (isEfosOnly) {
            conditions.push(sql`(${inArray(empresasProspectos.estado, estadosDeZona)} OR ${empresasProspectos.estado} IS NULL)`);
          } else {
            conditions.push(inArray(empresasProspectos.estado, estadosDeZona));
          }
        }
      }
      if (estado) {
        if (isEfosOnly) {
          conditions.push(sql`(${eq(empresasProspectos.estado, estado)} OR ${empresasProspectos.estado} IS NULL)`);
        } else {
          conditions.push(eq(empresasProspectos.estado, estado));
        }
      }
      if (municipio) {
        if (isEfosOnly) {
          conditions.push(sql`(${eq(empresasProspectos.municipio, municipio)} OR ${empresasProspectos.municipio} IS NULL)`);
        } else {
          conditions.push(eq(empresasProspectos.municipio, municipio));
        }
      }

      if (enrichment === "enriched") {
        conditions.push(sql`${empresasProspectos.planRecomendado} IS NOT NULL`);
      } else if (enrichment === "pending") {
        conditions.push(sql`${empresasProspectos.planRecomendado} IS NULL`);
      }

      if (scian) conditions.push(eq(empresasProspectos.codigoScian, scian));
      if (scoreMin) conditions.push(gte(empresasProspectos.leadScore, parseInt(scoreMin)));
      if (scoreMax) conditions.push(lte(empresasProspectos.leadScore, parseInt(scoreMax)));
      if (stage && validStages.includes(stage as typeof validStages[number])) {
        conditions.push(sql`${empresasProspectos.stage} = ${stage}`);
      }
      if (partnerId) conditions.push(eq(empresasProspectos.partnerId, partnerId));
      if (search) conditions.push(ilike(empresasProspectos.nombreComercial, `%${search}%`));

      if (isEfosOnly) {
        conditions.push(sql`is_efos = true`);
      } else if (efos === "exclude") {
        conditions.push(sql`(is_efos IS NULL OR is_efos = false)`);
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const pageNum = Math.max(1, parseInt(page));
      const lim = Math.min(200, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * lim;

      let total = 0;
      if (conditions.length === 0) {
        try {
          const mvResult = await db.execute(sql`SELECT total FROM mv_prospectos_global_stats LIMIT 1`);
          const mvRows = (mvResult as { rows: { total: string }[] }).rows;
          total = mvRows?.length > 0 ? Number(mvRows[0].total) : 0;
        } catch {
          const [totalRow] = await db.select({ count: count() }).from(empresasProspectos);
          total = totalRow?.count ?? 0;
        }
      } else {
        const [totalRow] = await db.select({ count: count() }).from(empresasProspectos).where(whereClause);
        total = totalRow?.count ?? 0;
      }

      const sortColumns: Record<string, typeof empresasProspectos.leadScore> = {
        leadScore: empresasProspectos.leadScore,
        nombreComercial: empresasProspectos.nombreComercial,
        stage: empresasProspectos.stage,
        createdAt: empresasProspectos.createdAt,
        municipio: empresasProspectos.municipio,
        estado: empresasProspectos.estado,
        grupoSector: empresasProspectos.grupoSector,
        actividadEconomica: empresasProspectos.actividadEconomica,
        estratoPersonal: empresasProspectos.estratoPersonal,
        empleadosEstimados: empresasProspectos.empleadosEstimados,
        potencialAportacionMensual: empresasProspectos.potencialAportacionMensual,
        prioridad: empresasProspectos.prioridad,
        zonaComercial: empresasProspectos.zonaComercial,
        nivelRiesgo: empresasProspectos.nivelRiesgo,
        planRecomendado: empresasProspectos.planRecomendado,
        codigoScian: empresasProspectos.codigoScian,
      };
      const sortCol = sortColumns[sortField] || empresasProspectos.leadScore;
      const orderFn = sortDir === "asc" ? asc : desc;

      const rows = await db.select().from(empresasProspectos).where(whereClause).orderBy(orderFn(sortCol)).limit(lim).offset(offset);

      const rowIds = rows.map(r => r.id);
      let efosMatchMap = new Map<string, { rfc: string; situacion: string; nombre: string }>();
      if (rowIds.length > 0) {
        const efosMatches = await db.execute(sql`SELECT prospecto_id::text, efos_rfc, efos_situacion, efos_nombre FROM efos_prospectos_match WHERE prospecto_id IN (${sql.join(rowIds.map(id => sql`${id}::uuid`), sql`, `)})`);
        const efosRows = (efosMatches as { rows: { prospecto_id: string; efos_rfc: string; efos_situacion: string; efos_nombre: string }[] }).rows || [];
        for (const em of efosRows) {
          efosMatchMap.set(em.prospecto_id, { rfc: em.efos_rfc, situacion: em.efos_situacion, nombre: em.efos_nombre });
        }
      }
      const enriched = rows.map(r => ({ ...r, efos69b: efosMatchMap.get(r.id) || null }));

      res.json({ data: enriched, total, page: pageNum, limit: lim, totalPages: Math.ceil(total / lim) });
    } catch (err) { next(err); }
  });

  type SatOficinaRow = { estado: string; municipio: string | null; latitud: number; longitud: number };

  const mapCache = new Map<string, { data: unknown; ts: number }>();
  const MAP_CACHE_TTL = 3 * 60 * 1000;
  const MAP_CACHE_MAX = 20;

  app.get("/api/denue/prospectos/map", requireAdminOrPartner, async (req, res, next) => {
    try {
      const { municipio, estado, zona, scian, scoreMin, scoreMax, stage, partnerId, search, enrichment, efos } = req.query as Record<string, string>;

      const mapCacheKey = JSON.stringify({ municipio, estado, zona, scian, scoreMin, scoreMax, stage, partnerId, search, enrichment, efos });
      const cachedMap = mapCache.get(mapCacheKey);
      if (cachedMap && Date.now() - cachedMap.ts < MAP_CACHE_TTL) {
        return res.json(cachedMap.data);
      }

      const validStages = ["nuevo", "contactado", "demo", "propuesta", "negociacion", "cliente"] as const;
      const conditions: SQL[] = [];
      const isEfosOnly = efos === "only";

      if (zona && ZONA_POR_ESTADO) {
        const estadosDeZona = Object.entries(ZONA_POR_ESTADO).filter(([, z]) => z === zona).map(([e]) => e);
        if (estadosDeZona.length > 0) {
          if (isEfosOnly) {
            conditions.push(sql`(${inArray(empresasProspectos.estado, estadosDeZona)} OR ${empresasProspectos.estado} IS NULL)`);
          } else {
            conditions.push(inArray(empresasProspectos.estado, estadosDeZona));
          }
        }
      }
      if (estado) {
        if (isEfosOnly) {
          conditions.push(sql`(${eq(empresasProspectos.estado, estado)} OR ${empresasProspectos.estado} IS NULL)`);
        } else {
          conditions.push(eq(empresasProspectos.estado, estado));
        }
      }
      if (municipio) {
        if (isEfosOnly) {
          conditions.push(sql`(${eq(empresasProspectos.municipio, municipio)} OR ${empresasProspectos.municipio} IS NULL)`);
        } else {
          conditions.push(eq(empresasProspectos.municipio, municipio));
        }
      }

      if (enrichment === "enriched") {
        conditions.push(sql`${empresasProspectos.planRecomendado} IS NOT NULL`);
      } else if (enrichment === "pending") {
        conditions.push(sql`${empresasProspectos.planRecomendado} IS NULL`);
      }

      const geoConditions = [...conditions];
      geoConditions.push(sql`${empresasProspectos.latitud} IS NOT NULL AND ${empresasProspectos.longitud} IS NOT NULL`);

      if (scian) { conditions.push(eq(empresasProspectos.codigoScian, scian)); geoConditions.push(eq(empresasProspectos.codigoScian, scian)); }
      if (scoreMin) {
        conditions.push(gte(empresasProspectos.leadScore, parseInt(scoreMin)));
        geoConditions.push(gte(empresasProspectos.leadScore, parseInt(scoreMin)));
      } else if (!estado && !municipio && !zona && !search && !partnerId && !stage && !isEfosOnly) {
        conditions.push(gte(empresasProspectos.leadScore, 40));
        geoConditions.push(gte(empresasProspectos.leadScore, 40));
      }
      if (scoreMax) { conditions.push(lte(empresasProspectos.leadScore, parseInt(scoreMax))); geoConditions.push(lte(empresasProspectos.leadScore, parseInt(scoreMax))); }
      if (stage && validStages.includes(stage as typeof validStages[number])) {
        conditions.push(sql`${empresasProspectos.stage} = ${stage}`);
        geoConditions.push(sql`${empresasProspectos.stage} = ${stage}`);
      }
      if (partnerId) { conditions.push(eq(empresasProspectos.partnerId, partnerId)); geoConditions.push(eq(empresasProspectos.partnerId, partnerId)); }
      if (search) { conditions.push(ilike(empresasProspectos.nombreComercial, `%${search}%`)); geoConditions.push(ilike(empresasProspectos.nombreComercial, `%${search}%`)); }

      if (isEfosOnly) {
        conditions.push(sql`is_efos = true`);
        geoConditions.push(sql`is_efos = true`);
      }

      const geoWhereClause = geoConditions.length > 0 ? and(...geoConditions) : undefined;

      const rows = await db.select({
        id: empresasProspectos.id,
        nombreComercial: empresasProspectos.nombreComercial,
        razonSocial: empresasProspectos.razonSocial,
        latitud: empresasProspectos.latitud,
        longitud: empresasProspectos.longitud,
        leadScore: empresasProspectos.leadScore,
        stage: empresasProspectos.stage,
        municipio: empresasProspectos.municipio,
        estado: empresasProspectos.estado,
        actividadEconomica: empresasProspectos.actividadEconomica,
        empleadosEstimados: empresasProspectos.empleadosEstimados,
        calle: empresasProspectos.calle,
        colonia: empresasProspectos.colonia,
        direccionCompleta: empresasProspectos.direccionCompleta,
      }).from(empresasProspectos).where(geoWhereClause).orderBy(desc(empresasProspectos.leadScore)).limit(5001);

      let fallbackRows: typeof rows = [];
      if (efos === "only") {
        const noGeoConditions = [...conditions];
        noGeoConditions.push(sql`(${empresasProspectos.latitud} IS NULL OR ${empresasProspectos.longitud} IS NULL)`);
        const noGeoWhere = noGeoConditions.length > 0 ? and(...noGeoConditions) : undefined;
        fallbackRows = await db.select({
          id: empresasProspectos.id,
          nombreComercial: empresasProspectos.nombreComercial,
          razonSocial: empresasProspectos.razonSocial,
          latitud: empresasProspectos.latitud,
          longitud: empresasProspectos.longitud,
          leadScore: empresasProspectos.leadScore,
          stage: empresasProspectos.stage,
          municipio: empresasProspectos.municipio,
          estado: empresasProspectos.estado,
          actividadEconomica: empresasProspectos.actividadEconomica,
          empleadosEstimados: empresasProspectos.empleadosEstimados,
          calle: empresasProspectos.calle,
          colonia: empresasProspectos.colonia,
          direccionCompleta: empresasProspectos.direccionCompleta,
        }).from(empresasProspectos).where(noGeoWhere).orderBy(desc(empresasProspectos.leadScore)).limit(Math.max(5000, 15001 - rows.length));
      }

      let satOficinas: SatOficinaRow[] = [];
      if (fallbackRows.length > 0) {
        const oficResult = await db.execute(sql`SELECT estado, municipio, latitud, longitud FROM sat_oficinas`);
        satOficinas = (oficResult as { rows: SatOficinaRow[] }).rows || [];
      }

      const allRows = [...rows];
      for (const fr of fallbackRows) {
        let bestOficina = satOficinas.find(o => o.municipio && fr.municipio && o.municipio.toLowerCase() === fr.municipio.toLowerCase() && o.estado === fr.estado);
        if (!bestOficina && fr.estado) bestOficina = satOficinas.find(o => o.estado === fr.estado);
        if (bestOficina) {
          const jitterLat = (Math.random() - 0.5) * 0.3;
          const jitterLng = (Math.random() - 0.5) * 0.3;
          allRows.push({ ...fr, latitud: bestOficina.latitud + jitterLat, longitud: bestOficina.longitud + jitterLng });
        }
      }

      const hasMore = allRows.length > 5000;
      const sliced = hasMore ? allRows.slice(0, 5000) : allRows;
      const fallbackIds = new Set(fallbackRows.map(r => r.id));

      const mapEfosMatchMap = new Map<string, { rfc: string; situacion: string; nombre: string }>();
      const slicedIds = sliced.map(r => r.id);
      if (slicedIds.length > 0) {
        const efosResult = await db.execute(sql`SELECT prospecto_id::text, efos_rfc, efos_situacion, efos_nombre FROM efos_prospectos_match WHERE prospecto_id IN (${sql.join(slicedIds.map(id => sql`${id}::uuid`), sql`, `)})`);
        const efosRows = (efosResult as { rows: { prospecto_id: string; efos_rfc: string; efos_situacion: string; efos_nombre: string }[] }).rows || [];
        for (const em of efosRows) {
          mapEfosMatchMap.set(em.prospecto_id, { rfc: em.efos_rfc, situacion: em.efos_situacion, nombre: em.efos_nombre });
        }
      }
      const data = sliced.map(r => ({
        id: r.id,
        nombreComercial: r.nombreComercial,
        razonSocial: r.razonSocial,
        latitud: r.latitud,
        longitud: r.longitud,
        leadScore: r.leadScore,
        stage: r.stage,
        municipio: r.municipio,
        estado: r.estado,
        actividadEconomica: r.actividadEconomica,
        empleadosEstimados: r.empleadosEstimados,
        calle: r.calle,
        colonia: r.colonia,
        direccionCompleta: r.direccionCompleta,
        efos69b: mapEfosMatchMap.get(r.id) || null,
        isFallbackLocation: fallbackIds.has(r.id),
      }));

      const efosCount = data.filter(d => d.efos69b).length;
      const result = { data, total: data.length, hasMore, efosCount };
      if (mapCache.size >= MAP_CACHE_MAX) {
        const oldest = mapCache.keys().next().value;
        if (oldest) mapCache.delete(oldest);
      }
      mapCache.set(mapCacheKey, { data: result, ts: Date.now() });
      res.json(result);
    } catch (err) { next(err); }
  });

  const prospectStatsCacheMap = new Map<string, { data: any; ts: number }>();
  const STATS_CACHE_TTL = 5 * 60 * 1000;

  app.get("/api/denue/prospectos/stats", requireAdminOrPartner, async (req, res, next) => {
    try {
      const { municipio, estado, zona, scian, scoreMin, stage, partnerId, search, enrichment, efos } = req.query as Record<string, string>;
      const hasFilters = !!(municipio || estado || zona || scian || scoreMin || stage || partnerId || search || enrichment || efos);
      const cacheKey = hasFilters ? JSON.stringify({ municipio, estado, zona, scian, scoreMin, stage, partnerId, search, enrichment, efos }) : "__global__";
      const cached = prospectStatsCacheMap.get(cacheKey);
      if (cached && Date.now() - cached.ts < STATS_CACHE_TTL) {
        return res.json(cached.data);
      }

      if (!hasFilters) {
        try {
          const globalResult = await db.execute(sql`SELECT * FROM mv_prospectos_global_stats LIMIT 1`);
          const gRows = (globalResult as { rows: any[] }).rows;
          if (gRows && gRows.length > 0) {
            const g = gRows[0];
            const topMunicipios = await db.select({
              municipio: empresasProspectos.municipio,
              count: count(),
            }).from(empresasProspectos)
              .where(sql`${empresasProspectos.municipio} IS NOT NULL AND ${empresasProspectos.planRecomendado} IS NOT NULL`)
              .groupBy(empresasProspectos.municipio)
              .orderBy(desc(count()))
              .limit(10);

            const globalPayload = {
              total: Number(g.total) || 0,
              avgEmpleados: Number(g.avg_empleados) || 0,
              conCorreo: Number(g.con_correo) || 0,
              conTelefono: Number(g.con_telefono) || 0,
              valorMercado: Number(g.valor_mercado) || 0,
              trabajados: Number(g.trabajados) || 0,
              enriquecidas: Number(g.enriquecidas) || 0,
              stages: {
                nuevo: Number(g.stage_nuevo) || 0,
                contactado: Number(g.stage_contactado) || 0,
                demo: Number(g.stage_demo) || 0,
                propuesta: Number(g.stage_propuesta) || 0,
                negociacion: Number(g.stage_negociacion) || 0,
                cliente: Number(g.stage_cliente) || 0,
              },
              avgScore: Number(g.avg_score) || 0,
              topMunicipios: topMunicipios.map((m) => ({ municipio: m.municipio, count: Number(m.count) })),
              prioridades: {
                alta: Number(g.prio_alta) || 0,
                media: Number(g.prio_media) || 0,
                baja: Number(g.prio_baja) || 0,
              },
            };
            prospectStatsCacheMap.set(cacheKey, { data: globalPayload, ts: Date.now() });
            return res.json(globalPayload);
          }
        } catch (mvErr: any) {
          console.log("[stats] MV fallback:", mvErr.message);
        }
      }

      const conditions: SQL[] = [];
      const isEfosOnly = efos === "only";

      if (zona && ZONA_POR_ESTADO) {
        const estadosDeZona = Object.entries(ZONA_POR_ESTADO).filter(([, z]) => z === zona).map(([e]) => e);
        if (estadosDeZona.length > 0) {
          if (isEfosOnly) {
            conditions.push(sql`(${inArray(empresasProspectos.estado, estadosDeZona)} OR ${empresasProspectos.estado} IS NULL)`);
          } else {
            conditions.push(inArray(empresasProspectos.estado, estadosDeZona));
          }
        }
      }
      if (estado) {
        if (isEfosOnly) {
          conditions.push(sql`(${eq(empresasProspectos.estado, estado)} OR ${empresasProspectos.estado} IS NULL)`);
        } else {
          conditions.push(eq(empresasProspectos.estado, estado));
        }
      }
      if (municipio) {
        if (isEfosOnly) {
          conditions.push(sql`(${eq(empresasProspectos.municipio, municipio)} OR ${empresasProspectos.municipio} IS NULL)`);
        } else {
          conditions.push(eq(empresasProspectos.municipio, municipio));
        }
      }
      if (enrichment === "enriched") {
        conditions.push(sql`${empresasProspectos.planRecomendado} IS NOT NULL`);
      } else if (enrichment === "pending") {
        conditions.push(sql`${empresasProspectos.planRecomendado} IS NULL`);
      }
      if (scian) conditions.push(eq(empresasProspectos.codigoScian, scian));
      if (scoreMin) conditions.push(gte(empresasProspectos.leadScore, parseInt(scoreMin)));
      if (stage) conditions.push(sql`${empresasProspectos.stage} = ${stage}`);
      if (partnerId) conditions.push(eq(empresasProspectos.partnerId, partnerId));
      if (search) conditions.push(ilike(empresasProspectos.nombreComercial, `%${search}%`));
      if (isEfosOnly) {
        conditions.push(sql`is_efos = true`);
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const result = await db.select({
        total: count(),
        avgScore: sql<number>`ROUND(AVG(${empresasProspectos.leadScore}))`,
        avgEmpleados: sql<number>`ROUND(AVG(${empresasProspectos.empleadosEstimados}))`,
        conCorreo: sql<number>`count(*) FILTER (WHERE ${empresasProspectos.correoElectronico} IS NOT NULL AND ${empresasProspectos.correoElectronico} != '')`,
        conTelefono: sql<number>`count(*) FILTER (WHERE ${empresasProspectos.telefono} IS NOT NULL AND ${empresasProspectos.telefono} != '')`,
        valorMercado: sql<number>`ROUND(COALESCE(SUM(${empresasProspectos.potencialAportacionMensual}), 0)::numeric, 0)`,
        stageNuevo: sql<number>`count(*) FILTER (WHERE ${empresasProspectos.stage} = 'nuevo')`,
        stageContactado: sql<number>`count(*) FILTER (WHERE ${empresasProspectos.stage} = 'contactado')`,
        stageDemo: sql<number>`count(*) FILTER (WHERE ${empresasProspectos.stage} = 'demo')`,
        stagePropuesta: sql<number>`count(*) FILTER (WHERE ${empresasProspectos.stage} = 'propuesta')`,
        stageNegociacion: sql<number>`count(*) FILTER (WHERE ${empresasProspectos.stage} = 'negociacion')`,
        stageCliente: sql<number>`count(*) FILTER (WHERE ${empresasProspectos.stage} = 'cliente')`,
        trabajados: sql<number>`count(*) FILTER (WHERE ${empresasProspectos.stage} != 'nuevo')`,
        prioAlta: sql<number>`count(*) FILTER (WHERE ${empresasProspectos.prioridad} = 'alta')`,
        prioMedia: sql<number>`count(*) FILTER (WHERE ${empresasProspectos.prioridad} = 'media')`,
        prioBaja: sql<number>`count(*) FILTER (WHERE ${empresasProspectos.prioridad} = 'baja')`,
        enriquecidas: sql<number>`count(*) FILTER (WHERE ${empresasProspectos.planRecomendado} IS NOT NULL)`,
      }).from(empresasProspectos).where(whereClause);

      const r = result[0];

      const topMunicipiosConditions = [...conditions];
      topMunicipiosConditions.push(sql`${empresasProspectos.municipio} IS NOT NULL`);
      const topMunicipios = await db.select({
        municipio: empresasProspectos.municipio,
        count: count(),
      }).from(empresasProspectos)
        .where(and(...topMunicipiosConditions))
        .groupBy(empresasProspectos.municipio)
        .orderBy(desc(count()))
        .limit(10);

      const payload = {
        total: Number(r.total) || 0,
        avgEmpleados: Number(r.avgEmpleados) || 0,
        conCorreo: Number(r.conCorreo) || 0,
        conTelefono: Number(r.conTelefono) || 0,
        valorMercado: Number(r.valorMercado) || 0,
        trabajados: Number(r.trabajados) || 0,
        enriquecidas: Number(r.enriquecidas) || 0,
        stages: {
          nuevo: Number(r.stageNuevo) || 0,
          contactado: Number(r.stageContactado) || 0,
          demo: Number(r.stageDemo) || 0,
          propuesta: Number(r.stagePropuesta) || 0,
          negociacion: Number(r.stageNegociacion) || 0,
          cliente: Number(r.stageCliente) || 0,
        },
        avgScore: Number(r.avgScore) || 0,
        topMunicipios: topMunicipios.map((m) => ({ municipio: m.municipio, count: Number(m.count) })),
        prioridades: {
          alta: Number(r.prioAlta) || 0,
          media: Number(r.prioMedia) || 0,
          baja: Number(r.prioBaja) || 0,
        },
      };
      prospectStatsCacheMap.set(cacheKey, { data: payload, ts: Date.now() });
      if (prospectStatsCacheMap.size > 100) {
        const oldest = [...prospectStatsCacheMap.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
        if (oldest) prospectStatsCacheMap.delete(oldest[0]);
      }
      res.json(payload);
    } catch (err) { next(err); }
  });

  const filtersCache = new Map<string, { data: any; ts: number }>();
  const FILTERS_CACHE_TTL = 5 * 60 * 1000;

  app.get("/api/denue/prospectos/filters", requireAdminOrPartner, async (req, res, next) => {
    try {
      const { estado, zona } = req.query as Record<string, string>;
      const cacheKey = `${zona || ''}|${estado || ''}`;
      const cached = filtersCache.get(cacheKey);
      if (cached && Date.now() - cached.ts < FILTERS_CACHE_TTL) {
        return res.json(cached.data);
      }

      let municipiosQuery: any;
      if (zona && ZONA_POR_ESTADO) {
        const estadosDeZona = Object.entries(ZONA_POR_ESTADO).filter(([, z]) => z === zona).map(([e]) => e);
        if (estadosDeZona.length > 0) {
          const estadosStr = estadosDeZona.map(e => `'${e.replace(/'/g, "''")}'`).join(",");
          municipiosQuery = db.execute(sql.raw(`SELECT DISTINCT municipio FROM mv_prosp_municipios WHERE estado IN (${estadosStr}) ORDER BY municipio`));
        }
      }
      if (estado) {
        municipiosQuery = db.execute(sql`SELECT municipio FROM mv_prosp_municipios WHERE estado = ${estado} ORDER BY municipio`);
      }
      if (!municipiosQuery) {
        municipiosQuery = db.execute(sql`SELECT DISTINCT municipio FROM mv_prosp_municipios ORDER BY municipio LIMIT 500`);
      }

      const [municipiosRes, sectoresRes] = await Promise.all([
        municipiosQuery,
        db.execute(sql`SELECT codigo_scian, actividad_economica FROM mv_prosp_sectores ORDER BY codigo_scian`),
      ]);

      const result = {
        estados: [],
        municipios: (municipiosRes as any).rows.map((m: any) => m.municipio).filter(Boolean),
        sectores: (sectoresRes as any).rows.map((s: any) => ({ codigo: s.codigo_scian, actividad: s.actividad_economica })),
      };

      filtersCache.set(cacheKey, { data: result, ts: Date.now() });
      res.json(result);
    } catch (err) { next(err); }
  });

  app.get("/api/denue/prospectos/:id", requireAdminOrPartner, async (req, res, next) => {
    try {
      const [row] = await db.select().from(empresasProspectos).where(eq(empresasProspectos.id, req.params.id)).limit(1);
      if (!row) return res.status(404).json({ message: "Prospecto no encontrado" });

      const detailEfosResult = await db.execute(sql`SELECT efos_rfc, efos_situacion, efos_nombre FROM efos_prospectos_match WHERE prospecto_id = ${row.id} LIMIT 1`);
      const detailEfosRows = (detailEfosResult as { rows: { efos_rfc: string; efos_situacion: string; efos_nombre: string }[] }).rows || [];
      const efos69b = detailEfosRows.length > 0 ? { rfc: detailEfosRows[0].efos_rfc, situacion: detailEfosRows[0].efos_situacion, nombre: detailEfosRows[0].efos_nombre } : null;
      res.json({ ...row, efos69b });
    } catch (err) { next(err); }
  });

  app.patch("/api/denue/prospectos/:id/stage", requireAdminOrPartner, async (req, res, next) => {
    try {
      const { stage } = req.body;
      const validStages = ["nuevo", "contactado", "demo", "propuesta", "negociacion", "cliente"];
      if (!validStages.includes(stage)) return res.status(400).json({ message: "Etapa inválida" });

      const [updated] = await db.update(empresasProspectos)
        .set({ stage, updatedAt: new Date() })
        .where(eq(empresasProspectos.id, req.params.id))
        .returning();
      if (!updated) return res.status(404).json({ message: "Prospecto no encontrado" });

      await db.insert(interaccionesProspectos).values({
        empresaId: updated.id,
        userId: req.supabaseUserId!,
        tipo: "cambio_etapa",
        notas: `Cambio a etapa: ${stage}`,
      });

      prospectStatsCacheMap.clear();
      res.json(updated);
    } catch (err) { next(err); }
  });

  app.patch("/api/denue/prospectos/:id/assign", requireAdminOrPartner, async (req, res, next) => {
    try {
      const { partnerId } = req.body;
      if (partnerId) {
        const partnerAccount = await storage.getAccount(partnerId);
        if (!partnerAccount || (partnerAccount.userRole !== "socio_comercial" && partnerAccount.userRole !== "partner" && partnerAccount.userRole !== "director")) {
          return res.status(400).json({ message: "El usuario seleccionado no tiene rol de socio" });
        }
      }
      const [updated] = await db.update(empresasProspectos)
        .set({ partnerId: partnerId || null, updatedAt: new Date() })
        .where(eq(empresasProspectos.id, req.params.id))
        .returning();
      if (!updated) return res.status(404).json({ message: "Prospecto no encontrado" });
      res.json(updated);
    } catch (err) { next(err); }
  });

  app.post("/api/denue/prospectos/:id/interaccion", requireAdminOrPartner, async (req, res, next) => {
    try {
      const { tipo, notas } = req.body;
      if (!tipo) return res.status(400).json({ message: "Se requiere tipo de interacción" });

      const [empresa] = await db.select().from(empresasProspectos).where(eq(empresasProspectos.id, req.params.id));
      if (!empresa) return res.status(404).json({ message: "Prospecto no encontrado" });

      const [record] = await db.insert(interaccionesProspectos).values({
        empresaId: empresa.id,
        userId: req.supabaseUserId!,
        tipo,
        notas: notas || null,
      }).returning();
      res.json(record);
    } catch (err) { next(err); }
  });

  app.get("/api/denue/prospectos/:id/interacciones", requireAdminOrPartner, async (req, res, next) => {
    try {
      const rows = await db.select().from(interaccionesProspectos)
        .where(eq(interaccionesProspectos.empresaId, req.params.id))
        .orderBy(desc(interaccionesProspectos.createdAt));
      res.json(rows);
    } catch (err) { next(err); }
  });

  app.get("/api/denue/export", requireAdminOrPartner, async (req, res, next) => {
    try {
      const ExcelJS = await import("exceljs");
      const { municipio, estado, zona, scian, scoreMin, scoreMax, stage, partnerId } = req.query as Record<string, string>;

      const exportValidStages = ["nuevo", "contactado", "demo", "propuesta", "negociacion", "cliente"] as const;
      const exportConditions: SQL[] = [];
      if (zona && ZONA_POR_ESTADO) {
        const estadosDeZona = Object.entries(ZONA_POR_ESTADO).filter(([, z]) => z === zona).map(([e]) => e);
        if (estadosDeZona.length > 0) exportConditions.push(inArray(empresasProspectos.estado, estadosDeZona));
      }
      if (municipio) exportConditions.push(eq(empresasProspectos.municipio, municipio));
      if (estado) exportConditions.push(eq(empresasProspectos.estado, estado));
      if (scian) exportConditions.push(eq(empresasProspectos.codigoScian, scian));
      if (scoreMin) exportConditions.push(gte(empresasProspectos.leadScore, parseInt(scoreMin)));
      if (scoreMax) exportConditions.push(lte(empresasProspectos.leadScore, parseInt(scoreMax)));
      if (stage && exportValidStages.includes(stage as typeof exportValidStages[number])) {
        exportConditions.push(sql`${empresasProspectos.stage} = ${stage}`);
      }
      if (partnerId) exportConditions.push(eq(empresasProspectos.partnerId, partnerId));

      const where = exportConditions.length > 0 ? and(...exportConditions) : undefined;
      const rows = await db.select().from(empresasProspectos).where(where).orderBy(desc(empresasProspectos.leadScore)).limit(5000);

      const data = rows.map(r => ({
        "Nombre Comercial": r.nombreComercial,
        "Razón Social": r.razonSocial || "",
        "Actividad Económica": r.actividadEconomica || "",
        "SCIAN": r.codigoScian || "",
        "Empleados": r.estratoPersonal || "",
        "Teléfono": r.telefono || "",
        "Email": r.correoElectronico || "",
        "Sitio Web": r.sitioWeb || "",
        "Calle": r.calle || "",
        "Colonia": r.colonia || "",
        "CP": r.codigoPostal || "",
        "Municipio": r.municipio || "",
        "Estado": r.estado || "",
        "Score": r.leadScore,
        "Etapa": r.stage,
        "NOMs Aplicables": (r.nomsAplicables || []).join(", "),
      }));

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Prospectos DENUE");
      if (data.length > 0) {
        const headers = Object.keys(data[0]) as (keyof typeof data[0])[];
        ws.addRow(headers);
        data.forEach(row => ws.addRow(headers.map(h => row[h])));
      }
      const buf = await wb.xlsx.writeBuffer();

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="prospectos-denue-${Date.now()}.xlsx"`);
      res.send(Buffer.from(buf as ArrayBuffer));
    } catch (err) { next(err); }
  });

  app.delete("/api/denue/prospectos", requireSuperadmin, async (req, res, next) => {
    try {
      const { batchId } = req.query as Record<string, string>;
      if (batchId) {
        const result = await db.delete(empresasProspectos).where(eq(empresasProspectos.importBatchId, batchId)).returning();
        return res.json({ deleted: result.length });
      }
      return res.status(400).json({ message: "Se requiere batchId para eliminar" });
    } catch (err) { next(err); }
  });

  app.post("/api/denue/enrich", requireAdminOrPartner, async (req, res, next) => {
    try {
      const { ids, batchSize = 5 } = req.body as { ids?: string[]; batchSize?: number };

      let prospects;
      if (ids && ids.length > 0) {
        prospects = await db.select().from(empresasProspectos).where(sql`${empresasProspectos.id} = ANY(${ids})`).limit(50);
      } else {
        const already = db.select({ empresaId: enriquecimiento.empresaId }).from(enriquecimiento);
        prospects = await db.select().from(empresasProspectos)
          .where(sql`${empresasProspectos.id} NOT IN (${already})`)
          .orderBy(desc(empresasProspectos.leadScore))
          .limit(Math.min(batchSize, 20));
      }

      if (prospects.length === 0) {
        return res.json({ enriched: 0, results: [], message: "No hay prospectos pendientes de enriquecer" });
      }

      const results: Array<{ id: string; nombre: string; phone?: string; website?: string; googleRating?: number; status: string }> = [];

      for (const p of prospects) {
        try {
          const searchName = p.nombreComercial.replace(/\s+/g, " ").trim();
          const searchLocation = [p.municipio, p.estado].filter(Boolean).join(" ");
          const searchQuery = `${searchName} ${searchLocation} México`;

          let phone: string | null = null;
          let website: string | null = null;
          let googleRating: number | null = null;
          let googleReviews: number | null = null;
          let facebookUrl: string | null = null;
          let linkedinUrl: string | null = null;

          const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
          const ddgRes = await fetch(ddgUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "text/html",
            },
          }).catch(() => null);

          if (ddgRes && ddgRes.ok) {
            const html = await ddgRes.text();

            const hrefMatches = html.match(/href="(https?:\/\/[^"]+)"/g);
            if (hrefMatches) {
              const skipDomains = ["duckduckgo.", "google.", "bing.", "yahoo.", "gstatic.", "youtube.", "schema.org", "w3.org", "googleapis.", "wikipedia.", "amazon.", "twitter.", "instagram.", "tiktok."];
              for (const m of hrefMatches) {
                const url = m.replace(/^href="/, "").replace(/"$/, "");
                if (skipDomains.some(d => url.includes(d))) continue;
                if (url.includes("facebook.com/") && !facebookUrl) { facebookUrl = url; continue; }
                if (url.includes("linkedin.com/") && !linkedinUrl) { linkedinUrl = url; continue; }
                if (!website && !url.includes("duckduckgo") && url.startsWith("http")) { website = url; }
              }
            }

          }

          if (website && !website.includes("facebook.") && !website.includes("linkedin.")) {
            try {
              const pageRes = await fetch(website, {
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
                signal: AbortSignal.timeout(8000),
              }).catch(() => null);

              if (pageRes && pageRes.ok) {
                const pageHtml = await pageRes.text();

                if (!phone) {
                  const telMatches = pageHtml.match(/(?:tel:|href="tel:)(\+?\d[\d\s.-]{8,15})/g);
                  if (telMatches) {
                    const cleaned = telMatches[0].replace(/.*?(\+?\d[\d\s.-]{8,15}).*/, "$1").replace(/[\s.-]/g, "");
                    if (cleaned.length >= 10) phone = cleaned;
                  }
                  if (!phone) {
                    const mxPhones = pageHtml.match(/(?:\+52[\s.-]?)?(?:\(?\d{2,3}\)?[\s.-]?\d{3,4}[\s.-]?\d{4})/g);
                    if (mxPhones) {
                      for (const mp of mxPhones) {
                        const cleaned = mp.replace(/[^\d+]/g, "");
                        if (cleaned.length >= 10 && cleaned.length <= 15) { phone = cleaned; break; }
                      }
                    }
                  }
                }

                if (!facebookUrl) {
                  const fbMatch = pageHtml.match(/https?:\/\/(?:www\.)?facebook\.com\/[a-zA-Z0-9.]+/);
                  if (fbMatch) facebookUrl = fbMatch[0];
                }
              }
            } catch {}
          }

          const updates: Record<string, string | null> = {};
          if (phone && !p.telefono) updates.telefono = phone;
          if (website && !p.sitioWeb) updates.sitioWeb = website;

          if (Object.keys(updates).length > 0) {
            if (updates.telefono) {
              await db.update(empresasProspectos).set({ telefono: updates.telefono }).where(eq(empresasProspectos.id, p.id));
            }
            if (updates.sitioWeb) {
              await db.update(empresasProspectos).set({ sitioWeb: updates.sitioWeb }).where(eq(empresasProspectos.id, p.id));
            }
          }

          await db.insert(enriquecimiento).values({
            empresaId: p.id,
            fuente: "web-search",
            googleRating: googleRating,
            googleReviews: googleReviews,
            linkedinUrl: linkedinUrl,
            facebookUrl: facebookUrl,
            datosExtra: {
              phoneFound: phone,
              websiteFound: website,
              searchQuery,
              enrichedAt: new Date().toISOString(),
            },
          });

          if (phone || website) {
            const score = calculateLeadScore({
              empleadosMin: p.empleadosMin || 0,
              empleadosMax: p.empleadosMax || 0,
              codigoScian: p.codigoScian || "",
              sitioWeb: p.sitioWeb || website || "",
              correoElectronico: p.correoElectronico || "",
              estratoPersonal: p.estratoPersonal || "",
            });
            await db.update(empresasProspectos)
              .set({ leadScore: score.total, scoreDesglose: score.desglose })
              .where(eq(empresasProspectos.id, p.id));
          }

          results.push({
            id: p.id,
            nombre: p.nombreComercial,
            phone: phone || undefined,
            website: website || undefined,
            googleRating: googleRating || undefined,
            status: (phone || website) ? "enriched" : "no-new-data",
          });

          await new Promise(r => setTimeout(r, 1500));
        } catch (enrichErr) {
          results.push({ id: p.id, nombre: p.nombreComercial, status: "error" });
        }
      }

      const enrichedCount = results.filter(r => r.status === "enriched").length;
      prospectStatsCacheMap.clear();
      mapCache.clear();
      res.json({ enriched: enrichedCount, total: results.length, results });
    } catch (err) { next(err); }
  });

  const bulkEnrichState = {
    running: false,
    processed: 0,
    total: 0,
    enriched: 0,
    errors: 0,
    startedAt: null as string | null,
    lastUpdate: null as string | null,
    currentBatch: "",
    stopped: false,
  };

  async function enrichOneProspect(p: typeof empresasProspectos.$inferSelect) {
    let phone: string | null = null;
    let website: string | null = null;
    let googleRating: number | null = null;
    let googleReviews: number | null = null;
    let facebookUrl: string | null = null;
    let linkedinUrl: string | null = null;

    const searchName = p.nombreComercial.replace(/\s+/g, " ").trim();
    const searchLocation = [p.municipio, p.estado].filter(Boolean).join(" ");
    const searchQuery = `${searchName} ${searchLocation} México`;

    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
    const ddgRes = await fetch(ddgUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html",
      },
    }).catch(() => null);

    if (ddgRes && ddgRes.ok) {
      const html = await ddgRes.text();
      const hrefMatches = html.match(/href="(https?:\/\/[^"]+)"/g);
      if (hrefMatches) {
        const skipDomains = ["duckduckgo.", "google.", "bing.", "yahoo.", "gstatic.", "youtube.", "schema.org", "w3.org", "googleapis.", "wikipedia.", "amazon.", "twitter.", "instagram.", "tiktok."];
        for (const m of hrefMatches) {
          const url = m.replace(/^href="/, "").replace(/"$/, "");
          if (skipDomains.some(d => url.includes(d))) continue;
          if (url.includes("facebook.com/") && !facebookUrl) { facebookUrl = url; continue; }
          if (url.includes("linkedin.com/") && !linkedinUrl) { linkedinUrl = url; continue; }
          if (!website && !url.includes("duckduckgo") && url.startsWith("http")) { website = url; }
        }
      }
    }

    if (website && !website.includes("facebook.") && !website.includes("linkedin.")) {
      try {
        const pageRes = await fetch(website, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
          signal: AbortSignal.timeout(8000),
        }).catch(() => null);

        if (pageRes && pageRes.ok) {
          const pageHtml = await pageRes.text();
          if (!phone) {
            const telMatches = pageHtml.match(/(?:tel:|href="tel:)(\+?\d[\d\s.-]{8,15})/g);
            if (telMatches) {
              const cleaned = telMatches[0].replace(/.*?(\+?\d[\d\s.-]{8,15}).*/, "$1").replace(/[\s.-]/g, "");
              if (cleaned.length >= 10) phone = cleaned;
            }
            if (!phone) {
              const mxPhones = pageHtml.match(/(?:\+52[\s.-]?)?(?:\(?\d{2,3}\)?[\s.-]?\d{3,4}[\s.-]?\d{4})/g);
              if (mxPhones) {
                for (const mp of mxPhones) {
                  const cleaned = mp.replace(/[^\d+]/g, "");
                  if (cleaned.length >= 10 && cleaned.length <= 15) { phone = cleaned; break; }
                }
              }
            }
          }
          if (!facebookUrl) {
            const fbMatch = pageHtml.match(/https?:\/\/(?:www\.)?facebook\.com\/[a-zA-Z0-9.]+/);
            if (fbMatch) facebookUrl = fbMatch[0];
          }
        }
      } catch {}
    }

    const updates: Record<string, string | null> = {};
    if (phone && !p.telefono) updates.telefono = phone;
    if (website && !p.sitioWeb) updates.sitioWeb = website;

    if (updates.telefono) {
      await db.update(empresasProspectos).set({ telefono: updates.telefono }).where(eq(empresasProspectos.id, p.id));
    }
    if (updates.sitioWeb) {
      await db.update(empresasProspectos).set({ sitioWeb: updates.sitioWeb }).where(eq(empresasProspectos.id, p.id));
    }

    await db.insert(enriquecimiento).values({
      empresaId: p.id,
      fuente: "web-search",
      googleRating,
      googleReviews,
      linkedinUrl,
      facebookUrl,
      datosExtra: {
        phoneFound: phone,
        websiteFound: website,
        searchQuery,
        enrichedAt: new Date().toISOString(),
      },
    });

    if (phone || website) {
      const score = calculateLeadScore({
        empleadosMin: p.empleadosMin || 0,
        empleadosMax: p.empleadosMax || 0,
        codigoScian: p.codigoScian || "",
        sitioWeb: p.sitioWeb || website || "",
        correoElectronico: p.correoElectronico || "",
        estratoPersonal: p.estratoPersonal || "",
      });
      await db.update(empresasProspectos)
        .set({ leadScore: score.total, scoreDesglose: score.desglose })
        .where(eq(empresasProspectos.id, p.id));
    }

    return !!(phone || website);
  }

  app.post("/api/denue/enrich/bulk", requireAdminOrPartner, async (req, res) => {
    if (bulkEnrichState.running) {
      return res.json({ message: "Ya hay un proceso de enriquecimiento en curso", ...bulkEnrichState });
    }

    const { municipio, estado, zona, stage, scian, scoreMin, partnerId, enrichment } = req.body as Record<string, string>;
    const filterConditions: string[] = [];
    if (zona && ZONA_POR_ESTADO) {
      const estadosDeZona = Object.entries(ZONA_POR_ESTADO).filter(([, z]) => z === zona).map(([e]) => `'${e.replace(/'/g, "''")}'`).join(",");
      filterConditions.push(`estado IN (${estadosDeZona})`);
    }
    if (estado) {
      filterConditions.push(`estado = '${estado.replace(/'/g, "''")}'`);
    }
    if (enrichment === "enriched") {
      filterConditions.push("plan_recomendado IS NOT NULL");
    } else if (enrichment === "pending") {
      filterConditions.push("plan_recomendado IS NULL");
    }
    if (municipio) filterConditions.push(`municipio = '${municipio.replace(/'/g, "''")}'`);
    if (stage) filterConditions.push(`stage = '${stage.replace(/'/g, "''")}'`);
    if (scian) filterConditions.push(`codigo_scian = '${scian.replace(/'/g, "''")}'`);
    if (scoreMin) filterConditions.push(`lead_score >= ${parseInt(scoreMin) || 0}`);
    if (partnerId) filterConditions.push(`partner_id = '${partnerId.replace(/'/g, "''")}'`);
    const filterSql = filterConditions.length > 0 ? filterConditions.join(" AND ") : "TRUE";

    bulkEnrichState.running = true;
    bulkEnrichState.processed = 0;
    bulkEnrichState.enriched = 0;
    bulkEnrichState.errors = 0;
    bulkEnrichState.startedAt = new Date().toISOString();
    bulkEnrichState.lastUpdate = new Date().toISOString();
    bulkEnrichState.stopped = false;
    bulkEnrichState.currentBatch = "Iniciando...";

    res.json({ message: "Enriquecimiento iniciado", status: "started" });

    (async () => {
      try {
        const alreadyDone = await db.select({ empresaId: enriquecimiento.empresaId }).from(enriquecimiento);
        const doneIds = new Set(alreadyDone.map(r => r.empresaId));

        const BATCH_SIZE = 100;
        let offset = 0;
        let hasMore = true;

        while (hasMore && !bulkEnrichState.stopped) {
          const batch = await db.select().from(empresasProspectos)
            .where(sql.raw(filterSql))
            .orderBy(desc(empresasProspectos.leadScore))
            .limit(BATCH_SIZE)
            .offset(offset);

          if (batch.length === 0) { hasMore = false; break; }

          if (bulkEnrichState.total === 0) {
            const countRes = await db.select({ count: sql<number>`count(*)` }).from(empresasProspectos)
              .where(sql.raw(filterSql));
            bulkEnrichState.total = countRes[0].count - doneIds.size;
          }

          for (const p of batch) {
            if (bulkEnrichState.stopped) break;

            if (doneIds.has(p.id)) {
              offset++;
              continue;
            }

            bulkEnrichState.currentBatch = p.nombreComercial;
            try {
              const found = await enrichOneProspect(p);
              if (found) bulkEnrichState.enriched++;
              bulkEnrichState.processed++;
              doneIds.add(p.id);
            } catch (err) {
              bulkEnrichState.errors++;
              bulkEnrichState.processed++;
              doneIds.add(p.id);
            }
            bulkEnrichState.lastUpdate = new Date().toISOString();

            await new Promise(r => setTimeout(r, 1200));
          }

          offset += BATCH_SIZE;
        }
      } catch (err) {
        console.error("Bulk enrich error:", err);
      } finally {
        bulkEnrichState.running = false;
        bulkEnrichState.currentBatch = "Completado";
        bulkEnrichState.lastUpdate = new Date().toISOString();
        prospectStatsCacheMap.clear();
        mapCache.clear();
      }
    })();
  });

  app.post("/api/denue/enrich/stop", requireAdminOrPartner, async (_req, res) => {
    bulkEnrichState.stopped = true;
    res.json({ message: "Deteniendo proceso de enriquecimiento..." });
  });

  app.get("/api/denue/enrich/status", requireAdminOrPartner, async (_req, res, next) => {
    try {
      const enrichedCount = await db.select({ count: sql<number>`count(distinct ${enriquecimiento.empresaId})` }).from(enriquecimiento);

      res.json({
        enrichedCount: enrichedCount[0].count,
        bulk: { ...bulkEnrichState },
      });
    } catch (err) { next(err); }
  });

  app.get("/api/denue/partners", requireAdminOrPartner, async (_req, res, next) => {
    try {
      const partnerUsersRaw = await db.select()
        .from(users)
        .innerJoin(accounts, eq(users.id, accounts.id))
        .leftJoin(profiles, eq(users.id, profiles.id))
        .where(inArray(accounts.userRole, ["socio_comercial", "partner", "director"]));

      res.json(partnerUsersRaw.map(u => ({
        id: u.users.id,
        email: u.users.email,
        fullName: u.profiles?.fullName || null,
      })));
    } catch (err) { next(err); }
  });

  app.post("/api/denue/prospectos/bulk-stage", requireAdminOrPartner, async (req, res, next) => {
    try {
      const { ids, stage } = req.body;
      if (!ids?.length || !stage) return res.status(400).json({ message: "ids y stage requeridos" });
      await db.update(empresasProspectos).set({ stage, updatedAt: new Date() }).where(inArray(empresasProspectos.id, ids));
      res.json({ updated: ids.length });
    } catch (err) { next(err); }
  });

  app.post("/api/denue/prospectos/bulk-assign", requireAdminOrPartner, async (req, res, next) => {
    try {
      const { ids, partnerId } = req.body;
      if (!ids?.length) return res.status(400).json({ message: "ids requeridos" });
      await db.update(empresasProspectos).set({ partnerId: partnerId || null, updatedAt: new Date() }).where(inArray(empresasProspectos.id, ids));
      res.json({ updated: ids.length });
    } catch (err) { next(err); }
  });

  app.post("/api/denue/prospectos/bulk-group", requireAdminOrPartner, async (req, res, next) => {
    try {
      const { ids, contactGroupId } = req.body;
      if (!ids?.length) return res.status(400).json({ message: "ids requeridos" });
      const oldGroups = await db.select({ contactGroupId: empresasProspectos.contactGroupId }).from(empresasProspectos).where(inArray(empresasProspectos.id, ids));
      const affectedGroupIds = new Set(oldGroups.map(r => r.contactGroupId).filter(Boolean) as string[]);
      if (contactGroupId) affectedGroupIds.add(contactGroupId);
      await db.update(empresasProspectos).set({ contactGroupId: contactGroupId || null, updatedAt: new Date() }).where(inArray(empresasProspectos.id, ids));
      for (const gid of affectedGroupIds) {
        const [cnt] = await db.select({ count: sql<number>`count(*)` }).from(empresasProspectos).where(eq(empresasProspectos.contactGroupId, gid));
        await db.update(contactGroups).set({ prospectCount: cnt.count, updatedAt: new Date() }).where(eq(contactGroups.id, gid));
      }
      res.json({ updated: ids.length });
    } catch (err) { next(err); }
  });

  app.post("/api/denue/prospectos/bulk-delete", requireAdminOrPartner, async (req, res, next) => {
    try {
      const { ids } = req.body;
      if (!ids?.length) return res.status(400).json({ message: "ids requeridos" });
      const affectedRows = await db.select({ contactGroupId: empresasProspectos.contactGroupId }).from(empresasProspectos).where(inArray(empresasProspectos.id, ids));
      const affectedGroupIds = new Set(affectedRows.map(r => r.contactGroupId).filter(Boolean) as string[]);
      await db.delete(empresasProspectos).where(inArray(empresasProspectos.id, ids));
      for (const gid of affectedGroupIds) {
        const [cnt] = await db.select({ count: sql<number>`count(*)` }).from(empresasProspectos).where(eq(empresasProspectos.contactGroupId, gid));
        await db.update(contactGroups).set({ prospectCount: cnt.count, updatedAt: new Date() }).where(eq(contactGroups.id, gid));
      }
      res.json({ deleted: ids.length });
    } catch (err) { next(err); }
  });

  app.patch("/api/denue/prospectos/:id", requireAdminOrPartner, async (req, res, next) => {
    try {
      const { id } = req.params;
      const allowedFields = ["stage", "partnerId", "contactGroupId", "notas", "lastContactedAt", "planRecomendado", "nombreContacto", "rfc", "telefono", "correoElectronico", "sitioWeb"];
      const updates: Record<string, any> = { updatedAt: new Date() };
      for (const f of allowedFields) {
        if (req.body[f] !== undefined) updates[f] = req.body[f];
      }
      const [old] = await db.select({ contactGroupId: empresasProspectos.contactGroupId }).from(empresasProspectos).where(eq(empresasProspectos.id, id));
      const [updated] = await db.update(empresasProspectos).set(updates).where(eq(empresasProspectos.id, id)).returning();
      if (!updated) return res.status(404).json({ message: "Prospecto no encontrado" });
      if (req.body.contactGroupId !== undefined) {
        const groupsToUpdate = new Set([old?.contactGroupId, req.body.contactGroupId].filter(Boolean) as string[]);
        for (const gid of groupsToUpdate) {
          const [cnt] = await db.select({ count: sql<number>`count(*)` }).from(empresasProspectos).where(eq(empresasProspectos.contactGroupId, gid));
          await db.update(contactGroups).set({ prospectCount: cnt.count, updatedAt: new Date() }).where(eq(contactGroups.id, gid));
        }
      }
      res.json(updated);
    } catch (err) { next(err); }
  });

  app.get("/api/denue/contact-groups", requireAdminOrPartner, async (_req, res, next) => {
    try {
      const groups = await db.select().from(contactGroups).orderBy(desc(contactGroups.createdAt));
      res.json(groups);
    } catch (err) { next(err); }
  });

  app.post("/api/denue/contact-groups", requireAdminOrPartner, async (req, res, next) => {
    try {
      const { name, description, filterCriteria, assignedSocioId } = req.body;
      if (!name) return res.status(400).json({ message: "Nombre requerido" });
      const [group] = await db.insert(contactGroups).values({ name, description, filterCriteria, assignedSocioId }).returning();
      res.json(group);
    } catch (err) { next(err); }
  });

  app.patch("/api/denue/contact-groups/:id", requireAdminOrPartner, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, filterCriteria, assignedSocioId } = req.body;
      const updates: Record<string, any> = { updatedAt: new Date() };
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (filterCriteria !== undefined) updates.filterCriteria = filterCriteria;
      if (assignedSocioId !== undefined) updates.assignedSocioId = assignedSocioId;
      const [updated] = await db.update(contactGroups).set(updates).where(eq(contactGroups.id, id)).returning();
      if (!updated) return res.status(404).json({ message: "Grupo no encontrado" });
      res.json(updated);
    } catch (err) { next(err); }
  });

  app.delete("/api/denue/contact-groups/:id", requireAdminOrPartner, async (req, res, next) => {
    try {
      const { id } = req.params;
      await db.update(empresasProspectos).set({ contactGroupId: null }).where(eq(empresasProspectos.contactGroupId, id));
      await db.delete(contactGroups).where(eq(contactGroups.id, id));
      res.json({ deleted: true });
    } catch (err) { next(err); }
  });

  app.get("/api/denue/saved-filters", requireAdminOrPartner, async (_req, res, next) => {
    try {
      const filters = await db.select().from(savedFilters).orderBy(desc(savedFilters.createdAt));
      res.json(filters);
    } catch (err) { next(err); }
  });

  app.post("/api/denue/saved-filters", requireAdminOrPartner, async (req, res, next) => {
    try {
      const { name, filterConfig } = req.body;
      if (!name || !filterConfig) return res.status(400).json({ message: "Nombre y configuración requeridos" });
      const userId = req.supabaseUserId || null;
      const [filter] = await db.insert(savedFilters).values({ name, filterConfig, createdBy: userId }).returning();
      res.json(filter);
    } catch (err) { next(err); }
  });

  app.delete("/api/denue/saved-filters/:id", requireAdminOrPartner, async (req, res, next) => {
    try {
      await db.delete(savedFilters).where(eq(savedFilters.id, req.params.id));
      res.json({ deleted: true });
    } catch (err) { next(err); }
  });

  // ═══════════════════════════════════════════
  // BLOG — PUBLIC
  // ═══════════════════════════════════════════

  const BLOG_CATEGORIES: Record<string, string> = {
    stps: "STPS y NOMs",
    fiscal: "Beneficios Fiscales",
    ia: "IA y Capacitación",
    cursos: "Cursos Gratuitos",
    casos: "Casos de Éxito",
  };

  app.get("/api/blog/posts", async (req, res, next) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 9));
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const offset = (page - 1) * limit;

      const conditions: SQL[] = [eq(blogPosts.status, "published")];
      if (category && BLOG_CATEGORIES[category]) conditions.push(eq(blogPosts.category, category));
      if (search) conditions.push(ilike(blogPosts.title, `%${search}%`));

      const whereClause = and(...conditions);
      const [totalRow] = await db.select({ count: count() }).from(blogPosts).where(whereClause);
      const total = totalRow?.count || 0;

      const rows = await db.select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        category: blogPosts.category,
        featuredImageUrl: blogPosts.featuredImageUrl,
        authorName: blogPosts.authorName,
        blogViews: blogPosts.blogViews,
        publishedAt: blogPosts.publishedAt,
      }).from(blogPosts).where(whereClause).orderBy(desc(blogPosts.publishedAt)).limit(limit).offset(offset);

      res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (err) { next(err); }
  });

  app.get("/api/blog/posts/:slug", async (req, res, next) => {
    try {
      const [post] = await db.select().from(blogPosts).where(and(eq(blogPosts.slug, req.params.slug), eq(blogPosts.status, "published"))).limit(1);
      if (!post) return res.status(404).json({ message: "Artículo no encontrado" });
      db.update(blogPosts).set({ blogViews: sql`${blogPosts.blogViews} + 1` }).where(eq(blogPosts.id, post.id)).catch(() => {});
      res.json(post);
    } catch (err) { next(err); }
  });

  app.get("/api/blog/categories", async (_req, res, next) => {
    try {
      const rows = await db.select({ category: blogPosts.category, count: count() }).from(blogPosts).where(eq(blogPosts.status, "published")).groupBy(blogPosts.category);
      const result = rows.map(r => ({ category: r.category, label: BLOG_CATEGORIES[r.category] || r.category, count: r.count }));
      res.json(result);
    } catch (err) { next(err); }
  });

  app.get("/api/blog/related/:slug", async (req, res, next) => {
    try {
      const [post] = await db.select({ category: blogPosts.category, id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, req.params.slug)).limit(1);
      if (!post) return res.json([]);
      const related = await db.select({
        id: blogPosts.id, title: blogPosts.title, slug: blogPosts.slug, excerpt: blogPosts.excerpt,
        category: blogPosts.category, featuredImageUrl: blogPosts.featuredImageUrl, publishedAt: blogPosts.publishedAt,
      }).from(blogPosts).where(and(eq(blogPosts.status, "published"), eq(blogPosts.category, post.category), sql`${blogPosts.id} != ${post.id}`)).orderBy(desc(blogPosts.publishedAt)).limit(3);
      res.json(related);
    } catch (err) { next(err); }
  });

  // ═══════════════════════════════════════════
  // NEWSLETTER — PUBLIC
  // ═══════════════════════════════════════════

  app.post("/api/newsletter/subscribe", async (req, res, next) => {
    try {
      const { email, company_name, sector, municipio } = req.body;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Email inválido" });

      const [existing] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email.toLowerCase())).limit(1);
      if (existing) {
        if (existing.status === "active") return res.status(409).json({ message: "Ya estás suscrito" });
        await db.update(newsletterSubscribers).set({ status: "active", unsubscribedAt: null, companyName: company_name || existing.companyName, sector: sector || existing.sector, municipio: municipio || existing.municipio }).where(eq(newsletterSubscribers.id, existing.id));
        return res.json({ success: true, message: "¡Suscripción reactivada!" });
      }

      await db.insert(newsletterSubscribers).values({ email: email.toLowerCase(), companyName: company_name, sector, municipio, source: "blog" });
      res.json({ success: true, message: "¡Suscripción exitosa!" });
    } catch (err) { next(err); }
  });

  app.get("/api/newsletter/unsubscribe", async (req, res, next) => {
    try {
      const emailB64 = req.query.email as string;
      if (!emailB64) return res.redirect("/blog?unsubscribed=false");
      const email = Buffer.from(emailB64, "base64").toString("utf-8");
      await db.update(newsletterSubscribers).set({ status: "unsubscribed", unsubscribedAt: new Date() }).where(eq(newsletterSubscribers.email, email));
      res.redirect("/blog?unsubscribed=true");
    } catch (err) { next(err); }
  });

  // ═══════════════════════════════════════════
  // BLOG — ADMIN
  // ═══════════════════════════════════════════

  app.get("/api/admin/blog/posts", requireAdmin, async (req, res, next) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
      const status = req.query.status as string | undefined;
      const category = req.query.category as string | undefined;
      const offset = (page - 1) * limit;

      const conditions: SQL[] = [];
      if (status) conditions.push(eq(blogPosts.status, status));
      if (category) conditions.push(eq(blogPosts.category, category));
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [totalRow] = await db.select({ count: count() }).from(blogPosts).where(whereClause);
      const total = totalRow?.count || 0;
      const rows = await db.select().from(blogPosts).where(whereClause).orderBy(desc(blogPosts.createdAt)).limit(limit).offset(offset);
      res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (err) { next(err); }
  });

  app.post("/api/admin/blog/posts", requireAdmin, async (req, res, next) => {
    try {
      const { title, slug, content_html, content_text, excerpt, category, target_sectors, seo_keywords, featured_image_url, status } = req.body;
      if (!title || !slug || !content_html || !category) return res.status(400).json({ message: "Faltan campos requeridos" });

      const publishedAt = status === "published" ? new Date() : null;
      const [post] = await db.insert(blogPosts).values({
        title, slug, contentHtml: content_html, contentText: content_text || "", excerpt, category,
        targetSectors: target_sectors || [], seoKeywords: seo_keywords || [],
        featuredImageUrl: featured_image_url, status: status || "draft", publishedAt,
      }).returning();
      res.json(post);
    } catch (err) { next(err); }
  });

  app.patch("/api/admin/blog/posts/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const updates: any = {};
      const { title, slug, content_html, content_text, excerpt, category, target_sectors, seo_keywords, featured_image_url, status, newsletter_subject } = req.body;
      if (title !== undefined) updates.title = title;
      if (slug !== undefined) updates.slug = slug;
      if (content_html !== undefined) updates.contentHtml = content_html;
      if (content_text !== undefined) updates.contentText = content_text;
      if (excerpt !== undefined) updates.excerpt = excerpt;
      if (category !== undefined) updates.category = category;
      if (target_sectors !== undefined) updates.targetSectors = target_sectors;
      if (seo_keywords !== undefined) updates.seoKeywords = seo_keywords;
      if (featured_image_url !== undefined) updates.featuredImageUrl = featured_image_url;
      if (newsletter_subject !== undefined) updates.newsletterSubject = newsletter_subject;
      if (status !== undefined) {
        updates.status = status;
        if (status === "published") {
          const [existing] = await db.select({ publishedAt: blogPosts.publishedAt }).from(blogPosts).where(eq(blogPosts.id, id));
          if (!existing?.publishedAt) updates.publishedAt = new Date();
        }
      }
      updates.updatedAt = new Date();
      const [updated] = await db.update(blogPosts).set(updates).where(eq(blogPosts.id, id)).returning();
      if (!updated) return res.status(404).json({ message: "Post no encontrado" });
      res.json(updated);
    } catch (err) { next(err); }
  });

  app.delete("/api/admin/blog/posts/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await db.update(blogPosts).set({ status: "archived", updatedAt: new Date() }).where(eq(blogPosts.id, id));
      res.json({ archived: true });
    } catch (err) { next(err); }
  });

  // ═══════════════════════════════════════════
  // NEWSLETTER — ADMIN
  // ═══════════════════════════════════════════

  app.get("/api/admin/newsletter/subscribers", requireAdmin, async (req, res, next) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const status = req.query.status as string | undefined;
      const source = req.query.source as string | undefined;
      const search = req.query.search as string | undefined;
      const offset = (page - 1) * limit;

      const conditions: SQL[] = [];
      if (status) conditions.push(eq(newsletterSubscribers.status, status));
      if (source) conditions.push(eq(newsletterSubscribers.source, source));
      if (search) conditions.push(ilike(newsletterSubscribers.email, `%${search}%`));
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [totalRow] = await db.select({ count: count() }).from(newsletterSubscribers).where(whereClause);
      const total = totalRow?.count || 0;
      const rows = await db.select().from(newsletterSubscribers).where(whereClause).orderBy(desc(newsletterSubscribers.subscribedAt)).limit(limit).offset(offset);
      res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (err) { next(err); }
  });

  app.get("/api/admin/newsletter/stats", requireAdmin, async (_req, res, next) => {
    try {
      const result = await db.execute(sql`
        SELECT
          count(*) FILTER (WHERE status = 'active') as total_active,
          count(*) FILTER (WHERE status = 'unsubscribed') as total_unsubscribed,
          count(*) FILTER (WHERE status = 'active' AND subscribed_at > now() - interval '7 days') as new_last_week,
          jsonb_object_agg(COALESCE(source, 'unknown'), cnt) as by_source,
          jsonb_object_agg(COALESCE(sector_name, 'Sin sector'), sector_cnt) as by_sector
        FROM newsletter_subscribers,
        LATERAL (SELECT count(*) as cnt FROM newsletter_subscribers ns WHERE ns.source = newsletter_subscribers.source) sub1,
        LATERAL (SELECT COALESCE(newsletter_subscribers.sector, 'Sin sector') as sector_name, count(*) as sector_cnt FROM newsletter_subscribers ns WHERE COALESCE(ns.sector, 'Sin sector') = COALESCE(newsletter_subscribers.sector, 'Sin sector')) sub2
        LIMIT 1
      `);
      const statsSimple = await db.execute(sql`
        SELECT
          count(*) FILTER (WHERE status = 'active') as total_active,
          count(*) FILTER (WHERE status = 'unsubscribed') as total_unsubscribed,
          count(*) FILTER (WHERE status = 'active' AND subscribed_at > now() - interval '7 days') as new_last_week
        FROM newsletter_subscribers
      `);
      const bySource = await db.execute(sql`SELECT COALESCE(source, 'unknown') as source, count(*) as cnt FROM newsletter_subscribers WHERE status = 'active' GROUP BY source`);
      const bySector = await db.execute(sql`SELECT COALESCE(sector, 'Sin sector') as sector, count(*) as cnt FROM newsletter_subscribers WHERE status = 'active' GROUP BY sector`);

      const row = statsSimple.rows[0] || {};
      res.json({
        total_active: Number(row.total_active) || 0,
        total_unsubscribed: Number(row.total_unsubscribed) || 0,
        new_last_week: Number(row.new_last_week) || 0,
        by_source: Object.fromEntries(bySource.rows.map((r: any) => [r.source, Number(r.cnt)])),
        by_sector: Object.fromEntries(bySector.rows.map((r: any) => [r.sector, Number(r.cnt)])),
      });
    } catch (err) { next(err); }
  });

  let propuestaMercadoCache: { data: unknown; ts: number } | null = null;
  const PROPUESTA_CACHE_TTL = 6 * 60 * 60 * 1000;
  const PROPUESTA_CACHE_FILE = path.join(process.cwd(), ".propuesta-cache.json");

  try {
    if (fs.existsSync(PROPUESTA_CACHE_FILE)) {
      const cached = JSON.parse(fs.readFileSync(PROPUESTA_CACHE_FILE, "utf-8"));
      if (cached.ts && Date.now() - cached.ts < PROPUESTA_CACHE_TTL) {
        propuestaMercadoCache = cached;
        console.log("[propuesta] Loaded file cache (age:", Math.round((Date.now() - cached.ts) / 1000), "s)");
      }
    }
  } catch {}

  app.get("/api/propuesta/mercado", async (_req, res, next) => {
    try {
      if (propuestaMercadoCache && Date.now() - propuestaMercadoCache.ts < PROPUESTA_CACHE_TTL) {
        return res.json(propuestaMercadoCache.data);
      }

      const zoneCase = sql`CASE
        WHEN ${empresasProspectos.estado} IN ('Nuevo León','Coahuila de Zaragoza','Tamaulipas','Chihuahua','Sonora','Baja California','Sinaloa','Durango','Baja California Sur') THEN 'Norte'
        WHEN ${empresasProspectos.estado} IN ('Jalisco','Aguascalientes','Guanajuato','Querétaro','San Luis Potosí','Zacatecas','Nayarit','Colima') THEN 'Bajío'
        WHEN ${empresasProspectos.estado} IN ('Ciudad de México','México','Puebla','Tlaxcala','Morelos','Hidalgo') THEN 'Centro'
        WHEN ${empresasProspectos.estado} IN ('Veracruz de Ignacio de la Llave','Oaxaca','Chiapas','Tabasco','Campeche','Yucatán','Quintana Roo','Guerrero','Michoacán de Ocampo') THEN 'Sur-Sureste'
        ELSE 'Otra'
      END`;

      const zonesResult = await db.execute(sql`
        SELECT ${zoneCase} as zona,
          count(*)::int as empresas,
          count(*) FILTER (WHERE ${empresasProspectos.planRecomendado} IS NOT NULL)::int as con_plan,
          coalesce(sum(${empresasProspectos.empleadosEstimados}),0)::int as empleados
        FROM ${empresasProspectos}
        WHERE ${empresasProspectos.estado} IS NOT NULL AND ${empresasProspectos.estado} != ''
        GROUP BY 1 ORDER BY 2 DESC
      `);

      const sectorsResult = await db.execute(sql`
        SELECT ${empresasProspectos.grupoSector} as sector,
          count(*)::int as empresas,
          coalesce(sum(${empresasProspectos.empleadosEstimados}),0)::int as empleados
        FROM ${empresasProspectos}
        WHERE ${empresasProspectos.grupoSector} IS NOT NULL AND ${empresasProspectos.grupoSector} != ''
        GROUP BY 1 ORDER BY 2 DESC LIMIT 8
      `);

      const plansResult = await db.execute(sql`
        SELECT ${empresasProspectos.planRecomendado} as plan, count(*)::int as empresas
        FROM ${empresasProspectos}
        WHERE ${empresasProspectos.planRecomendado} IS NOT NULL
        GROUP BY 1 ORDER BY 2 DESC
      `);

      const [totals] = await db.select({
        total: sql<number>`count(*)::int`,
        estados: sql<number>`count(DISTINCT ${empresasProspectos.estado})::int`,
        municipios: sql<number>`count(DISTINCT ${empresasProspectos.municipio})::int`,
        sectores: sql<number>`count(DISTINCT ${empresasProspectos.grupoSector})::int`,
        conPlan: sql<number>`count(*) FILTER (WHERE ${empresasProspectos.planRecomendado} IS NOT NULL)::int`,
        altaProbabilidad: sql<number>`count(*) FILTER (WHERE ${empresasProspectos.leadScore} >= 60)::int`,
      }).from(empresasProspectos);

      const estadosResult = await db.execute(sql`
        SELECT ${empresasProspectos.estado} as estado,
          ${zoneCase} as zona,
          count(*)::int as empresas,
          count(*) FILTER (WHERE ${empresasProspectos.planRecomendado} IS NOT NULL)::int as con_plan,
          coalesce(sum(${empresasProspectos.empleadosEstimados}),0)::int as empleados
        FROM ${empresasProspectos}
        WHERE ${empresasProspectos.estado} IS NOT NULL AND ${empresasProspectos.estado} != ''
        GROUP BY 1, 2 ORDER BY 3 DESC
      `);

      const zonesArr = Array.isArray(zonesResult) ? zonesResult : (zonesResult as { rows: Record<string, unknown>[] }).rows;
      const sectorsArr = Array.isArray(sectorsResult) ? sectorsResult : (sectorsResult as { rows: Record<string, unknown>[] }).rows;
      const plansArr = Array.isArray(plansResult) ? plansResult : (plansResult as { rows: Record<string, unknown>[] }).rows;
      const estadosArr = Array.isArray(estadosResult) ? estadosResult : (estadosResult as { rows: Record<string, unknown>[] }).rows;

      const payload = {
        totals,
        zonas: zonesArr,
        sectores: sectorsArr,
        planes: plansArr,
        estados: estadosArr,
      };
      propuestaMercadoCache = { data: payload, ts: Date.now() };
      try { fs.writeFileSync(PROPUESTA_CACHE_FILE, JSON.stringify(propuestaMercadoCache)); } catch {}
      res.json(payload);
    } catch (err) { next(err); }
  });

  app.post("/api/empresas-prospectos/perfilar-masivo", requireAuth, requireSuperadmin, async (_req, res, next) => {
    let totalUpdated = 0;
    try {
      const estados = await db.execute(sql`
        SELECT DISTINCT ${empresasProspectos.estado} as estado
        FROM ${empresasProspectos}
        WHERE ${empresasProspectos.planRecomendado} IS NULL
        AND ${empresasProspectos.estado} IS NOT NULL
        AND ${empresasProspectos.estado} != ''
      `);

      const estadosList = (estados as any).rows?.map((r: any) => r.estado) ?? estados.map((r: any) => r.estado);

      const nullEstadoCount = await db.execute(sql`
        SELECT count(*)::int as cnt FROM ${empresasProspectos}
        WHERE ${empresasProspectos.planRecomendado} IS NULL
        AND (${empresasProspectos.estado} IS NULL OR ${empresasProspectos.estado} = '')
      `);
      const hasNullEstados = ((nullEstadoCount as any).rows?.[0]?.cnt ?? (nullEstadoCount as any)[0]?.cnt ?? 0) > 0;
      if (hasNullEstados) {
        estadosList.push(null);
      }

      for (const estado of estadosList) {
        const estadoFilter = estado === null
          ? sql`(${empresasProspectos.estado} IS NULL OR ${empresasProspectos.estado} = '')`
          : sql`${empresasProspectos.estado} = ${estado}`;

        const result = await db.execute(sql`
          UPDATE empresas_prospectos SET
            grupo_sector = CASE
              WHEN left(codigo_scian, 2) IN ('11','21','22') THEN 'Otros'
              WHEN left(codigo_scian, 2) = '23' THEN 'Construcción'
              WHEN left(codigo_scian, 2) IN ('31','32','33') THEN 'Manufactura'
              WHEN left(codigo_scian, 2) = '43' THEN 'Comercio Mayoreo'
              WHEN left(codigo_scian, 2) = '46' THEN 'Comercio Menudeo'
              WHEN left(codigo_scian, 2) IN ('48','49') THEN 'Transporte'
              WHEN left(codigo_scian, 2) = '51' THEN 'Información'
              WHEN left(codigo_scian, 2) = '52' THEN 'Finanzas/Seguros'
              WHEN left(codigo_scian, 2) = '53' THEN 'Inmobiliario'
              WHEN left(codigo_scian, 2) = '54' THEN 'Servicios Profesionales'
              WHEN left(codigo_scian, 2) = '55' THEN 'Corporativos'
              WHEN left(codigo_scian, 2) = '56' THEN 'Servicios Apoyo'
              WHEN left(codigo_scian, 2) = '61' THEN 'Educación'
              WHEN left(codigo_scian, 2) = '62' THEN 'Salud'
              WHEN left(codigo_scian, 2) = '71' THEN 'Entretenimiento'
              WHEN left(codigo_scian, 2) = '72' THEN 'Alojamiento/Alimentos'
              WHEN left(codigo_scian, 2) = '81' THEN 'Otros Servicios'
              WHEN left(codigo_scian, 2) = '93' THEN 'Gobierno'
              ELSE 'Otros'
            END,
            nivel_riesgo = CASE
              WHEN left(codigo_scian, 2) IN ('31','32','33','23') THEN 'Alto'
              WHEN left(codigo_scian, 2) IN ('48','49') THEN 'Alto'
              WHEN left(codigo_scian, 2) = '62' THEN 'Alto'
              WHEN left(codigo_scian, 2) IN ('11','21','22') THEN 'Alto'
              WHEN left(codigo_scian, 2) = '72' THEN 'Medio'
              WHEN left(codigo_scian, 2) = '43' THEN 'Medio'
              WHEN left(codigo_scian, 2) = '46' THEN 'Medio'
              WHEN left(codigo_scian, 2) = '71' THEN 'Medio'
              WHEN left(codigo_scian, 2) = '81' THEN 'Medio'
              WHEN left(codigo_scian, 2) = '56' THEN 'Medio'
              WHEN left(codigo_scian, 2) = '61' THEN 'Bajo'
              WHEN left(codigo_scian, 2) = '52' THEN 'Bajo'
              WHEN left(codigo_scian, 2) = '53' THEN 'Bajo'
              WHEN left(codigo_scian, 2) = '54' THEN 'Bajo'
              WHEN left(codigo_scian, 2) = '55' THEN 'Bajo'
              WHEN left(codigo_scian, 2) = '93' THEN 'Bajo'
              WHEN left(codigo_scian, 2) = '51' THEN 'Bajo'
              ELSE 'Alto'
            END,
            empleados_estimados = CASE
              WHEN estrato_personal = '0 a 5 personas' THEN 3
              WHEN estrato_personal = '6 a 10 personas' THEN 8
              WHEN estrato_personal = '11 a 30 personas' THEN 20
              WHEN estrato_personal = '31 a 50 personas' THEN 40
              WHEN estrato_personal = '51 a 100 personas' THEN 75
              WHEN estrato_personal = '101 a 250 personas' THEN 175
              WHEN estrato_personal = '251 y más personas' THEN 350
              ELSE empleados_estimados
            END,
            plan_recomendado = CASE
              WHEN estrato_personal IN ('0 a 5 personas','6 a 10 personas','11 a 30 personas') THEN 'Impulsa'
              WHEN estrato_personal IN ('31 a 50 personas','51 a 100 personas') THEN 'Transforma'
              WHEN estrato_personal IN ('101 a 250 personas','251 y más personas') THEN 'Lidera'
              ELSE 'Impulsa'
            END,
            updated_at = now()
          WHERE plan_recomendado IS NULL AND ${estadoFilter}
        `);

        const rowCount = (result as any).rowCount ?? (result as any).length ?? 0;
        totalUpdated += rowCount;
        console.log(`[perfilar-masivo] Estado: ${estado ?? '(sin estado)'} → ${rowCount} empresas actualizadas`);
      }

      propuestaMercadoCache = null;
      try { fs.unlinkSync(PROPUESTA_CACHE_FILE); } catch {}

      res.json({ ok: true, totalUpdated });
    } catch (err) {
      if (totalUpdated > 0) { propuestaMercadoCache = null; try { fs.unlinkSync(PROPUESTA_CACHE_FILE); } catch {} }
      next(err);
    }
  });

  app.post("/api/empresas-prospectos/asignar-zonas", requireAuth, requireSuperadmin, async (_req, res) => {
    res.json({ ok: true, message: "Asignación de zonas iniciada en segundo plano" });
    (async () => {
      let totalUpdated = 0;
      for (const [estado, zona] of Object.entries(ZONA_POR_ESTADO)) {
        try {
          const result = await db.execute(sql`
            UPDATE empresas_prospectos SET zona_comercial = ${zona}
            WHERE estado = ${estado} AND plan_recomendado IS NOT NULL AND (zona_comercial IS NULL OR zona_comercial NOT IN ('Centro','Norte','Bajío','Sur-Sureste'))
          `);
          const rowCount = typeof result === "object" && "rowCount" in result ? (result as any).rowCount : 0;
          totalUpdated += rowCount;
          console.log(`[asignar-zonas] ${estado} → ${zona}: ${rowCount} actualizados`);
        } catch (e) {
          console.error(`[asignar-zonas] Error en ${estado}:`, e);
        }
      }
      console.log(`[asignar-zonas] Completado: ${totalUpdated} prospectos actualizados`);
      propuestaMercadoCache = null;
      try { fs.unlinkSync(PROPUESTA_CACHE_FILE); } catch {}
    })();
  });

  // ═══════ Insurance / Seguros ═══════
  app.get("/api/insurance/plans", async (_req, res, next) => {
    try {
      const plans = await db.select().from(insurancePlans).where(eq(insurancePlans.isActive, true));
      res.json(plans);
    } catch (err) { next(err); }
  });

  app.get("/api/insurance/my-enrollment", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId;
      if (!userId) return res.status(401).json({ message: "No autenticado" });
      const results = await db.select().from(insuranceEnrollments)
        .where(and(eq(insuranceEnrollments.userId, userId), inArray(insuranceEnrollments.status, ["active", "pending"])));
      if (!results.length) return res.json(null);
      const enrollment = results.find(e => e.status === "active") || results[0];
      const [plan] = await db.select().from(insurancePlans).where(eq(insurancePlans.id, enrollment.planId));
      res.json({ enrollment, plan });
    } catch (err) { next(err); }
  });

  app.post("/api/insurance/enroll", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId;
      if (!userId) return res.status(401).json({ message: "No autenticado" });
      const existing = await db.select().from(insuranceEnrollments)
        .where(and(eq(insuranceEnrollments.userId, userId), inArray(insuranceEnrollments.status, ["active", "pending"])));
      if (existing.length > 0) return res.status(400).json({ message: "Ya tienes un seguro activo o pendiente. Cancélalo primero." });

      const parsed = insertInsuranceEnrollmentSchema.parse({ ...req.body, userId });
      const [enrollment] = await db.insert(insuranceEnrollments).values(parsed).returning();
      res.json(enrollment);
    } catch (err) { next(err); }
  });

  app.patch("/api/insurance/enrollment/:id/cancel", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId;
      if (!userId) return res.status(401).json({ message: "No autenticado" });
      const [enrollment] = await db.select().from(insuranceEnrollments)
        .where(and(eq(insuranceEnrollments.id, req.params.id), eq(insuranceEnrollments.userId, userId)));
      if (!enrollment) return res.status(404).json({ message: "Enrollment no encontrado" });
      const [updated] = await db.update(insuranceEnrollments)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(insuranceEnrollments.id, req.params.id)).returning();
      res.json(updated);
    } catch (err) { next(err); }
  });

  app.get("/api/admin/insurance/enrollments", requireAdmin, async (_req, res, next) => {
    try {
      const enrollments = await db.select({
        enrollment: insuranceEnrollments,
        plan: insurancePlans,
        user: { id: users.id, email: users.email },
        profile: { fullName: profiles.fullName },
      }).from(insuranceEnrollments)
        .innerJoin(insurancePlans, eq(insuranceEnrollments.planId, insurancePlans.id))
        .innerJoin(users, eq(insuranceEnrollments.userId, users.id))
        .leftJoin(profiles, eq(insuranceEnrollments.userId, profiles.id))
        .orderBy(desc(insuranceEnrollments.createdAt));
      const mapped = enrollments.map(e => ({
        enrollment: e.enrollment,
        plan: e.plan,
        user: { id: e.user.id, email: e.user.email, fullName: e.profile?.fullName || e.user.email },
      }));
      res.json(mapped);
    } catch (err) { next(err); }
  });

  app.patch("/api/admin/insurance/enrollment/:id", requireAdmin, async (req, res, next) => {
    try {
      const { status, policyNumber, certificateUrl } = req.body;
      const updates: any = { updatedAt: new Date() };
      if (status) updates.status = status;
      if (policyNumber !== undefined) updates.policyNumber = policyNumber;
      if (certificateUrl !== undefined) updates.certificateUrl = certificateUrl;
      const [updated] = await db.update(insuranceEnrollments)
        .set(updates).where(eq(insuranceEnrollments.id, req.params.id)).returning();
      res.json(updated);
    } catch (err) { next(err); }
  });

  // Bank info endpoint — returns configured bank details for SAM payments
  app.get("/api/bank-info", requireAuth, (_req, res) => {
    res.json(getBankInfo());
  });

  registerFinancieroRoutes(app);

  app.use("/api/store", storeRoutes);

  app.get("/api/admin/export-prospectos-csv", adminRateLimit, async (req, res, next) => {
    try {
      const authKey = req.headers["x-migrate-key"] || req.query.key;
      if (!authKey || authKey !== getAdminApiKey()) return res.status(403).json({ message: "No autorizado" });
      const fs = await import("fs");
      const csvPath = "/tmp/prospectos_perfilados.csv.gz";
      if (!fs.existsSync(csvPath)) {
        return res.status(404).json({ message: "CSV file not found" });
      }
      res.setHeader("Content-Type", "application/gzip");
      res.setHeader("Content-Disposition", "attachment; filename=prospectos.csv.gz");
      fs.createReadStream(csvPath).pipe(res);
    } catch (err) { next(err); }
  });

  app.post("/api/admin/import-prospectos-from-url", adminRateLimit, async (req, res, next) => {
    try {
      const authKey = req.headers["x-migrate-key"];
      if (!authKey || authKey !== getAdminApiKey()) return res.status(403).json({ message: "No autorizado" });
      const { url } = req.body;
      if (!url) return res.status(400).json({ message: "URL requerida" });

      const { execFile } = await import("child_process");
      const { promisify } = await import("util");
      const fs = await import("fs");
      const execFileAsync = promisify(execFile);

      res.json({ status: "started", message: "Descargando e importando CSV en background..." });

      (async () => {
        try {
          console.log("[import] Downloading CSV from source...");
          const response = await fetch(url, { signal: AbortSignal.timeout(600000) });
          if (!response.ok) throw new Error(`Download failed: ${response.status}`);
          const buffer = Buffer.from(await response.arrayBuffer());
          fs.writeFileSync("/tmp/import_prospectos.csv.gz", buffer);
          console.log(`[import] Downloaded ${(buffer.length / 1024 / 1024).toFixed(1)} MB`);

          await execFileAsync("gunzip", ["-f", "/tmp/import_prospectos.csv.gz"]);
          console.log("[import] Decompressed CSV");

          const cols = "id,denue_id,nombre_comercial,razon_social,actividad_economica,codigo_scian,tipo_establecimiento,estrato_personal,empleados_min,empleados_max,telefono,correo_electronico,sitio_web,tipo_vialidad,calle,num_exterior,num_interior,colonia,codigo_postal,municipio,estado,latitud,longitud,lead_score,score_desglose,stage,noms_aplicables,import_batch_id,zona_comercial,prioridad,empleados_estimados,potencial_aportacion_mensual,nivel_riesgo,grupo_sector,plan_recomendado,direccion_completa";

          const psqlScript = `
BEGIN;
CREATE TEMP TABLE import_staging (LIKE empresas_prospectos INCLUDING DEFAULTS) ON COMMIT DROP;
\\COPY import_staging (${cols}) FROM '/tmp/import_prospectos.csv' WITH CSV HEADER
INSERT INTO empresas_prospectos (${cols}, created_at, updated_at)
SELECT ${cols}, NOW(), NOW() FROM import_staging
ON CONFLICT (id) DO NOTHING;
COMMIT;
          `.trim();

          fs.writeFileSync("/tmp/import_script.sql", psqlScript);
          console.log("[import] Running COPY + merge via psql...");
          const dbUrl = process.env.DB_URL;
          if (!dbUrl) throw new Error("DB_URL not configured");
          const { stdout } = await execFileAsync("psql", [dbUrl, "-f", "/tmp/import_script.sql"], {
            timeout: 900000,
          });
          console.log(`[import] psql output: ${stdout.trim()}`);

          try { fs.unlinkSync("/tmp/import_prospectos.csv"); } catch {}
          try { fs.unlinkSync("/tmp/import_script.sql"); } catch {}

          const countResult = await db.execute(sql`SELECT COUNT(*) as c FROM empresas_prospectos`);
          console.log(`[import] Done! Total rows: ${(countResult as any).rows[0].c}`);
        } catch (err: any) {
          console.error(`[import] Error: ${err.message}`);
        }
      })();
    } catch (err) { next(err); }
  });

  app.post("/api/admin/bulk-migrate-prospectos", adminRateLimit, async (req, res, next) => {
    try {
      const authKey = req.headers["x-migrate-key"];
      if (!authKey || authKey !== getAdminApiKey()) return res.status(403).json({ message: "No autorizado" });
      const { rows } = req.body;
      if (!rows || !Array.isArray(rows) || rows.length === 0) return res.status(400).json({ message: "Sin datos" });

      let insertedCount = 0;
      // Process in batches using parameterized queries via Drizzle
      const BATCH_SIZE = 100;
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const valuesToInsert = batch.map((r: any) => ({
          id: r.id || undefined,
          denueId: r.denue_id || null,
          nombreComercial: r.nombre_comercial || "Sin nombre",
          razonSocial: r.razon_social || null,
          actividadEconomica: r.actividad_economica || null,
          codigoScian: r.codigo_scian || null,
          tipoEstablecimiento: r.tipo_establecimiento || null,
          estratoPersonal: r.estrato_personal || null,
          empleadosMin: r.empleados_min != null ? Number(r.empleados_min) : null,
          empleadosMax: r.empleados_max != null ? Number(r.empleados_max) : null,
          telefono: r.telefono || null,
          correoElectronico: r.correo_electronico || null,
          sitioWeb: r.sitio_web || null,
          tipoVialidad: r.tipo_vialidad || null,
          calle: r.calle || null,
          numExterior: r.num_exterior || null,
          numInterior: r.num_interior || null,
          colonia: r.colonia || null,
          codigoPostal: r.codigo_postal || null,
          municipio: r.municipio || null,
          estado: r.estado || null,
          latitud: r.latitud != null ? Number(r.latitud) : null,
          longitud: r.longitud != null ? Number(r.longitud) : null,
          leadScore: r.lead_score != null ? Number(r.lead_score) : 0,
          scoreDesglose: r.score_desglose || null,
          stage: r.stage || "nuevo",
          partnerId: r.partner_id || null,
          nomsAplicables: r.noms_aplicables || null,
          fechaAlta: r.fecha_alta ? new Date(r.fecha_alta) : null,
          importBatchId: r.import_batch_id || null,
          zonaComercial: r.zona_comercial || null,
          prioridad: r.prioridad || null,
          empleadosEstimados: r.empleados_estimados != null ? Number(r.empleados_estimados) : null,
          potencialAportacionMensual: r.potencial_aportacion_mensual != null ? Number(r.potencial_aportacion_mensual) : null,
          nivelRiesgo: r.nivel_riesgo || null,
          grupoSector: r.grupo_sector || null,
          planRecomendado: r.plan_recomendado || null,
          direccionCompleta: r.direccion_completa || null,
        }));
        await db.insert(empresasProspectos).values(valuesToInsert).onConflictDoNothing();
        insertedCount += batch.length;
      }
      res.json({ ok: true, inserted: insertedCount });
    } catch (err) { next(err); }
  });

  app.get("/api/membership/me", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const [membership] = await db.select().from(cooperativeMemberships).where(eq(cooperativeMemberships.userId, userId));
      if (!membership) return res.json(null);
      const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId));
      res.json({ ...membership, country: profile?.country || null, phone: profile?.phoneNumber || null });
    } catch (err) { next(err); }
  });

  app.post("/api/membership/join", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const [existing] = await db.select().from(cooperativeMemberships).where(eq(cooperativeMemberships.userId, userId));
      if (existing) return res.json(existing);

      const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId));
      const [user] = await db.select().from(users).where(eq(users.id, userId));

      const { generateMembershipCode } = await import("./seed-terms");
      const membershipNumber = await generateMembershipCode();

      const acceptanceData = `${user.email}|${profile?.fullName || ''}|${new Date().toISOString()}|accepted_statutes`;
      const crypto = await import("crypto");
      const acceptanceHash = crypto.createHash('sha256').update(acceptanceData).digest('hex');

      const [membership] = await db.insert(cooperativeMemberships).values({
        userId,
        fullName: profile?.fullName || user.email.split('@')[0],
        email: user.email,
        membershipNumber,
        membershipType: "consumo",
        status: "activo",
        acceptedStatutes: true,
        acceptanceHash,
        acceptanceIp: (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown'),
        acceptanceUserAgent: req.headers['user-agent'] || 'unknown',
      }).returning();

      await db.update(accounts)
        .set({ referralCode: membershipNumber })
        .where(eq(accounts.id, userId));

      createOrUpdateContactCard(userId, { title: "Socio Cooperativo" }).catch(() => {});

      res.json(membership);
    } catch (err) { next(err); }
  });

  app.get("/api/verify/socio/:numero", async (req, res, next) => {
    try {
      const { numero } = req.params;
      const [membership] = await db.select().from(cooperativeMemberships).where(eq(cooperativeMemberships.membershipNumber, numero.toUpperCase()));
      if (!membership) return res.status(404).json({ valid: false, message: "Número de membresía no encontrado" });
      res.json({
        valid: true,
        membershipNumber: membership.membershipNumber,
        fullName: membership.fullName,
        status: membership.status,
        membershipType: membership.membershipType,
        acceptedAt: membership.acceptedAt,
        certificateIssuedAt: membership.certificateIssuedAt,
      });
    } catch (err) { next(err); }
  });

  app.get("/api/admin/memberships", requireAdmin, async (req, res, next) => {
    try {
      const memberships = await db.select().from(cooperativeMemberships).orderBy(desc(cooperativeMemberships.createdAt));
      res.json(memberships);
    } catch (err) { next(err); }
  });

  app.patch("/api/admin/memberships/:id/status", requireAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, separationReason } = req.body;
      const validStatuses = ["activo", "suspendido", "separado", "excluido"];
      if (!validStatuses.includes(status)) return res.status(400).json({ message: "Estado inválido" });
      const updates: any = { status, updatedAt: new Date() };
      if (status === "separado" || status === "excluido") {
        updates.separationDate = new Date();
        updates.separationReason = separationReason || null;
      }
      const [updated] = await db.update(cooperativeMemberships).set(updates).where(eq(cooperativeMemberships.id, id)).returning();
      if (!updated) return res.status(404).json({ message: "Membresía no encontrada" });
      res.json(updated);
    } catch (err) { next(err); }
  });

  app.get("/api/instructor-application/mine", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const [app] = await db.select().from(instructorApplications).where(eq(instructorApplications.userId, userId));
      if (!app) return res.json(null);
      res.json(app);
    } catch (err) { next(err); }
  });

  app.post("/api/instructor-application", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const [existing] = await db.select().from(instructorApplications).where(eq(instructorApplications.userId, userId));
      if (existing) return res.status(400).json({ message: "Ya tienes una solicitud activa" });

      const { type } = req.body;
      if (!["dc5", "internal"].includes(type)) return res.status(400).json({ message: "Tipo inválido" });

      const profile = await storage.getProfile(userId);
      const user = await storage.getUser(userId);

      const [application] = await db.insert(instructorApplications).values({
        userId,
        type,
        status: "draft",
        currentStep: 1,
        fullName: profile?.fullName || null,
        email: user?.email || null,
        quizMaxAttempts: type === "dc5" ? 3 : 3,
        quizPassingScore: type === "dc5" ? 70 : 60,
      }).returning();
      res.json(application);
    } catch (err) { next(err); }
  });

  app.patch("/api/instructor-application", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const [existing] = await db.select().from(instructorApplications).where(eq(instructorApplications.userId, userId));
      if (!existing) return res.status(404).json({ message: "Solicitud no encontrada" });
      if (existing.status === "active" || existing.status === "rejected") {
        return res.status(400).json({ message: "No se puede modificar esta solicitud" });
      }

      const allowedFields = [
        "currentStep", "fullName", "email", "phone", "specialty", "bio", "profileImageUrl", "linkedinUrl",
        "yearsExperience", "education", "certifications", "cvUrl", "areasExpertise", "teachingExperience",
        "bankName", "bankClabe", "rfc", "fiscalName", "fiscalRegime",
        "dc5PaymentMethod", "dc5PaymentReference", "dc5PaymentStatus",
      ];
      const updateData: Record<string, any> = { updatedAt: new Date() };
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) updateData[key] = req.body[key];
      }

      const [updated] = await db.update(instructorApplications).set(updateData).where(eq(instructorApplications.id, existing.id)).returning();
      res.json(updated);
    } catch (err) { next(err); }
  });

  const INSTRUCTOR_QUIZ_DC5 = [
    { question: "¿Cuál es el objetivo principal de la NOM-035-STPS-2018?", options: ["Prevenir accidentes laborales", "Identificar y prevenir factores de riesgo psicosocial", "Regular el uso de EPP", "Establecer salarios mínimos"], correct: 1 },
    { question: "¿Qué documento acredita a un agente capacitador externo ante la STPS?", options: ["DC-1", "DC-3", "DC-5", "DC-4"], correct: 2 },
    { question: "¿Cuántas horas mínimas debe tener un curso para emitir DC-3?", options: ["10 horas", "20 horas", "No hay mínimo establecido", "40 horas"], correct: 2 },
    { question: "¿Qué es una competencia laboral según la STPS?", options: ["Un título universitario", "La capacidad productiva medida en términos de desempeño", "Una certificación internacional", "Un diploma de posgrado"], correct: 1 },
    { question: "¿Cuál es el formato oficial para constancias de competencias laborales?", options: ["DC-1", "DC-2", "DC-3", "DC-4"], correct: 2 },
    { question: "¿Qué ley regula la capacitación y adiestramiento en México?", options: ["Ley del ISR", "Ley Federal del Trabajo", "Ley General de Educación", "Ley de Comercio"], correct: 1 },
    { question: "¿Cada cuánto tiempo debe actualizarse el programa de capacitación de una empresa?", options: ["Cada 6 meses", "Cada año", "Cada 2 años", "Cada 5 años"], correct: 2 },
    { question: "¿Qué evalúa una Detección de Necesidades de Capacitación (DNC)?", options: ["El presupuesto disponible", "Las brechas entre competencias actuales y requeridas", "Los salarios del personal", "La productividad general"], correct: 1 },
    { question: "¿Cuál es la función del Comité Mixto de Capacitación?", options: ["Contratar instructores", "Vigilar la aplicación de los programas de capacitación", "Establecer horarios", "Administrar nómina"], correct: 1 },
    { question: "¿Qué NOM establece las condiciones de seguridad para el manejo de sustancias químicas?", options: ["NOM-005", "NOM-010", "NOM-017", "NOM-025"], correct: 1 },
    { question: "¿Cuál es el enfoque principal del modelo de competencias laborales?", options: ["Memorización de contenidos", "Desempeño demostrable en situaciones reales", "Acumulación de horas de capacitación", "Asistencia a cursos"], correct: 1 },
    { question: "¿Qué debe incluir una carta descriptiva para un curso de capacitación?", options: ["Solo el temario", "Objetivos, contenidos, técnicas didácticas y evaluación", "Solo la lista de asistencia", "El currículum del instructor"], correct: 1 },
    { question: "¿Cuál es la diferencia entre capacitación y adiestramiento?", options: ["No hay diferencia", "Capacitación es teórica, adiestramiento es práctico", "Adiestramiento es más costoso", "Capacitación solo es para gerentes"], correct: 1 },
    { question: "¿Qué técnica didáctica es más efectiva para habilidades manuales?", options: ["Conferencia magistral", "Lectura individual", "Demostración-ejecución", "Debate grupal"], correct: 2 },
    { question: "¿Qué porcentaje mínimo de asistencia se requiere normalmente para emitir un DC-3?", options: ["50%", "60%", "80%", "100%"], correct: 2 },
    { question: "¿Qué es la andragogía?", options: ["Enseñanza para niños", "Ciencia de la educación de adultos", "Método de evaluación", "Sistema de calificación"], correct: 1 },
    { question: "¿Cuál es el primer paso en el diseño instruccional ADDIE?", options: ["Diseño", "Implementación", "Análisis", "Evaluación"], correct: 2 },
    { question: "¿Qué tipo de evaluación mide el aprendizaje durante el proceso?", options: ["Evaluación diagnóstica", "Evaluación formativa", "Evaluación sumativa", "Evaluación externa"], correct: 1 },
    { question: "¿Qué NOM regula las condiciones de iluminación en centros de trabajo?", options: ["NOM-010", "NOM-017", "NOM-025", "NOM-030"], correct: 2 },
    { question: "¿Cuál es la responsabilidad principal del instructor durante la evaluación?", options: ["Reprobar al mayor número posible", "Verificar objetivamente el logro de competencias", "Facilitar todas las respuestas", "Solo registrar asistencia"], correct: 1 },
  ];

  const INSTRUCTOR_QUIZ_INTERNAL = [
    { question: "¿Cuál es el objetivo de un curso de inducción?", options: ["Evaluar conocimientos previos", "Integrar al nuevo trabajador a la empresa", "Certificar competencias", "Generar reportes"], correct: 1 },
    { question: "¿Qué elemento es esencial en un plan de capacitación?", options: ["Logo de la empresa", "Objetivos de aprendizaje claros", "Fotografías del instructor", "Lista de precios"], correct: 1 },
    { question: "¿Qué es el aprendizaje significativo?", options: ["Memorizar datos", "Relacionar nuevos conocimientos con experiencias previas", "Repetir conceptos", "Copiar información"], correct: 1 },
    { question: "¿Cuál es una buena práctica al iniciar una sesión de capacitación?", options: ["Ir directo al contenido", "Realizar una actividad de integración o diagnóstico", "Repartir el examen final", "Hablar del instructor"], correct: 1 },
    { question: "¿Qué recurso es más efectivo para capacitación técnica?", options: ["Solo presentaciones de texto", "Videos demostrativos y práctica guiada", "Lectura de manuales", "Conferencias largas"], correct: 1 },
    { question: "¿Cómo se mide la efectividad de una capacitación?", options: ["Por la cantidad de horas", "Por la mejora en el desempeño laboral", "Por el costo invertido", "Por el número de asistentes"], correct: 1 },
    { question: "¿Qué debe hacer un instructor ante una pregunta que no sabe responder?", options: ["Inventar una respuesta", "Ignorar la pregunta", "Reconocerlo y comprometerse a investigar", "Cambiar de tema"], correct: 2 },
    { question: "¿Cuál es la importancia del feedback en la capacitación?", options: ["No es importante", "Permite al participante conocer su progreso", "Solo sirve para calificar", "Es opcional"], correct: 1 },
    { question: "¿Qué característica debe tener un objetivo de aprendizaje?", options: ["Ser vago y general", "Ser medible, observable y alcanzable", "Ser largo y detallado", "Solo incluir el tema"], correct: 1 },
    { question: "¿Por qué es importante conocer a la audiencia antes de diseñar un curso?", options: ["No es necesario", "Para adaptar contenido, nivel y metodología", "Para decidir el horario", "Para elegir el salón"], correct: 1 },
  ];

  app.get("/api/instructor-application/quiz", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const [app] = await db.select().from(instructorApplications).where(eq(instructorApplications.userId, userId));
      if (!app) return res.status(404).json({ message: "Solicitud no encontrada" });

      const questions = app.type === "dc5" ? INSTRUCTOR_QUIZ_DC5 : INSTRUCTOR_QUIZ_INTERNAL;
      const sanitized = questions.map((q, i) => ({ index: i, question: q.question, options: q.options }));
      res.json({
        questions: sanitized,
        totalQuestions: questions.length,
        passingScore: app.quizPassingScore,
        attemptsUsed: app.quizAttempts || 0,
        maxAttempts: app.quizMaxAttempts,
        passed: app.quizPassed,
        lastScore: app.quizScore,
        lastAttemptAt: app.quizLastAttemptAt,
      });
    } catch (err) { next(err); }
  });

  app.post("/api/instructor-application/quiz", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const [app] = await db.select().from(instructorApplications).where(eq(instructorApplications.userId, userId));
      if (!app) return res.status(404).json({ message: "Solicitud no encontrada" });
      if (app.quizPassed) return res.status(400).json({ message: "Ya aprobaste la evaluación" });
      if ((app.quizAttempts || 0) >= (app.quizMaxAttempts || 3)) {
        return res.status(400).json({ message: "Has agotado tus intentos" });
      }

      if (app.quizLastAttemptAt) {
        const cooldownMs = 24 * 60 * 60 * 1000;
        const timeSince = Date.now() - new Date(app.quizLastAttemptAt).getTime();
        if (timeSince < cooldownMs && (app.quizAttempts || 0) > 0) {
          const remainingHours = Math.ceil((cooldownMs - timeSince) / (60 * 60 * 1000));
          return res.status(400).json({ message: `Debes esperar ${remainingHours} horas antes de intentar de nuevo` });
        }
      }

      const { answers } = req.body;
      const questions = app.type === "dc5" ? INSTRUCTOR_QUIZ_DC5 : INSTRUCTOR_QUIZ_INTERNAL;
      if (!Array.isArray(answers) || answers.length !== questions.length) {
        return res.status(400).json({ message: "Respuestas inválidas" });
      }

      let correctCount = 0;
      for (let i = 0; i < questions.length; i++) {
        if (answers[i] === questions[i].correct) correctCount++;
      }
      const score = Math.round((correctCount / questions.length) * 100);
      const passed = score >= (app.quizPassingScore || 70);

      const [updated] = await db.update(instructorApplications).set({
        quizScore: score,
        quizAttempts: (app.quizAttempts || 0) + 1,
        quizLastAttemptAt: new Date(),
        quizPassed: passed,
        quizAnswers: answers,
        updatedAt: new Date(),
      }).where(eq(instructorApplications.id, app.id)).returning();

      res.json({
        score,
        passed,
        correctCount,
        totalQuestions: questions.length,
        attemptsUsed: updated.quizAttempts,
        maxAttempts: updated.quizMaxAttempts,
      });
    } catch (err) { next(err); }
  });

  app.post("/api/instructor-application/accept-terms", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const [app] = await db.select().from(instructorApplications).where(eq(instructorApplications.userId, userId));
      if (!app) return res.status(404).json({ message: "Solicitud no encontrada" });

      const { codeOfConduct, contentPolicy, revenueShare } = req.body;
      if (!codeOfConduct || !contentPolicy || !revenueShare) {
        return res.status(400).json({ message: "Debes aceptar todos los términos" });
      }

      const crypto = await import("crypto");
      const termsText = `terms_accepted:${userId}:${new Date().toISOString()}:code_of_conduct:content_policy:revenue_share`;
      const hash = crypto.createHash("sha256").update(termsText).digest("hex");

      const [updated] = await db.update(instructorApplications).set({
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        termsAcceptanceHash: hash,
        termsCodeOfConduct: true,
        termsContentPolicy: true,
        termsRevenueShare: true,
        updatedAt: new Date(),
      }).where(eq(instructorApplications.id, app.id)).returning();

      res.json(updated);
    } catch (err) { next(err); }
  });

  app.post("/api/instructor-application/submit", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const [app] = await db.select().from(instructorApplications).where(eq(instructorApplications.userId, userId));
      if (!app) return res.status(404).json({ message: "Solicitud no encontrada" });

      if (!app.quizPassed) return res.status(400).json({ message: "Debes aprobar la evaluación primero" });
      if (!app.termsAccepted) return res.status(400).json({ message: "Debes aceptar los términos" });

      let newStatus: string;
      if (app.type === "internal") {
        newStatus = "active";
        const [membership] = await db.select().from(cooperativeMemberships).where(eq(cooperativeMemberships.userId, userId));
        const instructorNumber = membership?.membershipNumber || null;
        const [existing] = await db.select().from(instructorProfiles).where(eq(instructorProfiles.id, userId));
        if (!existing) {
          await db.insert(instructorProfiles).values({
            id: userId,
            bio: app.bio,
            specialty: app.specialty,
            profileImageUrl: app.profileImageUrl,
            verified: true,
            verifiedAt: new Date(),
            instructorBadgeType: "interno",
          });
        } else {
          await db.update(instructorProfiles).set({
            instructorBadgeType: "interno",
          }).where(eq(instructorProfiles.id, userId));
        }
        await db.update(accounts).set({ isInstructor: true, userRole: "socio_instructor", updatedAt: new Date() }).where(eq(accounts.id, userId));
        await db.update(instructorApplications).set({
          status: "active",
          instructorNumber,
          activatedAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(instructorApplications.id, app.id));
        createOrUpdateContactCard(userId, { title: "Instructor Interno", avatarUrl: app.profileImageUrl || undefined }).catch(() => {});
        const [result] = await db.select().from(instructorApplications).where(eq(instructorApplications.id, app.id));
        return res.json(result);
      } else {
        newStatus = "pending_dc5";
        const [updated] = await db.update(instructorApplications).set({
          status: newStatus as any,
          updatedAt: new Date(),
        }).where(eq(instructorApplications.id, app.id)).returning();
        return res.json(updated);
      }
    } catch (err) { next(err); }
  });

  app.patch("/api/instructor-onboarding/step", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const { step } = req.body;
      if (typeof step !== "number" || step < 0 || step > 5) {
        return res.status(400).json({ message: "Paso inválido" });
      }
      await db.update(accounts).set({
        instructorOnboardingStep: step,
        updatedAt: new Date(),
      }).where(eq(accounts.id, userId));
      return res.json({ step });
    } catch (err) { next(err); }
  });

  app.get("/api/instructor-onboarding/step", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const [account] = await db.select({ step: accounts.instructorOnboardingStep }).from(accounts).where(eq(accounts.id, userId));
      return res.json({ step: account?.step ?? 0 });
    } catch (err) { next(err); }
  });

  app.get("/api/admin/instructor-applications", requireAdmin, async (req, res, next) => {
    try {
      const { status, type } = req.query;
      let query = db.select({
        application: instructorApplications,
        userEmail: users.email,
      }).from(instructorApplications)
        .innerJoin(users, eq(instructorApplications.userId, users.id))
        .orderBy(desc(instructorApplications.createdAt));

      const conditions: SQL[] = [];
      if (status && typeof status === "string") {
        conditions.push(eq(instructorApplications.status, status as any));
      }
      if (type && typeof type === "string") {
        conditions.push(eq(instructorApplications.type, type as any));
      }

      let results;
      if (conditions.length > 0) {
        results = await query.where(and(...conditions));
      } else {
        results = await query;
      }

      res.json(results.map(r => ({ ...r.application, userEmail: r.userEmail })));
    } catch (err) { next(err); }
  });

  app.patch("/api/admin/instructor-applications/:id", requireAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { action, notes } = req.body;
      const adminUserId = req.supabaseUserId!;

      const [app] = await db.select().from(instructorApplications).where(eq(instructorApplications.id, id));
      if (!app) return res.status(404).json({ message: "Solicitud no encontrada" });

      const reviewableStatuses = ["pending_review", "pending_dc5"];
      if (!reviewableStatuses.includes(app.status)) {
        return res.status(400).json({ message: `No se puede ${action === "approve" ? "aprobar" : "rechazar"} una solicitud con estado "${app.status}"` });
      }

      if (action === "approve") {
        if (!app.quizPassed) return res.status(400).json({ message: "El solicitante no ha aprobado la evaluación" });
        if (!app.termsAccepted) return res.status(400).json({ message: "El solicitante no ha aceptado los términos" });
        const [membership] = await db.select().from(cooperativeMemberships).where(eq(cooperativeMemberships.userId, app.userId));
        const instructorNumber = membership?.membershipNumber || null;
        const badgeType = app.type === "dc5" ? "acreditado_dc5" as const : "interno" as const;

        const [existing] = await db.select().from(instructorProfiles).where(eq(instructorProfiles.id, app.userId));
        if (!existing) {
          await db.insert(instructorProfiles).values({
            id: app.userId,
            bio: app.bio,
            specialty: app.specialty,
            profileImageUrl: app.profileImageUrl,
            bankName: app.bankName,
            bankClabe: app.bankClabe,
            verified: true,
            verifiedAt: new Date(),
            instructorBadgeType: badgeType,
          });
        } else {
          await db.update(instructorProfiles).set({
            verified: true,
            verifiedAt: new Date(),
            bio: app.bio || existing.bio,
            specialty: app.specialty || existing.specialty,
            instructorBadgeType: badgeType,
          }).where(eq(instructorProfiles.id, app.userId));
        }

        await db.update(accounts).set({ isInstructor: true, userRole: "socio_instructor", updatedAt: new Date() }).where(eq(accounts.id, app.userId));

        const [updated] = await db.update(instructorApplications).set({
          status: "active",
          adminNotes: notes || null,
          reviewedBy: adminUserId,
          reviewedAt: new Date(),
          instructorNumber,
          activatedAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(instructorApplications.id, id)).returning();
        const instructorTitle = app.type === "dc5" ? "Instructor Acreditado STPS (DC-5)" : "Instructor Interno";
        createOrUpdateContactCard(app.userId, { title: instructorTitle, avatarUrl: app.profileImageUrl || undefined }).catch(() => {});
        res.json(updated);
      } else if (action === "reject") {
        const [updated] = await db.update(instructorApplications).set({
          status: "rejected",
          adminNotes: notes || null,
          reviewedBy: adminUserId,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(instructorApplications.id, id)).returning();
        res.json(updated);
      } else {
        res.status(400).json({ message: "Acción inválida" });
      }
    } catch (err) { next(err); }
  });

  const toRows = (r: any): any[] => Array.isArray(r) ? r : (r as any).rows || [];

  app.get("/api/admin/apis/keys", requireSuperadmin, async (_req, res, next) => {
    try {
      const keys = await db.select({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        owner: apiKeys.owner,
        isActive: apiKeys.isActive,
        allowedOrigins: apiKeys.allowedOrigins,
        rateLimitPerMinute: apiKeys.rateLimitPerMinute,
        rateLimitPerDay: apiKeys.rateLimitPerDay,
        requestsToday: apiKeys.requestsToday,
        requestsTodayDate: apiKeys.requestsTodayDate,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        createdAt: apiKeys.createdAt,
      }).from(apiKeys).orderBy(desc(apiKeys.createdAt));

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const logCounts = toRows(await db.execute(sql`
        SELECT api_key_id, count(*)::int as total_30d
        FROM api_request_logs WHERE created_at >= ${thirtyDaysAgo}
        GROUP BY api_key_id
      `));
      const logMap = new Map(logCounts.map((r: any) => [r.api_key_id, r.total_30d]));

      res.json(keys.map(k => ({ ...k, totalRequests30d: logMap.get(k.id) || 0 })));
    } catch (err) { next(err); }
  });

  app.get("/api/admin/api-keys", requireAdmin, async (_req, res, next) => {
    try {
      const keys = await db.select({
        id: apiKeys.id, name: apiKeys.name, keyPrefix: apiKeys.keyPrefix,
        owner: apiKeys.owner, isActive: apiKeys.isActive,
        allowedOrigins: apiKeys.allowedOrigins,
        rateLimitPerMinute: apiKeys.rateLimitPerMinute,
        rateLimitPerDay: apiKeys.rateLimitPerDay,
        requestsToday: apiKeys.requestsToday,
        lastUsedAt: apiKeys.lastUsedAt, expiresAt: apiKeys.expiresAt,
        createdAt: apiKeys.createdAt,
      }).from(apiKeys).orderBy(desc(apiKeys.createdAt));
      res.json(keys);
    } catch (err) { next(err); }
  });

  app.post("/api/admin/apis/keys", requireSuperadmin, async (req, res, next) => {
    try {
      const { name, owner, allowedOrigins, rateLimitPerMinute, rateLimitPerDay, expiresAt } = req.body;
      if (!name || !owner) return res.status(400).json({ message: "name y owner son requeridos" });
      const rawKey = `cdv_${crypto.randomBytes(32).toString("hex")}`;
      const keyHash = await bcrypt.hash(rawKey, 10);
      const keyPrefix = rawKey.slice(0, 8);
      const [newKey] = await db.insert(apiKeys).values({
        name, keyHash, keyPrefix, owner,
        allowedOrigins: allowedOrigins || [],
        rateLimitPerMinute: rateLimitPerMinute || 120,
        rateLimitPerDay: rateLimitPerDay || 50000,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }).returning();
      const { keyHash: _, ...safeKey } = newKey;
      res.status(201).json({ ...safeKey, rawKey, message: "Guarda esta key. No se mostrará nuevamente." });
    } catch (err) { next(err); }
  });

  app.post("/api/admin/api-keys", requireAdmin, async (req, res, next) => {
    try {
      const { name, owner, allowedOrigins, rateLimitPerMinute, rateLimitPerDay, expiresAt } = req.body;
      if (!name || !owner) return res.status(400).json({ message: "name y owner son requeridos" });
      const rawKey = `cdv_${crypto.randomBytes(32).toString("hex")}`;
      const keyHash = await bcrypt.hash(rawKey, 10);
      const keyPrefix = rawKey.slice(0, 8);
      const [newKey] = await db.insert(apiKeys).values({
        name, keyHash, keyPrefix, owner,
        allowedOrigins: allowedOrigins || [],
        rateLimitPerMinute: rateLimitPerMinute || 120,
        rateLimitPerDay: rateLimitPerDay || 50000,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }).returning();
      const { keyHash: _, ...safeKey } = newKey;
      res.status(201).json({ ...safeKey, rawKey, message: "Guarda esta key. No se mostrará nuevamente." });
    } catch (err) { next(err); }
  });

  app.post("/api/admin/apis/keys/reseed", requireSuperadmin, async (req, res, next) => {
    try {
      const { name, rawKey } = req.body;
      if (!name || !rawKey) return res.status(400).json({ message: "name y rawKey son requeridos" });

      const existing = await db.select().from(apiKeys).where(eq(apiKeys.name, name));
      for (const k of existing) {
        await db.delete(apiKeys).where(eq(apiKeys.id, k.id));
      }

      const keyHash = await bcrypt.hash(rawKey, 10);
      const keyPrefix = rawKey.slice(0, 8);
      const [newKey] = await db.insert(apiKeys).values({
        name,
        keyHash,
        keyPrefix,
        owner: "MeCorrieron.mx",
        isActive: true,
        allowedOrigins: ["*"],
        rateLimitPerMinute: 120,
        rateLimitPerDay: 50000,
      }).returning();

      const isValid = await bcrypt.compare(rawKey, newKey.keyHash);
      const { keyHash: _, ...safeKey } = newKey;
      res.json({ ...safeKey, verified: isValid, message: "Key reseeded and verified." });
    } catch (err) { next(err); }
  });

  app.patch("/api/admin/apis/keys/:id", requireSuperadmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, owner, isActive, allowedOrigins, rateLimitPerMinute, rateLimitPerDay, expiresAt } = req.body;
      const updates: any = { updatedAt: new Date() };
      if (typeof name === "string") updates.name = name;
      if (typeof owner === "string") updates.owner = owner;
      if (typeof isActive === "boolean") updates.isActive = isActive;
      if (allowedOrigins) updates.allowedOrigins = allowedOrigins;
      if (rateLimitPerMinute) updates.rateLimitPerMinute = rateLimitPerMinute;
      if (rateLimitPerDay) updates.rateLimitPerDay = rateLimitPerDay;
      if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
      const [updated] = await db.update(apiKeys).set(updates).where(eq(apiKeys.id, id)).returning();
      if (!updated) return res.status(404).json({ message: "API key no encontrada" });
      const { keyHash: _h, ...safe } = updated;
      res.json(safe);
    } catch (err) { next(err); }
  });

  app.patch("/api/admin/api-keys/:id", requireAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { isActive, allowedOrigins, rateLimitPerMinute, rateLimitPerDay } = req.body;
      const updates: any = { updatedAt: new Date() };
      if (typeof isActive === "boolean") updates.isActive = isActive;
      if (allowedOrigins) updates.allowedOrigins = allowedOrigins;
      if (rateLimitPerMinute) updates.rateLimitPerMinute = rateLimitPerMinute;
      if (rateLimitPerDay) updates.rateLimitPerDay = rateLimitPerDay;
      const [updated] = await db.update(apiKeys).set(updates).where(eq(apiKeys.id, id)).returning();
      if (!updated) return res.status(404).json({ message: "API key no encontrada" });
      const { keyHash: _h, ...safe } = updated;
      res.json(safe);
    } catch (err) { next(err); }
  });

  app.delete("/api/admin/apis/keys/:id", requireSuperadmin, async (req, res, next) => {
    try {
      const [updated] = await db.update(apiKeys)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(apiKeys.id, req.params.id)).returning();
      if (!updated) return res.status(404).json({ message: "API key no encontrada" });
      res.json({ success: true, message: "API key desactivada" });
    } catch (err) { next(err); }
  });

  app.post("/api/admin/apis/keys/:id/regenerate", requireSuperadmin, async (req, res, next) => {
    try {
      const rawKey = `cdv_${crypto.randomBytes(32).toString("hex")}`;
      const keyHash = await bcrypt.hash(rawKey, 10);
      const keyPrefix = rawKey.slice(0, 8);
      const [updated] = await db.update(apiKeys)
        .set({ keyHash, keyPrefix, updatedAt: new Date() })
        .where(eq(apiKeys.id, req.params.id)).returning();
      if (!updated) return res.status(404).json({ message: "API key no encontrada" });
      res.json({ rawKey, message: "Key regenerada. Guárdala ahora." });
    } catch (err) { next(err); }
  });

  app.get("/api/admin/apis/logs", requireSuperadmin, async (req, res, next) => {
    try {
      const { api_key_id, endpoint, status, date_from, date_to } = req.query;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const conditions: any[] = [];
      if (api_key_id) conditions.push(eq(apiRequestLogs.apiKeyId, api_key_id as string));
      if (endpoint) conditions.push(sql`${apiRequestLogs.endpoint} ILIKE ${'%' + endpoint + '%'}`);
      if (status === "2xx") conditions.push(sql`${apiRequestLogs.statusCode} >= 200 AND ${apiRequestLogs.statusCode} < 300`);
      else if (status === "4xx") conditions.push(sql`${apiRequestLogs.statusCode} >= 400 AND ${apiRequestLogs.statusCode} < 500`);
      else if (status === "5xx") conditions.push(sql`${apiRequestLogs.statusCode} >= 500`);
      if (date_from) conditions.push(sql`${apiRequestLogs.createdAt} >= ${new Date(date_from as string)}`);
      if (date_to) conditions.push(sql`${apiRequestLogs.createdAt} <= ${new Date(date_to as string)}`);
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const logsRaw = await db.execute(sql`
        SELECT l.id, l.endpoint, l.method, l.status_code, l.response_time_ms,
               l.ip, l.user_agent, l.query_params, l.created_at,
               k.name as api_key_name
        FROM api_request_logs l
        LEFT JOIN api_keys k ON k.id = l.api_key_id
        ${whereClause ? sql`WHERE ${whereClause}` : sql``}
        ORDER BY l.created_at DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `);
      const totalRaw = await db.execute(sql`
        SELECT count(*)::int as total FROM api_request_logs l
        ${whereClause ? sql`WHERE ${whereClause}` : sql``}
      `);
      const total = toRows(totalRaw)[0]?.total || 0;
      res.json({ data: toRows(logsRaw), pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } });
    } catch (err) { next(err); }
  });

  app.get("/api/admin/api-keys/:id/logs", requireAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const logs = await db.select().from(apiRequestLogs)
        .where(eq(apiRequestLogs.apiKeyId, id))
        .orderBy(desc(apiRequestLogs.createdAt)).limit(limit).offset((page - 1) * limit);
      const [totalResult] = await db.select({ total: count() }).from(apiRequestLogs)
        .where(eq(apiRequestLogs.apiKeyId, id));
      res.json({ logs, total: totalResult.total, page, limit });
    } catch (err) { next(err); }
  });

  app.get("/api/admin/apis/analytics", requireSuperadmin, async (req, res, next) => {
    try {
      const periodMap: Record<string, string> = { "7d": "7 days", "30d": "30 days", "90d": "90 days" };
      const period = periodMap[req.query.period as string] || "30 days";
      const keyFilter = req.query.api_key_id as string | undefined;
      const keyCondition = keyFilter ? sql`AND api_key_id = ${keyFilter}` : sql``;

      const summaryRaw = toRows(await db.execute(sql`
        SELECT count(*)::int as total_requests,
               count(DISTINCT ip)::int as unique_ips,
               coalesce(avg(response_time_ms), 0)::int as avg_response_time_ms,
               coalesce(round(100.0 * count(*) FILTER(WHERE status_code >= 400) / NULLIF(count(*), 0), 2), 0) as error_rate_pct
        FROM api_request_logs
        WHERE created_at >= NOW() - INTERVAL '${sql.raw(period)}' ${keyCondition}
      `));
      const summary = summaryRaw[0] || {};

      const perDayRaw = toRows(await db.execute(sql`
        SELECT DATE(created_at) as date,
               count(*)::int as count,
               count(*) FILTER(WHERE status_code >= 400)::int as errors,
               coalesce(avg(response_time_ms), 0)::int as avg_time
        FROM api_request_logs
        WHERE created_at >= NOW() - INTERVAL '${sql.raw(period)}' ${keyCondition}
        GROUP BY DATE(created_at) ORDER BY DATE(created_at)
      `));

      const perEndpointRaw = toRows(await db.execute(sql`
        SELECT endpoint, count(*)::int as count,
               coalesce(avg(response_time_ms), 0)::int as avg_time
        FROM api_request_logs
        WHERE created_at >= NOW() - INTERVAL '${sql.raw(period)}' ${keyCondition}
        GROUP BY endpoint ORDER BY count DESC LIMIT 10
      `));
      const totalReqs = Number(summary.total_requests) || 1;
      const perEndpoint = perEndpointRaw.map((e: any) => ({ ...e, pct: Math.round(e.count / totalReqs * 1000) / 10 }));

      const perKeyRaw = toRows(await db.execute(sql`
        SELECT k.name as key_name, count(*)::int as count
        FROM api_request_logs l JOIN api_keys k ON k.id = l.api_key_id
        WHERE l.created_at >= NOW() - INTERVAL '${sql.raw(period)}' ${keyCondition}
        GROUP BY k.name ORDER BY count DESC
      `));
      const perKey = perKeyRaw.map((k: any) => ({ ...k, pct: Math.round(k.count / totalReqs * 1000) / 10 }));

      const topErrors = toRows(await db.execute(sql`
        SELECT status_code as status, count(*)::int as count
        FROM api_request_logs
        WHERE created_at >= NOW() - INTERVAL '${sql.raw(period)}' AND status_code >= 400 ${keyCondition}
        GROUP BY status_code ORDER BY count DESC LIMIT 10
      `)).map((e: any) => ({ ...e, pct: Math.round(e.count / totalReqs * 1000) / 10 }));

      const statusDist = toRows(await db.execute(sql`
        SELECT CASE
          WHEN status_code >= 200 AND status_code < 300 THEN '2xx'
          WHEN status_code >= 400 AND status_code < 500 THEN '4xx'
          WHEN status_code >= 500 THEN '5xx'
          ELSE 'other' END as status,
          count(*)::int as count
        FROM api_request_logs
        WHERE created_at >= NOW() - INTERVAL '${sql.raw(period)}' ${keyCondition}
        GROUP BY 1 ORDER BY 1
      `)).map((s: any) => ({ ...s, pct: Math.round(s.count / totalReqs * 1000) / 10 }));

      res.json({
        period: req.query.period || "30d",
        summary,
        requests_per_day: perDayRaw,
        requests_per_endpoint: perEndpoint,
        requests_per_key: perKey,
        top_errors: topErrors,
        status_distribution: statusDist,
      });
    } catch (err) { next(err); }
  });

  app.get("/api/admin/apis/analytics/realtime", requireSuperadmin, async (_req, res, next) => {
    try {
      const lastHour = toRows(await db.execute(sql`
        SELECT count(*)::int as total FROM api_request_logs
        WHERE created_at >= NOW() - INTERVAL '1 hour'
      `));
      const lastMinute = toRows(await db.execute(sql`
        SELECT count(*)::int as total FROM api_request_logs
        WHERE created_at >= NOW() - INTERVAL '1 minute'
      `));
      const activeKeysRaw = toRows(await db.execute(sql`
        SELECT count(DISTINCT api_key_id)::int as total FROM api_request_logs
        WHERE created_at >= NOW() - INTERVAL '1 hour'
      `));
      const last10 = toRows(await db.execute(sql`
        SELECT l.endpoint, l.status_code, l.response_time_ms, l.created_at, k.name as key_name
        FROM api_request_logs l LEFT JOIN api_keys k ON k.id = l.api_key_id
        ORDER BY l.created_at DESC LIMIT 10
      `));
      res.json({
        requests_last_hour: lastHour[0]?.total || 0,
        requests_last_minute: lastMinute[0]?.total || 0,
        active_keys: activeKeysRaw[0]?.total || 0,
        last_10_requests: last10,
      });
    } catch (err) { next(err); }
  });

  app.get("/api/admin/apis/health", requireSuperadmin, async (_req, res, next) => {
    try {
      const [companiesCount] = await db.select({ total: count() }).from(empresasProspectos);
      const [activeKeyCount] = await db.select({ total: count() }).from(apiKeys).where(eq(apiKeys.isActive, true));
      const uptimeSeconds = process.uptime();
      res.json({
        api_status: "operational",
        database_status: "connected",
        total_companies_available: companiesCount.total,
        active_api_keys: activeKeyCount.total,
        uptime_hours: Math.round(uptimeSeconds / 3600 * 10) / 10,
      });
    } catch (err) { next(err); }
  });

  app.get("/api/admin/api-keys/stats/daily", requireAdmin, async (_req, res, next) => {
    try {
      const stats = await db.execute(sql`
        SELECT DATE(created_at) as date, count(*) as requests,
               count(DISTINCT api_key_id) as unique_keys,
               avg(response_time_ms)::int as avg_response_ms
        FROM api_request_logs
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at) ORDER BY DATE(created_at) DESC
      `);
      res.json(toRows(stats));
    } catch (err) { next(err); }
  });

  const excelUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

  async function getEmpresaTeam(userId: string) {
    const membership = await db.select({ teamId: teamUsers.teamId, role: teamUsers.role })
      .from(teamUsers)
      .where(and(
        eq(teamUsers.userId, userId),
        or(eq(teamUsers.role, "admin"), eq(teamUsers.role, "empresa_rh"))
      ));
    if (membership.length === 0) {
      const [account] = await db.select({ userRole: accounts.userRole })
        .from(accounts).where(eq(accounts.id, userId));
      if (account && (account.userRole === "empresa" || account.userRole === "empresa_rh")) {
        const anyMembership = await db.select({ teamId: teamUsers.teamId })
          .from(teamUsers).where(eq(teamUsers.userId, userId)).limit(1);
        if (anyMembership.length > 0) {
          const team = await db.select().from(teams).where(eq(teams.id, anyMembership[0].teamId));
          return team[0] || null;
        }
      }
      return null;
    }
    const team = await db.select().from(teams).where(eq(teams.id, membership[0].teamId));
    return team[0] || null;
  }

  app.get("/api/empresa/invitations/template", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const team = await getEmpresaTeam(userId);
      if (!team) return res.status(403).json({ message: "No tienes una organización" });

      const ExcelJS = await import("exceljs");
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Empleados");
      const templateRows = [
        ["CEDUVERSE — Carga Masiva de Empleados"],
        [`Empresa: ${team.name}`],
        ["Instrucciones: Complete una fila por empleado. Los campos marcados con * son obligatorios."],
        ["IMPORTANTE: No modifique los encabezados de las columnas."],
        [],
        ["Nombre *", "Apellido", "Email *", "Puesto", "Departamento"],
        ["Juan", "Pérez", "juan@ejemplo.com", "Analista", "Tecnología"],
      ];
      templateRows.forEach(row => ws.addRow(row));
      ws.columns = [{ width: 22 }, { width: 22 }, { width: 32 }, { width: 22 }, { width: 22 }];
      ws.mergeCells(1, 1, 1, 5);
      ws.mergeCells(2, 1, 2, 5);
      ws.mergeCells(3, 1, 3, 5);
      ws.mergeCells(4, 1, 4, 5);
      const buf = await wb.xlsx.writeBuffer();
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="plantilla-empleados-${team.id}.xlsx"`);
      res.send(Buffer.from(buf as ArrayBuffer));
    } catch (err) { next(err); }
  });

  app.post("/api/empresa/invitations/upload", requireAuth, excelUpload.single("file"), async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const team = await getEmpresaTeam(userId);
      if (!team) return res.status(403).json({ message: "No tienes una organización" });

      if (!req.file) return res.status(400).json({ message: "Archivo requerido" });

      const ExcelJS = await import("exceljs");
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(req.file.buffer);
      const ws = wb.worksheets[0];
      const rawData: any[][] = [];
      ws.eachRow({ includeEmpty: false }, (row) => {
        rawData.push((row.values as any[]).slice(1));
      });

      let headerRowIdx = rawData.findIndex(row =>
        row.some((cell: any) => typeof cell === "string" && cell.toLowerCase().includes("email"))
      );
      if (headerRowIdx === -1) return res.status(400).json({ message: "No se encontró la fila de encabezados con 'Email'" });

      const headerRow = rawData[headerRowIdx].map((h: any) => String(h || "").toLowerCase().trim());
      const emailIdx = headerRow.findIndex((h: string) => h.startsWith("email") || h === "correo");
      const nombreIdx = headerRow.findIndex((h: string) => h.startsWith("nombre") || h === "name");
      const apellidoIdx = headerRow.findIndex((h: string) => h.startsWith("apellido") || h === "last name" || h === "apellidos");
      const puestoIdx = headerRow.findIndex((h: string) => h.startsWith("puesto") || h === "position" || h === "cargo");
      const deptoIdx = headerRow.findIndex((h: string) => h.startsWith("departamento") || h === "department" || h === "área");

      if (emailIdx === -1) return res.status(400).json({ message: "La columna 'Email' es requerida" });

      const dataRows = rawData.slice(headerRowIdx + 1).filter(row => row.length > 0 && row.some((cell: any) => cell));

      const existingEmails = new Set(
        (await db.select({ email: employeeInvitations.email })
          .from(employeeInvitations)
          .where(eq(employeeInvitations.teamId, team.id)))
          .map(r => r.email.toLowerCase())
      );

      const existingUsers = new Set(
        (await db.select({ email: users.email }).from(users)).map(r => r.email.toLowerCase())
      );

      const referralCode = (await db.select({ code: referralCodes.code })
        .from(referralCodes)
        .where(eq(referralCodes.ownerId, team.partnerId || userId))
        .limit(1))[0]?.code || null;

      const results: { row: number; nombre: string; email: string; status: string; reason: string }[] = [];
      let successCount = 0;
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const email = String(row[emailIdx] || "").trim().toLowerCase();
        const nombre = String(row[nombreIdx >= 0 ? nombreIdx : 0] || "").trim();
        const apellido = apellidoIdx >= 0 ? String(row[apellidoIdx] || "").trim() : "";
        const puesto = puestoIdx >= 0 ? String(row[puestoIdx] || "").trim() : "";
        const depto = deptoIdx >= 0 ? String(row[deptoIdx] || "").trim() : "";

        if (!email || !email.includes("@")) {
          results.push({ row: i + 1, nombre, email, status: "error", reason: "Email inválido o vacío" });
          continue;
        }

        if (!nombre) {
          results.push({ row: i + 1, nombre: "", email, status: "error", reason: "Nombre vacío" });
          continue;
        }

        if (existingEmails.has(email)) {
          results.push({ row: i + 1, nombre, email, status: "error", reason: "Ya tiene invitación" });
          continue;
        }

        if (existingUsers.has(email)) {
          results.push({ row: i + 1, nombre, email, status: "error", reason: "Usuario ya registrado" });
          continue;
        }

        const token = crypto.randomBytes(24).toString("hex");
        await db.insert(employeeInvitations).values({
          teamId: team.id,
          email,
          nombre,
          apellido: apellido || null,
          puesto: puesto || null,
          departamento: depto || null,
          token,
          referralCode: referralCode || null,
          status: "pending",
        });

        existingEmails.add(email);

        const inviteUrl = `${baseUrl}/auth?ref=${referralCode || ""}&invite=${token}`;
        sendEmployeeInvitationEmail(email, nombre, team.name, inviteUrl).catch(err =>
          console.error(`[invite] Failed to send email to ${email}:`, err.message)
        );

        results.push({ row: i + 1, nombre, email, status: "ok", reason: "Invitación enviada" });
        successCount++;
      }

      res.json({ total: dataRows.length, success: successCount, errors: dataRows.length - successCount, results });
    } catch (err) { next(err); }
  });

  app.get("/api/empresa/invitations", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const team = await getEmpresaTeam(userId);
      if (!team) return res.status(403).json({ message: "No tienes una organización" });

      const invitations = await db.select().from(employeeInvitations)
        .where(eq(employeeInvitations.teamId, team.id))
        .orderBy(desc(employeeInvitations.createdAt));

      res.json(invitations);
    } catch (err) { next(err); }
  });

  app.post("/api/empresa/invitations/:id/resend", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const team = await getEmpresaTeam(userId);
      if (!team) return res.status(403).json({ message: "No tienes una organización" });

      const [invitation] = await db.select().from(employeeInvitations)
        .where(and(eq(employeeInvitations.id, req.params.id), eq(employeeInvitations.teamId, team.id)));

      if (!invitation) return res.status(404).json({ message: "Invitación no encontrada" });
      if (invitation.status !== "pending") return res.status(400).json({ message: "Solo se pueden reenviar invitaciones pendientes" });

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const inviteUrl = `${baseUrl}/auth?ref=${invitation.referralCode || ""}&invite=${invitation.token}`;
      await sendEmployeeInvitationEmail(invitation.email, invitation.nombre, team.name, inviteUrl);

      res.json({ message: "Invitación reenviada" });
    } catch (err) { next(err); }
  });

  app.get("/api/empresa/sam/template", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const team = await getEmpresaTeam(userId);
      if (!team) return res.status(403).json({ message: "No tienes una organización" });

      const members = await db.select({
        userId: teamUsers.userId,
        role: teamUsers.role,
      }).from(teamUsers).where(eq(teamUsers.teamId, team.id));

      const memberData: { nombre: string; email: string; progreso: number; cursosCompletados: number; dc3: string }[] = [];

      for (const m of members) {
        const [profile] = await db.select().from(profiles).where(eq(profiles.id, m.userId));
        const [user] = await db.select().from(users).where(eq(users.id, m.userId));
        const userCourses = await db.select().from(courseUsers).where(eq(courseUsers.userId, m.userId));
        const completedCount = userCourses.filter(c => c.completed >= 100).length;
        const avgProgress = userCourses.length > 0 ? Math.round(userCourses.reduce((s, c) => s + c.completed, 0) / userCourses.length) : 0;

        const dc3Certs = await db.select().from(achievementUsers)
          .where(and(eq(achievementUsers.userId, m.userId), eq(achievementUsers.certType, "dc3"), eq(achievementUsers.status, "active")));

        memberData.push({
          nombre: profile?.fullName || user?.email?.split("@")[0] || "Sin nombre",
          email: user?.email || "",
          progreso: avgProgress,
          cursosCompletados: completedCount,
          dc3: dc3Certs.length > 0 ? "Sí" : "No",
        });
      }

      const now = new Date();
      const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

      const ExcelJS = await import("exceljs");
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("SAM");
      const samRows: any[][] = [
        ["CEDUVERSE — Solicitud SAM Mensual"],
        [`Empresa: ${team.name}`],
        [`Periodo: ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`],
        [`Generado: ${now.toLocaleDateString("es-MX")} | Total empleados: ${memberData.length}`],
        ["IMPORTANTE: No modifique los encabezados. Revise y firme antes de subir."],
        [],
        ["Nombre", "Email", "Progreso (%)", "Cursos Completados", "DC-3 Obtenido"],
        ...memberData.map(m => [m.nombre, m.email, m.progreso, m.cursosCompletados, m.dc3]),
      ];
      samRows.forEach(row => ws.addRow(row));
      ws.columns = [{ width: 28 }, { width: 32 }, { width: 15 }, { width: 22 }, { width: 16 }];
      ws.mergeCells(1, 1, 1, 5);
      ws.mergeCells(2, 1, 2, 5);
      ws.mergeCells(3, 1, 3, 5);
      ws.mergeCells(4, 1, 4, 5);
      ws.mergeCells(5, 1, 5, 5);
      const buf = await wb.xlsx.writeBuffer();
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="SAM-${team.id}-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}.xlsx"`);
      res.send(Buffer.from(buf as ArrayBuffer));
    } catch (err) { next(err); }
  });

  app.post("/api/empresa/sam/upload", requireAuth, excelUpload.single("file"), async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const team = await getEmpresaTeam(userId);
      if (!team) return res.status(403).json({ message: "No tienes una organización" });

      if (!req.file) return res.status(400).json({ message: "Archivo requerido" });

      const ExcelJS = await import("exceljs");
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(req.file.buffer);
      const ws = wb.worksheets[0];
      const rawData: any[][] = [];
      ws.eachRow({ includeEmpty: false }, (row) => {
        rawData.push((row.values as any[]).slice(1));
      });

      let headerIdx = rawData.findIndex(row =>
        row.some((cell: any) => typeof cell === "string" && (cell.toLowerCase().includes("email") || cell.toLowerCase().includes("nombre")))
      );

      const dataRows = headerIdx >= 0 ? rawData.slice(headerIdx + 1).filter(r => r.length > 0 && r.some((c: any) => c)) : [];
      const dataCount = dataRows.length;

      const teamMembers = await db.select({ email: users.email })
        .from(teamUsers)
        .innerJoin(users, eq(teamUsers.userId, users.id))
        .where(eq(teamUsers.teamId, team.id));
      const teamEmails = new Set(teamMembers.map(m => m.email.toLowerCase()));

      if (headerIdx < 0) {
        return res.status(400).json({ message: "Archivo inválido: no se encontró la fila de encabezados (debe incluir columnas como 'Nombre', 'Email')" });
      }

      const headerRow = rawData[headerIdx];
      const emailColIdx = headerRow.findIndex((cell: any) => typeof cell === "string" && cell.toLowerCase().includes("email"));

      if (emailColIdx < 0) {
        return res.status(400).json({ message: "Archivo inválido: no se encontró la columna 'Email'. Use la plantilla proporcionada." });
      }

      const nonTeamEmails: string[] = [];
      for (const row of dataRows) {
        const email = row[emailColIdx]?.toString()?.trim()?.toLowerCase();
        if (email && !teamEmails.has(email)) {
          nonTeamEmails.push(email);
        }
      }

      if (nonTeamEmails.length > 0) {
        return res.status(400).json({
          message: `Archivo rechazado: ${nonTeamEmails.length} correo(s) no pertenecen al equipo`,
          invalidEmails: nonTeamEmails,
        });
      }

      const now = new Date();
      const periodYear = now.getFullYear();
      const periodMonth = now.getMonth() + 1;

      const originalName = req.file.originalname || `sam_${periodYear}_${periodMonth}.xlsx`;
      const fileDataUri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;name=${encodeURIComponent(originalName)};base64,${req.file.buffer.toString("base64")}`;

      const [existingReq] = await db.select().from(samRequests)
        .where(and(
          eq(samRequests.teamId, team.id),
          eq(samRequests.periodYear, periodYear),
          eq(samRequests.periodMonth, periodMonth),
        ));

      if (existingReq) {
        await db.update(samRequests)
          .set({
            employeeCount: dataCount,
            fileUrl: fileDataUri,
            status: "pending",
            submittedBy: userId,
            updatedAt: now,
          })
          .where(eq(samRequests.id, existingReq.id));
      } else {
        await db.insert(samRequests).values({
          teamId: team.id,
          periodYear,
          periodMonth,
          employeeCount: dataCount,
          fileUrl: fileDataUri,
          status: "pending",
          submittedBy: userId,
        });
      }

      const [existingContrib] = await db.select().from(monthlyContributions)
        .where(and(
          eq(monthlyContributions.teamId, team.id),
          eq(monthlyContributions.periodYear, periodYear),
          eq(monthlyContributions.periodMonth, periodMonth),
        ));

      if (existingContrib) {
        await db.update(monthlyContributions)
          .set({ activeCollaborators: dataCount, status: "pending" })
          .where(eq(monthlyContributions.id, existingContrib.id));
      } else {
        const UMA_VALUE_2026 = "113.14";
        const { plan, umas, feePercent } = determinePlan(dataCount);
        const umaVal = parseFloat(UMA_VALUE_2026);
        const gross = dataCount * umas * umaVal;
        const fee = gross * (feePercent / 100);
        const net = gross - fee;
        const dueDate = new Date(periodYear, periodMonth - 1, 15);

        await db.insert(monthlyContributions).values({
          teamId: team.id,
          periodYear,
          periodMonth,
          planType: plan,
          umasPerCol: umas,
          umaValue: UMA_VALUE_2026,
          activeCollaborators: dataCount,
          grossAmount: gross.toFixed(2),
          feePercentage: feePercent.toFixed(2),
          feeAmount: fee.toFixed(2),
          netToCooperative: net.toFixed(2),
          status: "pending",
          paymentStatus: "unpaid",
          cfdiStatus: "pending",
          dueDate,
        });
      }

      const adminUsers = await db.select({ email: users.email })
        .from(users)
        .innerJoin(accounts, eq(users.id, accounts.id))
        .where(eq(accounts.userRole, "admin"));

      const MONTH_NAMES_FULL = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      for (const admin of adminUsers) {
        sendSamPartnerNotificationEmail(
          admin.email,
          team.name,
          MONTH_NAMES_FULL[periodMonth - 1],
          periodYear,
          "0",
          0,
        ).catch(err => console.error("[sam-upload] Notification error:", err.message));
      }

      res.json({
        message: "Solicitud SAM registrada",
        employeeCount: dataCount,
        periodYear,
        periodMonth,
      });
    } catch (err) { next(err); }
  });

  app.get("/api/empresa/sam/status", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const team = await getEmpresaTeam(userId);
      if (!team) return res.status(403).json({ message: "No tienes una organización" });

      const now = new Date();
      const [current] = await db.select().from(samRequests)
        .where(and(
          eq(samRequests.teamId, team.id),
          eq(samRequests.periodYear, now.getFullYear()),
          eq(samRequests.periodMonth, now.getMonth() + 1),
        ));

      const [contribution] = await db.select({
        paymentStatus: monthlyContributions.paymentStatus,
        status: monthlyContributions.status,
      }).from(monthlyContributions)
        .where(and(
          eq(monthlyContributions.teamId, team.id),
          eq(monthlyContributions.periodYear, now.getFullYear()),
          eq(monthlyContributions.periodMonth, now.getMonth() + 1),
        ));

      if (!current && !contribution) {
        return res.json(null);
      }

      const displayStatus = contribution?.paymentStatus === "paid"
        ? "pagada"
        : current?.status || "sin_enviar";

      res.json({
        ...(current || {}),
        displayStatus,
        contributionStatus: contribution?.status || null,
        paymentStatus: contribution?.paymentStatus || null,
      });
    } catch (err) { next(err); }
  });

  app.get("/api/invitations/validate/:token", async (req, res, next) => {
    try {
      const [invitation] = await db.select().from(employeeInvitations)
        .where(eq(employeeInvitations.token, req.params.token));

      if (!invitation) return res.status(404).json({ message: "Invitación no encontrada" });
      if (invitation.status !== "pending") return res.status(400).json({ message: "Invitación ya utilizada o expirada" });

      const [team] = await db.select().from(teams).where(eq(teams.id, invitation.teamId));

      res.json({
        nombre: invitation.nombre,
        apellido: invitation.apellido || "",
        email: invitation.email,
        teamName: team?.name || "",
        referralCode: invitation.referralCode || "",
      });
    } catch (err) { next(err); }
  });

  app.post("/api/invitations/accept/:token", requireAuth, async (req, res, next) => {
    try {
      const userId = req.supabaseUserId!;
      const [invitation] = await db.select().from(employeeInvitations)
        .where(eq(employeeInvitations.token, req.params.token));

      if (!invitation) return res.status(404).json({ message: "Invitación no encontrada" });
      if (invitation.status !== "pending") return res.status(400).json({ message: "Invitación ya utilizada" });

      const [authUser] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId));
      if (!authUser || authUser.email.toLowerCase() !== invitation.email.toLowerCase()) {
        return res.status(403).json({ message: "Esta invitación no corresponde a tu correo electrónico" });
      }

      await db.update(employeeInvitations)
        .set({ status: "accepted" })
        .where(eq(employeeInvitations.id, invitation.id));

      const existingMembership = await db.select().from(teamUsers)
        .where(and(eq(teamUsers.teamId, invitation.teamId), eq(teamUsers.userId, userId)));

      if (existingMembership.length === 0) {
        await db.insert(teamUsers).values({
          teamId: invitation.teamId,
          userId,
          role: "member",
        }).onConflictDoNothing();
      }

      if (invitation.referralCode) {
        await db.update(accounts)
          .set({ referredBy: invitation.referralCode })
          .where(eq(accounts.id, userId));
      }

      res.json({ message: "Invitación aceptada", teamId: invitation.teamId });
    } catch (err) { next(err); }
  });

  return httpServer;
}

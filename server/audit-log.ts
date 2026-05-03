import type { Request } from "express";
import { db } from "./db";
import { auditLogs } from "@shared/schema";

interface AuditOptions {
  req: Request;
  action: string;
  targetType?: string;
  targetId?: string | number | null;
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
}

// Fire-and-forget audit logger. NEVER throws — logging failures must not break
// the actual operation being audited. Any errors are logged to stderr only.
export async function logAudit(opts: AuditOptions): Promise<void> {
  try {
    const ua = opts.req.headers["user-agent"];
    await db.insert(auditLogs).values({
      userId: opts.req.supabaseUserId ?? null,
      action: opts.action,
      targetType: opts.targetType ?? null,
      targetId: opts.targetId != null ? String(opts.targetId) : null,
      before: (opts.before ?? null) as any,
      after: (opts.after ?? null) as any,
      metadata: (opts.metadata ?? null) as any,
      ipAddress: opts.req.ip || opts.req.socket?.remoteAddress || null,
      userAgent: typeof ua === "string" ? ua.slice(0, 500) : null,
    });
  } catch (err: any) {
    console.error(`[audit] failed to log ${opts.action}:`, err?.message || err);
  }
}

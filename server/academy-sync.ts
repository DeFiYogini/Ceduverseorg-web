import { db } from "./db";
import { academyCoursesCache, academyCurriculumCache } from "@shared/schema";
import { academyClient } from "./academy";
import { eq, sql } from "drizzle-orm";

const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000;
const BATCH_SIZE = 100;

let syncInProgress = false;
let lastSyncAt: Date | null = null;
let lastSyncCourseCount = 0;
let syncTimer: ReturnType<typeof setInterval> | null = null;

export function getSyncStatus() {
  return {
    inProgress: syncInProgress,
    lastSyncAt: lastSyncAt?.toISOString() || null,
    lastSyncCourseCount,
    intervalHours: SYNC_INTERVAL_MS / (60 * 60 * 1000),
  };
}

export type SyncResult = {
  status: "completed" | "skipped_in_progress" | "skipped_not_configured" | "failed";
  synced: number;
  errors: number;
  removed: number;
  message?: string;
};

let authFailed = false;

export async function syncAcademyCourses(): Promise<SyncResult> {
  if (syncInProgress) {
    console.log("[academy-sync] Sync already in progress, skipping");
    return { status: "skipped_in_progress", synced: 0, errors: 0, removed: 0 };
  }

  if (!academyClient.isConfigured()) {
    console.log("[academy-sync] Academy not configured, using cached data from database");
    return { status: "skipped_not_configured", synced: 0, errors: 0, removed: 0 };
  }

  if (authFailed) {
    console.log("[academy-sync] Skipping sync — previous auth failed, using cached data from database");
    return { status: "skipped_not_configured", synced: 0, errors: 0, removed: 0 };
  }

  syncInProgress = true;
  let totalSynced = 0;
  let totalErrors = 0;
  let totalRemoved = 0;
  const syncedAcademyIds = new Set<number>();

  try {
    console.log("[academy-sync] Starting full course sync...");

    const firstPage = await academyClient.getAllCourses({ perPage: 1, status: "publish" });
    const totalCourses = firstPage.total;
    const totalPages = Math.ceil(totalCourses / BATCH_SIZE);

    console.log(`[academy-sync] Found ${totalCourses} courses, fetching in ${totalPages} pages of ${BATCH_SIZE}`);

    for (let page = 1; page <= totalPages; page++) {
      try {
        const result = await academyClient.getAllCourses({ perPage: BATCH_SIZE, page, status: "publish" });

        for (const course of result.posts) {
          try {
            const courseId = (course as any).ID || (course as any).id;
            const title = (course as any).title || (course as any).post_title || "";
            const excerpt = (course as any).excerpt || (course as any).post_excerpt || "";
            const content = (course as any).content || (course as any).post_content || "";
            const status = (course as any).status || (course as any).post_status || "publish";
            const url = (course as any).url || (course as any).guid || "";
            const dateStr = (course as any).date || (course as any).post_date;
            const modifiedStr = (course as any).modified;
            const authorId = String((course as any).author || (course as any).post_author || "");

            syncedAcademyIds.add(courseId);

            await db
              .insert(academyCoursesCache)
              .values({
                academyId: courseId,
                title,
                excerpt,
                content,
                status,
                url,
                date: dateStr ? new Date(dateStr) : null,
                modified: modifiedStr ? new Date(modifiedStr) : null,
                authorId,
                syncedAt: new Date(),
              })
              .onConflictDoUpdate({
                target: academyCoursesCache.academyId,
                set: {
                  title,
                  excerpt,
                  content,
                  status,
                  url,
                  date: dateStr ? new Date(dateStr) : null,
                  modified: modifiedStr ? new Date(modifiedStr) : null,
                  authorId,
                  syncedAt: new Date(),
                },
              });

            totalSynced++;
          } catch (err: any) {
            totalErrors++;
            console.error(`[academy-sync] Error syncing course ${(course as any).ID}: ${err.message}`);
          }
        }

        console.log(`[academy-sync] Page ${page}/${totalPages} done (${totalSynced} synced so far)`);
      } catch (err: any) {
        totalErrors++;
        console.error(`[academy-sync] Error fetching page ${page}: ${err.message}`);
      }
    }

    if (syncedAcademyIds.size > 0) {
      const idsArray = Array.from(syncedAcademyIds);
      const removeResult = await db.execute(
        sql`UPDATE academy_courses_cache SET status = 'unpublished' WHERE academy_id NOT IN (${sql.join(idsArray.map(id => sql`${id}`), sql`, `)}) AND status = 'publish'`
      );
      totalRemoved = Number((removeResult as any).rowCount || 0);
      if (totalRemoved > 0) {
        console.log(`[academy-sync] Marked ${totalRemoved} stale courses as unpublished`);
      }
    }

    lastSyncAt = new Date();
    lastSyncCourseCount = totalSynced;
    console.log(`[academy-sync] Sync complete: ${totalSynced} synced, ${totalRemoved} removed, ${totalErrors} errors`);
    return { status: "completed", synced: totalSynced, errors: totalErrors, removed: totalRemoved };
  } catch (err: any) {
    if (err.message?.includes("Unauthorized") || err.message?.includes("401")) {
      authFailed = true;
      console.warn(`[academy-sync] Auth failed — disabling sync, using ${await getCachedCourseCount()} cached courses from database`);
    } else {
      console.warn(`[academy-sync] Sync error (will retry next interval): ${err.message}`);
    }
    return { status: "failed", synced: totalSynced, errors: totalErrors, removed: 0, message: err.message };
  } finally {
    syncInProgress = false;
  }
}

async function getCachedCourseCount(): Promise<number> {
  try {
    const result = await db.execute(sql`SELECT count(*) as total FROM academy_courses_cache WHERE status = 'publish'`);
    return Number((result as any).rows?.[0]?.total || (result as any)[0]?.total || 0);
  } catch {
    return 0;
  }
}

export async function syncCourseCurriculum(academyId: number): Promise<boolean> {
  if (!academyClient.isConfigured() || authFailed) return false;

  try {
    const curriculum = await academyClient.getCourseCurriculum(academyId);
    if (!curriculum) return false;

    await db
      .insert(academyCurriculumCache)
      .values({
        academyId,
        curriculumJson: curriculum,
        totalItems: (curriculum as any).total_items || (curriculum as any).curriculum?.length || 0,
        syncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: academyCurriculumCache.academyId,
        set: {
          curriculumJson: curriculum,
          totalItems: (curriculum as any).total_items || (curriculum as any).curriculum?.length || 0,
          syncedAt: new Date(),
        },
      });

    return true;
  } catch (err: any) {
    console.error(`[academy-sync] Error syncing curriculum for ${academyId}: ${err.message}`);
    return false;
  }
}

export async function getCachedCourses(options: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ posts: any[]; total: number; pages: number; current_page: number; configured: boolean }> {
  const { search, page = 1, limit = 100 } = options;
  const offset = (page - 1) * limit;

  let query = db.select().from(academyCoursesCache).where(eq(academyCoursesCache.status, "publish"));

  const countResult = search
    ? await db.execute(sql`SELECT count(*) as total FROM academy_courses_cache WHERE status = 'publish' AND (title ILIKE ${'%' + search + '%'} OR excerpt ILIKE ${'%' + search + '%'})`)
    : await db.execute(sql`SELECT count(*) as total FROM academy_courses_cache WHERE status = 'publish'`);

  const total = Number((countResult as any).rows?.[0]?.total || (countResult as any)[0]?.total || 0);

  const rows = search
    ? await db.execute(sql`SELECT * FROM academy_courses_cache WHERE status = 'publish' AND (title ILIKE ${'%' + search + '%'} OR excerpt ILIKE ${'%' + search + '%'}) ORDER BY date DESC NULLS LAST LIMIT ${limit} OFFSET ${offset}`)
    : await db.execute(sql`SELECT * FROM academy_courses_cache WHERE status = 'publish' ORDER BY date DESC NULLS LAST LIMIT ${limit} OFFSET ${offset}`);

  const dataRows = (rows as any).rows || rows;

  const posts = (Array.isArray(dataRows) ? dataRows : []).map((row: any) => ({
    ID: row.academy_id,
    title: row.title,
    post_title: row.title,
    excerpt: row.excerpt || "",
    post_excerpt: row.excerpt || "",
    content: row.content || "",
    post_content: row.content || "",
    status: row.status,
    post_status: row.status,
    date: row.date,
    post_date: row.date,
    url: row.url || "",
    guid: row.url || "",
    author: row.author_id || "",
    post_author: row.author_id || "",
  }));

  return {
    posts,
    total,
    pages: Math.ceil(total / limit),
    current_page: page,
    configured: true,
  };
}

export async function getCachedCourse(academyId: number): Promise<any | null> {
  const rows = await db
    .select()
    .from(academyCoursesCache)
    .where(eq(academyCoursesCache.academyId, academyId))
    .limit(1);

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    ID: row.academyId,
    title: row.title,
    post_title: row.title,
    excerpt: row.excerpt || "",
    post_excerpt: row.excerpt || "",
    content: row.content || "",
    post_content: row.content || "",
    status: row.status,
    post_status: row.status,
    date: row.date,
    post_date: row.date,
    url: row.url || "",
    guid: row.url || "",
    author: row.authorId || "",
    post_author: row.authorId || "",
  };
}

export async function getCachedCurriculum(academyId: number): Promise<any | null> {
  const rows = await db
    .select()
    .from(academyCurriculumCache)
    .where(eq(academyCurriculumCache.academyId, academyId))
    .limit(1);

  if (rows.length === 0) return null;
  return rows[0].curriculumJson;
}

export function startPeriodicSync() {
  if (!academyClient.isConfigured()) {
    getCachedCourseCount().then(count => {
      console.log(`[academy-sync] ACADEMY_SECRET not set — using ${count} cached courses from database`);
    }).catch(() => {
      console.log("[academy-sync] ACADEMY_SECRET not set — cache-only mode");
    });
    return;
  }

  if (academyClient.isTokenExpired()) {
    authFailed = true;
    getCachedCourseCount().then(count => {
      console.warn(`[academy-sync] ACADEMY_SECRET JWT expired — cache-only mode, ${count} cached courses available`);
    }).catch(() => {
      console.warn("[academy-sync] ACADEMY_SECRET JWT expired — cache-only mode");
    });
    return;
  }

  getCachedCourseCount().then(count => {
    console.log(`[academy-sync] Live sync enabled — ${count} cached courses available, initial sync in 30s...`);
  }).catch(() => {
    console.log("[academy-sync] Live sync enabled — initial sync in 30s...");
  });

  setTimeout(() => {
    syncAcademyCourses().then(result => {
      console.log(`[academy-sync] Initial sync: ${result.status} (${result.synced} synced, ${result.errors} errors, ${result.removed} removed)`);
    }).catch(err => {
      console.warn(`[academy-sync] Initial sync failed (will retry next interval): ${err.message}`);
    });
  }, 30000);

  syncTimer = setInterval(() => {
    syncAcademyCourses().catch(err => {
      console.warn(`[academy-sync] Periodic sync failed (will retry next interval): ${err.message}`);
    });
  }, SYNC_INTERVAL_MS);
}

export function stopPeriodicSync() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}

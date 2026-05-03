import { storage } from "../storage";
import { db } from "../db";
import { profiles, users, instructorProfiles } from "@shared/schema";
import { eq } from "drizzle-orm";

export function generateSlug(fullName: string): string {
  return fullName
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 50);
}

export async function getUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 2;
  while (!(await storage.isSlugAvailable(slug, excludeId))) {
    slug = `${baseSlug}${counter}`;
    counter++;
  }
  return slug;
}

export function getInitialsFromName(name: string): string {
  return name
    .replace(/^(Dr\.|Ing\.|Lic\.|Mtro\.|Mtra\.|Psic\.)\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export async function createOrUpdateContactCard(userId: string, overrides?: Partial<{ title: string; avatarUrl: string }>) {
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

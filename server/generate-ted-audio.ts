import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { yuridiaModules } from "./data/yuridia-courses";
import { MEDINA_MODULES_DATA } from "./seed-medina-data";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AUDIO_DIR = path.join(process.cwd(), "audio-cache");
const CHUNKS_DIR = path.join(AUDIO_DIR, "chunks");

if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
if (!fs.existsSync(CHUNKS_DIR)) fs.mkdirSync(CHUNKS_DIR, { recursive: true });

function stripHtml(html: string): string {
  return html
    .replace(/<h[1-6][^>]*>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<p[^>]*>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/li>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<ol[^>]*>/gi, "\n")
    .replace(/<\/ol>/gi, "\n")
    .replace(/<ul[^>]*>/gi, "\n")
    .replace(/<\/ul>/gi, "\n")
    .replace(/<strong>/gi, "")
    .replace(/<\/strong>/gi, "")
    .replace(/<em>/gi, "")
    .replace(/<\/em>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitTextIntoChunks(text: string, maxChars: number): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).length > maxChars) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current += (current ? " " : "") + sentence;
    }
  }
  if (current) chunks.push(current.trim());

  return chunks;
}

interface CourseEntry {
  slug: string;
  contentHtml: string;
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
  audioFilename: string;
}

function buildCourseList(): CourseEntry[] {
  const entries: CourseEntry[] = [];

  for (const [slug, modules] of Object.entries(yuridiaModules)) {
    if (modules.length > 0) {
      const mod = modules[0];
      entries.push({
        slug,
        contentHtml: mod.contentHtml,
        voice: "nova",
        audioFilename: mod.audioUrl || `${slug}_ted_talk.mp3`,
      });
    }
  }

  for (const [slug, modules] of Object.entries(MEDINA_MODULES_DATA)) {
    if (modules.length > 0) {
      const mod = modules[0];
      const rawUrl = mod.audioUrl || `${slug}_ted_talk.mp3`;
      const filename = rawUrl.replace(/^audio-cache\//, "");
      entries.push({
        slug,
        contentHtml: mod.contentHtml,
        voice: "onyx",
        audioFilename: filename,
      });
    }
  }

  return entries;
}

async function generateChunkAudio(
  text: string,
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"
): Promise<Buffer> {
  const response = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice,
    input: text,
    response_format: "mp3",
    speed: 1.0,
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function chunkPath(slug: string, i: number): string {
  return path.join(CHUNKS_DIR, `${slug}_chunk_${i}.mp3`);
}

async function generateTedAudio(entry: CourseEntry): Promise<void> {
  const filepath = path.join(AUDIO_DIR, entry.audioFilename);

  if (fs.existsSync(filepath)) {
    const stats = fs.statSync(filepath);
    if (stats.size > 10000) {
      console.log(`[ted-audio] ${entry.audioFilename} already exists (${(stats.size / 1024 / 1024).toFixed(1)}MB), skipping`);
      return;
    }
  }

  const plainText = stripHtml(entry.contentHtml);
  const chunks = splitTextIntoChunks(plainText, 4000);

  console.log(
    `[ted-audio] Generating ${entry.audioFilename} (${plainText.length} chars, ${chunks.length} chunks, voice: ${entry.voice})`
  );

  for (let i = 0; i < chunks.length; i++) {
    const cp = chunkPath(entry.slug, i);
    if (fs.existsSync(cp)) {
      console.log(
        `[ted-audio]   Chunk ${i + 1}/${chunks.length} already cached`
      );
      continue;
    }

    console.log(
      `[ted-audio]   Chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`
    );

    let retries = 3;
    while (retries > 0) {
      try {
        const buffer = await generateChunkAudio(chunks[i], entry.voice);
        fs.writeFileSync(cp, buffer);
        break;
      } catch (error: unknown) {
        retries--;
        const msg = error instanceof Error ? error.message : String(error);
        if (retries > 0) {
          console.log(`[ted-audio]   Retry (${retries} left): ${msg}`);
          await new Promise((r) => setTimeout(r, 5000));
        } else {
          throw error;
        }
      }
    }
  }

  const listFile = path.join(CHUNKS_DIR, `${entry.slug}_list.txt`);
  const listContent = Array.from({ length: chunks.length }, (_, i) =>
    `file '${chunkPath(entry.slug, i)}'`
  ).join("\n");
  fs.writeFileSync(listFile, listContent);

  console.log(`[ted-audio] Concatenating ${chunks.length} MP3 chunks via ffmpeg...`);
  execFileSync("ffmpeg", [
    "-y", "-f", "concat", "-safe", "0",
    "-i", listFile,
    "-c", "copy",
    filepath,
  ], { stdio: "pipe" });

  fs.unlinkSync(listFile);
  for (let i = 0; i < chunks.length; i++) {
    fs.unlinkSync(chunkPath(entry.slug, i));
  }

  const finalSize = fs.statSync(filepath).size;
  console.log(
    `[ted-audio] Generated ${entry.audioFilename} (${(finalSize / 1024).toFixed(0)}KB)`
  );
}

async function main() {
  const allEntries = buildCourseList();
  const allSlugs = allEntries.map((e) => e.slug);
  const targetSlug = process.argv[2];

  if (targetSlug) {
    const entry = allEntries.find((e) => e.slug === targetSlug);
    if (!entry) {
      console.error(`[ted-audio] Unknown slug: ${targetSlug}`);
      console.log(`[ted-audio] Available: ${allSlugs.join(", ")}`);
      process.exit(1);
    }
    await generateTedAudio(entry);
  } else {
    console.log(
      `[ted-audio] Generating STPS session audio for all ${allEntries.length} courses`
    );
    let completed = 0;
    let failed = 0;

    for (const entry of allEntries) {
      try {
        await generateTedAudio(entry);
        completed++;
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`[ted-audio] Error generating ${entry.slug}:`, msg);
        failed++;
      }
    }
    console.log(`[ted-audio] Done: ${completed} succeeded, ${failed} failed out of ${allEntries.length} total`);
  }
}

main().catch((err) => {
  console.error("[ted-audio] Fatal error:", err);
  process.exit(1);
});

import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { storage } from "./storage";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const AUDIO_DIR = path.join(process.cwd(), "audio-cache");

if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

export function getAudioDir() {
  return AUDIO_DIR;
}

export async function generateAudioAsync(
  generatedContentId: string,
  classScript: string,
  courseSlug: string,
  moduleIndex: number,
  userId: string
): Promise<void> {
  try {
    console.log(`[audio] Starting generation for ${courseSlug}/m${moduleIndex} (user ${userId.slice(0, 8)})`);

    await storage.updateGeneratedContent(generatedContentId, {
      generationStatus: "generating_audio",
    } as any);

    const cleanScript = classScript
      .replace(/\[INTRO\]/g, "")
      .replace(/\[CONCEPTO:[^\]]*\]/g, "")
      .replace(/\[EJEMPLO\]/g, "")
      .replace(/\[CLAVE\]/g, "")
      .replace(/\[INTERACCION\]/g, "")
      .replace(/\[CIERRE\]/g, "")
      .trim();

    const filename = `${courseSlug}_m${moduleIndex}_${userId.slice(0, 8)}.mp3`;
    const filepath = path.join(AUDIO_DIR, filename);

    const chunks = splitTextIntoChunks(cleanScript, 4000);
    const audioBuffers: Buffer[] = [];

    console.log(`[audio] Processing ${chunks.length} chunk(s) for TTS`);

    for (let i = 0; i < chunks.length; i++) {
      console.log(`[audio] Generating chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`);
      const response = await openai.audio.speech.create({
        model: "tts-1-hd",
        voice: "onyx",
        input: chunks[i],
        speed: 1.0,
        response_format: "mp3",
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      audioBuffers.push(buffer);
    }

    const finalBuffer = Buffer.concat(audioBuffers);
    fs.writeFileSync(filepath, finalBuffer);

    const durationSeconds = Math.round(finalBuffer.length / 16000);

    await storage.updateGeneratedContent(generatedContentId, {
      audioUrl: filename,
      audioDurationSeconds: durationSeconds,
      audioGeneratedAt: new Date(),
      generationStatus: "complete",
    } as any);

    console.log(`[audio] Generated ${filename} (${durationSeconds}s, ${(finalBuffer.length / 1024).toFixed(0)}KB)`);
  } catch (error: any) {
    console.error("[audio] Generation error:", error?.message || error);
    await storage.updateGeneratedContent(generatedContentId, {
      generationStatus: "partial",
    } as any);
  }
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

import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db";
import { courseModules } from "@shared/schema";
import { eq } from "drizzle-orm";

const anthropic = new Anthropic();

export class TutorAIService {
  get isConfigured(): boolean {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  async getCourseContext(courseId: string): Promise<string> {
    const modules = await db.select().from(courseModules).where(eq(courseModules.courseId, courseId));

    if (modules.length === 0) return "Curso de capacitación profesional en Ceduverse.";

    const moduleTexts = modules
      .sort((a, b) => a.order - b.order)
      .map((m) => {
        const plainContent = m.contentHtml
          ? m.contentHtml.replace(/<[^>]*>/g, "").substring(0, 500)
          : "";
        return `Módulo ${m.order}: ${m.title}\n${plainContent}`;
      })
      .join("\n\n");

    return moduleTexts.substring(0, 4000);
  }

  async generateResponse(
    question: string,
    courseTitle: string,
    courseContext: string,
    messageHistory: { role: string; content: string }[],
    onChunk?: (textDelta: string) => void,
  ): Promise<string> {
    const systemPrompt = `Eres un instructor experto en capacitación laboral STPS de México. Tu nombre es el instructor del curso "${courseTitle}" en la plataforma Ceduverse.

Reglas estrictas:
- Responde SIEMPRE en español mexicano, tono conversacional y profesional
- Máximo 3-4 oraciones (tu respuesta será hablada por un avatar, debe ser concisa)
- NO uses markdown, listas, viñetas ni formato especial — solo texto plano hablado
- Da ejemplos prácticos del contexto laboral mexicano
- Si preguntan algo fuera del tema del curso, redirige amablemente al tema
- Usa expresiones naturales mexicanas pero profesionales
- Nunca digas que eres una IA o un clon digital

Contexto del curso:
${courseContext}`;

    const recentHistory = messageHistory.slice(-10);
    const messages = recentHistory.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
    messages.push({ role: "user", content: question });

    const stream = anthropic.messages.stream({
      // Haiku 4.5 for the live tutor: concise spoken Q&A is a bounded, low-reasoning
      // task — far cheaper per token than Sonnet with no meaningful quality loss here.
      // (effort/output_config is an Opus/Sonnet-4.5+ control, omitted for Haiku.)
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      thinking: { type: "disabled" },
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages,
    });

    if (onChunk) {
      stream.on("text", (textDelta) => onChunk(textDelta));
    }

    const finalMessage = await stream.finalMessage();
    const textBlock = finalMessage.content.find((b) => b.type === "text");
    return textBlock?.text || "Disculpa, no pude procesar tu pregunta. ¿Podrías reformularla?";
  }
}

export const tutorAIService = new TutorAIService();

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
    messageHistory: { role: string; content: string }[]
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

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: systemPrompt,
      messages,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock?.text || "Disculpa, no pude procesar tu pregunta. ¿Podrías reformularla?";
  }
}

export const tutorAIService = new TutorAIService();

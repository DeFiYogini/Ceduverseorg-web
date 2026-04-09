# PROMPT: Rediseño completo del sistema Tutor IA — Ceduverse

## Contexto del proyecto

Ceduverse es una plataforma EdTech para Latinoamérica (español LATAM). El producto principal es **Tutor IA**: un sistema de cursos personalizados por inteligencia artificial que se adaptan al perfil profesional del estudiante (puesto, industria, tamaño de empresa, nivel de experiencia).

**Stack técnico:**
- Frontend: React + Vite + TailwindCSS + shadcn/ui + wouter (routing) + TanStack Query v5
- Backend: Express.js + Drizzle ORM + PostgreSQL
- AI: Anthropic Claude (`claude-sonnet-4-20250514`) via `@anthropic-ai/sdk`
- Auth: JWT + OTP personalizado (no Supabase)
- Design system: Cream (#faf8f4), DM Serif Display headings, Plus Jakarta Sans body, cedu-blue #1b5adf, cedu-orange #f28023, cedu-violet #7c3aed, cedu-green #00b87a

---

## Estado actual del sistema completo

### 1. ESQUEMA DE BASE DE DATOS (shared/schema.ts)

```typescript
// Cursos del catálogo (49 cursos: 10 yuridia, 16 medina, 23 procadist)
export const studioCourses = pgTable("studio_courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // "Desarrollo Humano", "Seguridad Industrial", "Normatividad", "Formación Empresarial", "Productividad", "IA y Tecnología"
  subcategory: text("subcategory"),
  durationMinutes: integer("duration_minutes").default(60),
  level: text("level").default("basico"), // basico | intermedio | avanzado
  tags: text("tags").array().default([]),
  dc3Available: boolean("dc3_available").default(false),
  icon: text("icon"), // emoji
  color: text("color"), // hex
  source: text("source").default("studio"), // "yuridia" | "medina" | "procadist"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

// Módulos por curso (cada curso tiene 1-5 módulos con HTML base)
export const studioModules = pgTable("studio_modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").notNull().references(() => studioCourses.id, { onDelete: "cascade" }),
  moduleIndex: integer("module_index").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  contentHtml: text("content_html").notNull(), // HTML base que Claude expande
  references: text("references").array().default([]),
  durationMinutes: integer("duration_minutes").default(15),
});

// Quiz estático por curso (fallback si Claude no genera quiz adaptivo)
export const studioQuizzes = pgTable("studio_quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").notNull().references(() => studioCourses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  passingScore: integer("passing_score").notNull().default(70),
  questions: jsonb("questions").notNull(), // [{question, options[], correctIndex, explanation}]
});

// Perfil del estudiante (datos recopilados en onboarding)
export const studentProfiles = pgTable("student_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  jobTitle: text("job_title"),
  industry: text("industry"),
  companySize: text("company_size"),
  experienceLevel: text("experience_level"), // principiante | intermedio | avanzado | lider
  learningGoals: text("learning_goals").array().default([]),
  preferredStyle: text("preferred_style").default("reading"),
});

// Contenido generado por IA (caché por usuario/curso/módulo)
export const generatedContent = pgTable("generated_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseSlug: text("course_slug").notNull(),
  moduleIndex: integer("module_index").notNull(),
  lectureHtml: text("lecture_html"), // HTML extenso generado por Claude
  mindMap: jsonb("mind_map"), // {central, branches[{label, color, children[{label, detail}]}]}
  reflections: text("reflections").array().default([]),
  adaptiveQuiz: jsonb("adaptive_quiz"), // [{question, options[], correctIndex, explanation}]
  suggestedSources: jsonb("suggested_sources"), // [{title, url, type}]
  podcastScript: text("podcast_script"), // EXISTE EN SCHEMA PERO NO SE USA AÚN
  personalizedFor: jsonb("personalized_for"), // {jobTitle, industry}
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Inscripciones
export const studioEnrollments = pgTable("studio_enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  source: text("source").notNull().default("studio"),
  courseIdentifier: text("course_identifier").notNull(),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("active"),
  progressPercent: integer("progress_percent").default(0),
  lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }),
});

// Progreso por módulo
export const studioModuleProgress = pgTable("studio_module_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  enrollmentId: uuid("enrollment_id").notNull().references(() => studioEnrollments.id, { onDelete: "cascade" }),
  moduleIdentifier: text("module_identifier").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  quizScore: integer("quiz_score"),
  timeSpentSeconds: integer("time_spent_seconds").default(0),
});

// Sesiones de chat con el tutor
export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseSlug: text("course_slug").notNull(),
  moduleIndex: integer("module_index").notNull(),
  messages: jsonb("messages").notNull().default([]), // [{role, content, timestamp}]
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});
```

### 2. AI ENGINE (server/ai-engine.ts) — Código completo actual

```typescript
import Anthropic from "@anthropic-ai/sdk";
import sanitizeHtml from "sanitize-html";

export interface StudentProfileContext {
  jobTitle?: string;
  industry?: string;
  companySize?: string;
  experienceLevel?: string;
  learningGoals?: string[];
  preferredStyle?: string;
}

export interface GeneratedModuleContent {
  lectureHtml: string;
  mindMap: {
    central: string;
    branches: { label: string; color?: string; children: { label: string; detail?: string }[] }[];
  };
  reflections: string[];
  adaptiveQuiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  suggestedSources: {
    title: string;
    url: string;
    type: string;
  }[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  message: string;
  suggestedQuestions: string[];
}

// SYSTEM PROMPT PARA GENERACIÓN DE CONTENIDO:
function buildContentSystemPrompt(...) {
  return `Eres el Tutor IA de Ceduverse, una plataforma de capacitación laboral en México.

  REGLAS ABSOLUTAS:
  - Todo en español de México (tutea al estudiante)
  - MÍNIMO 3,000 palabras por módulo (idealmente 4,000-5,000)
  - Referencia normatividad REAL de México (NOMs con número, artículos de la LFT, reglamentos específicos)
  - PERSONALIZA cada ejemplo al puesto e industria del estudiante
  - Formato HTML con buena estructura visual

  DATOS DEL ESTUDIANTE (PERSONALIZA TODO a este perfil):
  Puesto: ${jobTitle}
  Industria: ${industry}
  Tamaño de empresa: ${companySize}
  Experiencia: ${experienceLevel}
  Objetivo personal: ${learningGoal}

  GENERA ESTE JSON con:
  - lectureHtml: HTML de 3,000-5,000 palabras
  - mindMap: {central, branches[]}
  - reflections: 3 preguntas personalizadas
  - adaptiveQuiz: 7 preguntas situacionales
  - suggestedSources: NOMs, LFT, guías reales
  `;
}

// CONFIGURACIÓN DE CLAUDE:
model: "claude-sonnet-4-20250514",
max_tokens: 8192

// FALLBACK: Si no hay API key o Claude falla, devuelve contenido stub genérico

// PARSING: Extrae JSON de la respuesta de Claude, limpiando markdown/backticks
// BUG CONOCIDO: A veces Claude devuelve JSON truncado/malformado y cae al stub
```

### 3. API ROUTES (server/routes.ts) — Endpoints de Tutor IA

```
GET  /api/studio/courses                          → Lista cursos con filtros (category, search, page, limit)
GET  /api/studio/courses/:slug                    → Detalle de curso + módulos + quiz
GET  /api/studio/courses/:slug/modules/:index     → Módulo individual
POST /api/studio/courses/:slug/modules/:index/generate → Genera contenido con IA (auth req, cachea resultado)
POST /api/studio/courses/:slug/modules/:index/chat    → Chat con tutor IA (auth req, guarda historial)
POST /api/studio/enroll                           → Inscribirse a un curso
GET  /api/studio/enrollments                      → Mis inscripciones
GET  /api/me/student-profile                      → Mi perfil de estudiante
PUT  /api/me/student-profile                      → Actualizar perfil
```

### 4. FRONTEND — Páginas actuales

**Catálogo (/tutor-ia) — studio.tsx:**
- Grid de cursos con búsqueda y filtros por categoría
- Cards con icono, título, descripción, nivel, DC3/SEP badges
- Paginación, skeleton loading

**Onboarding (/tutor-ia/:slug/onboarding) — tutor-ia-onboarding.tsx:**
- Wizard de 3 pasos con animaciones Framer Motion:
  1. Explicación de cómo funciona el Tutor IA
  2. Formulario: puesto, industria, tamaño empresa, experiencia, objetivo
  3. Confirmación y lanzamiento
- Guarda perfil + inscripción → navega a /tutor-ia/:slug

**Curso (/tutor-ia/:slug) — studio-course.tsx:**
- Header con título del curso y botón de chat
- Barra de módulos (pills navegables)
- 4 tabs de contenido:
  - **Lectura**: HTML renderizado + tabla de contenidos lateral + botón "Escuchar" + botón "Descargar"
  - **Mapa Mental**: Grid de tarjetas expandibles con branches
  - **Quiz**: Preguntas paso a paso con feedback inmediato
  - **Fuentes**: Lista de referencias y fuentes sugeridas por IA
- Panel de chat lateral (360px desktop, fullscreen mobile)
- Loading state con tips rotativos y progress bar

### 5. SISTEMA DE AUDIO ACTUAL (el problema principal)

```typescript
// IMPLEMENTACIÓN ACTUAL — MUY BÁSICA:
const toggleSpeech = () => {
  if (isSpeaking) {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  } else {
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = "es-MX";
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }
};
```

**PROBLEMAS:**
1. Usa `SpeechSynthesis` del navegador → voz robótica, antinatural
2. Lee el texto plano tal cual → no hay didáctica, no hay tono de clase
3. No hay pausas, no hay énfasis, no hay estructura pedagógica
4. No hay "ambiente de aula" → es simplemente un lector de texto
5. No hay interacción simulada con alumnos
6. No hay ejemplos conversacionales
7. No hay control de progreso del audio

### 6. BUG CONOCIDO: JSON PARSING

```
[ai-engine] Claude API error: Expected ',' or ']' after array element in JSON at position 26062
```

Cuando Claude genera contenido muy largo, el JSON a veces se trunca o se corrompe, causando que caiga al stub genérico. El `max_tokens: 8192` puede ser insuficiente para el contenido solicitado (3,000-5,000 palabras + quiz + mind map + fuentes).

---

## LO QUE NECESITO QUE PLANIFIQUES

Quiero transformar Tutor IA de un "lector de texto robótico" a una **experiencia de clase virtual inmersiva**. Necesito un plan técnico completo y detallado para implementar las siguientes mejoras:

### A. AUDIO INMERSIVO — "Clase Virtual con Profesor"

**Visión:** Cuando el usuario presiona "Escuchar", no debe escuchar a un robot leyendo texto. Debe escuchar algo que se sienta como estar en una clase real:

1. **Voz de profesor natural** — Usar TTS de alta calidad (ElevenLabs, OpenAI TTS, Google Cloud TTS, etc.) con voz en español mexicano natural, no robótica
2. **Guion tipo clase, no lectura** — Claude debe generar un `podcastScript` o `classScript` separado del `lectureHtml` que sea una narrativa conversacional como si un profesor estuviera dando la clase:
   - "Bueno, vamos a arrancar con algo que seguramente te ha pasado en tu trabajo como [puesto]..."
   - "Imagínate esta situación: llegas un lunes y tu jefe te dice..."
   - "Ahora, esto es CLAVE, pongan atención..."
   - Incluir pausas naturales, cambios de tono, énfasis
3. **Simulación de aula** — Incluir elementos que simulen un ambiente de clase real:
   - Participaciones simuladas de "compañeros" (preguntas, comentarios)
   - "A ver, si tú fueras el supervisor, ¿qué harías? ... Exacto, eso es lo que la NOM-035 pide..."
   - Momentos de humor, anécdotas, ejemplos de vida real mexicanos
   - Sonidos ambientales sutiles (opcional): murmullos de salón, marcador en pizarrón
4. **Control de reproducción** — Player profesional:
   - Play/Pause/Stop
   - Barra de progreso con seeking
   - Velocidad de reproducción (0.75x, 1x, 1.25x, 1.5x)
   - Marcadores de sección sincronizados con el contenido escrito
   - Auto-scroll del texto mientras se reproduce (highlight del párrafo actual)
5. **Generación y caché** — El audio debe generarse una vez y cachearse (no regenerar cada vez)
6. **Costo** — Considerar los costos de TTS por minuto/carácter de las diferentes APIs

### B. FIX: JSON PARSING ROBUSTO

1. Aumentar `max_tokens` apropiadamente
2. Implementar retry automático (1-2 intentos) cuando el JSON falla
3. Intentar reparación de JSON antes de caer al stub (e.g., cerrar brackets faltantes)
4. Considerar streaming de la respuesta de Claude para manejar mejor respuestas largas
5. Logging mejorado para diagnosticar qué parte del JSON falla

### C. MEJORAS GENERALES AL TUTOR IA

1. **Progreso real** — El sistema de `studioModuleProgress` existe pero no se usa en el frontend (los módulos nunca se marcan como "completed")
2. **Persistencia de quiz** — El score del quiz no se guarda en `studioModuleProgress.quizScore`
3. **Historial de chat** — La sesión de chat no se precarga del servidor (siempre empieza vacía en el frontend)
4. **Regeneración de contenido** — No hay botón para regenerar contenido si el stub se sirvió por error
5. **Indicador de contenido IA vs. stub** — El usuario no sabe si recibió contenido personalizado o el fallback genérico
6. **Tiempo estimado de lectura** — Ya existe pero podría ser más preciso con el contenido generado
7. **Certificado** — Al completar todos los módulos y quiz, no hay flujo de emisión de certificado
8. **Descarga de contenido** — El botón "Descargar" solo hace `window.print()`, debería generar un PDF decente
9. **Responsive del chat** — El panel de chat mobile es funcional pero podría mejorar UX
10. **Dark mode** — Los componentes del Tutor IA no tienen soporte dark mode

---

## ENTREGABLE QUE ESPERO DE TI

Necesito que me des:

1. **Arquitectura técnica completa** del nuevo sistema de audio inmersivo:
   - Qué API de TTS usar y por qué (comparar ElevenLabs vs OpenAI TTS vs Google Cloud TTS para español MX)
   - Cómo generar el guion de clase (¿nuevo campo en el prompt? ¿prompt separado? ¿pipeline?)
   - Cómo cachear el audio generado (¿S3? ¿filesystem? ¿base64 en DB?)
   - Cómo sincronizar audio con texto (marcadores de tiempo)
   - Estimación de costos por módulo/curso

2. **Nuevo prompt de sistema** completo y listo para usar que genere:
   - El `lectureHtml` actual (mejorado)
   - Un nuevo `classScript` narrativo conversacional con marcadores de timing
   - Mind map, quiz, fuentes (mejorados)

3. **Plan de implementación** paso a paso:
   - Cambios en schema (si hay nuevos campos)
   - Cambios en ai-engine.ts
   - Nuevo endpoint de audio
   - Cambios en studio-course.tsx (nuevo player)
   - Orden de implementación y dependencias

4. **Fix para el JSON parsing** con código específico

5. **Lista priorizada** de todas las mejoras de la sección C con esfuerzo estimado (S/M/L) y dependencias

Dame el plan más detallado y técnico posible. Esto es nuestro producto principal y necesito que quede a nivel profesional de producción.

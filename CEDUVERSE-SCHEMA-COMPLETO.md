# CEDUVERSE — Esquema Completo de Plataforma (Marzo 2026)

Documento técnico completo para contexto en Claude. Versión actual de producción.

---

## 1. VISIÓN GENERAL

**Ceduverse** es una plataforma EdTech enfocada en educación profesional para Latinoamérica. Combina:
- **Capacitación STPS** (29 cursos de Aula Virtual con instructores reales)
- **Tutor IA** (49 cursos con contenido generado por IA + personalización)
- **Academy** (988 cursos de ceducap.academy sincronizados)
- **Certificación 3 niveles** (Diploma NFT gratis / DC-3 $499 / SEP $1,999 MXN)
- **Modelo Cooperativista** para empresas (Kit Cooperativo + Equipos)
- **Web3 wallet** integrada (ethers.js v6)
- **Chat interno** con gestores académicos

**URL de producción:** ceduverse.replit.app
**Idioma:** Español LATAM exclusivamente

---

## 2. STACK TECNOLÓGICO

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, shadcn/ui |
| Backend | Express.js, Node.js, TypeScript |
| ORM | Drizzle ORM (drizzle-orm/node-postgres con pg Pool) |
| Base de datos | PostgreSQL |
| Auth | JWT custom + OTP vía Resend (noreply@ceduverse.org) |
| IA contenido | Anthropic Claude claude-sonnet-4-20250514 (@anthropic-ai/sdk) |
| IA audio | OpenAI TTS-1-HD, voz "alloy", caché MP3 local |
| Email | Resend (noreply@ceduverse.org) |
| Web3 | ethers.js v6 |
| PDF | pdfkit (Kit Cooperativo), html2pdf.js (descarga de lecciones) |
| Router frontend | wouter |
| State/Data fetching | @tanstack/react-query v5 |

---

## 3. DISEÑO VISUAL

| Elemento | Valor |
|----------|-------|
| Fondo principal | Cream #faf8f4 |
| Azul principal | cedu-blue #1b5adf |
| Naranja | cedu-orange #f28023 |
| Violeta | cedu-violet #7c3aed |
| Verde | cedu-green #00b87a |
| Heading font | DM Serif Display |
| Body font | Plus Jakarta Sans |
| Dark mode | Solo en el visor de cursos Tutor IA (studio-course.tsx) |

---

## 4. AUTENTICACIÓN Y ROLES

### Auth Flow
1. Usuario ingresa email → POST /api/auth/otp (envía código de 6 dígitos por email vía Resend)
2. Usuario ingresa OTP → POST /api/auth/verify-otp (valida código, crea usuario si no existe)
3. Servidor regresa JWT (7 días de expiración, firmado con SESSION_SECRET)
4. Token se guarda en localStorage como `cedu_token`
5. Cada request autenticada envía header `Authorization: Bearer <token>`

### Roles de Usuario (user_role enum)
| Rol | Acceso | Dashboard |
|-----|--------|-----------|
| user | Dashboard personal, cursos, wallet | /dashboard |
| moderator | + Acceso a gestión de mensajes de soporte | /dashboard |
| admin | + Panel admin, gestión de certificados | /admin |
| partner | + Panel de socio, referidos, equipos | /partner |
| superadmin | Todo + gestión de usuarios y roles | /admin |

### Tipos de Cuenta (account_type enum)
- **free** — Acceso básico (default)
- **premium** — Funciones premium
- **admin** — Administrador

---

## 5. BASE DE DATOS — TODAS LAS TABLAS

### 5.1 Usuarios y Perfiles
```
users: id(uuid PK), email(unique), password, created_at
accounts: id(uuid FK→users), account_type, account_setup(0-3), referral_code(unique), referred_by(FK→referral_code), user_role, created_at, updated_at
profiles: id(uuid FK→users), full_name, country, city, phone_number, wallet_address, interest(jsonb), genre, created_at, updated_at
student_profiles: id(uuid FK→users), job_title, industry, company_size, experience_level, learning_goal, preferred_style, created_at, updated_at
```

### 5.2 Cursos STPS (Aula Virtual — 29 cursos)
```
courses: id(uuid PK), slug(unique), title, description, cover_url, instructor, instructor_id, duration_hrs, duration_virtual_hrs, area_tematica, categoria(text[]), nivel, temas(text[]), objetivo, publico(text[]), dc3_disponible, precio_curso, sep_certificate_price(default 1999), has_rvoe, rvoe_url, created_at, updated_at
course_modules: id(uuid PK), course_id(FK→courses), order, title, description, content_html, video_url, audio_url, references(text[]), duration_minutes
course_users: id(bigserial PK), user_id(FK→users), course_id(FK→courses), course_slug, completed(0-100), created_at, updated_at
```

### 5.3 Academy (ceducap.academy — 988 cursos cacheados)
```
academy_courses_cache: id(uuid PK), academy_id(int unique), title, excerpt, content, status, url, date, modified, author_id, synced_at
academy_curriculum_cache: id(uuid PK), academy_id(int unique), curriculum_json(jsonb), total_items, synced_at
```
- Sincronización: Al iniciar app + cada 6 horas
- API: ceducap.academy WordPress REST API
- Caché: Búsqueda local, fallback a API en vivo

### 5.4 Tutor IA (49 cursos con IA)
```
studio_courses: id(uuid PK), slug(unique), title, description, category, subcategory, duration_minutes, level, tags(text[]), dc3_available, instructor_name, instructor_bio, instructor_avatar, total_modules, module_titles(jsonb), quiz_title, quiz_description, quiz_total_questions, created_at, updated_at
studio_modules: id(uuid PK), course_id(FK→studio_courses), module_index, title, description, learning_objectives(text[]), key_concepts(text[])
studio_quizzes: id(uuid PK), course_id(FK→studio_courses), title, description, passing_score, questions(jsonb)
generated_content: id(uuid PK), user_id(FK→users), course_slug, module_index, content(jsonb), generation_status, class_script, is_stub, audio_url, audio_duration_seconds, audio_generated_at, generated_at, updated_at
studio_enrollments: id(uuid PK), user_id(FK→users), source, course_identifier, enrolled_at, last_accessed_at, current_module_index, completion_percentage
studio_module_progress: id(uuid PK), enrollment_id(FK→studio_enrollments), module_identifier, completed, completed_at, quiz_score, time_spent_seconds
chat_sessions: id(uuid PK), user_id(FK→users), course_slug, module_index, messages(jsonb), created_at, updated_at
```
**Pipeline de generación IA (2 llamadas a Claude):**
1. Call 1 (6144 tokens): lectureHtml + mindMap + reflections + suggestedSources
2. Call 2 (4096 tokens): adaptiveQuiz + classScript

**Audio:** OpenAI TTS-1-HD → MP3 cacheado en `audio-cache/`

### 5.5 Certificaciones
```
achievements: id(uuid PK), slug(unique), name, short_description, description, value(>0), category, icon, cover_url, contract_address, created_at, updated_at
achievement_users: id(uuid PK), user_id(FK→users), achievement_id(FK→achievements), is_active, status(pending/active/revoked), cert_type(diploma/dc3/sep), contract_address, token_id, pdf_url, created_at, updated_at — UNIQUE(user_id, achievement_id, cert_type)
certificate_requests: id(uuid PK), user_id(FK→users), course_id(FK→courses), cert_type(diploma/dc3/sep), status(solicitado/en_proceso/emitido/rechazado), reject_reason, pdf_url, achievement_user_id(FK→achievement_users), created_at, updated_at — UNIQUE(user_id, course_id, cert_type)
```

**Flujo de certificación:**
1. **Diploma Digital (Gratis):** Auto-emitido como NFT badge al aprobar quiz
2. **DC-3 STPS ($499 MXN):** Solicitud → coordinador sube PDF del capacitador → emitido → NFT mint simulado
3. **Certificado SEP ($1,999 MXN):** Mismo flujo que DC-3, emisor externo es INEC

### 5.6 Equipos y Organizaciones
```
teams: id(text PK), name, description, plan, partner_id(FK→users), status, created_at, updated_at
team_users: id(bigserial PK), team_id(FK→teams), user_id(FK→users), role, created_at, updated_at — UNIQUE(team_id, user_id)
org_objectives: id(uuid PK), team_id(FK→teams), course_id(FK→courses), assigned_by(FK→users), status, created_at — UNIQUE(team_id, course_id)
user_objectives: id(uuid PK), org_objective_id(FK→org_objectives), user_id(FK→users), assigned_by(FK→users), status, completed_at, created_at — UNIQUE(org_objective_id, user_id)
```

### 5.7 Referidos y Partners
```
referral_codes: id(uuid PK), code(unique), owner_id(FK→users), owner_type(default "partner"), label, commission(default 10%), usage_count, is_active, created_at
accounts.referral_code — código propio del usuario
accounts.referred_by — FK al referral_code que lo invitó
```

### 5.8 Leads y Marketing
```
leads: id(bigserial PK), full_name, email, company, phone, city, source(default "kit-cooperativo"), created_at
```

### 5.9 Chat de Soporte (Gestor Académico)
```
support_threads: id(uuid PK), user_id(FK→users), subject, academy_course_id(int), status(open/closed), created_at, updated_at
support_messages: id(uuid PK), thread_id(FK→support_threads), sender_id(FK→users), sender_role(default "user"), content, created_at
```

### 5.10 Descubrimiento de Aprendizaje
```
learning_interests: id(uuid PK), user_id(FK→accounts), topics(text[]), recommendations(jsonb), created_at, updated_at
```
- 36 temas organizados en 8 categorías (Seguridad, Normatividad, Desarrollo, etc.)
- Buscador de recomendaciones cruza Academy (988) + Studio (49) + CTA STPS

### 5.11 Quizzes
```
course_quizzes: id(uuid PK), course_id(FK→courses), academy_course_id(int), title, description, passing_score(default 70), time_limit
quiz_questions: id(uuid PK), quiz_id(FK→course_quizzes), order, question, options(text[]), correct_index, explanation
quiz_attempts: id(uuid PK), user_id(FK→users), quiz_id(FK→course_quizzes), score, passed, answers(jsonb), started_at, completed_at
```

---

## 6. RUTAS DEL FRONTEND

| Ruta | Página | Acceso |
|------|--------|--------|
| / | Landing page gamificada | Público |
| /empresas | Landing B2B | Público |
| /auth | Login/registro OTP | Público |
| /welcome | Onboarding post-registro (3 pasos) | Autenticado |
| /dashboard | Dashboard principal (cursos, wallet, badges, descubrimiento) | Autenticado |
| /academy | Catálogo de 988 cursos Academy | Público |
| /academy/:id | Detalle de curso Academy (info + temario acordeón + CTA chat) | Público |
| /aula-virtual | Catálogo de 29 cursos STPS | Autenticado |
| /aula-virtual/:slug | Visor de curso STPS (video, presentación, audio, quiz) | Autenticado |
| /tutor-ia | Catálogo de 49 cursos Tutor IA | Público |
| /tutor-ia/:slug/onboarding | Onboarding de 3 pasos antes de empezar curso | Autenticado |
| /tutor-ia/:slug | Visor completo de curso IA (lectura, mapa mental, quiz, chat, fuentes, audio, certificado) | Autenticado |
| /mensajes | Lista de conversaciones con gestor académico | Autenticado |
| /mensajes/:threadId | Detalle de conversación (chat en tiempo real) | Autenticado |
| /kit-cooperativo | Landing de Kit Cooperativo (formulario de lead) | Público |
| /admin | Dashboard admin (estadísticas, certificados, organizaciones, partners, usuarios) | Superadmin |
| /partner | Dashboard de socio (referidos, organizaciones, estadísticas) | Partner |

---

## 7. API ENDPOINTS COMPLETOS

### Auth
- POST /api/auth/otp — Enviar código OTP a email
- POST /api/auth/verify-otp — Verificar OTP, devolver JWT
- GET /api/auth/me — Obtener usuario actual (requiere JWT)

### Perfil y Cuenta (requiere auth)
- GET /api/me/profile — Obtener perfil
- PATCH /api/me/profile — Actualizar perfil
- GET /api/me/account — Obtener cuenta
- PATCH /api/me/account — Actualizar cuenta

### Cursos STPS
- GET /api/courses — Listar todos
- GET /api/courses/:id — Detalle de curso
- GET /api/courses/:id/modules — Módulos del curso
- GET /api/courses/:courseId/modules/:moduleId — Detalle de módulo
- GET /api/courses/:id/quiz — Quiz del curso
- POST /api/courses/:id/quiz/submit — Enviar respuestas de quiz

### Mis Cursos (auth)
- GET /api/me/courses — Cursos inscritos
- POST /api/me/courses — Inscribirse a curso
- PATCH /api/me/courses/:courseId — Actualizar progreso
- DELETE /api/me/courses/:courseId — Desinscribirse

### Logros y Certificados (auth)
- GET /api/achievements — Todos los logros
- GET /api/me/achievements — Mis logros
- GET /api/me/quiz-attempts — Mis intentos de quiz
- POST /api/me/certificates — Solicitar certificado (DC-3/SEP)
- GET /api/me/certificates — Mis solicitudes de certificado

### Academy (ceducap.academy)
- GET /api/academy/courses — Listar cursos (paginado, búsqueda)
- GET /api/academy/courses/:id — Detalle de curso
- GET /api/academy/courses/:id/curriculum — Temario completo
- GET /api/academy/courses/:id/quiz — Quiz del curso Academy
- POST /api/academy/courses/:id/quiz/submit — Enviar respuestas
- GET /api/academy/products — Productos de tienda
- GET /api/academy/stats — Estadísticas (total cursos)
- POST /api/academy/sync — Forzar sincronización (admin)

### Tutor IA (Studio)
- GET /api/studio/courses — Listar cursos (filtros: categoría, búsqueda, paginación)
- GET /api/studio/courses/:slug — Detalle de curso
- GET /api/studio/courses/:slug/modules/:index — Módulo específico
- POST /api/studio/courses/:slug/modules/:index/generate — Generar contenido IA
- DELETE /api/studio/courses/:slug/modules/:index/generated — Eliminar contenido generado
- POST /api/studio/enroll — Inscribirse
- GET /api/studio/enrollments — Mis inscripciones
- DELETE /api/studio/enrollments/:courseSlug — Desinscribirse
- PUT /api/studio/enrollments/:enrollmentId/modules/:identifier/complete — Marcar módulo completo
- GET /api/studio/enrollments/:enrollmentId/progress — Progreso de módulos
- POST /api/studio/courses/:slug/modules/:index/quiz/submit — Enviar quiz
- GET /api/studio/courses/:slug/modules/:index/chat/history — Historial de chat IA
- POST /api/studio/courses/:slug/modules/:index/chat — Enviar mensaje al chat IA
- GET /api/studio/courses/:slug/modules/:index/audio — Obtener/generar audio
- GET /api/studio/courses/:slug/modules/:index/audio/status — Estado de audio
- POST /api/studio/courses/:slug/modules/:index/audio/regenerate — Regenerar audio

### Chat de Soporte (auth)
- GET /api/support/threads — Mis conversaciones
- POST /api/support/threads — Nueva conversación (subject, message, academyCourseId)
- GET /api/support/threads/:threadId — Detalle con mensajes
- POST /api/support/threads/:threadId/messages — Enviar mensaje

### Referidos
- GET /api/referral/:code — Verificar código de referido
- GET /api/me/referral — Mi código de referido

### Leads
- POST /api/leads — Crear lead (Kit Cooperativo) → envía PDF por email

### Descubrimiento de Aprendizaje
- GET /api/learning/topics — 36 temas disponibles
- GET /api/learning/interests — Mis intereses guardados
- POST /api/learning/discover — Buscar recomendaciones por temas

### Equipos (auth)
- GET /api/teams — Listar equipos
- POST /api/teams — Crear equipo
- GET /api/teams/:id/members — Miembros del equipo
- POST /api/teams/:id/members — Agregar miembro
- DELETE /api/teams/:id/members/:userId — Remover miembro
- GET /api/teams/:id/objectives — Objetivos del equipo
- POST /api/teams/:id/objectives/:objId/assign — Asignar objetivo a miembro
- GET /api/teams/:id/progress — Progreso del equipo
- POST /api/teams/:id/invite — Invitar miembro por email

### Admin (superadmin)
- GET /api/admin/stats — Estadísticas generales
- GET /api/admin/certificates — Todas las solicitudes de certificados
- PATCH /api/admin/certificates/:id — Actualizar estado de certificado
- POST /api/admin/certificates/:id/upload — Subir PDF de certificado
- GET /api/admin/orgs — Todas las organizaciones
- GET /api/admin/orgs/:id — Detalle de organización
- POST /api/admin/orgs/:id/objectives — Crear objetivo
- DELETE /api/admin/orgs/:id/objectives/:objId — Eliminar objetivo
- GET /api/admin/partners — Listar socios
- POST /api/admin/partners — Crear socio
- GET /api/admin/users — Listar todos los usuarios
- PATCH /api/admin/users/:id/role — Cambiar rol de usuario
- GET /api/admin/support/threads — Todos los hilos de soporte

### Partner (auth + rol partner)
- GET /api/partner/stats — Mis estadísticas
- GET /api/partner/orgs — Mis organizaciones
- GET /api/partner/referrals — Mis códigos de referido
- POST /api/partner/referrals — Crear código de referido

---

## 8. COMPONENTES FRONTEND CLAVE

### Páginas (client/src/pages/)
| Archivo | Función |
|---------|---------|
| landing.tsx | Landing page gamificada con animaciones |
| empresas.tsx | Landing B2B |
| auth.tsx | Login/registro OTP |
| onboarding.tsx | Onboarding post-registro |
| dashboard.tsx | Dashboard principal (tabs: Overview, Cursos, Wallet, Badges, Certificados) |
| academy.tsx | Catálogo Academy con búsqueda y paginación |
| academy-course.tsx | Detalle de curso Academy (info, temario acordeón, CTA chat) |
| aula-virtual.tsx | Catálogo STPS |
| curso-virtual.tsx | Visor de curso STPS |
| studio.tsx | Catálogo Tutor IA |
| tutor-ia-onboarding.tsx | Onboarding 3 pasos Tutor IA |
| studio-course.tsx | Visor completo Tutor IA (lectura, mapa mental, quiz, chat, fuentes, audio, certificado) |
| support-chat.tsx | Chat con gestor académico (lista + detalle) |
| kit-cooperativo.tsx | Landing + formulario Kit Cooperativo |
| admin-dashboard.tsx | Panel admin |
| partner-dashboard.tsx | Panel socio |

### Componentes (client/src/components/)
| Archivo | Función |
|---------|---------|
| AudioClassPlayer.tsx | Reproductor de audio-clase con controles completos |
| TextReader.tsx | Lector en voz alta con resaltado de texto oración por oración |
| TopicDiscovery.tsx | Burbuja de descubrimiento de temas + resultados |
| ThemeProvider.tsx | Dark mode provider (solo Tutor IA) |
| ShareCourseModal.tsx | Modal para compartir curso |
| achievements/ | Componentes de badges 3D |
| wallet/ | Componentes de wallet Web3 |
| ui/ | Componentes shadcn/ui |

### Archivos de Servidor Clave (server/)
| Archivo | Función |
|---------|---------|
| routes.ts | Todos los endpoints API (~100+ rutas) |
| storage.ts | IStorage interface + DatabaseStorage (CRUD completo) |
| ai-engine.ts | Pipeline de generación de contenido con Claude |
| audio-generator.ts | Generación de audio con OpenAI TTS |
| academy-sync.ts | Sincronización con ceducap.academy |
| email.ts | Envío de emails con Resend (OTP, Kit, etc.) |
| kit-pdf.ts | Generación de PDF del Kit Cooperativo |
| seed-studio.ts | Seed de 49 cursos + módulos + quizzes Tutor IA |
| data/ | Datos de cursos (módulos, quizzes, metadata) |

---

## 9. FLUJOS DE NEGOCIO ACTUALES

### 9.1 Usuario Individual (Gratuito)
1. Registro vía OTP email → Onboarding (nombre, país, intereses, wallet Web3)
2. Dashboard con descubrimiento de temas
3. Acceso a Aula Virtual (29 cursos STPS) con quiz y certificado
4. Acceso a Tutor IA (49 cursos con contenido personalizado por IA)
5. Acceso a Academy (988 cursos — solo información, contacto con gestor académico para inscripción)
6. Wallet con badges NFT coleccionables

### 9.2 Empresa / Organización
1. Socio (partner) crea organización con equipo
2. Asigna cursos como objetivos a empleados
3. Empleados se registran con código de referido del socio
4. Seguimiento de progreso por equipo
5. Certificaciones DC-3 y SEP para cumplimiento normativo

### 9.3 Modelo de Certificación (Monetización Principal)
| Certificación | Precio | Proceso |
|--------------|--------|---------|
| Diploma Digital NFT | Gratis | Automático al aprobar quiz |
| Constancia DC-3 STPS | $499 MXN | Solicitud → coordinador gestiona con capacitador externo → PDF |
| Certificado SEP (vía INEC) | $1,999 MXN | Solicitud → coordinador gestiona con INEC → PDF |

### 9.4 Kit Cooperativo (Lead Generation)
1. Usuario llena formulario en /kit-cooperativo
2. Se genera PDF personalizado de 10 secciones
3. Se envía por email vía Resend
4. Lead capturado en tabla `leads`

### 9.5 Referidos
- Socios comerciales (partners) crean códigos de referido
- Usuarios se registran con código → cuenta vinculada al socio
- Comisión configurable por código (default 10%)
- Tracking de uso por código

---

## 10. LO QUE FALTA / OPORTUNIDADES PARA V2

### 10.1 Monetización
- [ ] Pasarela de pagos (Stripe/Conekta) para DC-3 y SEP
- [ ] Suscripción premium mensual/anual
- [ ] Planes empresariales con facturación
- [ ] Marketplace de cursos con comisiones a instructores

### 10.2 Marketing y Crecimiento
- [ ] Sistema de referidos para usuarios orgánicos (no solo partners)
- [ ] Programa de recompensas/gamificación por referir amigos
- [ ] Dashboard de analytics de campañas
- [ ] Tracking de UTM y fuentes de tráfico
- [ ] Email marketing automatizado (secuencias de onboarding, re-engagement)
- [ ] Notificaciones push / in-app

### 10.3 Socios Comerciales
- [ ] Dashboard de partner mejorado con métricas de conversión
- [ ] Materiales de marketing descargables para socios
- [ ] API de reportes para socios
- [ ] Comisiones escalonadas por volumen
- [ ] Portal de co-branding

### 10.4 Producto
- [ ] App móvil (React Native / PWA)
- [ ] Certificados verificables en blockchain real (no simulado)
- [ ] Foro/comunidad de estudiantes
- [ ] Calendario de sesiones en vivo
- [ ] Progress reports exportables
- [ ] Multi-idioma (portugués para Brasil)

### 10.5 Contenido
- [ ] Videos reales para los 49 cursos de Tutor IA (URLs en BD, player listo)
- [ ] Contenido interactivo (simulaciones, casos prácticos)
- [ ] Evaluaciones prácticas (no solo quiz teórico)

---

## 11. DATOS CLAVE PARA PLAN COMERCIAL

### Catálogo Actual
| Producto | Cantidad | Estado |
|----------|----------|--------|
| Cursos STPS (Aula Virtual) | 29 | Completos con contenido real |
| Cursos Tutor IA | 49 (196 módulos) | Contenido generado por IA bajo demanda |
| Cursos Academy (ceducap) | 988 | Info + temario, inscripción vía gestor |
| Instructores STPS | 3 | Yuridia (10), Medina (16), Procadist (23) |
| Temas de descubrimiento | 36 | En 8 categorías |

### Precios Actuales
| Producto | Precio |
|----------|--------|
| Registro y acceso básico | Gratis |
| Diploma Digital NFT | Gratis (al aprobar quiz) |
| Constancia DC-3 STPS | $499 MXN |
| Certificado SEP (INEC) | $1,999 MXN |
| Kit Cooperativo PDF | Gratis (lead gen) |
| Instructor STPS presencial | $1,999 MXN (CTA con Calendly) |

### Infraestructura de Referidos
- Tabla `referral_codes`: código, dueño, comisión %, uso, activo/inactivo
- Tabla `accounts`: referral_code propio + referred_by
- Partners pueden crear múltiples códigos con etiquetas personalizadas
- Tracking automático de conversiones

### Canales de Comunicación Actuales
| Canal | Estado |
|-------|--------|
| Email transaccional (Resend) | Activo (OTP, Kit Cooperativo) |
| Chat interno (Gestor Académico) | Activo (support_threads) |
| WhatsApp | Removido de CTA Academy |
| Email marketing | No implementado |
| Notificaciones in-app | No implementado |

---

## 12. VARIABLES DE ENTORNO REQUERIDAS

```
DATABASE_URL — PostgreSQL connection string
SESSION_SECRET — JWT signing secret (requerido, hard-fail si falta)
RESEND_API_KEY — Resend para emails
OPENAI_API_KEY — OpenAI TTS para audio
ANTHROPIC_API_KEY — Claude para generación de contenido (opcional, usa stubs si falta)
```

---

## 13. ARCHIVOS PRINCIPALES DEL PROYECTO

```
shared/schema.ts — Modelo de datos completo (Drizzle ORM)
server/routes.ts — Todos los endpoints API
server/storage.ts — Interfaz y implementación de storage
server/ai-engine.ts — Motor de generación IA
server/audio-generator.ts — Generador de audio TTS
server/email.ts — Envío de emails
server/academy-sync.ts — Sincronización Academy
server/seed-studio.ts — Seed de cursos Tutor IA
server/kit-pdf.ts — Generador PDF Kit Cooperativo
client/src/App.tsx — Router principal
client/src/pages/ — 16 páginas
client/src/components/ — Componentes reutilizables
client/src/hooks/use-auth.ts — Hook de autenticación
client/src/lib/queryClient.ts — TanStack Query config
client/src/lib/auth-token.ts — Utilidades de JWT
```

---

*Documento generado: 22 de Marzo, 2026*
*Versión: Producción actual*

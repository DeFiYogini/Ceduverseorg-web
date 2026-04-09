CREATE TYPE "public"."account_type" AS ENUM('free', 'premium', 'admin');--> statement-breakpoint
CREATE TYPE "public"."achievement_status" AS ENUM('pending', 'active', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."cert_request_status" AS ENUM('solicitado', 'en_proceso', 'emitido', 'rechazado');--> statement-breakpoint
CREATE TYPE "public"."cert_type" AS ENUM('diploma', 'dc3', 'sep');--> statement-breakpoint
CREATE TYPE "public"."certification_type" AS ENUM('nft', 'dc3', 'sep');--> statement-breakpoint
CREATE TYPE "public"."cfdi_status" AS ENUM('pending', 'emitido', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."commission_status" AS ENUM('pending', 'approved', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."denue_prospect_stage" AS ENUM('nuevo', 'contactado', 'demo', 'propuesta', 'negociacion', 'cliente', 'perdido');--> statement-breakpoint
CREATE TYPE "public"."dispersion_status" AS ENUM('draft', 'applied', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."instructor_application_status" AS ENUM('draft', 'pending_review', 'pending_dc5', 'approved', 'rejected', 'active');--> statement-breakpoint
CREATE TYPE "public"."instructor_application_type" AS ENUM('dc5', 'internal');--> statement-breakpoint
CREATE TYPE "public"."instructor_course_status" AS ENUM('draft', 'review', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."insurance_enrollment_status" AS ENUM('pending', 'active', 'suspended', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."insurance_profile" AS ENUM('administrativo', 'logistica', 'pirotecnia');--> statement-breakpoint
CREATE TYPE "public"."insurance_tier" AS ENUM('basico', 'medio', 'premium');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'active', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."invoice_type" AS ENUM('contribution', 'certification');--> statement-breakpoint
CREATE TYPE "public"."membership_status" AS ENUM('activo', 'suspendido', 'separado', 'excluido');--> statement-breakpoint
CREATE TYPE "public"."membership_type" AS ENUM('consumo', 'produccion', 'instructor');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('spei', 'deposit', 'domiciliation', 'card', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'confirmed', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."prospect_stage" AS ENUM('contact', 'demo', 'proposal', 'negotiation', 'closed', 'active', 'lost');--> statement-breakpoint
CREATE TYPE "public"."sam_payment_status" AS ENUM('unpaid', 'partial', 'paid', 'overdue');--> statement-breakpoint
CREATE TYPE "public"."sam_status" AS ENUM('pending', 'confirmed', 'paid', 'adjusted', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."support_thread_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."terms_doc_type" AS ENUM('terminos_condiciones', 'aviso_privacidad', 'politica_cookies', 'adhesion_cooperativa');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'moderator', 'admin', 'partner', 'superadmin', 'instructor');--> statement-breakpoint
CREATE TABLE "academy_courses_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academy_id" integer NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"content" text,
	"status" text DEFAULT 'publish' NOT NULL,
	"url" text,
	"date" timestamp with time zone,
	"modified" timestamp with time zone,
	"author_id" text,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "academy_courses_cache_academy_id_unique" UNIQUE("academy_id")
);
--> statement-breakpoint
CREATE TABLE "academy_curriculum_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academy_id" integer NOT NULL,
	"curriculum_json" jsonb NOT NULL,
	"total_items" integer DEFAULT 0,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "academy_curriculum_cache_academy_id_unique" UNIQUE("academy_id")
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"account_type" "account_type" DEFAULT 'free' NOT NULL,
	"account_setup" smallint DEFAULT 0 NOT NULL,
	"referral_code" text,
	"referred_by" text,
	"user_role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "accounts_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "achievement_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"achievement_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"status" "achievement_status" NOT NULL,
	"cert_type" "cert_type" DEFAULT 'diploma' NOT NULL,
	"contract_address" text,
	"token_id" text,
	"pdf_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"short_description" text,
	"description" text,
	"value" integer DEFAULT 1000 NOT NULL,
	"category" text,
	"icon" text,
	"cover_url" text,
	"contract_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "achievements_slug_unique" UNIQUE("slug"),
	CONSTRAINT "chk_achievement_value" CHECK ("achievements"."value" > 0)
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"key_hash" text NOT NULL,
	"key_prefix" text NOT NULL,
	"owner" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"allowed_origins" text[] DEFAULT '{}',
	"rate_limit_per_minute" integer DEFAULT 60 NOT NULL,
	"rate_limit_per_day" integer DEFAULT 10000 NOT NULL,
	"expires_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"requests_today" integer DEFAULT 0 NOT NULL,
	"requests_today_date" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "api_request_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"method" text NOT NULL,
	"status_code" integer NOT NULL,
	"response_time_ms" integer,
	"ip" text,
	"user_agent" text,
	"query_params" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"content_html" text NOT NULL,
	"content_text" text NOT NULL,
	"excerpt" varchar(300),
	"category" varchar(50) NOT NULL,
	"target_sectors" jsonb DEFAULT '[]'::jsonb,
	"seo_keywords" jsonb DEFAULT '[]'::jsonb,
	"featured_image_url" varchar(500),
	"author_name" varchar(100) DEFAULT 'Ceduverse',
	"newsletter_subject" varchar(100),
	"newsletter_sent" boolean DEFAULT false,
	"blog_views" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'draft',
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "certificate_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"cert_type" "cert_type" NOT NULL,
	"status" "cert_request_status" DEFAULT 'solicitado' NOT NULL,
	"reject_reason" text,
	"pdf_url" text,
	"achievement_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_slug" text NOT NULL,
	"module_index" integer NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "company_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" text NOT NULL,
	"amount" integer NOT NULL,
	"expected_amount" integer,
	"payment_method" "payment_method" DEFAULT 'spei' NOT NULL,
	"reference" text,
	"receipt_url" text,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"period_month" integer NOT NULL,
	"period_year" integer NOT NULL,
	"paid_at" timestamp with time zone,
	"confirmed_by" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" text NOT NULL,
	"wallet_type" text NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"filter_criteria" jsonb,
	"assigned_socio_id" uuid,
	"prospect_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "contactos_prospectos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"puesto" text,
	"telefono" text,
	"email" text,
	"es_principal" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contribution_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contribution_id" uuid NOT NULL,
	"action" text NOT NULL,
	"actor_email" text NOT NULL,
	"actor_ip" text,
	"actor_user_agent" text,
	"document_hash" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cooperative_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"membership_number" text NOT NULL,
	"membership_type" "membership_type" DEFAULT 'consumo' NOT NULL,
	"status" "membership_status" DEFAULT 'activo' NOT NULL,
	"accepted_statutes" boolean DEFAULT true NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"acceptance_ip" text,
	"acceptance_user_agent" text,
	"acceptance_hash" text,
	"certificate_nft_id" uuid,
	"certificate_issued_at" timestamp with time zone,
	"certificate_blockchain_tx" text,
	"certificate_token_id" text,
	"admission_approved_by" uuid,
	"admission_approved_at" timestamp with time zone DEFAULT now(),
	"separation_date" timestamp with time zone,
	"separation_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "cooperative_memberships_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "cooperative_memberships_membership_number_unique" UNIQUE("membership_number")
);
--> statement-breakpoint
CREATE TABLE "course_modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"order" integer DEFAULT 1 NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content_html" text,
	"video_url" text,
	"audio_url" text,
	"references" text[],
	"duration_minutes" integer
);
--> statement-breakpoint
CREATE TABLE "course_quizzes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid,
	"academy_course_id" integer,
	"title" text NOT NULL,
	"description" text,
	"passing_score" integer DEFAULT 70 NOT NULL,
	"time_limit" integer
);
--> statement-breakpoint
CREATE TABLE "course_users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"course_slug" text NOT NULL,
	"completed" smallint DEFAULT 0 NOT NULL,
	"listening_progress" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "chk_completed_range" CHECK ("course_users"."completed" >= 0 AND "course_users"."completed" <= 100)
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"cover_url" text,
	"instructor" text,
	"instructor_id" text,
	"duration_hrs" integer,
	"duration_virtual_hrs" integer,
	"area_tematica" text,
	"categoria" text[],
	"nivel" text,
	"temas" text[],
	"objetivo" text,
	"publico" text[],
	"dc3_disponible" boolean DEFAULT false,
	"precio_curso" integer DEFAULT 0,
	"sep_certificate_price" integer DEFAULT 1999,
	"has_rvoe" boolean DEFAULT false,
	"rvoe_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "dispersions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_month" integer NOT NULL,
	"period_year" integer NOT NULL,
	"total_amount" integer DEFAULT 0 NOT NULL,
	"companies_included" integer DEFAULT 0 NOT NULL,
	"status" "dispersion_status" DEFAULT 'draft' NOT NULL,
	"details" jsonb,
	"created_by" uuid,
	"applied_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "empresas_prospectos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"denue_id" text,
	"nombre_comercial" text NOT NULL,
	"razon_social" text,
	"actividad_economica" text,
	"codigo_scian" text,
	"tipo_establecimiento" text,
	"estrato_personal" text,
	"empleados_min" integer,
	"empleados_max" integer,
	"telefono" text,
	"correo_electronico" text,
	"sitio_web" text,
	"tipo_vialidad" text,
	"calle" text,
	"num_exterior" text,
	"num_interior" text,
	"colonia" text,
	"codigo_postal" text,
	"municipio" text,
	"estado" text,
	"latitud" double precision,
	"longitud" double precision,
	"lead_score" integer DEFAULT 0 NOT NULL,
	"score_desglose" jsonb DEFAULT '{}'::jsonb,
	"stage" "denue_prospect_stage" DEFAULT 'nuevo' NOT NULL,
	"partner_id" uuid,
	"noms_aplicables" text[],
	"zona_comercial" text,
	"prioridad" text,
	"empleados_estimados" integer,
	"potencial_aportacion_mensual" double precision,
	"nivel_riesgo" text,
	"grupo_sector" text,
	"plan_recomendado" text,
	"direccion_completa" text,
	"contact_group_id" uuid,
	"nombre_contacto" text,
	"rfc" text,
	"notas" text,
	"last_contacted_at" timestamp with time zone,
	"fecha_alta" timestamp with time zone,
	"import_batch_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "enriquecimiento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"fuente" text NOT NULL,
	"google_rating" double precision,
	"google_reviews" integer,
	"google_place_id" text,
	"linkedin_url" text,
	"facebook_url" text,
	"datos_extra" jsonb DEFAULT '{}'::jsonb,
	"consultado_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_slug" text NOT NULL,
	"module_index" integer NOT NULL,
	"lecture_html" text,
	"mind_map" jsonb,
	"reflections" text[] DEFAULT '{}',
	"adaptive_quiz" jsonb,
	"suggested_sources" jsonb,
	"podcast_script" text,
	"class_script" text,
	"audio_url" text,
	"audio_duration_seconds" integer,
	"audio_generated_at" timestamp with time zone,
	"personalized_for" jsonb,
	"generation_status" text DEFAULT 'pending',
	"is_stub" boolean DEFAULT false,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instructor_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "instructor_application_type" NOT NULL,
	"status" "instructor_application_status" DEFAULT 'draft' NOT NULL,
	"current_step" integer DEFAULT 1 NOT NULL,
	"full_name" text,
	"email" text,
	"phone" text,
	"specialty" text,
	"bio" text,
	"profile_image_url" text,
	"linkedin_url" text,
	"years_experience" integer,
	"education" text,
	"certifications" jsonb,
	"cv_url" text,
	"areas_expertise" jsonb,
	"teaching_experience" text,
	"quiz_score" integer,
	"quiz_attempts" integer DEFAULT 0,
	"quiz_max_attempts" integer DEFAULT 3,
	"quiz_passing_score" integer DEFAULT 70,
	"quiz_last_attempt_at" timestamp with time zone,
	"quiz_passed" boolean DEFAULT false,
	"quiz_answers" jsonb,
	"terms_accepted" boolean DEFAULT false,
	"terms_accepted_at" timestamp with time zone,
	"terms_acceptance_hash" text,
	"terms_code_of_conduct" boolean DEFAULT false,
	"terms_content_policy" boolean DEFAULT false,
	"terms_revenue_share" boolean DEFAULT false,
	"bank_name" text,
	"bank_clabe" text,
	"rfc" text,
	"fiscal_name" text,
	"fiscal_regime" text,
	"dc5_payment_method" text,
	"dc5_payment_reference" text,
	"dc5_payment_status" text,
	"dc5_tracking_number" text,
	"admin_notes" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"instructor_number" text,
	"activated_at" timestamp with time zone,
	"certificate_nft_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "instructor_applications_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "instructor_courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instructor_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"level" text,
	"duration_hours" integer,
	"certification_type" text DEFAULT 'nft',
	"status" text DEFAULT 'draft',
	"price" numeric(10, 2) DEFAULT '0',
	"is_free" boolean DEFAULT true,
	"available_for_all" boolean DEFAULT true,
	"tags" jsonb,
	"noms_related" jsonb,
	"modules" jsonb,
	"quizzes" jsonb,
	"rating" numeric(2, 1) DEFAULT '0',
	"total_students" integer DEFAULT 0,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "instructor_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"bio" text,
	"specialty" text,
	"profile_image_url" text,
	"rating" numeric(2, 1) DEFAULT '0',
	"total_students" integer DEFAULT 0,
	"total_courses" integer DEFAULT 0,
	"commission_rate" numeric(4, 2) DEFAULT '15.00',
	"bank_name" text,
	"bank_clabe" text,
	"verified" boolean DEFAULT false,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insurance_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"company_id" uuid,
	"status" "insurance_enrollment_status" DEFAULT 'pending',
	"start_date" timestamp,
	"flexible_benefit_1" text,
	"flexible_benefit_2" text,
	"monthly_amount" numeric(10, 2),
	"policy_number" text,
	"certificate_url" text,
	"personal_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "insurance_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"profile" "insurance_profile" NOT NULL,
	"profile_label" text NOT NULL,
	"tier" "insurance_tier" NOT NULL,
	"price_per_employee" numeric(10, 2) NOT NULL,
	"cobertura_dental" numeric(12, 2),
	"cobertura_vida_min" numeric(12, 2),
	"cobertura_vida_max" numeric(12, 2),
	"cobertura_accidentes" numeric(12, 2),
	"cobertura_gmm" numeric(12, 2),
	"gmm_deducible" numeric(12, 2),
	"gmm_coaseguro" numeric(5, 2),
	"has_app" boolean DEFAULT true,
	"has_telemedicine" boolean DEFAULT true,
	"provider" text DEFAULT 'Betterfly',
	"is_active" boolean DEFAULT true,
	"features" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "interacciones_prospectos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"user_id" uuid,
	"tipo" text NOT NULL,
	"notas" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" text NOT NULL,
	"contribution_id" uuid,
	"invoice_type" "invoice_type" NOT NULL,
	"facturapi_invoice_id" text,
	"cfdi_uuid" text,
	"series" text,
	"folio_number" integer,
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"total" numeric(12, 2) NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"tax" numeric(12, 2) DEFAULT '0' NOT NULL,
	"currency" text DEFAULT 'MXN' NOT NULL,
	"concept" text NOT NULL,
	"pdf_url" text,
	"xml_url" text,
	"cancelled_at" timestamp with time zone,
	"cancellation_reason" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"phone" text,
	"city" text,
	"source" text DEFAULT 'kit-cooperativo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_interests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"topics" text[] NOT NULL,
	"recommendations" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "monthly_contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" text NOT NULL,
	"period_year" integer NOT NULL,
	"period_month" integer NOT NULL,
	"plan_type" text NOT NULL,
	"umas_per_col" integer NOT NULL,
	"uma_value" numeric(10, 2) NOT NULL,
	"active_collaborators" integer NOT NULL,
	"gross_amount" numeric(12, 2) NOT NULL,
	"fee_percentage" numeric(5, 2) NOT NULL,
	"fee_amount" numeric(12, 2) NOT NULL,
	"net_to_cooperative" numeric(12, 2) NOT NULL,
	"status" "sam_status" DEFAULT 'pending' NOT NULL,
	"confirmed_at" timestamp with time zone,
	"confirmed_by" uuid,
	"confirmation_ip" text,
	"confirmation_user_agent" text,
	"confirmation_hash" text,
	"adjusted_collaborators" integer,
	"adjusted_amount" numeric(12, 2),
	"adjustment_reason" text,
	"payment_status" "sam_payment_status" DEFAULT 'unpaid' NOT NULL,
	"payment_date" timestamp with time zone,
	"payment_method" text,
	"payment_reference" text,
	"payment_receipt_url" text,
	"cfdi_uuid" text,
	"cfdi_status" "cfdi_status" DEFAULT 'pending' NOT NULL,
	"first_reminder_sent_at" timestamp with time zone,
	"second_reminder_sent_at" timestamp with time zone,
	"partner_notified_at" timestamp with time zone,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"due_date" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"company_name" varchar(200),
	"sector" varchar(100),
	"municipio" varchar(100),
	"source" varchar(50) DEFAULT 'blog',
	"status" varchar(20) DEFAULT 'active',
	"subscribed_at" timestamp DEFAULT now(),
	"unsubscribed_at" timestamp,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "org_objectives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" text NOT NULL,
	"course_id" uuid NOT NULL,
	"assigned_by" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_commissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"team_id" text NOT NULL,
	"payment_id" uuid,
	"amount" integer NOT NULL,
	"fee_percent" integer,
	"commission_percent" integer,
	"status" "commission_status" DEFAULT 'pending' NOT NULL,
	"period_month" integer NOT NULL,
	"period_year" integer NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text,
	"country" text,
	"city" text,
	"phone_number" text,
	"wallet_address" text,
	"interest" jsonb DEFAULT '[]'::jsonb,
	"genre" text,
	"socio_zone" text,
	"socio_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "prospects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"collaborators" integer,
	"plan" text,
	"stage" "prospect_stage" DEFAULT 'contact' NOT NULL,
	"notes" text,
	"next_follow_up" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"quiz_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"passed" boolean NOT NULL,
	"answers" jsonb,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" uuid NOT NULL,
	"order" integer DEFAULT 1 NOT NULL,
	"question" text NOT NULL,
	"options" text[] NOT NULL,
	"correct_index" integer NOT NULL,
	"explanation" text
);
--> statement-breakpoint
CREATE TABLE "referral_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"owner_id" uuid NOT NULL,
	"owner_type" text DEFAULT 'partner' NOT NULL,
	"label" text,
	"commission" integer DEFAULT 10 NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "referral_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "saved_filters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"filter_config" jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"job_title" text,
	"industry" text,
	"company_size" text,
	"experience_level" text,
	"learning_goals" text[] DEFAULT '{}',
	"preferred_style" text DEFAULT 'reading'
);
--> statement-breakpoint
CREATE TABLE "studio_courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"subcategory" text,
	"duration_minutes" integer DEFAULT 60,
	"level" text DEFAULT 'basico',
	"tags" text[] DEFAULT '{}',
	"dc3_available" boolean DEFAULT false,
	"icon" text,
	"color" text,
	"source" text DEFAULT 'studio',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "studio_courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "studio_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source" text DEFAULT 'studio' NOT NULL,
	"course_identifier" text NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"progress_percent" integer DEFAULT 0,
	"last_accessed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "studio_module_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"module_identifier" text NOT NULL,
	"completed" boolean DEFAULT false,
	"completed_at" timestamp with time zone,
	"quiz_score" integer,
	"time_spent_seconds" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "studio_modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"module_index" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content_html" text NOT NULL,
	"video_url" text,
	"references" text[] DEFAULT '{}',
	"duration_minutes" integer DEFAULT 15
);
--> statement-breakpoint
CREATE TABLE "studio_quizzes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"title" text NOT NULL,
	"passing_score" integer DEFAULT 70 NOT NULL,
	"questions" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"sender_role" text DEFAULT 'user' NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"subject" text NOT NULL,
	"academy_course_id" integer,
	"status" "support_thread_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "team_users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"plan" text,
	"partner_id" uuid,
	"status" text DEFAULT 'active' NOT NULL,
	"rfc" text,
	"fee_percent" numeric(5, 2),
	"contract_url" text,
	"razon_social" text,
	"regimen_fiscal" text,
	"codigo_postal_fiscal" text,
	"facturapi_customer_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "terms_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doc_type" "terms_doc_type" NOT NULL,
	"version" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"content_url" text,
	"is_blocking" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"required_for_roles" "user_role"[] DEFAULT ARRAY['user','moderator','admin','partner','superadmin','instructor']::user_role[] NOT NULL,
	"grace_period_days" integer DEFAULT 0,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_objectives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_objective_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"assigned_by" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_terms_acceptances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"terms_version_id" uuid NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"acceptance_ip" text,
	"acceptance_user_agent" text,
	"acceptance_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text DEFAULT 'supabase-managed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"type" text NOT NULL,
	"amount" integer NOT NULL,
	"description" text,
	"reference_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_referred_by_accounts_referral_code_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."accounts"("referral_code") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievement_users" ADD CONSTRAINT "achievement_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievement_users" ADD CONSTRAINT "achievement_users_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_request_logs" ADD CONSTRAINT "api_request_logs_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate_requests" ADD CONSTRAINT "certificate_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate_requests" ADD CONSTRAINT "certificate_requests_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate_requests" ADD CONSTRAINT "certificate_requests_achievement_user_id_achievement_users_id_fk" FOREIGN KEY ("achievement_user_id") REFERENCES "public"."achievement_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_payments" ADD CONSTRAINT "company_payments_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_payments" ADD CONSTRAINT "company_payments_confirmed_by_users_id_fk" FOREIGN KEY ("confirmed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_wallets" ADD CONSTRAINT "company_wallets_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_groups" ADD CONSTRAINT "contact_groups_assigned_socio_id_users_id_fk" FOREIGN KEY ("assigned_socio_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contactos_prospectos" ADD CONSTRAINT "contactos_prospectos_empresa_id_empresas_prospectos_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas_prospectos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contribution_audit_log" ADD CONSTRAINT "contribution_audit_log_contribution_id_monthly_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."monthly_contributions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cooperative_memberships" ADD CONSTRAINT "cooperative_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cooperative_memberships" ADD CONSTRAINT "cooperative_memberships_admission_approved_by_users_id_fk" FOREIGN KEY ("admission_approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_quizzes" ADD CONSTRAINT "course_quizzes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_users" ADD CONSTRAINT "course_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_users" ADD CONSTRAINT "course_users_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispersions" ADD CONSTRAINT "dispersions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empresas_prospectos" ADD CONSTRAINT "empresas_prospectos_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enriquecimiento" ADD CONSTRAINT "enriquecimiento_empresa_id_empresas_prospectos_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas_prospectos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_applications" ADD CONSTRAINT "instructor_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_applications" ADD CONSTRAINT "instructor_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_courses" ADD CONSTRAINT "instructor_courses_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_profiles" ADD CONSTRAINT "instructor_profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_enrollments" ADD CONSTRAINT "insurance_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_enrollments" ADD CONSTRAINT "insurance_enrollments_plan_id_insurance_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."insurance_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interacciones_prospectos" ADD CONSTRAINT "interacciones_prospectos_empresa_id_empresas_prospectos_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas_prospectos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interacciones_prospectos" ADD CONSTRAINT "interacciones_prospectos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_contribution_id_monthly_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."monthly_contributions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_interests" ADD CONSTRAINT "learning_interests_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_contributions" ADD CONSTRAINT "monthly_contributions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_contributions" ADD CONSTRAINT "monthly_contributions_confirmed_by_users_id_fk" FOREIGN KEY ("confirmed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_objectives" ADD CONSTRAINT "org_objectives_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_objectives" ADD CONSTRAINT "org_objectives_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_objectives" ADD CONSTRAINT "org_objectives_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_commissions" ADD CONSTRAINT "partner_commissions_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_commissions" ADD CONSTRAINT "partner_commissions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_commissions" ADD CONSTRAINT "partner_commissions_payment_id_company_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."company_payments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_course_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."course_quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_course_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."course_quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_filters" ADD CONSTRAINT "saved_filters_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_enrollments" ADD CONSTRAINT "studio_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_module_progress" ADD CONSTRAINT "studio_module_progress_enrollment_id_studio_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."studio_enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_modules" ADD CONSTRAINT "studio_modules_course_id_studio_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."studio_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_quizzes" ADD CONSTRAINT "studio_quizzes_course_id_studio_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."studio_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_thread_id_support_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."support_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_threads" ADD CONSTRAINT "support_threads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_users" ADD CONSTRAINT "team_users_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_users" ADD CONSTRAINT "team_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "terms_versions" ADD CONSTRAINT "terms_versions_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_objectives" ADD CONSTRAINT "user_objectives_org_objective_id_org_objectives_id_fk" FOREIGN KEY ("org_objective_id") REFERENCES "public"."org_objectives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_objectives" ADD CONSTRAINT "user_objectives_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_objectives" ADD CONSTRAINT "user_objectives_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_terms_acceptances" ADD CONSTRAINT "user_terms_acceptances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_terms_acceptances" ADD CONSTRAINT "user_terms_acceptances_terms_version_id_terms_versions_id_fk" FOREIGN KEY ("terms_version_id") REFERENCES "public"."terms_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_company_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."company_wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_academy_cache_academy_id" ON "academy_courses_cache" USING btree ("academy_id");--> statement-breakpoint
CREATE INDEX "idx_academy_cache_status" ON "academy_courses_cache" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_academy_curriculum_cache_id" ON "academy_curriculum_cache" USING btree ("academy_id");--> statement-breakpoint
CREATE INDEX "idx_accounts_referred_by" ON "accounts" USING btree ("referred_by");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_achievement_users_cert" ON "achievement_users" USING btree ("user_id","achievement_id","cert_type");--> statement-breakpoint
CREATE INDEX "idx_achievement_users_user_id" ON "achievement_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_achievement_users_achievement_id" ON "achievement_users" USING btree ("achievement_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_api_keys_prefix" ON "api_keys" USING btree ("key_prefix");--> statement-breakpoint
CREATE INDEX "idx_api_keys_active" ON "api_keys" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_api_request_logs_key" ON "api_request_logs" USING btree ("api_key_id");--> statement-breakpoint
CREATE INDEX "idx_api_request_logs_created" ON "api_request_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "blog_posts_category_idx" ON "blog_posts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "blog_posts_status_idx" ON "blog_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "blog_posts_published_at_idx" ON "blog_posts" USING btree ("published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_cert_request" ON "certificate_requests" USING btree ("user_id","course_id","cert_type");--> statement-breakpoint
CREATE INDEX "idx_cert_request_user" ON "certificate_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_cert_request_status" ON "certificate_requests" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_chat_sessions_user_course_module" ON "chat_sessions" USING btree ("user_id","course_slug","module_index");--> statement-breakpoint
CREATE INDEX "idx_chat_sessions_user" ON "chat_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_company_payments_team" ON "company_payments" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_company_payments_period" ON "company_payments" USING btree ("period_year","period_month");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_company_wallets_team_type" ON "company_wallets" USING btree ("team_id","wallet_type");--> statement-breakpoint
CREATE INDEX "idx_contactos_empresa" ON "contactos_prospectos" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "idx_contribution_audit_log_contribution" ON "contribution_audit_log" USING btree ("contribution_id");--> statement-breakpoint
CREATE INDEX "idx_membership_user" ON "cooperative_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_membership_number" ON "cooperative_memberships" USING btree ("membership_number");--> statement-breakpoint
CREATE INDEX "idx_membership_status" ON "cooperative_memberships" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_course_modules_course_id" ON "course_modules" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_course_quizzes_course_id" ON "course_quizzes" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_course_users" ON "course_users" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "idx_course_users_user_id" ON "course_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_course_users_course_id" ON "course_users" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_empresas_prospectos_denue" ON "empresas_prospectos" USING btree ("denue_id");--> statement-breakpoint
CREATE INDEX "idx_empresas_prospectos_municipio" ON "empresas_prospectos" USING btree ("municipio");--> statement-breakpoint
CREATE INDEX "idx_empresas_prospectos_scian" ON "empresas_prospectos" USING btree ("codigo_scian");--> statement-breakpoint
CREATE INDEX "idx_empresas_prospectos_score" ON "empresas_prospectos" USING btree ("lead_score");--> statement-breakpoint
CREATE INDEX "idx_empresas_prospectos_stage" ON "empresas_prospectos" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "idx_empresas_prospectos_partner" ON "empresas_prospectos" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "idx_empresas_prospectos_geo" ON "empresas_prospectos" USING btree ("latitud","longitud");--> statement-breakpoint
CREATE INDEX "idx_enriquecimiento_empresa" ON "enriquecimiento" USING btree ("empresa_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_generated_content_user_course_module" ON "generated_content" USING btree ("user_id","course_slug","module_index");--> statement-breakpoint
CREATE INDEX "idx_generated_content_user" ON "generated_content" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_instructor_app_user" ON "instructor_applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_instructor_app_status" ON "instructor_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_instructor_app_type" ON "instructor_applications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "enrollments_user_idx" ON "insurance_enrollments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "enrollments_plan_idx" ON "insurance_enrollments" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "enrollments_status_idx" ON "insurance_enrollments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_interacciones_empresa" ON "interacciones_prospectos" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_team" ON "invoices" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_contribution" ON "invoices" USING btree ("contribution_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_status" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_learning_interests_user" ON "learning_interests" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_monthly_contributions_period" ON "monthly_contributions" USING btree ("team_id","period_year","period_month");--> statement-breakpoint
CREATE INDEX "idx_monthly_contributions_team" ON "monthly_contributions" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_monthly_contributions_period" ON "monthly_contributions" USING btree ("period_year","period_month");--> statement-breakpoint
CREATE INDEX "idx_monthly_contributions_status" ON "monthly_contributions" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_org_objectives" ON "org_objectives" USING btree ("team_id","course_id");--> statement-breakpoint
CREATE INDEX "idx_org_objectives_team_id" ON "org_objectives" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_partner_commissions_partner" ON "partner_commissions" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "idx_partner_commissions_period" ON "partner_commissions" USING btree ("period_year","period_month");--> statement-breakpoint
CREATE INDEX "idx_profiles_wallet_address" ON "profiles" USING btree ("wallet_address");--> statement-breakpoint
CREATE INDEX "idx_prospects_partner" ON "prospects" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "idx_prospects_stage" ON "prospects" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "idx_quiz_attempts_user_id" ON "quiz_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_quiz_attempts_quiz_id" ON "quiz_attempts" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "idx_quiz_questions_quiz_id" ON "quiz_questions" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "idx_referral_codes_owner_id" ON "referral_codes" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_student_profiles_user" ON "student_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_studio_enrollments_user_source_course" ON "studio_enrollments" USING btree ("user_id","source","course_identifier");--> statement-breakpoint
CREATE INDEX "idx_studio_enrollments_user" ON "studio_enrollments" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_studio_module_progress_enrollment_module" ON "studio_module_progress" USING btree ("enrollment_id","module_identifier");--> statement-breakpoint
CREATE INDEX "idx_studio_module_progress_enrollment" ON "studio_module_progress" USING btree ("enrollment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_studio_modules_course_index" ON "studio_modules" USING btree ("course_id","module_index");--> statement-breakpoint
CREATE INDEX "idx_studio_modules_course_id" ON "studio_modules" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_studio_quizzes_course" ON "studio_quizzes" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_support_messages_thread" ON "support_messages" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "idx_support_threads_user" ON "support_threads" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_team_users" ON "team_users" USING btree ("team_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_team_users_team_id" ON "team_users" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_team_users_user_id" ON "team_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_terms_versions_doc_type" ON "terms_versions" USING btree ("doc_type");--> statement-breakpoint
CREATE INDEX "idx_terms_versions_active" ON "terms_versions" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_objectives" ON "user_objectives" USING btree ("org_objective_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_user_objectives_user_id" ON "user_objectives" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_objectives_org_obj_id" ON "user_objectives" USING btree ("org_objective_id");--> statement-breakpoint
CREATE INDEX "idx_user_terms_user" ON "user_terms_acceptances" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_terms_version" ON "user_terms_acceptances" USING btree ("terms_version_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_terms_unique" ON "user_terms_acceptances" USING btree ("user_id","terms_version_id");--> statement-breakpoint
CREATE INDEX "idx_wallet_transactions_wallet" ON "wallet_transactions" USING btree ("wallet_id");
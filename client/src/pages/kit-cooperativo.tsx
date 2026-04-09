import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import { useForceLightMode } from "@/components/ThemeProvider";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { insertLeadSchema } from "@shared/schema";
import {
  ArrowRight,
  Check,
  X,
  GraduationCap,
  ShieldCheck,
  Building2,
  Users,
  Wallet,
  BookOpen,
  Award,
  FileText,
  Calculator,
  BarChart3,
  Heart,
  Briefcase,
  Scale,
  CheckCircle2,
  Download,
  Loader2,
  AlertTriangle,
  Eye,
  Ban,
  Stamp,
  Mail,
  Lock,
  Bot,
  Shield,
  Brain,
  Sparkles,
  FileCheck,
  Layers,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeUp}
      custom={0}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function KitCooperativo() {
  useForceLightMode();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    phone: "",
    city: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const leadMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        company: data.company || null,
        phone: data.phone || null,
        city: data.city || null,
        source: "kit-cooperativo" as const,
      };
      const parsed = insertLeadSchema.safeParse(payload);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      await apiRequest("POST", "/api/leads", payload);
    },
    onSuccess: () => setSubmitted(true),
    onError: () => toast({ title: "Error", description: "No se pudo enviar tu solicitud. Intenta de nuevo.", variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      toast({ title: "Campos requeridos", description: "Nombre y correo son obligatorios.", variant: "destructive" });
      return;
    }
    leadMutation.mutate(formData);
  };

  const painPoints = [
    "Pagar capacitaciones caras que nadie termina ni recuerda",
    "No cumplir con la NOM-035 ni las obligaciones de capacitación de la LFT",
    "Invertir en cursos sin deducibilidad fiscal real",
    "Tener miedo a que el SAT detecte operaciones simuladas con su IA",
    "No saber si tus facturas de capacitación aguantan una auditoría fiscal",
    "No tener un plan de capacitación STPS estructurado",
    "Gastar en consultorías que no se traducen en certificaciones válidas",
    "No poder comprobar ante auditorías tus inversiones en formación",
    "Depender de proveedores de capacitación sin registro STPS",
    "Arriesgar la cancelación de tus sellos digitales por irregularidades",
    "Pagar ISR completo sin aprovechar los beneficios cooperativistas",
    "No tener certeza legal de que tu esquema fiscal es 100% lícito",
  ];

  const steps = [
    { icon: Building2, title: "Tu empresa se afilia", desc: "Se integra como empresa patrocinadora de la cooperativa. Proceso simple, 100% digital." },
    { icon: Users, title: "Trabajadores se inscriben", desc: "Tu equipo accede a los 29 cursos STPS, los 49 cursos con Tutor IA y toda la oferta formativa como socios cooperativistas." },
    { icon: Brain, title: "Tutor IA personaliza su aprendizaje", desc: "El Tutor IA adapta cada curso al puesto, industria y experiencia de cada trabajador. Contenido generado con inteligencia artificial." },
    { icon: Award, title: "Certifican y deducen", desc: "3 niveles: Diploma NFT gratis, Constancia DC-3 STPS ($499) y Certificado SEP ($1,999). 100% deducible con CFDI." },
  ];

  const benefitsEmpresas = [
    { icon: Scale, title: "100% Deducible de Impuestos", desc: "Todas las aportaciones a la cooperativa son deducibles con CFDI válido. Reduce tu carga fiscal de manera legal y comprobable." },
    { icon: ShieldCheck, title: "Cumplimiento Normativo", desc: "Cumple con la LFT Art. 132 y 153, NOM-035, NOM-036 y demás obligaciones de capacitación y seguridad laboral." },
    { icon: BookOpen, title: "29 Cursos STPS + 49 con Tutor IA", desc: "Catálogo de 29 cursos registrados STPS con constancias DC-3, más 49 cursos personalizados con inteligencia artificial. 78 cursos en total." },
    { icon: Layers, title: "3 Niveles de Certificación", desc: "Diploma Digital NFT gratis verificable en blockchain. Constancia DC-3 STPS por $499 MXN. Certificado con validez oficial SEP por $1,999 MXN." },
    { icon: Brain, title: "Tutor IA Personalizado", desc: "Cada trabajador recibe contenido adaptado a su puesto, industria y nivel de experiencia con inteligencia artificial (Claude). Lectura, mapa mental, quiz y chat con IA." },
    { icon: BarChart3, title: "Dashboard Empresarial", desc: "Panel de control con avance de equipos, certificaciones obtenidas, y reportes de cumplimiento normativo en tiempo real." },
  ];

  const benefitsTrabajadores = [
    { icon: GraduationCap, title: "Acceso a 78 Cursos", desc: "29 cursos STPS registrados y 49 cursos con Tutor IA personalizados. Sin costo directo para el trabajador." },
    { icon: Sparkles, title: "Tutor IA Personal", desc: "Un tutor de inteligencia artificial que adapta cada lección a tu puesto, industria y experiencia. Pregúntale lo que necesites en el chat." },
    { icon: FileCheck, title: "3 Certificaciones", desc: "Diploma Digital NFT gratis al aprobar. Constancia DC-3 STPS ($499) y Certificado SEP ($1,999) opcionales con validez oficial." },
    { icon: Heart, title: "Incentivos y Becas", desc: "Bonos, incentivos y becas educativas por cumplir objetivos de aprendizaje como socio cooperativista." },
    { icon: Wallet, title: "Finanzas Digitales", desc: "Acceso a monederos electrónicos, tarjetas de gastos y dispersión de fondos vía blockchain." },
    { icon: Users, title: "Comunidad Cooperativa", desc: "Pertenecer a una sociedad cooperativa respaldada legalmente por la LGSC, con representación y seguridad social." },
  ];

  const fiscalRisks = [
    { icon: Bot, title: "SAT con Inteligencia Artificial", desc: "Desde 2024 el SAT usa machine learning y big data para cruzar CFDI, detectar patrones de operaciones simuladas (EFOS/EDOS) y señalar discrepancias en tiempo real. Ya no se puede esconder detrás del volumen." },
    { icon: Ban, title: "Art. 69-B del CFF — Lista Negra", desc: "Las empresas que usan facturas de EFOS (Empresas que Facturan Operaciones Simuladas) enfrentan presunción de operaciones inexistentes. La carga de la prueba recae en el contribuyente. Multas, recargos y créditos fiscales millonarios." },
    { icon: Lock, title: "Defraudación Fiscal Equiparada", desc: "Desde la reforma de 2020, las operaciones simuladas se persiguen como delincuencia organizada con prisión preventiva oficiosa. Aplica tanto al EFOS como a la empresa que deduce (EDOS). No hay fianza." },
    { icon: Stamp, title: "CFDI 4.0 y Validación en Tiempo Real", desc: "Cada factura debe coincidir en RFC, nombre, régimen fiscal y código postal. El SAT cruza datos automáticamente. Errores = rechazo = gasto no deducible. Tu proveedor de capacitación debe cumplir al 100%." },
    { icon: Mail, title: "Buzón Tributario Obligatorio", desc: "El buzón tributario ya es obligatorio para todas las personas morales. El SAT envía notificaciones automatizadas de auditoría. No revisarlo equivale a consentir lo que te notifiquen." },
    { icon: Eye, title: "Cancelación de Sellos Digitales (CSD)", desc: "Si el SAT detecta irregularidades en tus operaciones, puede restringir o cancelar tus sellos digitales — congelando tu capacidad de facturar. Recuperarlos puede tomar meses." },
  ];

  const legalSafety = [
    { icon: Scale, title: "Respaldo Legal Sólido", desc: "El modelo cooperativista está respaldado por la LGSC (Ley General de Sociedades Cooperativas) y la LISR Art. 27 fracción XI que establece la deducibilidad de aportaciones a cooperativas. No es un esquema agresivo — es ley vigente." },
    { icon: Stamp, title: "CFDI Válido y Auditable", desc: "Cada aportación de tu empresa genera un CFDI emitido por una sociedad cooperativa legalmente constituida. Cumple con CFDI 4.0, complemento de pago y todos los requisitos del SAT." },
    { icon: ShieldCheck, title: "Cursos con Registro STPS Verificable", desc: "Los 29 cursos tienen registro oficial ante la STPS con instructores certificados. Las constancias DC-3 son verificables y auditables. Sustancia económica real, no simulación." },
    { icon: Award, title: "Trazabilidad Blockchain Inmutable", desc: "Cada diploma digital se registra en blockchain, creando un rastro de auditoría infalsificable. Si el SAT pregunta, tienes evidencia verificable de que la capacitación realmente ocurrió." },
  ];

  const kitContents = [
    { icon: FileText, text: "Guía completa del modelo cooperativista educativo" },
    { icon: AlertTriangle, text: "Análisis de la reforma fiscal 2026 y riesgos ante el SAT con IA" },
    { icon: Scale, text: "Fundamento legal: LISR, LGSC, LFT y jurisprudencia" },
    { icon: Shield, text: "Guía de cumplimiento fiscal ante auditorías del SAT" },
    { icon: Calculator, text: "Calculadora de ahorro fiscal por aportaciones" },
    { icon: BookOpen, text: "Catálogo de 29 cursos STPS + 49 cursos Tutor IA" },
    { icon: Layers, text: "Guía de los 3 niveles de certificación (NFT, DC-3, SEP)" },
    { icon: BarChart3, text: "Comparativa de costos: capacitación tradicional vs. cooperativa" },
    { icon: Brain, text: "Demo del Tutor IA y cómo personaliza el aprendizaje" },
    { icon: Briefcase, text: "Guía de implementación paso a paso" },
  ];

  return (
    <div className="min-h-screen bg-cedu-cream overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cedu-cream/85 backdrop-blur-xl border-b border-black/[0.06] shadow-sm" data-testid="navbar-kit">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0" data-testid="link-logo-kit">
            <div className="w-9 h-9 bg-cedu-blue rounded-[10px] flex items-center justify-center text-white font-serif text-xl">C</div>
            <div className="font-serif text-2xl text-cedu-ink tracking-tight" translate="no">Cedu<em className="text-cedu-blue not-italic italic">verse</em></div>
          </Link>
          <Button onClick={scrollToForm} className="bg-cedu-orange hover:bg-cedu-orange/90 text-white rounded-full px-4 sm:px-6 text-xs sm:text-sm font-semibold shrink-0" data-testid="button-hero-cta-nav">
            <span className="hidden sm:inline">Descargar Kit Gratis</span>
            <span className="sm:hidden">Kit Gratis</span>
          </Button>
        </div>
      </nav>

      <section className="pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6" data-testid="section-hero-kit">
        <div className="max-w-[900px] mx-auto text-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 rounded-full mb-6" data-testid="badge-kit">
              <AlertTriangle size={14} className="shrink-0" />
              <span>Reforma Fiscal 2026 + SAT con IA</span>
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-[52px] leading-[1.1] text-cedu-ink mb-6" data-testid="text-hero-heading">
              ¿Tu empresa invierte en capacitación<br className="hidden md:block" /> sin deducir un solo peso?
            </h1>
          </AnimatedSection>
          <AnimatedSection>
            <p className="text-base sm:text-lg md:text-xl text-cedu-ink-muted max-w-[700px] mx-auto mb-8 leading-relaxed" data-testid="text-hero-subheading">
              Con la <strong>reforma fiscal 2026</strong> y el <strong>SAT usando inteligencia artificial</strong>, tu empresa necesita un modelo de capacitación que sea 100% legal, deducible y auditable. Descarga gratis el Kit que explica cómo el modelo cooperativista te protege — con <strong>78 cursos</strong>, <strong>Tutor IA personalizado</strong>, <strong>3 niveles de certificación</strong> y CFDI válido.
            </p>
          </AnimatedSection>
          <AnimatedSection>
            <Button
              onClick={scrollToForm}
              size="lg"
              className="bg-cedu-orange hover:bg-cedu-orange/90 text-white rounded-full px-6 sm:px-10 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              data-testid="button-hero-cta"
            >
              DESCARGAR KIT GRATIS <ArrowRight className="ml-2" size={20} />
            </Button>
            <p className="text-sm text-cedu-ink-soft mt-4">Sin spam. El PDF llega a tu correo en 30 segundos.</p>
          </AnimatedSection>
          <AnimatedSection>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-3 sm:gap-6 mt-10">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-cedu-ink" data-testid="stat-deducible">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0"><Check size={14} className="text-green-600" /></div>
                100% Deducible
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-cedu-ink" data-testid="stat-cursos">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0"><BookOpen size={14} className="text-cedu-blue" /></div>
                78 Cursos
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-cedu-ink" data-testid="stat-tutor-ia">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-violet-100 rounded-full flex items-center justify-center shrink-0"><Brain size={14} className="text-cedu-violet" /></div>
                Tutor IA
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-cedu-ink" data-testid="stat-blockchain">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0"><Award size={14} className="text-cedu-orange" /></div>
                Diplomas NFT
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white" data-testid="section-pain-points">
        <div className="max-w-[900px] mx-auto">
          <AnimatedSection>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-cedu-ink text-center mb-8 sm:mb-12" data-testid="text-pain-heading">¿Te suena familiar?</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-3">
            {painPoints.map((point, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.5}
                className="flex items-start gap-3 p-3 rounded-xl"
                data-testid={`pain-point-${i}`}
              >
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X size={14} className="text-red-500" />
                </div>
                <span className="text-cedu-ink-muted text-[15px] leading-relaxed">{point}</span>
              </motion.div>
            ))}
          </div>
          <AnimatedSection>
            <p className="text-center mt-10 text-cedu-blue font-semibold text-lg">
              Con el modelo cooperativista de Ceduverse, tu empresa capacita, deduce y certifica — todo en uno.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-cedu-violet/5 to-cedu-blue/5" data-testid="section-tutor-ia">
        <div className="max-w-[1060px] mx-auto">
          <AnimatedSection>
            <div className="text-xs font-extrabold uppercase tracking-[3px] text-cedu-violet text-center mb-3">Nuevo: Tutor IA</div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-cedu-ink text-center mb-4" data-testid="text-tutor-ia-heading">
              49 cursos personalizados con inteligencia artificial
            </h2>
            <p className="text-center text-cedu-ink-muted text-base sm:text-lg max-w-[700px] mx-auto mb-10 sm:mb-14 leading-relaxed">
              Además de los 29 cursos STPS tradicionales, Ceduverse incluye <strong>49 cursos con Tutor IA</strong> que se adaptan en tiempo real al puesto, industria y experiencia de cada trabajador. Contenido único para cada persona.
            </p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Brain, color: "cedu-violet", title: "Contenido Personalizado", desc: "El Tutor IA genera lecturas de 3,000 a 5,000 palabras adaptadas al contexto profesional de cada trabajador. No es contenido genérico — es específico para tu industria." },
              { icon: Sparkles, color: "cedu-blue", title: "Chat con IA en Cada Módulo", desc: "Los trabajadores pueden hacer preguntas al Tutor IA sobre el contenido, pedir ejemplos de su industria o aclarar normatividad. Respuestas personalizadas en segundos." },
              { icon: Layers, color: "cedu-orange", title: "Quiz, Mapa Mental y Fuentes", desc: "Cada módulo genera automáticamente quiz adaptativo (7 preguntas), mapa mental interactivo y fuentes de consulta verificadas. Aprendizaje completo e integral." },
            ].map((item, i) => (
              <AnimatedSection key={i}>
                <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm h-full" data-testid={`tutor-ia-feature-${i}`}>
                  <div className={`w-12 h-12 bg-${item.color}/10 rounded-xl flex items-center justify-center mb-4`}>
                    <item.icon size={24} className={`text-${item.color}`} />
                  </div>
                  <h3 className="font-semibold text-cedu-ink text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-cedu-ink-muted leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection>
            <div className="text-center mt-12">
              <p className="text-cedu-violet font-semibold text-lg mb-4">
                3 instructores certificados · 49 cursos IA · Personalización por puesto e industria
              </p>
              <Button onClick={scrollToForm} className="bg-cedu-violet hover:bg-cedu-violet/90 text-white rounded-full px-6 sm:px-8 w-full sm:w-auto text-sm sm:text-base whitespace-normal text-center leading-tight" data-testid="button-tutor-ia-cta">
                <span>DESCARGAR KIT CON DEMO DEL TUTOR IA</span> <ArrowRight className="ml-2 shrink-0" size={16} />
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white" data-testid="section-certification-tiers">
        <div className="max-w-[1060px] mx-auto">
          <AnimatedSection>
            <div className="text-xs font-extrabold uppercase tracking-[3px] text-cedu-green text-center mb-3">Certificaciones</div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-cedu-ink text-center mb-4" data-testid="text-cert-heading">
              3 niveles de certificación para tu equipo
            </h2>
            <p className="text-center text-cedu-ink-muted text-base sm:text-lg max-w-[700px] mx-auto mb-10 sm:mb-14 leading-relaxed">
              Cada trabajador elige el nivel de certificación que necesita. Desde el diploma digital gratuito hasta el certificado con validez oficial SEP.
            </p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            <AnimatedSection>
              <div className="rounded-2xl p-6 border border-green-200 bg-green-50/30 h-full" data-testid="cert-diploma">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Award size={24} className="text-green-600" />
                </div>
                <div className="text-green-600 font-bold text-sm mb-1">Nivel 1</div>
                <h3 className="font-serif text-xl text-cedu-ink mb-1">Diploma Digital NFT</h3>
                <div className="text-2xl font-bold text-green-600 mb-3">Gratis</div>
                <p className="text-sm text-cedu-ink-muted leading-relaxed mb-4">
                  Se emite automáticamente al aprobar el quiz del curso. Verificable en blockchain. Validez curricular.
                </p>
                <ul className="space-y-2">
                  {["Auto-emitido al aprobar", "Verificable en blockchain", "Formato digital NFT", "Validez curricular", "Sin costo adicional"].map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-cedu-ink-muted">
                      <CheckCircle2 size={14} className="text-green-500" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
            <AnimatedSection>
              <div className="rounded-2xl p-6 border-2 border-amber-400 bg-amber-50/30 shadow-lg ring-2 ring-amber-200/30 h-full relative" data-testid="cert-dc3">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full">Más solicitado</div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <FileCheck size={24} className="text-amber-600" />
                </div>
                <div className="text-amber-600 font-bold text-sm mb-1">Nivel 2</div>
                <h3 className="font-serif text-xl text-cedu-ink mb-1">Constancia DC-3 STPS</h3>
                <div className="text-2xl font-bold text-cedu-ink mb-3">$499 <span className="text-sm font-normal text-cedu-ink-muted">MXN</span></div>
                <p className="text-sm text-cedu-ink-muted leading-relaxed mb-4">
                  Constancia de habilidades laborales con validez ante la STPS. Emitida por instructor certificado con registro oficial.
                </p>
                <ul className="space-y-2">
                  {["Validez oficial STPS", "Instructor con registro STPS", "Formato DC-3 oficial", "Auditable por autoridades", "Cumple LFT Art. 153"].map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-cedu-ink-muted">
                      <CheckCircle2 size={14} className="text-amber-500" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
            <AnimatedSection>
              <div className="rounded-2xl p-6 border border-blue-200 bg-blue-50/30 h-full" data-testid="cert-sep">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <GraduationCap size={24} className="text-blue-600" />
                </div>
                <div className="text-blue-600 font-bold text-sm mb-1">Nivel 3</div>
                <h3 className="font-serif text-xl text-cedu-ink mb-1">Certificado SEP</h3>
                <div className="text-2xl font-bold text-cedu-ink mb-3">$1,999 <span className="text-sm font-normal text-cedu-ink-muted">MXN</span></div>
                <p className="text-sm text-cedu-ink-muted leading-relaxed mb-4">
                  Certificado con validez oficial de la Secretaría de Educación Pública. Emitido por institución educativa acreditada (INEC).
                </p>
                <ul className="space-y-2">
                  {["Validez oficial SEP", "Emitido por INEC", "Reconocimiento nacional", "Válido para trámites oficiales", "Acredita competencias profesionales"].map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-cedu-ink-muted">
                      <CheckCircle2 size={14} className="text-blue-500" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#0f172a]" data-testid="section-reforma-fiscal">
        <div className="max-w-[1060px] mx-auto">
          <AnimatedSection>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 text-xs font-extrabold uppercase tracking-[2px] sm:tracking-[3px] px-3 sm:px-4 py-1.5 rounded-full">
                <AlertTriangle size={14} />
                Alerta Fiscal 2026
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white text-center mb-4" data-testid="text-reforma-heading">
              Reforma Fiscal 2026: Lo que tu contador debe saber
            </h2>
            <p className="text-center text-gray-400 text-base sm:text-lg max-w-[700px] mx-auto mb-10 sm:mb-14 leading-relaxed">
              El SAT ya usa inteligencia artificial para detectar irregularidades. Si tu modelo de capacitación no es transparente y legal, estás en riesgo. Estos son los cambios que afectan directamente a tu empresa:
            </p>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {fiscalRisks.map((risk, i) => (
              <AnimatedSection key={i}>
                <div className="bg-white/[0.05] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.08] hover:border-red-500/30 transition-colors" data-testid={`fiscal-risk-${i}`}>
                  <div className="w-12 h-12 bg-red-500/15 rounded-xl flex items-center justify-center mb-4">
                    <risk.icon size={24} className="text-red-400" />
                  </div>
                  <h3 className="font-semibold text-white text-lg mb-2">{risk.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{risk.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection>
            <div className="mt-10 sm:mt-14 bg-red-500/10 border border-red-500/20 rounded-2xl p-5 sm:p-8 text-center" data-testid="div-fiscal-cta">
              <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-red-400" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-white mb-3">¿Tu modelo de capacitación actual aguanta una auditoría del SAT?</h3>
              <p className="text-gray-400 mb-6 max-w-[500px] mx-auto leading-relaxed text-sm sm:text-base">
                Si no puedes demostrar con CFDI, registros STPS y evidencia verificable que tu capacitación es real, el SAT con IA lo va a detectar.
              </p>
              <Button
                onClick={scrollToForm}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-base font-bold w-full sm:w-auto"
                data-testid="button-fiscal-cta"
              >
                Descarga el Kit y Protege tu Empresa <ArrowRight className="ml-2 shrink-0" size={18} />
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-green-50/50" data-testid="section-legal-safety">
        <div className="max-w-[1060px] mx-auto">
          <AnimatedSection>
            <div className="text-xs font-extrabold uppercase tracking-[2px] sm:tracking-[3px] text-green-700 text-center mb-3">Tranquilidad Legal</div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-cedu-ink text-center mb-4" data-testid="text-safety-heading">
              ¿Por qué el modelo cooperativista de Ceduverse es seguro?
            </h2>
            <p className="text-center text-cedu-ink-muted text-base sm:text-lg max-w-[700px] mx-auto mb-10 sm:mb-14 leading-relaxed">
              A diferencia de esquemas fiscales agresivos, el modelo cooperativista educativo tiene fundamento legal explícito. No es elusión ni simulación — es ley vigente.
            </p>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-6">
            {legalSafety.map((item, i) => (
              <AnimatedSection key={i}>
                <div className="bg-white rounded-2xl p-6 border border-green-200/60 shadow-sm" data-testid={`legal-safety-${i}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon size={24} className="text-green-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-cedu-ink text-lg mb-1">{item.title}</h3>
                      <p className="text-sm text-cedu-ink-muted leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection>
            <div className="text-center mt-12">
              <p className="text-green-800 font-semibold text-lg mb-4">
                Con Ceduverse, cada peso que inviertes en capacitación tiene respaldo legal, CFDI y evidencia blockchain.
              </p>
              <Button onClick={scrollToForm} variant="outline" className="rounded-full px-6 sm:px-8 border-green-700 text-green-700 hover:bg-green-700 hover:text-white w-full sm:w-auto text-sm sm:text-base whitespace-normal text-center leading-tight" data-testid="button-safety-cta">
                <span>DESCARGAR KIT Y CONOCER EL MODELO</span> <ArrowRight className="ml-2 shrink-0" size={16} />
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 sm:px-6" data-testid="section-explanation">
        <div className="max-w-[900px] mx-auto">
          <AnimatedSection>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-cedu-ink text-center mb-4" data-testid="text-explanation-heading">
              Ceduverse no es solo una plataforma de cursos.
            </h2>
            <p className="text-center text-cedu-ink-muted text-base sm:text-lg max-w-[700px] mx-auto mb-10 sm:mb-14 leading-relaxed">
              Es un modelo cooperativista educativo respaldado por la LGSC, la LISR y la LFT que permite a las empresas invertir en la capacitación de su equipo con beneficios fiscales reales, certificaciones STPS válidas, <strong>Tutor IA personalizado</strong> y tecnología blockchain.
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((step, i) => (
              <AnimatedSection key={i}>
                <div className="text-center" data-testid={`step-${i}`}>
                  <div className="w-14 h-14 bg-cedu-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <step.icon size={28} className="text-cedu-blue" />
                  </div>
                  <div className="text-cedu-orange font-bold text-sm mb-1">{i + 1}</div>
                  <h3 className="font-semibold text-cedu-ink mb-2">{step.title}</h3>
                  <p className="text-sm text-cedu-ink-muted leading-relaxed">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection>
            <div className="text-center mt-12">
              <Button onClick={scrollToForm} variant="outline" className="rounded-full px-6 sm:px-8 border-cedu-blue text-cedu-blue hover:bg-cedu-blue hover:text-white w-full sm:w-auto text-sm sm:text-base whitespace-normal text-center leading-tight" data-testid="button-cta-mid">
                <span>DESCARGAR EL KIT Y CONOCER MÁS</span> <ArrowRight className="ml-2 shrink-0" size={16} />
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white" data-testid="section-benefits-empresas">
        <div className="max-w-[1060px] mx-auto">
          <AnimatedSection>
            <div className="text-xs font-extrabold uppercase tracking-[2px] sm:tracking-[3px] text-cedu-orange text-center mb-3">Para Empresas</div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-cedu-ink text-center mb-8 sm:mb-12">Beneficios para tu organización</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefitsEmpresas.map((b, i) => (
              <AnimatedSection key={i}>
                <div className="bg-cedu-cream rounded-2xl p-6 border border-black/[0.04] h-full" data-testid={`benefit-empresa-${i}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-cedu-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <b.icon size={24} className="text-cedu-blue" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-cedu-ink text-lg mb-1">{b.title}</h3>
                      <p className="text-sm text-cedu-ink-muted leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 sm:px-6" data-testid="section-benefits-trabajadores">
        <div className="max-w-[1060px] mx-auto">
          <AnimatedSection>
            <div className="text-xs font-extrabold uppercase tracking-[2px] sm:tracking-[3px] text-cedu-orange text-center mb-3">Para Trabajadores</div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-cedu-ink text-center mb-8 sm:mb-12">Beneficios para los socios cooperativistas</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefitsTrabajadores.map((b, i) => (
              <AnimatedSection key={i}>
                <div className="bg-white rounded-2xl p-6 border border-black/[0.04] h-full" data-testid={`benefit-trabajador-${i}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-cedu-orange/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <b.icon size={24} className="text-cedu-orange" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-cedu-ink text-lg mb-1">{b.title}</h3>
                      <p className="text-sm text-cedu-ink-muted leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white" data-testid="section-comparison">
        <div className="max-w-[900px] mx-auto">
          <AnimatedSection>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-cedu-ink text-center mb-4">¿Cuánto te cuesta NO usar el modelo cooperativista?</h2>
            <p className="text-center text-cedu-ink-muted mb-8 sm:mb-12">Compara lo que pagas hoy contra lo que pagarías con Ceduverse.</p>
          </AnimatedSection>
          <AnimatedSection>
            <div className="-mx-4 sm:mx-0 overflow-x-auto">
              <table className="w-full border-collapse min-w-[540px]" data-testid="table-comparison">
                <thead>
                  <tr>
                    <th className="text-left p-2.5 sm:p-4 text-xs sm:text-sm font-semibold text-cedu-ink border-b border-black/10">Concepto</th>
                    <th className="text-center p-2.5 sm:p-4 text-xs sm:text-sm font-semibold text-cedu-ink-muted border-b border-black/10">Tradicional</th>
                    <th className="text-center p-2.5 sm:p-4 text-xs sm:text-sm font-semibold text-cedu-blue border-b border-black/10 bg-cedu-blue/5">Ceduverse</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Deducibilidad fiscal", "Limitada o nula", "100% deducible con CFDI"],
                    ["Cursos STPS", "$3,000 – $8,000/curso", "29 cursos incluidos"],
                    ["Cursos con IA", "No disponible", "49 cursos Tutor IA"],
                    ["Certificación básica", "Diplomas genéricos", "Diploma NFT gratis"],
                    ["Constancia DC-3", "$1,500 – $3,000", "$499 MXN"],
                    ["Certificado SEP", "$5,000 – $10,000", "$1,999 MXN"],
                    ["NOM-035", "Consultoría $15,000+", "Incluido"],
                    ["Plataforma con IA", "$5,000 – $20,000/mes", "Incluida"],
                    ["Incentivos", "No disponible", "Becas + bonos"],
                  ].map(([concept, trad, cedu], i) => (
                    <tr key={i} className="border-b border-black/[0.04]">
                      <td className="p-2.5 sm:p-4 text-xs sm:text-sm text-cedu-ink font-medium">{concept}</td>
                      <td className="p-2.5 sm:p-4 text-xs sm:text-sm text-cedu-ink-muted text-center">{trad}</td>
                      <td className="p-2.5 sm:p-4 text-xs sm:text-sm text-cedu-blue font-semibold text-center bg-cedu-blue/5">{cedu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 sm:px-6" data-testid="section-pricing-preview">
        <div className="max-w-[1060px] mx-auto">
          <AnimatedSection>
            <div className="text-xs font-extrabold uppercase tracking-[2px] sm:tracking-[3px] text-cedu-orange text-center mb-3">Inversión por trabajador</div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-cedu-ink text-center mb-4">Planes basados en UMAs</h2>
            <p className="text-center text-cedu-ink-muted mb-8 sm:mb-12 max-w-[600px] mx-auto text-sm sm:text-base">Precios accesibles, medidos en UMAs (Unidad de Medida y Actualización). Valor UMA 2026: $113.14 MXN.</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Impulsa", umas: 6, price: "$678.84", color: "cedu-blue", features: ["29 cursos STPS incluidos", "49 cursos con Tutor IA", "Diploma NFT gratis", "Constancia DC-3 ($499)", "Cert. SEP opcional ($1,999)", "Plataforma IA + Chat"] },
              { name: "Transforma", umas: 10, price: "$1,131.40", color: "cedu-orange", recommended: true, features: ["Todo de Impulsa", "Cursos especializados", "Mentorías personalizadas", "Dashboard empresarial", "Reportes de avance", "Onboarding con Tutor IA"] },
              { name: "Lidera", umas: 20, price: "$2,262.80", color: "cedu-blue", features: ["Todo de Transforma", "Diplomas NFT Blockchain", "Programas RVOE disponibles", "Asesoría jurídica incluida", "Consejo de capacitación", "Onboarding dedicado"] },
            ].map((plan, i) => (
              <AnimatedSection key={i}>
                <div className={`rounded-2xl p-6 border ${plan.recommended ? "border-cedu-orange shadow-lg ring-2 ring-cedu-orange/20" : "border-black/[0.06]"} bg-white relative`} data-testid={`plan-${plan.name.toLowerCase()}`}>
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cedu-orange text-white text-xs font-bold px-4 py-1 rounded-full">Recomendado</div>
                  )}
                  <h3 className="font-serif text-2xl text-cedu-ink mb-1">{plan.name}</h3>
                  <div className="text-sm text-cedu-ink-muted mb-3">{plan.umas} UMAs / trabajador</div>
                  <div className="text-3xl font-bold text-cedu-ink mb-1">{plan.price} <span className="text-sm font-normal text-cedu-ink-muted">MXN</span></div>
                  <div className="text-xs text-cedu-ink-soft mb-6">por trabajador</div>
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-cedu-ink-muted">
                        <CheckCircle2 size={16} className={plan.recommended ? "text-cedu-orange" : "text-cedu-blue"} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={scrollToForm}
                    className={`w-full rounded-full ${plan.recommended ? "bg-cedu-orange hover:bg-cedu-orange/90" : "bg-cedu-blue hover:bg-cedu-blue/90"} text-white`}
                    data-testid={`button-plan-${plan.name.toLowerCase()}`}
                  >
                    Descargar Kit
                  </Button>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white" data-testid="section-stats">
        <div className="max-w-[900px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 text-center">
            {[
              { value: "78", label: "Cursos totales" },
              { value: "29", label: "Cursos STPS registrados" },
              { value: "49", label: "Cursos con Tutor IA" },
              { value: "3", label: "Niveles de certificación" },
              { value: "100%", label: "Deducible con CFDI" },
            ].map((stat, i) => (
              <AnimatedSection key={i}>
                <div data-testid={`stat-${i}`}>
                  <div className="text-3xl md:text-4xl font-bold text-cedu-blue mb-1">{stat.value}</div>
                  <div className="text-sm text-cedu-ink-muted">{stat.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 sm:px-6" data-testid="section-form" ref={formRef}>
        <div className="max-w-[600px] mx-auto">
          <AnimatedSection>
            <div className="text-xs font-extrabold uppercase tracking-[2px] sm:tracking-[3px] text-cedu-orange text-center mb-3">Descarga gratuita</div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-cedu-ink text-center mb-4" data-testid="text-form-heading">Kit Cooperativista + Reforma Fiscal 2026</h2>
            <p className="text-center text-cedu-ink-muted mb-8 leading-relaxed">
              Todo lo que tu empresa y tu contador necesitan para capacitar legalmente, cumplir ante el SAT con IA, y deducir el 100% — sin riesgo fiscal. Incluye demo del Tutor IA y guía de los 3 niveles de certificación.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {kitContents.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-cedu-ink-muted" data-testid={`kit-item-${i}`}>
                  <item.icon size={16} className="text-cedu-blue flex-shrink-0" />
                  {item.text}
                </div>
              ))}
            </div>
          </AnimatedSection>

          {!submitted ? (
            <AnimatedSection>
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-black/[0.06] shadow-sm" data-testid="form-lead">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="kit-fullname" className="block text-sm font-medium text-cedu-ink mb-1.5">Nombre completo *</label>
                    <Input
                      id="kit-fullname"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Tu nombre"
                      className="rounded-xl w-full"
                      data-testid="input-fullname"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="kit-email" className="block text-sm font-medium text-cedu-ink mb-1.5">Correo electrónico *</label>
                    <Input
                      id="kit-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="correo@empresa.com"
                      className="rounded-xl w-full"
                      data-testid="input-email"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="kit-company" className="block text-sm font-medium text-cedu-ink mb-1.5">Empresa</label>
                    <Input
                      id="kit-company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Nombre de tu empresa"
                      className="rounded-xl w-full"
                      data-testid="input-company"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="kit-phone" className="block text-sm font-medium text-cedu-ink mb-1.5">WhatsApp (opcional)</label>
                      <Input
                        id="kit-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+52..."
                        className="rounded-xl w-full"
                        data-testid="input-phone"
                      />
                    </div>
                    <div>
                      <label htmlFor="kit-city" className="block text-sm font-medium text-cedu-ink mb-1.5">Ciudad</label>
                      <Input
                        id="kit-city"
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Tu ciudad"
                        className="rounded-xl w-full"
                        data-testid="input-city"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={leadMutation.isPending}
                    className="w-full bg-cedu-orange hover:bg-cedu-orange/90 text-white rounded-full py-6 text-lg font-bold"
                    data-testid="button-submit-lead"
                  >
                    {leadMutation.isPending ? <Loader2 className="animate-spin mr-2" size={20} /> : <Download className="mr-2" size={20} />}
                    {leadMutation.isPending ? "Enviando..." : "Descargar Kit Gratuito →"}
                  </Button>
                </div>
                <p className="text-xs text-cedu-ink-soft text-center mt-4">
                  Al enviar aceptas recibir el documento por correo. Puedes darte de baja en cualquier momento.
                </p>
              </form>
            </AnimatedSection>
          ) : (
            <AnimatedSection>
              <div className="bg-white rounded-2xl p-8 border border-green-200 shadow-sm text-center" data-testid="div-success">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h3 className="font-serif text-2xl text-cedu-ink mb-2">¡Listo!</h3>
                <p className="text-cedu-ink-muted mb-6">
                  Revisa tu correo — el Kit Cooperativista + Reforma Fiscal 2026 llegará a tu bandeja de entrada en breve.
                </p>
                <Link href="/empresas">
                  <Button className="bg-cedu-blue hover:bg-cedu-blue/90 text-white rounded-full px-8" data-testid="link-empresas-after">
                    Conocer planes para empresas <ArrowRight className="ml-2" size={16} />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      <footer className="pt-10 pb-8 bg-white border-t border-black/[0.06]" data-testid="section-footer-kit">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-[13px] text-cedu-ink-muted gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-cedu-blue rounded-[8px] flex items-center justify-center text-white font-serif text-sm">C</div>
              <span>&copy; 2026 Ceduverse. Todos los derechos reservados.</span>
            </div>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <Link href="/" className="text-cedu-ink-soft text-xs sm:text-sm no-underline hover:text-cedu-blue transition-colors">Inicio</Link>
              <Link href="/empresas" className="text-cedu-ink-soft text-xs sm:text-sm no-underline hover:text-cedu-blue transition-colors">Empresas</Link>
              <Link href="/tutor-ia" className="text-cedu-ink-soft text-xs sm:text-sm no-underline hover:text-cedu-blue transition-colors">Tutor IA</Link>
              <a href="#" className="text-cedu-ink-soft text-xs sm:text-sm no-underline hover:text-cedu-blue transition-colors">Términos</a>
              <a href="#" className="text-cedu-ink-soft text-xs sm:text-sm no-underline hover:text-cedu-blue transition-colors">Privacidad</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

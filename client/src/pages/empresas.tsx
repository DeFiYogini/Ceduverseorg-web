import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useForceLightMode } from "@/components/ThemeProvider";
import {
  Receipt,
  ShieldCheck,
  GraduationCap,
  Gift,
  Building2,
  Crown,
  Zap,
  CircleCheck,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

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
    <div ref={ref} className={className}>
      {isInView ? children : <div style={{ opacity: 0 }}>{children}</div>}
    </div>
  );
}

function EmpresasNavbar() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cedu-cream/85 backdrop-blur-xl border-b border-black/[0.06] shadow-sm"
          : "bg-transparent"
      }`}
      data-testid="navbar-empresas"
    >
      <div className="max-w-[1160px] mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 no-underline" data-testid="link-logo">
          <div className="w-9 h-9 bg-cedu-blue rounded-[10px] flex items-center justify-center text-white font-serif text-xl">
            C
          </div>
          <div className="font-serif text-2xl text-cedu-ink tracking-tight">
            Cedu<em className="text-cedu-blue not-italic italic">verse</em>
          </div>
        </Link>

        <ul className="hidden md:flex items-center gap-1 list-none">
          <li>
            <Link
              href="/"
              className="text-cedu-ink-muted font-semibold text-sm px-4 py-2 rounded-[10px] hover:text-cedu-ink hover:bg-black/[0.04] transition-all no-underline"
            >
              Inicio
            </Link>
          </li>
          <li>
            <Link
              href="/empresas"
              className="text-cedu-ink font-semibold text-sm px-4 py-2 rounded-[10px] bg-black/[0.04] no-underline"
            >
              Empresas
            </Link>
          </li>
          <li>
            <button
              onClick={() => {
                if (user) { setLocation("/dashboard"); }
                else { sessionStorage.setItem("cedu_registro_empresa", "1"); setLocation("/auth"); }
              }}
              className="bg-cedu-ink text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-cedu-blue transition-all cursor-pointer ml-2"
              data-testid="button-navbar-empresas-cta"
            >
              {user ? "Dashboard" : "Registrar Empresa"} &rarr;
            </button>
          </li>
        </ul>

        <button
          className="md:hidden p-2 text-cedu-ink"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-empresas"
          data-testid="button-mobile-menu-empresas"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div id="mobile-nav-empresas" role="navigation" aria-label="Menú principal" className="md:hidden bg-cedu-cream/95 backdrop-blur-xl border-t border-black/[0.06] px-6 pb-6 pt-2">
          <Link href="/" className="block py-3 text-cedu-ink-soft font-semibold text-sm no-underline" onClick={() => setMobileOpen(false)}>Inicio</Link>
          <Link href="/empresas" className="block py-3 text-cedu-ink font-semibold text-sm no-underline" onClick={() => setMobileOpen(false)}>Empresas</Link>
          <button onClick={() => { setMobileOpen(false); if (user) { setLocation("/dashboard"); } else { sessionStorage.setItem("cedu_registro_empresa", "1"); setLocation("/auth"); } }} className="block w-full mt-2 bg-cedu-ink text-white font-semibold text-sm px-6 py-3 rounded-xl text-center cursor-pointer" data-testid="button-mobile-empresas-cta">{user ? "Dashboard" : "Registrar Empresa"} &rarr;</button>
        </div>
      )}
    </nav>
  );
}

const enterpriseBenefits = [
  {
    icon: Receipt,
    title: "100% Deducible",
    desc: "Todas las aportaciones son deducibles de impuestos, respaldadas con CFDI. Un gasto imprescindible en educación y capacitación.",
    bg: "bg-cedu-blue-light",
    color: "text-cedu-blue",
  },
  {
    icon: ShieldCheck,
    title: "Cumplimiento de NOMs",
    desc: "Constituimos los consejos de capacitación y educación. Constancias DC-3 con validez STPS disponibles con descuento según plan, diplomas digitales gratuitos y certificados SEP opcionales.",
    bg: "bg-cedu-green-light",
    color: "text-cedu-green",
  },
  {
    icon: GraduationCap,
    title: "Asesoría Personalizada",
    desc: "Mentorías uno a uno con profesionales en materia jurídica y gestión empresarial para aumentar la productividad de tus trabajadores.",
    bg: "bg-cedu-orange-light",
    color: "text-cedu-orange",
  },
  {
    icon: Gift,
    title: "Becas e Incentivos",
    desc: "Complementa el salario de tus empleados con bonos, incentivos o becas educativas dentro de un sistema de economía solidaria.",
    bg: "bg-cedu-violet-light",
    color: "text-cedu-violet",
  },
];

const UMA_VALUE = 113.14;

const pricingPlans = [
  {
    name: "Impulsa",
    icon: Zap,
    umasPerCollaborator: 6,
    desc: "Para equipos que inician su programa de capacitación cooperativa.",
    collaboratorRange: "1 – 10",
    highlighted: false,
    features: [
      "Todos los cursos Academy sin límite (sin RVOE)",
      "Constancias DC-3 no incluidas (10% dto.)",
      "Diploma digital gratuito por curso",
      "Certificado SEP opcional ($1,999)",
      "Cashback en bonos e incentivos",
      "Monedero Visa por colaborador",
    ],
  },
  {
    name: "Transforma",
    icon: Crown,
    umasPerCollaborator: 10,
    desc: "Escala la capacitación de tu empresa con beneficios premium y seguimiento ejecutivo.",
    collaboratorRange: "11 – 99",
    highlighted: true,
    features: [
      "Todos los cursos Academy sin límite (sin RVOE)",
      "Constancias DC-3 no incluidas (20% dto.)",
      "Diploma digital gratuito por curso",
      "Certificado SEP opcional ($1,999)",
      "15% de descuento en cursos RVOE",
      "Dashboard de progreso y reportes",
    ],
  },
  {
    name: "Lidera",
    icon: Building2,
    umasPerCollaborator: 20,
    desc: "Solución integral para grandes organizaciones con alto volumen de capacitación.",
    collaboratorRange: "100 – 500",
    highlighted: false,
    features: [
      "Todos los cursos Academy sin límite (sin RVOE)",
      "Constancias DC-3 no incluidas (30% dto.)",
      "Diploma digital gratuito por curso",
      "Certificado SEP opcional ($1,999)",
      "20% de descuento en cursos RVOE",
      "Gerente de cuenta y soporte prioritario",
    ],
  },
];

function formatMXN(value: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function EmpresasHero() {
  return (
    <section className="pt-36 pb-16 relative overflow-hidden" data-testid="section-empresas-hero">
      <div className="absolute -top-16 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-cedu-orange-light to-cedu-blue-light animate-blob opacity-40 z-0" />
      <div className="absolute -bottom-32 -left-24 w-[400px] h-[400px] bg-gradient-to-br from-cedu-green-light to-cedu-violet-light animate-blob-slow opacity-30 z-0" />

      <div className="max-w-[1160px] mx-auto px-6 relative z-10 text-center">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-cedu-orange-light rounded-full text-[13px] font-bold text-cedu-orange mb-6"
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
        >
          <span className="w-2 h-2 rounded-full bg-cedu-orange inline-block" />
          Empresas Patrocinadoras
        </motion.div>

        <motion.h1
          className="font-serif text-[clamp(2.4rem,5vw,4rem)] leading-[1.08] tracking-tight text-cedu-ink mb-6 max-w-[700px] mx-auto"
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
        >
          Invierte en tu equipo,{" "}
          <em className="italic text-cedu-blue underline decoration-cedu-orange underline-offset-[6px] decoration-[3px]">
            transforma tu empresa.
          </em>
        </motion.h1>

        <motion.p
          className="text-lg leading-relaxed text-cedu-ink-muted max-w-[560px] mx-auto mb-9"
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
        >
          Únete al modelo cooperativo de Ceduverse. Aportaciones 100% deducibles por UMA, cumplimiento normativo y una prestación laboral que premia por estudiar.
        </motion.p>

        <motion.div
          className="flex gap-3 justify-center flex-wrap"
          variants={fadeUp} initial="hidden" animate="visible" custom={3}
        >
          <a
            href="#planes"
            className="inline-flex items-center gap-2 px-8 py-4 bg-cedu-blue text-white font-bold text-[15px] rounded-[14px] shadow-[0_4px_20px_rgba(27,90,223,0.25)] hover:bg-cedu-blue-dark hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(27,90,223,0.35)] transition-all no-underline"
            data-testid="button-ver-planes"
          >
            Ver Planes <ArrowRight size={18} />
          </a>
          <a
            href="#beneficios"
            className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-cedu-ink font-bold text-[15px] border-2 border-black/[0.12] rounded-[14px] hover:border-cedu-ink hover:bg-black/[0.02] transition-all no-underline"
            data-testid="button-ver-beneficios"
          >
            Conocer Beneficios
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="py-24 bg-white" id="beneficios" data-testid="section-beneficios">
      <div className="max-w-[1160px] mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
            <div className="text-xs font-extrabold uppercase tracking-[3px] text-cedu-orange mb-3">Beneficios</div>
            <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight text-cedu-ink mb-4">
              ¿Por qué ser empresa patrocinadora?
            </h2>
            <p className="text-[17px] text-cedu-ink-muted max-w-[520px] mx-auto leading-relaxed">
              Capacita a tu equipo con beneficios fiscales, cumplimiento normativo e incentivos reales.
            </p>
          </motion.div>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {enterpriseBenefits.map((benefit, i) => (
            <motion.div
              key={i}
              className="p-7 rounded-[20px] border border-black/[0.06] bg-cedu-cream transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(0,0,0,0.07)]"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              data-testid={`card-benefit-${i}`}
            >
              <div className={`w-11 h-11 rounded-xl ${benefit.bg} flex items-center justify-center mb-4`}>
                <benefit.icon size={22} className={benefit.color} />
              </div>
              <h3 className="font-serif text-lg text-cedu-ink mb-2">{benefit.title}</h3>
              <p className="text-[13px] leading-relaxed text-cedu-ink-muted">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(1);
  const [collaborators, setCollaborators] = useState(11);

  const plan = pricingPlans[selectedPlan];
  const monthlyPerCollab = plan.umasPerCollaborator * UMA_VALUE;
  const monthlyTotal = monthlyPerCollab * collaborators;
  const annualTotal = monthlyTotal * 12;

  return (
    <section className="py-24 bg-cedu-cream" id="planes" data-testid="section-planes">
      <div className="max-w-[1160px] mx-auto px-6">
        <AnimatedSection className="text-center mb-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
            <div className="text-xs font-extrabold uppercase tracking-[3px] text-cedu-orange mb-3">Planes</div>
            <h2 className="font-serif text-[clamp(1.5rem,3vw,2.5rem)] leading-tight tracking-tight text-cedu-ink mb-3">
              Aportaciones por Colaborador
            </h2>
            <p className="text-sm text-cedu-ink-muted">
              Basado en UMAs (Unidad de Medida y Actualización) &bull; Valor UMA 2026: {formatMXN(UMA_VALUE)} &bull; 100% deducible
            </p>
          </motion.div>
        </AnimatedSection>

        <motion.div
          className="bg-white rounded-[20px] sm:rounded-[24px] border border-black/[0.06] p-5 sm:p-8 md:p-10 mb-8 shadow-sm"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          data-testid="pricing-calculator"
        >
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="flex-1">
              <div className="mb-8">
                <label className="text-xs font-extrabold uppercase tracking-[2px] text-cedu-ink-muted mb-4 block">Selecciona tu plan</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {pricingPlans.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedPlan(i);
                        const minCollab = i === 0 ? 1 : i === 1 ? 11 : 100;
                        if (collaborators < minCollab) setCollaborators(minCollab);
                        if (i === 0 && collaborators > 10) setCollaborators(10);
                        if (i === 1 && collaborators > 99) setCollaborators(99);
                      }}
                      className={`relative p-3.5 sm:p-4 rounded-[14px] border-2 text-left transition-all duration-200 cursor-pointer ${
                        selectedPlan === i
                          ? "border-cedu-blue bg-cedu-blue-light/30 shadow-[0_4px_20px_rgba(27,90,223,0.12)]"
                          : "border-transparent bg-cedu-cream hover:bg-cedu-cream/80"
                      }`}
                      data-testid={`button-select-plan-${i}`}
                    >
                      {p.highlighted && (
                        <span className="absolute -top-2.5 right-3 px-2.5 py-0.5 bg-cedu-orange text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full">
                          Popular
                        </span>
                      )}
                      <div className="flex items-center gap-2.5 mb-1 sm:mb-2">
                        <p.icon size={18} className={selectedPlan === i ? "text-cedu-blue" : "text-cedu-ink-muted"} />
                        <span className={`font-bold text-[15px] ${selectedPlan === i ? "text-cedu-ink" : "text-cedu-ink-soft"}`}>{p.name}</span>
                        <span className="sm:hidden text-xs text-cedu-ink-muted ml-auto">{p.umasPerCollaborator} UMAs &middot; {p.collaboratorRange} col.</span>
                      </div>
                      <div className="hidden sm:block text-xs text-cedu-ink-muted">
                        {p.umasPerCollaborator} UMAs/colaborador
                      </div>
                      <div className="hidden sm:block text-[11px] text-cedu-ink-muted mt-0.5">
                        {p.collaboratorRange} colaboradores
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold uppercase tracking-[2px] text-cedu-ink-muted mb-3 block">
                  Número de colaboradores: <span className="text-cedu-blue font-extrabold text-base normal-case">{collaborators}</span>
                </label>
                <input
                  type="range"
                  min={selectedPlan === 0 ? 1 : selectedPlan === 1 ? 11 : 100}
                  max={selectedPlan === 0 ? 10 : selectedPlan === 1 ? 99 : 500}
                  value={collaborators}
                  onChange={(e) => setCollaborators(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-cedu-blue-light accent-cedu-blue"
                  data-testid="input-collaborators"
                />
                <div className="flex justify-between text-[11px] text-cedu-ink-muted mt-1.5">
                  <span>{selectedPlan === 0 ? 1 : selectedPlan === 1 ? 11 : 100}</span>
                  <span>{selectedPlan === 0 ? 10 : selectedPlan === 1 ? 99 : 500}</span>
                </div>
              </div>
            </div>

            <div className="lg:w-[380px] flex-shrink-0">
              <div className="bg-cedu-cream rounded-[16px] sm:rounded-[18px] border border-black/[0.06] p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-5">
                  <plan.icon size={20} className="text-cedu-blue" />
                  <h4 className="font-serif text-lg text-cedu-ink">Plan {plan.name}</h4>
                  {plan.highlighted && (
                    <span className="px-2 py-0.5 bg-cedu-orange/10 text-cedu-orange text-[10px] font-extrabold uppercase rounded-full">Popular</span>
                  )}
                </div>

                <div className="space-y-0 mb-5 rounded-[10px] sm:rounded-[12px] border border-black/[0.06] overflow-hidden" data-testid="pricing-table">
                  <div className="grid grid-cols-2 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-cedu-ink-muted bg-white px-3 sm:px-4 py-2.5">
                    <span>Concepto</span>
                    <span className="text-right">Monto</span>
                  </div>
                  <div className="px-3 sm:px-4 py-2 border-t border-black/[0.04] bg-cedu-blue-light/20">
                    <p className="text-[11px] sm:text-xs text-cedu-ink-soft italic leading-snug">Aportaciones a la asociación por educación y capacitación</p>
                  </div>
                  <div className="grid grid-cols-2 items-center px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-sm border-t border-black/[0.04] bg-white">
                    <span className="text-cedu-ink-soft">UMAs / col.</span>
                    <span className="text-right font-semibold text-cedu-ink">{plan.umasPerCollaborator} UMAs</span>
                  </div>
                  <div className="grid grid-cols-2 items-center px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-sm border-t border-black/[0.04] bg-white">
                    <span className="text-cedu-ink-soft">Valor UMA</span>
                    <span className="text-right font-semibold text-cedu-ink">{formatMXN(UMA_VALUE)}</span>
                  </div>
                  <div className="grid grid-cols-2 items-center px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-sm border-t border-black/[0.04] bg-white">
                    <span className="text-cedu-ink-soft">Mensual / col.</span>
                    <span className="text-right font-semibold text-cedu-ink" data-testid="text-monthly-per-collab">{formatMXN(monthlyPerCollab)}</span>
                  </div>
                  <div className="grid grid-cols-2 items-center px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-sm border-t border-black/[0.04] bg-white">
                    <span className="text-cedu-ink-soft">Colaboradores</span>
                    <span className="text-right font-semibold text-cedu-blue" data-testid="text-collaborator-count">{collaborators}</span>
                  </div>
                  <div className="grid grid-cols-2 items-center px-3 sm:px-4 py-3 sm:py-3.5 text-[13px] sm:text-sm border-t-2 border-cedu-blue/20 bg-cedu-blue-light/30">
                    <span className="font-bold text-cedu-ink">Total mensual</span>
                    <span className="text-right font-extrabold text-cedu-blue text-base sm:text-lg" data-testid="text-monthly-total">{formatMXN(monthlyTotal)}</span>
                  </div>
                  <div className="grid grid-cols-2 items-center px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-sm border-t border-black/[0.04] bg-white">
                    <span className="font-semibold text-cedu-ink-soft">Total anual</span>
                    <span className="text-right font-bold text-cedu-ink" data-testid="text-annual-total">{formatMXN(annualTotal)}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CircleCheck size={14} className="mt-0.5 flex-shrink-0 text-cedu-green" />
                      <span className="text-[13px] leading-snug text-cedu-ink-soft">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    sessionStorage.setItem("cedu_registro_empresa", "1");
                    sessionStorage.setItem("cedu_plan", plan.name.toLowerCase());
                    sessionStorage.setItem("cedu_collaborators", String(collaborators));
                    if (user) { setLocation("/welcome"); }
                    else { setLocation("/auth"); }
                  }}
                  className="block w-full text-center py-3.5 rounded-[12px] font-bold text-[15px] cursor-pointer transition-all bg-cedu-blue text-white hover:bg-cedu-blue-dark hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(27,90,223,0.25)]"
                  data-testid="button-plan-cta"
                >
                  Registrar mi Empresa &rarr;
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.p
          className="text-center text-[13px] text-cedu-ink-muted mt-6 max-w-[600px] mx-auto leading-relaxed"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
        >
          Todas las aportaciones incluyen CFDI deducible &bull; Plazos anuales en MXN &bull; Cumplimiento con la Ley Federal del Trabajo y la Ley General de Sociedades Cooperativas
        </motion.p>

        <motion.div
          className="mt-6 max-w-[700px] mx-auto bg-white/60 border border-black/[0.06] rounded-[14px] px-6 py-5"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={1}
          data-testid="disclosure-empresas"
        >
          <p className="text-[12px] leading-relaxed text-cedu-ink-muted text-center">
            <strong className="text-cedu-ink-soft">Aviso importante:</strong> La aportación es completamente voluntaria, sin ningún tipo de attachment ni pena moratoria. Los planes se pueden ajustar mes a mes según las necesidades de tu empresa. La afiliación para empresas patrocinadoras se formaliza mediante contratos anuales con vigencia para el ejercicio fiscal 2026.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function EmpresasFooter() {
  return (
    <footer className="pt-16 pb-8 bg-white border-t border-black/[0.06]" data-testid="section-footer-empresas">
      <div className="max-w-[1160px] mx-auto px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center pt-5 text-[13px] text-cedu-ink-muted gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-cedu-blue rounded-[8px] flex items-center justify-center text-white font-serif text-sm">C</div>
            <span>&copy; 2026 Ceduverse. Todos los derechos reservados.</span>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="text-cedu-ink-soft text-sm no-underline hover:text-cedu-blue transition-colors">Inicio</Link>
            <a href="/terminos" className="text-cedu-ink-soft text-sm no-underline hover:text-cedu-blue transition-colors">Términos</a>
            <a href="/privacidad" className="text-cedu-ink-soft text-sm no-underline hover:text-cedu-blue transition-colors">Privacidad</a>
            <a href="#" className="text-cedu-ink-soft text-sm no-underline hover:text-cedu-blue transition-colors">Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Empresas() {
  useForceLightMode();
  return (
    <div className="min-h-screen bg-cedu-cream overflow-x-hidden">
      <EmpresasNavbar />
      <main>
        <EmpresasHero />
        <BenefitsSection />
        <PricingSection />
      </main>
      <EmpresasFooter />
    </div>
  );
}

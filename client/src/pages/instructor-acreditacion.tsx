import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useForceLightMode } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  GraduationCap, Award, Shield, CheckCircle2, ArrowRight, ArrowLeft,
  Star, BookOpen, Users, Clock, FileText, Banknote, ChevronRight,
  Loader2, AlertTriangle, Trophy, Sparkles, Building2, Video, Cpu,
  RefreshCw, Mic, CheckCircle, Rocket, PenTool, Calendar, Wand2,
} from "lucide-react";

type InstructorApplication = {
  id: string;
  userId: string;
  type: "dc5" | "internal";
  status: string;
  currentStep: number;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  specialty: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  linkedinUrl: string | null;
  yearsExperience: number | null;
  education: string | null;
  certifications: string[] | null;
  cvUrl: string | null;
  areasExpertise: string[] | null;
  teachingExperience: string | null;
  quizScore: number | null;
  quizAttempts: number | null;
  quizMaxAttempts: number | null;
  quizPassingScore: number | null;
  quizLastAttemptAt: string | null;
  quizPassed: boolean | null;
  termsAccepted: boolean | null;
  termsCodeOfConduct: boolean | null;
  termsContentPolicy: boolean | null;
  termsRevenueShare: boolean | null;
  bankName: string | null;
  bankClabe: string | null;
  rfc: string | null;
  fiscalName: string | null;
  fiscalRegime: string | null;
  dc5PaymentMethod: string | null;
  dc5PaymentReference: string | null;
  dc5PaymentStatus: string | null;
  dc5TrackingNumber: string | null;
  instructorNumber: string | null;
  activatedAt: string | null;
  adminNotes: string | null;
  createdAt: string;
};

type QuizData = {
  questions: { index: number; question: string; options: string[] }[];
  totalQuestions: number;
  passingScore: number;
  attemptsUsed: number;
  maxAttempts: number;
  passed: boolean;
  lastScore: number | null;
  lastAttemptAt: string | null;
};

type QuizResult = {
  score: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  attemptsUsed: number;
  maxAttempts: number;
};

const DC5_STEPS = [
  { label: "Perfil Profesional", icon: GraduationCap },
  { label: "Experiencia y Formación", icon: BookOpen },
  { label: "Evaluación de Competencias", icon: FileText },
  { label: "Términos del Instructor", icon: Shield },
  { label: "Datos de Pago", icon: Banknote },
  { label: "Trámite DC-5", icon: Award },
];

const INTERNAL_STEPS = [
  { label: "Perfil Profesional", icon: GraduationCap },
  { label: "Experiencia", icon: BookOpen },
  { label: "Evaluación", icon: FileText },
  { label: "Términos", icon: Shield },
];

function LandingView({ onSelect }: { onSelect: (type: "dc5" | "internal") => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f4] to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-[#1b5adf] to-[#7c3aed] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-cedu-ink mb-3" data-testid="text-acreditacion-title">
            ¿Cómo quieres acreditarte?
          </h1>
          <p className="text-cedu-ink-muted max-w-2xl mx-auto text-lg">
            Elige el camino que mejor se adapte a tu perfil profesional.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-2 border-black/[0.08] hover:border-[#00b87a]/40 transition-colors" data-testid="card-internal-option">
            <div className="h-1.5 bg-gradient-to-r from-[#00b87a] to-[#00b87a]/60" />
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-[#00b87a]/10 rounded-xl flex items-center justify-center mb-2">
                <Building2 size={24} className="text-[#00b87a]" />
              </div>
              <CardTitle className="font-serif text-xl text-cedu-ink">Instructor Interno</CardTitle>
              <p className="text-sm text-cedu-ink-muted">Sin DC-5</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2.5">
                {[
                  { text: "Crear cursos internos para tu organización", ok: true },
                  { text: "Digital Twin gratuito", ok: true },
                  { text: "Tutor IA en vivo", ok: true },
                  { text: "Activación inmediata", ok: true },
                  { text: "NO puede monetizar cursos", ok: false },
                  { text: "NO gana por referidos", ok: false },
                  { text: "NO sesiones privadas", ok: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {item.ok
                      ? <CheckCircle2 size={16} className="text-[#00b87a] flex-shrink-0 mt-0.5" />
                      : <span className="w-4 h-4 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5 text-xs font-bold">✗</span>
                    }
                    <span className={`text-sm ${item.ok ? "text-cedu-ink" : "text-cedu-ink-muted"}`}>{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-black/[0.06] pt-4">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-[#00b87a] font-serif">Gratis</span>
                </div>
                <p className="text-xs text-cedu-ink-muted mb-4">Sin costo adicional</p>
                <Button
                  className="w-full bg-[#00b87a] hover:bg-[#00b87a]/90 text-white"
                  onClick={() => onSelect("internal")}
                  data-testid="button-start-internal"
                >
                  Elegir Interno <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
              <p className="text-[10px] text-cedu-ink-muted text-center">4 pasos · Evaluación de 10 preguntas · Mínimo 60%</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#1b5adf]/30 relative overflow-hidden hover:border-[#1b5adf]/60 transition-colors" data-testid="card-dc5-option">
            <div className="absolute top-3 right-3">
              <Badge className="bg-[#1b5adf] text-white border-0 text-xs">Recomendado</Badge>
            </div>
            <div className="h-1.5 bg-gradient-to-r from-[#1b5adf] to-[#7c3aed]" />
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-[#1b5adf]/10 rounded-xl flex items-center justify-center mb-2">
                <Award size={24} className="text-[#1b5adf]" />
              </div>
              <CardTitle className="font-serif text-xl text-cedu-ink">Instructor Acreditado (DC-5)</CardTitle>
              <p className="text-sm text-cedu-ink-muted">Con DC-5 STPS</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2.5">
                {[
                  "Todo lo de Interno, más:",
                  "Monetizar cursos en Ceduverse",
                  "Ganar comisiones por referidos",
                  "Aparecer en directorio público",
                  "Sesiones privadas con alumnos",
                  "Planes Impulsa / Transforma / Lidera",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className={`flex-shrink-0 mt-0.5 ${i === 0 ? "text-[#7c3aed]" : "text-[#1b5adf]"}`} />
                    <span className={`text-sm ${i === 0 ? "font-semibold text-[#7c3aed]" : "text-cedu-ink"}`}>{item}</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#1b5adf]/5 rounded-xl p-3 mt-2">
                <p className="text-xs text-cedu-ink-muted">
                  <span className="font-semibold text-cedu-ink">¿Ya tienes DC-5?</span> Regístralo aquí.
                  <br />
                  <span className="font-semibold text-cedu-ink">¿No lo tienes?</span> Te ayudamos a obtenerlo.
                </p>
              </div>
              <div className="border-t border-black/[0.06] pt-4">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-cedu-ink font-serif">$2,499</span>
                  <span className="text-sm text-cedu-ink-muted">MXN</span>
                </div>
                <p className="text-xs text-cedu-ink-muted mb-4">Primer pago vía SPEI requerido</p>
                <Button
                  className="w-full bg-[#1b5adf] hover:bg-[#1b5adf]/90 text-white"
                  onClick={() => onSelect("dc5")}
                  data-testid="button-start-dc5"
                >
                  Elegir Acreditado DC-5 <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
              <p className="text-[10px] text-cedu-ink-muted text-center">6 pasos · Evaluación de 20 preguntas · Mínimo 70%</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h3 className="font-serif text-lg text-cedu-ink mb-6">¿Por qué ser instructor en Ceduverse?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Miles de estudiantes", desc: "Llega a trabajadores de todo México" },
              { icon: Banknote, label: "Genera ingresos", desc: "Monetiza tu experiencia profesional" },
              { icon: Trophy, label: "Reconocimiento", desc: "Badge verificado y certificación NFT" },
              { icon: Sparkles, label: "Herramientas IA", desc: "Crea cursos con asistencia de IA" },
            ].map((item, i) => (
              <Card key={i} className="border-black/[0.06]">
                <CardContent className="pt-5 pb-4 text-center">
                  <item.icon size={24} className="mx-auto text-[#7c3aed] mb-2" />
                  <p className="text-sm font-semibold text-cedu-ink">{item.label}</p>
                  <p className="text-[11px] text-cedu-ink-muted mt-0.5">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ steps, currentStep, type }: { steps: typeof DC5_STEPS; currentStep: number; type: string }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const StepIcon = step.icon;
        const isActive = i + 1 === currentStep;
        const isComplete = i + 1 < currentStep;
        return (
          <div key={i} className="flex items-center gap-1 flex-shrink-0">
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
              isActive ? "bg-[#1b5adf]/10 text-[#1b5adf] font-semibold" :
              isComplete ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"
            }`} data-testid={`step-indicator-${i + 1}`}>
              {isComplete ? <CheckCircle2 size={14} /> : <StepIcon size={14} />}
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

function ProfileStep({ application, onSave }: { application: InstructorApplication; onSave: (data: any) => void }) {
  const [fullName, setFullName] = useState(application.fullName || "");
  const [email, setEmail] = useState(application.email || "");
  const [phone, setPhone] = useState(application.phone || "");
  const [specialty, setSpecialty] = useState(application.specialty || "");
  const [bio, setBio] = useState(application.bio || "");
  const [linkedinUrl, setLinkedinUrl] = useState(application.linkedinUrl || "");

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-serif text-lg text-cedu-ink mb-1" data-testid="text-step-profile">Perfil Profesional</h3>
        <p className="text-sm text-cedu-ink-muted">Cuéntanos sobre ti y tu experiencia</p>
      </div>
      <div className="grid gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Nombre completo *</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Tu nombre completo" data-testid="input-fullname" />
          </div>
          <div>
            <Label>Correo electrónico *</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" data-testid="input-email" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Teléfono</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+52 ..." data-testid="input-phone" />
          </div>
          <div>
            <Label>Especialidad *</Label>
            <Input value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Ej: Seguridad Industrial" data-testid="input-specialty" />
          </div>
        </div>
        <div>
          <Label>LinkedIn (opcional)</Label>
          <Input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." data-testid="input-linkedin" />
        </div>
        <div>
          <Label>Biografía profesional *</Label>
          <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Describe tu trayectoria profesional, áreas de expertise y motivación para ser instructor..." rows={4} data-testid="input-bio" />
        </div>
      </div>
      <Button
        className="w-full bg-[#1b5adf] hover:bg-[#1b5adf]/90"
        disabled={!fullName || !email || !specialty || !bio}
        onClick={() => onSave({ fullName, email, phone, specialty, bio, linkedinUrl, currentStep: 2 })}
        data-testid="button-next-step"
      >
        Siguiente <ArrowRight size={16} className="ml-2" />
      </Button>
    </div>
  );
}

function ExperienceStep({ application, onSave, onBack, isDc5 }: { application: InstructorApplication; onSave: (data: any) => void; onBack: () => void; isDc5: boolean }) {
  const [yearsExperience, setYearsExperience] = useState(String(application.yearsExperience || ""));
  const [education, setEducation] = useState(application.education || "");
  const [teachingExperience, setTeachingExperience] = useState(application.teachingExperience || "");
  const [areasText, setAreasText] = useState((application.areasExpertise || []).join(", "));

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-serif text-lg text-cedu-ink mb-1" data-testid="text-step-experience">Experiencia y Formación</h3>
        <p className="text-sm text-cedu-ink-muted">Detalla tu formación académica y experiencia docente</p>
      </div>
      <div className="grid gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Años de experiencia profesional *</Label>
            <Input type="number" value={yearsExperience} onChange={e => setYearsExperience(e.target.value)} placeholder="5" min="0" data-testid="input-years" />
          </div>
          <div>
            <Label>Formación académica *</Label>
            <Input value={education} onChange={e => setEducation(e.target.value)} placeholder="Ej: Maestría en Administración" data-testid="input-education" />
          </div>
        </div>
        <div>
          <Label>Áreas de expertise (separadas por coma) *</Label>
          <Input value={areasText} onChange={e => setAreasText(e.target.value)} placeholder="Seguridad industrial, NOM-035, Capacitación" data-testid="input-areas" />
        </div>
        <div>
          <Label>Experiencia como instructor/capacitador {isDc5 ? "*" : "(opcional)"}</Label>
          <Textarea value={teachingExperience} onChange={e => setTeachingExperience(e.target.value)} placeholder="Describe tu experiencia impartiendo cursos, talleres o capacitaciones..." rows={4} data-testid="input-teaching" />
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" data-testid="button-prev-step">
          <ArrowLeft size={16} className="mr-2" /> Anterior
        </Button>
        <Button
          className="flex-1 bg-[#1b5adf] hover:bg-[#1b5adf]/90"
          disabled={!yearsExperience || !education || !areasText}
          onClick={() => onSave({
            yearsExperience: parseInt(yearsExperience),
            education,
            teachingExperience,
            areasExpertise: areasText.split(",").map(s => s.trim()).filter(Boolean),
            currentStep: 3,
          })}
          data-testid="button-next-step"
        >
          Siguiente <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}

function QuizStep({ application, onBack, onQuizPassed }: { application: InstructorApplication; onBack: () => void; onQuizPassed: () => void }) {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);

  const { data: quizData, isLoading } = useQuery<QuizData>({
    queryKey: ["/api/instructor-application/quiz"],
  });

  useEffect(() => {
    if (quizData) {
      setAnswers(new Array(quizData.totalQuestions).fill(null));
    }
  }, [quizData]);

  const submitMutation = useMutation({
    mutationFn: async (answers: number[]) => {
      const res = await apiRequest("POST", "/api/instructor-application/quiz", { answers });
      return res.json() as Promise<QuizResult>;
    },
    onSuccess: (result) => {
      setLastResult(result);
      setShowResult(true);
      queryClient.invalidateQueries({ queryKey: ["/api/instructor-application/quiz"] });
      queryClient.invalidateQueries({ queryKey: ["/api/instructor-application/mine"] });
      if (result.passed) {
        toast({ title: "¡Felicidades!", description: `Aprobaste con ${result.score}%` });
      } else {
        toast({ title: "No aprobaste", description: `Obtuviste ${result.score}%. Necesitas ${quizData?.passingScore}%`, variant: "destructive" });
      }
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-cedu-blue" size={24} /></div>;
  if (!quizData) return null;

  if (quizData.passed || (lastResult?.passed)) {
    return (
      <div className="space-y-5">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h3 className="font-serif text-xl text-cedu-ink mb-2">¡Evaluación aprobada!</h3>
          <p className="text-cedu-ink-muted">Calificación: {lastResult?.score || quizData.lastScore}%</p>
        </div>
        <Button className="w-full bg-[#1b5adf] hover:bg-[#1b5adf]/90" onClick={onQuizPassed} data-testid="button-next-step">
          Continuar <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    );
  }

  if (quizData.attemptsUsed >= quizData.maxAttempts) {
    return (
      <div className="space-y-5">
        <div className="text-center py-8">
          <AlertTriangle size={32} className="mx-auto text-amber-500 mb-4" />
          <h3 className="font-serif text-xl text-cedu-ink mb-2">Has agotado tus intentos</h3>
          <p className="text-cedu-ink-muted">Último puntaje: {quizData.lastScore}%. Contacta soporte para más información.</p>
        </div>
        <Button variant="outline" onClick={onBack} className="w-full" data-testid="button-prev-step">
          <ArrowLeft size={16} className="mr-2" /> Volver
        </Button>
      </div>
    );
  }

  if (showResult && lastResult && !lastResult.passed) {
    return (
      <div className="space-y-5">
        <div className="text-center py-8">
          <AlertTriangle size={32} className="mx-auto text-amber-500 mb-4" />
          <h3 className="font-serif text-xl text-cedu-ink mb-2">No alcanzaste el puntaje mínimo</h3>
          <p className="text-cedu-ink-muted mb-2">Obtuviste {lastResult.score}% (mínimo {quizData.passingScore}%)</p>
          <p className="text-sm text-cedu-ink-muted">
            Intentos: {lastResult.attemptsUsed}/{lastResult.maxAttempts}.
            {lastResult.attemptsUsed < lastResult.maxAttempts && " Podrás intentar nuevamente en 24 horas."}
          </p>
        </div>
        <Button variant="outline" onClick={onBack} className="w-full" data-testid="button-prev-step">
          <ArrowLeft size={16} className="mr-2" /> Volver
        </Button>
      </div>
    );
  }

  const allAnswered = answers.every(a => a !== null);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-serif text-lg text-cedu-ink mb-1" data-testid="text-step-quiz">Evaluación de Competencias</h3>
        <p className="text-sm text-cedu-ink-muted">
          Responde {quizData.totalQuestions} preguntas. Necesitas al menos {quizData.passingScore}% para aprobar.
          Intento {quizData.attemptsUsed + 1} de {quizData.maxAttempts}.
        </p>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {quizData.questions.map((q, qi) => (
          <Card key={qi} className="border-black/[0.06]" data-testid={`card-quiz-question-${qi}`}>
            <CardContent className="py-4">
              <p className="text-sm font-semibold text-cedu-ink mb-3">{qi + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                      answers[qi] === oi
                        ? "border-[#1b5adf] bg-[#1b5adf]/5 text-[#1b5adf] font-medium"
                        : "border-black/[0.06] hover:border-black/[0.12] text-cedu-ink"
                    }`}
                    onClick={() => {
                      const newAnswers = [...answers];
                      newAnswers[qi] = oi;
                      setAnswers(newAnswers);
                    }}
                    data-testid={`button-quiz-option-${qi}-${oi}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" data-testid="button-prev-step">
          <ArrowLeft size={16} className="mr-2" /> Anterior
        </Button>
        <Button
          className="flex-1 bg-[#1b5adf] hover:bg-[#1b5adf]/90"
          disabled={!allAnswered || submitMutation.isPending}
          onClick={() => submitMutation.mutate(answers as number[])}
          data-testid="button-submit-quiz"
        >
          {submitMutation.isPending ? <><Loader2 size={16} className="mr-2 animate-spin" /> Evaluando...</> : "Enviar respuestas"}
        </Button>
      </div>
    </div>
  );
}

function TermsStep({ application, onBack, onAccepted }: { application: InstructorApplication; onBack: () => void; onAccepted: () => void }) {
  const { toast } = useToast();
  const [codeOfConduct, setCodeOfConduct] = useState(application.termsCodeOfConduct || false);
  const [contentPolicy, setContentPolicy] = useState(application.termsContentPolicy || false);
  const [revenueShare, setRevenueShare] = useState(application.termsRevenueShare || false);

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/instructor-application/accept-terms", { codeOfConduct, contentPolicy, revenueShare });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instructor-application/mine"] });
      toast({ title: "Términos aceptados" });
      onAccepted();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (application.termsAccepted) {
    return (
      <div className="space-y-5">
        <div className="text-center py-8">
          <CheckCircle2 size={32} className="mx-auto text-green-600 mb-4" />
          <h3 className="font-serif text-xl text-cedu-ink mb-2">Términos aceptados</h3>
          <p className="text-cedu-ink-muted">Ya has aceptado todos los términos y condiciones.</p>
        </div>
        <Button className="w-full bg-[#1b5adf] hover:bg-[#1b5adf]/90" onClick={onAccepted} data-testid="button-next-step">
          Continuar <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-serif text-lg text-cedu-ink mb-1" data-testid="text-step-terms">Términos del Instructor</h3>
        <p className="text-sm text-cedu-ink-muted">Lee y acepta cada uno de los siguientes términos para continuar</p>
      </div>

      <div className="space-y-4">
        <Card className="border-black/[0.06]">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Checkbox checked={codeOfConduct} onCheckedChange={(v) => setCodeOfConduct(!!v)} id="code-of-conduct" data-testid="checkbox-code-of-conduct" />
              <div className="flex-1">
                <label htmlFor="code-of-conduct" className="text-sm font-semibold text-cedu-ink cursor-pointer">Código de Conducta del Instructor</label>
                <p className="text-xs text-cedu-ink-muted mt-1">
                  Me comprometo a mantener un comportamiento ético y profesional en todas mis interacciones con estudiantes.
                  Actuaré con integridad, respeto y responsabilidad, promoviendo un ambiente de aprendizaje inclusivo y seguro.
                  No incurriré en prácticas discriminatorias, acoso o cualquier conducta que comprometa la dignidad de los participantes.
                  Mantendré la confidencialidad de la información personal de los estudiantes y empresas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/[0.06]">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Checkbox checked={contentPolicy} onCheckedChange={(v) => setContentPolicy(!!v)} id="content-policy" data-testid="checkbox-content-policy" />
              <div className="flex-1">
                <label htmlFor="content-policy" className="text-sm font-semibold text-cedu-ink cursor-pointer">Política de Contenido</label>
                <p className="text-xs text-cedu-ink-muted mt-1">
                  Garantizo que todo el contenido que publique en Ceduverse será original o contará con las licencias apropiadas.
                  Me comprometo a crear material de alta calidad, actualizado y relevante para la capacitación laboral.
                  Ceduverse se reserva el derecho de revisar, solicitar modificaciones o retirar contenido que no cumpla con los estándares de calidad.
                  El contenido publicado podrá ser utilizado por Ceduverse conforme a los términos de la plataforma.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/[0.06]">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Checkbox checked={revenueShare} onCheckedChange={(v) => setRevenueShare(!!v)} id="revenue-share" data-testid="checkbox-revenue-share" />
              <div className="flex-1">
                <label htmlFor="revenue-share" className="text-sm font-semibold text-cedu-ink cursor-pointer">Modelo de Comisiones y Pagos</label>
                <p className="text-xs text-cedu-ink-muted mt-1">
                  Acepto el modelo de comisiones de Ceduverse: recibiré el 85% de los ingresos generados por mis cursos de pago,
                  y Ceduverse retendrá el 15% como comisión por uso de plataforma, marketing y soporte.
                  Por certificaciones DC-3 STPS recibiré una comisión del 40% del precio del certificado.
                  Por certificaciones SEP recibiré una comisión del 10% del precio del certificado.
                  Adicionalmente, recibiré $500 MXN por cada empresa referida que se active en la plataforma.
                  Los pagos se realizarán mensualmente por transferencia SPEI a la cuenta bancaria registrada.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" data-testid="button-prev-step">
          <ArrowLeft size={16} className="mr-2" /> Anterior
        </Button>
        <Button
          className="flex-1 bg-[#1b5adf] hover:bg-[#1b5adf]/90"
          disabled={!codeOfConduct || !contentPolicy || !revenueShare || acceptMutation.isPending}
          onClick={() => acceptMutation.mutate()}
          data-testid="button-accept-terms"
        >
          {acceptMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Aceptar términos"}
        </Button>
      </div>
    </div>
  );
}

function PaymentStep({ application, onSave, onBack }: { application: InstructorApplication; onSave: (data: any) => void; onBack: () => void }) {
  const [bankName, setBankName] = useState(application.bankName || "");
  const [bankClabe, setBankClabe] = useState(application.bankClabe || "");
  const [rfc, setRfc] = useState(application.rfc || "");
  const [fiscalName, setFiscalName] = useState(application.fiscalName || "");

  const clabeValid = /^\d{18}$/.test(bankClabe);
  const rfcValid = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i.test(rfc);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-serif text-lg text-cedu-ink mb-1" data-testid="text-step-payment">Datos de Pago y Facturación</h3>
        <p className="text-sm text-cedu-ink-muted">Ingresa tus datos bancarios para recibir tus comisiones</p>
      </div>
      <div className="grid gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Banco *</Label>
            <Input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Ej: BBVA, Banorte" data-testid="input-bank-name" />
          </div>
          <div>
            <Label>CLABE interbancaria (18 dígitos) *</Label>
            <Input value={bankClabe} onChange={e => setBankClabe(e.target.value)} placeholder="012345678901234567" maxLength={18} data-testid="input-bank-clabe" />
            {bankClabe && !clabeValid && <p className="text-xs text-red-500 mt-1">La CLABE debe tener 18 dígitos</p>}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>RFC *</Label>
            <Input value={rfc} onChange={e => setRfc(e.target.value.toUpperCase())} placeholder="XAXX010101000" data-testid="input-rfc" />
            {rfc && !rfcValid && <p className="text-xs text-red-500 mt-1">RFC inválido</p>}
          </div>
          <div>
            <Label>Razón social / Nombre fiscal</Label>
            <Input value={fiscalName} onChange={e => setFiscalName(e.target.value)} placeholder="Nombre para facturación" data-testid="input-fiscal-name" />
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" data-testid="button-prev-step">
          <ArrowLeft size={16} className="mr-2" /> Anterior
        </Button>
        <Button
          className="flex-1 bg-[#1b5adf] hover:bg-[#1b5adf]/90"
          disabled={!bankName || !clabeValid || !rfcValid}
          onClick={() => onSave({ bankName, bankClabe, rfc, fiscalName, currentStep: 6 })}
          data-testid="button-next-step"
        >
          Siguiente <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}

function DC5TramiteStep({ application, onBack, onSubmit, isSubmitting }: { application: InstructorApplication; onBack: () => void; onSubmit: (paymentMethod: string) => void; isSubmitting: boolean }) {
  const [paymentMethod, setPaymentMethod] = useState(application.dc5PaymentMethod || "transfer");

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-serif text-lg text-cedu-ink mb-1" data-testid="text-step-dc5">Trámite DC-5</h3>
        <p className="text-sm text-cedu-ink-muted">Resumen de tu solicitud y opciones de pago del trámite</p>
      </div>

      <Card className="border-[#1b5adf]/20 bg-[#1b5adf]/[0.02]">
        <CardContent className="py-4">
          <h4 className="font-semibold text-sm text-cedu-ink mb-3">Resumen de tu solicitud</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-cedu-ink-muted">Nombre:</span> <span className="font-medium">{application.fullName}</span></div>
            <div><span className="text-cedu-ink-muted">Especialidad:</span> <span className="font-medium">{application.specialty}</span></div>
            <div><span className="text-cedu-ink-muted">Experiencia:</span> <span className="font-medium">{application.yearsExperience} años</span></div>
            <div><span className="text-cedu-ink-muted">Evaluación:</span> <span className="font-medium text-green-600">{application.quizScore}% ✓</span></div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-black/[0.06]">
        <CardContent className="py-4">
          <h4 className="font-semibold text-sm text-cedu-ink mb-3">Costo del trámite DC-5</h4>
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-cedu-ink font-serif">$2,499 <span className="text-sm font-normal text-cedu-ink-muted">MXN</span></p>
            <p className="text-xs text-cedu-ink-muted mt-1">Pago único (incluye gestión ante STPS)</p>
          </div>
          <div className="space-y-2 mt-4">
            <p className="text-xs font-semibold text-cedu-ink mb-2">Método de pago:</p>
            <button
              className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${paymentMethod === "transfer" ? "border-[#1b5adf] bg-[#1b5adf]/5" : "border-black/[0.06]"}`}
              onClick={() => setPaymentMethod("transfer")}
              data-testid="button-payment-transfer"
            >
              <span className="font-medium">Transferencia SPEI</span>
              <p className="text-xs text-cedu-ink-muted mt-0.5">CLABE: 012 180 0001 2345 6789 · Ceduverse S.A.P.I.</p>
            </button>
            <button
              className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${paymentMethod === "commission" ? "border-[#1b5adf] bg-[#1b5adf]/5" : "border-black/[0.06]"}`}
              onClick={() => setPaymentMethod("commission")}
              data-testid="button-payment-commission"
            >
              <span className="font-medium">Descuento de comisiones futuras</span>
              <p className="text-xs text-cedu-ink-muted mt-0.5">Se descontará de tus primeras comisiones como instructor</p>
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
        <div className="flex items-start gap-2">
          <Clock size={14} className="flex-shrink-0 mt-0.5" />
          <p>El trámite DC-5 toma aproximadamente 15-30 días hábiles. Te notificaremos por correo cuando esté listo. Mientras tanto, podrás preparar tu primer curso.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" data-testid="button-prev-step">
          <ArrowLeft size={16} className="mr-2" /> Anterior
        </Button>
        <Button
          className="flex-1 bg-[#1b5adf] hover:bg-[#1b5adf]/90"
          disabled={isSubmitting}
          onClick={() => onSubmit(paymentMethod)}
          data-testid="button-submit-application"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <>Enviar solicitud DC-5 <ArrowRight size={16} className="ml-2" /></>}
        </Button>
      </div>
    </div>
  );
}

const TRAINING_SAMPLE_TEXT = `La capacitación laboral en México es fundamental para el desarrollo profesional de los trabajadores. Conforme a la Ley Federal del Trabajo, todos los empleadores están obligados a proporcionar capacitación y adiestramiento a sus empleados.

En Ceduverse, nos enfocamos en ofrecer cursos que cumplen con los estándares de la Secretaría del Trabajo y Previsión Social. Nuestros programas abarcan temas como seguridad e higiene, salud ocupacional, desarrollo humano, y normatividad laboral.

Al completar cada curso, los participantes reciben una constancia DC-3 que acredita su capacitación ante la STPS. Esta constancia es un documento oficial que demuestra el cumplimiento de las obligaciones de capacitación del patrón.

Te invito a explorar nuestro catálogo de cursos y a iniciar tu proceso de capacitación hoy mismo.`;

type RecorderStep = "intro" | "consent-record" | "consent-review" | "training-record" | "training-review" | "processing" | "ready" | "error";

function DigitalTwinSection() {
  const { toast } = useToast();
  const [step, setStep] = useState<RecorderStep>("intro");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [consentBlob, setConsentBlob] = useState<Blob | null>(null);
  const [trainingBlob, setTrainingBlob] = useState<Blob | null>(null);
  const [processingStatus, setProcessingStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const reviewVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentStepRef = useRef<RecorderStep>(step);

  useEffect(() => { currentStepRef.current = step; }, [step]);

  const token = localStorage.getItem("cedu_token");

  const { data: avatarData, isLoading: avatarLoading } = useQuery<{ avatar: any; hasAvatar: boolean; heygenConfigured: boolean }>({
    queryKey: ["/api/heygen/avatar/me"],
  });

  useEffect(() => {
    if (avatarData?.avatar) {
      const a = avatarData.avatar;
      if (a.avatarStatus === "ready") setStep("ready");
      else if (a.avatarStatus === "processing") {
        setStep("processing");
        setProcessingStatus("Tu Digital Twin está siendo procesado...");
        startPolling();
      }
    }
  }, [avatarData]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startCamera = async (): Promise<boolean> => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await new Promise<void>((resolve) => {
          videoRef.current!.onloadedmetadata = async () => {
            try {
              await videoRef.current?.play();
            } catch (e) {
              console.error("[Camera] Play failed:", e);
            }
            resolve();
          };
        });
      }
      return true;
    } catch {
      setErrorMsg("No se pudo acceder a la cámara. Verifica los permisos de tu navegador.");
      setStep("error");
      return false;
    }
  };

  const stopCamera = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    mediaRecorderRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load();
    }
  };

  const startRecording = (maxSeconds: number) => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setRecordingTime(0);

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : "video/webm";

    const recorder = new MediaRecorder(streamRef.current, { mimeType });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      stopCamera();
      if (currentStepRef.current === "consent-record") {
        setConsentBlob(blob);
        setStep("consent-review");
      } else if (currentStepRef.current === "training-record") {
        setTrainingBlob(blob);
        setStep("training-review");
      }
      setIsRecording(false);
    };

    mediaRecorderRef.current = recorder;
    recorder.start(1000);
    setIsRecording(true);

    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const next = prev + 1;
        if (next >= maxSeconds) stopRecording();
        return next;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const uploadVideo = async (blob: Blob, type: "consent" | "training") => {
    const formData = new FormData();
    formData.append("video", blob, `${type}.webm`);

    const res = await fetch(`/api/heygen/avatar/upload-${type}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Error al subir video");
  };

  const startTwinCreation = async () => {
    stopCamera();
    setStep("processing");
    try {
      if (consentBlob) {
        setProcessingStatus("Subiendo video de consentimiento...");
        await uploadVideo(consentBlob, "consent");
      }
      if (trainingBlob) {
        setProcessingStatus("Subiendo video de entrenamiento...");
        await uploadVideo(trainingBlob, "training");
      }

      setProcessingStatus("Creando tu Digital Twin...");
      const res = await fetch("/api/heygen/avatar/create-twin", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Error al crear Digital Twin");

      setProcessingStatus("Tu Digital Twin está siendo procesado por HeyGen. Esto puede tomar 5-30 minutos...");
      startPolling();
    } catch (err: any) {
      stopCamera();
      setErrorMsg(err.message);
      setStep("error");
    }
  };

  const startPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/heygen/avatar/creation-status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.status === "ready") {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setStep("ready");
          stopCamera();
          queryClient.invalidateQueries({ queryKey: ["/api/heygen/avatar/me"] });
        } else if (data.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setErrorMsg(data.error || "Error al crear Digital Twin");
          setStep("error");
        } else {
          setProcessingStatus(`Procesando tu Digital Twin... (estado: ${data.status})`);
        }
      } catch {}
    }, 30000);
  };

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/heygen/avatar/regenerate");
      return res.json();
    },
    onSuccess: () => {
      setStep("intro");
      setConsentBlob(null);
      setTrainingBlob(null);
      setErrorMsg("");
      queryClient.invalidateQueries({ queryKey: ["/api/heygen/avatar/me"] });
      toast({ title: "Listo", description: "Puedes grabar tu Digital Twin de nuevo" });
    },
  });

  const previewMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/heygen/avatar/generate-preview");
      return res.json();
    },
    onSuccess: (data) => {
      setPreviewVideoId(data.video_id);
      toast({ title: "Video en generación", description: "Tomará 2-5 minutos." });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  if (avatarLoading) {
    return (
      <Card className="border-black/[0.06]">
        <CardContent className="py-6 flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-cedu-blue" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-black/[0.06]" data-testid="card-digital-twin">
      <CardHeader>
        <CardTitle className="font-serif text-base flex items-center gap-2">
          <Cpu size={18} className="text-[#7c3aed]" />
          Digital Twin — Tu Clon Virtual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {step === "intro" && (
          <div className="space-y-4" data-testid="twin-step-intro">
            <p className="text-sm text-cedu-ink-muted">
              Crea tu clon digital grabando un video directamente aquí. Tu Digital Twin aparecerá en todos tus cursos.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#7c3aed]/5 rounded-xl p-3 text-center">
                <Video size={20} className="mx-auto mb-1 text-[#7c3aed]" />
                <p className="text-xs font-semibold text-cedu-ink">Tu rostro</p>
              </div>
              <div className="bg-[#1b5adf]/5 rounded-xl p-3 text-center">
                <Mic size={20} className="mx-auto mb-1 text-[#1b5adf]" />
                <p className="text-xs font-semibold text-cedu-ink">Tu voz</p>
              </div>
              <div className="bg-[#00b87a]/5 rounded-xl p-3 text-center">
                <Cpu size={20} className="mx-auto mb-1 text-[#00b87a]" />
                <p className="text-xs font-semibold text-cedu-ink">Automático</p>
              </div>
            </div>
            <Button
              className="bg-[#7c3aed] hover:bg-[#7c3aed]/90 w-full"
              onClick={async () => {
                const ok = await startCamera();
                if (ok) setStep("consent-record");
              }}
              data-testid="button-start-twin-recording"
            >
              <Video size={14} className="mr-1.5" /> Empezar grabación
            </Button>
          </div>
        )}

        {step === "consent-record" && (
          <div className="space-y-4" data-testid="twin-step-consent-record">
            <div className="bg-[#7c3aed]/5 rounded-xl p-3">
              <p className="text-xs font-semibold text-[#7c3aed] mb-1">Paso 1: Video de Consentimiento</p>
              <p className="text-xs text-cedu-ink-muted">Lee el siguiente texto mirando a la cámara:</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-900 italic leading-relaxed">
                "Yo autorizo a Ceduverse S. C de C de Rl de CV y HeyGen a crear un avatar digital con mi imagen y voz para uso educativo en la plataforma Ceduverse."
              </p>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video ref={videoRef} autoPlay muted playsInline className="w-full aspect-video" style={{ transform: 'scaleX(-1)' }} data-testid="video-consent-preview" />
              {isRecording && (
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-sm font-mono">{formatTime(recordingTime)} / 0:15</span>
                </div>
              )}
            </div>
            {!isRecording ? (
              <Button className="bg-red-500 hover:bg-red-600 w-full" onClick={() => startRecording(15)} data-testid="button-start-consent-rec">
                <span className="w-3 h-3 bg-white rounded-full mr-2" /> Iniciar grabación
              </Button>
            ) : (
              <Button
                className="bg-gray-700 hover:bg-gray-800 w-full"
                onClick={stopRecording}
                disabled={recordingTime < 5}
                data-testid="button-stop-consent-rec"
              >
                <span className="w-3 h-3 bg-red-500 rounded-sm mr-2" /> Detener {recordingTime < 5 && `(mín. 5s)`}
              </Button>
            )}
          </div>
        )}

        {step === "consent-review" && consentBlob && (
          <div className="space-y-4" data-testid="twin-step-consent-review">
            <p className="text-sm font-semibold text-cedu-ink">Revisa tu video de consentimiento:</p>
            <video
              ref={reviewVideoRef}
              src={URL.createObjectURL(consentBlob)}
              controls
              className="w-full rounded-xl aspect-video bg-black"
              data-testid="video-consent-review"
            />
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-[#7c3aed] hover:bg-[#7c3aed]/90"
                onClick={async () => {
                  const ok = await startCamera();
                  if (ok) setStep("training-record");
                }}
                data-testid="button-accept-consent"
              >
                <CheckCircle size={14} className="mr-1.5" /> Usar este video
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={async () => {
                  setConsentBlob(null);
                  const ok = await startCamera();
                  if (ok) setStep("consent-record");
                }}
                data-testid="button-redo-consent"
              >
                <RefreshCw size={14} className="mr-1.5" /> Grabar de nuevo
              </Button>
            </div>
          </div>
        )}

        {step === "training-record" && (
          <div className="space-y-4" data-testid="twin-step-training-record">
            <div className="bg-[#1b5adf]/5 rounded-xl p-3">
              <p className="text-xs font-semibold text-[#1b5adf] mb-1">Paso 2: Video de Entrenamiento (2 min)</p>
              <p className="text-xs text-cedu-ink-muted">Habla de forma natural mirando a la cámara. Puedes leer el texto de ejemplo o hablar libremente.</p>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video ref={videoRef} autoPlay muted playsInline className="w-full aspect-video" style={{ transform: 'scaleX(-1)' }} data-testid="video-training-preview" />
              {isRecording && (
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1.5">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-lg font-mono font-bold">{formatTime(recordingTime)} / 2:00</span>
                </div>
              )}
              {isRecording && (
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
                  <div
                    className="h-full bg-[#1b5adf] transition-all duration-1000"
                    style={{ width: `${Math.min((recordingTime / 120) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
            <details className="bg-gray-50 rounded-xl p-3 cursor-pointer">
              <summary className="text-xs font-semibold text-cedu-ink">Texto de ejemplo para leer (opcional)</summary>
              <p className="text-xs text-cedu-ink-muted mt-2 leading-relaxed whitespace-pre-line">{TRAINING_SAMPLE_TEXT}</p>
            </details>
            {!isRecording ? (
              <Button className="bg-red-500 hover:bg-red-600 w-full" onClick={() => startRecording(120)} data-testid="button-start-training-rec">
                <span className="w-3 h-3 bg-white rounded-full mr-2" /> Iniciar grabación (2 min)
              </Button>
            ) : (
              <Button
                className="bg-gray-700 hover:bg-gray-800 w-full"
                onClick={stopRecording}
                disabled={recordingTime < 90}
                data-testid="button-stop-training-rec"
              >
                <span className="w-3 h-3 bg-red-500 rounded-sm mr-2" /> Detener {recordingTime < 90 && `(mín. 1:30)`}
              </Button>
            )}
          </div>
        )}

        {step === "training-review" && trainingBlob && (
          <div className="space-y-4" data-testid="twin-step-training-review">
            <p className="text-sm font-semibold text-cedu-ink">Revisa tu video de entrenamiento:</p>
            <video
              src={URL.createObjectURL(trainingBlob)}
              controls
              className="w-full rounded-xl aspect-video bg-black"
              data-testid="video-training-review"
            />
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-[#7c3aed] hover:bg-[#7c3aed]/90"
                onClick={startTwinCreation}
                data-testid="button-create-twin"
              >
                <Cpu size={14} className="mr-1.5" /> Crear mi Digital Twin
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={async () => {
                  setTrainingBlob(null);
                  const ok = await startCamera();
                  if (ok) setStep("training-record");
                }}
                data-testid="button-redo-training"
              >
                <RefreshCw size={14} className="mr-1.5" /> Grabar de nuevo
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="text-center py-6 space-y-4" data-testid="twin-step-processing">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#7c3aed]/10 flex items-center justify-center">
              <Loader2 size={32} className="text-[#7c3aed] animate-spin" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-cedu-ink mb-1">Creando tu Digital Twin</h3>
              <p className="text-sm text-cedu-ink-muted">{processingStatus}</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-[#7c3aed] h-full rounded-full animate-pulse" style={{ width: "60%" }} />
            </div>
            <p className="text-xs text-cedu-ink-muted">Puedes cerrar esta página. Te notificaremos cuando esté listo.</p>
          </div>
        )}

        {step === "ready" && (
          <div className="text-center py-4 space-y-4" data-testid="twin-step-ready">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#00b87a]/10 flex items-center justify-center">
              <CheckCircle size={32} className="text-[#00b87a]" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-cedu-ink mb-1">¡Digital Twin Listo!</h3>
              <p className="text-sm text-cedu-ink-muted">Tu clon digital está activo. Ya puedes generar videos para tus cursos.</p>
              {avatarData?.avatar?.heygenAvatarId && (
                <p className="text-[11px] text-cedu-ink-muted mt-1">Avatar ID: {avatarData.avatar.heygenAvatarId.slice(0, 12)}...</p>
              )}
            </div>
            {avatarData?.heygenConfigured && (
              <Button
                variant="outline"
                size="sm"
                className="border-[#7c3aed]/20 text-[#7c3aed] hover:bg-[#7c3aed]/5"
                onClick={() => previewMutation.mutate()}
                disabled={previewMutation.isPending}
                data-testid="button-generate-preview"
              >
                {previewMutation.isPending ? (
                  <><RefreshCw size={14} className="mr-1.5 animate-spin" /> Generando...</>
                ) : (
                  <><Video size={14} className="mr-1.5" /> Generar video de prueba</>
                )}
              </Button>
            )}
            {previewVideoId && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-800">Video en generación (ID: {previewVideoId}). El proceso toma 2-5 minutos.</p>
              </div>
            )}
            <button
              onClick={() => regenerateMutation.mutate()}
              disabled={regenerateMutation.isPending}
              className="text-xs text-cedu-ink-muted hover:text-red-500 transition-colors underline"
              data-testid="button-regenerate-twin"
            >
              {regenerateMutation.isPending ? "Regenerando..." : "Regenerar Digital Twin"}
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="text-center py-4 space-y-4" data-testid="twin-step-error">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-cedu-ink mb-1">Error</h3>
              <p className="text-sm text-red-600">{errorMsg}</p>
            </div>
            <Button
              className="bg-[#1b5adf] hover:bg-[#1b5adf]/90"
              onClick={() => { setErrorMsg(""); setStep("intro"); }}
              data-testid="button-retry-twin"
            >
              Intentar de nuevo
            </Button>
          </div>
        )}

      </CardContent>
    </Card>
  );
}

function InstructorBadge({ application }: { application: InstructorApplication }) {
  const badgeType = application.type === "dc5" ? "acreditado_dc5" : "interno";
  const badgeTitle = badgeType === "acreditado_dc5"
    ? "Instructor Acreditado STPS (DC-5)"
    : "Instructor Interno Ceduverse";
  const acreditationDate = application.activatedAt
    ? new Date(application.activatedAt).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="border-2 border-[#1b5adf]/20 rounded-2xl p-6 bg-gradient-to-br from-white to-[#1b5adf]/5 text-center space-y-3" data-testid="card-instructor-badge">
      <div className="w-14 h-14 mx-auto bg-[#1b5adf] rounded-2xl flex items-center justify-center text-white font-serif text-2xl">
        C
      </div>
      <p className="text-[10px] uppercase tracking-widest text-cedu-ink-muted">Ceduverse — Certificado de Instructor</p>
      <h3 className="font-serif text-lg text-cedu-ink" data-testid="text-badge-name">{application.fullName || "Instructor"}</h3>
      <Badge className={`${badgeType === "acreditado_dc5" ? "bg-[#1b5adf]/10 text-[#1b5adf]" : "bg-green-100 text-green-700"} border-0 text-xs px-3 py-1`} data-testid="text-badge-type">
        {badgeTitle}
      </Badge>
      {application.instructorNumber && (
        <p className="text-xs text-cedu-ink-muted" data-testid="text-badge-folio">No. de Socio: {application.instructorNumber}</p>
      )}
      <p className="text-[11px] text-cedu-ink-muted">Acreditado el {acreditationDate}</p>
      <div className="flex items-center justify-center gap-1 pt-1">
        <Award size={14} className="text-[#1b5adf]" />
        <span className="text-[10px] text-[#1b5adf] font-semibold">Verificado</span>
      </div>
    </div>
  );
}

function PendingView({ application }: { application: InstructorApplication }) {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f4] to-white px-4 py-12">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-amber-100">
          <Clock size={40} className="text-amber-600" />
        </div>
        <h2 className="font-serif text-2xl text-cedu-ink mb-3" data-testid="text-application-status">
          Solicitud enviada
        </h2>
        <p className="text-cedu-ink-muted mb-6">
          {application.type === "dc5"
            ? "Tu solicitud DC-5 está en proceso. Te notificaremos cuando esté lista."
            : "Tu solicitud está siendo revisada por el equipo."
          }
        </p>
        <Button variant="outline" onClick={() => setLocation("/dashboard")} data-testid="button-go-dashboard">
          Volver al Dashboard
        </Button>
      </div>
    </div>
  );
}

const ONBOARDING_SLIDES = [
  { title: "¡Bienvenido, Instructor!", icon: Trophy, color: "#1b5adf" },
  { title: "Crea tu Primer Curso", icon: PenTool, color: "#7c3aed" },
  { title: "Tu Digital Twin", icon: Video, color: "#f28023" },
  { title: "Firma Digital", icon: Award, color: "#00b87a" },
  { title: "¡Todo Listo!", icon: Rocket, color: "#1b5adf" },
];

function OnboardingWizard({ application }: { application: InstructorApplication }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: onboardingData } = useQuery<{ step: number }>({
    queryKey: ["/api/instructor-onboarding/step"],
  });

  const savedStep = onboardingData?.step ?? 0;
  const [slide, setSlide] = useState(0);
  const [hasRestoredStep, setHasRestoredStep] = useState(false);

  useEffect(() => {
    if (!hasRestoredStep && onboardingData && onboardingData.step > 0 && onboardingData.step < 5) {
      setSlide(onboardingData.step);
      setHasRestoredStep(true);
    } else if (!hasRestoredStep && onboardingData) {
      setHasRestoredStep(true);
    }
  }, [onboardingData, hasRestoredStep]);

  const stepMutation = useMutation({
    mutationFn: async (newStep: number) => {
      const res = await apiRequest("PATCH", "/api/instructor-onboarding/step", { step: newStep });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instructor-onboarding/step"] });
    },
  });

  const goNext = () => {
    const next = Math.min(slide + 1, 4);
    setSlide(next);
    stepMutation.mutate(next);
  };

  const goPrev = () => {
    setSlide(Math.max(slide - 1, 0));
  };

  const finishOnboarding = async () => {
    try {
      await stepMutation.mutateAsync(5);
    } catch {
      console.warn("[Onboarding] Could not mark as complete, proceeding anyway");
    }
    setLocation("/instructor");
  };

  const skipSlide = () => goNext();

  if (savedStep >= 5) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf8f4] to-white px-4 py-12">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <InstructorBadge application={application} />
          <div className="pt-2 space-y-3">
            <Button className="bg-[#1b5adf] hover:bg-[#1b5adf]/90 w-full" onClick={() => setLocation("/instructor")} data-testid="button-go-instructor">
              Ir al Panel de Instructor <ArrowRight size={16} className="ml-2" />
            </Button>
            <Button variant="outline" className="w-full" onClick={() => { setSlide(0); stepMutation.mutate(0); }} data-testid="button-restart-onboarding">
              Repetir bienvenida
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f4] to-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          {ONBOARDING_SLIDES.map((s, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i === slide ? "scale-125" : "opacity-40"
              }`}
              style={{ backgroundColor: i === slide ? s.color : "#94a3b8" }}
              data-testid={`onboarding-dot-${i}`}
            />
          ))}
        </div>

        <div className="min-h-[480px] flex flex-col">
          {slide === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <Trophy size={40} className="text-green-600" />
              </div>
              <div>
                <h2 className="font-serif text-3xl text-cedu-ink mb-2" data-testid="text-onboarding-welcome">
                  ¡Felicidades, {application.fullName?.split(" ")[0] || "Instructor"}!
                </h2>
                <p className="text-cedu-ink-muted text-lg">
                  Ya eres Instructor {application.type === "dc5" ? "Acreditado DC-5" : "Interno"} de Ceduverse
                </p>
                {application.instructorNumber && (
                  <p className="text-sm text-cedu-ink-muted mt-2">
                    Tu folio de socio: <span className="font-semibold text-cedu-ink">{application.instructorNumber}</span>
                  </p>
                )}
              </div>
              <InstructorBadge application={application} />
              <p className="text-sm text-cedu-ink-muted max-w-md">
                Vamos a configurar tu espacio de instructor en unos pasos rápidos. Puedes omitir cualquier paso y volver después.
              </p>
            </div>
          )}

          {slide === 1 && (
            <div className="flex-1 flex flex-col items-center text-center space-y-6 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-[#7c3aed]/10 flex items-center justify-center">
                <Sparkles size={32} className="text-[#7c3aed]" />
              </div>
              <div>
                <h2 className="font-serif text-2xl text-cedu-ink mb-2" data-testid="text-onboarding-tools">
                  ¿Qué puedes hacer como instructor?
                </h2>
                <p className="text-cedu-ink-muted max-w-md">
                  Tu panel de instructor tiene todo lo que necesitas para crear, enseñar y crecer.
                </p>
              </div>
              <div className="w-full max-w-md space-y-3">
                {[
                  { icon: BookOpen, color: "#7c3aed", title: "Crear cursos", desc: "Desde tu panel puedes crear cursos con módulos, evaluaciones y certificados DC-3" },
                  { icon: Video, color: "#f28023", title: "Digital Twin", desc: "Graba un video de 2 min y tu clon digital presentará tus cursos automáticamente" },
                  { icon: Users, color: "#1b5adf", title: "Sesiones en vivo", desc: "Ofrece clases privadas y grupales a tus alumnos vía video" },
                  { icon: Banknote, color: "#00b87a", title: "Ganar comisiones", desc: "Recibe el 50% de cada sesión privada y comisiones por constancias DC-3" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-black/[0.06] text-left">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.color}10` }}>
                      <item.icon size={20} style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-cedu-ink">{item.title}</p>
                      <p className="text-xs text-cedu-ink-muted mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {slide === 2 && (
            <div className="flex-1 flex flex-col items-center text-center space-y-6 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-[#f28023]/10 flex items-center justify-center">
                <Video size={32} className="text-[#f28023]" />
              </div>
              <div>
                <h2 className="font-serif text-2xl text-cedu-ink mb-2" data-testid="text-onboarding-twin">
                  Tu Digital Twin (Opcional)
                </h2>
                <p className="text-cedu-ink-muted max-w-md">
                  Crea un avatar IA que puede dar clases por ti. Necesitas grabar un video de consentimiento y un video de entrenamiento de 2 minutos.
                </p>
              </div>
              <Card className="w-full max-w-md border-[#f28023]/20">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Cpu size={20} className="text-[#f28023] flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-cedu-ink">Tecnología HeyGen</p>
                      <p className="text-xs text-cedu-ink-muted">Tu avatar puede presentar cursos, responder preguntas y dar sesiones en vivo.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={20} className="text-[#f28023] flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-cedu-ink">~5 minutos de grabación</p>
                      <p className="text-xs text-cedu-ink-muted">El procesamiento tarda unas horas. Te notificamos cuando esté listo.</p>
                    </div>
                  </div>
                  <DigitalTwinSection />
                </CardContent>
              </Card>
              <p className="text-xs text-cedu-ink-muted">
                Puedes hacer esto después desde tu Panel de Instructor.
              </p>
            </div>
          )}

          {slide === 3 && (
            <div className="flex-1 flex flex-col items-center text-center space-y-6 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-[#00b87a]/10 flex items-center justify-center">
                <Award size={32} className="text-[#00b87a]" />
              </div>
              <div>
                <h2 className="font-serif text-2xl text-cedu-ink mb-2" data-testid="text-onboarding-firma">
                  Tu Firma Digital
                </h2>
                <p className="text-cedu-ink-muted max-w-md">
                  Se generó automáticamente tu firma digital y tarjeta de contacto (vCard). Las puedes compartir con tus alumnos y contactos profesionales.
                </p>
              </div>
              <Card className="w-full max-w-md border-[#00b87a]/20">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-[#00b87a] flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-cedu-ink">Firma generada automáticamente</p>
                      <p className="text-xs text-cedu-ink-muted">Tu firma se creó al completar la acreditación.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar size={20} className="text-[#00b87a] flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-cedu-ink">vCard de contacto</p>
                      <p className="text-xs text-cedu-ink-muted">Comparte tu tarjeta digital con QR desde tu perfil.</p>
                    </div>
                  </div>
                  <p className="text-xs text-cedu-ink-muted text-center pt-2">
                    Encontrarás tu firma y vCard en la sección "Mi Tarjeta Digital" de tu Dashboard.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {slide === 4 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300">
              <div className="w-20 h-20 rounded-full bg-[#1b5adf]/10 flex items-center justify-center">
                <Rocket size={40} className="text-[#1b5adf]" />
              </div>
              <div>
                <h2 className="font-serif text-3xl text-cedu-ink mb-2" data-testid="text-onboarding-ready">
                  ¡Todo Listo!
                </h2>
                <p className="text-cedu-ink-muted text-lg max-w-md">
                  Tu espacio de instructor está configurado. Ya puedes crear cursos, dar sesiones y crecer tu comunidad.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                {[
                  { icon: BookOpen, label: "Crear cursos", color: "#7c3aed" },
                  { icon: Video, label: "Digital Twin", color: "#f28023" },
                  { icon: Users, label: "Mis alumnos", color: "#1b5adf" },
                  { icon: Banknote, label: "Mis ingresos", color: "#00b87a" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-white border border-black/[0.06]">
                    <item.icon size={18} style={{ color: item.color }} />
                    <span className="text-sm text-cedu-ink">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-black/[0.06]">
          <div>
            {slide > 0 && (
              <Button variant="ghost" onClick={goPrev} data-testid="button-onboarding-prev">
                <ArrowLeft size={16} className="mr-1" /> Anterior
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {slide < 4 && slide > 0 && (
              <Button variant="ghost" className="text-cedu-ink-muted" onClick={skipSlide} data-testid="button-onboarding-skip">
                Omitir
              </Button>
            )}
            {slide < 4 ? (
              <Button
                className="bg-[#1b5adf] hover:bg-[#1b5adf]/90 text-white"
                onClick={goNext}
                data-testid="button-onboarding-next"
              >
                Siguiente <ArrowRight size={16} className="ml-1" />
              </Button>
            ) : (
              <Button
                className="bg-[#1b5adf] hover:bg-[#1b5adf]/90 text-white px-8"
                onClick={finishOnboarding}
                data-testid="button-onboarding-finish"
              >
                Ir a mi Panel <Rocket size={16} className="ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WizardView({ application: initialApp }: { application: InstructorApplication }) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(initialApp.currentStep || 1);

  const { data: application } = useQuery<InstructorApplication>({
    queryKey: ["/api/instructor-application/mine"],
    initialData: initialApp,
  });

  const app = application || initialApp;
  const isDc5 = app.type === "dc5";
  const steps = isDc5 ? DC5_STEPS : INTERNAL_STEPS;
  const totalSteps = steps.length;

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/instructor-application", data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/instructor-application/mine"] });
      if (variables.currentStep && variables.currentStep <= totalSteps) {
        setCurrentStep(variables.currentStep);
      }
    },
    onError: (err: Error) => {
      toast({ title: "Error al guardar", description: err.message, variant: "destructive" });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (paymentMethod?: string) => {
      if (isDc5 && paymentMethod) {
        await apiRequest("PATCH", "/api/instructor-application", { dc5PaymentMethod: paymentMethod });
      }
      const res = await apiRequest("POST", "/api/instructor-application/submit");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instructor-application/mine"] });
      toast({ title: isDc5 ? "Solicitud DC-5 enviada" : "¡Activación exitosa!" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (app.status === "pending_dc5" || app.status === "pending_review") {
    return <PendingView application={app} />;
  }

  if (app.status === "active") {
    return <OnboardingWizard application={app} />;
  }

  const handleSave = (data: any) => saveMutation.mutate(data);
  const goBack = () => setCurrentStep(Math.max(1, currentStep - 1));

  const renderStep = () => {
    if (isDc5) {
      switch (currentStep) {
        case 1: return <ProfileStep application={app} onSave={handleSave} />;
        case 2: return <ExperienceStep application={app} onSave={handleSave} onBack={goBack} isDc5={true} />;
        case 3: return <QuizStep application={app} onBack={goBack} onQuizPassed={() => { saveMutation.mutate({ currentStep: 4 }); setCurrentStep(4); }} />;
        case 4: return <TermsStep application={app} onBack={goBack} onAccepted={() => { saveMutation.mutate({ currentStep: 5 }); setCurrentStep(5); }} />;
        case 5: return <PaymentStep application={app} onSave={handleSave} onBack={goBack} />;
        case 6: return <DC5TramiteStep application={app} onBack={goBack} onSubmit={(pm) => submitMutation.mutate(pm)} isSubmitting={submitMutation.isPending} />;
        default: return <ProfileStep application={app} onSave={handleSave} />;
      }
    } else {
      switch (currentStep) {
        case 1: return <ProfileStep application={app} onSave={handleSave} />;
        case 2: return <ExperienceStep application={app} onSave={handleSave} onBack={goBack} isDc5={false} />;
        case 3: return <QuizStep application={app} onBack={goBack} onQuizPassed={() => { saveMutation.mutate({ currentStep: 4 }); setCurrentStep(4); }} />;
        case 4: return <TermsStep application={app} onBack={goBack} onAccepted={() => submitMutation.mutate()} />;
        default: return <ProfileStep application={app} onSave={handleSave} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1b5adf] to-[#7c3aed] rounded-xl flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-serif text-xl text-cedu-ink" data-testid="text-wizard-title">
                {isDc5 ? "Acreditación STPS (DC-5)" : "Acreditación Instructor Interno"}
              </h2>
              <p className="text-xs text-cedu-ink-muted">Paso {currentStep} de {totalSteps}</p>
            </div>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-1.5 mb-3" />
          <StepIndicator steps={steps} currentStep={currentStep} type={app.type} />
        </div>

        <Card className="border-black/[0.06]">
          <CardContent className="py-6">
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function InstructorAcreditacion() {
  useForceLightMode();
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: application, isLoading: appLoading } = useQuery<InstructorApplication | null>({
    queryKey: ["/api/instructor-application/mine"],
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (type: "dc5" | "internal") => {
      const res = await apiRequest("POST", "/api/instructor-application", { type });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instructor-application/mine"] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (!authLoading && !user) setLocation("/auth");
  }, [authLoading, user]);

  if (authLoading || appLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-cedu-blue" />
      </div>
    );
  }

  if (!user) return null;

  if (application) {
    return <WizardView application={application} />;
  }

  return (
    <LandingView onSelect={(type) => createMutation.mutate(type)} />
  );
}

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useParams, Link } from "wouter";
import { useForceLightMode } from "@/components/ThemeProvider";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Layers,
  GraduationCap,
  Award,
  Clock,
  Users,
  MessageCircle,
  FileText,
  Shield,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type AcademyCourseDetail = {
  ID: number;
  post_title: string;
  post_excerpt?: string;
  post_content?: string;
  post_status: string;
  post_date: string;
  guid: string;
  thumbnail?: string;
  [key: string]: any;
};

type CurriculumItem = {
  type: "section" | "unit" | "quiz";
  title: string;
  ID?: number;
  unit_type?: string;
  duration?: string;
  index: number;
  content?: string;
  [key: string]: any;
};

type CurriculumData = {
  course_id: number;
  title: string;
  total_items: number;
  curriculum: CurriculumItem[];
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function formatDuration(raw?: string): string | null {
  if (!raw) return null;
  const num = parseInt(raw, 10);
  if (isNaN(num) || num <= 0) return null;
  if (num >= 9000) return null;
  if (num >= 60) {
    const hrs = Math.floor(num / 60);
    const mins = num % 60;
    return mins > 0 ? `${hrs}h ${mins}min` : `${hrs}h`;
  }
  return `${num} min`;
}

function estimateCourseDuration(totalUnits: number): string {
  const days = Math.max(5, Math.ceil(totalUnits * 1.5));
  if (days <= 7) return `${days} días`;
  const weeks = Math.ceil(days / 7);
  return `${weeks} semanas`;
}

export default function AcademyCourse() {
  useForceLightMode();
  const params = useParams<{ id: string }>();
  const courseId = parseInt(params.id || "0");
  const { user } = useAuth();
  const [syllabusExpanded, setSyllabusExpanded] = useState(true);
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());

  const { data: course, isLoading: courseLoading } = useQuery<AcademyCourseDetail>({
    queryKey: ["/api/academy/courses", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/academy/courses/${courseId}`);
      if (!res.ok) throw new Error("Error al cargar curso");
      return res.json();
    },
    enabled: courseId > 0,
  });

  const { data: curriculum, isLoading: curriculumLoading } = useQuery<CurriculumData>({
    queryKey: ["/api/academy/courses", courseId, "curriculum"],
    queryFn: async () => {
      const res = await fetch(`/api/academy/courses/${courseId}/curriculum`);
      if (!res.ok) throw new Error("Error al cargar contenido");
      return res.json();
    },
    enabled: courseId > 0,
  });

  const isLoading = courseLoading || curriculumLoading;

  const allItems = curriculum?.curriculum || [];
  const sections = allItems.filter(item => item.type === "section");
  const units = allItems.filter(item => item.type === "unit");

  const groupedSections: { section: CurriculumItem | null; units: CurriculumItem[] }[] = [];
  let currentGroup: { section: CurriculumItem | null; units: CurriculumItem[] } = { section: null, units: [] };

  for (const item of allItems) {
    if (item.type === "section") {
      if (currentGroup.units.length > 0 || currentGroup.section) {
        groupedSections.push(currentGroup);
      }
      currentGroup = { section: item, units: [] };
    } else if (item.type === "unit") {
      currentGroup.units.push(item);
    }
  }
  if (currentGroup.units.length > 0 || currentGroup.section) {
    groupedSections.push(currentGroup);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cedu-cream">
        <div className="h-14 bg-white border-b border-black/[0.06]" />
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Skeleton className="h-10 w-80 mb-4" />
          <Skeleton className="h-4 w-64 mb-8" />
          <Skeleton className="h-64 rounded-xl mb-6" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-cedu-cream flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-cedu-ink-muted/40 mb-4" />
          <h2 className="font-serif text-xl text-cedu-ink mb-2">Curso no encontrado</h2>
          <Link href="/dashboard">
            <Button variant="outline" className="mt-4" data-testid="button-back-dashboard">
              <ArrowLeft size={16} className="mr-2" /> Volver
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const courseTitle = course.post_title || "Curso Academy";
  const courseExcerpt = course.post_excerpt ? stripHtml(course.post_excerpt) : "";
  const courseContent = course.post_content ? stripHtml(course.post_content) : "";
  const totalUnits = units.length;
  const courseDuration = estimateCourseDuration(totalUnits);

  return (
    <div className="min-h-screen bg-cedu-cream" data-testid="page-academy-course">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/[0.06] h-14 flex items-center px-4 gap-3">
        <Link href={user ? "/dashboard" : "/academy"}>
          <Button variant="ghost" size="sm" className="text-cedu-ink-muted" data-testid="button-back">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-cedu-ink truncate" data-testid="text-nav-title">{courseTitle}</p>
          <p className="text-[11px] text-cedu-ink-muted">Ceduverse Academy</p>
        </div>
      </nav>

      <div className="pt-14">
        <div className="w-full bg-gradient-to-b from-cedu-blue/8 to-cedu-cream py-10 md:py-14">
          <div className="max-w-2xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-5">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={courseTitle}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md flex-shrink-0"
                  data-testid="img-course-thumbnail"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-cedu-blue/10 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-md">
                  <GraduationCap size={28} className="text-cedu-blue" />
                </div>
              )}
              <div>
                <Badge variant="secondary" className="mb-1.5 text-[10px] bg-cedu-blue/10 text-cedu-blue border-0">
                  Ceduverse Academy
                </Badge>
                <h1 className="font-serif text-xl md:text-2xl text-cedu-ink leading-snug" data-testid="text-course-title">
                  {courseTitle}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-cedu-ink-muted">
              {totalUnits > 0 && (
                <span className="flex items-center gap-1.5">
                  <Layers size={14} /> {totalUnits} {totalUnits === 1 ? "módulo" : "módulos"}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock size={14} /> Duración aprox: {courseDuration}
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap size={14} /> Con certificación
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          {courseExcerpt && (
            <div>
              <h2 className="font-serif text-lg text-cedu-ink mb-3 flex items-center gap-2">
                <FileText size={18} className="text-cedu-blue" />
                Acerca del curso
              </h2>
              <p className="text-cedu-ink-soft text-[15px] leading-relaxed" data-testid="text-course-excerpt">
                {courseExcerpt}
              </p>
            </div>
          )}

          {groupedSections.length > 0 && (
            <div>
              <button
                onClick={() => setSyllabusExpanded(!syllabusExpanded)}
                className="w-full flex items-center justify-between mb-4"
                data-testid="button-toggle-syllabus"
              >
                <h2 className="font-serif text-lg text-cedu-ink flex items-center gap-2">
                  <BookOpen size={18} className="text-cedu-blue" />
                  Temario del curso ({totalUnits} {totalUnits === 1 ? "unidad" : "unidades"})
                </h2>
                {syllabusExpanded ? (
                  <ChevronUp size={18} className="text-cedu-ink-muted" />
                ) : (
                  <ChevronDown size={18} className="text-cedu-ink-muted" />
                )}
              </button>

              {syllabusExpanded && (
                <div className="space-y-2" data-testid="syllabus-content">
                  {groupedSections.map((group, gi) => (
                    <div key={gi}>
                      {group.section && (
                        <div className="mb-2 mt-3 first:mt-0">
                          <p className="text-xs font-bold text-cedu-ink-muted uppercase tracking-wider px-1">
                            {group.section.title}
                          </p>
                        </div>
                      )}
                      <div className="space-y-1.5">
                        {group.units.map((unit, ui) => {
                          const duration = formatDuration(unit.duration);
                          const unitContent = unit.content ? stripHtml(unit.content).trim() : "";
                          const isExpanded = expandedUnits.has(unit.index);
                          const hasContent = unitContent.length > 0;
                          const toggleUnit = () => {
                            if (!hasContent) return;
                            setExpandedUnits(prev => {
                              const next = new Set(prev);
                              if (next.has(unit.index)) next.delete(unit.index);
                              else next.add(unit.index);
                              return next;
                            });
                          };
                          return (
                            <Card
                              key={unit.index}
                              className={`border-black/[0.06] overflow-hidden transition-colors ${hasContent ? "cursor-pointer hover:border-cedu-blue/20" : ""}`}
                              data-testid={`syllabus-unit-${unit.index}`}
                            >
                              <div
                                className="flex items-center gap-3 px-4 py-3"
                                onClick={toggleUnit}
                              >
                                <div className="w-6 h-6 rounded-full bg-cedu-blue/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-[11px] font-bold text-cedu-blue">{ui + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-cedu-ink font-medium leading-snug">{unit.title}</p>
                                  {duration && (
                                    <span className="text-[11px] text-cedu-ink-muted flex items-center gap-1 mt-0.5">
                                      <Clock size={10} /> {duration}
                                    </span>
                                  )}
                                </div>
                                {hasContent && (
                                  isExpanded
                                    ? <ChevronUp size={16} className="text-cedu-ink-muted flex-shrink-0" />
                                    : <ChevronDown size={16} className="text-cedu-ink-muted flex-shrink-0" />
                                )}
                              </div>
                              {isExpanded && hasContent && (
                                <div className="px-4 pb-3 pt-0 border-t border-black/[0.04]">
                                  <p className="text-xs text-cedu-ink-soft leading-relaxed pt-3">
                                    {unitContent}
                                  </p>
                                </div>
                              )}
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Card className="border-cedu-blue/20 bg-gradient-to-br from-cedu-blue/5 to-cedu-violet/5">
            <CardContent className="py-8">
              <div className="text-center max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-cedu-blue/10 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={28} className="text-cedu-blue" />
                </div>
                <h2 className="font-serif text-xl text-cedu-ink mb-2" data-testid="text-cta-title">
                  ¿Te interesa este curso?
                </h2>
                <p className="text-sm text-cedu-ink-soft mb-5 leading-relaxed">
                  Envía un mensaje a un gestor académico directamente desde la plataforma.
                  Te orientará sobre opciones de inscripción, certificación y planes de pago.
                </p>
                <Link href={user
                  ? `/mensajes?courseId=${courseId}&courseName=${encodeURIComponent(courseTitle)}`
                  : "/auth"
                }>
                  <Button
                    className="bg-cedu-blue hover:bg-cedu-blue-dark text-white gap-2"
                    data-testid="button-contact-advisor"
                  >
                    <MessageCircle size={16} />
                    Contactar gestor académico
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-black/[0.06]">
            <CardContent className="py-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-cedu-green/10 flex items-center justify-center flex-shrink-0">
                  <Shield size={20} className="text-cedu-green" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-cedu-ink mb-1" data-testid="text-rvoe-title">
                    Cursos con RVOE
                  </h3>
                  <p className="text-xs text-cedu-ink-soft leading-relaxed">
                    Varios de nuestros programas cuentan con <strong>Reconocimiento de Validez Oficial de Estudios (RVOE)</strong> otorgado 
                    por la Secretaría de Educación Pública. Consulta con tu gestor académico qué cursos cuentan con este reconocimiento 
                    y los requisitos para obtener tu certificación oficial.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-black/[0.06]">
            <CardContent className="py-5">
              <h3 className="font-serif text-base text-cedu-ink mb-4 flex items-center gap-2">
                <Award size={18} className="text-cedu-orange" />
                ¿Qué incluyen nuestros cursos?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: BookOpen, text: "Contenido actualizado y revisado por expertos" },
                  { icon: GraduationCap, text: "Certificación al completar el programa" },
                  { icon: Users, text: "Soporte de instructores especializados" },
                  { icon: Clock, text: "Acceso flexible a tu ritmo" },
                  { icon: Star, text: "Material didáctico descargable" },
                  { icon: CheckCircle2, text: "Evaluaciones y retroalimentación" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-cedu-ink-soft">
                    <item.icon size={16} className="text-cedu-blue flex-shrink-0" />
                    {item.text}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center pb-8">
            <Link href={user ? "/dashboard" : "/academy"}>
              <Button variant="outline" className="gap-2" data-testid="button-back-bottom">
                <ArrowLeft size={16} /> Volver
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

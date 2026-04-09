import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import { useForceLightMode } from "@/components/ThemeProvider";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  Clock,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Star,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
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

interface AcademyCourse {
  ID: number;
  post_title: string;
  post_status: string;
  post_date: string;
  post_author: string;
  post_excerpt: string;
  guid: string;
  thumbnail?: string;
  categories?: string[];
  [key: string]: any;
}

interface AcademyResponse {
  posts: AcademyCourse[];
  total: number;
  pages: number;
  current_page: number;
  configured: boolean;
}

function CourseCard({ course }: { course: AcademyCourse }) {
  const excerpt = course.post_excerpt
    ? course.post_excerpt.replace(/<[^>]*>/g, "").slice(0, 140)
    : "";

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={0}
      className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      data-testid={`card-academy-course-${course.ID}`}
    >
      <div className="w-full h-44 bg-gradient-to-br from-cedu-blue/10 to-cedu-blue/5 flex items-center justify-center">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.post_title}
            className="w-full h-full object-cover"
          />
        ) : (
          <BookOpen size={48} className="text-cedu-blue/30" />
        )}
      </div>
      <div className="p-5">
        <h3
          className="font-semibold text-cedu-ink text-lg leading-snug mb-2 line-clamp-2"
          data-testid={`text-course-title-${course.ID}`}
        >
          {course.post_title}
        </h3>
        {excerpt && (
          <p className="text-sm text-cedu-ink-muted leading-relaxed mb-4 line-clamp-3">
            {excerpt}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-cedu-ink-soft mb-4">
          {course.post_date && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {new Date(course.post_date).toLocaleDateString("es-MX", {
                year: "numeric",
                month: "short",
              })}
            </span>
          )}
          {course.post_status === "publish" && (
            <span className="flex items-center gap-1 text-green-600">
              <Star size={12} />
              Publicado
            </span>
          )}
        </div>
        <Link
          href={`/academy/${course.ID}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-cedu-blue hover:underline no-underline"
          data-testid={`link-course-${course.ID}`}
        >
          Ver curso <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}

export default function AcademyPage() {
  useForceLightMode();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery<AcademyResponse>({
    queryKey: ["/api/academy/courses", searchQuery, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "12");
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/academy/courses?${params}`);
      if (!res.ok) throw new Error("Error al cargar cursos");
      return res.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(search);
    setPage(1);
  };

  const courses = data?.posts || [];
  const totalPages = data?.pages || 0;
  const isConfigured = data?.configured !== false;

  return (
    <div className="min-h-screen bg-cedu-cream">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cedu-cream/85 backdrop-blur-xl border-b border-black/[0.06] shadow-sm" data-testid="navbar-academy">
        <div className="max-w-[1160px] mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 no-underline" data-testid="link-logo-academy">
            <div className="w-9 h-9 bg-cedu-blue rounded-[10px] flex items-center justify-center text-white font-serif text-xl">C</div>
            <div className="font-serif text-2xl text-cedu-ink tracking-tight" translate="no">Cedu<em className="text-cedu-blue not-italic italic">verse</em></div>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button variant="ghost" className="text-cedu-ink-muted text-sm gap-1.5" data-testid="link-dashboard">
                  <ArrowLeft size={16} /> Mi Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/empresas">
                  <Button variant="ghost" className="text-cedu-ink-muted text-sm" data-testid="link-empresas">
                    Empresas
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="bg-cedu-blue hover:bg-cedu-blue/90 text-white rounded-full px-6 text-sm font-semibold" data-testid="link-auth">
                    Iniciar sesión
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="pt-28 pb-12 px-6" data-testid="section-hero-academy">
        <div className="max-w-[900px] mx-auto text-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 bg-cedu-blue/10 text-cedu-blue text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              <GraduationCap size={16} />
              Ceduverse Academy
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <h1 className="font-serif text-4xl md:text-[48px] leading-[1.1] text-cedu-ink mb-4" data-testid="text-academy-heading">
              Explora nuestros cursos
            </h1>
          </AnimatedSection>
          <AnimatedSection>
            <p className="text-lg text-cedu-ink-muted max-w-[600px] mx-auto mb-8 leading-relaxed" data-testid="text-academy-subtitle">
              Programas diseñados por expertos de la industria. Diploma digital de participación gratuito al aprobar. Certificado SEP opcional.
            </p>
          </AnimatedSection>
          <AnimatedSection>
            <form onSubmit={handleSearch} className="flex items-center gap-3 max-w-[500px] mx-auto" data-testid="form-search-academy">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cedu-ink-soft" />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar cursos..."
                  className="pl-10 rounded-full border-black/[0.08]"
                  data-testid="input-search-academy"
                />
              </div>
              <Button type="submit" className="bg-cedu-blue hover:bg-cedu-blue/90 text-white rounded-full px-6" data-testid="button-search-academy">
                Buscar
              </Button>
            </form>
          </AnimatedSection>
        </div>
      </section>

      <section className="pb-20 px-6" data-testid="section-courses-grid">
        <div className="max-w-[1160px] mx-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-20" data-testid="div-loading">
              <Loader2 size={32} className="animate-spin text-cedu-blue" />
              <span className="ml-3 text-cedu-ink-muted">Cargando cursos...</span>
            </div>
          )}

          {!isLoading && !isConfigured && (
            <AnimatedSection>
              <div className="text-center py-16 bg-white rounded-2xl border border-black/[0.06]" data-testid="div-not-configured">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} className="text-amber-600" />
                </div>
                <h3 className="font-serif text-2xl text-cedu-ink mb-2">Academy no configurada</h3>
                <p className="text-cedu-ink-muted max-w-[400px] mx-auto mb-6">
                  Para mostrar los cursos de la Academy, se necesita configurar la conexión con el servidor.
                </p>
                <Link href="/">
                  <Button variant="outline" className="rounded-full px-6 border-cedu-blue text-cedu-blue" data-testid="link-back-home">
                    <ArrowRight className="mr-2 rotate-180" size={16} /> Volver al inicio
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          )}

          {!isLoading && error && (
            <div className="text-center py-16" data-testid="div-error">
              <AlertCircle size={32} className="text-red-500 mx-auto mb-3" />
              <p className="text-cedu-ink-muted">Error al cargar los cursos. Intenta de nuevo más tarde.</p>
            </div>
          )}

          {!isLoading && isConfigured && courses.length === 0 && !error && (
            <div className="text-center py-16" data-testid="div-empty">
              <BookOpen size={48} className="text-cedu-ink-soft mx-auto mb-4" />
              <h3 className="font-serif text-xl text-cedu-ink mb-2">
                {searchQuery ? "No se encontraron cursos" : "Sin cursos disponibles"}
              </h3>
              <p className="text-cedu-ink-muted">
                {searchQuery
                  ? `No hay resultados para "${searchQuery}". Intenta con otro término.`
                  : "Los cursos se están cargando. Vuelve pronto."}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  className="mt-4 rounded-full"
                  onClick={() => { setSearch(""); setSearchQuery(""); setPage(1); }}
                  data-testid="button-clear-search"
                >
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          )}

          {!isLoading && courses.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-cedu-ink-muted" data-testid="text-results-count">
                  {data?.total || courses.length} curso{(data?.total || courses.length) !== 1 ? "s" : ""} encontrado{(data?.total || courses.length) !== 1 ? "s" : ""}
                  {searchQuery && <span className="ml-1">para &quot;{searchQuery}&quot;</span>}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-courses">
                {courses.map((course) => (
                  <CourseCard key={course.ID} course={course} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12" data-testid="div-pagination">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft size={16} /> Anterior
                  </Button>
                  <span className="text-sm text-cedu-ink-muted px-4">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    data-testid="button-next-page"
                  >
                    Siguiente <ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="py-16 px-6 bg-white border-t border-black/[0.06]" data-testid="section-stps-cta">
        <div className="max-w-[800px] mx-auto text-center">
          <AnimatedSection>
            <h2 className="font-serif text-2xl md:text-3xl text-cedu-ink mb-3">
              ¿Buscas cursos con registro STPS?
            </h2>
            <p className="text-cedu-ink-muted mb-6 leading-relaxed">
              Además de los cursos de Academy, Ceduverse ofrece 29 cursos con registro oficial ante la STPS, constancias DC-3 y diplomas digitales verificables en blockchain. Certificado SEP opcional disponible.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/empresas">
                <Button className="bg-cedu-blue hover:bg-cedu-blue/90 text-white rounded-full px-6" data-testid="link-cta-empresas">
                  Ver planes para empresas <ArrowRight className="ml-2" size={16} />
                </Button>
              </Link>
              <Link href="/kit-cooperativo">
                <Button variant="outline" className="rounded-full px-6 border-cedu-orange text-cedu-orange" data-testid="link-cta-kit">
                  Descargar Kit Gratuito
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <footer className="pt-10 pb-8 bg-white border-t border-black/[0.06]" data-testid="footer-academy">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center text-[13px] text-cedu-ink-muted gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-cedu-blue rounded-[8px] flex items-center justify-center text-white font-serif text-sm">C</div>
              <span>&copy; 2026 Ceduverse. Todos los derechos reservados.</span>
            </div>
            <div className="flex gap-4">
              <Link href="/" className="text-cedu-ink-soft text-sm no-underline hover:text-cedu-blue transition-colors">Inicio</Link>
              <Link href="/empresas" className="text-cedu-ink-soft text-sm no-underline hover:text-cedu-blue transition-colors">Empresas</Link>
              <Link href="/kit-cooperativo" className="text-cedu-ink-soft text-sm no-underline hover:text-cedu-blue transition-colors">Kit Cooperativo</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

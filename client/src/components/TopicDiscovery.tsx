import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Sparkles,
  X,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Users,
  ExternalLink,
  Loader2,
  Calendar,
  Star,
  RefreshCw,
} from "lucide-react";

interface Topic {
  id: string;
  label: string;
  icon: string;
  category: string;
}

interface Recommendations {
  academy: { id: string; academyId: number; title: string; excerpt: string | null; url: string | null }[];
  tutorIa: { id: string; slug: string; title: string; description: string | null; category: string; icon: string | null; color: string | null; dc3Available: boolean } | null;
  stpsInstructor: { title: string; description: string; topics: string[]; ctaUrl: string; ctaLabel: string; price: string };
  selectedTopics: string[];
}

interface SavedInterests {
  id: string;
  topics: string[];
  recommendations: Recommendations;
  createdAt: string;
}

interface TopicDiscoveryProps {
  onDismiss?: () => void;
  onCourseClick?: (type: "academy" | "tutor-ia", id: string | number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Seguridad": "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
  "Normatividad": "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100",
  "Desarrollo": "bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100",
  "Empresarial": "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
  "Tecnología": "bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100",
  "Educación": "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
  "Oficios": "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100",
  "Creatividad": "bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100",
};

const SELECTED_STYLE = "bg-cedu-blue border-cedu-blue text-white hover:bg-cedu-blue/90 shadow-md scale-105";

const BUBBLE_SIZES = ["text-sm px-3 py-1.5", "text-sm px-4 py-2", "text-base px-4 py-2", "text-sm px-3 py-1.5", "text-base px-5 py-2.5"];

export default function TopicDiscovery({ onDismiss, onCourseClick }: TopicDiscoveryProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [activeRecs, setActiveRecs] = useState<Recommendations | null>(null);
  const { toast } = useToast();

  const { data: savedInterests, isLoading: savedLoading } = useQuery<SavedInterests | null>({
    queryKey: ["/api/learning/interests"],
  });

  useEffect(() => {
    if (savedInterests?.recommendations && !activeRecs && !showResults) {
      setActiveRecs(savedInterests.recommendations);
      setShowResults(true);
    }
  }, [savedInterests]);

  const { data: topics = [], isLoading: topicsLoading } = useQuery<Topic[]>({
    queryKey: ["/api/learning/topics"],
  });

  const discoverMutation = useMutation({
    mutationFn: async (selectedTopics: string[]) => {
      const res = await apiRequest("POST", "/api/learning/discover", { topics: selectedTopics });
      return res.json() as Promise<Recommendations>;
    },
    onSuccess: (data) => {
      setActiveRecs(data);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ["/api/learning/interests"] });
    },
    onError: () => {
      toast({ title: "Error", description: "No pudimos generar tus recomendaciones. Intenta de nuevo.", variant: "destructive" });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/learning/interests");
    },
    onSuccess: () => {
      setActiveRecs(null);
      setShowResults(false);
      setSelected([]);
      queryClient.invalidateQueries({ queryKey: ["/api/learning/interests"] });
    },
  });

  const filteredTopics = useMemo(() => {
    if (!search.trim()) return topics;
    const s = search.toLowerCase();
    return topics.filter(t =>
      t.label.toLowerCase().includes(s) ||
      t.category.toLowerCase().includes(s)
    );
  }, [topics, search]);

  const categories = useMemo(() => {
    const cats = new Set(filteredTopics.map(t => t.category));
    return Array.from(cats).sort();
  }, [filteredTopics]);

  const toggleTopic = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const handleDiscover = () => {
    if (selected.length > 0) {
      discoverMutation.mutate(selected);
    }
  };

  const handleExploreOtherTopics = () => {
    clearMutation.mutate();
  };

  if (savedLoading) {
    return (
      <div className="w-full py-8">
        <div className="flex items-center justify-center gap-2 text-cedu-ink-muted">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Cargando recomendaciones...</span>
        </div>
      </div>
    );
  }

  if (showResults && activeRecs) {
    return <DiscoveryResults
      recommendations={activeRecs}
      topics={topics}
      onBack={handleExploreOtherTopics}
      onDismiss={onDismiss}
      onCourseClick={onCourseClick}
      isClearing={clearMutation.isPending}
    />;
  }

  return (
    <div className="w-full" data-testid="topic-discovery">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-cedu-blue-light px-4 py-1.5 rounded-full mb-3">
          <Sparkles size={14} className="text-cedu-blue" />
          <span className="text-xs font-semibold text-cedu-blue">Descubrimiento personalizado</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl text-cedu-ink mb-2">¿Qué quieres aprender hoy?</h2>
        <p className="text-sm text-cedu-ink-muted max-w-md mx-auto">
          Elige hasta 5 temas que te interesen y te recomendaremos cursos perfectos para ti.
        </p>
      </div>

      <div className="max-w-lg mx-auto mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cedu-ink-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar temas..."
            className="pl-9 bg-white border-black/[0.08] rounded-xl"
            data-testid="input-search-topics"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={14} className="text-cedu-ink-muted" />
            </button>
          )}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-cedu-ink-muted font-medium">Seleccionados ({selected.length}/5):</span>
          {selected.map(id => {
            const topic = topics.find(t => t.id === id);
            return topic ? (
              <Badge key={id} variant="default" className="bg-cedu-blue text-white gap-1 cursor-pointer" onClick={() => toggleTopic(id)} data-testid={`selected-topic-${id}`}>
                {topic.icon} {topic.label}
                <X size={10} />
              </Badge>
            ) : null;
          })}
        </div>
      )}

      {topicsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4">
          {categories.map(cat => (
            <div key={cat}>
              <p className="text-[11px] font-semibold text-cedu-ink-muted uppercase tracking-wide mb-2 ml-1">{cat}</p>
              <div className="flex flex-wrap gap-2">
                {filteredTopics.filter(t => t.category === cat).map((topic, i) => {
                  const isSelected = selected.includes(topic.id);
                  const isFull = selected.length >= 5 && !isSelected;
                  const sizeClass = BUBBLE_SIZES[i % BUBBLE_SIZES.length];
                  return (
                    <button
                      key={topic.id}
                      onClick={() => toggleTopic(topic.id)}
                      disabled={isFull}
                      data-testid={`topic-bubble-${topic.id}`}
                      className={`
                        rounded-xl border font-medium transition-all duration-200 inline-flex items-center gap-1.5
                        ${sizeClass}
                        ${isSelected ? SELECTED_STYLE : CATEGORY_COLORS[cat] || "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"}
                        ${isFull ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                      `}
                    >
                      <span>{topic.icon}</span>
                      {topic.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-3 mt-8">
        {onDismiss && (
          <Button variant="outline" onClick={onDismiss} className="rounded-xl" data-testid="button-dismiss-discovery">
            Ahora no
          </Button>
        )}
        <Button
          onClick={handleDiscover}
          disabled={selected.length === 0 || discoverMutation.isPending}
          className="bg-cedu-blue hover:bg-cedu-blue/90 rounded-xl gap-2 px-6"
          data-testid="button-discover-courses"
        >
          {discoverMutation.isPending ? (
            <><Loader2 size={16} className="animate-spin" /> Buscando...</>
          ) : (
            <>Descubrir mis cursos <ArrowRight size={16} /></>
          )}
        </Button>
      </div>
    </div>
  );
}

function DiscoveryResults({ recommendations, topics, onBack, onDismiss, onCourseClick, isClearing }: {
  recommendations: Recommendations;
  topics: Topic[];
  onBack: () => void;
  onDismiss?: () => void;
  onCourseClick?: (type: "academy" | "tutor-ia", id: string | number) => void;
  isClearing?: boolean;
}) {
  const selectedLabels = recommendations.selectedTopics.map(id => topics.find(t => t.id === id)?.label || id);

  return (
    <div className="w-full" data-testid="discovery-results">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-cedu-green-light px-4 py-1.5 rounded-full mb-3">
          <Star size={14} className="text-cedu-green" />
          <span className="text-xs font-semibold text-cedu-green">Resultados personalizados</span>
        </div>
        <h2 className="font-serif text-2xl text-cedu-ink mb-2">Tus cursos recomendados</h2>
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {selectedLabels.map((label, i) => (
            <Badge key={i} variant="outline" className="text-xs">{label}</Badge>
          ))}
        </div>
      </div>

      {recommendations.academy.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-cedu-blue-light flex items-center justify-center">
              <BookOpen size={14} className="text-cedu-blue" />
            </div>
            <h3 className="font-serif text-lg text-cedu-ink">Academy</h3>
            <span className="text-xs text-cedu-ink-muted ml-auto">{recommendations.academy.length} cursos</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.academy.map((course) => (
              <button
                key={course.id}
                onClick={() => onCourseClick?.("academy", course.academyId)}
                className="bg-white border border-black/[0.06] rounded-xl p-4 text-left hover:shadow-md hover:border-cedu-blue/20 transition-all group"
                data-testid={`result-academy-${course.academyId}`}
              >
                <h4 className="font-semibold text-sm text-cedu-ink line-clamp-2 mb-1.5 group-hover:text-cedu-blue transition-colors">
                  {course.title}
                </h4>
                {course.excerpt && (
                  <p className="text-xs text-cedu-ink-muted line-clamp-2">{course.excerpt}</p>
                )}
                <div className="flex items-center gap-1 mt-2 text-cedu-blue text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver curso <ExternalLink size={10} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {recommendations.tutorIa && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-cedu-violet-light flex items-center justify-center">
              <Sparkles size={14} className="text-cedu-violet" />
            </div>
            <h3 className="font-serif text-lg text-cedu-ink">Tutor IA</h3>
            <Badge variant="outline" className="ml-2 text-[10px] text-cedu-violet border-cedu-violet/30">Personalizado con IA</Badge>
          </div>
          <button
            onClick={() => onCourseClick?.("tutor-ia", recommendations.tutorIa!.slug)}
            className="w-full bg-gradient-to-r from-violet-50 to-blue-50 border border-cedu-violet/10 rounded-xl p-5 text-left hover:shadow-md transition-all group"
            data-testid="result-tutor-ia"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{recommendations.tutorIa.icon || "🧠"}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-cedu-ink group-hover:text-cedu-violet transition-colors">{recommendations.tutorIa.title}</h4>
                <p className="text-xs text-cedu-ink-muted mt-1 line-clamp-2">{recommendations.tutorIa.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px]">{recommendations.tutorIa.category}</Badge>
                  {recommendations.tutorIa.dc3Available && (
                    <Badge variant="outline" className="text-[10px] text-green-600 border-green-300">DC-3 STPS</Badge>
                  )}
                </div>
              </div>
              <ArrowRight size={16} className="text-cedu-violet mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-lg bg-cedu-orange-light flex items-center justify-center">
            <GraduationCap size={14} className="text-cedu-orange" />
          </div>
          <h3 className="font-serif text-lg text-cedu-ink">Instructor STPS</h3>
          <Badge variant="outline" className="ml-2 text-[10px] text-cedu-orange border-cedu-orange/30">1-on-1</Badge>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-cedu-orange/10 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-cedu-orange/10 flex items-center justify-center flex-shrink-0">
              <Users size={20} className="text-cedu-orange" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-cedu-ink">{recommendations.stpsInstructor.title}</h4>
              <p className="text-xs text-cedu-ink-muted mt-1">{recommendations.stpsInstructor.description}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {recommendations.stpsInstructor.topics.map((t, i) => (
                  <Badge key={i} variant="outline" className="text-[10px]">{t}</Badge>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="font-bold text-cedu-orange">{recommendations.stpsInstructor.price}</span>
                <Button
                  size="sm"
                  className="bg-cedu-orange hover:bg-cedu-orange/90 text-white rounded-xl gap-1"
                  onClick={() => window.open(recommendations.stpsInstructor.ctaUrl, "_blank")}
                  data-testid="button-schedule-instructor"
                >
                  <Calendar size={14} /> {recommendations.stpsInstructor.ctaLabel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-6">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isClearing}
          className="rounded-xl gap-1"
          data-testid="button-explore-again"
        >
          {isClearing ? (
            <><Loader2 size={14} className="animate-spin" /> Cargando...</>
          ) : (
            <><RefreshCw size={14} /> Explorar otros temas</>
          )}
        </Button>
        {onDismiss && (
          <Button onClick={onDismiss} className="bg-cedu-blue hover:bg-cedu-blue/90 rounded-xl" data-testid="button-go-to-dashboard">
            Ir a mis cursos
          </Button>
        )}
      </div>
    </div>
  );
}

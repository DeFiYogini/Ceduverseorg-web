import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken } from "@/lib/auth-token";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Archive,
  Eye,
  Search,
  Loader2,
  FileText,
  ArrowLeft,
  ExternalLink,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  Mail,
  Users,
  TrendingUp,
  Download,
} from "lucide-react";

const CATEGORIES: Record<string, string> = {
  stps: "STPS y NOMs",
  fiscal: "Beneficios Fiscales",
  ia: "IA y Capacitación",
  cursos: "Cursos Gratuitos",
  casos: "Casos de Éxito",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-50 text-yellow-700 border-yellow-200",
  published: "bg-green-50 text-green-700 border-green-200",
  archived: "bg-gray-50 text-gray-500 border-gray-200",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function BlogEditor({ postId, onBack }: { postId: number | null; onBack: () => void }) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("stps");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState("draft");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [targetSectors, setTargetSectors] = useState("");
  const [loaded, setLoaded] = useState(!postId);

  const { isLoading: loadingPost } = useQuery({
    queryKey: ["/api/admin/blog/posts/edit", postId],
    queryFn: async () => {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/blog/posts?limit=100`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const post = data.data?.find((p: any) => p.id === postId);
      if (post) {
        setTitle(post.title);
        setSlug(post.slug);
        setCategory(post.category);
        setExcerpt(post.excerpt || "");
        setContentHtml(post.contentHtml || "");
        setFeaturedImage(post.featuredImageUrl || "");
        setStatus(post.status || "draft");
        setSeoKeywords(Array.isArray(post.seoKeywords) ? post.seoKeywords.join(", ") : "");
        setTargetSectors(Array.isArray(post.targetSectors) ? post.targetSectors.join(", ") : "");
      }
      setLoaded(true);
      return post;
    },
    enabled: !!postId,
  });

  const saveMutation = useMutation({
    mutationFn: async (saveStatus: string) => {
      const token = getAuthToken();
      const body = {
        title,
        slug,
        content_html: contentHtml,
        content_text: contentHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
        excerpt,
        category,
        featured_image_url: featuredImage || undefined,
        status: saveStatus,
        seo_keywords: seoKeywords.split(",").map(s => s.trim()).filter(Boolean),
        target_sectors: targetSectors.split(",").map(s => s.trim()).filter(Boolean),
      };
      const method = postId ? "PATCH" : "POST";
      const url = postId ? `/api/admin/blog/posts/${postId}` : "/api/admin/blog/posts";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Error al guardar");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Artículo guardado" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/posts"] });
      onBack();
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  if (!loaded) return <Skeleton className="h-64 rounded-xl" />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-8 rounded-xl" data-testid="button-blog-editor-back">
          <ArrowLeft size={16} className="mr-1" /> Volver
        </Button>
        <h2 className="font-serif text-lg text-cedu-ink">{postId ? "Editar artículo" : "Nuevo artículo"}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="text-xs font-semibold text-cedu-ink-muted mb-1 block">Título</label>
            <Input
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (!postId) setSlug(slugify(e.target.value)); }}
              placeholder="Título del artículo"
              className="rounded-xl"
              data-testid="input-blog-title"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-cedu-ink-muted mb-1 block">Slug</label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug-del-articulo" className="rounded-xl" data-testid="input-blog-slug" />
          </div>
          <div>
            <label className="text-xs font-semibold text-cedu-ink-muted mb-1 block">Excerpt ({excerpt.length}/300)</label>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value.slice(0, 300))}
              placeholder="Resumen corto del artículo..."
              className="rounded-xl h-20"
              data-testid="input-blog-excerpt"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-cedu-ink-muted mb-1 block">Contenido HTML</label>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Textarea
                value={contentHtml}
                onChange={(e) => setContentHtml(e.target.value)}
                placeholder="<h2>Título</h2><p>Contenido...</p>"
                className="rounded-xl min-h-[400px] font-mono text-xs"
                data-testid="input-blog-content"
              />
              <div className="border rounded-xl p-4 bg-white overflow-auto min-h-[400px] blog-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contentHtml) }} data-testid="blog-content-preview" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="border-black/[0.06]">
            <CardContent className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-cedu-ink-muted mb-1 block">Categoría</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="rounded-xl" data-testid="select-blog-category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-cedu-ink-muted mb-1 block">Imagen destacada URL</label>
                <Input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} placeholder="https://..." className="rounded-xl text-xs" data-testid="input-blog-image" />
              </div>
              <div>
                <label className="text-xs font-semibold text-cedu-ink-muted mb-1 block">Sectores target (coma)</label>
                <Input value={targetSectors} onChange={(e) => setTargetSectors(e.target.value)} placeholder="Manufactura, Servicios" className="rounded-xl text-xs" data-testid="input-blog-sectors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-cedu-ink-muted mb-1 block">Keywords SEO (coma)</label>
                <Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="stps, multas, nom-035" className="rounded-xl text-xs" data-testid="input-blog-keywords" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => saveMutation.mutate("draft")}
                  disabled={!title || !slug || saveMutation.isPending}
                  variant="outline"
                  className="flex-1 rounded-xl text-xs h-9"
                  data-testid="button-blog-save-draft"
                >
                  {saveMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
                  Borrador
                </Button>
                <Button
                  onClick={() => saveMutation.mutate("published")}
                  disabled={!title || !slug || !contentHtml || saveMutation.isPending}
                  className="flex-1 rounded-xl bg-cedu-green hover:bg-cedu-green/90 text-white text-xs h-9"
                  data-testid="button-blog-publish"
                >
                  Publicar
                </Button>
              </div>
              {slug && (
                <a href={`/blog/${slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-cedu-blue flex items-center gap-1 hover:underline" data-testid="link-blog-preview">
                  <ExternalLink size={12} /> Vista previa
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function AdminBlogTab() {
  const [view, setView] = useState<"list" | "editor">("list");
  const [editId, setEditId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ data: any[]; pagination: any }>({
    queryKey: ["/api/admin/blog/posts", page, filterStatus, filterCategory],
    queryFn: async () => {
      const token = getAuthToken();
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (filterStatus) params.set("status", filterStatus);
      if (filterCategory) params.set("category", filterCategory);
      const res = await fetch(`/api/admin/blog/posts?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: view === "list",
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = getAuthToken();
      if (!token) throw new Error("Sesión expirada");
      const res = await fetch(`/api/admin/blog/posts/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error((await res.json()).error || "Error al archivar");
    },
    onSuccess: () => {
      toast({ title: "Artículo archivado" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/posts"] });
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  const publishMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = getAuthToken();
      if (!token) throw new Error("Sesión expirada");
      const res = await fetch(`/api/admin/blog/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "published" }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Error al publicar");
    },
    onSuccess: () => {
      toast({ title: "Artículo publicado" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/posts"] });
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  if (view === "editor") {
    return <BlogEditor postId={editId} onBack={() => { setView("list"); setEditId(null); }} />;
  }

  const posts = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-lg text-cedu-ink" data-testid="admin-blog-heading">Blog</h2>
        <Button
          onClick={() => { setEditId(null); setView("editor"); }}
          className="rounded-xl bg-cedu-blue hover:bg-cedu-blue/90 text-white text-xs h-9"
          data-testid="button-new-blog-post"
        >
          <Plus size={14} className="mr-1" /> Nuevo artículo
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-1">
          {["", "draft", "published", "archived"].map(s => (
            <Button
              key={s}
              size="sm"
              variant={filterStatus === s ? "default" : "outline"}
              className={`rounded-full text-xs h-7 ${filterStatus === s ? "bg-cedu-blue text-white" : ""}`}
              onClick={() => { setFilterStatus(s); setPage(1); }}
              data-testid={`filter-status-${s || "all"}`}
            >
              {s === "" ? "Todos" : s === "draft" ? "Borradores" : s === "published" ? "Publicados" : "Archivados"}
            </Button>
          ))}
        </div>
        <Select value={filterCategory || "all"} onValueChange={(v) => { setFilterCategory(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-44 h-7 rounded-full text-xs"><SelectValue placeholder="Categoría" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : (
        <Card className="border-black/[0.06]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="admin-blog-table">
              <thead>
                <tr className="border-b border-black/[0.06]">
                  <th className="text-left p-3 text-xs font-semibold text-cedu-ink-muted">Título</th>
                  <th className="text-left p-3 text-xs font-semibold text-cedu-ink-muted w-28">Categoría</th>
                  <th className="text-left p-3 text-xs font-semibold text-cedu-ink-muted w-24">Status</th>
                  <th className="text-center p-3 text-xs font-semibold text-cedu-ink-muted w-20">Views</th>
                  <th className="text-right p-3 text-xs font-semibold text-cedu-ink-muted w-40">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post: any) => (
                  <tr key={post.id} className="border-b border-black/[0.04] hover:bg-black/[0.01]" data-testid={`admin-blog-row-${post.id}`}>
                    <td className="p-3">
                      <p className="text-sm font-semibold text-cedu-ink truncate max-w-[300px]">{post.title}</p>
                      <p className="text-[10px] text-cedu-ink-muted">{post.slug}</p>
                    </td>
                    <td className="p-3"><Badge variant="outline" className="text-[10px]">{CATEGORIES[post.category] || post.category}</Badge></td>
                    <td className="p-3"><Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[post.status] || ""}`}>{post.status}</Badge></td>
                    <td className="p-3 text-center text-xs text-cedu-ink-muted">{post.blogViews || 0}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => { setEditId(post.id); setView("editor"); }} data-testid={`button-edit-${post.id}`}>
                          <Edit size={12} className="mr-1" /> Editar
                        </Button>
                        {post.status === "draft" && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-cedu-green" onClick={() => publishMutation.mutate(post.id)} data-testid={`button-publish-${post.id}`}>
                            Publicar
                          </Button>
                        )}
                        {post.status !== "archived" && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-500" onClick={() => archiveMutation.mutate(post.id)} data-testid={`button-archive-${post.id}`}>
                            <Archive size={12} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-sm text-cedu-ink-muted">No hay artículos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <Button size="sm" variant="outline" className="rounded-xl text-xs" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></Button>
          <span className="text-xs text-cedu-ink-muted">Página {page} de {pagination.totalPages}</span>
          <Button size="sm" variant="outline" className="rounded-xl text-xs" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></Button>
        </div>
      )}
    </div>
  );
}

export function AdminNewsletterTab() {
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/admin/newsletter/stats"],
    queryFn: async () => {
      const token = getAuthToken();
      const res = await fetch("/api/admin/newsletter/stats", { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
  });

  const { data, isLoading } = useQuery<{ data: any[]; pagination: any }>({
    queryKey: ["/api/admin/newsletter/subscribers", page, filterStatus, search],
    queryFn: async () => {
      const token = getAuthToken();
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (filterStatus) params.set("status", filterStatus);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/newsletter/subscribers?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
  });

  const exportCSV = () => {
    const rows = data?.data || [];
    const csv = ["Email,Empresa,Sector,Municipio,Fuente,Status,Fecha", ...rows.map((r: any) =>
      `"${r.email}","${r.companyName || ""}","${r.sector || ""}","${r.municipio || ""}","${r.source || ""}","${r.status}","${r.subscribedAt || ""}"`
    )].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "suscriptores-newsletter.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const subs = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-lg text-cedu-ink" data-testid="admin-newsletter-heading">Newsletter</h2>
        <Button variant="outline" size="sm" className="rounded-xl text-xs h-8" onClick={exportCSV} data-testid="button-export-csv">
          <Download size={14} className="mr-1" /> Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className="border-black/[0.06]">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-cedu-blue" data-testid="stat-active">{stats?.total_active || 0}</p>
            <p className="text-[10px] text-cedu-ink-muted">Activos</p>
          </CardContent>
        </Card>
        <Card className="border-black/[0.06]">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-cedu-green" data-testid="stat-new-week">{stats?.new_last_week || 0}</p>
            <p className="text-[10px] text-cedu-ink-muted">Nuevos (7d)</p>
          </CardContent>
        </Card>
        <Card className="border-black/[0.06]">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500" data-testid="stat-unsub">{stats?.total_unsubscribed || 0}</p>
            <p className="text-[10px] text-cedu-ink-muted">Desuscritos</p>
          </CardContent>
        </Card>
        <Card className="border-black/[0.06]">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-cedu-ink" data-testid="stat-sources">{Object.keys(stats?.by_source || {}).length}</p>
            <p className="text-[10px] text-cedu-ink-muted">Fuentes</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-1">
          {["", "active", "unsubscribed"].map(s => (
            <Button key={s} size="sm" variant={filterStatus === s ? "default" : "outline"} className={`rounded-full text-xs h-7 ${filterStatus === s ? "bg-cedu-blue text-white" : ""}`} onClick={() => { setFilterStatus(s); setPage(1); }}>
              {s === "" ? "Todos" : s === "active" ? "Activos" : "Desuscritos"}
            </Button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cedu-ink-muted" />
          <Input placeholder="Buscar email…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="h-7 text-xs rounded-full pl-9" data-testid="input-newsletter-search" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
      ) : (
        <Card className="border-black/[0.06]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="admin-newsletter-table">
              <thead>
                <tr className="border-b border-black/[0.06]">
                  <th className="text-left p-3 text-xs font-semibold text-cedu-ink-muted">Email</th>
                  <th className="text-left p-3 text-xs font-semibold text-cedu-ink-muted">Empresa</th>
                  <th className="text-left p-3 text-xs font-semibold text-cedu-ink-muted">Sector</th>
                  <th className="text-left p-3 text-xs font-semibold text-cedu-ink-muted">Fuente</th>
                  <th className="text-left p-3 text-xs font-semibold text-cedu-ink-muted">Status</th>
                  <th className="text-left p-3 text-xs font-semibold text-cedu-ink-muted">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s: any) => (
                  <tr key={s.id} className="border-b border-black/[0.04]">
                    <td className="p-3 text-xs">{s.email}</td>
                    <td className="p-3 text-xs text-cedu-ink-muted">{s.companyName || "—"}</td>
                    <td className="p-3 text-xs text-cedu-ink-muted">{s.sector || "—"}</td>
                    <td className="p-3"><Badge variant="secondary" className="text-[10px]">{s.source}</Badge></td>
                    <td className="p-3"><Badge variant="outline" className={`text-[10px] ${s.status === "active" ? "text-green-600 border-green-200" : "text-red-500 border-red-200"}`}>{s.status}</Badge></td>
                    <td className="p-3 text-xs text-cedu-ink-muted">{s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString("es-MX") : "—"}</td>
                  </tr>
                ))}
                {subs.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-sm text-cedu-ink-muted">No hay suscriptores</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <Button size="sm" variant="outline" className="rounded-xl text-xs" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></Button>
          <span className="text-xs text-cedu-ink-muted">Página {page} de {pagination.totalPages}</span>
          <Button size="sm" variant="outline" className="rounded-xl text-xs" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></Button>
        </div>
      )}
    </div>
  );
}

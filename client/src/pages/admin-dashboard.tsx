import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken } from "@/lib/auth-token";
import { RoleBadge, getRoleConfig as getRoleBadgeConfig } from "@/components/RoleBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Building2,
  Users,
  Target,
  Plus,
  Trash2,
  UserPlus,
  ChevronLeft,
  Loader2,
  BookOpen,
  Award,
  Handshake,
  Eye,
  FileCheck,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Search,
  X,
  Mail,
  MapPin,
  Phone,
  Wallet,
  Calendar,
  GraduationCap,
  Crown,
  UserCog,
  Pencil,
  Save,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type AdminStats = {
  totalUsers: number;
  totalOrgs: number;
  totalPartners: number;
  coursesCompleted: number;
  totalObjectives: number;
};

type OrgListItem = {
  id: string;
  name: string;
  description: string | null;
  plan: string | null;
  status: string;
  partnerId: string | null;
  partnerName: string | null;
  memberCount: number;
  objectiveCount: number;
};

type OrgDetail = OrgListItem & {
  members: {
    userId: string;
    fullName: string | null;
    role: string;
    coursesEnrolled: number;
    coursesCompleted: number;
    avgProgress: number;
  }[];
  objectives: {
    id: string;
    courseId: string;
    courseTitle: string;
    courseSlug: string;
    status: string;
  }[];
};

type PartnerItem = {
  userId: string;
  email: string;
  fullName: string | null;
  referralCodes: number;
  totalUsage: number;
  referredOrgs: number;
};

type CourseItem = {
  id: string;
  title: string;
  slug: string;
};

type UserItem = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  accountType: string | null;
  accountSetup: number;
  country: string | null;
  city: string | null;
  phoneNumber: string | null;
  walletAddress: string | null;
  interest: any;
  genre: string | null;
  createdAt: string;
};

type UserDetail = UserItem & {
  referralCode: string | null;
  referredBy: string | null;
  enrollments: number;
  completedCourses: number;
  achievements: number;
  teams: { id: string; name: string; role: string }[];
};

function useAdminFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refetch(); }, [url]);

  return { data, loading, error, refetch };
}

function getToken() {
  return getAuthToken() || "";
}

export function AdminStatsTab() {
  const { data: stats, loading } = useAdminFetch<AdminStats>("/api/admin/stats");

  if (loading) return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>;

  if (!stats) return null;

  const cards = [
    { label: "Usuarios Totales", value: stats.totalUsers, icon: Users, color: "text-cedu-blue" },
    { label: "Organizaciones", value: stats.totalOrgs, icon: Building2, color: "text-cedu-orange" },
    { label: "Socios Comerciales", value: stats.totalPartners, icon: Handshake, color: "text-cedu-violet" },
    { label: "Cursos Completados", value: stats.coursesCompleted, icon: Award, color: "text-cedu-green" },
    { label: "Objetivos Asignados", value: stats.totalObjectives, icon: Target, color: "text-cedu-blue" },
  ];

  return (
    <div>
      <h2 className="font-['DM_Serif_Display'] text-2xl mb-6" data-testid="text-admin-stats-title">Estadísticas de la Plataforma</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <card.icon className={`w-5 h-5 ${card.color}`} />
                <span className="text-sm text-gray-500 font-['Plus_Jakarta_Sans']">{card.label}</span>
              </div>
              <p className="text-3xl font-bold font-['DM_Serif_Display']" data-testid={`stat-${card.label.toLowerCase().replace(/\s/g, "-")}`}>{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function OrgDetailView({ orgId, onBack }: {
  orgId: string;
  onBack: () => void;
}) {
  const { toast } = useToast();
  const { data: org, loading, refetch } = useAdminFetch<OrgDetail>(`/api/admin/orgs/${orgId}`);
  const { data: allCourses } = useAdminFetch<CourseItem[]>("/api/courses");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [addObjectiveOpen, setAddObjectiveOpen] = useState(false);

  const assignObjective = async () => {
    if (!selectedCourseId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orgs/${orgId}/objectives`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourseId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      toast({ title: "Objetivo asignado" });
      setAddObjectiveOpen(false);
      setSelectedCourseId("");
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const removeObjective = async (objId: string) => {
    try {
      const res = await fetch(`/api/admin/orgs/${orgId}/objectives/${objId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Error al eliminar");
      toast({ title: "Objetivo eliminado" });
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (loading) return <Skeleton className="h-96" />;
  if (!org) return <p>No encontrada</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} data-testid="button-back-orgs">
          <ChevronLeft className="w-4 h-4 mr-1" /> Volver
        </Button>
        <h2 className="font-['DM_Serif_Display'] text-2xl">{org.name}</h2>
        {org.plan && <Badge>{org.plan}</Badge>}
        <Badge variant={org.status === "active" ? "default" : "secondary"}>{org.status}</Badge>
      </div>

      {org.partnerName && (
        <p className="text-sm text-gray-500"><Handshake className="w-4 h-4 inline mr-1" />Socio comercial: {org.partnerName}</p>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-['DM_Serif_Display']">Objetivos ({org.objectives.length})</CardTitle>
            <Dialog open={addObjectiveOpen} onOpenChange={setAddObjectiveOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-cedu-blue hover:bg-cedu-blue/90" data-testid="button-add-objective">
                  <Plus className="w-4 h-4 mr-1" /> Asignar Curso
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-['DM_Serif_Display']">Asignar Objetivo de Curso</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger data-testid="select-course">
                      <SelectValue placeholder="Seleccionar curso STPS" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCourses?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    className="w-full bg-cedu-blue hover:bg-cedu-blue/90"
                    onClick={assignObjective}
                    disabled={!selectedCourseId || actionLoading}
                    data-testid="button-confirm-objective"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Asignar Objetivo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-3">
            {org.objectives.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Sin objetivos asignados</p>
            ) : (
              org.objectives.map((obj) => (
                <div key={obj.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`objective-${obj.id}`}>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cedu-blue" />
                    <span className="text-sm font-['Plus_Jakarta_Sans']">{obj.courseTitle}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeObjective(obj.id)} data-testid={`button-remove-obj-${obj.id}`}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-['DM_Serif_Display']">Miembros ({org.members.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {org.members.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Sin miembros</p>
            ) : (
              org.members.map((m) => (
                <div key={m.userId} className="p-3 bg-gray-50 rounded-lg" data-testid={`member-${m.userId}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold font-['Plus_Jakarta_Sans']">{m.fullName || "Sin nombre"}</span>
                    <Badge variant="secondary" className="text-xs">{m.role}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{m.coursesEnrolled} inscritos</span>
                    <span>{m.coursesCompleted} completados</span>
                    <span>Promedio: {m.avgProgress}%</span>
                  </div>
                  <Progress value={m.avgProgress} className="h-1.5 mt-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AdminOrgsTab() {
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const { data: orgs, loading } = useAdminFetch<OrgListItem[]>("/api/admin/orgs");

  if (selectedOrg) {
    return <OrgDetailView orgId={selectedOrg} onBack={() => setSelectedOrg(null)} />;
  }

  if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;

  return (
    <div>
      <h2 className="font-['DM_Serif_Display'] text-2xl mb-6" data-testid="text-admin-orgs-title">Organizaciones</h2>
      {(!orgs || orgs.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-['Plus_Jakarta_Sans']">No hay organizaciones registradas aún</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orgs.map((org) => (
            <Card key={org.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedOrg(org.id)} data-testid={`card-org-${org.id}`}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-cedu-blue/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-cedu-blue" />
                  </div>
                  <div>
                    <p className="font-semibold font-['Plus_Jakarta_Sans']">{org.name}</p>
                    <p className="text-sm text-gray-500">{org.description || "Sin descripción"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {org.plan && <Badge variant="secondary">{org.plan}</Badge>}
                  <Badge variant={org.status === "active" ? "default" : "secondary"}>{org.status}</Badge>
                  <span className="text-gray-500"><Users className="w-3 h-3 inline mr-1" />{org.memberCount}</span>
                  <span className="text-gray-500"><Target className="w-3 h-3 inline mr-1" />{org.objectiveCount}</span>
                  {org.partnerName && <span className="text-gray-500"><Handshake className="w-3 h-3 inline mr-1" />{org.partnerName}</span>}
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminPartnersTab() {
  const { toast } = useToast();
  const { data: partners, loading, refetch } = useAdminFetch<PartnerItem[]>("/api/admin/partners");
  const [actionLoading, setActionLoading] = useState(false);
  const [addPartnerOpen, setAddPartnerOpen] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState("");

  const promotePartner = async () => {
    if (!partnerEmail) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email: partnerEmail }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      toast({ title: "Socio comercial creado" });
      setPartnerEmail("");
      setAddPartnerOpen(false);
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-['DM_Serif_Display'] text-2xl" data-testid="text-admin-partners-title">Socios Comerciales</h2>
        <Dialog open={addPartnerOpen} onOpenChange={setAddPartnerOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cedu-violet hover:bg-cedu-violet/90" data-testid="button-add-partner">
              <UserPlus className="w-4 h-4 mr-2" /> Crear Socio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-['DM_Serif_Display']">Promover a Socio Comercial</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Email del usuario</Label>
                <Input
                  data-testid="input-partner-email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              <Button
                className="w-full bg-cedu-violet hover:bg-cedu-violet/90"
                onClick={promotePartner}
                disabled={!partnerEmail || actionLoading}
                data-testid="button-confirm-partner"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Promover a Socio
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {(!partners || partners.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Handshake className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-['Plus_Jakarta_Sans']">No hay socios comerciales registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {partners.map((p) => (
            <Card key={p.userId} data-testid={`card-partner-${p.userId}`}>
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold font-['Plus_Jakarta_Sans']">{p.fullName || p.email}</p>
                  <p className="text-sm text-gray-500">{p.email}</p>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="text-center">
                    <p className="font-bold text-lg">{p.referredOrgs}</p>
                    <p className="text-xs text-gray-400">Orgs</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">{p.referralCodes}</p>
                    <p className="text-xs text-gray-400">Códigos</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">{p.totalUsage}</p>
                    <p className="text-xs text-gray-400">Usos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const CANONICAL_ROLES = ["socio_estudiante", "socio_instructor", "socio_comercial", "director", "empresa", "empresa_rh", "admin", "superadmin"];

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any; description: string }> = {
  socio_estudiante: { label: "Socio Estudiante", color: "bg-green-100 text-green-700", icon: BookOpen, description: "Acceso básico a cursos y certificaciones" },
  socio_instructor: { label: "Socio Instructor", color: "bg-violet-100 text-violet-700", icon: GraduationCap, description: "Puede impartir cursos y sesiones privadas" },
  socio_comercial: { label: "Socio Comercial", color: "bg-orange-100 text-orange-700", icon: Handshake, description: "Gestión de organizaciones, comisiones y CRM" },
  director: { label: "Director", color: "bg-blue-100 text-blue-700", icon: Crown, description: "Director de zona con equipo comercial" },
  empresa: { label: "Empresa", color: "bg-sky-100 text-sky-700", icon: Building2, description: "Cuenta empresarial principal" },
  empresa_rh: { label: "Empresa RH", color: "bg-sky-100 text-sky-700", icon: Users, description: "Recursos humanos de empresa" },
  admin: { label: "Administrador", color: "bg-purple-100 text-purple-700", icon: UserCog, description: "Acceso completo al panel de administración" },
  superadmin: { label: "Superadmin", color: "bg-red-100 text-red-700", icon: Crown, description: "Control total de la plataforma" },
  user: { label: "Socio Estudiante", color: "bg-gray-100 text-gray-700", icon: Users, description: "Acceso básico a cursos y certificaciones" },
  partner: { label: "Socio Comercial", color: "bg-orange-100 text-orange-700", icon: Handshake, description: "Gestión de organizaciones, comisiones y CRM" },
  instructor: { label: "Socio Instructor", color: "bg-violet-100 text-violet-700", icon: GraduationCap, description: "Puede impartir cursos y sesiones privadas" },
  moderator: { label: "Moderador", color: "bg-blue-100 text-blue-700", icon: Eye, description: "Puede moderar contenido y foros" },
};

const ACCOUNT_TYPE_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  free: { label: "Gratuito", color: "bg-gray-100 text-gray-700", description: "Acceso limitado a contenido gratuito" },
  premium: { label: "Premium", color: "bg-cedu-green/10 text-cedu-green", description: "Acceso completo a todos los cursos y certificaciones" },
  admin: { label: "Admin", color: "bg-purple-100 text-purple-700", description: "Cuenta administrativa con acceso total" },
};

function UserDetailPanel({ userId, onClose, onUpdated }: { userId: string; onClose: () => void; onUpdated: () => void }) {
  const { toast } = useToast();
  const { data: user, loading, refetch } = useAdminFetch<UserDetail>(`/api/admin/users/${userId}`);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: "", country: "", city: "", phoneNumber: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        country: user.country || "",
        city: user.city || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  const updateRole = async (role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Error al cambiar rol");
      toast({ title: "Rol actualizado" });
      refetch();
      onUpdated();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const updateAccountType = async (accountType: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/account-type`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ accountType }),
      });
      if (!res.ok) throw new Error("Error al cambiar tipo");
      toast({ title: "Tipo de cuenta actualizado" });
      refetch();
      onUpdated();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/profile`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error("Error al actualizar perfil");
      toast({ title: "Perfil actualizado" });
      setEditingProfile(false);
      refetch();
      onUpdated();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="bg-white border-l w-[420px] min-h-full p-6">
      <Skeleton className="h-8 w-48 mb-4" />
      <Skeleton className="h-64" />
    </div>
  );

  if (!user) return null;

  const roleConf = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
  const acctConf = ACCOUNT_TYPE_CONFIG[user.accountType || "free"] || ACCOUNT_TYPE_CONFIG.free;

  return (
    <div className="bg-white border-l w-full sm:w-[420px] min-h-full overflow-y-auto" data-testid="panel-user-detail">
      <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between z-10">
        <h3 className="font-['DM_Serif_Display'] text-lg">Detalle del Usuario</h3>
        <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-user-detail">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-5 space-y-5">
        <div className="text-center">
          <div className="w-16 h-16 bg-cedu-blue/10 rounded-full flex items-center justify-center text-2xl font-bold text-cedu-blue mx-auto mb-3">
            {(user.fullName || user.email).charAt(0).toUpperCase()}
          </div>
          <h4 className="font-semibold text-lg font-['Plus_Jakarta_Sans']" data-testid="text-user-name">{user.fullName || "Sin nombre"}</h4>
          <p className="text-sm text-gray-500" data-testid="text-user-detail-email">{user.email}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <RoleBadge role={user.role} size="sm" />
            <Badge className={acctConf.color} data-testid="badge-user-account-type">{acctConf.label}</Badge>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-['Plus_Jakarta_Sans']">Rol del Usuario</CardTitle>
              <UserCog className="w-4 h-4 text-gray-400" />
            </div>
            <CardDescription className="text-xs">{roleConf.description}</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-2 gap-2">
              {CANONICAL_ROLES.map(key => {
                const conf = ROLE_CONFIG[key];
                return (
                <button
                  key={key}
                  data-testid={`button-set-role-${key}`}
                  onClick={() => updateRole(key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                    user.role === key
                      ? "border-cedu-blue bg-cedu-blue/5 ring-1 ring-cedu-blue"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <conf.icon className="w-3.5 h-3.5" />
                  {conf.label}
                </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-['Plus_Jakarta_Sans']">Tipo de Cuenta</CardTitle>
              <Shield className="w-4 h-4 text-gray-400" />
            </div>
            <CardDescription className="text-xs">{acctConf.description}</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(ACCOUNT_TYPE_CONFIG).map(([key, conf]) => (
                <button
                  key={key}
                  data-testid={`button-set-account-type-${key}`}
                  onClick={() => updateAccountType(key)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border text-center ${
                    (user.accountType || "free") === key
                      ? "border-cedu-blue bg-cedu-blue/5 ring-1 ring-cedu-blue"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {conf.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-['Plus_Jakarta_Sans']">Información Personal</CardTitle>
              {!editingProfile ? (
                <Button variant="ghost" size="sm" onClick={() => setEditingProfile(true)} data-testid="button-edit-profile">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditingProfile(false)}><X className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" onClick={saveProfile} disabled={saving} data-testid="button-save-profile">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-4 space-y-3">
            {editingProfile ? (
              <>
                <div>
                  <Label className="text-xs">Nombre completo</Label>
                  <Input value={profileForm.fullName} onChange={e => setProfileForm(p => ({ ...p, fullName: e.target.value }))} data-testid="input-edit-fullname" className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">País</Label>
                  <Input value={profileForm.country} onChange={e => setProfileForm(p => ({ ...p, country: e.target.value }))} data-testid="input-edit-country" className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Ciudad</Label>
                  <Input value={profileForm.city} onChange={e => setProfileForm(p => ({ ...p, city: e.target.value }))} data-testid="input-edit-city" className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Teléfono</Label>
                  <Input value={profileForm.phoneNumber} onChange={e => setProfileForm(p => ({ ...p, phoneNumber: e.target.value }))} data-testid="input-edit-phone" className="h-8 text-sm" />
                </div>
              </>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </div>
                {user.phoneNumber && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-3.5 h-3.5" /> {user.phoneNumber}
                  </div>
                )}
                {(user.city || user.country) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-3.5 h-3.5" /> {[user.city, user.country].filter(Boolean).join(", ")}
                  </div>
                )}
                {user.walletAddress && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Wallet className="w-3.5 h-3.5" /> {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}
                  </div>
                )}
                {user.genre && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-3.5 h-3.5" /> {user.genre === "M" ? "Masculino" : user.genre === "F" ? "Femenino" : user.genre}
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-3.5 h-3.5" /> Registrado: {new Date(user.createdAt).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-['Plus_Jakarta_Sans']">Actividad</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <GraduationCap className="w-5 h-5 text-cedu-blue mx-auto mb-1" />
                <p className="text-lg font-bold" data-testid="text-user-enrollments">{user.enrollments}</p>
                <p className="text-[10px] text-gray-500">Cursos</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <CheckCircle2 className="w-5 h-5 text-cedu-green mx-auto mb-1" />
                <p className="text-lg font-bold" data-testid="text-user-completed">{user.completedCourses}</p>
                <p className="text-[10px] text-gray-500">Completados</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <Award className="w-5 h-5 text-cedu-orange mx-auto mb-1" />
                <p className="text-lg font-bold" data-testid="text-user-achievements">{user.achievements}</p>
                <p className="text-[10px] text-gray-500">Logros</p>
              </div>
            </div>
            {user.teams.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-500 mb-1.5">Equipos</p>
                <div className="space-y-1">
                  {user.teams.map(t => (
                    <div key={t.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5">
                      <span className="text-xs font-medium">{t.name}</span>
                      <Badge variant="outline" className="text-[10px]">{t.role}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {user.referralCode && (
              <div className="mt-3 bg-cedu-orange/5 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-500">Código referido</p>
                <p className="text-sm font-mono font-medium">{user.referralCode}</p>
              </div>
            )}
            {user.referredBy && (
              <div className="mt-2 bg-cedu-blue/5 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-500">Referido por</p>
                <p className="text-sm font-mono font-medium">{user.referredBy}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-[10px] text-gray-400 text-center pb-4">
          ID: {user.id} • Setup: {user.accountSetup}/4
        </div>
      </div>
    </div>
  );
}

export function AdminUsersTab() {
  const { data: usersList, loading, refetch } = useAdminFetch<UserItem[]>("/api/admin/users");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  if (loading) return <Skeleton className="h-64" />;

  const filtered = (usersList || []).filter(u => {
    const matchesSearch = !search || 
      (u.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesType = accountTypeFilter === "all" || u.accountType === accountTypeFilter;
    return matchesSearch && matchesRole && matchesType;
  });

  const roleCounts = (usersList || []).reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeCounts = (usersList || []).reduce((acc, u) => {
    const t = u.accountType || "free";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex gap-0 -mr-8">
      <div className={`flex-1 ${selectedUser ? "max-w-[calc(100%-420px)]" : ""}`}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-['DM_Serif_Display'] text-2xl" data-testid="text-admin-users-title">Gestión de Usuarios</h2>
            <p className="text-sm text-gray-500 font-['Plus_Jakarta_Sans']">{usersList?.length || 0} usuarios registrados</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {CANONICAL_ROLES.map(key => {
            const conf = ROLE_CONFIG[key];
            const cnt = roleCounts[key] || 0;
            return (
              <button
                key={key}
                data-testid={`filter-role-${key}`}
                onClick={() => setRoleFilter(roleFilter === key ? "all" : key)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-lg text-xs border transition-all ${
                  roleFilter === key ? "border-cedu-blue bg-cedu-blue/5" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <conf.icon className="w-4 h-4" />
                <span className="font-semibold">{cnt}</span>
                <span className="text-[10px] text-gray-500">{conf.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              data-testid="input-search-users"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
          <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
            <SelectTrigger className="w-36 h-9" data-testid="filter-account-type">
              <SelectValue placeholder="Tipo cuenta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos ({usersList?.length || 0})</SelectItem>
              {Object.entries(ACCOUNT_TYPE_CONFIG).map(([key, conf]) => (
                <SelectItem key={key} value={key}>{conf.label} ({typeCounts[key] || 0})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-['Plus_Jakarta_Sans']">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[calc(100vh-350px)] overflow-y-auto pr-1">
            {filtered.map(u => {
              const rc = ROLE_CONFIG[u.role] || ROLE_CONFIG.user;
              const ac = ACCOUNT_TYPE_CONFIG[u.accountType || "free"] || ACCOUNT_TYPE_CONFIG.free;
              return (
                <button
                  key={u.id}
                  data-testid={`card-user-${u.id}`}
                  onClick={() => setSelectedUser(selectedUser === u.id ? null : u.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    selectedUser === u.id
                      ? "border-cedu-blue bg-cedu-blue/5 ring-1 ring-cedu-blue"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                      {(u.fullName || u.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold font-['Plus_Jakarta_Sans'] truncate">{u.fullName || "Sin nombre"}</p>
                        {u.accountSetup < 4 && (
                          <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded shrink-0">Setup {u.accountSetup}/4</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <RoleBadge role={u.role} size="sm" />
                      <Badge className={`${ac.color} text-[10px]`}>{ac.label}</Badge>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedUser && (
        <UserDetailPanel
          userId={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={refetch}
        />
      )}
    </div>
  );
}

type CertRequest = {
  id: string;
  userId: string;
  courseId: string;
  certType: string;
  status: string;
  rejectReason: string | null;
  pdfUrl: string | null;
  achievementUserId: string | null;
  createdAt: string;
  updatedAt: string;
  studentName: string | null;
  studentEmail: string | null;
  courseTitle: string | null;
  courseSlug: string | null;
};

export function AdminCertsTab() {
  const { toast } = useToast();
  const { data: certs, loading, refetch } = useAdminFetch<CertRequest[]>("/api/admin/certificates");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string, extra?: Record<string, string>) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/certificates/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al actualizar");
      }
      toast({ title: "Actualizado", description: `Solicitud marcada como "${status}".` });
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    await updateStatus(rejectId, "rechazado", { rejectReason });
    setRejectId(null);
    setRejectReason("");
  };

  const handleUpload = async (id: string, file: File) => {
    setUploadingId(id);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const res = await fetch(`/api/admin/certificates/${id}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al subir");
      }
      toast({ title: "PDF subido", description: "El archivo se subió correctamente." });
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;

  const allCerts = certs || [];
  const pending = allCerts.filter(c => c.status === "solicitado");
  const inProcess = allCerts.filter(c => c.status === "en_proceso");
  const emitted = allCerts.filter(c => c.status === "emitido");
  const rejected = allCerts.filter(c => c.status === "rechazado");

  const statusBadge = (status: string) => {
    switch (status) {
      case "solicitado": return <Badge className="bg-yellow-100 text-yellow-700"><Clock size={10} className="mr-1" />Solicitado</Badge>;
      case "en_proceso": return <Badge className="bg-blue-100 text-blue-700"><Loader2 size={10} className="mr-1" />En Proceso</Badge>;
      case "emitido": return <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle2 size={10} className="mr-1" />Emitido</Badge>;
      case "rechazado": return <Badge className="bg-red-100 text-red-700"><XCircle size={10} className="mr-1" />Rechazado</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const certTypeBadge = (certType: string) => {
    if (certType === "dc3") return <Badge variant="secondary" className="bg-amber-100 text-amber-700">DC-3 STPS</Badge>;
    return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Cert. SEP</Badge>;
  };

  const renderGroup = (title: string, items: CertRequest[], showActions: boolean) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-3" key={title}>
        <h3 className="font-serif text-base text-cedu-ink flex items-center gap-2">
          {title} <Badge variant="secondary">{items.length}</Badge>
        </h3>
        {items.map(cert => (
          <Card key={cert.id} className="border-black/[0.06]" data-testid={`card-cert-${cert.id}`}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-cedu-ink" data-testid={`text-cert-student-${cert.id}`}>
                      {cert.studentName || "Usuario"}
                    </p>
                    {certTypeBadge(cert.certType)}
                    {statusBadge(cert.status)}
                  </div>
                  <p className="text-xs text-cedu-ink-muted" data-testid={`text-cert-course-${cert.id}`}>
                    {cert.courseTitle || "Curso"}
                  </p>
                  <p className="text-[10px] text-cedu-ink-muted">
                    {new Date(cert.createdAt).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  {cert.pdfUrl && (
                    <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-cedu-blue hover:underline" data-testid={`link-cert-pdf-${cert.id}`}>
                      <Download size={12} /> Ver PDF
                    </a>
                  )}
                  {cert.rejectReason && (
                    <p className="text-xs text-red-600 mt-1">Motivo: {cert.rejectReason}</p>
                  )}
                </div>
                {showActions && (
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {cert.status === "solicitado" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        disabled={actionLoading === cert.id}
                        onClick={() => updateStatus(cert.id, "en_proceso")}
                        data-testid={`button-mark-process-${cert.id}`}
                      >
                        {actionLoading === cert.id ? <Loader2 size={12} className="animate-spin mr-1" /> : <Clock size={12} className="mr-1" />}
                        En proceso
                      </Button>
                    )}
                    {(cert.status === "solicitado" || cert.status === "en_proceso") && (
                      <>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUpload(cert.id, file);
                            }}
                            data-testid={`input-upload-pdf-${cert.id}`}
                          />
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border rounded-md hover:bg-gray-50 cursor-pointer">
                            {uploadingId === cert.id ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                            Subir PDF
                          </span>
                        </label>
                        <Button
                          size="sm"
                          className="bg-cedu-green hover:bg-cedu-green/90 text-white text-xs"
                          disabled={actionLoading === cert.id || !cert.pdfUrl}
                          onClick={() => updateStatus(cert.id, "emitido")}
                          data-testid={`button-emit-${cert.id}`}
                        >
                          {actionLoading === cert.id ? <Loader2 size={12} className="animate-spin mr-1" /> : <CheckCircle2 size={12} className="mr-1" />}
                          Emitir
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                          onClick={() => setRejectId(cert.id)}
                          data-testid={`button-reject-${cert.id}`}
                        >
                          <XCircle size={12} className="mr-1" /> Rechazar
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl text-cedu-ink" data-testid="text-admin-certs-title">Gestión de Certificados</h2>
          <p className="text-sm text-cedu-ink-muted">Solicitudes de Constancias DC-3 y Certificados SEP</p>
        </div>
        <div className="flex gap-2">
          {pending.length > 0 && <Badge className="bg-yellow-100 text-yellow-700">{pending.length} pendientes</Badge>}
          {inProcess.length > 0 && <Badge className="bg-blue-100 text-blue-700">{inProcess.length} en proceso</Badge>}
        </div>
      </div>

      {allCerts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileCheck size={48} className="mx-auto text-cedu-ink-muted mb-3 opacity-30" />
            <p className="text-sm text-cedu-ink-muted">No hay solicitudes de certificados aún.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {renderGroup("Pendientes", pending, true)}
          {renderGroup("En Proceso", inProcess, true)}
          {renderGroup("Emitidos", emitted, false)}
          {renderGroup("Rechazados", rejected, false)}
        </>
      )}

      <Dialog open={!!rejectId} onOpenChange={(open) => { if (!open) { setRejectId(null); setRejectReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Rechazar solicitud</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Motivo del rechazo</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej: Documentación incompleta, pago no verificado..."
              data-testid="input-reject-reason"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setRejectId(null); setRejectReason(""); }} data-testid="button-cancel-reject">
                Cancelar
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                data-testid="button-confirm-reject"
              >
                Rechazar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AdminContributionsTab() {
  const { toast } = useToast();
  const token = getAuthToken();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [generating, setGenerating] = useState(false);
  const [paymentCid, setPaymentCid] = useState<string | null>(null);
  const [payRef, setPayRef] = useState("");
  const [payMethod, setPayMethod] = useState("spei");

  const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/contributions?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setContributions(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContributions(); }, [year, month]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/contributions/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ year, month }),
      });
      const data = await res.json();
      toast({
        title: "SAMs generadas",
        description: `${data.generated} solicitudes generadas de ${data.total} empresas activas.`,
      });
      fetchContributions();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleRegisterPayment = async () => {
    if (!paymentCid) return;
    try {
      const res = await fetch(`/api/admin/contributions/${paymentCid}/payment`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ method: payMethod, reference: payRef }),
      });
      if (res.ok) {
        toast({ title: "Pago registrado" });
        setPaymentCid(null);
        setPayRef("");
        fetchContributions();
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    adjusted: "bg-violet-100 text-violet-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const paymentColors: Record<string, string> = {
    unpaid: "bg-amber-100 text-amber-800",
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
    partial: "bg-orange-100 text-orange-800",
  };

  const totalGross = contributions.reduce((s, c) => s + Number(c.adjustedAmount || c.grossAmount), 0);
  const totalFee = contributions.reduce((s, c) => s + Number(c.feeAmount), 0);
  const totalNet = contributions.reduce((s, c) => s + Number(c.netToCooperative), 0);
  const paidCount = contributions.filter(c => c.paymentStatus === "paid").length;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(v);

  return (
    <div className="space-y-6" data-testid="admin-contributions-tab">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">Aportaciones Mensuales (SAM)</h2>
          <p className="text-sm text-muted-foreground">Gestión de solicitudes de aportación por periodo</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[140px]" data-testid="select-month">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_NAMES.map((m, i) => (
                <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-[90px]"
            data-testid="input-year"
          />
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-cedu-blue hover:bg-cedu-blue/90 text-white"
            data-testid="btn-generate-sams"
          >
            {generating ? "Generando..." : "Generar SAMs"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Empresas</p>
            <p className="text-2xl font-bold font-serif">{contributions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total bruto</p>
            <p className="text-2xl font-bold font-serif">{formatCurrency(totalGross)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Comisiones</p>
            <p className="text-2xl font-bold font-serif text-cedu-orange">{formatCurrency(totalFee)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Pagadas</p>
            <p className="text-2xl font-bold font-serif text-cedu-green">{paidCount}/{contributions.length}</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : contributions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No hay aportaciones generadas para este periodo.</p>
            <p className="text-sm text-muted-foreground mt-1">Usa "Generar SAMs" para crear las solicitudes del mes.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-2 text-xs font-medium text-muted-foreground px-4 py-2">
            <span>Empresa</span>
            <span>Plan</span>
            <span>Cols</span>
            <span>Monto</span>
            <span>Estado</span>
            <span>Pago</span>
            <span>Acción</span>
          </div>
          {contributions.map((c: any) => (
            <Card key={c.id} className="hover:bg-gray-50/50 transition-colors" data-testid={`admin-sam-${c.id}`}>
              <CardContent className="py-3 px-4">
                <div className="grid grid-cols-7 gap-2 items-center text-sm">
                  <span className="font-medium truncate" title={c.teamName}>{c.teamName || "—"}</span>
                  <span className="capitalize">{c.planType}</span>
                  <span>{c.adjustedCollaborators || c.activeCollaborators}</span>
                  <span className="font-semibold">
                    {formatCurrency(Number(c.adjustedAmount || c.grossAmount))}
                  </span>
                  <span>
                    <Badge variant="outline" className={`text-xs ${statusColors[c.status] || ""}`}>
                      {c.status === "pending" ? "Pendiente" :
                       c.status === "confirmed" ? "Confirmada" :
                       c.status === "paid" ? "Pagada" :
                       c.status === "adjusted" ? "Ajustada" : c.status}
                    </Badge>
                  </span>
                  <span>
                    <Badge variant="outline" className={`text-xs ${paymentColors[c.paymentStatus] || ""}`}>
                      {c.paymentStatus === "unpaid" ? "Sin pago" :
                       c.paymentStatus === "paid" ? "Pagado" :
                       c.paymentStatus === "overdue" ? "Vencido" : c.paymentStatus}
                    </Badge>
                  </span>
                  <span>
                    {(c.status === "confirmed" || c.status === "adjusted") && c.paymentStatus !== "paid" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => { setPaymentCid(c.id); setPayRef(""); }}
                        data-testid={`btn-register-payment-${c.id}`}
                      >
                        Registrar pago
                      </Button>
                    )}
                    {c.paymentStatus === "paid" && (
                      <span className="text-xs text-green-600">✓ Pagado</span>
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!paymentCid} onOpenChange={(open) => !open && setPaymentCid(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Método de pago</Label>
              <Select value={payMethod} onValueChange={setPayMethod}>
                <SelectTrigger data-testid="select-payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spei">SPEI</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Referencia de pago</Label>
              <Input
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="Número de referencia SPEI"
                data-testid="input-payment-reference"
              />
            </div>
            <Button
              className="w-full bg-cedu-green hover:bg-cedu-green/90 text-white"
              onClick={handleRegisterPayment}
              data-testid="btn-confirm-payment"
            >
              Confirmar Pago
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

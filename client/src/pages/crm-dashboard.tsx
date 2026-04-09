import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForceLightMode } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Users,
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Plus,
  Loader2,
  Building2,
  UserCheck,
  Wallet,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function formatMXNraw(amount: number) {
  return "$" + amount.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "Pendiente", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  confirmed: { label: "Confirmado", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  overdue: { label: "Vencido", color: "bg-red-50 text-red-700 border-red-200", icon: AlertTriangle },
  cancelled: { label: "Cancelado", color: "bg-gray-100 text-gray-500 border-gray-200", icon: XCircle },
  approved: { label: "Aprobada", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  paid: { label: "Pagada", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
};

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  contact: { label: "Contacto", color: "bg-gray-100 text-gray-600" },
  demo: { label: "Demo", color: "bg-blue-50 text-blue-600" },
  proposal: { label: "Propuesta", color: "bg-violet-50 text-violet-600" },
  negotiation: { label: "Negociación", color: "bg-amber-50 text-amber-600" },
  closed: { label: "Cerrado", color: "bg-green-50 text-green-600" },
  active: { label: "Activa", color: "bg-emerald-50 text-emerald-700" },
  lost: { label: "Perdido", color: "bg-red-50 text-red-600" },
};

const METHOD_LABELS: Record<string, string> = {
  spei: "SPEI",
  deposit: "Depósito",
  domiciliation: "Domiciliación",
  card: "Tarjeta",
  other: "Otro",
};

type CrmTab = "payments" | "commissions" | "prospects" | "dispersions";

export default function CrmDashboard() {
  useForceLightMode();
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<CrmTab>("payments");
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: account } = useQuery<any>({
    queryKey: ["/api/me/account"],
    enabled: !!user,
  });

  useEffect(() => {
    if (!authLoading && !user) setLocation("/auth");
    if (account && account.userRole !== "admin" && account.userRole !== "superadmin") setLocation("/dashboard");
  }, [authLoading, user, account]);

  if (authLoading || !user) return (
    <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-cedu-blue" />
    </div>
  );

  if (account && account.userRole !== "admin" && account.userRole !== "superadmin") return null;

  const tabs: { id: CrmTab; label: string; icon: typeof DollarSign }[] = [
    { id: "payments", label: "Pagos", icon: DollarSign },
    { id: "commissions", label: "Comisiones", icon: TrendingUp },
    { id: "prospects", label: "Pipeline", icon: Users },
    { id: "dispersions", label: "Dispersiones", icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="no-underline">
            <Button variant="ghost" size="sm" className="gap-1 text-cedu-ink-muted" data-testid="button-back-admin">
              <ArrowLeft size={16} /> Dashboard
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-serif text-2xl text-cedu-ink" data-testid="text-crm-title">CRM Comercial</h1>
            <p className="text-xs text-cedu-ink-muted">Pagos, comisiones y pipeline de ventas</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
              <SelectTrigger className="w-24 h-8 text-xs bg-white" data-testid="select-month">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
              <SelectTrigger className="w-20 h-8 text-xs bg-white" data-testid="select-year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2025, 2026, 2027].map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-black/[0.06]">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === t.id
                  ? "bg-cedu-blue text-white shadow-sm"
                  : "text-cedu-ink-muted hover:bg-black/[0.02]"
              }`}
              data-testid={`tab-crm-${t.id}`}
            >
              <t.icon size={14} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {activeTab === "payments" && <PaymentsTab month={month} year={year} />}
        {activeTab === "commissions" && <CommissionsTab month={month} year={year} />}
        {activeTab === "prospects" && <ProspectsTab />}
        {activeTab === "dispersions" && <DispersionsTab month={month} year={year} />}
      </div>
    </div>
  );
}

function PaymentsTab({ month, year }: { month: number; year: number }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const { data: payments = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/crm/payments", month, year],
    queryFn: async () => {
      const res = await fetch(`/api/crm/payments?month=${month}&year=${year}`, { credentials: "include" });
      return res.json();
    },
  });

  const { data: summary } = useQuery<any>({
    queryKey: ["/api/crm/payments/summary", month, year],
    queryFn: async () => {
      const res = await fetch(`/api/crm/payments/summary?month=${month}&year=${year}`, { credentials: "include" });
      return res.json();
    },
  });

  const { data: teamsList = [] } = useQuery<any[]>({
    queryKey: ["/api/teams"],
  });

  const confirmMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/crm/payments/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/payments/summary"] });
      toast({ title: "Pago actualizado" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/crm/payments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/payments/summary"] });
      setShowForm(false);
      toast({ title: "Pago registrado" });
    },
  });

  const confirmed = summary?.breakdown?.find((b: any) => b.status === "confirmed");
  const pending = summary?.breakdown?.find((b: any) => b.status === "pending");
  const overdue = summary?.breakdown?.find((b: any) => b.status === "overdue");

  return (
    <div className="space-y-5" data-testid="crm-payments-tab">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Cobrado" value={formatMXNraw(confirmed?.total || 0)} sub={`${confirmed?.cnt || 0} pagos`} color="text-cedu-green" icon={CheckCircle2} />
        <StatCard label="Pendiente" value={formatMXNraw(pending?.total || 0)} sub={`${pending?.cnt || 0} pagos`} color="text-amber-600" icon={Clock} />
        <StatCard label="Vencido" value={formatMXNraw(overdue?.total || 0)} sub={`${overdue?.cnt || 0} pagos`} color="text-red-600" icon={AlertTriangle} />
        <StatCard label="Total empresas" value={String(payments.length)} sub={`${MONTHS[month - 1]} ${year}`} color="text-cedu-blue" icon={Building2} />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg text-cedu-ink">Pagos del período</h3>
        <Button size="sm" className="bg-cedu-blue hover:bg-cedu-blue/90 rounded-xl gap-1 text-xs" onClick={() => setShowForm(!showForm)} data-testid="button-new-payment">
          <Plus size={14} /> Registrar pago
        </Button>
      </div>

      {showForm && (
        <PaymentForm
          teams={teamsList}
          month={month}
          year={year}
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
          isPending={createMutation.isPending}
        />
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : payments.length === 0 ? (
        <Card className="border-black/[0.06]">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-cedu-ink-muted">No hay pagos registrados para este período</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {payments.map((row: any) => {
            const p = row.payment;
            const st = STATUS_LABELS[p.status] || STATUS_LABELS.pending;
            return (
              <Card key={p.id} className="border-black/[0.06]" data-testid={`payment-${p.id}`}>
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cedu-blue-light rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 size={18} className="text-cedu-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-cedu-ink truncate">{row.teamName || p.teamId}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[11px] text-cedu-ink-muted">{METHOD_LABELS[p.paymentMethod] || p.paymentMethod}</span>
                        {p.reference && <span className="text-[11px] text-cedu-ink-muted">Ref: {p.reference}</span>}
                        {row.teamPlan && <Badge variant="outline" className="text-[9px] h-4">{row.teamPlan}</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-bold text-cedu-ink">{formatMXNraw(p.amount)}</span>
                      <Badge variant="outline" className={`text-[9px] h-5 ${st.color}`}>{st.label}</Badge>
                    </div>
                    {p.status === "pending" && (
                      <div className="flex gap-1 flex-shrink-0">
                        <Button size="sm" variant="ghost" className="h-7 text-[10px] text-green-600 hover:bg-green-50" onClick={() => confirmMutation.mutate({ id: p.id, status: "confirmed" })} data-testid={`confirm-payment-${p.id}`}>
                          Confirmar
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-[10px] text-red-500 hover:bg-red-50" onClick={() => confirmMutation.mutate({ id: p.id, status: "overdue" })}>
                          Vencido
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PaymentForm({ teams, month, year, onSubmit, onCancel, isPending }: {
  teams: any[];
  month: number;
  year: number;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [teamId, setTeamId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("spei");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <Card className="border-cedu-blue/20 bg-cedu-blue-light/10" data-testid="form-new-payment">
      <CardContent className="py-4 space-y-3">
        <p className="text-sm font-semibold text-cedu-ink">Nuevo pago — {MONTHS[month - 1]} {year}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select value={teamId} onValueChange={setTeamId}>
            <SelectTrigger className="bg-white text-sm" data-testid="select-team">
              <SelectValue placeholder="Seleccionar empresa" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((t: any) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="number" placeholder="Monto (MXN)" value={amount} onChange={e => setAmount(e.target.value)} className="bg-white" data-testid="input-amount" />
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="bg-white text-sm" data-testid="select-method">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spei">SPEI</SelectItem>
              <SelectItem value="deposit">Depósito</SelectItem>
              <SelectItem value="domiciliation">Domiciliación</SelectItem>
              <SelectItem value="card">Tarjeta</SelectItem>
              <SelectItem value="other">Otro</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Referencia bancaria" value={reference} onChange={e => setReference(e.target.value)} className="bg-white" data-testid="input-reference" />
        </div>
        <Input placeholder="Notas (opcional)" value={notes} onChange={e => setNotes(e.target.value)} className="bg-white" data-testid="input-notes" />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel} className="rounded-xl text-xs">Cancelar</Button>
          <Button
            size="sm"
            className="bg-cedu-blue hover:bg-cedu-blue/90 rounded-xl text-xs gap-1"
            disabled={!teamId || !amount || isPending}
            onClick={() => onSubmit({
              teamId,
              amount: Number(amount),
              paymentMethod: method,
              reference: reference || null,
              notes: notes || null,
              periodMonth: month,
              periodYear: year,
              status: "confirmed",
              paidAt: new Date().toISOString(),
            })}
            data-testid="button-submit-payment"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Registrar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CommissionsTab({ month, year }: { month: number; year: number }) {
  const { toast } = useToast();

  const { data: commissions = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/crm/commissions", month, year],
    queryFn: async () => {
      const res = await fetch(`/api/crm/commissions?month=${month}&year=${year}`, { credentials: "include" });
      return res.json();
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/crm/commissions/generate", { month, year });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/commissions"] });
      toast({ title: `${data.generated} comisiones generadas` });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/crm/commissions/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/commissions"] });
      toast({ title: "Comisión actualizada" });
    },
  });

  const totalPending = commissions.filter((c: any) => c.commission.status === "pending").reduce((s: number, c: any) => s + c.commission.amount, 0);
  const totalPaid = commissions.filter((c: any) => c.commission.status === "paid").reduce((s: number, c: any) => s + c.commission.amount, 0);

  const partnerGroups = commissions.reduce((acc: Record<string, any[]>, c: any) => {
    const key = c.commission.partnerId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-5" data-testid="crm-commissions-tab">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Por pagar" value={formatMXNraw(totalPending)} sub="Comisiones pendientes" color="text-amber-600" icon={Clock} />
        <StatCard label="Pagadas" value={formatMXNraw(totalPaid)} sub={`${MONTHS[month - 1]} ${year}`} color="text-cedu-green" icon={CheckCircle2} />
        <StatCard label="Socios" value={String(Object.keys(partnerGroups).length)} sub="Con comisiones" color="text-cedu-violet" icon={UserCheck} />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg text-cedu-ink">Comisiones del período</h3>
        <Button
          size="sm"
          className="bg-cedu-violet hover:bg-cedu-violet/90 text-white rounded-xl gap-1 text-xs"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          data-testid="button-generate-commissions"
        >
          {generateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Calcular comisiones
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : commissions.length === 0 ? (
        <Card className="border-black/[0.06]">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-cedu-ink-muted">No hay comisiones para este período. Registra pagos confirmados y calcula las comisiones.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(partnerGroups).map(([partnerId, items]: [string, any[]]) => {
            const partnerName = items[0].partnerName || items[0].partnerEmail || partnerId.slice(0, 8);
            const total = items.reduce((s: number, c: any) => s + c.commission.amount, 0);
            return (
              <Card key={partnerId} className="border-black/[0.06]" data-testid={`partner-group-${partnerId}`}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-cedu-violet-light rounded-lg flex items-center justify-center">
                        <UserCheck size={14} className="text-cedu-violet" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-cedu-ink">{partnerName}</p>
                        <p className="text-[10px] text-cedu-ink-muted">{items.length} empresa{items.length > 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <span className="text-base font-bold text-cedu-violet">{formatMXNraw(total)}</span>
                  </div>
                  <div className="space-y-1.5">
                    {items.map((c: any) => {
                      const st = STATUS_LABELS[c.commission.status] || STATUS_LABELS.pending;
                      return (
                        <div key={c.commission.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-black/[0.02]">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-cedu-ink">{c.teamName || c.commission.teamId}</span>
                            <span className="text-[10px] text-cedu-ink-muted">{c.commission.commissionPercent}% del fee</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-cedu-ink">{formatMXNraw(c.commission.amount)}</span>
                            <Badge variant="outline" className={`text-[9px] h-4 ${st.color}`}>{st.label}</Badge>
                            {c.commission.status === "pending" && (
                              <Button size="sm" variant="ghost" className="h-6 text-[10px] text-green-600" onClick={() => updateMutation.mutate({ id: c.commission.id, status: "paid" })}>
                                Marcar pagada
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProspectsTab() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const { data: prospectsList = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/crm/prospects"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/crm/prospects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/prospects"] });
      setShowForm(false);
      toast({ title: "Prospecto creado" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      await apiRequest("PATCH", `/api/crm/prospects/${id}`, { stage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/prospects"] });
      toast({ title: "Etapa actualizada" });
    },
  });

  const stages = ["contact", "demo", "proposal", "negotiation", "closed", "active"];
  const stageCounts = stages.reduce((acc, s) => {
    acc[s] = prospectsList.filter((p: any) => p.stage === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5" data-testid="crm-prospects-tab">
      <div className="flex flex-wrap gap-2 mb-2">
        {stages.map(s => {
          const st = STAGE_LABELS[s];
          return (
            <div key={s} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${st.color}`}>
              {st.label} <span className="ml-1 opacity-70">{stageCounts[s]}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg text-cedu-ink">Pipeline de prospectos</h3>
        <Button size="sm" className="bg-cedu-blue hover:bg-cedu-blue/90 rounded-xl gap-1 text-xs" onClick={() => setShowForm(!showForm)} data-testid="button-new-prospect">
          <Plus size={14} /> Nuevo prospecto
        </Button>
      </div>

      {showForm && (
        <ProspectForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
          isPending={createMutation.isPending}
        />
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : prospectsList.length === 0 ? (
        <Card className="border-black/[0.06]">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-cedu-ink-muted">No hay prospectos. Agrega empresas al pipeline.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {prospectsList.map((p: any) => {
            const st = STAGE_LABELS[p.stage] || STAGE_LABELS.contact;
            const nextStage = stages[stages.indexOf(p.stage) + 1];
            return (
              <Card key={p.id} className="border-black/[0.06]" data-testid={`prospect-${p.id}`}>
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cedu-blue-light rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 size={16} className="text-cedu-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-cedu-ink truncate">{p.companyName}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {p.contactName && <span className="text-[11px] text-cedu-ink-muted">{p.contactName}</span>}
                        {p.collaborators && <span className="text-[11px] text-cedu-ink-muted">{p.collaborators} cols</span>}
                        {p.plan && <Badge variant="outline" className="text-[9px] h-4">{p.plan}</Badge>}
                      </div>
                    </div>
                    <Badge className={`text-[10px] ${st.color} border-0`}>{st.label}</Badge>
                    {nextStage && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[10px] text-cedu-blue gap-0.5"
                        onClick={() => updateMutation.mutate({ id: p.id, stage: nextStage })}
                        data-testid={`advance-${p.id}`}
                      >
                        <ChevronRight size={12} /> {STAGE_LABELS[nextStage]?.label}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProspectForm({ onSubmit, onCancel, isPending }: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [collaborators, setCollaborators] = useState("");
  const [plan, setPlan] = useState("transforma");

  return (
    <Card className="border-cedu-blue/20 bg-cedu-blue-light/10" data-testid="form-new-prospect">
      <CardContent className="py-4 space-y-3">
        <p className="text-sm font-semibold text-cedu-ink">Nuevo prospecto</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input placeholder="Nombre de la empresa" value={companyName} onChange={e => setCompanyName(e.target.value)} className="bg-white" data-testid="input-company-name" />
          <Input placeholder="Contacto (nombre)" value={contactName} onChange={e => setContactName(e.target.value)} className="bg-white" data-testid="input-contact-name" />
          <Input placeholder="Email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="bg-white" data-testid="input-contact-email" />
          <Input placeholder="Teléfono" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="bg-white" data-testid="input-contact-phone" />
          <Input type="number" placeholder="# Colaboradores" value={collaborators} onChange={e => setCollaborators(e.target.value)} className="bg-white" data-testid="input-collaborators" />
          <Select value={plan} onValueChange={setPlan}>
            <SelectTrigger className="bg-white text-sm" data-testid="select-plan">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="impulsa">Impulsa</SelectItem>
              <SelectItem value="transforma">Transforma</SelectItem>
              <SelectItem value="lidera">Lidera</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel} className="rounded-xl text-xs">Cancelar</Button>
          <Button
            size="sm"
            className="bg-cedu-blue hover:bg-cedu-blue/90 rounded-xl text-xs gap-1"
            disabled={!companyName || isPending}
            onClick={() => onSubmit({
              companyName,
              contactName: contactName || null,
              contactEmail: contactEmail || null,
              contactPhone: contactPhone || null,
              collaborators: collaborators ? Number(collaborators) : null,
              plan,
            })}
            data-testid="button-submit-prospect"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Crear prospecto
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DispersionsTab({ month, year }: { month: number; year: number }) {
  const { toast } = useToast();

  const { data: dispersionsList = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/crm/dispersions"],
  });

  const { data: wallets = [] } = useQuery<any[]>({
    queryKey: ["/api/crm/wallets"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/crm/dispersions", {
        periodMonth: month,
        periodYear: year,
        totalAmount: 0,
        companiesIncluded: 0,
        details: { note: "Layout generado automáticamente" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/dispersions"] });
      toast({ title: "Layout de dispersión creado" });
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/crm/dispersions/${id}`, { status: "applied" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/dispersions"] });
      toast({ title: "Dispersión aplicada" });
    },
  });

  const DISP_STATUS: Record<string, { label: string; color: string }> = {
    draft: { label: "Borrador", color: "bg-amber-50 text-amber-600" },
    applied: { label: "Aplicado", color: "bg-green-50 text-green-600" },
    cancelled: { label: "Cancelado", color: "bg-red-50 text-red-500" },
  };

  return (
    <div className="space-y-5" data-testid="crm-dispersions-tab">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Layouts" value={String(dispersionsList.length)} sub="Total generados" color="text-cedu-blue" icon={FileText} />
        <StatCard label="Monederos" value={String(wallets.length)} sub="Empresas con wallet" color="text-cedu-violet" icon={Wallet} />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg text-cedu-ink">Layouts de dispersión</h3>
        <Button
          size="sm"
          className="bg-cedu-blue hover:bg-cedu-blue/90 rounded-xl gap-1 text-xs"
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          data-testid="button-new-dispersion"
        >
          {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Generar layout
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : dispersionsList.length === 0 ? (
        <Card className="border-black/[0.06]">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-cedu-ink-muted">No hay layouts de dispersión. Genera uno para el período actual.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {dispersionsList.map((d: any) => {
            const st = DISP_STATUS[d.status] || DISP_STATUS.draft;
            return (
              <Card key={d.id} className="border-black/[0.06]" data-testid={`dispersion-${d.id}`}>
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cedu-violet-light rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-cedu-violet" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-cedu-ink">{MONTHS[d.periodMonth - 1]} {d.periodYear}</p>
                      <p className="text-[11px] text-cedu-ink-muted">{d.companiesIncluded} empresas &bull; {formatMXNraw(d.totalAmount)} total</p>
                    </div>
                    <Badge className={`text-[10px] ${st.color} border-0`}>{st.label}</Badge>
                    {d.status === "draft" && (
                      <Button size="sm" variant="ghost" className="h-7 text-[10px] text-green-600" onClick={() => applyMutation.mutate(d.id)} data-testid={`apply-dispersion-${d.id}`}>
                        Aplicar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {wallets.length > 0 && (
        <>
          <h3 className="font-serif text-lg text-cedu-ink mt-6">Monederos de empresas</h3>
          <div className="space-y-2">
            {wallets.map((w: any) => (
              <Card key={w.wallet.id} className="border-black/[0.06]">
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cedu-green-light rounded-lg flex items-center justify-center">
                      <Wallet size={14} className="text-cedu-green" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-cedu-ink">{w.teamName || w.wallet.teamId}</p>
                      <p className="text-[10px] text-cedu-ink-muted">{w.wallet.walletType}</p>
                    </div>
                    <span className="text-sm font-bold text-cedu-green">{formatMXNraw(w.wallet.balance)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color, icon: Icon }: {
  label: string;
  value: string;
  sub: string;
  color: string;
  icon: typeof DollarSign;
}) {
  return (
    <Card className="border-black/[0.06]">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon size={14} className={color} />
          <span className="text-[10px] text-cedu-ink-muted font-semibold uppercase tracking-wide">{label}</span>
        </div>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
        <p className="text-[10px] text-cedu-ink-muted mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}

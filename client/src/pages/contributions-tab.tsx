import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getAuthToken } from "@/lib/auth-token";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  AlertTriangle, CheckCircle2, Clock, DollarSign, Users, FileText,
  ChevronDown, ChevronUp, Calendar, Shield, Loader2,
  Building2, Copy, Landmark, Receipt, ExternalLink,
} from "lucide-react";
import type { MonthlyContribution } from "@shared/schema";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any; color: string }> = {
  pending: { label: "Pendiente", variant: "outline", icon: Clock, color: "text-amber-600" },
  confirmed: { label: "Confirmada", variant: "default", icon: CheckCircle2, color: "text-blue-600" },
  paid: { label: "Pagada", variant: "default", icon: DollarSign, color: "text-green-600" },
  adjusted: { label: "Ajustada", variant: "secondary", icon: AlertTriangle, color: "text-orange-600" },
  cancelled: { label: "Cancelada", variant: "destructive", icon: AlertTriangle, color: "text-red-600" },
};

const PLAN_CONFIG: Record<string, { name: string; color: string; bgColor: string }> = {
  impulsa: { name: "Impulsa", color: "text-cedu-blue", bgColor: "bg-cedu-blue/10" },
  transforma: { name: "Transforma", color: "text-cedu-violet", bgColor: "bg-cedu-violet/10" },
  lidera: { name: "Lidera", color: "text-cedu-green", bgColor: "bg-cedu-green/10" },
};

const DEFAULT_BANK_INFO = {
  bank: "",
  type: "Cuenta Empresarial",
  clabe: "",
  beneficiary: "",
  reference: "SAM-{period}",
};

function fmt(val: string | number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(val));
}

function PendingSAMCard({ sam, teamId }: { sam: MonthlyContribution; teamId: string }) {
  const { toast } = useToast();
  const [adjustMode, setAdjustMode] = useState(false);
  const [adjustCols, setAdjustCols] = useState(sam.adjustedCollaborators || sam.activeCollaborators);
  const [adjustReason, setAdjustReason] = useState("");
  const [accepted, setAccepted] = useState(false);

  const confirmMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/teams/${teamId}/contributions/${sam.id}/confirm`),
    onSuccess: () => {
      toast({ title: "Aportación confirmada", description: "La solicitud fue confirmada exitosamente. Se generó un hash SHA-256 como constancia." });
      queryClient.invalidateQueries({ queryKey: ["/api/teams", teamId, "contributions"] });
      setAccepted(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "No se pudo confirmar", variant: "destructive" });
    },
  });

  const adjustMutation = useMutation({
    mutationFn: () =>
      apiRequest("PUT", `/api/teams/${teamId}/contributions/${sam.id}/adjust`, {
        collaborators: adjustCols,
        reason: adjustReason,
      }),
    onSuccess: () => {
      toast({ title: "Ajuste aplicado", description: "El número de colaboradores y montos fueron recalculados." });
      queryClient.invalidateQueries({ queryKey: ["/api/teams", teamId, "contributions"] });
      setAdjustMode(false);
      setAdjustReason("");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "No se pudo ajustar", variant: "destructive" });
    },
  });

  const planInfo = PLAN_CONFIG[sam.planType] || { name: sam.planType, color: "text-gray-700", bgColor: "bg-gray-100" };
  const effectiveCols = sam.adjustedCollaborators || sam.activeCollaborators;
  const effectiveGross = Number(sam.adjustedAmount || sam.grossAmount);
  const costoColMes = effectiveCols > 0 ? effectiveGross / effectiveCols : 0;
  const dueDate = sam.dueDate ? new Date(sam.dueDate) : null;
  const isOverdue = dueDate && new Date() > dueDate;
  const generatedDate = sam.generatedAt ? new Date(sam.generatedAt) : null;
  const daysSinceCreated = generatedDate ? Math.floor((new Date().getTime() - generatedDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const isStale = daysSinceCreated >= 5;

  return (
    <Card className={`border-2 ${isOverdue ? "border-red-300 bg-red-50/30" : isStale ? "border-amber-300 bg-amber-50/20" : "border-cedu-blue/30 bg-cedu-blue/[0.02]"}`} data-testid={`contribution-card-${sam.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-cedu-blue" />
            <CardTitle className="text-xl font-serif">
              {MONTH_NAMES[(sam.periodMonth || 1) - 1]} {sam.periodYear}
            </CardTitle>
            <Badge variant={sam.status === "adjusted" ? "secondary" : "outline"} className="gap-1" data-testid={`contribution-status-${sam.id}`}>
              {sam.status === "adjusted" ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {sam.status === "adjusted" ? "Ajustada — Pendiente de confirmar" : "Pendiente de confirmación"}
            </Badge>
          </div>
          {isOverdue && (
            <span className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Vencida — límite: {dueDate?.toLocaleDateString("es-MX")}
            </span>
          )}
          {!isOverdue && isStale && (
            <span className="text-sm text-amber-600 flex items-center gap-1" data-testid={`stale-warning-${sam.id}`}>
              <Clock className="h-3.5 w-3.5" />
              {daysSinceCreated} días sin confirmar
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${planInfo.bgColor} ${planInfo.color}`}>
          <Building2 className="h-4 w-4" />
          Plan {planInfo.name}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <div className="space-y-1" data-testid="info-umas-col">
            <p className="text-xs text-muted-foreground font-medium">UMAs / colaborador</p>
            <p className="text-lg font-bold">{sam.umasPerCol}</p>
          </div>
          <div className="space-y-1" data-testid="info-uma-value">
            <p className="text-xs text-muted-foreground font-medium">Valor UMA 2026</p>
            <p className="text-lg font-bold">{fmt(sam.umaValue)}</p>
          </div>
          <div className="space-y-1" data-testid="info-cost-per-col">
            <p className="text-xs text-muted-foreground font-medium">Costo / col / mes</p>
            <p className="text-lg font-bold">{fmt(costoColMes)}</p>
          </div>
          <div className="space-y-1" data-testid="info-collaborators">
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1"><Users className="h-3 w-3" /> Colaboradores</p>
            <p className="text-lg font-bold" data-testid={`contribution-cols-${sam.id}`}>{effectiveCols}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-black/[0.08] p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total mensual</p>
              <p className="text-2xl font-bold font-serif" data-testid={`contribution-amount-${sam.id}`}>{fmt(effectiveGross)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Fee de administración ({sam.feePercentage}%)</p>
              <p className="text-lg font-semibold text-cedu-orange">{fmt(sam.feeAmount)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Neto a cooperativa</p>
              <p className="text-lg font-semibold text-cedu-green">{fmt(sam.netToCooperative)}</p>
            </div>
          </div>
          {sam.adjustedAmount && sam.adjustmentReason && (
            <div className="pt-2 border-t border-black/[0.06] text-xs text-muted-foreground">
              Ajuste aplicado: {sam.adjustmentReason} · Original: {fmt(sam.grossAmount)} → Ajustado: {fmt(sam.adjustedAmount)}
            </div>
          )}
        </div>

        {!adjustMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-cedu-blue focus:ring-cedu-blue"
                data-testid="checkbox-confirm-accept"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                Confirmo que la información es correcta y acepto realizar la aportación voluntaria por el monto de{" "}
                <strong>{fmt(effectiveGross)}</strong> conforme a los{" "}
                <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-cedu-blue underline">Términos y Condiciones</a>
                {" "}aceptados al registrarse. Esta confirmación constituye manifestación de voluntad conforme al Art. 89 Bis del Código de Comercio.
              </span>
            </label>

            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => confirmMutation.mutate()}
                disabled={!accepted || confirmMutation.isPending}
                className="bg-cedu-blue hover:bg-cedu-blue/90 text-white"
                data-testid={`btn-confirm-contribution-${sam.id}`}
              >
                {confirmMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Confirmar Aportación
              </Button>
              <Button
                variant="outline"
                onClick={() => { setAdjustMode(true); setAccepted(false); }}
                data-testid={`btn-adjust-contribution-${sam.id}`}
              >
                Solicitar Ajuste
              </Button>
            </div>

            {dueDate && (
              <p className="text-xs text-muted-foreground">
                Fecha límite de confirmación: <strong>{dueDate.toLocaleDateString("es-MX")}</strong>
              </p>
            )}
          </div>
        )}

        {adjustMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-4">
            <p className="font-semibold text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-600" />
              Ajustar número de colaboradores
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Nuevo número de colaboradores</label>
                <Input
                  type="number"
                  min={1}
                  value={adjustCols || ""}
                  onChange={(e) => setAdjustCols(parseInt(e.target.value) || 1)}
                  className="h-10"
                  data-testid={`input-adjust-cols-${sam.id}`}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Motivo del ajuste</label>
                <Textarea
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Ej: Bajas de personal, contrataciones nuevas"
                  rows={1}
                  data-testid={`input-adjust-reason-${sam.id}`}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => adjustMutation.mutate()}
                disabled={adjustMutation.isPending || !adjustReason.trim()}
                className="bg-cedu-orange hover:bg-cedu-orange/90 text-white"
                data-testid={`btn-do-adjust-${sam.id}`}
              >
                {adjustMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Aplicar Ajuste
              </Button>
              <Button variant="outline" onClick={() => setAdjustMode(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type BankInfo = { bank: string; type: string; clabe: string; beneficiary: string };

function HistoryRow({ sam, bankInfo }: { sam: MonthlyContribution; bankInfo: BankInfo }) {
  const BANK_INFO = bankInfo;
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  const planInfo = PLAN_CONFIG[sam.planType] || { name: sam.planType, color: "text-gray-700", bgColor: "bg-gray-100" };
  const effectiveGross = Number(sam.adjustedAmount || sam.grossAmount);
  const effectiveCols = sam.adjustedCollaborators || sam.activeCollaborators;
  const isPaid = sam.status === "paid";
  const isConfirmedUnpaid = sam.status === "confirmed";
  const isPaymentOverdue = isConfirmedUnpaid && new Date().getDate() > 15;
  const paymentRef = `SAM-${sam.periodYear}${String(sam.periodMonth).padStart(2, "0")}`;

  const copyClabe = () => {
    navigator.clipboard.writeText(BANK_INFO.clabe.replace(/\s/g, ""));
    toast({ title: "CLABE copiada", description: "Se copió al portapapeles." });
  };

  return (
    <>
      <tr
        className={`border-b border-black/[0.04] last:border-0 hover:bg-cedu-cream/20 transition-colors ${isConfirmedUnpaid ? "cursor-pointer" : ""} ${isPaymentOverdue ? "bg-red-50/40" : ""}`}
        onClick={() => isConfirmedUnpaid && setExpanded(!expanded)}
        data-testid={`history-row-${sam.id}`}
      >
        <td className="px-4 py-3 font-medium">
          <div className="flex items-center gap-1.5">
            {isConfirmedUnpaid && (expanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />)}
            {MONTH_NAMES[(sam.periodMonth || 1) - 1]} {sam.periodYear}
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planInfo.bgColor} ${planInfo.color}`}>
            {planInfo.name}
          </span>
        </td>
        <td className="px-4 py-3 text-right font-medium">{effectiveCols}</td>
        <td className="px-4 py-3 text-right font-semibold">{fmt(effectiveGross)}</td>
        <td className="px-4 py-3 text-right text-cedu-orange">{fmt(sam.feeAmount)} <span className="text-muted-foreground text-xs">({sam.feePercentage}%)</span></td>
        <td className="px-4 py-3 text-center">
          <Badge variant="default" className={`gap-1 text-xs ${isPaid ? "bg-green-600" : isPaymentOverdue ? "bg-red-600" : "bg-cedu-blue"}`}>
            {isPaid ? <DollarSign className="h-3 w-3" /> : isPaymentOverdue ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
            {isPaid ? "Pagada" : isPaymentOverdue ? "Vencida" : "Confirmada"}
          </Badge>
        </td>
        <td className="px-4 py-3 text-center">
          {sam.cfdiUuid && sam.cfdiStatus === "emitido" ? (
            <a href={`/api/cfdi/${sam.cfdiUuid}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-cedu-blue hover:underline text-xs font-medium" data-testid={`cfdi-link-${sam.id}`} onClick={(e) => e.stopPropagation()}>
              <Receipt className="h-3 w-3" />
              Ver
            </a>
          ) : sam.cfdiStatus === "pending" ? (
            <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              En proceso
            </span>
          ) : isPaid ? (
            <span className="text-xs text-muted-foreground">Pendiente</span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </td>
      </tr>
      {expanded && isConfirmedUnpaid && (
        <tr>
          <td colSpan={7} className="px-4 py-4 bg-cedu-cream/30">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-xs text-muted-foreground">
                  Hash SHA-256: <code className="text-[10px] bg-green-100 px-1 py-0.5 rounded">{sam.confirmationHash?.substring(0, 24)}...</code>
                  {sam.confirmedAt && <> · Confirmada: {new Date(sam.confirmedAt).toLocaleDateString("es-MX")}</>}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm mb-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Pago pendiente</span>
              </div>
              <div className="bg-white border border-black/[0.08] rounded-xl p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Landmark className="h-4 w-4 text-cedu-blue" />
                  <span className="font-semibold">{BANK_INFO.bank} — {BANK_INFO.type}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Beneficiario</p>
                    <p className="font-semibold text-xs">{BANK_INFO.beneficiary}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">CLABE</p>
                    <div className="flex items-center gap-1">
                      <p className="font-mono font-semibold text-xs">{BANK_INFO.clabe}</p>
                      <button onClick={(e) => { e.stopPropagation(); copyClabe(); }} className="text-cedu-blue hover:text-cedu-blue/70" data-testid={`btn-copy-clabe-${sam.id}`}>
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Monto</p>
                    <p className="font-semibold text-xs text-cedu-blue">{fmt(effectiveGross)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Referencia</p>
                    <p className="font-semibold text-xs">{paymentRef}</p>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
      {isPaid && sam.paymentDate && (
        <tr className="bg-green-50/30">
          <td colSpan={7} className="px-4 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-600" /> Pagada: {new Date(sam.paymentDate).toLocaleDateString("es-MX")}</span>
              {sam.paymentMethod && <span>· Método: {sam.paymentMethod.toUpperCase()}</span>}
              {sam.paymentReference && <span>· Ref: {sam.paymentReference}</span>}
              {sam.confirmationHash && <span className="flex items-center gap-1">· <Shield className="h-3 w-3" /> Hash: <code className="text-[10px]">{sam.confirmationHash.substring(0, 16)}...</code></span>}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function ContributionsTab({ teamId }: { teamId: string }) {
  const token = getAuthToken();

  const { data: bankInfo } = useQuery<BankInfo>({
    queryKey: ["/api/bank-info"],
    queryFn: async () => {
      const res = await fetch("/api/bank-info", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return DEFAULT_BANK_INFO;
      return res.json();
    },
    enabled: !!token,
  });

  const { data: contributions, isLoading } = useQuery<MonthlyContribution[]>({
    queryKey: ["/api/teams", teamId, "contributions"],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}/contributions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar aportaciones");
      return res.json();
    },
    enabled: !!teamId && !!token,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-cedu-blue" />
        <span className="ml-3 text-muted-foreground">Cargando aportaciones...</span>
      </div>
    );
  }

  if (!contributions || contributions.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <DollarSign className="h-12 w-12 text-muted-foreground/30 mx-auto" />
        <h3 className="text-lg font-serif font-bold">Sin aportaciones</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          No se han generado solicitudes de aportación mensual (SAM) para esta organización.
          El administrador de Ceduverse genera las SAM al inicio de cada mes.
        </p>
      </div>
    );
  }

  const pending = contributions.filter(c => c.status === "pending" || c.status === "adjusted");
  const confirmed = contributions.filter(c => c.status === "confirmed");
  const paid = contributions.filter(c => c.status === "paid");
  const totalConfirmed = [...confirmed, ...paid].reduce((sum, c) => sum + Number(c.adjustedAmount || c.grossAmount), 0);
  const totalPaid = paid.reduce((sum, c) => sum + Number(c.adjustedAmount || c.grossAmount), 0);

  const now = new Date();
  const dayOfMonth = now.getDate();

  const staleUnconfirmed = pending.filter(c => {
    if (!c.generatedAt) return false;
    const created = new Date(c.generatedAt);
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 5;
  });

  const overdueUnconfirmed = pending.filter(c => {
    if (!c.generatedAt) return false;
    const created = new Date(c.generatedAt);
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 16;
  });

  const overduePayments = confirmed.filter(() => dayOfMonth > 15);

  return (
    <div className="space-y-6" data-testid="contributions-tab">
      <div>
        <h2 className="text-2xl font-serif font-bold">Aportaciones Mensuales (SAM)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Solicitudes de Aportación Mensual de su organización. Confirme las pendientes antes del día 15 de cada mes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card data-testid="stat-pending-count">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold font-serif">{pending.length}</p>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="stat-confirmed-count">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold font-serif">{fmt(totalConfirmed)}</p>
                <p className="text-xs text-muted-foreground">{confirmed.length + paid.length} confirmadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="stat-total-paid">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold font-serif">{fmt(totalPaid)}</p>
                <p className="text-xs text-muted-foreground">{paid.length} pagadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {overdueUnconfirmed.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-100 border-2 border-red-500" data-testid="alert-overdue-unconfirmed">
          <AlertTriangle className="h-5 w-5 text-red-700 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-red-900 text-sm">
              {overdueUnconfirmed.length === 1
                ? "¡URGENTE! 1 aportación lleva más de 16 días sin confirmar"
                : `¡URGENTE! ${overdueUnconfirmed.length} aportaciones llevan más de 16 días sin confirmar`}
            </p>
            <p className="text-xs text-red-800 mt-0.5">
              El plazo de confirmación ha vencido. Tu socio comercial ha sido notificado. Confirma de inmediato para evitar la suspensión del servicio.
              {overdueUnconfirmed.map(c => {
                const created = new Date(c.generatedAt!);
                const days = Math.floor((new Date().getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
                return ` ${MONTH_NAMES[(c.periodMonth || 1) - 1]} ${c.periodYear} (${days} días)`;
              }).join(",")}
            </p>
          </div>
        </div>
      )}

      {staleUnconfirmed.length > 0 && overdueUnconfirmed.length === 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-300" data-testid="alert-stale-unconfirmed">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">
              {staleUnconfirmed.length === 1
                ? "Tienes 1 aportación sin confirmar por más de 5 días"
                : `Tienes ${staleUnconfirmed.length} aportaciones sin confirmar por más de 5 días`}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Confirma tus aportaciones pendientes lo antes posible para evitar retrasos en el servicio.
              {staleUnconfirmed.map(c => ` ${MONTH_NAMES[(c.periodMonth || 1) - 1]} ${c.periodYear}`).join(",")}
            </p>
          </div>
        </div>
      )}

      {overduePayments.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-300" data-testid="alert-overdue-payment">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-800 text-sm">
              {overduePayments.length === 1
                ? "1 aportación confirmada sin pago registrado después del día 15"
                : `${overduePayments.length} aportaciones confirmadas sin pago registrado después del día 15`}
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              La fecha límite de pago es el día 15 de cada mes. Realiza la transferencia y notifica al administrador para evitar la suspensión del servicio.
              {overduePayments.map(c => ` ${MONTH_NAMES[(c.periodMonth || 1) - 1]} ${c.periodYear}`).join(",")}
            </p>
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-serif font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Pendientes de confirmación
          </h3>
          {pending.map(sam => (
            <PendingSAMCard key={sam.id} sam={sam} teamId={teamId} />
          ))}
        </div>
      )}

      {(confirmed.length > 0 || paid.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-lg font-serif font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Historial de aportaciones
          </h3>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="history-table">
                  <thead>
                    <tr className="border-b border-black/[0.08] bg-cedu-cream/40">
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Mes</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Plan</th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Cols</th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Monto</th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Fee</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Estatus</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">CFDI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...confirmed, ...paid]
                      .sort((a, b) => (b.periodYear * 100 + (b.periodMonth || 0)) - (a.periodYear * 100 + (a.periodMonth || 0)))
                      .map(sam => (
                        <HistoryRow key={sam.id} sam={sam} bankInfo={bankInfo || DEFAULT_BANK_INFO} />
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <EmpresaInvoices teamId={teamId} />
    </div>
  );
}

function EmpresaInvoices({ teamId }: { teamId: string }) {
  const token = getAuthToken();
  const { toast } = useToast();

  const { data: facturas = [] } = useQuery<{
    id: string; teamId: string; cfdiUuid: string | null; series: string | null; folioNumber: number | null;
    status: string; total: string; subtotal: string; tax: string; concept: string;
    invoiceType: string; facturapiInvoiceId: string | null; createdAt: string;
  }[]>({
    queryKey: ["/api/empresa/invoices"],
  });

  const teamInvoices = facturas.filter(f => f.teamId === teamId);

  if (teamInvoices.length === 0) return null;

  async function handleDownload(inv: typeof teamInvoices[0], format: "pdf" | "xml") {
    try {
      const res = await fetch(`/api/empresa/invoices/${inv.id}/download/${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al descargar");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CFDI-${inv.cfdiUuid || inv.id}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-3" data-testid="empresa-invoices-section">
      <h3 className="text-base font-semibold text-cedu-ink flex items-center gap-2">
        <Receipt size={16} className="text-cedu-blue" />
        Facturas CFDI
      </h3>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="empresa-invoices-table">
              <thead>
                <tr className="border-b border-black/[0.08] bg-cedu-cream/40">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Folio</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Concepto</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Total</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Estado</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Fecha</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Descargar</th>
                </tr>
              </thead>
              <tbody>
                {teamInvoices.map(inv => (
                  <tr key={inv.id} className="border-b border-black/[0.04] hover:bg-cedu-cream/30" data-testid={`empresa-invoice-${inv.id}`}>
                    <td className="px-4 py-3 font-mono text-xs">{inv.series ? `${inv.series}-${inv.folioNumber}` : "—"}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate">{inv.concept}</td>
                    <td className="px-4 py-3 text-right font-mono">${parseFloat(inv.total).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={inv.status === "active" ? "default" : inv.status === "cancelled" ? "destructive" : "outline"}>
                        {inv.status === "active" ? "Activa" : inv.status === "cancelled" ? "Cancelada" : "Borrador"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-xs">{new Date(inv.createdAt).toLocaleDateString("es-MX")}</td>
                    <td className="px-4 py-3 text-center">
                      {inv.facturapiInvoiceId && inv.status === "active" && (
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" variant="ghost" onClick={() => handleDownload(inv, "pdf")} title="PDF" data-testid={`btn-empresa-pdf-${inv.id}`}>
                            <FileText size={14} className="text-red-500" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDownload(inv, "xml")} title="XML" data-testid={`btn-empresa-xml-${inv.id}`}>
                            <FileText size={14} className="text-blue-500" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

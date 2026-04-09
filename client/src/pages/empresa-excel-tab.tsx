import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Send,
  Users,
  AlertCircle,
  RefreshCw,
  CalendarDays,
} from "lucide-react";
import { getAuthToken } from "@/lib/auth-token";

type Invitation = {
  id: string;
  email: string;
  nombre: string;
  apellido: string | null;
  puesto: string | null;
  departamento: string | null;
  status: "pending" | "accepted" | "expired";
  createdAt: string;
};

type UploadResult = {
  total: number;
  success: number;
  errors: number;
  results: { row: number; nombre: string; email: string; status: string; reason: string }[];
};

type SamStatus = {
  id: string;
  periodYear: number;
  periodMonth: number;
  employeeCount: number;
  status: "pending" | "approved" | "rejected";
  displayStatus: string;
  contributionStatus: string | null;
  paymentStatus: string | null;
  createdAt: string;
  updatedAt: string | null;
} | null;

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export function AfiliacionMasivaTab() {
  const { toast } = useToast();
  const [uploadResults, setUploadResults] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { data: invitations = [], isLoading: invitationsLoading } = useQuery<Invitation[]>({
    queryKey: ["/api/empresa/invitations"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const token = getAuthToken();
      const res = await fetch("/api/empresa/invitations/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al procesar archivo");
      }
      return res.json() as Promise<UploadResult>;
    },
    onSuccess: (data) => {
      setUploadResults(data);
      queryClient.invalidateQueries({ queryKey: ["/api/empresa/invitations"] });
      toast({ title: `${data.success} invitaciones enviadas`, description: data.errors > 0 ? `${data.errors} errores encontrados` : undefined });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/empresa/invitations/${id}/resend`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Invitación reenviada" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast({ title: "Formato no válido", description: "Solo se aceptan archivos .xlsx o .xls", variant: "destructive" });
      return;
    }
    uploadMutation.mutate(file);
  }, [uploadMutation, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }, [handleFile]);

  const downloadTemplate = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch("/api/empresa/invitations/template", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al descargar");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "plantilla-empleados.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Error al descargar plantilla", variant: "destructive" });
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="secondary" className="text-[10px] gap-1" data-testid="badge-status-pending"><Clock className="w-3 h-3" /> Pendiente</Badge>;
      case "accepted": return <Badge className="bg-green-100 text-green-700 border-0 text-[10px] gap-1" data-testid="badge-status-accepted"><CheckCircle2 className="w-3 h-3" /> Aceptada</Badge>;
      case "expired": return <Badge variant="destructive" className="text-[10px] gap-1" data-testid="badge-status-expired"><XCircle className="w-3 h-3" /> Expirada</Badge>;
      default: return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['DM_Serif_Display'] text-2xl text-cedu-ink" data-testid="text-afiliacion-title">Afiliación Masiva</h2>
        <p className="text-sm text-gray-500 font-['Plus_Jakarta_Sans'] mt-1">
          Sube un archivo Excel con la lista de empleados para enviar invitaciones personalizadas.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-black/[0.06]" data-testid="card-download-template">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-cedu-blue/10 rounded-xl flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-cedu-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-sm font-['Plus_Jakarta_Sans']">Plantilla Excel</h3>
                <p className="text-xs text-gray-400">Descarga y llena con los datos</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="w-full" data-testid="button-download-template">
              <Download className="w-4 h-4 mr-2" /> Descargar Plantilla
            </Button>
          </CardContent>
        </Card>

        <Card
          className={`border-2 border-dashed transition-colors ${dragActive ? "border-cedu-blue bg-cedu-blue/5" : "border-black/[0.1]"}`}
          data-testid="card-upload-zone"
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <CardContent className="pt-5 pb-4 text-center">
            <div className="flex flex-col items-center gap-2">
              {uploadMutation.isPending ? (
                <Loader2 className="w-8 h-8 text-cedu-blue animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-gray-300" />
              )}
              <p className="text-sm text-gray-500 font-['Plus_Jakarta_Sans']">
                {uploadMutation.isPending ? "Procesando..." : "Arrastra tu archivo aquí o"}
              </p>
              <label className="cursor-pointer">
                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileInput} disabled={uploadMutation.isPending} data-testid="input-upload-file" />
                <Button variant="default" size="sm" className="bg-cedu-blue hover:bg-cedu-blue/90 pointer-events-none" data-testid="button-select-file">
                  Seleccionar Archivo
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {uploadResults && (
        <Card className="border-black/[0.06]" data-testid="card-upload-results">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['DM_Serif_Display'] text-base">Resultado de la Carga</h3>
              <div className="flex items-center gap-3 text-sm font-['Plus_Jakarta_Sans']">
                <span className="text-green-600 font-semibold" data-testid="text-success-count">
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />{uploadResults.success} enviadas
                </span>
                {uploadResults.errors > 0 && (
                  <span className="text-red-500 font-semibold" data-testid="text-error-count">
                    <XCircle className="w-4 h-4 inline mr-1" />{uploadResults.errors} errores
                  </span>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-['Plus_Jakarta_Sans']">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-400">
                    <th className="pb-2 font-medium">Fila</th>
                    <th className="pb-2 font-medium">Nombre</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Estado</th>
                    <th className="pb-2 font-medium">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadResults.results.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50" data-testid={`upload-result-row-${i}`}>
                      <td className="py-2 text-gray-400">{r.row}</td>
                      <td className="py-2">{r.nombre || "—"}</td>
                      <td className="py-2 text-gray-500">{r.email}</td>
                      <td className="py-2">
                        {r.status === "ok" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </td>
                      <td className="py-2 text-xs text-gray-400">{r.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-black/[0.06]" data-testid="card-invitation-history">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['DM_Serif_Display'] text-base">Historial de Invitaciones</h3>
            <Badge variant="secondary" className="text-xs" data-testid="badge-invitation-count">
              <Users className="w-3 h-3 mr-1" /> {invitations.length} total
            </Badge>
          </div>
          {invitationsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400 font-['Plus_Jakarta_Sans']">No hay invitaciones enviadas aún</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-['Plus_Jakarta_Sans']">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-400">
                    <th className="pb-2 font-medium">Nombre</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Puesto</th>
                    <th className="pb-2 font-medium">Estado</th>
                    <th className="pb-2 font-medium">Fecha</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => (
                    <tr key={inv.id} className="border-b border-gray-50" data-testid={`invitation-row-${inv.id}`}>
                      <td className="py-2.5 font-semibold">{inv.nombre} {inv.apellido || ""}</td>
                      <td className="py-2.5 text-gray-500">{inv.email}</td>
                      <td className="py-2.5 text-gray-400">{inv.puesto || "—"}</td>
                      <td className="py-2.5">{statusBadge(inv.status)}</td>
                      <td className="py-2.5 text-xs text-gray-400">
                        {new Date(inv.createdAt).toLocaleDateString("es-MX")}
                      </td>
                      <td className="py-2.5">
                        {inv.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-cedu-blue"
                            onClick={() => resendMutation.mutate(inv.id)}
                            disabled={resendMutation.isPending}
                            data-testid={`button-resend-${inv.id}`}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" /> Reenviar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function SamMensualTab() {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);

  const { data: samStatus, isLoading: samLoading } = useQuery<SamStatus>({
    queryKey: ["/api/empresa/sam/status"],
  });

  const uploadSamMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const token = getAuthToken();
      const res = await fetch("/api/empresa/sam/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al procesar archivo");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/empresa/sam/status"] });
      toast({ title: "Solicitud SAM registrada", description: "El administrador será notificado" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast({ title: "Formato no válido", description: "Solo se aceptan archivos .xlsx o .xls", variant: "destructive" });
      return;
    }
    uploadSamMutation.mutate(file);
  }, [uploadSamMutation, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }, [handleFile]);

  const downloadSamTemplate = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch("/api/empresa/sam/template", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al descargar");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reporte-empleados-sam.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Error al descargar reporte", variant: "destructive" });
    }
  };

  const now = new Date();
  const currentMonth = MONTH_NAMES[now.getMonth()];
  const currentYear = now.getFullYear();

  const getStatusInfo = () => {
    if (!samStatus) return { label: "Sin enviar", color: "bg-gray-100 text-gray-500", icon: AlertCircle };
    const ds = samStatus.displayStatus || samStatus.status;
    switch (ds) {
      case "pending": return { label: "Pendiente de revisión", color: "bg-yellow-50 text-yellow-700", icon: Clock };
      case "approved": return { label: "Aprobada", color: "bg-green-50 text-green-700", icon: CheckCircle2 };
      case "rejected": return { label: "Rechazada", color: "bg-red-50 text-red-700", icon: XCircle };
      case "pagada": return { label: "Pagada", color: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 };
      case "sin_enviar": return { label: "Sin enviar", color: "bg-gray-100 text-gray-500", icon: AlertCircle };
      default: return { label: "Sin enviar", color: "bg-gray-100 text-gray-500", icon: AlertCircle };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['DM_Serif_Display'] text-2xl text-cedu-ink" data-testid="text-sam-title">Solicitud SAM Mensual</h2>
        <p className="text-sm text-gray-500 font-['Plus_Jakarta_Sans'] mt-1">
          Descarga el reporte de empleados, revísalo y súbelo como solicitud oficial del mes.
        </p>
      </div>

      <Card className="border-black/[0.06]" data-testid="card-sam-status">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cedu-violet/10 rounded-xl flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-cedu-violet" />
              </div>
              <div>
                <h3 className="font-semibold text-sm font-['Plus_Jakarta_Sans']">{currentMonth} {currentYear}</h3>
                <p className="text-xs text-gray-400">Periodo actual</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${statusInfo.color} border-0 text-xs gap-1`} data-testid="badge-sam-status">
                <statusInfo.icon className="w-3 h-3" /> {statusInfo.label}
              </Badge>
            </div>
          </div>
          {samStatus && (
            <div className="mt-3 pt-3 border-t border-black/[0.06] flex items-center gap-4 text-xs text-gray-400 font-['Plus_Jakarta_Sans']">
              <span data-testid="text-sam-employees">{samStatus.employeeCount} empleados en solicitud</span>
              <span data-testid="text-sam-date">Enviada: {new Date(samStatus.createdAt).toLocaleDateString("es-MX")}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-black/[0.06]" data-testid="card-sam-download">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm font-['Plus_Jakarta_Sans']">Reporte de Empleados</h3>
                <p className="text-xs text-gray-400">Pre-llenado con datos actuales</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={downloadSamTemplate} className="w-full" data-testid="button-download-sam">
              <Download className="w-4 h-4 mr-2" /> Descargar Reporte (.xlsx)
            </Button>
          </CardContent>
        </Card>

        <Card
          className={`border-2 border-dashed transition-colors ${dragActive ? "border-cedu-violet bg-cedu-violet/5" : "border-black/[0.1]"}`}
          data-testid="card-sam-upload-zone"
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <CardContent className="pt-5 pb-4 text-center">
            <div className="flex flex-col items-center gap-2">
              {uploadSamMutation.isPending ? (
                <Loader2 className="w-8 h-8 text-cedu-violet animate-spin" />
              ) : (
                <Send className="w-8 h-8 text-gray-300" />
              )}
              <p className="text-sm text-gray-500 font-['Plus_Jakarta_Sans']">
                {uploadSamMutation.isPending ? "Procesando solicitud..." : "Sube la solicitud firmada"}
              </p>
              <label className="cursor-pointer">
                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileInput} disabled={uploadSamMutation.isPending} data-testid="input-sam-upload" />
                <Button variant="default" size="sm" className="bg-cedu-violet hover:bg-cedu-violet/90 pointer-events-none" data-testid="button-sam-select-file">
                  Subir Solicitud SAM
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

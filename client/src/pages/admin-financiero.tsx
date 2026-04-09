import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Calculator,
  BarChart3,
  Trophy,
  Globe,
  DollarSign,
  TrendingUp,
  Users,
  Building2,
  Target,
  Car,
  Plane,
  Home,
  Smartphone,
  Award,
  ChevronRight,
} from "lucide-react";

const UMA = 113.14;

interface SimulationResult {
  ingresos: {
    aportMensual: number;
    aportAnual: number;
    feeMensual: number;
    feeAnual: number;
    cantDc3: number;
    margenDc3Anual: number;
    cantSep: number;
    margenSepAnual: number;
    ingresoTotalMes: number;
    ingresoTotalAnual: number;
  };
  costos: {
    costoOpsMensual: number;
    comisionConsultoresMes: number;
    overrideDirectoresMes: number;
    comisionCierreMes: number;
    comDc3Mes: number;
    comSepMes: number;
    costoTotalMes: number;
    costoTotalAnual: number;
  };
  margen: {
    margenBrutoMes: number;
    margenBrutoAnual: number;
    pctMargen: number;
    margenBonosMes: number;
    margenBonosAnual: number;
  };
}
const COSTO_OPS = 94857;

type Tab = "simulador" | "escenarios" | "bonos" | "potencial";
const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "simulador", label: "Simulador", icon: Calculator },
  { key: "escenarios", label: "Escenarios", icon: BarChart3 },
  { key: "bonos", label: "Bonos", icon: Trophy },
  { key: "potencial", label: "Potencial", icon: Globe },
];

function formatMXN(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function SemaforoCard({ pctMargen, margenBonosAnual, empresas }: { pctMargen: number; margenBonosAnual: number; empresas: number }) {
  let color = "#ef4444";
  let bg = "bg-red-50 dark:bg-red-950/20";
  let border = "border-red-200";
  let emoji = "🔴";
  let label = "No hay espacio para bonos, enfocarse en crecer";
  if (pctMargen >= 40) { color = "#3b82f6"; bg = "bg-blue-50 dark:bg-blue-950/20"; border = "border-blue-200"; emoji = "🔵"; label = "Espacio para bonos premium (casas, autos de lujo)"; }
  else if (pctMargen >= 25) { color = "#22c55e"; bg = "bg-green-50 dark:bg-green-950/20"; border = "border-green-200"; emoji = "🟢"; label = "Espacio para bonos agresivos (autos, viajes)"; }
  else if (pctMargen >= 10) { color = "#f59e0b"; bg = "bg-yellow-50 dark:bg-yellow-950/20"; border = "border-yellow-200"; emoji = "🟡"; label = "Espacio para bonos moderados"; }

  return (
    <Card className={`border ${border} ${bg}`}>
      <CardContent className="p-6 text-center">
        <p className="text-4xl mb-2">{emoji}</p>
        <p className="text-2xl font-bold" style={{ color }} data-testid="margen-bonos-anual">
          Con {empresas} empresas tienes {formatMXN(margenBonosAnual)} disponibles al año para bonos
        </p>
        <p className="text-sm mt-2 font-medium" style={{ color }}>{label}</p>
        <p className="text-xs text-gray-500 mt-1">Margen: {pctMargen.toFixed(1)}%</p>
      </CardContent>
    </Card>
  );
}

function SimuladorTab() {
  const [empresas, setEmpresas] = useState(32);
  const [plan, setPlan] = useState("Transforma");
  const [avgCols, setAvgCols] = useState(30);
  const [tasaDc3, setTasaDc3] = useState(40);
  const [tasaSep, setTasaSep] = useState(5);
  const [numConsultores, setNumConsultores] = useState(7);
  const [numDirectores, setNumDirectores] = useState(1);
  const [tierComision, setTierComision] = useState("25");

  const simMutation = useMutation({
    mutationFn: async (params: Record<string, number | string>): Promise<SimulationResult> => {
      const res = await apiRequest("POST", "/api/admin/financiero/simular", params);
      return res.json() as Promise<SimulationResult>;
    },
  });

  const runSim = () => {
    simMutation.mutate({
      empresas, plan, avgCols,
      tasaDc3: tasaDc3 / 100,
      tasaSep: tasaSep / 100,
      numConsultores, numDirectores, tierComision,
    });
  };

  const data = simMutation.data;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Parámetros del modelo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Empresas cliente</label>
                <Input type="number" value={empresas} onChange={(e) => setEmpresas(Math.max(1, Math.min(9999, parseInt(e.target.value) || 1)))} className="w-20 h-7 text-xs text-right px-2" data-testid="input-empresas" />
              </div>
              <Slider value={[Math.min(empresas, 500)]} onValueChange={([v]) => setEmpresas(v)} min={1} max={500} step={1} className="mt-1" data-testid="slider-empresas" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Plan predominante</label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger className="mt-1" data-testid="select-plan-sim">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Impulsa">Impulsa (6 UMA, 15%)</SelectItem>
                  <SelectItem value="Transforma">Transforma (10 UMA, 8%)</SelectItem>
                  <SelectItem value="Lidera">Lidera (20 UMA, 5%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Cols promedio</label>
                <Input type="number" value={avgCols} onChange={(e) => setAvgCols(Math.max(1, Math.min(9999, parseInt(e.target.value) || 1)))} className="w-20 h-7 text-xs text-right px-2" data-testid="input-cols" />
              </div>
              <Slider value={[Math.min(avgCols, 500)]} onValueChange={([v]) => setAvgCols(v)} min={1} max={500} step={5} className="mt-1" data-testid="slider-cols" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Tier comisión</label>
              <Select value={tierComision} onValueChange={setTierComision}>
                <SelectTrigger className="mt-1" data-testid="select-tier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25% (1-3 empresas)</SelectItem>
                  <SelectItem value="30">30% (4-7 empresas)</SelectItem>
                  <SelectItem value="35">35% (8+ empresas)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Tasa DC-3</label>
                <div className="flex items-center gap-1">
                  <Input type="number" value={tasaDc3} onChange={(e) => setTasaDc3(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))} className="w-16 h-7 text-xs text-right px-2" data-testid="input-tasa-dc3" />
                  <span className="text-xs text-gray-500">%</span>
                </div>
              </div>
              <Slider value={[tasaDc3]} onValueChange={([v]) => setTasaDc3(v)} min={0} max={100} step={1} className="mt-1" data-testid="slider-tasa-dc3" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Tasa SEP</label>
                <div className="flex items-center gap-1">
                  <Input type="number" value={tasaSep} onChange={(e) => setTasaSep(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))} className="w-16 h-7 text-xs text-right px-2" data-testid="input-tasa-sep" />
                  <span className="text-xs text-gray-500">%</span>
                </div>
              </div>
              <Slider value={[tasaSep]} onValueChange={([v]) => setTasaSep(v)} min={0} max={100} step={1} className="mt-1" data-testid="slider-tasa-sep" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Consultores</label>
                <Input type="number" value={numConsultores} onChange={(e) => setNumConsultores(Math.max(0, Math.min(999, parseInt(e.target.value) || 0)))} className="w-16 h-7 text-xs text-right px-2" data-testid="input-consultores" />
              </div>
              <Slider value={[Math.min(numConsultores, 100)]} onValueChange={([v]) => setNumConsultores(v)} min={0} max={100} step={1} className="mt-1" data-testid="slider-consultores" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Directores</label>
                <Input type="number" value={numDirectores} onChange={(e) => setNumDirectores(Math.max(0, Math.min(999, parseInt(e.target.value) || 0)))} className="w-16 h-7 text-xs text-right px-2" data-testid="input-directores" />
              </div>
              <Slider value={[Math.min(numDirectores, 30)]} onValueChange={([v]) => setNumDirectores(v)} min={0} max={30} step={1} className="mt-1" data-testid="slider-directores" />
            </div>
          </div>
          <Button className="bg-[#1b5adf] hover:bg-[#1b5adf]/90" onClick={runSim} disabled={simMutation.isPending} data-testid="btn-simular">
            <Calculator className="w-4 h-4 mr-2" />
            {simMutation.isPending ? "Calculando..." : "Simular"}
          </Button>
        </CardContent>
      </Card>

      {data && (
        <>
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />Sección A: Ingresos Brutos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Aportación mensual" value={formatMXN(data.ingresos.aportMensual)} />
                <Row label="Aportación anual" value={formatMXN(data.ingresos.aportAnual)} />
                <Row label="Fee Ceduverse/mes" value={formatMXN(data.ingresos.feeMensual)} bold />
                <Row label="Fee Ceduverse/año" value={formatMXN(data.ingresos.feeAnual)} bold />
                <div className="border-t pt-2 mt-2" />
                <Row label={`DC-3 (${data.ingresos.cantDc3} certs)`} value={formatMXN(data.ingresos.margenDc3Anual)} />
                <Row label={`SEP (${data.ingresos.cantSep} certs)`} value={formatMXN(data.ingresos.margenSepAnual)} />
                <div className="border-t pt-2 mt-2" />
                <Row label="INGRESO TOTAL/MES" value={formatMXN(data.ingresos.ingresoTotalMes)} bold green />
                <Row label="INGRESO TOTAL/AÑO" value={formatMXN(data.ingresos.ingresoTotalAnual)} bold green />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />Sección B: Costos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Operación fija/mes" value={formatMXN(data.costos.costoOpsMensual)} />
                <Row label="Comisiones consultores/mes" value={formatMXN(data.costos.comisionConsultoresMes)} />
                <Row label="Override directores/mes" value={formatMXN(data.costos.overrideDirectoresMes)} />
                <Row label="Comisión cierre/mes" value={formatMXN(data.costos.comisionCierreMes)} />
                <Row label="Comisiones DC-3/mes" value={formatMXN(data.costos.comDc3Mes)} />
                <Row label="Comisiones SEP/mes" value={formatMXN(data.costos.comSepMes)} />
                <div className="border-t pt-2 mt-2" />
                <Row label="COSTO TOTAL/MES" value={formatMXN(data.costos.costoTotalMes)} bold red />
                <Row label="COSTO TOTAL/AÑO" value={formatMXN(data.costos.costoTotalAnual)} bold red />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-600 flex items-center gap-2">
                  <Target className="w-4 h-4" />Sección C: Margen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="MARGEN BRUTO/MES" value={formatMXN(data.margen.margenBrutoMes)} bold />
                <Row label="MARGEN BRUTO/AÑO" value={formatMXN(data.margen.margenBrutoAnual)} bold />
                <Row label="% de margen" value={`${data.margen.pctMargen.toFixed(1)}%`} bold />
                <div className="border-t pt-2 mt-2" />
                <Row label="Disponible bonos/mes (50%)" value={formatMXN(data.margen.margenBonosMes)} bold green />
                <Row label="Disponible bonos/año (50%)" value={formatMXN(data.margen.margenBonosAnual)} bold green />
              </CardContent>
            </Card>
          </div>

          <SemaforoCard
            pctMargen={data.margen.pctMargen}
            margenBonosAnual={data.margen.margenBonosAnual}
            empresas={empresas}
          />
        </>
      )}
    </div>
  );
}

function Row({ label, value, bold, green, red }: { label: string; value: string; bold?: boolean; green?: boolean; red?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`${bold ? "font-semibold" : ""} text-gray-700 dark:text-gray-300`}>{label}</span>
      <span className={`${bold ? "font-bold" : "font-medium"} ${green ? "text-green-600" : red ? "text-red-600" : ""}`}>{value}</span>
    </div>
  );
}

function EscenariosTab() {
  const { data, isLoading } = useQuery<EscenariosResponse>({ queryKey: ["/api/admin/financiero/escenarios"] });

  if (isLoading) return <Skeleton className="h-64" />;

  const scenarios = data?.scenarios || [];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm p-2">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-gray-500 uppercase">
                  <th className="p-3 font-medium">Escenario</th>
                  <th className="p-3 font-medium text-right">Empresas</th>
                  <th className="p-3 font-medium text-right">Cols</th>
                  <th className="p-3 font-medium text-right">Ingreso/año</th>
                  <th className="p-3 font-medium text-right">Costos/año</th>
                  <th className="p-3 font-medium text-right">Margen/año</th>
                  <th className="p-3 font-medium text-right">Bonos disp./año</th>
                  <th className="p-3 font-medium text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s: Scenario, i: number) => {
                  const colors: Record<string, string> = {
                    rojo: "bg-red-100 text-red-700",
                    amarillo: "bg-yellow-100 text-yellow-700",
                    verde: "bg-green-100 text-green-700",
                    azul: "bg-blue-100 text-blue-700",
                  };
                  return (
                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50" data-testid={`escenario-row-${i}`}>
                      <td className="p-3 font-medium">{s.name}</td>
                      <td className="p-3 text-right">{s.empresas?.toLocaleString()}</td>
                      <td className="p-3 text-right">{s.avgCols}</td>
                      <td className="p-3 text-right text-green-600 font-medium">{formatMXN(s.ingresos?.ingresoTotalAnual || 0)}</td>
                      <td className="p-3 text-right text-red-600">{formatMXN(s.costos?.costoTotalAnual || 0)}</td>
                      <td className="p-3 text-right font-semibold">{formatMXN(s.margen?.margenBrutoAnual || 0)}</td>
                      <td className="p-3 text-right font-bold text-blue-600">{formatMXN(s.margen?.margenBonosAnual || 0)}</td>
                      <td className="p-3 text-center">
                        <Badge className={colors[s.margen?.semaforo || "rojo"]}>{s.margen?.semaforo}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Break-even operación</p>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-300" data-testid="break-even-empresas">{data?.breakEvenEmpresas || 0} empresas</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Transforma, 30 cols promedio</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-purple-50 dark:bg-purple-950/20">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-1">Mercado total identificado</p>
            <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">{data?.totalEmpresas?.toLocaleString() || 0}</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">empresas en la base de datos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface Bono {
  nivel: number;
  nombre: string;
  metaEmpresas: number;
  metaFees: number;
  bono: string;
  costo: number;
  sociosEstimados: number;
}

interface Scenario {
  name: string;
  empresas: number;
  avgCols: number;
  aportacionMensual: number;
  feeAnual: number;
  comisionAnual: number;
  dc3Ingreso: number;
  sepIngreso: number;
  ingresoTotal: number;
  ingresos: { ingresoTotalAnual: number };
  costos: { costoTotalAnual: number };
  margen: {
    margenBonosAnual: number;
    margenBrutoAnual: number;
    margenNeto: number;
    margenPct: number;
    semaforo: string;
  };
  costoOpsAnual: number;
  semaforo: string;
}

interface EscenariosResponse {
  scenarios: Scenario[];
  breakEvenEmpresas: number;
  totalEmpresas: number;
}

interface PotencialResponse {
  mercado: {
    total: number;
    con11Plus: number;
    altaPrioridad: number;
    potencialAnual: number;
    feePotencialAnual: number;
  };
  captureAnalysis: PotencialCapture[];
  breakEven: Record<string, number>;
  zonalStats: PotencialZone[];
  topSectors: PotencialSector[];
  topMunicipios: PotencialMunicipio[];
}

interface PotencialZone {
  estado: string;
  total: string;
  potencial: string;
}

interface PotencialSector {
  sector: string;
  count: string;
  potencial: string;
}

interface PotencialMunicipio {
  municipio: string;
  count: string;
  potencial: string;
  alta_prioridad: string;
}

interface PotencialCapture {
  pct: number;
  empresas: number;
  ingresos: { ingresoTotalAnual: number };
  costos: { costoTotalAnual: number };
  margen: { margenBrutoAnual: number; margenBonosAnual: number; semaforo: string };
}

const DEFAULT_BONOS: Bono[] = [
  { nivel: 1, nombre: "Semilla 🌱", metaEmpresas: 3, metaFees: 0, bono: "Cash $10,000 + certificado + pin", costo: 10000, sociosEstimados: 10 },
  { nivel: 2, nombre: "Crecimiento 🌿", metaEmpresas: 6, metaFees: 50000, bono: "iPhone/Samsung último modelo + viaje fin de semana", costo: 25000, sociosEstimados: 5 },
  { nivel: 3, nombre: "Estrella ⭐", metaEmpresas: 10, metaFees: 120000, bono: "Viaje todo incluido 5 días para 2 personas", costo: 50000, sociosEstimados: 3 },
  { nivel: 4, nombre: "Diamante 💎", metaEmpresas: 20, metaFees: 300000, bono: "Auto nuevo (Nissan Versa/Chevrolet Aveo 2027)", costo: 350000, sociosEstimados: 1 },
  { nivel: 5, nombre: "Leyenda 👑", metaEmpresas: 35, metaFees: 600000, bono: "Enganche casa $500K o auto premium o cash $500K", costo: 500000, sociosEstimados: 0 },
  { nivel: 6, nombre: "Arquitecto 🏗️", metaEmpresas: 0, metaFees: 1000000, bono: "Override 5%→8% + viaje internacional para 2", costo: 80000, sociosEstimados: 0 },
];

function BonosTab() {
  const [bonos, setBonos] = useState(DEFAULT_BONOS);
  const [budgetManual, setBudgetManual] = useState<number | null>(null);

  const escQuery = useQuery<EscenariosResponse>({ queryKey: ["/api/admin/financiero/escenarios"] });
  const obj2 = escQuery.data?.scenarios?.find((s) => s.name?.includes("Objetivo 2"));
  const margenAnual = obj2?.margen?.margenBonosAnual || 0;
  const budget = budgetManual ?? margenAnual;

  const costoTotal = bonos.reduce((s, b) => s + b.costo * b.sociosEstimados, 0);
  const pctDelMargen = budget > 0 ? (costoTotal / budget) * 100 : 0;

  const feePorEmpresa = 30 * 10 * UMA * 0.08;
  const feesGenerados = bonos.reduce((s, b) => s + b.metaEmpresas * b.sociosEstimados * feePorEmpresa * 12, 0);
  const roi = costoTotal > 0 ? feesGenerados / costoTotal : 0;

  let semaforo = "verde";
  let semaforoColor = "text-green-700 bg-green-50 border-green-200";
  if (pctDelMargen > 100) { semaforo = "rojo"; semaforoColor = "text-red-700 bg-red-50 border-red-200"; }
  else if (pctDelMargen > 75) { semaforo = "amarillo"; semaforoColor = "text-yellow-700 bg-yellow-50 border-yellow-200"; }

  const updateBono = <K extends keyof Bono>(idx: number, field: K, value: Bono[K]) => {
    const next = [...bonos];
    next[idx] = { ...next[idx], [field]: value };
    setBonos(next);
  };

  const ICONS = [Award, Smartphone, Plane, Car, Home, Trophy];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#f28023]" />
            Programa CEDUVERSE ELITE — Sistema de bonos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-600">Budget anual para bonos</label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudgetManual(parseInt(e.target.value) || 0)}
                className="max-w-[200px]"
                data-testid="input-budget-bonos"
              />
              <span className="text-xs text-gray-500">(auto-calculado del margen Obj. 2, editable)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-gray-500 uppercase">
                  <th className="p-2 font-medium">Nivel</th>
                  <th className="p-2 font-medium">Nombre</th>
                  <th className="p-2 font-medium text-center">Meta (emp)</th>
                  <th className="p-2 font-medium text-center">Meta (fees)</th>
                  <th className="p-2 font-medium">Bono</th>
                  <th className="p-2 font-medium text-right">Costo</th>
                  <th className="p-2 font-medium text-center">Socios est.</th>
                  <th className="p-2 font-medium text-right">Costo total</th>
                  <th className="p-2 font-medium text-right">ROI</th>
                </tr>
              </thead>
              <tbody>
                {bonos.map((b, i) => {
                  const Icon = ICONS[i] || Award;
                  const feesEste = b.metaEmpresas * b.sociosEstimados * feePorEmpresa * 12;
                  const roiEste = b.costo * b.sociosEstimados > 0 ? feesEste / (b.costo * b.sociosEstimados) : 0;
                  return (
                    <tr key={i} className="border-b last:border-0" data-testid={`bono-row-${i}`}>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <Icon className="w-4 h-4 text-[#f28023]" />
                          <span className="font-medium">{b.nivel}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <Input
                          value={b.nombre}
                          onChange={(e) => updateBono(i, "nombre", e.target.value)}
                          className="h-7 text-xs min-w-[120px]"
                          data-testid={`input-bono-nombre-${i}`}
                        />
                      </td>
                      <td className="p-2 text-center">
                        <Input
                          type="number"
                          value={b.metaEmpresas}
                          onChange={(e) => updateBono(i, "metaEmpresas", parseInt(e.target.value) || 0)}
                          className="h-7 text-xs w-16 mx-auto text-center"
                          data-testid={`input-bono-meta-emp-${i}`}
                        />
                      </td>
                      <td className="p-2 text-center">
                        <Input
                          type="number"
                          value={b.metaFees}
                          onChange={(e) => updateBono(i, "metaFees", parseInt(e.target.value) || 0)}
                          className="h-7 text-xs w-24 mx-auto text-center"
                          data-testid={`input-bono-meta-fees-${i}`}
                        />
                      </td>
                      <td className="p-2 text-xs max-w-[200px] truncate">{b.bono}</td>
                      <td className="p-2 text-right">
                        <Input
                          type="number"
                          value={b.costo}
                          onChange={(e) => updateBono(i, "costo", parseInt(e.target.value) || 0)}
                          className="h-7 text-xs w-24 ml-auto text-right"
                          data-testid={`input-bono-costo-${i}`}
                        />
                      </td>
                      <td className="p-2 text-center">
                        <Input
                          type="number"
                          value={b.sociosEstimados}
                          onChange={(e) => updateBono(i, "sociosEstimados", parseInt(e.target.value) || 0)}
                          className="h-7 text-xs w-14 mx-auto text-center"
                          data-testid={`input-bono-socios-${i}`}
                        />
                      </td>
                      <td className="p-2 text-right font-medium">{formatMXN(b.costo * b.sociosEstimados)}</td>
                      <td className="p-2 text-right">
                        <Badge variant="outline" className={roiEste >= 1 ? "text-green-700" : "text-red-600"}>
                          {roiEste.toFixed(1)}x
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className={`border ${semaforoColor}`}>
        <CardContent className="p-6 text-center">
          <p className="text-2xl font-bold" data-testid="costo-programa-bonos">
            Tu programa de bonos cuesta {formatMXN(costoTotal)}/año
          </p>
          <p className="text-lg mt-1">y representa el {pctDelMargen.toFixed(1)}% de tu margen</p>
          <p className="text-lg mt-1">
            Genera {formatMXN(feesGenerados)}/año en fees adicionales
          </p>
          <p className="text-2xl font-bold mt-2" data-testid="roi-programa">
            ROI del programa: {roi.toFixed(1)}x
          </p>
          {pctDelMargen > 100 && (
            <p className="text-red-600 font-semibold mt-3">
              ⚠️ Programa de bonos excede el margen. Reduce los niveles 4-5 o aumenta la meta de empresas.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Detalle por nivel — ROI individual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bonos.map((b, i) => {
              const fees1yr = b.metaEmpresas * feePorEmpresa * 12;
              const roiInd = b.costo > 0 ? fees1yr / b.costo : 0;
              const fees2yr = fees1yr * 2;
              return (
                <Card key={i} className="border shadow-sm">
                  <CardContent className="p-4">
                    <p className="font-semibold text-sm">{b.nombre}</p>
                    <p className="text-xs text-gray-500 mt-1">{b.metaEmpresas} empresas → {formatMXN(fees1yr)}/año fees</p>
                    <p className="text-xs text-gray-500">Bono: {formatMXN(b.costo)}</p>
                    <p className="text-sm font-bold mt-2">
                      ROI año 1: <span className={roiInd >= 1 ? "text-green-600" : "text-red-600"}>{roiInd.toFixed(1)}x</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Año 2 (recurrente): {formatMXN(fees2yr)} sin pagar otro bono
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PotencialTab() {
  const { data, isLoading } = useQuery<PotencialResponse>({ queryKey: ["/api/admin/financiero/potencial"] });

  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}</div>;

  const defaultMercado: PotencialResponse["mercado"] = { total: 0, con11Plus: 0, altaPrioridad: 0, potencialAnual: 0, feePotencialAnual: 0 };
  const m = data?.mercado ?? defaultMercado;
  const captures = data?.captureAnalysis || [];
  const be = data?.breakEven || {};
  const zones = data?.zonalStats || [];
  const sectors = data?.topSectors || [];
  const munis = data?.topMunicipios || [];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#1b5adf]" />
            Mercado total identificado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatBox label="Total empresas" value={m.total?.toLocaleString() || "0"} color="#1b5adf" />
            <StatBox label="Con 11+ empleados" value={m.con11Plus?.toLocaleString() || "0"} color="#7c3aed" />
            <StatBox label="Alta prioridad (70+)" value={m.altaPrioridad?.toLocaleString() || "0"} color="#f28023" />
            <StatBox label="Valor potencial/año" value={formatMXN(m.potencialAnual || 0)} color="#22c55e" />
            <StatBox label="Fee potencial/año" value={formatMXN(m.feePotencialAnual || 0)} color="#1b5adf" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-[#7c3aed]" />
            Si captamos el X%...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-gray-500 uppercase">
                  <th className="p-2 font-medium">% captura</th>
                  <th className="p-2 font-medium text-right">Empresas</th>
                  <th className="p-2 font-medium text-right">Ingreso/año</th>
                  <th className="p-2 font-medium text-right">Costos/año</th>
                  <th className="p-2 font-medium text-right">Margen/año</th>
                  <th className="p-2 font-medium text-right">Bonos disp.</th>
                  <th className="p-2 font-medium text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {captures.map((c: PotencialCapture, i: number) => (
                  <tr key={i} className="border-b last:border-0" data-testid={`capture-row-${c.pct}`}>
                    <td className="p-2 font-medium">{c.pct}%</td>
                    <td className="p-2 text-right">{c.empresas?.toLocaleString()}</td>
                    <td className="p-2 text-right text-green-600">{formatMXN(c.ingresos?.ingresoTotalAnual || 0)}</td>
                    <td className="p-2 text-right text-red-600">{formatMXN(c.costos?.costoTotalAnual || 0)}</td>
                    <td className="p-2 text-right font-semibold">{formatMXN(c.margen?.margenBrutoAnual || 0)}</td>
                    <td className="p-2 text-right font-bold text-blue-600">{formatMXN(c.margen?.margenBonosAnual || 0)}</td>
                    <td className="p-2 text-center">
                      <Badge className={
                        c.margen?.semaforo === "azul" ? "bg-blue-100 text-blue-700" :
                        c.margen?.semaforo === "verde" ? "bg-green-100 text-green-700" :
                        c.margen?.semaforo === "amarillo" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }>{c.margen?.semaforo}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#22c55e]" />
            Break-even analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-400">Cubrir operación</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{be.ops || 0} empresas</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Transforma, 30 cols</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <p className="text-xs text-purple-700 dark:text-purple-400">Operación + comisiones (7 consultores)</p>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">{be.opsComisiones || 0} empresas</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Con tier 25% comisión</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Top estados por potencial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {zones.slice(0, 8).map((z: PotencialZone, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{z.estado}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{Number(z.total).toLocaleString()} emp.</span>
                    <span className="font-medium text-green-600">{formatMXN(Number(z.potencial || 0) * 12)}/año</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Top sectores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sectors.slice(0, 8).map((s: PotencialSector, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{s.sector}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{Number(s.count).toLocaleString()}</span>
                    <span className="font-medium text-green-600">{formatMXN(Number(s.potencial || 0) * 12)}/año</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {munis.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Municipios con más oportunidad (Alta prioridad)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {munis.slice(0, 10).map((m: PotencialMunicipio, i: number) => (
                <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-sm font-medium">{m.municipio}</p>
                  <p className="text-lg font-bold text-[#f28023]">{Number(m.alta_prioridad).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">alta prioridad</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

export default function AdminFinanciero() {
  const [tab, setTab] = useState<Tab>("simulador");
  const { user } = useAuth();
  const [, navigate] = useLocation();

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f4]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Acceso restringido a administradores</p>
            <Button className="mt-4" onClick={() => navigate("/admin")} data-testid="btn-go-admin">Ir al panel</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f4] dark:bg-gray-950">
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" data-testid="btn-back-admin">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <h1 className="font-['DM_Serif_Display'] text-lg text-[#1b5adf]">Modelo Financiero</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex gap-1 pb-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t.key
                  ? "bg-[#1b5adf]/10 text-[#1b5adf]"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              data-testid={`tab-${t.key}`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {tab === "simulador" && <SimuladorTab />}
        {tab === "escenarios" && <EscenariosTab />}
        {tab === "bonos" && <BonosTab />}
        {tab === "potencial" && <PotencialTab />}
      </main>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Cpu, CheckCircle2, Clock, AlertTriangle, Loader2, Play,
  Video, RefreshCw, Trash2, Save, Settings, Eye, Film,
  Monitor, Smartphone, Square, User, Circle, Maximize,
  Palette, Image, Volume2, ArrowRight, Mic,
} from "lucide-react";
import { Link } from "wouter";

type AvatarData = {
  avatar: {
    id: string;
    instructorId: string;
    heygenAvatarId: string | null;
    heygenVoiceId: string | null;
    avatarStatus: string;
    voiceStatus: string;
    avatarPreviewUrl: string | null;
    consentAccepted: boolean;
    consentAcceptedAt: string | null;
    consentVideoR2Url: string | null;
    trainingVideoR2Url: string | null;
    heygenCreationRequestId: string | null;
    processingStartedAt: string | null;
    processingError: string | null;
    avatarPreferences: AvatarPreferences | null;
    previewVideoUrl: string | null;
    previewVideoId: string | null;
    createdAt: string;
    updatedAt: string | null;
  } | null;
  hasAvatar: boolean;
  heygenConfigured: boolean;
};

type AvatarPreferences = {
  avatarStyle?: "normal" | "circle" | "closeUp";
  backgroundType?: "color" | "image";
  backgroundColor?: string;
  backgroundImageUrl?: string;
  voiceSpeed?: number;
  orientation?: "landscape" | "portrait" | "square";
  selectedVoiceId?: string;
  useClonedVoice?: boolean;
};

type HeyGenVoice = {
  voice_id: string;
  name: string;
  language: string;
  gender: string;
};

type VideoJob = {
  id: string;
  instructorId: string | null;
  courseId: string | null;
  moduleId: string | null;
  heygenVideoId: string | null;
  jobStatus: string;
  videoUrl: string | null;
  videoDurationSeconds: number | null;
  scriptText: string | null;
  creditsConsumed: number | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
};

const PRESET_COLORS = [
  { label: "Azul Ceduverse", value: "#1b5adf" },
  { label: "Naranja", value: "#f28023" },
  { label: "Violeta", value: "#7c3aed" },
  { label: "Verde", value: "#00b87a" },
  { label: "Blanco", value: "#ffffff" },
  { label: "Negro", value: "#000000" },
];

const PRESET_BACKGROUNDS = [
  { label: "Salón de clases", url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1920&h=1080&fit=crop" },
  { label: "Oficina moderna", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop" },
  { label: "Pizarrón", url: "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=1920&h=1080&fit=crop" },
  { label: "Laboratorio", url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1920&h=1080&fit=crop" },
];

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: typeof CheckCircle2 }> = {
  pending: { color: "bg-yellow-100 text-yellow-700", label: "Pendiente", icon: Clock },
  processing: { color: "bg-blue-100 text-blue-700", label: "Procesando", icon: Loader2 },
  ready: { color: "bg-green-100 text-green-700", label: "Listo", icon: CheckCircle2 },
  failed: { color: "bg-red-100 text-red-700", label: "Error", icon: AlertTriangle },
};

function StatusSection({ avatar, onGeneratePreview, isGenerating }: {
  avatar: AvatarData["avatar"];
  onGeneratePreview: () => void;
  isGenerating: boolean;
}) {
  if (!avatar || !avatar.heygenAvatarId) {
    return (
      <Card className="border-black/[0.06]" data-testid="card-gemelo-no-twin">
        <CardContent className="py-10 text-center">
          <Cpu size={48} className="mx-auto text-cedu-ink-muted/40 mb-4" />
          <h3 className="font-serif text-xl text-cedu-ink mb-2">No tienes un Gemelo Digital</h3>
          <p className="text-sm text-cedu-ink-muted mb-6 max-w-md mx-auto">
            Crea tu gemelo digital en el proceso de acreditación para poder generar videos automáticos de tus cursos.
          </p>
          <Link href="/instructor/acreditacion">
            <Button className="bg-[#1b5adf] hover:bg-[#1b5adf]/90" data-testid="button-go-acreditacion">
              Ir a Acreditación <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = STATUS_CONFIG[avatar.avatarStatus] || STATUS_CONFIG.pending;
  const StatusIcon = statusInfo.icon;
  const voiceStatusInfo = STATUS_CONFIG[avatar.voiceStatus] || STATUS_CONFIG.pending;

  return (
    <Card className="border-black/[0.06]" data-testid="card-gemelo-status">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <Cpu size={20} className="text-[#7c3aed]" />
          Estado del Gemelo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-cedu-ink-muted">Avatar</span>
              <Badge className={`${statusInfo.color} border-0`} data-testid="badge-avatar-status">
                <StatusIcon size={12} className={`mr-1 ${avatar.avatarStatus === "processing" ? "animate-spin" : ""}`} />
                {statusInfo.label}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-cedu-ink-muted">Voz</span>
              <Badge className={`${voiceStatusInfo.color} border-0`} data-testid="badge-voice-status">
                {voiceStatusInfo.label}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-cedu-ink-muted">Creado</span>
              <span className="text-sm text-cedu-ink" data-testid="text-gemelo-created">
                {new Date(avatar.createdAt).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" })}
              </span>
            </div>
          </div>

          {avatar.avatarStatus === "ready" && (
            <div className="flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#7c3aed]/5 to-[#1b5adf]/5 rounded-xl p-4">
              {avatar.avatarPreviewUrl ? (
                <img
                  src={avatar.avatarPreviewUrl}
                  alt="Preview del gemelo digital"
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#7c3aed]/30"
                  data-testid="img-avatar-preview"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-[#7c3aed] to-[#1b5adf] rounded-full flex items-center justify-center">
                  <Cpu size={28} className="text-white" />
                </div>
              )}
              <Button
                onClick={onGeneratePreview}
                disabled={isGenerating}
                className="bg-[#7c3aed] hover:bg-[#7c3aed]/90 text-white text-xs"
                data-testid="button-generate-preview"
              >
                {isGenerating ? (
                  <><Loader2 size={14} className="mr-1 animate-spin" /> Generando...</>
                ) : (
                  <><Video size={14} className="mr-1" /> Generar Video de Presentación</>
                )}
              </Button>
            </div>
          )}
        </div>

        {avatar.processingError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-700" data-testid="text-processing-error">{avatar.processingError}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CustomizationSection({ avatar, onSave, isSaving }: {
  avatar: AvatarData["avatar"];
  onSave: (prefs: AvatarPreferences) => void;
  isSaving: boolean;
}) {
  const prefs = avatar?.avatarPreferences || {};
  const [avatarStyle, setAvatarStyle] = useState<"normal" | "circle" | "closeUp">(prefs.avatarStyle || "normal");
  const [backgroundType, setBackgroundType] = useState<"color" | "image">(prefs.backgroundType || "color");
  const [backgroundColor, setBackgroundColor] = useState(prefs.backgroundColor || "#1b5adf");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(prefs.backgroundImageUrl || "");
  const [voiceSpeed, setVoiceSpeed] = useState(prefs.voiceSpeed || 1.0);
  const [orientation, setOrientation] = useState<"landscape" | "portrait" | "square">(prefs.orientation || "landscape");
  const [useClonedVoice, setUseClonedVoice] = useState(prefs.useClonedVoice !== false);
  const [selectedVoiceId, setSelectedVoiceId] = useState(prefs.selectedVoiceId || "");

  const { data: catalogVoices = [] } = useQuery<HeyGenVoice[]>({
    queryKey: ["/api/heygen/voices"],
    enabled: !!avatar && avatar.avatarStatus === "ready",
  });

  if (!avatar || avatar.avatarStatus !== "ready") return null;

  const handleSave = () => {
    onSave({
      avatarStyle,
      backgroundType,
      backgroundColor,
      backgroundImageUrl: backgroundType === "image" ? backgroundImageUrl : "",
      voiceSpeed,
      orientation,
      useClonedVoice,
      selectedVoiceId: useClonedVoice ? "" : selectedVoiceId,
    });
  };

  return (
    <Card className="border-black/[0.06]" data-testid="card-gemelo-customization">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <Palette size={20} className="text-[#f28023]" />
          Personalización del Gemelo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-semibold text-cedu-ink mb-3 block">Estilo de encuadre</Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "normal" as const, label: "Normal", desc: "Cuerpo completo", icon: User },
              { value: "circle" as const, label: "Círculo", desc: "Busto", icon: Circle },
              { value: "closeUp" as const, label: "Close-up", desc: "Rostro", icon: Maximize },
            ].map((style) => (
              <button
                key={style.value}
                onClick={() => setAvatarStyle(style.value)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  avatarStyle === style.value
                    ? "border-[#1b5adf] bg-[#1b5adf]/5"
                    : "border-black/[0.06] hover:border-black/[0.12]"
                }`}
                data-testid={`button-style-${style.value}`}
              >
                <style.icon size={20} className={`mx-auto mb-1 ${avatarStyle === style.value ? "text-[#1b5adf]" : "text-cedu-ink-muted"}`} />
                <p className="text-xs font-semibold text-cedu-ink">{style.label}</p>
                <p className="text-[10px] text-cedu-ink-muted">{style.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-cedu-ink mb-3 block">Fondo</Label>
          <div className="flex gap-2 mb-3">
            <Button
              variant={backgroundType === "color" ? "default" : "outline"}
              size="sm"
              onClick={() => setBackgroundType("color")}
              className={backgroundType === "color" ? "bg-[#1b5adf]" : ""}
              data-testid="button-bg-color"
            >
              <Palette size={14} className="mr-1" /> Color
            </Button>
            <Button
              variant={backgroundType === "image" ? "default" : "outline"}
              size="sm"
              onClick={() => setBackgroundType("image")}
              className={backgroundType === "image" ? "bg-[#1b5adf]" : ""}
              data-testid="button-bg-image"
            >
              <Image size={14} className="mr-1" /> Imagen
            </Button>
          </div>

          {backgroundType === "color" && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setBackgroundColor(c.value)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      backgroundColor === c.value ? "border-[#1b5adf] scale-110" : "border-black/[0.1]"
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                    data-testid={`button-color-${c.value.replace("#", "")}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-cedu-ink-muted whitespace-nowrap">Personalizado:</Label>
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-8 p-0.5 cursor-pointer"
                  data-testid="input-custom-color"
                />
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-24 text-xs"
                  placeholder="#000000"
                  data-testid="input-color-hex"
                />
              </div>
            </div>
          )}

          {backgroundType === "image" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {PRESET_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.label}
                    onClick={() => setBackgroundImageUrl(bg.url)}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      backgroundImageUrl === bg.url ? "border-[#1b5adf]" : "border-black/[0.06]"
                    }`}
                    data-testid={`button-bg-preset-${bg.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <img src={bg.url} alt={bg.label} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] py-0.5 text-center">{bg.label}</span>
                  </button>
                ))}
              </div>
              <div>
                <Label className="text-xs text-cedu-ink-muted">URL de imagen personalizada</Label>
                <Input
                  value={backgroundImageUrl}
                  onChange={(e) => setBackgroundImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="text-xs"
                  data-testid="input-bg-image-url"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <Label className="text-sm font-semibold text-cedu-ink mb-3 block">Voz</Label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setUseClonedVoice(true)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  useClonedVoice
                    ? "border-[#1b5adf] bg-[#1b5adf]/5"
                    : "border-black/[0.06] hover:border-black/[0.12]"
                }`}
                data-testid="button-voice-cloned"
              >
                <Mic size={20} className={`mx-auto mb-1 ${useClonedVoice ? "text-[#1b5adf]" : "text-cedu-ink-muted"}`} />
                <p className="text-xs font-semibold text-cedu-ink">Mi voz clonada</p>
                <p className="text-[10px] text-cedu-ink-muted">Tu voz original</p>
              </button>
              <button
                onClick={() => setUseClonedVoice(false)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  !useClonedVoice
                    ? "border-[#1b5adf] bg-[#1b5adf]/5"
                    : "border-black/[0.06] hover:border-black/[0.12]"
                }`}
                data-testid="button-voice-catalog"
              >
                <Volume2 size={20} className={`mx-auto mb-1 ${!useClonedVoice ? "text-[#1b5adf]" : "text-cedu-ink-muted"}`} />
                <p className="text-xs font-semibold text-cedu-ink">Voz del catálogo</p>
                <p className="text-[10px] text-cedu-ink-muted">Voces HeyGen en español</p>
              </button>
            </div>

            {!useClonedVoice && (
              <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
                <SelectTrigger className="text-sm" data-testid="select-catalog-voice">
                  <SelectValue placeholder="Seleccionar voz del catálogo" />
                </SelectTrigger>
                <SelectContent>
                  {catalogVoices.length > 0 ? (
                    catalogVoices.map((v) => (
                      <SelectItem key={v.voice_id} value={v.voice_id}>
                        {v.name} ({v.gender})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="_none" disabled>
                      No hay voces en español disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-cedu-ink mb-3 block">
            <Volume2 size={14} className="inline mr-1" />
            Velocidad de habla: {voiceSpeed.toFixed(1)}x
          </Label>
          <Slider
            value={[voiceSpeed]}
            onValueChange={(v) => setVoiceSpeed(v[0])}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
            data-testid="slider-voice-speed"
          />
          <div className="flex justify-between text-[10px] text-cedu-ink-muted mt-1">
            <span>0.5x (Lento)</span>
            <span>1.0x (Normal)</span>
            <span>2.0x (Rápido)</span>
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-cedu-ink mb-3 block">Orientación del video</Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "landscape" as const, label: "Horizontal", desc: "16:9 · Cursos", icon: Monitor },
              { value: "portrait" as const, label: "Vertical", desc: "9:16 · Redes", icon: Smartphone },
              { value: "square" as const, label: "Cuadrado", desc: "1:1", icon: Square },
            ].map((o) => (
              <button
                key={o.value}
                onClick={() => setOrientation(o.value)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  orientation === o.value
                    ? "border-[#1b5adf] bg-[#1b5adf]/5"
                    : "border-black/[0.06] hover:border-black/[0.12]"
                }`}
                data-testid={`button-orientation-${o.value}`}
              >
                <o.icon size={20} className={`mx-auto mb-1 ${orientation === o.value ? "text-[#1b5adf]" : "text-cedu-ink-muted"}`} />
                <p className="text-xs font-semibold text-cedu-ink">{o.label}</p>
                <p className="text-[10px] text-cedu-ink-muted">{o.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-[#1b5adf] hover:bg-[#1b5adf]/90"
          data-testid="button-save-preferences"
        >
          {isSaving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Save size={14} className="mr-1" />}
          Guardar preferencias
        </Button>
      </CardContent>
    </Card>
  );
}

function PreviewVideoSection({ avatar }: { avatar: AvatarData["avatar"] }) {
  const isReady = !!avatar && avatar.avatarStatus === "ready";
  const previewVideoUrl = avatar?.previewVideoUrl;
  const previewVideoId = avatar?.previewVideoId;

  const { data: previewJob } = useQuery<VideoJob[]>({
    queryKey: ["/api/heygen/jobs"],
    enabled: isReady && !!previewVideoId,
    select: (jobs) => jobs.filter((j) => j.heygenVideoId === previewVideoId),
    refetchInterval: isReady && previewVideoId && !previewVideoUrl ? 10000 : false,
  });

  if (!isReady) return null;

  const latestPreviewJob = previewJob?.[0];
  const isProcessing = latestPreviewJob?.jobStatus === "processing";
  const videoUrl = previewVideoUrl || latestPreviewJob?.videoUrl;

  return (
    <Card className="border-black/[0.06]" data-testid="card-gemelo-preview">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <Film size={20} className="text-[#00b87a]" />
          Video de Presentación
        </CardTitle>
      </CardHeader>
      <CardContent>
        {videoUrl ? (
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden bg-black aspect-video">
              <video
                src={videoUrl}
                controls
                className="w-full h-full"
                data-testid="video-preview-player"
              />
            </div>
            <p className="text-xs text-cedu-ink-muted text-center">
              Este video muestra cómo se ve y escucha tu gemelo digital con la configuración actual.
            </p>
          </div>
        ) : isProcessing ? (
          <div className="text-center py-8">
            <Loader2 size={32} className="mx-auto text-[#7c3aed] animate-spin mb-3" />
            <p className="text-sm text-cedu-ink font-semibold">Generando video de presentación...</p>
            <p className="text-xs text-cedu-ink-muted mt-1">Esto puede tomar unos minutos. La página se actualizará automáticamente.</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Video size={32} className="mx-auto text-cedu-ink-muted/40 mb-3" />
            <p className="text-sm text-cedu-ink-muted">
              Aún no has generado un video de presentación. Usa el botón en la sección de estado para crear uno.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TechnicalConfigSection({ avatar, onRegenerate, onDelete, isRegenerating, isDeleting }: {
  avatar: AvatarData["avatar"];
  onRegenerate: () => void;
  onDelete: () => void;
  isRegenerating: boolean;
  isDeleting: boolean;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!avatar) return null;

  return (
    <Card className="border-black/[0.06]" data-testid="card-gemelo-technical">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <Settings size={20} className="text-cedu-ink-muted" />
          Configuración Técnica
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center justify-between py-2 border-b border-black/[0.04]">
            <span className="text-sm text-cedu-ink-muted">Avatar ID</span>
            <code className="text-xs bg-black/[0.03] px-2 py-1 rounded font-mono" data-testid="text-avatar-id">
              {avatar.heygenAvatarId || "—"}
            </code>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-black/[0.04]">
            <span className="text-sm text-cedu-ink-muted">Voice ID</span>
            <code className="text-xs bg-black/[0.03] px-2 py-1 rounded font-mono" data-testid="text-voice-id">
              {avatar.heygenVoiceId || "—"}
            </code>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-black/[0.04]">
            <span className="text-sm text-cedu-ink-muted">Consentimiento</span>
            <span className="text-sm text-cedu-ink" data-testid="text-consent-status">
              {avatar.consentAccepted ? (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 size={14} /> Aceptado
                  {avatar.consentAcceptedAt && (
                    <span className="text-cedu-ink-muted ml-1">
                      ({new Date(avatar.consentAcceptedAt).toLocaleDateString("es-MX")})
                    </span>
                  )}
                </span>
              ) : "Pendiente"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-black/[0.04]">
            <span className="text-sm text-cedu-ink-muted">Video de entrenamiento</span>
            <span className="text-sm" data-testid="text-training-video">
              {avatar.trainingVideoR2Url ? (
                <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={14} /> Subido</span>
              ) : <span className="text-cedu-ink-muted">No subido</span>}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isRegenerating}
            data-testid="button-regenerate-twin"
          >
            {isRegenerating ? <Loader2 size={14} className="mr-1 animate-spin" /> : <RefreshCw size={14} className="mr-1" />}
            Regenerar gemelo
          </Button>

          <Link href="/instructor/acreditacion">
            <Button variant="outline" size="sm" data-testid="button-reupload-training">
              Re-subir video de entrenamiento
            </Button>
          </Link>

          <Link href="/instructor/acreditacion">
            <Button variant="outline" size="sm" data-testid="button-reupload-consent">
              Re-subir consentimiento
            </Button>
          </Link>

          {!showDeleteConfirm ? (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700 ml-auto"
              onClick={() => setShowDeleteConfirm(true)}
              data-testid="button-delete-twin-start"
            >
              <Trash2 size={14} className="mr-1" /> Eliminar gemelo
            </Button>
          ) : (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-red-600 font-semibold">¿Estás seguro?</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                data-testid="button-delete-twin-cancel"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => { onDelete(); setShowDeleteConfirm(false); }}
                disabled={isDeleting}
                data-testid="button-delete-twin-confirm"
              >
                {isDeleting ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Trash2 size={14} className="mr-1" />}
                Confirmar eliminación
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function VideoHistorySection({ jobs, isLoading }: { jobs: VideoJob[]; isLoading: boolean }) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = statusFilter === "all" ? jobs : jobs.filter((j) => j.jobStatus === statusFilter);

  const totalCompleted = jobs.filter((j) => j.jobStatus === "completed").length;
  const totalDuration = jobs.reduce((sum, j) => sum + (j.videoDurationSeconds || 0), 0);
  const totalCredits = jobs.reduce((sum, j) => sum + (j.creditsConsumed || 0), 0);

  const statusLabels: Record<string, string> = {
    pending: "Pendiente", processing: "Procesando", completed: "Completado", failed: "Error",
  };
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <Card className="border-black/[0.06]" data-testid="card-gemelo-history">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Film size={20} className="text-[#1b5adf]" />
            Historial de Videos
          </CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 text-xs" data-testid="select-status-filter">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="processing">Procesando</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="failed">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#1b5adf]/5 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-[#1b5adf]" data-testid="text-total-videos">{totalCompleted}</p>
            <p className="text-[10px] text-cedu-ink-muted">Videos generados</p>
          </div>
          <div className="bg-[#00b87a]/5 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-[#00b87a]" data-testid="text-total-duration">
              {Math.round(totalDuration / 60)}min
            </p>
            <p className="text-[10px] text-cedu-ink-muted">Duración total</p>
          </div>
          <div className="bg-[#f28023]/5 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-[#f28023]" data-testid="text-total-credits">
              {totalCredits.toFixed(1)}
            </p>
            <p className="text-[10px] text-cedu-ink-muted">Créditos consumidos</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-cedu-ink-muted" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-6">
            <Film size={32} className="mx-auto text-cedu-ink-muted/30 mb-2" />
            <p className="text-sm text-cedu-ink-muted">No hay videos {statusFilter !== "all" ? `con estado "${statusLabels[statusFilter]}"` : "generados aún"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06]">
                  <th className="text-left py-2 px-2 text-cedu-ink-muted font-medium text-xs">Curso/Módulo</th>
                  <th className="text-left py-2 px-2 text-cedu-ink-muted font-medium text-xs">Estado</th>
                  <th className="text-left py-2 px-2 text-cedu-ink-muted font-medium text-xs">Duración</th>
                  <th className="text-left py-2 px-2 text-cedu-ink-muted font-medium text-xs">Fecha</th>
                  <th className="text-left py-2 px-2 text-cedu-ink-muted font-medium text-xs">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => (
                  <tr key={job.id} className="border-b border-black/[0.03] hover:bg-black/[0.01]" data-testid={`row-video-${job.id}`}>
                    <td className="py-2 px-2">
                      <span className="text-xs text-cedu-ink">
                        {job.courseId && job.moduleId
                          ? `Curso: ${job.courseId.substring(0, 8)}... / Módulo: ${job.moduleId.substring(0, 8)}...`
                          : "Video de presentación"}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <Badge className={`${statusColors[job.jobStatus] || "bg-gray-100"} border-0 text-[10px]`}>
                        {statusLabels[job.jobStatus] || job.jobStatus}
                      </Badge>
                    </td>
                    <td className="py-2 px-2 text-xs text-cedu-ink-muted">
                      {job.videoDurationSeconds ? `${Math.round(job.videoDurationSeconds)}s` : "—"}
                    </td>
                    <td className="py-2 px-2 text-xs text-cedu-ink-muted">
                      {new Date(job.createdAt).toLocaleDateString("es-MX", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-2 px-2">
                      {job.videoUrl ? (
                        <a href={job.videoUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="text-xs h-7" data-testid={`button-view-video-${job.id}`}>
                            <Play size={12} className="mr-1" /> Ver
                          </Button>
                        </a>
                      ) : job.errorMessage ? (
                        <span className="text-[10px] text-red-500" title={job.errorMessage}>Error</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function GemeloDigitalTab() {
  const { toast } = useToast();

  const { data: avatarData, isLoading: avatarLoading } = useQuery<AvatarData>({
    queryKey: ["/api/heygen/avatar/me"],
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<VideoJob[]>({
    queryKey: ["/api/heygen/jobs"],
  });

  const savePrefsMutation = useMutation({
    mutationFn: async (prefs: AvatarPreferences) => {
      const res = await apiRequest("PATCH", "/api/heygen/avatar/preferences", prefs);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Preferencias guardadas" });
      queryClient.invalidateQueries({ queryKey: ["/api/heygen/avatar/me"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const generatePreviewMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/heygen/avatar/generate-preview");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Video en generación", description: data.message || "El video se está generando" });
      queryClient.invalidateQueries({ queryKey: ["/api/heygen/avatar/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/heygen/jobs"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/heygen/avatar/regenerate");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Gemelo reiniciado", description: "Puedes grabar tu Digital Twin de nuevo" });
      queryClient.invalidateQueries({ queryKey: ["/api/heygen/avatar/me"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/heygen/avatar/regenerate");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Gemelo eliminado", description: "Tu Digital Twin ha sido reiniciado. Puedes crearlo de nuevo." });
      queryClient.invalidateQueries({ queryKey: ["/api/heygen/avatar/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/heygen/jobs"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (avatarLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-[#7c3aed]" size={32} />
      </div>
    );
  }

  const avatar = avatarData?.avatar || null;

  return (
    <div className="space-y-6" data-testid="instructor-gemelo-tab">
      <div>
        <h2 className="font-serif text-2xl text-cedu-ink" data-testid="text-gemelo-title">Gemelo Digital</h2>
        <p className="text-sm text-cedu-ink-muted mt-1">Gestiona, personaliza y previsualiza tu gemelo digital con IA</p>
      </div>

      <StatusSection
        avatar={avatar}
        onGeneratePreview={() => generatePreviewMutation.mutate()}
        isGenerating={generatePreviewMutation.isPending}
      />

      <CustomizationSection
        avatar={avatar}
        onSave={(prefs) => savePrefsMutation.mutate(prefs)}
        isSaving={savePrefsMutation.isPending}
      />

      <PreviewVideoSection avatar={avatar} />

      <TechnicalConfigSection
        avatar={avatar}
        onRegenerate={() => regenerateMutation.mutate()}
        onDelete={() => deleteMutation.mutate()}
        isRegenerating={regenerateMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />

      <VideoHistorySection jobs={jobs} isLoading={jobsLoading} />
    </div>
  );
}

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  Heart,
  Award,
  GraduationCap,
  Flame,
  Wallet,
  Calendar,
  Lock,
  Gem,
  FileCheck,
  BadgeCheck,
  Download,
  Rocket,
  Building,
  Handshake,
  Users,
  Star,
  Briefcase,
  Shield,
  Building2,
  Crown,
} from "lucide-react";

type AchievementInfo = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  value: number;
  category: string | null;
  icon: string | null;
};

type UserAchievement = {
  id: string;
  userId: string;
  achievementId: string;
  isActive: boolean;
  status: string;
  certType: string | null;
  contractAddress: string | null;
  tokenId: string | null;
  pdfUrl: string | null;
  createdAt: string;
};

const CATEGORY_METAL: Record<string, { gradient: string; ring: string; glow: string; bg: string; accent: string }> = {
  "Seguridad Industrial": {
    gradient: "from-slate-300 via-blue-200 to-slate-400",
    ring: "ring-blue-300/50",
    glow: "rgba(59,130,246,0.4)",
    bg: "bg-gradient-to-br from-blue-600 to-blue-800",
    accent: "text-blue-400",
  },
  "Desarrollo Humano": {
    gradient: "from-rose-200 via-pink-100 to-rose-300",
    ring: "ring-rose-300/50",
    glow: "rgba(244,63,94,0.4)",
    bg: "bg-gradient-to-br from-rose-500 to-rose-700",
    accent: "text-rose-400",
  },
  "Cumplimiento Normativo": {
    gradient: "from-violet-200 via-purple-100 to-violet-300",
    ring: "ring-violet-300/50",
    glow: "rgba(139,92,246,0.4)",
    bg: "bg-gradient-to-br from-violet-600 to-violet-800",
    accent: "text-violet-400",
  },
  "STPS": {
    gradient: "from-amber-200 via-yellow-100 to-amber-300",
    ring: "ring-amber-300/50",
    glow: "rgba(245,158,11,0.4)",
    bg: "bg-gradient-to-br from-amber-500 to-amber-700",
    accent: "text-amber-400",
  },
  "Academy": {
    gradient: "from-orange-200 via-amber-100 to-orange-300",
    ring: "ring-orange-300/50",
    glow: "rgba(249,115,22,0.4)",
    bg: "bg-gradient-to-br from-orange-500 to-orange-700",
    accent: "text-orange-400",
  },
  "Onboarding": {
    gradient: "from-emerald-200 via-teal-100 to-emerald-300",
    ring: "ring-emerald-300/50",
    glow: "rgba(16,185,129,0.4)",
    bg: "bg-gradient-to-br from-emerald-500 to-teal-700",
    accent: "text-emerald-400",
  },
};

const DEFAULT_METAL = CATEGORY_METAL["STPS"];

const CERT_TYPE_METAL: Record<string, { gradient: string; ring: string; glow: string; bg: string; accent: string; icon: any; label: string }> = {
  dc3: {
    gradient: "from-amber-300 via-orange-200 to-amber-400",
    ring: "ring-amber-400/60",
    glow: "rgba(245,158,11,0.5)",
    bg: "bg-gradient-to-br from-amber-500 to-orange-600",
    accent: "text-amber-500",
    icon: FileCheck,
    label: "Constancia DC-3 STPS",
  },
  sep: {
    gradient: "from-blue-300 via-indigo-200 to-blue-400",
    ring: "ring-blue-400/60",
    glow: "rgba(59,130,246,0.5)",
    bg: "bg-gradient-to-br from-blue-600 to-indigo-700",
    accent: "text-blue-500",
    icon: BadgeCheck,
    label: "Certificado SEP",
  },
};

function getIcon(iconName: string | null, certType?: string | null) {
  if (certType === "dc3") return FileCheck;
  if (certType === "sep") return BadgeCheck;
  switch (iconName) {
    case "shield-check": return ShieldCheck;
    case "heart": return Heart;
    case "graduation-cap": return GraduationCap;
    case "flame": return Flame;
    case "rocket": return Rocket;
    case "building": return Building;
    case "handshake": return Handshake;
    case "users": return Users;
    case "star": return Star;
    case "briefcase": return Briefcase;
    case "shield": return Shield;
    case "building-2": return Building2;
    case "crown": return Crown;
    default: return Award;
  }
}

function getShortName(name: string) {
  return name.replace(/^Certificado:\s*/i, "").replace(/^Diploma:\s*/i, "").slice(0, 50);
}

function getCertTypeLabel(certType: string | null) {
  if (certType === "dc3") return "DC-3 STPS";
  if (certType === "sep") return "Cert. SEP";
  return "Diploma";
}

export function CollectibleBadge({
  achievement,
  userAchievement,
}: {
  achievement: AchievementInfo;
  userAchievement: UserAchievement;
}) {
  const [showDetail, setShowDetail] = useState(false);
  const certType = userAchievement.certType || "diploma";
  const Icon = getIcon(achievement.icon, certType);
  const certMetal = certType !== "diploma" ? CERT_TYPE_METAL[certType] : null;
  const metal = certMetal || CATEGORY_METAL[achievement.category || "STPS"] || DEFAULT_METAL;
  const earnedDate = userAchievement.createdAt
    ? new Date(userAchievement.createdAt).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })
    : "Fecha no disponible";
  const isVerified = !!userAchievement.contractAddress;

  return (
    <>
      <div
        className="badge-3d cursor-pointer group"
        onClick={() => setShowDetail(true)}
        data-testid={`badge-${achievement.slug}`}
      >
        <div className="badge-3d-inner flex flex-col items-center p-4">
          <div
            className={`relative w-24 h-24 rounded-full badge-shine-sweep badge-earned-glow ring-4 ${metal.ring}`}
            style={{ "--badge-glow-color": metal.glow } as React.CSSProperties}
          >
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${metal.gradient}`} />
            <div className={`absolute inset-[3px] rounded-full ${metal.bg} flex items-center justify-center shadow-inner`}>
              <div className="absolute inset-[3px] rounded-full border border-white/20" />
              <Icon size={36} className="text-white drop-shadow-lg relative z-10" />
            </div>

            {isVerified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white shadow-lg z-20" data-testid={`badge-verified-${achievement.slug}`}>
                <Gem size={14} className="text-white" />
              </div>
            )}
          </div>

          <div className="mt-3 text-center max-w-[120px]">
            <p className="text-xs font-bold text-cedu-ink leading-tight line-clamp-2" data-testid={`text-badge-name-${achievement.slug}`}>
              {getShortName(achievement.name)}
            </p>
            <div className="mt-1.5 flex flex-col items-center gap-1">
              {certType !== "diploma" && (
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${certType === "dc3" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                  {getCertTypeLabel(certType)}
                </span>
              )}
              <span className="inline-flex items-center gap-1 bg-black/5 rounded-full px-2 py-0.5 text-[10px] font-bold text-cedu-ink-soft">
                {achievement.value} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-md overflow-hidden">
          <DialogHeader>
            <div className="flex justify-center py-6">
              <div
                className={`relative w-32 h-32 rounded-full badge-modal-spin badge-earned-glow ring-4 ${metal.ring}`}
                style={{ "--badge-glow-color": metal.glow } as React.CSSProperties}
              >
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${metal.gradient}`} />
                <div className={`absolute inset-[4px] rounded-full ${metal.bg} flex items-center justify-center shadow-inner`}>
                  <div className="absolute inset-[4px] rounded-full border border-white/20" />
                  <Icon size={48} className="text-white drop-shadow-lg relative z-10" />
                </div>
                {isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white shadow-lg z-20">
                    <Gem size={16} className="text-white" />
                  </div>
                )}
              </div>
            </div>
            <DialogTitle className="font-serif text-xl text-cedu-ink text-center" data-testid="text-badge-detail-name">
              {achievement.name}
            </DialogTitle>
            {certType !== "diploma" && (
              <p className={`text-center text-xs font-bold mt-1 ${certType === "dc3" ? "text-amber-600" : "text-blue-600"}`}>
                {getCertTypeLabel(certType)}
              </p>
            )}
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-cedu-ink-soft text-center">{achievement.description || achievement.shortDescription}</p>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-black/[0.03] rounded-xl p-3 text-center">
                <p className="text-[10px] text-cedu-ink-muted uppercase font-bold mb-1">Tipo</p>
                <p className="text-xs text-cedu-ink font-semibold">{getCertTypeLabel(certType)}</p>
              </div>
              <div className="bg-black/[0.03] rounded-xl p-3 text-center">
                <p className="text-[10px] text-cedu-ink-muted uppercase font-bold mb-1">Puntos</p>
                <p className="text-xs text-cedu-ink font-semibold">{achievement.value}</p>
              </div>
              <div className="bg-black/[0.03] rounded-xl p-3 text-center">
                <p className="text-[10px] text-cedu-ink-muted uppercase font-bold mb-1">Estado</p>
                <p className={`text-xs font-semibold ${isVerified ? "text-emerald-600" : metal.accent}`}>
                  {isVerified ? "Verificado" : "Obtenido"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-cedu-ink-muted">
              <Calendar size={14} />
              <span>Obtenido: {earnedDate}</span>
            </div>

            {userAchievement.pdfUrl && (
              <a
                href={userAchievement.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-blue-50 rounded-xl p-3 border border-blue-200/50 hover:bg-blue-100 transition-colors cursor-pointer"
                data-testid="link-download-pdf"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Download size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-700">Descargar Certificado PDF</p>
                  <p className="text-[10px] text-blue-600/70 mt-0.5">
                    Documento oficial emitido
                  </p>
                </div>
              </a>
            )}

            {isVerified && (
              <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-3 border border-emerald-200/50">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Wallet size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-700">Verificado en Blockchain</p>
                  <p className="text-[10px] text-emerald-600/70 font-mono mt-0.5">
                    {userAchievement.contractAddress?.slice(0, 14)}...{userAchievement.contractAddress?.slice(-8)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function LockedBadge({ achievement }: { achievement: AchievementInfo }) {
  const Icon = getIcon(achievement.icon);

  return (
    <div className="flex flex-col items-center p-4 opacity-50" data-testid={`badge-locked-${achievement.slug}`}>
      <div className="relative w-24 h-24 rounded-full">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-200 to-gray-300" />
        <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-inner">
          <div className="absolute inset-[3px] rounded-full border border-white/10" />
          <Icon size={36} className="text-gray-300/50 relative z-10" />
        </div>
        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/20 z-20">
          <div className="w-10 h-10 bg-gray-600/80 rounded-full flex items-center justify-center">
            <Lock size={18} className="text-gray-300" />
          </div>
        </div>
      </div>
      <div className="mt-3 text-center max-w-[120px]">
        <p className="text-xs font-medium text-cedu-ink-muted leading-tight line-clamp-2">
          {getShortName(achievement.name)}
        </p>
        <div className="mt-1.5 inline-flex items-center gap-1 bg-black/5 rounded-full px-2 py-0.5">
          <Lock size={8} className="text-cedu-ink-muted" />
          <span className="text-[10px] text-cedu-ink-muted">{achievement.value} pts</span>
        </div>
      </div>
    </div>
  );
}

export function EmptyBadgesState() {
  const previewBadges = [
    { icon: ShieldCheck, color: "from-slate-300 via-blue-200 to-slate-400", inner: "from-blue-600 to-blue-800" },
    { icon: Award, color: "from-amber-200 via-yellow-100 to-amber-300", inner: "from-amber-500 to-amber-700" },
    { icon: Heart, color: "from-rose-200 via-pink-100 to-rose-300", inner: "from-rose-500 to-rose-700" },
  ];

  return (
    <div className="py-12 text-center" data-testid="card-no-badges">
      <div className="flex justify-center gap-4 mb-6">
        {previewBadges.map((b, i) => (
          <div key={i} className="relative w-20 h-20 rounded-full opacity-30">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${b.color}`} />
            <div className={`absolute inset-[3px] rounded-full bg-gradient-to-br ${b.inner} flex items-center justify-center shadow-inner`}>
              <b.icon size={28} className="text-white/50" />
            </div>
            <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/20">
              <Lock size={14} className="text-gray-300" />
            </div>
          </div>
        ))}
      </div>
      <h3 className="font-serif text-lg text-cedu-ink mb-2">Aún no tienes logros coleccionables</h3>
      <p className="text-sm text-cedu-ink-muted max-w-md mx-auto">
        Completa cursos y aprueba evaluaciones para obtener logros 3D
        verificables en blockchain.
      </p>
    </div>
  );
}

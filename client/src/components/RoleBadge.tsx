import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Handshake,
  Shield,
  Crown,
  Building2,
  Users,
  BookOpen,
  Star,
} from "lucide-react";

export type UnifiedRole =
  | "socio_estudiante"
  | "socio_instructor"
  | "socio_comercial"
  | "director"
  | "empresa"
  | "empresa_rh"
  | "admin"
  | "superadmin"
  | "user"
  | "partner"
  | "instructor"
  | "moderator";

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Star }> = {
  socio_estudiante:  { label: "Socio Estudiante",  color: "text-[#00b87a]", bg: "bg-[#00b87a]/10", icon: BookOpen },
  socio_instructor:  { label: "Socio Instructor",  color: "text-[#7c3aed]", bg: "bg-[#7c3aed]/10", icon: GraduationCap },
  socio_comercial:   { label: "Socio Comercial",   color: "text-[#f28023]", bg: "bg-[#f28023]/10", icon: Handshake },
  director:          { label: "Director",           color: "text-[#1b5adf]", bg: "bg-[#1b5adf]/10", icon: Crown },
  empresa:           { label: "Empresa",            color: "text-[#0ea5e9]", bg: "bg-[#0ea5e9]/10", icon: Building2 },
  empresa_rh:        { label: "Empresa RH",         color: "text-[#0ea5e9]", bg: "bg-[#0ea5e9]/10", icon: Users },
  admin:             { label: "Administrador",      color: "text-[#ef4444]", bg: "bg-[#ef4444]/10", icon: Shield },
  superadmin:        { label: "Superadmin",         color: "text-[#ef4444]", bg: "bg-[#ef4444]/10", icon: Crown },
  user:              { label: "Socio Estudiante",   color: "text-[#00b87a]", bg: "bg-[#00b87a]/10", icon: BookOpen },
  partner:           { label: "Socio Comercial",    color: "text-[#f28023]", bg: "bg-[#f28023]/10", icon: Handshake },
  instructor:        { label: "Socio Instructor",   color: "text-[#7c3aed]", bg: "bg-[#7c3aed]/10", icon: GraduationCap },
  moderator:         { label: "Moderador",          color: "text-[#6b7280]", bg: "bg-[#6b7280]/10", icon: Shield },
};

export function getRoleConfig(role: string) {
  return ROLE_CONFIG[role] || ROLE_CONFIG.socio_estudiante;
}

export function getRoleLabel(role: string): string {
  return getRoleConfig(role).label;
}

export function isPartnerRole(role: string): boolean {
  return role === "socio_comercial" || role === "partner" || role === "director";
}

export function isAdminRole(role: string): boolean {
  return role === "admin" || role === "superadmin";
}

export function isInstructorRole(role: string): boolean {
  return role === "socio_instructor" || role === "instructor";
}

export function isEmpresaRole(role: string): boolean {
  return role === "empresa" || role === "empresa_rh";
}

const SIZE_STYLES = {
  sm: "text-[10px] px-2 py-0.5 gap-0.5",
  md: "text-xs px-2.5 py-0.5 gap-1",
  lg: "text-sm px-3 py-1 gap-1.5",
};

const ICON_SIZES = { sm: 10, md: 12, lg: 14 };

export function RoleBadge({ role, className = "", size = "md" }: { role: string; className?: string; size?: "sm" | "md" | "lg" }) {
  const config = getRoleConfig(role);
  const Icon = config.icon;

  return (
    <Badge
      className={`${config.bg} ${config.color} border-0 font-semibold ${SIZE_STYLES[size]} ${className}`}
      data-testid={`badge-role-${role}`}
    >
      <Icon size={ICON_SIZES[size]} />
      {config.label}
    </Badge>
  );
}

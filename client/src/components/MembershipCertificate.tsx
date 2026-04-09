import { Award, Shield, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MembershipCertificateProps {
  membershipNumber: string;
  fullName: string;
  status: string;
  membershipType: string;
  acceptedAt: string;
  certificateIssuedAt?: string | null;
  compact?: boolean;
}

const typeLabels: Record<string, string> = {
  consumo: "Socio de Consumo",
  produccion: "Socio de Producción",
  instructor: "Instructor Cooperativista",
};

export default function MembershipCertificate({
  membershipNumber,
  fullName,
  status,
  membershipType,
  acceptedAt,
  certificateIssuedAt,
  compact = false,
}: MembershipCertificateProps) {
  const formattedDate = acceptedAt
    ? new Date(acceptedAt).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-cedu-blue/5 via-cedu-violet/5 to-cedu-green/5 rounded-2xl border border-cedu-blue/10 p-5" data-testid="card-membership-compact">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-cedu-blue/10 flex items-center justify-center">
            <Award className="text-cedu-blue" size={22} />
          </div>
          <div>
            <div className="font-serif text-lg text-cedu-ink leading-tight">Socio Cooperativista</div>
            <div className="text-xs text-cedu-ink-muted">{typeLabels[membershipType] || membershipType}</div>
          </div>
          {status === "activo" && (
            <div className="ml-auto flex items-center gap-1 text-cedu-green text-xs font-semibold bg-cedu-green/10 px-2.5 py-1 rounded-full">
              <CheckCircle2 size={12} />
              Activo
            </div>
          )}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="font-mono text-2xl font-bold text-cedu-blue tracking-wider" data-testid="text-membership-number">{membershipNumber}</div>
            <div className="text-xs text-cedu-ink-muted mt-0.5">Miembro desde {formattedDate}</div>
          </div>
          <a href={`/verify/socio/${membershipNumber}`} target="_blank" rel="noopener noreferrer" className="text-xs text-cedu-blue hover:underline flex items-center gap-1" data-testid="link-verify">
            Verificar <ExternalLink size={10} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-cedu-blue/20 bg-white shadow-xl" data-testid="card-membership-certificate">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cedu-blue/5 via-transparent to-cedu-violet/5 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cedu-blue via-cedu-violet to-cedu-green" />

      <div className="relative p-8 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-cedu-blue rounded-[12px] flex items-center justify-center text-white font-serif text-2xl">C</div>
            <div className="font-serif text-2xl text-cedu-ink tracking-tight">Cedu<em className="text-cedu-blue not-italic italic">verse</em></div>
          </div>
          <div className="flex items-center gap-1.5 text-cedu-green">
            <Shield size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Verificado</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-cedu-blue to-cedu-violet flex items-center justify-center mb-4 shadow-lg">
            <Award className="text-white" size={40} />
          </div>
          <h2 className="font-serif text-3xl text-cedu-ink mb-1">Certificado de Membresía</h2>
          <p className="text-sm text-cedu-ink-muted">Adhesión Cooperativa</p>
        </div>

        <div className="text-center mb-8">
          <p className="text-sm text-cedu-ink-muted mb-1">Se certifica que</p>
          <h3 className="font-serif text-2xl text-cedu-ink" data-testid="text-cert-name">{fullName}</h3>
          <p className="text-sm text-cedu-ink-muted mt-2">
            es socio cooperativista de <strong className="text-cedu-ink">Ceduverse S. C de C de Rl de CV</strong>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-cedu-cream/60 rounded-xl p-4 text-center">
            <div className="text-xs text-cedu-ink-muted mb-1">Número de socio</div>
            <div className="font-mono text-xl font-bold text-cedu-blue" data-testid="text-cert-number">{membershipNumber}</div>
          </div>
          <div className="bg-cedu-cream/60 rounded-xl p-4 text-center">
            <div className="text-xs text-cedu-ink-muted mb-1">Tipo de membresía</div>
            <div className="font-semibold text-cedu-ink">{typeLabels[membershipType] || membershipType}</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-cedu-ink-muted border-t border-cedu-ink/5 pt-4">
          <span>Adhesión: {formattedDate}</span>
          <a
            href={`/verify/socio/${membershipNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cedu-blue hover:underline flex items-center gap-1"
            data-testid="link-verify-cert"
          >
            Verificar en línea <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}
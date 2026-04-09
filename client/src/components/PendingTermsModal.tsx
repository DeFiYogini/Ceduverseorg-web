import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { getAuthToken } from "@/lib/auth-token";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  FileText,
  Shield,
  ScrollText,
  Cookie,
  Award,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";

type TermsVersion = {
  id: string;
  docType: string;
  version: string;
  title: string;
  summary: string | null;
  contentUrl: string | null;
  isBlocking: boolean;
};

const DOC_CONFIG: Record<string, { icon: typeof FileText; color: string; bg: string; badge?: string }> = {
  terminos_condiciones: { icon: ScrollText, color: "text-cedu-blue", bg: "bg-cedu-blue/10" },
  aviso_privacidad: { icon: Shield, color: "text-violet-600", bg: "bg-violet-50" },
  politica_cookies: { icon: Cookie, color: "text-amber-600", bg: "bg-amber-50" },
  adhesion_cooperativa: { icon: Award, color: "text-emerald-600", bg: "bg-emerald-50", badge: "LGSC" },
};

const ADHESION_TEXT = `Al marcar esta casilla, solicito voluntariamente mi adhesión como socio cooperativista de Ceduverse S. C de C de Rl de CV, constituida conforme a la Ley General de Sociedades Cooperativas (LGSC).

Declaro que:
• Acepto los estatutos sociales de la cooperativa
• Me comprometo a cumplir con las obligaciones cooperativas establecidas
• Conozco y acepto los derechos y obligaciones que me corresponden como socio cooperativista
• Autorizo el tratamiento de mis datos personales para los fines descritos en el Aviso de Privacidad

La adhesión genera un número de socio único y un certificado digital de membresía verificable.`;

const EXEMPT_PATHS = ["/terminos", "/privacidad", "/cookies", "/auth"];

export default function PendingTermsModal() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [pending, setPending] = useState<TermsVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [membershipNumber, setMembershipNumber] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("/api/terms/pending", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        const blockingPending = (data.pending || []).filter((t: TermsVersion) => t.isBlocking);
        setPending(blockingPending);
      })
      .catch(() => setPending([]))
      .finally(() => setLoading(false));
  }, [user]);

  const isExemptPage = EXEMPT_PATHS.includes(location);

  if (loading || !user || pending.length === 0 || completed || isExemptPage) return null;

  const currentDoc = pending[currentIndex];
  if (!currentDoc) return null;

  const config = DOC_CONFIG[currentDoc.docType] || { icon: FileText, color: "text-gray-600", bg: "bg-gray-50" };
  const Icon = config.icon;
  const isAdhesion = currentDoc.docType === "adhesion_cooperativa";

  const checkboxKey = `${currentDoc.id}-accept`;
  const checkboxKey2 = isAdhesion ? `${currentDoc.id}-statutes` : null;
  const allChecked = checkedItems[checkboxKey] && (!checkboxKey2 || checkedItems[checkboxKey2]);

  const handleAcceptCurrent = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await apiRequest("POST", "/api/user/accept-terms", {
        versionIds: [currentDoc.id],
      });
      const data = await res.json();

      if (data.membershipNumber) {
        setMembershipNumber(data.membershipNumber);
      }

      if (currentIndex < pending.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setCheckedItems({});
      } else {
        setCompleted(true);
        window.location.reload();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error al aceptar. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      data-testid="modal-pending-terms"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center`}>
              <Icon size={20} className={config.color} />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-xl text-cedu-ink" data-testid="text-terms-modal-title">
                Documentos Legales
              </h2>
              <p className="text-xs text-cedu-ink-muted">
                Documento {currentIndex + 1} de {pending.length}
              </p>
            </div>
            {config.badge && (
              <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]" data-testid="badge-lgsc">
                {config.badge}
              </Badge>
            )}
          </div>

          <div className="flex gap-1.5">
            {pending.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i < currentIndex
                    ? "bg-cedu-green"
                    : i === currentIndex
                    ? "bg-cedu-blue"
                    : "bg-black/[0.08]"
                }`}
                data-testid={`progress-step-${i}`}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <h3 className="font-serif text-lg text-cedu-ink mb-1" data-testid="text-current-doc-title">
              {currentDoc.title}
            </h3>
            <p className="text-xs text-cedu-ink-muted">Versión {currentDoc.version}</p>
          </div>

          {isAdhesion ? (
            <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-xl p-4">
              <p className="text-sm text-cedu-ink-soft leading-relaxed whitespace-pre-line" data-testid="text-adhesion-content">
                {ADHESION_TEXT}
              </p>
            </div>
          ) : (
            <>
              {currentDoc.summary && (
                <p className="text-sm text-cedu-ink-soft leading-relaxed" data-testid="text-doc-summary">
                  {currentDoc.summary}
                </p>
              )}
              {currentDoc.contentUrl && (
                <a
                  href={currentDoc.contentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-cedu-blue hover:underline"
                  data-testid="link-view-full-document"
                >
                  <ExternalLink size={14} />
                  Ver documento completo
                </a>
              )}
            </>
          )}

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer" data-testid="label-accept-doc">
              <input
                type="checkbox"
                checked={!!checkedItems[checkboxKey]}
                onChange={(e) =>
                  setCheckedItems((prev) => ({ ...prev, [checkboxKey]: e.target.checked }))
                }
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-cedu-blue focus:ring-cedu-blue"
                data-testid="checkbox-accept-doc"
              />
              <span className="text-sm text-cedu-ink leading-relaxed">
                {isAdhesion
                  ? "Solicito mi adhesión como socio cooperativista y acepto los estatutos sociales"
                  : `He leído y acepto ${currentDoc.title} v${currentDoc.version}`}
              </span>
            </label>

            {isAdhesion && checkboxKey2 && (
              <label className="flex items-start gap-3 cursor-pointer" data-testid="label-accept-statutes">
                <input
                  type="checkbox"
                  checked={!!checkedItems[checkboxKey2]}
                  onChange={(e) =>
                    setCheckedItems((prev) => ({ ...prev, [checkboxKey2!]: e.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-cedu-blue focus:ring-cedu-blue"
                  data-testid="checkbox-accept-statutes"
                />
                <span className="text-sm text-cedu-ink leading-relaxed">
                  Me comprometo a cumplir con las obligaciones cooperativas y autorizo el tratamiento de mis datos
                </span>
              </label>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-black/[0.06] bg-black/[0.01]">
          {errorMsg && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3" data-testid="text-terms-error">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          <Button
            onClick={handleAcceptCurrent}
            disabled={!allChecked || submitting}
            className="w-full h-11 bg-cedu-blue hover:bg-cedu-blue/90 text-white font-semibold rounded-xl"
            data-testid="button-accept-terms"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : currentIndex < pending.length - 1 ? (
              <>
                <CheckCircle2 size={16} className="mr-2" />
                Aceptar y continuar
              </>
            ) : (
              <>
                <CheckCircle2 size={16} className="mr-2" />
                Aceptar y finalizar
              </>
            )}
          </Button>
          <p className="text-[10px] text-cedu-ink-muted text-center mt-2">
            Tu aceptación queda registrada con hash SHA-256, dirección IP y marca de tiempo.
          </p>
        </div>
      </div>
    </div>
  );
}

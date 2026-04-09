import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Phone, Mail, Globe, Download, ArrowLeft, Briefcase, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRef, useCallback } from "react";

interface VCardContact {
  fullName: string;
  title: string;
  phone: string;
  email: string;
  website?: string;
  organization?: string;
  avatarUrl?: string | null;
  avatarInitials?: string | null;
  avatarColor?: string | null;
}

function getInitials(name: string) {
  return name
    .replace(/^(Dr\.|Ing\.|Lic\.|Mtro\.|Mtra\.)\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("52")) {
    const local = digits.slice(2);
    return `+52 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return phone;
}

export default function VCardPage() {
  const [, params] = useRoute("/contacto/:slug");
  const slug = params?.slug || "";
  const qrRef = useRef<HTMLDivElement>(null);

  const { data: contact, isLoading, error } = useQuery<VCardContact>({
    queryKey: ["/api/vcard-data", slug],
    queryFn: async () => {
      const res = await fetch(`/api/vcard-data/${slug}`);
      if (!res.ok) throw new Error("Contacto no encontrado");
      return res.json();
    },
    enabled: !!slug,
  });

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/contacto/${slug}`
    : "";

  const websiteUrl = contact?.website || "https://ceduverse.org";
  const websiteDisplay = websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const handleDownloadVcf = useCallback(() => {
    window.open(`/api/vcard/${slug}`, "_blank");
  }, [slug]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: contact?.fullName || "Contacto Ceduverse",
          text: `Tarjeta de contacto de ${contact?.fullName}`,
          url: publicUrl,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(publicUrl);
      alert("Enlace copiado al portapapeles");
    }
  }, [contact, publicUrl]);

  const handleDownloadQR = useCallback(() => {
    const svgElement = qrRef.current?.querySelector("svg");
    if (!svgElement) return;

    const canvas = document.createElement("canvas");
    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    img.onload = () => {
      const padding = 64;
      ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2);

      ctx.font = "bold 28px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = "#1b5adf";
      ctx.textAlign = "center";
      ctx.fillText(contact?.fullName || "", size / 2, size - 20);

      const link = document.createElement("a");
      link.download = `qr-${slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, [contact, slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-gray-200" />
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-36 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-sm">
          <h2 className="font-serif text-2xl text-gray-800 mb-2">Contacto no encontrado</h2>
          <p className="text-gray-500 mb-4">La tarjeta que buscas no existe.</p>
          <a href="/" className="text-cedu-blue hover:underline inline-flex items-center gap-1">
            <ArrowLeft size={16} /> Ir al inicio
          </a>
        </Card>
      </div>
    );
  }

  const initials = contact.avatarInitials || getInitials(contact.fullName);

  return (
    <div className="min-h-screen bg-[#faf8f4]" data-testid="page-vcard">
      <div className="bg-gradient-to-br from-cedu-blue via-[#1448b8] to-[#0f3a8f] pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-cedu-orange/30 blur-3xl" />
        </div>

        <div className="relative max-w-md mx-auto text-center">
          <a href="/" className="inline-flex items-center gap-2 mb-8 no-underline">
            <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center text-white font-serif text-lg">
              C
            </div>
            <span className="font-serif text-xl text-white/90 tracking-tight">
              Cedu<em className="not-italic">verse</em>
            </span>
          </a>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-16 relative z-10 pb-12">
        <Card className="rounded-2xl shadow-xl border-0 overflow-hidden bg-white">
          <div className="flex flex-col items-center pt-8 pb-6 px-6">
            {contact.avatarUrl ? (
              <img
                src={contact.avatarUrl}
                alt={contact.fullName}
                className="w-24 h-24 rounded-full object-cover mb-4 shadow-lg ring-4 ring-white"
                data-testid="avatar-photo"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={`w-24 h-24 rounded-full bg-gradient-to-br from-cedu-blue to-cedu-violet flex items-center justify-center text-white font-serif text-3xl mb-4 shadow-lg ring-4 ring-white ${contact.avatarUrl ? "hidden" : ""}`}
              data-testid="avatar-initials"
            >
              {initials}
            </div>

            <h1 className="font-serif text-2xl text-gray-900 text-center mb-1" data-testid="text-fullname">
              {contact.fullName}
            </h1>

            <div className="flex items-center gap-1.5 text-cedu-blue font-medium text-sm mb-1" data-testid="text-title">
              <Briefcase size={14} />
              {contact.title}
            </div>

            <div className="text-gray-400 text-xs font-medium tracking-wider uppercase mt-1">
              {contact.organization || "Ceduverse"}
            </div>
          </div>

          <div className="border-t border-gray-100 mx-6" />

          <div className="px-6 py-5 space-y-3">
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-4 p-3.5 rounded-xl bg-gray-50 hover:bg-cedu-blue/5 transition-colors no-underline group"
                data-testid="link-phone"
              >
                <div className="w-11 h-11 rounded-full bg-cedu-green/10 flex items-center justify-center flex-shrink-0">
                  <Phone size={20} className="text-cedu-green" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">Teléfono</div>
                  <div className="text-gray-800 font-medium group-hover:text-cedu-blue transition-colors">
                    {formatPhone(contact.phone)}
                  </div>
                </div>
              </a>
            )}

            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-4 p-3.5 rounded-xl bg-gray-50 hover:bg-cedu-blue/5 transition-colors no-underline group"
                data-testid="link-email"
              >
                <div className="w-11 h-11 rounded-full bg-cedu-orange/10 flex items-center justify-center flex-shrink-0">
                  <Mail size={20} className="text-cedu-orange" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">Email</div>
                  <div className="text-gray-800 font-medium group-hover:text-cedu-blue transition-colors break-all">
                    {contact.email}
                  </div>
                </div>
              </a>
            )}

            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-3.5 rounded-xl bg-gray-50 hover:bg-cedu-blue/5 transition-colors no-underline group"
              data-testid="link-website"
            >
              <div className="w-11 h-11 rounded-full bg-cedu-blue/10 flex items-center justify-center flex-shrink-0">
                <Globe size={20} className="text-cedu-blue" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium">Sitio web</div>
                <div className="text-gray-800 font-medium group-hover:text-cedu-blue transition-colors">
                  {websiteDisplay}
                </div>
              </div>
            </a>
          </div>

          <div className="border-t border-gray-100 mx-6" />

          <div className="px-6 py-6 flex flex-col items-center">
            <p className="text-xs text-gray-400 mb-3 font-medium">Escanea para guardar</p>
            <div
              ref={qrRef}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
              onClick={handleDownloadQR}
              title="Descargar QR"
              data-testid="qr-code"
            >
              <QRCodeSVG
                value={publicUrl}
                size={180}
                level="H"
                fgColor="#1b5adf"
                bgColor="#ffffff"
                imageSettings={{
                  src: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="#1b5adf"/><text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-family="serif" font-size="24" fill="white">C</text></svg>'),
                  x: undefined,
                  y: undefined,
                  height: 36,
                  width: 36,
                  excavate: true,
                }}
              />
            </div>
            <button
              onClick={handleDownloadQR}
              className="text-xs text-cedu-blue hover:underline mt-2 bg-transparent border-none cursor-pointer"
              data-testid="button-download-qr"
            >
              Descargar imagen QR
            </button>
          </div>

          <div className="px-6 pb-6 space-y-2.5">
            <Button
              onClick={handleDownloadVcf}
              className="w-full h-12 bg-cedu-blue hover:bg-cedu-blue/90 text-white rounded-xl font-semibold text-base gap-2"
              data-testid="button-save-contact"
            >
              <Download size={18} />
              Guardar en contactos
            </Button>

            <Button
              onClick={handleShare}
              variant="outline"
              className="w-full h-12 rounded-xl font-semibold text-base gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
              data-testid="button-share"
            >
              <Share2 size={18} />
              Compartir tarjeta
            </Button>
          </div>
        </Card>

        <div className="text-center mt-8">
          <a href="/" className="text-sm text-gray-400 hover:text-cedu-blue transition-colors no-underline inline-flex items-center gap-1">
            <ArrowLeft size={14} />
            ceduverse.org
          </a>
        </div>
      </div>
    </div>
  );
}

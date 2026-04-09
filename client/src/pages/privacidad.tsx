import { useForceLightMode } from "@/components/ThemeProvider";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function PrivacidadPage() {
  useForceLightMode();
  return (
    <div className="min-h-screen bg-cedu-cream" data-testid="page-privacidad">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/">
          <button className="flex items-center gap-2 text-sm text-cedu-ink-muted hover:text-cedu-blue mb-8 transition-colors" data-testid="link-back-home">
            <ArrowLeft size={16} /> Volver al inicio
          </button>
        </Link>

        <div className="bg-white rounded-2xl border border-black/[0.06] p-8 sm:p-12 shadow-sm">
          <h1 className="font-serif text-3xl text-cedu-ink mb-2" data-testid="text-privacidad-title">Aviso de Privacidad</h1>
          <p className="text-sm text-cedu-ink-muted mb-10">Conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</p>

          <div className="space-y-8 text-sm text-cedu-ink-soft leading-relaxed">
            <section>
              <h2 className="font-serif text-xl text-cedu-ink mb-3">I. Identidad del Responsable</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Razón social:</strong> Ceduverse S. C de C de Rl de CV</li>
                <li><strong>Domicilio:</strong> Oficina Virtual Cancún — dirección fiscal</li>
                <li><strong>Email de contacto:</strong> privacidad@ceduverse.org</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl text-cedu-ink mb-3">II. Datos que se Recaban</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-cedu-ink text-sm mb-1">Identificación</h3>
                  <p>Nombre, email, teléfono, país, ciudad.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-cedu-ink text-sm mb-1">Laborales</h3>
                  <p>Puesto, empresa, RFC (para empresas).</p>
                </div>
                <div>
                  <h3 className="font-semibold text-cedu-ink text-sm mb-1">Académicos</h3>
                  <p>Cursos tomados, evaluaciones, progreso, certificaciones.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-cedu-ink text-sm mb-1">Técnicos</h3>
                  <p>Dirección IP, user agent, dispositivo, geolocalización aproximada.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-cedu-ink text-sm mb-1">Financieros</h3>
                  <p>Datos de facturación (solo empresas, NO datos bancarios directos).</p>
                </div>
                <div>
                  <h3 className="font-semibold text-cedu-ink text-sm mb-1">Biométricos</h3>
                  <p><strong>NO</strong> se recaban datos biométricos.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-cedu-ink text-sm mb-1">Web3</h3>
                  <p>Dirección de billetera blockchain (si el usuario la vincula).</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-xl text-cedu-ink mb-3">III. Finalidades</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-cedu-ink text-sm mb-1">Primarias</h3>
                  <p>Prestación del servicio educativo, emisión de certificaciones, facturación, soporte.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-cedu-ink text-sm mb-1">Secundarias</h3>
                  <p>Estadísticas de uso, mejora de contenido IA, marketing personalizado.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-cedu-ink text-sm mb-1">Transferencias</h3>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>A Brainshield S.C. (licenciante de tecnología)</li>
                    <li>A agentes capacitadores externos (para DC-3)</li>
                    <li>A INEC (para certificados SEP)</li>
                    <li>A autoridades cuando sea requerido por ley</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-xl text-cedu-ink mb-3">IV. Uso de Inteligencia Artificial</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Se notifica al usuario que un motor de inteligencia artificial procesa sus datos académicos para personalizar el contenido educativo.</li>
                <li>Los datos de actividad se utilizan para entrenar y mejorar los modelos de IA.</li>
                <li>El usuario puede solicitar que sus datos no sean utilizados para entrenamiento de IA enviando email a <strong>privacidad@ceduverse.org</strong>.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl text-cedu-ink mb-3">V. Derechos ARCO</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>El usuario puede ejercer sus derechos de <strong>Acceso, Rectificación, Cancelación y Oposición</strong> enviando email a <strong>privacidad@ceduverse.org</strong>.</li>
                <li>Plazo de respuesta: <strong>20 días hábiles</strong>.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl text-cedu-ink mb-3">VI. Cookies y Tecnologías de Rastreo</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>La plataforma utiliza cookies funcionales y de análisis.</li>
                <li>El usuario puede gestionar sus preferencias de cookies. Consulta nuestra <a href="/cookies" target="_blank" rel="noopener noreferrer" className="text-cedu-blue underline">Política de Cookies</a> para más detalles.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl text-cedu-ink mb-3">VII. Expediente de Materialidad Educativa</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Ceduverse genera y almacena un expediente digital por cada usuario que incluye: bitácoras de conexión (logs), capturas de actividad, listas de asistencia digital, certificados emitidos, evaluaciones presentadas, y tiempo de estudio registrado.</li>
                <li>Este expediente tiene finalidad fiscal y de cumplimiento normativo conforme al <strong>Art. 69-B del Código Fiscal de la Federación</strong>.</li>
                <li>El expediente se conserva por un mínimo de <strong>5 años</strong> conforme a las disposiciones fiscales aplicables.</li>
              </ul>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-black/[0.06] text-xs text-cedu-ink-muted">
            Última actualización: Marzo 2026
          </div>
        </div>
      </div>
    </div>
  );
}

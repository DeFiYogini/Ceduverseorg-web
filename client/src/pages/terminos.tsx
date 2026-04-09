import { useForceLightMode } from "@/components/ThemeProvider";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function TerminosPage() {
  useForceLightMode();
  return (
    <div className="min-h-screen bg-cedu-cream" data-testid="page-terminos">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/">
          <button className="flex items-center gap-2 text-sm text-cedu-ink-muted hover:text-cedu-blue mb-8 transition-colors" data-testid="link-back-home">
            <ArrowLeft size={16} /> Volver al inicio
          </button>
        </Link>

        <div className="bg-white rounded-2xl border border-black/[0.06] p-8 sm:p-12 shadow-sm">
          <h1 className="font-serif text-3xl text-cedu-ink mb-2" data-testid="text-terminos-title">Términos y Condiciones</h1>
          <p className="text-sm text-cedu-ink-muted mb-10">Última actualización: Marzo 2026</p>

          <div className="space-y-8 text-sm text-cedu-ink-soft leading-relaxed">
            <section>
              <h2 className="font-serif text-xl text-cedu-ink mb-3">I. Definiciones</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>"La Plataforma"</strong>: Ceduverse (ceduverse.org)</li>
                <li><strong>"La Cooperativa"</strong>: Ceduverse S. C de C de Rl de CV</li>
                <li><strong>"El Licenciante"</strong>: Brainshield S.C. (titular de la propiedad intelectual)</li>
                <li><strong>"El Usuario"</strong>: toda persona que acceda y use la plataforma</li>
                <li><strong>"La Empresa Patrocinadora"</strong>: persona moral que realiza aportaciones a la cooperativa</li>
                <li><strong>"Aportación"</strong>: pago mensual voluntario calculado en UMAs por colaborador</li>
                <li><strong>"SAM"</strong>: Solicitud de Aportación Mensual generada por la plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl text-cedu-ink mb-3">II. Naturaleza del Servicio</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Ceduverse es una plataforma tecnológica de educación y capacitación.</li>
                <li><strong>NO</strong> es un despacho de abogados, contadores, ni asesores fiscales.</li>
                <li>Las respuestas del Tutor IA, calculadoras, y herramientas automatizadas tienen fin estrictamente <strong>informativo</strong> y <strong>NO vinculante</strong>.</li>
                <li>Ceduverse <strong>NO</strong> garantiza resultados en inspecciones STPS ni procedimientos administrativos.</li>
                <li>El usuario reconoce que un motor de inteligencia artificial procesa y personaliza el contenido educativo.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl text-cedu-ink mb-3">III. Propiedad Intelectual</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>El software, algoritmos, modelos de IA, bases de datos, diseño, marcas, logotipos, contenido generado, y bots de la plataforma son propiedad exclusiva de <strong>Brainshield S.C.</strong></li>
                <li>Ceduverse S. C de C de Rl de CV opera la plataforma bajo licencia de uso otorgada por Brainshield S.C.</li>
                <li>El usuario <strong>NO</strong> adquiere ningún derecho de propiedad intelectual por el uso de la plataforma.</li>
                <li>Queda estrictamente prohibido: copiar, modificar, descompilar, realizar ingeniería inversa, distribuir, sublicenciar, o crear obras derivadas del software.</li>
                <li>Los certificados NFT emitidos son constancias digitales verificables; su emisión no transfiere derechos de PI.</li>
                <li>Las violaciones a esta cláusula serán perseguidas conforme a la Ley Federal del Derecho de Autor y la Ley de la Propiedad Industrial.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl text-cedu-ink mb-3">IV. Modelo de Aportaciones Cooperativistas</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Las aportaciones de las Empresas Patrocinadoras son <strong>voluntarias</strong>.</li>
                <li>Se calculan en UMAs (Unidad de Medida y Actualización) por colaborador por mes.</li>
                <li>No generan obligación, penalización moratoria ni penalidades por cancelación.</li>
                <li>Los planes (Impulsa, Transforma, Lidera) pueden ajustarse mes a mes.</li>
                <li>La cooperativa retiene un fee de administración (variable por plan) para operar la plataforma, la tecnología, el soporte y las certificaciones.</li>
                <li>Todas las aportaciones generan <strong>CFDI deducible</strong>.</li>
                <li>La Empresa Patrocinadora confirma digitalmente cada Solicitud de Aportación Mensual (SAM) desde su panel de administración; dicha confirmación constituye manifestación de voluntad conforme al Art. 89 Bis del Código de Comercio.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl text-cedu-ink mb-3">V. Certificaciones</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>El <strong>Diploma Digital (NFT)</strong> se emite automáticamente al aprobar evaluaciones y es gratuito.</li>
                <li>La <strong>Constancia DC-3 STPS</strong> ($499 MXN) se tramita a través de un Agente Capacitador Externo registrado ante la STPS.</li>
                <li>El <strong>Certificado SEP</strong> ($1,999 MXN) se tramita a través del Instituto Nacional de Educación para la Competitividad (INEC).</li>
                <li>Ceduverse facilita el proceso pero <strong>NO</strong> es el emisor directo de los documentos DC-3 ni SEP.</li>
                <li>Los tiempos de emisión dependen de terceros y Ceduverse no garantiza plazos específicos.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl text-cedu-ink mb-3">VI. Privacidad y Datos Personales</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>El tratamiento de datos personales se rige por el <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-cedu-blue underline">Aviso de Privacidad</a>.</li>
                <li>El usuario consiente que sus datos de actividad (cursos tomados, evaluaciones, tiempos de conexión, IP, user agent) sean registrados como parte del Expediente de Materialidad Educativa.</li>
                <li>Estos registros son necesarios para la emisión de certificaciones y el cumplimiento de obligaciones fiscales y laborales.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl text-cedu-ink mb-3">VII. Decisiones Automatizadas</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>La plataforma utiliza inteligencia artificial (modelos de lenguaje) para generar contenido educativo personalizado.</li>
                <li>El contenido generado por IA es revisado periódicamente pero puede contener imprecisiones.</li>
                <li>El usuario reconoce que las evaluaciones, quizzes adaptativos, y recomendaciones de cursos son generados por sistemas automatizados.</li>
                <li>Las decisiones sobre emisión de certificados requieren intervención humana del equipo de Ceduverse.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl text-cedu-ink mb-3">VIII. Confidencialidad</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>El usuario se obliga a mantener en secreto cualquier información técnica, comercial, financiera o estratégica a la que tenga acceso mediante la plataforma.</li>
                <li>Esta obligación subsiste de manera indefinida tras la terminación de la relación.</li>
                <li>La violación de esta cláusula dará lugar a las acciones legales correspondientes, incluyendo penalizaciones económicas.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl text-cedu-ink mb-3">IX. Limitación de Responsabilidad</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Ceduverse y Brainshield <strong>NO</strong> serán responsables por daños indirectos, incidentales, consecuentes o punitivos.</li>
                <li>La responsabilidad máxima de Ceduverse se limita al monto de las aportaciones pagadas en los últimos 3 meses.</li>
                <li>Ceduverse <strong>NO</strong> garantiza la disponibilidad ininterrumpida de la plataforma.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl text-cedu-ink mb-3">X. Jurisdicción y Ley Aplicable</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Los presentes Términos se rigen por las leyes de los Estados Unidos Mexicanos.</li>
                <li>Para la interpretación y cumplimiento, las partes se someten a la jurisdicción de los tribunales competentes de la ciudad de <strong>Cancún, Quintana Roo</strong>, renunciando a cualquier otro fuero que pudiera corresponderles.</li>
                <li>Las controversias relacionadas con propiedad intelectual se someterán a la jurisdicción federal.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl text-cedu-ink mb-3">XI. Modificaciones</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Ceduverse se reserva el derecho de modificar estos Términos en cualquier momento.</li>
                <li>Las modificaciones serán notificadas al usuario por email y/o dentro de la plataforma.</li>
                <li>El uso continuado de la plataforma después de la notificación constituye aceptación.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl text-cedu-ink mb-3">XII. Aceptación</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Al registrarse y/o usar la plataforma, el usuario acepta íntegramente estos Términos.</li>
                <li>La confirmación digital de la SAM constituye aceptación adicional para Empresas Patrocinadoras.</li>
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

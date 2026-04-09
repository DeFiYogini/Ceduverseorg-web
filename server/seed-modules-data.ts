export const EXTRA_MODULES_DATA: Record<string, { title: string; description: string; contentHtml: string; videoUrl?: string; audioUrl?: string; references?: string[]; durationMinutes: number }[]> = {
// ═══ 1. DIAGNÓSTICO, PREVENCIÓN E INTERVENCIÓN DEL BULLYING ═══
"diagnostico-prevencion-bullying": [
  {
    title: "Conceptualización del Bullying",
    description: "Definición, tipos y criterios para identificar el bullying en entornos laborales y sociales",
    contentHtml: `
      <h2>¿Qué es el Bullying?</h2>
      <p>El bullying es una conducta agresiva, <strong>intencional y repetida</strong> que ocurre en una relación donde existe un desequilibrio de poder. No es un conflicto aislado ni una broma: es un patrón sostenido que causa daño.</p>

      <h3>Criterios para identificar el bullying</h3>
      <ol>
        <li><strong>Intencionalidad:</strong> La conducta busca causar daño deliberadamente</li>
        <li><strong>Repetición:</strong> No es un incidente aislado, sino un patrón persistente</li>
        <li><strong>Desequilibrio de poder:</strong> El agresor tiene o percibe tener más poder que la víctima</li>
        <li><strong>Indefensión:</strong> La víctima tiene dificultades para defenderse</li>
      </ol>

      <h3>Tipos de bullying</h3>
      <ul>
        <li><strong>Físico:</strong> Golpes, empujones, daño a pertenencias</li>
        <li><strong>Verbal:</strong> Insultos, apodos, amenazas, humillaciones públicas</li>
        <li><strong>Social/Relacional:</strong> Exclusión deliberada, difusión de rumores, aislamiento</li>
        <li><strong>Cyberbullying:</strong> Agresión a través de medios digitales y redes sociales</li>
        <li><strong>Laboral (Mobbing):</strong> Acoso en el entorno de trabajo — sobrecarga intencional, exclusión de reuniones, descrédito profesional</li>
      </ul>

      <h3>El Mobbing: bullying en el trabajo</h3>
      <p>En el contexto organizacional, el bullying adopta la forma de <strong>mobbing</strong>, que puede ser:</p>
      <ul>
        <li><strong>Horizontal:</strong> Entre compañeros del mismo nivel jerárquico</li>
        <li><strong>Vertical descendente (bossing):</strong> Del jefe hacia el subordinado</li>
        <li><strong>Vertical ascendente:</strong> Del subordinado hacia el jefe (menos común pero real)</li>
      </ul>

      <h3>El triángulo del bullying</h3>
      <p>En toda dinámica de bullying participan tres roles: el <strong>agresor</strong> (quien ejecuta la conducta), la <strong>víctima</strong> (quien la recibe) y los <strong>espectadores</strong> (quienes observan). El rol de los espectadores es crucial — pueden ser facilitadores, reforzadores, defensores o simples observadores pasivos. Romper el silencio de los testigos es clave para detener el ciclo.</p>
    `,
    references: ["NOM-035-STPS-2018", "Ley Federal del Trabajo Art. 3 Bis", "OMS - Violencia en el lugar de trabajo"],
    durationMinutes: 30
  },
  {
    title: "Factores y Características del Bullying",
    description: "Factores individuales, organizacionales y señales de alerta para detectar el bullying",
    contentHtml: `
      <h2>¿Qué propicia el bullying?</h2>
      <p>El bullying no surge en el vacío. Existen factores individuales y contextuales que crean el terreno fértil para que estas conductas se manifiesten y se sostengan en el tiempo.</p>

      <h3>Factores individuales del agresor</h3>
      <ul>
        <li>Necesidad de control y dominio sobre otros</li>
        <li>Baja empatía — dificultad para ponerse en el lugar del otro</li>
        <li>Modelos de conducta agresiva aprendidos en su historia personal</li>
        <li>Inseguridad profunda encubierta con conducta dominante</li>
        <li>Falta de habilidades para resolver conflictos de manera constructiva</li>
      </ul>

      <h3>Factores organizacionales que lo permiten</h3>
      <ul>
        <li><strong>Culturas permisivas:</strong> "Así es aquí, así nos llevamos"</li>
        <li><strong>Falta de normas claras</strong> de convivencia y consecuencias</li>
        <li><strong>Liderazgo negligente</strong> que ignora las señales</li>
        <li><strong>Alta competitividad</strong> sin regulación ni valores</li>
        <li><strong>Ausencia de protocolos</strong> de denuncia y atención</li>
        <li><strong>Estrés organizacional crónico</strong> que detona conductas agresivas</li>
      </ul>

      <h3>Señales de alerta</h3>
      <p><strong>En la víctima:</strong> aislamiento progresivo, cambios bruscos de ánimo, baja productividad, ausentismo, ansiedad antes de ir al trabajo, llanto o irritabilidad sin causa aparente.</p>
      <p><strong>En el agresor:</strong> conducta dominante frecuente, ridiculización de otros como "broma", necesidad de audiencia, minimización de sus actos ("es jugando"), culpabilización de la víctima ("es muy sensible").</p>
      <p><strong>En el ambiente:</strong> rumores constantes, grupos cerrados y exclusivos, silencio ante agresiones evidentes, alta rotación de personal en un área específica, quejas recurrentes.</p>

      <h3>Importante</h3>
      <p>Los factores de la víctima <strong>nunca justifican</strong> el bullying. Ser introvertido, nuevo, diferente o exitoso no es causa del acoso — la responsabilidad siempre es del agresor y del sistema que lo permite.</p>
    `,
    references: ["NOM-035-STPS-2018 Cap. 7", "Leymann, H. - Mobbing and Psychological Terror at Workplaces", "STPS - Protocolo contra violencia laboral"],
    durationMinutes: 30
  },
  {
    title: "Repercusiones Psicológicas del Bullying",
    description: "Impacto en la salud mental, física y organizacional del bullying laboral",
    contentHtml: `
      <h2>El impacto real del bullying</h2>
      <p>El bullying no es "cosa de niños" ni algo que se supera con "echarle ganas". Sus efectos son profundos y medibles — afectan la salud mental, física y el desempeño profesional de la víctima, y generan costos reales para la organización.</p>

      <h3>Efectos psicológicos en la víctima</h3>
      <ul>
        <li><strong>Ansiedad generalizada</strong> y ataques de pánico</li>
        <li><strong>Depresión</strong> y sentimientos de desesperanza</li>
        <li><strong>Trastorno de estrés postraumático</strong> (TEPT)</li>
        <li><strong>Autoestima deteriorada</strong> — "tal vez sí es mi culpa"</li>
        <li><strong>Desconfianza</strong> hacia compañeros y autoridades</li>
        <li><strong>Insomnio, pesadillas</strong> y trastornos del sueño</li>
      </ul>

      <h3>Efectos físicos (psicosomáticos)</h3>
      <p>El estrés crónico del bullying se manifiesta en el cuerpo: dolores de cabeza recurrentes, problemas gastrointestinales, tensión muscular crónica, fatiga constante, cambios drásticos en el apetito y peso, y debilitamiento del sistema inmunológico.</p>

      <h3>Impacto en la organización</h3>
      <ul>
        <li><strong>Clima laboral tóxico</strong> que afecta a todos, no solo a la víctima</li>
        <li><strong>Alta rotación</strong> — las personas talentosas se van primero</li>
        <li><strong>Baja productividad</strong> generalizada por miedo y desmotivación</li>
        <li><strong>Ausentismo</strong> y presentismo (estar presente pero sin rendir)</li>
        <li><strong>Costos legales</strong> — demandas laborales, indemnizaciones</li>
        <li><strong>Daño reputacional</strong> — la empresa se conoce como "tóxica"</li>
      </ul>

      <h3>El costo oculto</h3>
      <p>Estudios estiman que el mobbing puede costar a una organización entre <strong>$15,000 y $50,000 USD por caso</strong> cuando se suman ausentismo, rotación, pérdida de productividad y costos legales. Prevenir siempre es más económico que remediar.</p>
    `,
    references: ["OIT - Violencia y acoso en el mundo del trabajo (C190)", "NOM-035-STPS-2018", "Hirigoyen, M.F. - El acoso moral en el trabajo"],
    durationMinutes: 25
  },
  {
    title: "Apoyo y Manejo del Bullying",
    description: "Protocolos de intervención, atención a la víctima y estrategias de prevención organizacional",
    contentHtml: `
      <h2>Protocolo de intervención organizacional</h2>
      <p>Cuando se detecta bullying, la organización debe actuar de manera estructurada. No basta con "hablar con las partes" — se necesita un proceso formal.</p>

      <h3>Paso 1: Detección</h3>
      <ul>
        <li>Implementar canales de denuncia <strong>confidenciales</strong> (buzón anónimo, línea ética, correo dedicado)</li>
        <li>Capacitar a líderes para reconocer las señales tempranas</li>
        <li>Aplicar encuestas de clima laboral periódicamente</li>
        <li>Observación activa de dinámicas grupales en reuniones y convivencia</li>
      </ul>

      <h3>Paso 2: Documentación</h3>
      <p>Registrar fechas, hechos concretos (no interpretaciones), testigos disponibles y evidencia (mensajes, correos, testimonios escritos). Mantener <strong>confidencialidad estricta</strong> durante todo el proceso.</p>

      <h3>Paso 3: Intervención inmediata</h3>
      <ul>
        <li>Separar al agresor de la víctima si es operativamente posible</li>
        <li>Realizar entrevistas individuales con las partes involucradas</li>
        <li>Activar el protocolo interno de atención</li>
        <li>Nunca confrontar públicamente al agresor frente a la víctima</li>
      </ul>

      <h3>Paso 4: Atención a la víctima</h3>
      <p>Ofrecer apoyo psicológico profesional, asegurar que no habrá represalias, dar seguimiento periódico y facilitar la reintegración al grupo cuando sea seguro.</p>

      <h3>Paso 5: Medidas con el agresor</h3>
      <p>Confrontación privada con evidencias específicas (conductas, no etiquetas), establecimiento de compromisos de cambio medibles, seguimiento a 30/60/90 días, y consecuencias claras si la conducta persiste.</p>

      <h3>Prevención: la mejor estrategia</h3>
      <ol>
        <li><strong>Política de cero tolerancia</strong> al acoso, comunicada y visible</li>
        <li><strong>Capacitación regular</strong> a todo el personal sobre convivencia respetuosa</li>
        <li><strong>Liderazgo con el ejemplo</strong> — los líderes modelan la conducta</li>
        <li><strong>Consecuencias reales</strong> y consistentes para los agresores</li>
        <li><strong>Canales de denuncia</strong> accesibles, confidenciales y efectivos</li>
        <li><strong>Seguimiento</strong> — el protocolo no sirve si se guarda en un cajón</li>
      </ol>
    `,
    references: ["NOM-035-STPS-2018 Cap. 8", "LFT Art. 47 y 51", "Protocolo de actuación contra la violencia laboral - STPS"],
    durationMinutes: 35
  }
],

// ═══ 2. CAMINO A LA AUTODEPENDENCIA ═══
"camino-autodependencia": [
  {
    title: "Encuentro con Uno Mismo",
    description: "Autoconocimiento como base de la autodependencia emocional y profesional",
    contentHtml: `
      <h2>El primer paso: conocerte</h2>
      <p>La autodependencia comienza con un acto de honestidad: mirarte sin filtros. No se trata de ser autosuficiente ni de no necesitar a nadie — se trata de <strong>no depender emocionalmente de otros</strong> para sentirte valioso, tomar decisiones o encontrar dirección en tu vida.</p>

      <h3>¿Qué es la autodependencia?</h3>
      <p>Es la capacidad de hacerte cargo de ti mismo: de tus emociones, tus decisiones, tus necesidades y tu bienestar. Una persona autodependiente puede pedir ayuda sin sentirse débil, puede estar sola sin sentirse vacía, y puede amar sin perderse en el otro.</p>

      <h3>Las 4 preguntas del autoconocimiento</h3>
      <ol>
        <li><strong>¿Quién soy?</strong> — Más allá de mi rol laboral, mi título, mi relación. ¿Qué me define cuando me quitan las etiquetas?</li>
        <li><strong>¿Qué siento?</strong> — Identificar y nombrar mis emociones. Muchos adultos no pueden distinguir entre tristeza, frustración, miedo y enojo.</li>
        <li><strong>¿Qué necesito?</strong> — No lo que "debería" necesitar, sino lo que genuinamente necesito para estar bien.</li>
        <li><strong>¿Qué quiero?</strong> — Diferenciar mis deseos de las expectativas que otros han puesto sobre mí.</li>
      </ol>

      <h3>Los mandatos que arrastramos</h3>
      <p>Desde la infancia recibimos mensajes que se convierten en creencias inconscientes:</p>
      <ul>
        <li>"No llores" → Aprendí a reprimir emociones</li>
        <li>"Sé fuerte" → Aprendí que pedir ayuda es debilidad</li>
        <li>"No seas egoísta" → Aprendí a anteponer siempre a los demás</li>
        <li>"Tú puedes solo" → Aprendí a no confiar en otros</li>
      </ul>
      <p>El camino a la autodependencia implica revisar estos mandatos y decidir conscientemente cuáles quieres conservar y cuáles necesitas soltar.</p>

      <h3>Ejercicio: El inventario emocional</h3>
      <p>Durante una semana, registra cada noche: ¿Qué emoción sentí con más intensidad hoy? ¿Qué la provocó? ¿Cómo reaccioné? ¿Cómo me hubiera gustado reaccionar? Este simple ejercicio comienza a construir tu <strong>inteligencia emocional</strong>.</p>
    `,
    references: ["Bucay, J. - El camino de la autodependencia", "Goleman, D. - Inteligencia Emocional", "Rogers, C. - El proceso de convertirse en persona"],
    durationMinutes: 30
  },
  {
    title: "Encuentro con el Otro",
    description: "Construir relaciones saludables desde la autonomía emocional",
    contentHtml: `
      <h2>Relaciones desde la libertad, no desde la necesidad</h2>
      <p>Una vez que comienzas a conocerte, el siguiente paso es revisar cómo te relacionas con los demás. La autodependencia no significa aislarte — significa <strong>elegir estar con otros desde la voluntad, no desde la carencia</strong>.</p>

      <h3>Dependencia vs. Autodependencia en las relaciones</h3>
      <ul>
        <li><strong>Dependencia:</strong> "Te necesito para estar bien" → Relación desde el miedo al abandono</li>
        <li><strong>Contradependencia:</strong> "No necesito a nadie" → Relación desde el miedo a la vulnerabilidad</li>
        <li><strong>Autodependencia:</strong> "Elijo estar contigo y también estoy bien conmigo" → Relación desde la libertad</li>
      </ul>

      <h3>Los 5 pilares de las relaciones saludables</h3>
      <ol>
        <li><strong>Respeto:</strong> Reconocer al otro como ser autónomo con derecho a ser diferente</li>
        <li><strong>Honestidad:</strong> Decir lo que sientes y necesitas sin manipulación</li>
        <li><strong>Límites:</strong> Saber dónde termino yo y dónde empieza el otro</li>
        <li><strong>Reciprocidad:</strong> Dar y recibir en equilibrio — no siempre exacto, pero sí justo</li>
        <li><strong>Libertad:</strong> No intentar controlar, cambiar o poseer al otro</li>
      </ol>

      <h3>El arte de poner límites</h3>
      <p>Poner límites no es ser egoísta — es ser honesto. Un límite es decir: "Esto sí, esto no. Hasta aquí llego." Los límites claros generan relaciones más sanas porque eliminan el resentimiento acumulado.</p>
      <p><strong>Fórmula para poner un límite:</strong></p>
      <p>"Entiendo que [necesidad del otro], y yo necesito [tu necesidad]. Lo que puedo hacer es [propuesta concreta]."</p>

      <h3>Aplicación en el trabajo</h3>
      <p>Las relaciones laborales son un excelente laboratorio para practicar la autodependencia: establecer límites con jefes o compañeros invasivos, comunicar necesidades sin agresividad, y separar tu valor personal de tu desempeño laboral.</p>
    `,
    references: ["Bucay, J. - El camino de la autodependencia", "Brené Brown - Los dones de la imperfección", "Cloud & Townsend - Límites"],
    durationMinutes: 30
  },
  {
    title: "Pérdidas y Duelos",
    description: "Procesamiento saludable de las pérdidas y transiciones de vida",
    contentHtml: `
      <h2>Aprender a soltar</h2>
      <p>La vida está llena de pérdidas — no solo de personas, sino de relaciones, trabajos, etapas, ilusiones, identidades. <strong>El duelo es el proceso natural de adaptación a una pérdida significativa</strong>, y negarlo no lo elimina: solo lo retrasa y lo complica.</p>

      <h3>Tipos de pérdidas</h3>
      <ul>
        <li><strong>Pérdidas relacionales:</strong> Ruptura de pareja, alejamiento de amigos, muerte de seres queridos</li>
        <li><strong>Pérdidas laborales:</strong> Despido, cambio de puesto, pérdida de un proyecto, jubilación</li>
        <li><strong>Pérdidas de identidad:</strong> Dejar de ser "el joven", "el estudiante", "el exitoso"</li>
        <li><strong>Pérdidas de salud:</strong> Enfermedad crónica, limitaciones físicas</li>
        <li><strong>Pérdidas de ilusiones:</strong> Aceptar que algo no va a suceder como lo imaginabas</li>
      </ul>

      <h3>El proceso del duelo</h3>
      <p>No es lineal ni tiene un tiempo definido. Las emociones van y vienen en oleadas:</p>
      <ol>
        <li><strong>Negación:</strong> "No puede ser, esto no está pasando"</li>
        <li><strong>Enojo:</strong> "¿Por qué a mí? No es justo"</li>
        <li><strong>Negociación:</strong> "Si hubiera hecho algo diferente..."</li>
        <li><strong>Tristeza:</strong> La emoción más necesaria — sentir el vacío de lo perdido</li>
        <li><strong>Aceptación:</strong> No significa estar de acuerdo, sino integrar la pérdida en tu historia</li>
      </ol>

      <h3>Duelo en el contexto laboral</h3>
      <p>Perder un empleo puede sentirse como perder la identidad. Muchas personas se definen por lo que hacen: "Soy ingeniero", "Soy gerente". Cuando ese rol desaparece, la pregunta incómoda aparece: "¿Quién soy sin mi trabajo?" Procesar este duelo es fundamental antes de buscar un nuevo empleo — de lo contrario, la urgencia y el miedo nublan las decisiones.</p>

      <h3>Señales de duelo no procesado</h3>
      <p>Irritabilidad crónica, dificultad para comprometerse con algo nuevo, idealización excesiva del pasado ("todo tiempo pasado fue mejor"), evitación de situaciones que recuerden la pérdida, y sensación de estar "atorado".</p>
    `,
    references: ["Kübler-Ross, E. - Sobre la muerte y los moribundos", "Bucay, J. - El camino de las lágrimas", "Neimeyer, R. - Aprender de la pérdida"],
    durationMinutes: 30
  },
  {
    title: "Completitud y Búsqueda del Sentido",
    description: "Encontrar propósito y sentido de vida como fundamento de la autodependencia plena",
    contentHtml: `
      <h2>No necesitas que te completen</h2>
      <p>La cultura nos enseña que estamos "incompletos" hasta que encontramos la pareja perfecta, el trabajo ideal o el logro definitivo. La autodependencia propone lo contrario: <strong>ya eres completo</strong>. Lo que buscas afuera es un complemento, no una necesidad existencial.</p>

      <h3>La completitud no es perfección</h3>
      <p>Ser completo no significa no tener carencias ni necesidades. Significa aceptar que con lo que eres y tienes en este momento, puedes vivir una vida con sentido. Las carencias son parte de la condición humana — no son defectos que arreglar.</p>

      <h3>La búsqueda de sentido</h3>
      <p>Viktor Frankl, psiquiatra sobreviviente de los campos de concentración nazis, descubrió que las personas que encontraban un <strong>sentido</strong> a su sufrimiento tenían más probabilidad de sobrevivir. Su propuesta: el sentido de la vida no se inventa, se descubre.</p>

      <h3>Tres caminos hacia el sentido (según Frankl)</h3>
      <ol>
        <li><strong>Valores de creación:</strong> Lo que aportas al mundo — tu trabajo, tus proyectos, tu creatividad</li>
        <li><strong>Valores de experiencia:</strong> Lo que recibes del mundo — el amor, el arte, la naturaleza, las relaciones</li>
        <li><strong>Valores de actitud:</strong> La postura que tomas ante el sufrimiento inevitable — aquí reside la libertad última del ser humano</li>
      </ol>

      <h3>Aplicación práctica: Tu declaración de sentido</h3>
      <p>Completa estas frases desde la honestidad:</p>
      <ul>
        <li>"Lo que más me importa en la vida es..."</li>
        <li>"Me siento más vivo/a cuando..."</li>
        <li>"Si pudiera cambiar una cosa del mundo, sería..."</li>
        <li>"Quiero ser recordado/a como alguien que..."</li>
      </ul>
      <p>Estas respuestas son tu brújula. No necesitan ser grandiosas — a veces el sentido más profundo está en lo cotidiano: ser buen padre, hacer bien tu trabajo, cuidar a quien lo necesita.</p>

      <h3>La autodependencia como camino, no como destino</h3>
      <p>No llegas a la autodependencia un día y ya. Es una práctica diaria de elegirte, conocerte, respetarte y encontrar sentido en lo que haces. Algunos días será más fácil que otros — y eso está bien.</p>
    `,
    references: ["Frankl, V. - El hombre en busca de sentido", "Bucay, J. - El camino de la autodependencia", "Yalom, I. - Psicoterapia existencial"],
    durationMinutes: 30
  }
],

// ═══ 3. VALORES HUMANOS EN LA ORGANIZACIÓN ═══
"valores-humanos-organizacion": [
  {
    title: "Los Valores: ¿Qué Son? ¿Cómo los Identifico?",
    description: "Fundamentos de los valores humanos y su papel en la vida personal y profesional",
    contentHtml: `
      <h2>¿Qué son los valores?</h2>
      <p>Los valores son <strong>principios que guían nuestras decisiones, actitudes y comportamientos</strong>. Son las creencias profundas sobre lo que consideramos importante, correcto y deseable. No son lo que decimos que somos — son lo que hacemos cuando nadie nos ve.</p>

      <h3>Características de los valores</h3>
      <ul>
        <li><strong>Son aprendidos:</strong> Los adquirimos de la familia, la cultura, la educación y las experiencias</li>
        <li><strong>Son jerárquicos:</strong> Tenemos valores más importantes que otros — esta jerarquía guía nuestras decisiones</li>
        <li><strong>Son dinámicos:</strong> Pueden evolucionar con el tiempo y las experiencias de vida</li>
        <li><strong>Se demuestran con acciones:</strong> Un valor que no se practica es solo una idea</li>
      </ul>

      <h3>Valores personales vs. valores organizacionales</h3>
      <p>Los <strong>valores personales</strong> son los que tú has construido a lo largo de tu vida. Los <strong>valores organizacionales</strong> son los que la empresa declara como principios rectores. Cuando ambos están alineados, el trabajo se vuelve significativo. Cuando están en conflicto, surge el malestar, la desmotivación y eventualmente la salida.</p>

      <h3>Ejercicio: Identifica tus valores</h3>
      <p>De la siguiente lista, selecciona los 5 que más te representan: Honestidad, Libertad, Familia, Éxito, Justicia, Creatividad, Seguridad, Servicio, Lealtad, Salud, Conocimiento, Respeto, Valentía, Solidaridad, Independencia, Espiritualidad, Diversión, Responsabilidad, Amor, Integridad.</p>
      <p>Ahora ordénalos del 1 al 5. Ese orden revela tu jerarquía de valores actual.</p>
    `,
    references: ["Rokeach, M. - The Nature of Human Values", "Schwartz, S.H. - Teoría de los valores básicos", "Covey, S. - Los 7 hábitos de la gente altamente efectiva"],
    durationMinutes: 25
  },
  {
    title: "Clarificación de Valores",
    description: "Proceso de clarificación personal para alinear valores con acciones cotidianas",
    contentHtml: `
      <h2>Del dicho al hecho</h2>
      <p>Muchas personas dicen valorar la familia pero trabajan 14 horas al día. Dicen valorar la honestidad pero mienten en pequeñas cosas. La clarificación de valores es el proceso de <strong>identificar la brecha entre lo que dices que valoras y lo que realmente haces</strong>.</p>

      <h3>El proceso de clarificación de valores (Louis Raths)</h3>
      <p>Un valor genuino cumple 7 criterios:</p>
      <ol>
        <li><strong>Elegido libremente</strong> — no impuesto por otros</li>
        <li><strong>Elegido entre alternativas</strong> — con conciencia de las opciones</li>
        <li><strong>Elegido después de considerar consecuencias</strong> — con reflexión</li>
        <li><strong>Apreciado y querido</strong> — te sientes bien con esa elección</li>
        <li><strong>Afirmado públicamente</strong> — estás dispuesto a defenderlo</li>
        <li><strong>Actuado de manera consistente</strong> — se refleja en tu conducta</li>
        <li><strong>Actuado de forma repetida</strong> — no es un acto aislado, es un patrón</li>
      </ol>

      <h3>Técnica de clarificación: El test de la crisis</h3>
      <p>Cuando enfrentas una decisión difícil, tus valores reales se revelan. Pregúntate:</p>
      <ul>
        <li>¿Qué haría si nadie me estuviera observando?</li>
        <li>¿Qué decisión me permitiría dormir tranquilo esta noche?</li>
        <li>¿Qué le aconsejaría a mi hijo/a en esta situación?</li>
        <li>¿Cómo me sentiría si esta decisión saliera en el periódico?</li>
      </ul>

      <h3>La coherencia como meta</h3>
      <p>No se trata de ser perfecto — se trata de reducir la distancia entre lo que valoras y lo que haces. Cada vez que actúas en coherencia con tus valores, fortaleces tu autoestima y tu integridad. Cada vez que los traicionas, un pedacito de confianza en ti mismo se erosiona.</p>
    `,
    references: ["Raths, L. - Values and Teaching", "Simon, S. - Values Clarification", "Frankl, V. - El hombre en busca de sentido"],
    durationMinutes: 25
  },
  {
    title: "Mis Prioridades, Mis Valores y Mi Comportamiento",
    description: "Alinear decisiones diarias con la jerarquía personal de valores",
    contentHtml: `
      <h2>Tus prioridades revelan tus valores reales</h2>
      <p>Hay una forma simple de descubrir cuáles son tus valores reales (no los declarados): <strong>observa en qué gastas tu tiempo y tu dinero</strong>. Ahí están tus prioridades verdaderas.</p>

      <h3>El inventario de tiempo</h3>
      <p>Haz un registro honesto de cómo distribuyes tu tiempo en una semana típica:</p>
      <ul>
        <li>¿Cuántas horas dedicas al trabajo?</li>
        <li>¿Cuántas a tu familia y relaciones?</li>
        <li>¿Cuántas a tu salud (ejercicio, alimentación, descanso)?</li>
        <li>¿Cuántas a tu desarrollo personal (lectura, aprendizaje)?</li>
        <li>¿Cuántas a lo que te apasiona?</li>
      </ul>
      <p>Compara esta distribución con los 5 valores que identificaste. ¿Coinciden? Si la familia es tu valor #1 pero le dedicas 2 horas a la semana, hay una brecha que atender.</p>

      <h3>Dilemas de valores en el trabajo</h3>
      <p>En la vida laboral enfrentamos constantemente situaciones donde nuestros valores se ponen a prueba:</p>
      <ul>
        <li>Tu jefe te pide reportar datos inflados → ¿Honestidad o lealtad al jefe?</li>
        <li>Un ascenso requiere mudarte y alejarte de tu familia → ¿Éxito o familia?</li>
        <li>Un compañero comete un error grave → ¿Solidaridad o responsabilidad?</li>
      </ul>
      <p>No hay respuestas universales — lo importante es que <strong>tú</strong> sepas qué valoras más y actúes en consecuencia.</p>

      <h3>Plan de acción: Cerrar la brecha</h3>
      <p>Identifica 3 acciones concretas que puedas hacer esta semana para alinear mejor tu tiempo y comportamiento con tus valores prioritarios.</p>
    `,
    references: ["Covey, S. - Primero lo primero", "Covey, S. - Los 7 hábitos", "Senge, P. - La quinta disciplina"],
    durationMinutes: 25
  },
  {
    title: "El Valor del Trabajo y la Trascendencia",
    description: "Encontrar significado y trascendencia a través del trabajo cotidiano",
    contentHtml: `
      <h2>El trabajo como vehículo de trascendencia</h2>
      <p>Para muchas personas, el trabajo es solo un medio para ganar dinero. Pero cuando lo vemos desde los valores y el sentido de vida, el trabajo puede ser mucho más: puede ser el espacio donde <strong>dejamos huella en el mundo</strong>.</p>

      <h3>Tres formas de vivir el trabajo</h3>
      <ol>
        <li><strong>Como empleo:</strong> Un intercambio de tiempo por dinero. Se vive con indiferencia o resistencia. "Trabajo porque tengo que pagar cuentas."</li>
        <li><strong>Como carrera:</strong> Un camino de crecimiento y logro. Se buscan ascensos y reconocimiento. "Trabajo para crecer profesionalmente."</li>
        <li><strong>Como vocación:</strong> Una expresión de propósito. El trabajo en sí tiene significado. "Trabajo porque esto importa y contribuyo a algo mayor."</li>
      </ol>
      <p>Lo interesante es que <strong>el mismo trabajo puede vivirse de las tres formas</strong>. Un barrendero puede ver su trabajo como empleo ("me pagan por barrer") o como vocación ("mantengo limpia y digna la comunidad donde viven familias").</p>

      <h3>Valores que dan sentido al trabajo</h3>
      <ul>
        <li><strong>Servicio:</strong> Mi trabajo beneficia a otros</li>
        <li><strong>Excelencia:</strong> Hago las cosas lo mejor que puedo, sin importar si alguien me ve</li>
        <li><strong>Contribución:</strong> Soy parte de algo más grande que yo</li>
        <li><strong>Aprendizaje:</strong> Cada día aprendo algo nuevo</li>
        <li><strong>Comunidad:</strong> Construyo relaciones significativas con mis compañeros</li>
      </ul>

      <h3>Trascendencia en la cooperativa</h3>
      <p>En una cooperativa, el trabajo adquiere una dimensión adicional: no trabajas para un patrón, <strong>trabajas contigo mismo y con otros</strong> en un proyecto compartido. Los valores cooperativos — solidaridad, democracia, equidad, responsabilidad — son una base natural para encontrar trascendencia en el trabajo diario.</p>

      <h3>Reflexión final</h3>
      <p>Pregúntate: ¿Qué valor aporto yo con mi trabajo? ¿A quién beneficia lo que hago? ¿Cómo puedo hacer que mi trabajo cotidiano sea más significativo sin cambiar de empleo?</p>
    `,
    references: ["Frankl, V. - El hombre en busca de sentido", "Wrzesniewski, A. - Job Crafting", "Principios cooperativos de la ACI"],
    durationMinutes: 25
  }
],

// ═══ 4. CÓMO ES MI COMUNICACIÓN ═══
"como-es-mi-comunicacion": [
  {
    title: "Estrategias de Comunicación Efectiva",
    description: "Herramientas prácticas para comunicar con claridad, empatía y asertividad",
    contentHtml: `
      <h2>Comunicar no es solo hablar</h2>
      <p>La comunicación efectiva es la habilidad más importante en cualquier entorno laboral. Sin embargo, la mayoría de los conflictos organizacionales tienen su raíz en <strong>problemas de comunicación</strong>: mensajes ambiguos, supuestos no verificados, escucha deficiente o estilos incompatibles.</p>

      <h3>Los 3 estilos de comunicación</h3>
      <ul>
        <li><strong>Pasivo:</strong> Evita expresar necesidades y opiniones. Dice "sí" cuando quiere decir "no". Acumula resentimiento. Frases típicas: "Como tú digas", "No importa", "Está bien" (cuando no lo está).</li>
        <li><strong>Agresivo:</strong> Impone sus necesidades sobre las de otros. No escucha. Usa sarcasmo, gritos o intimidación. Frases típicas: "Porque yo lo digo", "Tú siempre...", "Eso es ridículo".</li>
        <li><strong>Asertivo:</strong> Expresa necesidades y opiniones con respeto. Escucha activamente. Pone límites sin agredir. Frases típicas: "Necesito que...", "Entiendo tu punto y...", "No estoy de acuerdo, y te explico por qué".</li>
      </ul>

      <h3>Los 7 principios de la comunicación efectiva</h3>
      <ol>
        <li><strong>Claridad:</strong> Un mensaje, una idea. Si tu interlocutor necesita preguntar "¿qué quieres decir?", no fuiste claro</li>
        <li><strong>Brevedad:</strong> Di lo necesario, no lo que te haga sentir importante</li>
        <li><strong>Escucha activa:</strong> Escuchar para entender, no para responder</li>
        <li><strong>Empatía:</strong> Ponerte en el lugar del otro antes de hablar</li>
        <li><strong>Retroalimentación:</strong> Verificar que el mensaje fue recibido como lo enviaste</li>
        <li><strong>Congruencia:</strong> Que tu lenguaje verbal, tono y cuerpo digan lo mismo</li>
        <li><strong>Momento adecuado:</strong> El mejor mensaje en el peor momento es inútil</li>
      </ol>

      <h3>La escucha activa: el superpoder subestimado</h3>
      <p>Técnicas de escucha activa: mantener contacto visual, parafrasear ("lo que entiendo es que..."), hacer preguntas abiertas, no interrumpir, y validar emociones ("entiendo que eso te frustre").</p>
    `,
    references: ["Alberti & Emmons - Your Perfect Right (Asertividad)", "Rosenberg, M. - Comunicación No Violenta", "NOM-035-STPS-2018 - Entorno organizacional favorable"],
    durationMinutes: 35
  },
  {
    title: "La Comunicación Interior y los Vínculos",
    description: "Cómo tu diálogo interno afecta tus relaciones y tu comunicación con otros",
    contentHtml: `
      <h2>Primero hablas contigo, luego con el mundo</h2>
      <p>Antes de comunicarte con otros, ya te estás comunicando contigo mismo. Ese <strong>diálogo interior</strong> — la voz en tu cabeza que comenta, juzga, anticipa y narra — determina en gran medida cómo te comunicas con los demás.</p>

      <h3>El diálogo interior: tu primer interlocutor</h3>
      <p>Según investigaciones, una persona tiene entre <strong>12,000 y 60,000 pensamientos al día</strong>. La mayoría son automáticos y repetitivos. Y una buena parte son negativos:</p>
      <ul>
        <li>"No debí decir eso, qué tonto"</li>
        <li>"Seguro piensa que soy incompetente"</li>
        <li>"Para qué opino, nadie me va a escuchar"</li>
        <li>"Siempre me pasa lo mismo"</li>
      </ul>
      <p>Este diálogo interno negativo se filtra en tu comunicación externa: te vuelves inseguro, defensivo, evasivo o reactivo.</p>

      <h3>Cómo tu comunicación interior afecta tus vínculos</h3>
      <ul>
        <li>Si te dices "no soy suficiente" → buscas validación constante de otros</li>
        <li>Si te dices "no puedo confiar en nadie" → te comunicas con desconfianza</li>
        <li>Si te dices "debo ser perfecto" → no toleras errores propios ni ajenos</li>
        <li>Si te dices "lo que pienso no importa" → no expresas tus necesidades</li>
      </ul>

      <h3>Técnica: El observador interno</h3>
      <p>Durante un día, observa tu diálogo interior sin juzgarlo. Solo nota: ¿qué me estoy diciendo? ¿Es verdad? ¿Me ayuda o me limita? ¿Le diría esto a alguien que quiero? Si la respuesta es "no", probablemente tampoco deberías decírtelo a ti mismo.</p>

      <h3>Los vínculos como espejos</h3>
      <p>Las personas que más te irritan o que más admiras están reflejando algo tuyo. El compañero que "siempre quiere tener razón" puede reflejar tu propia necesidad de control. El líder que admiras puede reflejar cualidades que ya tienes pero no has desarrollado. Usar las relaciones como espejo es una herramienta poderosa de autoconocimiento.</p>
    `,
    references: ["Beck, A. - Terapia Cognitiva", "Watzlawick, P. - Teoría de la comunicación humana", "Satir, V. - En contacto íntimo"],
    durationMinutes: 30
  },
  {
    title: "El Lenguaje Interior y los Estados de Ánimo",
    description: "La relación entre lo que te dices, cómo te sientes y cómo actúas",
    contentHtml: `
      <h2>Lo que te dices determina cómo te sientes</h2>
      <p>La psicología cognitiva ha demostrado que <strong>no son las situaciones las que generan nuestras emociones, sino la interpretación que hacemos de ellas</strong>. Dos personas ante el mismo evento pueden sentir cosas completamente diferentes dependiendo de su diálogo interno.</p>

      <h3>El modelo ABC (Albert Ellis)</h3>
      <ul>
        <li><strong>A — Acontecimiento:</strong> Lo que sucede (hechos objetivos)</li>
        <li><strong>B — Belief (Creencia):</strong> Lo que te dices sobre lo que sucedió</li>
        <li><strong>C — Consecuencia emocional:</strong> Lo que sientes y haces</li>
      </ul>
      <p><strong>Ejemplo:</strong> Tu jefe no te saluda al llegar (A). Te dices "seguro está enojado conmigo por algo" (B). Te sientes ansioso y evitas acercarte el resto del día (C). En realidad, tu jefe estaba distraído con un problema personal.</p>

      <h3>Distorsiones cognitivas comunes</h3>
      <ul>
        <li><strong>Catastrofización:</strong> "Esto va a ser un desastre total"</li>
        <li><strong>Personalización:</strong> "Es mi culpa que el proyecto fracasara" (cuando había 20 factores)</li>
        <li><strong>Lectura de mente:</strong> "Sé que piensa que soy inútil" (sin evidencia)</li>
        <li><strong>Generalización:</strong> "SIEMPRE me pasa lo mismo" / "NUNCA me sale bien"</li>
        <li><strong>Filtro negativo:</strong> Ignoras 9 cosas positivas y te enfocas en la 1 negativa</li>
      </ul>

      <h3>Cómo cambiar tu lenguaje interior</h3>
      <ol>
        <li><strong>Detecta</strong> el pensamiento automático negativo</li>
        <li><strong>Cuestiona:</strong> ¿Es verdad? ¿Tengo evidencia? ¿Hay otra explicación posible?</li>
        <li><strong>Reemplaza</strong> con un pensamiento más realista (no positivo forzado, sino equilibrado)</li>
      </ol>
      <p>De "Soy un desastre en presentaciones" a "La última presentación no salió como quería, y puedo prepararme mejor para la siguiente."</p>
    `,
    references: ["Ellis, A. - Razón y emoción en psicoterapia", "Beck, A. - Terapia Cognitiva de la Depresión", "Burns, D. - Sentirse bien"],
    durationMinutes: 30
  },
  {
    title: "Comunicación y Calidad de Vida",
    description: "El impacto de la comunicación en tu bienestar integral y tu entorno",
    contentHtml: `
      <h2>Cómo te comunicas determina cómo vives</h2>
      <p>La calidad de tu comunicación es un reflejo directo de la calidad de tus relaciones. Y la calidad de tus relaciones es uno de los predictores más fuertes de tu bienestar y longevidad — más que el dinero, el estatus o incluso la genética.</p>

      <h3>Comunicación y salud</h3>
      <p>Investigaciones muestran que las personas con relaciones sólidas y comunicación abierta tienen:</p>
      <ul>
        <li>Menor riesgo de enfermedades cardiovasculares</li>
        <li>Mejor sistema inmunológico</li>
        <li>Menor incidencia de depresión y ansiedad</li>
        <li>Mayor esperanza de vida</li>
      </ul>
      <p>Por el contrario, el aislamiento social y la comunicación tóxica son factores de riesgo comparables al tabaquismo.</p>

      <h3>Comunicación en el trabajo y bienestar</h3>
      <p>Pasamos entre 8 y 10 horas diarias en el trabajo. Si esas horas están llenas de comunicación agresiva, mensajes ambiguos, chismes o silencio hostil, el impacto en tu salud es directo. La NOM-035 reconoce exactamente esto: el <strong>liderazgo negativo y las relaciones hostiles</strong> son factores de riesgo psicosocial.</p>

      <h3>Plan de mejora comunicacional</h3>
      <ol>
        <li><strong>Esta semana:</strong> Practica la escucha activa en 3 conversaciones sin interrumpir</li>
        <li><strong>Este mes:</strong> Identifica tu estilo de comunicación predominante (pasivo, agresivo, asertivo) y practica la asertividad en una situación que normalmente evitarías</li>
        <li><strong>Este trimestre:</strong> Transforma tu diálogo interior — detecta al menos 1 distorsión cognitiva diaria y cuestiónala</li>
      </ol>

      <h3>Reflexión final</h3>
      <p>La comunicación es una habilidad que se entrena. Nadie nace siendo un comunicador excepcional. La buena noticia es que cada conversación es una oportunidad de práctica. Empieza hoy: elige una persona con la que quieras mejorar tu comunicación y aplica algo de lo aprendido.</p>
    `,
    references: ["Waldinger, R. - Harvard Study of Adult Development", "NOM-035-STPS-2018", "Goleman, D. - Inteligencia Social"],
    durationMinutes: 30
  }
],

// ═══ 5. RELACIONES HUMANAS ═══
"relaciones-humanas": [
  {
    title: "El Hombre: Un Ser Social",
    description: "La naturaleza social del ser humano y su necesidad de pertenencia",
    contentHtml: `
      <h2>Somos porque nos relacionamos</h2>
      <p>El ser humano es, por naturaleza, un ser social. Desde el nacimiento dependemos de otros para sobrevivir, y a lo largo de la vida nuestras relaciones determinan en gran medida nuestra identidad, bienestar y éxito.</p>

      <h3>La necesidad de pertenencia</h3>
      <p>Abraham Maslow ubicó la <strong>necesidad de pertenencia</strong> en el tercer nivel de su pirámide, justo después de las necesidades básicas y de seguridad. Necesitamos sentirnos parte de algo: una familia, un grupo de amigos, un equipo de trabajo, una comunidad, una cooperativa.</p>

      <h3>¿Qué son las relaciones humanas?</h3>
      <p>Son las interacciones que establecemos con otras personas en diferentes contextos. En el ámbito laboral, incluyen la relación con compañeros, jefes, subordinados, clientes y proveedores. La calidad de estas relaciones afecta directamente la productividad, el clima laboral y la satisfacción personal.</p>

      <h3>Factores que facilitan las relaciones humanas</h3>
      <ul>
        <li><strong>Respeto:</strong> Tratar al otro como persona, no como medio</li>
        <li><strong>Empatía:</strong> La capacidad de entender la perspectiva del otro</li>
        <li><strong>Comunicación abierta:</strong> Expresar y escuchar con honestidad</li>
        <li><strong>Tolerancia:</strong> Aceptar las diferencias sin juzgar</li>
        <li><strong>Cooperación:</strong> Trabajar juntos hacia objetivos comunes</li>
      </ul>

      <h3>Factores que deterioran las relaciones</h3>
      <ul>
        <li>Prejuicios y estereotipos</li>
        <li>Competencia destructiva</li>
        <li>Chismes y comunicación indirecta</li>
        <li>Falta de reconocimiento</li>
        <li>Incumplimiento de compromisos</li>
      </ul>
    `,
    references: ["Maslow, A. - Motivación y personalidad", "Carnegie, D. - Cómo ganar amigos", "NOM-035-STPS-2018 - Entorno organizacional favorable"],
    durationMinutes: 25
  },
  {
    title: "La Personalidad en las Relaciones Humanas",
    description: "Cómo los rasgos de personalidad influyen en nuestras interacciones",
    contentHtml: `
      <h2>Cada persona es un mundo</h2>
      <p>La personalidad es el conjunto de <strong>rasgos, patrones de pensamiento, emociones y conductas</strong> que nos hacen únicos. Entender que cada persona tiene una personalidad distinta es el primer paso para mejorar nuestras relaciones.</p>

      <h3>Temperamentos básicos</h3>
      <p>Aunque cada persona es única, existen patrones generales que nos ayudan a entender las diferencias:</p>
      <ul>
        <li><strong>Extrovertido:</strong> Se energiza con la interacción social, habla antes de pensar, prefiere grupos grandes</li>
        <li><strong>Introvertido:</strong> Se energiza con la soledad y la reflexión, piensa antes de hablar, prefiere interacciones uno a uno</li>
        <li><strong>Orientado a tareas:</strong> Se enfoca en resultados, estructura, eficiencia</li>
        <li><strong>Orientado a personas:</strong> Se enfoca en relaciones, armonía, bienestar grupal</li>
      </ul>

      <h3>Choques de personalidad en el trabajo</h3>
      <p>Los conflictos laborales frecuentemente no son por el "qué" sino por el "cómo": una persona detallista choca con una pragmática; un introvertido se siente invadido por un extrovertido; un orientado a resultados frustra a un orientado a procesos.</p>

      <h3>Clave: Adaptabilidad</h3>
      <p>No puedes cambiar la personalidad de otros, pero puedes <strong>adaptar tu estilo de comunicación</strong> según la persona. Con un detallista, da datos. Con un emocional, conecta primero con sus sentimientos. Con un pragmático, ve al grano. Con un reflexivo, dale tiempo para procesar.</p>

      <h3>Ejercicio</h3>
      <p>Piensa en 3 personas con las que interactúas diario en el trabajo. ¿Cómo describirías su personalidad? ¿Cómo podrías adaptar tu comunicación para relacionarte mejor con cada una?</p>
    `,
    references: ["Jung, C.G. - Tipos psicológicos", "DISC Model - Marston, W.M.", "Goleman, D. - Inteligencia Emocional"],
    durationMinutes: 25
  },
  {
    title: "Apertura de Sí Mismo y Proceso de Comunicación",
    description: "La vulnerabilidad como herramienta de conexión y la ventana de Johari",
    contentHtml: `
      <h2>Abrirte para conectar</h2>
      <p>Las relaciones superficiales se mantienen en la superficie: hablamos del clima, del trabajo, de cosas seguras. Las relaciones significativas requieren <strong>apertura</strong> — la disposición a mostrar quién eres realmente, con tus fortalezas y vulnerabilidades.</p>

      <h3>La Ventana de Johari</h3>
      <p>Este modelo creado por Joseph Luft y Harrington Ingham describe 4 áreas de la personalidad en relación con los demás:</p>
      <ul>
        <li><strong>Área abierta:</strong> Lo que yo sé de mí y los demás también saben (nombre, rol, habilidades visibles)</li>
        <li><strong>Área ciega:</strong> Lo que los demás ven de mí pero yo no veo (hábitos inconscientes, impacto que genero)</li>
        <li><strong>Área oculta:</strong> Lo que yo sé de mí pero los demás no saben (miedos, inseguridades, sueños)</li>
        <li><strong>Área desconocida:</strong> Lo que ni yo ni los demás conocemos (potencial sin descubrir)</li>
      </ul>

      <h3>Cómo expandir el área abierta</h3>
      <ol>
        <li><strong>Auto-revelación:</strong> Comparte gradualmente cosas de tu área oculta → Genera confianza y cercanía</li>
        <li><strong>Retroalimentación:</strong> Pide y acepta feedback sobre tu área ciega → Genera autoconocimiento</li>
      </ol>

      <h3>Riesgos y beneficios de la apertura</h3>
      <p><strong>Riesgos:</strong> Vulnerabilidad, posibilidad de que alguien use esa información en tu contra, sentirse expuesto.</p>
      <p><strong>Beneficios:</strong> Relaciones más profundas, mayor confianza, mejor trabajo en equipo, reducción de malentendidos, autenticidad.</p>

      <h3>La regla de la apertura gradual</h3>
      <p>No necesitas contar tu vida entera al primer encuentro. La apertura es como quitar capas de una cebolla: empiezas con lo superficial y vas profundizando conforme la confianza se construye. En el trabajo, esto significa pasar de "bien, gracias" a conversaciones genuinas donde compartes opiniones, preocupaciones y aspiraciones reales.</p>
    `,
    references: ["Luft, J. & Ingham, H. - The Johari Window", "Brené Brown - El poder de la vulnerabilidad", "Rogers, C. - El proceso de convertirse en persona"],
    durationMinutes: 25
  },
  {
    title: "Construyendo Relaciones Laborales Saludables",
    description: "Aplicación práctica para mejorar las relaciones en el entorno de trabajo",
    contentHtml: `
      <h2>De la teoría a la práctica</h2>
      <p>Conocer la teoría de las relaciones humanas es el primer paso. Aplicarla todos los días en tu centro de trabajo es el verdadero reto. Este módulo integra todo lo aprendido en un plan de acción concreto.</p>

      <h3>Las 5 prácticas diarias para relaciones laborales sanas</h3>
      <ol>
        <li><strong>Saluda con intención:</strong> Un "buenos días" con contacto visual y genuino interés es diferente a un murmullo distraído. Pequeños gestos construyen grandes relaciones</li>
        <li><strong>Practica el reconocimiento:</strong> Reconoce el esfuerzo y logros de tus compañeros. Un "gracias por tu apoyo en esto" o "noté que hiciste un excelente trabajo" fortalece vínculos</li>
        <li><strong>Maneja los conflictos en el momento:</strong> No acumules resentimientos. Aborda las diferencias de forma directa, respetuosa y oportuna</li>
        <li><strong>Ofrece ayuda sin esperar reciprocidad:</strong> La cooperación genuina construye un ambiente de confianza</li>
        <li><strong>Respeta los límites:</strong> De tiempo, de espacio, de opiniones. No todos quieren socializar al mismo nivel que tú — y eso está bien</li>
      </ol>

      <h3>Protocolo para relaciones difíciles</h3>
      <p>Siempre habrá personas con las que te cueste relacionarte. Para esos casos:</p>
      <ul>
        <li>Mantén la relación profesional — no necesitas ser amigo de todos</li>
        <li>Enfócate en el objetivo compartido, no en las diferencias personales</li>
        <li>No participes en chismes ni triangulaciones</li>
        <li>Si el conflicto escala, busca mediación formal</li>
      </ul>

      <h3>Relaciones en la cooperativa</h3>
      <p>En una cooperativa, las relaciones humanas son aún más importantes porque <strong>todos son socios</strong>. No hay un jefe que imponga — la convivencia se construye por acuerdo. Esto requiere más madurez relacional, más comunicación y más disposición a resolver diferencias de forma democrática.</p>

      <h3>Compromiso personal</h3>
      <p>Escribe 3 acciones concretas que te comprometes a hacer a partir de mañana para mejorar tus relaciones en el trabajo. Compártelas con alguien de confianza que pueda recordártelas.</p>
    `,
    references: ["Carnegie, D. - Cómo ganar amigos", "NOM-035-STPS-2018", "Principios cooperativos ACI"],
    durationMinutes: 25
  }
],

// ═══ 6. AUTOESTIMA ═══
"autoestima": [
  {
    title: "Autoestima como Marco de Referencia",
    description: "La autoestima como lente a través del cual interpretamos el mundo y nos proyectamos",
    contentHtml: `
      <h2>Cómo te ves determina cómo vives</h2>
      <p>La autoestima es la <strong>valoración que haces de ti mismo</strong>. No es lo que otros piensan de ti, ni tus logros acumulados, ni tu apariencia. Es la opinión profunda que tienes sobre tu propio valor como persona. Y esa opinión afecta absolutamente todo: cómo trabajas, cómo te relacionas, qué oportunidades tomas y cuáles dejas pasar.</p>

      <h3>La autoestima como marco de referencia</h3>
      <p>Nathaniel Branden define la autoestima como la disposición a saberse <strong>competente para enfrentar los desafíos de la vida</strong> y <strong>merecedor de la felicidad</strong>. Es decir, tiene dos componentes:</p>
      <ul>
        <li><strong>Autoeficacia:</strong> "Puedo" — La confianza en tu capacidad para pensar, aprender y resolver</li>
        <li><strong>Autodignidad:</strong> "Merezco" — La convicción de que mereces respeto, amor y bienestar</li>
      </ul>

      <h3>Cómo la autoestima se refleja en el trabajo</h3>
      <ul>
        <li><strong>Alta autoestima:</strong> Aceptas retos, pides retroalimentación, reconoces errores sin destruirte, pones límites, celebras logros propios y ajenos</li>
        <li><strong>Baja autoestima:</strong> Evitas retos por miedo al fracaso, te comparas constantemente, necesitas validación externa, aceptas trato que no mereces, saboteas tus propios éxitos</li>
      </ul>

      <h3>Los 6 pilares de la autoestima (Nathaniel Branden)</h3>
      <ol>
        <li><strong>Vivir conscientemente:</strong> Estar presente y atento a tu realidad</li>
        <li><strong>Aceptarse a uno mismo:</strong> No resignación, sino reconocimiento honesto</li>
        <li><strong>Responsabilidad personal:</strong> Ser autor de tu vida, no víctima</li>
        <li><strong>Autoafirmación:</strong> Respetar tus necesidades y valores</li>
        <li><strong>Vivir con propósito:</strong> Tener metas y trabajar hacia ellas</li>
        <li><strong>Integridad personal:</strong> Alinear acciones con valores</li>
      </ol>
    `,
    references: ["Branden, N. - Los seis pilares de la autoestima", "Rosenberg, M. - Society and the Adolescent Self-Image", "Rogers, C. - El proceso de convertirse en persona"],
    durationMinutes: 30
  },
  {
    title: "Autoestima Alta y Baja",
    description: "Características, manifestaciones y consecuencias de cada nivel de autoestima",
    contentHtml: `
      <h2>Reconocer dónde estás</h2>
      <p>La autoestima no es binaria — no eres "alta autoestima" o "baja autoestima" como un interruptor. Es un <strong>espectro que fluctúa</strong> según las circunstancias, las etapas de vida y las áreas. Puedes tener alta autoestima profesional pero baja autoestima en relaciones, o viceversa.</p>

      <h3>Señales de autoestima saludable</h3>
      <ul>
        <li>Te tratas con respeto y compasión</li>
        <li>Reconoces tus fortalezas sin arrogancia y tus debilidades sin vergüenza</li>
        <li>Puedes decir "no" sin culpa excesiva</li>
        <li>No necesitas la aprobación constante de otros para sentirte bien</li>
        <li>Aceptas la crítica constructiva sin sentir que te destruyen</li>
        <li>Celebras los éxitos de otros sin sentirte amenazado</li>
        <li>Te permites cometer errores y aprender de ellos</li>
      </ul>

      <h3>Señales de autoestima deteriorada</h3>
      <ul>
        <li>Autocrítica implacable: "Soy un desastre", "Todo lo hago mal"</li>
        <li>Comparación constante con otros (y siempre sales perdiendo)</li>
        <li>Dificultad para recibir cumplidos: "No, no es para tanto"</li>
        <li>Perfeccionismo paralizante: si no es perfecto, no sirve</li>
        <li>Necesidad de control excesivo (porque no confías en ti)</li>
        <li>Relaciones donde permites trato que no mereces</li>
        <li>Sabotaje: cuando algo va bien, haces algo para arruinarlo</li>
      </ul>

      <h3>Importante: autoestima alta ≠ narcisismo</h3>
      <p>La autoestima saludable es silenciosa y firme. No necesita presumir ni menospreciar a otros. El narcisismo es una máscara de seguridad que esconde una profunda inseguridad. La persona con autoestima genuina no necesita demostrar nada — simplemente actúa desde la confianza en su valor.</p>

      <h3>Ejercicio de reflexión</h3>
      <p>En una escala del 1 al 10, ¿cómo calificarías tu autoestima en estas áreas: profesional, relaciones, aspecto físico, intelectual, como padre/madre (si aplica)? ¿Dónde está tu fortaleza y dónde tu área de oportunidad?</p>
    `,
    references: ["Branden, N. - Los seis pilares de la autoestima", "Brown, B. - Los dones de la imperfección", "Ellis, A. - Cómo controlar la ansiedad antes de que le controle a usted"],
    durationMinutes: 25
  },
  {
    title: "Concepto de Sí Mismo",
    description: "Cómo se forma el autoconcepto y cómo transformarlo positivamente",
    contentHtml: `
      <h2>La imagen que tienes de ti</h2>
      <p>El <strong>autoconcepto</strong> es la imagen mental que tienes de ti mismo — quién crees que eres. Es más amplio que la autoestima: incluye tus creencias sobre tus capacidades, tu personalidad, tu rol social y tu cuerpo.</p>

      <h3>¿Cómo se forma el autoconcepto?</h3>
      <ol>
        <li><strong>Espejo de los demás:</strong> De niños, nos vemos a través de los ojos de nuestros padres y figuras significativas. Si nos dijeron "eres inteligente" o "eres un inútil", esas palabras se convirtieron en creencias</li>
        <li><strong>Experiencias de éxito y fracaso:</strong> Cada logro refuerza la creencia "puedo" y cada fracaso no procesado refuerza "no puedo"</li>
        <li><strong>Comparación social:</strong> Nos medimos contra otros y construimos una imagen relativa</li>
        <li><strong>Rol social:</strong> Los roles que desempeñamos (padre, profesional, amigo) moldean nuestra identidad</li>
      </ol>

      <h3>Creencias limitantes vs. creencias potenciadoras</h3>
      <ul>
        <li>"No soy bueno para hablar en público" → <strong>Limitante</strong> → Te impide crecer</li>
        <li>"Estoy aprendiendo a comunicarme mejor" → <strong>Potenciadora</strong> → Te abre posibilidades</li>
        <li>"A mi edad ya no se puede cambiar" → <strong>Limitante</strong></li>
        <li>"Cada día puedo aprender algo nuevo" → <strong>Potenciadora</strong></li>
      </ul>

      <h3>Cómo transformar tu autoconcepto</h3>
      <ol>
        <li><strong>Identifica la creencia:</strong> ¿Qué creo sobre mí que me limita?</li>
        <li><strong>Cuestiona su origen:</strong> ¿De dónde viene? ¿Quién me lo dijo? ¿Es un hecho o una interpretación?</li>
        <li><strong>Busca evidencia contraria:</strong> ¿Alguna vez logré algo que contradice esa creencia?</li>
        <li><strong>Reformula:</strong> Construye una creencia más realista y funcional</li>
        <li><strong>Actúa en consecuencia:</strong> Haz algo pequeño que sea coherente con la nueva creencia</li>
      </ol>

      <h3>Ejercicio final: Carta a ti mismo</h3>
      <p>Escribe una carta breve a ti mismo reconociendo 5 cosas que valoras de ti, 3 logros que te enorgullecen, y 1 compromiso de mejora. Léela cuando tu autoestima flaquee.</p>
    `,
    references: ["Branden, N. - Los seis pilares de la autoestima", "Bandura, A. - Self-Efficacy", "Beck, A. - Terapia Cognitiva"],
    durationMinutes: 30
  },
  {
    title: "Autoestima en el Entorno Laboral",
    description: "Cómo fortalecer la autoestima para un mejor desempeño y bienestar en el trabajo",
    contentHtml: `
      <h2>Tu valor no depende de tu puesto</h2>
      <p>En el mundo laboral es fácil confundir <strong>valor personal con desempeño laboral</strong>. Si me va bien en el trabajo, valgo. Si me despiden o me critican, no valgo. Esta trampa destruye la autoestima de millones de personas.</p>

      <h3>Separar identidad de rol</h3>
      <p>Tú no ERES tu trabajo. Tú HACES un trabajo. Cuando te despiden, no se borran tus habilidades, tu experiencia ni tu valor como persona. Cuando te ascienden, no eres "mejor persona" — eres la misma persona con más responsabilidades.</p>

      <h3>Cómo los líderes afectan la autoestima del equipo</h3>
      <ul>
        <li><strong>Líderes que construyen:</strong> Reconocen logros, dan retroalimentación constructiva, confían, empoderan, respetan</li>
        <li><strong>Líderes que destruyen:</strong> Critican en público, microgerencian, ignoran esfuerzos, humillan, comparan</li>
      </ul>
      <p>Si eres líder, recuerda: cada interacción con tu equipo construye o erosiona su autoestima. Esa responsabilidad es enorme.</p>

      <h3>Prácticas para fortalecer tu autoestima laboral</h3>
      <ol>
        <li><strong>Lleva un registro de logros:</strong> Apunta cada semana algo que hiciste bien. Cuando dudes de ti, revísalo</li>
        <li><strong>Pide retroalimentación proactivamente:</strong> No esperes a la evaluación anual. Pregunta: "¿Qué hago bien? ¿Qué puedo mejorar?"</li>
        <li><strong>Celebra tus avances:</strong> No solo los grandes logros — también los pequeños pasos</li>
        <li><strong>Establece límites:</strong> No aceptes trato irrespetuoso, sin importar el nivel jerárquico de quien lo haga</li>
        <li><strong>Invierte en tu desarrollo:</strong> Tomar este curso ya es un acto de autoestima — estás invirtiendo en ti</li>
      </ol>

      <h3>Compromiso</h3>
      <p>Escribe 1 acción concreta que vas a implementar esta semana para cuidar tu autoestima en el trabajo.</p>
    `,
    references: ["Branden, N. - La autoestima en el trabajo", "NOM-035-STPS-2018", "Goleman, D. - Inteligencia Emocional"],
    durationMinutes: 25
  }
],

// ═══ 7. MANEJO DE CONFLICTOS Y TOMA DE DECISIONES ═══
// (Ya desarrollado como Template B completo)
"manejo-conflictos-toma-decisiones": [
  {
    title: "Trascendencia de las Decisiones",
    description: "Impacto de las decisiones en la organización, sesgos cognitivos y factores emocionales",
    contentHtml: `
      <h2>Las decisiones importan más de lo que crees</h2>
      <p>Tomamos cientos de decisiones diarias. En el contexto laboral, una sola decisión mal tomada puede afectar a decenas de personas, desperdiciar recursos, o generar conflictos que tardan meses en resolverse.</p>

      <h3>Niveles de decisión</h3>
      <ul>
        <li><strong>Estratégicas:</strong> Alta dirección, largo plazo, alta incertidumbre (ej: abrir nueva línea de negocio)</li>
        <li><strong>Tácticas:</strong> Mandos medios, mediano plazo (ej: redistribuir presupuesto)</li>
        <li><strong>Operativas:</strong> Supervisores, corto plazo (ej: asignar turnos)</li>
      </ul>

      <h3>Sesgos cognitivos que distorsionan nuestras decisiones</h3>
      <ul>
        <li><strong>Confirmación:</strong> Buscamos solo info que confirme lo que ya creemos</li>
        <li><strong>Anclaje:</strong> Damos demasiado peso a la primera información recibida</li>
        <li><strong>Status quo:</strong> Preferimos no cambiar aunque el cambio sea mejor</li>
        <li><strong>Efecto manada:</strong> Decidimos según lo que hacen los demás</li>
        <li><strong>Disponibilidad:</strong> Juzgamos probabilidad por lo fácil que recordamos ejemplos</li>
      </ul>

      <h3>El papel de las emociones</h3>
      <p>Las emociones no son enemigas de las buenas decisiones, pero necesitan gestionarse: el miedo paraliza o precipita, el enojo lleva a decisiones impulsivas, el entusiasmo excesivo nos ciega ante riesgos, y la ansiedad nos hace evitar decidir.</p>
    `,
    references: ["Kahneman, D. - Pensar rápido, pensar despacio", "Ariely, D. - Las trampas del deseo", "Simon, H. - Racionalidad limitada"],
    durationMinutes: 35
  },
  {
    title: "El Proceso Decisional: Fases y Etapas",
    description: "Modelo de 7 pasos para tomar decisiones estructuradas y efectivas",
    contentHtml: `
      <h2>Decidir es un proceso, no un instante</h2>
      <p>Un proceso estructurado mejora dramáticamente la calidad de las decisiones.</p>

      <h3>Los 7 pasos</h3>
      <ol>
        <li><strong>Identificar el problema:</strong> Usa la técnica de los "5 Porqués" para llegar a la causa raíz</li>
        <li><strong>Establecer criterios:</strong> ¿Qué es importante? (costo, tiempo, calidad, riesgo, impacto en equipo)</li>
        <li><strong>Ponderar criterios:</strong> Asigna peso relativo del 1 al 10</li>
        <li><strong>Generar alternativas:</strong> Mínimo 3. Usa lluvia de ideas, benchmarks, consulta con expertos</li>
        <li><strong>Evaluar con matriz de decisión:</strong> Califica cada alternativa contra cada criterio ponderado</li>
        <li><strong>Seleccionar:</strong> La matriz guía, pero también considera tu intuición informada y factores cualitativos</li>
        <li><strong>Implementar y evaluar:</strong> Define quién, cuándo, cómo medir, y cuál es el Plan B</li>
      </ol>

      <h3>Técnica de los 5 Porqués (ejemplo)</h3>
      <p>Problema: La producción se retrasó → ¿Por qué? La máquina paró → ¿Por qué? Se sobrecalentó → ¿Por qué? Falló el enfriamiento → ¿Por qué? No hubo mantenimiento → ¿Por qué? No hay calendario de mantenimiento. <strong>Causa raíz encontrada.</strong></p>

      <h3>Regla de oro</h3>
      <p>Nunca te quedes con la primera opción que aparece. Genera al menos 3 alternativas antes de decidir. La primera idea rara vez es la mejor — es solo la más obvia.</p>
    `,
    references: ["Kepner & Tregoe - El nuevo directivo racional", "De Bono, E. - Seis sombreros para pensar", "Hammond, Keeney & Raiffa - Smart Choices"],
    durationMinutes: 35
  },
  {
    title: "Manejo de Conflictos en el Contexto Institucional",
    description: "Estilos de manejo de conflictos, comunicación no violenta y protocolos de resolución",
    contentHtml: `
      <h2>El conflicto no es el enemigo</h2>
      <p>Los conflictos son inevitables en cualquier organización. Lo que marca la diferencia es cómo los gestionamos. Un conflicto bien manejado puede fortalecer relaciones y generar mejores soluciones.</p>

      <h3>5 Estilos de Thomas-Kilmann</h3>
      <ul>
        <li><strong>Competir (ganar-perder):</strong> Útil en emergencias. Riesgo: daña relaciones</li>
        <li><strong>Colaborar (ganar-ganar):</strong> Ideal para problemas complejos. Requiere tiempo</li>
        <li><strong>Compromiso:</strong> Ambos ceden algo. Útil bajo presión de tiempo</li>
        <li><strong>Evitar:</strong> Útil si el conflicto es trivial o las emociones están muy altas</li>
        <li><strong>Ceder:</strong> Útil cuando la relación importa más que el tema</li>
      </ul>

      <h3>Comunicación No Violenta (Marshall Rosenberg)</h3>
      <p>Estructura: "Cuando [conducta observada], me siento [emoción], porque necesito [necesidad]. ¿Estarías dispuesto/a a [petición concreta]?"</p>
      <p>Ejemplo: "Cuando las entregas llegan después de la fecha, me siento presionado porque necesito cumplir con el cliente. ¿Podrías avisarme con 3 días de anticipación si habrá retraso?"</p>

      <h3>Protocolo de resolución organizacional</h3>
      <ol>
        <li>Reconocer el conflicto (no ignorarlo)</li>
        <li>Separar personas de problemas</li>
        <li>Escuchar activamente a todas las partes</li>
        <li>Identificar intereses subyacentes (no posiciones)</li>
        <li>Generar opciones de solución conjuntamente</li>
        <li>Evaluar y acordar</li>
        <li>Documentar y dar seguimiento</li>
      </ol>
    `,
    references: ["Thomas, K. & Kilmann, R. - Conflict Mode Instrument", "Rosenberg, M. - Comunicación No Violenta", "Fisher & Ury - Getting to Yes"],
    durationMinutes: 35
  },
  {
    title: "Aplicación Práctica: Casos y Herramientas",
    description: "Casos de estudio y herramientas aplicables para resolver conflictos y tomar decisiones",
    contentHtml: `
      <h2>De la teoría a la acción</h2>

      <h3>Caso 1: El presupuesto disputado</h3>
      <p>Dos áreas de tu cooperativa necesitan el mismo presupuesto limitado: Producción quiere comprar maquinaria nueva y Ventas quiere invertir en marketing digital. El comité debe decidir.</p>
      <p><strong>Aplica:</strong> Matriz de decisión con criterios ponderados (ROI, urgencia, impacto en socios, riesgo). ¿Qué alternativa gana? ¿Existe una tercera opción (phasing, financiamiento)?</p>

      <h3>Caso 2: El conflicto entre turnos</h3>
      <p>El turno matutino se queja de que el turno vespertino deja el área desordenada. El turno vespertino dice que tienen más carga de trabajo. La tensión crece.</p>
      <p><strong>Aplica:</strong> CNV para expresar el problema. Identifica intereses (ambos quieren condiciones dignas). Genera soluciones conjuntas (checklist de entrega de turno, redistribución de carga).</p>

      <h3>Caso 3: La decisión impopular</h3>
      <p>Como líder, debes reducir horas extras (la cooperativa no puede pagarlas). El equipo depende de ese ingreso adicional. ¿Cómo comunicas y decides?</p>
      <p><strong>Aplica:</strong> Modelo Vroom-Yetton (la aceptación es crucial → involucra al equipo). Transparencia sobre la situación financiera. Genera alternativas conjuntas para compensar.</p>

      <h3>Herramientas descargables para tu día a día</h3>
      <ul>
        <li>Plantilla de Matriz de Decisión (Excel/papel)</li>
        <li>Formato de 5 Porqués para análisis de causa raíz</li>
        <li>Guía rápida de los 5 estilos de Thomas-Kilmann</li>
        <li>Protocolo de resolución de conflictos (paso a paso)</li>
      </ul>

      <h3>Compromiso final</h3>
      <p>Identifica 1 decisión pendiente y 1 conflicto activo en tu trabajo. Aplica las herramientas de este curso a ambos esta semana. Documenta el proceso y el resultado.</p>
    `,
    references: ["Harvard Business Review - Gestión de conflictos", "PMI - Habilidades interpersonales del PM", "LFT - Condiciones de trabajo"],
    durationMinutes: 35
  }
],

// ═══ 8. INTEGRACIÓN DE GRUPOS Y EL EQUIPO ═══
"integracion-grupos-equipo": [
  {
    title: "Tipos de Grupos y el Equipo",
    description: "Diferencias entre grupo y equipo, tipos de grupos y etapas de formación",
    contentHtml: `
      <h2>No todo grupo es un equipo</h2>
      <p>Un <strong>grupo</strong> es un conjunto de personas que comparten un espacio o actividad. Un <strong>equipo</strong> es un grupo con un objetivo compartido, roles complementarios y responsabilidad mutua. La diferencia es enorme.</p>

      <h3>Grupo vs. Equipo</h3>
      <ul>
        <li><strong>Grupo:</strong> Líder designado, responsabilidad individual, resultado individual, reuniones informativas</li>
        <li><strong>Equipo:</strong> Liderazgo compartido, responsabilidad mutua, resultado colectivo, reuniones de trabajo colaborativo</li>
      </ul>

      <h3>Tipos de grupos en la organización</h3>
      <ul>
        <li><strong>Formales:</strong> Creados por la organización con un propósito específico (comités, departamentos, brigadas)</li>
        <li><strong>Informales:</strong> Surgen espontáneamente por afinidad (grupo del café, amigos del almuerzo)</li>
        <li><strong>Funcionales:</strong> Misma área o especialidad</li>
        <li><strong>Multifuncionales:</strong> Diferentes áreas trabajando en un proyecto</li>
        <li><strong>Autogestionados:</strong> Sin jefe formal — deciden y organizan su trabajo (muy relevante en cooperativas)</li>
      </ul>

      <h3>Etapas de formación de un equipo (Tuckman)</h3>
      <ol>
        <li><strong>Formación:</strong> Los miembros se conocen, hay cortesía pero también incertidumbre</li>
        <li><strong>Tormenta:</strong> Surgen conflictos, choques de personalidad, luchas por liderazgo</li>
        <li><strong>Normalización:</strong> Se establecen normas, roles claros y confianza</li>
        <li><strong>Desempeño:</strong> El equipo funciona con fluidez, alta productividad</li>
        <li><strong>Disolución:</strong> El equipo cumple su objetivo y se disuelve (en equipos temporales)</li>
      </ol>
      <p>La etapa de <strong>tormenta</strong> es la más incómoda pero la más importante. Los equipos que la evitan nunca llegan al desempeño real.</p>
    `,
    references: ["Tuckman, B. - Developmental sequence in small groups", "Katzenbach & Smith - The Wisdom of Teams", "Lencioni, P. - Las cinco disfunciones de un equipo"],
    durationMinutes: 30
  },
  {
    title: "Dinámica Grupal",
    description: "Fuerzas que operan dentro de los grupos: roles, normas, cohesión y conflicto",
    contentHtml: `
      <h2>Lo que pasa dentro del grupo</h2>
      <p>Todo grupo tiene una vida interna que no siempre se ve: alianzas, rivalidades, normas no escritas, roles asumidos sin que nadie los asigne. Entender esta dinámica es clave para quien quiere integrar y gestionar equipos.</p>

      <h3>Roles en el grupo (Belbin)</h3>
      <p>Meredith Belbin identificó 9 roles que naturalmente se distribuyen en los equipos:</p>
      <ul>
        <li><strong>Roles de acción:</strong> Implementador (estructura), Impulsor (energía), Finalizador (atención al detalle)</li>
        <li><strong>Roles sociales:</strong> Coordinador (facilita), Cohesionador (armoniza), Investigador de recursos (conecta con el exterior)</li>
        <li><strong>Roles mentales:</strong> Cerebro (ideas creativas), Monitor-evaluador (análisis crítico), Especialista (conocimiento técnico)</li>
      </ul>
      <p>Un equipo efectivo necesita diversidad de roles. Si todos son "cerebros", habrá muchas ideas y poca ejecución.</p>

      <h3>Normas grupales</h3>
      <p>Todo grupo desarrolla normas — reglas implícitas o explícitas sobre cómo comportarse. Algunas son productivas ("aquí empezamos puntuales") y otras son tóxicas ("aquí no se cuestiona al jefe"). El líder debe identificar y reforzar las normas productivas y desafiar las tóxicas.</p>

      <h3>Cohesión grupal</h3>
      <p>La cohesión es la fuerza que mantiene unido al grupo. Se construye con:</p>
      <ul>
        <li>Objetivos compartidos y claros</li>
        <li>Éxitos celebrados juntos</li>
        <li>Comunicación abierta y frecuente</li>
        <li>Confianza entre los miembros</li>
        <li>Identidad grupal ("somos el equipo de...")</li>
      </ul>

      <h3>El pensamiento grupal (Groupthink)</h3>
      <p>Cuidado: demasiada cohesión puede generar <strong>pensamiento grupal</strong> — cuando el grupo valora tanto la armonía que evita cuestionar, disentir o considerar alternativas. Resultado: decisiones malas que nadie se atrevió a cuestionar.</p>
    `,
    references: ["Belbin, M. - Team Roles at Work", "Janis, I. - Groupthink", "Lewin, K. - Field Theory in Social Science"],
    durationMinutes: 30
  },
  {
    title: "Manejo de Grupos",
    description: "Técnicas y herramientas para facilitar, motivar y gestionar grupos de trabajo",
    contentHtml: `
      <h2>El arte de facilitar</h2>
      <p>Manejar un grupo no es controlarlo — es <strong>facilitar que logre su objetivo</strong>. Un buen facilitador crea las condiciones para que el equipo funcione, interviene cuando es necesario, y se retira cuando el equipo fluye solo.</p>

      <h3>Técnicas de facilitación grupal</h3>
      <ol>
        <li><strong>Check-in inicial:</strong> Empezar reuniones con una pregunta breve que conecte al grupo ("¿cómo llegas hoy?" o "¿qué esperas de esta sesión?")</li>
        <li><strong>Reglas del juego:</strong> Establecer acuerdos de convivencia al inicio (respetar turnos, celulares en silencio, lo que se dice aquí se queda aquí)</li>
        <li><strong>Lluvia de ideas estructurada:</strong> Primero generar sin juzgar, luego evaluar y priorizar</li>
        <li><strong>Rondas de opinión:</strong> Dar voz a todos, no solo a los más extrovertidos</li>
        <li><strong>Parking lot:</strong> Anotar temas que surgen pero no son del momento para atenderlos después</li>
        <li><strong>Check-out:</strong> Cerrar con "¿qué te llevas?" o "¿qué acuerdos tenemos?"</li>
      </ol>

      <h3>Manejo de situaciones difíciles en grupos</h3>
      <ul>
        <li><strong>El que habla mucho:</strong> "Gracias por tu aporte, me gustaría escuchar también a los demás"</li>
        <li><strong>El que no habla:</strong> "María, ¿cuál es tu perspectiva sobre esto?"</li>
        <li><strong>El que siempre está en contra:</strong> "Entiendo tu preocupación. ¿Qué alternativa propones?"</li>
        <li><strong>El que desvía el tema:</strong> "Interesante punto, lo anoto en el parking lot. Volvamos al tema"</li>
        <li><strong>Dos que chocan:</strong> "Veo que hay perspectivas diferentes. Escuchemos una a la vez"</li>
      </ul>

      <h3>Motivación grupal</h3>
      <p>Un equipo motivado no necesita supervisión constante. Las claves: propósito claro (¿para qué hacemos esto?), autonomía (confiar en que el equipo puede), reconocimiento (celebrar logros), y desarrollo (oportunidades de aprendizaje).</p>
    `,
    references: ["Schwarz, R. - The Skilled Facilitator", "Hackman, R. - Leading Teams", "Pink, D. - Drive: La sorprendente verdad sobre qué nos motiva"],
    durationMinutes: 30
  },
  {
    title: "Integración Práctica en la Cooperativa",
    description: "Aplicación de técnicas de integración en el contexto cooperativo",
    contentHtml: `
      <h2>Equipos en la cooperativa: un caso especial</h2>
      <p>Las cooperativas son un contexto único para la integración de equipos porque <strong>todos son socios</strong>. No hay un jefe que mande — hay una asamblea que decide, un consejo que coordina, y equipos que ejecutan. Esto requiere más habilidades de integración, no menos.</p>

      <h3>Retos específicos de los equipos cooperativos</h3>
      <ul>
        <li>Toma de decisiones democrática puede ser más lenta</li>
        <li>El doble rol de "trabajador" y "dueño" genera tensiones</li>
        <li>La igualdad formal no elimina las dinámicas informales de poder</li>
        <li>El compromiso desigual ("unos trabajan más que otros") genera resentimiento</li>
      </ul>

      <h3>Dinámicas de integración recomendadas</h3>
      <ol>
        <li><strong>Sesión de alineación trimestral:</strong> ¿Cuáles son nuestros objetivos compartidos? ¿Cómo va cada equipo? ¿Qué necesitamos unos de otros?</li>
        <li><strong>Rotación de roles:</strong> Permitir que los socios conozcan diferentes áreas genera empatía y entendimiento</li>
        <li><strong>Retrospectivas mensuales:</strong> ¿Qué funcionó? ¿Qué no? ¿Qué cambiamos?</li>
        <li><strong>Espacios de convivencia:</strong> No todo puede ser trabajo — los vínculos se fortalecen en espacios informales</li>
      </ol>

      <h3>Herramientas para evaluar la salud de tu equipo</h3>
      <p>Las 5 disfunciones de un equipo (Lencioni):</p>
      <ol>
        <li>Ausencia de <strong>confianza</strong></li>
        <li>Temor al <strong>conflicto</strong></li>
        <li>Falta de <strong>compromiso</strong></li>
        <li>Evasión de <strong>responsabilidad</strong></li>
        <li>Desatención a los <strong>resultados</strong></li>
      </ol>
      <p>Si identificas alguna de estas disfunciones en tu equipo, ahí está tu punto de partida para mejorar.</p>

      <h3>Ejercicio final</h3>
      <p>Evalúa a tu equipo actual contra las 5 disfunciones (escala 1-5). Identifica la disfunción más crítica y diseña 3 acciones concretas para abordarla en las próximas 4 semanas.</p>
    `,
    references: ["Lencioni, P. - Las cinco disfunciones de un equipo", "Principios cooperativos ACI", "LFT - Cooperativas de trabajo"],
    durationMinutes: 30
  }
],

// ═══ 9. PLANEACIÓN DE VIDA Y TRABAJO ═══
"planeacion-vida-trabajo": [
  {
    title: "Necesidad de una Planeación Significativa de Vida y Trabajo",
    description: "Por qué es crucial tener un plan de vida y cómo integrarlo con tu carrera",
    contentHtml: `
      <h2>¿A dónde vas?</h2>
      <p>Si no sabes a dónde vas, cualquier camino te lleva. Muchas personas llegan a los 40 o 50 años y se preguntan: "¿Cómo llegué aquí? ¿Esto es lo que quería?" La planeación de vida y trabajo no es un lujo — es una <strong>necesidad para vivir con propósito</strong>.</p>

      <h3>¿Por qué planear?</h3>
      <ul>
        <li>Da dirección y sentido a tus decisiones cotidianas</li>
        <li>Reduce la ansiedad ante la incertidumbre</li>
        <li>Te ayuda a decir "no" a lo que no está alineado con tus metas</li>
        <li>Convierte sueños vagos en objetivos concretos</li>
        <li>Integra las diferentes dimensiones de tu vida (no solo el trabajo)</li>
      </ul>

      <h3>Las 6 dimensiones de una vida plena</h3>
      <ol>
        <li><strong>Profesional/Laboral:</strong> Tu trabajo, tu carrera, tu desarrollo profesional</li>
        <li><strong>Personal/Emocional:</strong> Tu autoconocimiento, tu salud mental, tu crecimiento</li>
        <li><strong>Familiar/Relacional:</strong> Tu pareja, hijos, familia extendida, amigos</li>
        <li><strong>Física/Salud:</strong> Tu cuerpo, alimentación, ejercicio, descanso</li>
        <li><strong>Económica/Financiera:</strong> Tus ingresos, ahorro, patrimonio, seguridad</li>
        <li><strong>Espiritual/Trascendente:</strong> Tu conexión con algo mayor, tu legado</li>
      </ol>
      <p>Un plan de vida integral atiende las 6 dimensiones — si solo planeas la profesional, las demás se deterioran.</p>

      <h3>Ejercicio: La Rueda de la Vida</h3>
      <p>Califica cada dimensión del 1 al 10 según tu satisfacción actual. Dibuja un círculo con 6 ejes. Las áreas con menor puntaje son tus prioridades de atención.</p>
    `,
    references: ["Casares, D. - Planeación de vida y carrera", "Covey, S. - Los 7 hábitos", "Senge, P. - La quinta disciplina"],
    durationMinutes: 30
  },
  {
    title: "Fortalezas y Debilidades",
    description: "Análisis personal FODA para construir sobre tus fortalezas y gestionar tus áreas de mejora",
    contentHtml: `
      <h2>Conócete con honestidad</h2>
      <p>Para planear tu vida y trabajo necesitas un diagnóstico realista de quién eres hoy. No lo que quisieras ser, no lo que otros dicen que eres — sino una evaluación honesta de tus recursos y limitaciones actuales.</p>

      <h3>FODA Personal</h3>
      <ul>
        <li><strong>Fortalezas (internas):</strong> Habilidades, conocimientos, talentos, experiencias, rasgos de personalidad que te favorecen</li>
        <li><strong>Oportunidades (externas):</strong> Tendencias del mercado, contactos, recursos disponibles, cambios favorables en tu entorno</li>
        <li><strong>Debilidades (internas):</strong> Carencias de habilidades, hábitos que te limitan, áreas sin experiencia</li>
        <li><strong>Amenazas (externas):</strong> Competencia, cambios tecnológicos, situaciones económicas, factores fuera de tu control</li>
      </ul>

      <h3>Estrategia: Construir sobre fortalezas</h3>
      <p>La investigación de Gallup (StrengthsFinder) muestra que las personas que enfocan su desarrollo en sus fortalezas son <strong>6 veces más propensas a estar comprometidas</strong> con su trabajo. No ignores las debilidades, pero invierte la mayor parte de tu energía en potenciar lo que ya haces bien.</p>

      <h3>Cómo identificar fortalezas que no ves</h3>
      <ol>
        <li><strong>Pregunta a otros:</strong> "¿Qué crees que hago mejor?" — muchas veces los demás ven fortalezas que tú das por sentado</li>
        <li><strong>Observa lo que te fluye:</strong> ¿Qué actividades te absorben tanto que pierdes la noción del tiempo?</li>
        <li><strong>Revisa tus logros:</strong> ¿Qué habilidades usaste en tus mayores éxitos?</li>
      </ol>

      <h3>Gestionar debilidades: 3 estrategias</h3>
      <ol>
        <li><strong>Capacitarte:</strong> Si la debilidad es de conocimiento, la solución es aprender</li>
        <li><strong>Delegar:</strong> Si no es tu fuerte y alguien más lo hace mejor, forma equipo</li>
        <li><strong>Minimizar el impacto:</strong> Organiza tu trabajo para que tus debilidades no sean críticas</li>
      </ol>
    `,
    references: ["Rath, T. - StrengthsFinder 2.0", "Casares, D. - Planeación de vida y carrera", "Drucker, P. - Managing Oneself"],
    durationMinutes: 30
  },
  {
    title: "Discriminación de Necesidades y Valores",
    description: "Distinguir entre necesidades reales y deseos, alinear valores con metas de vida",
    contentHtml: `
      <h2>¿Qué necesitas realmente?</h2>
      <p>Muchos planes de vida fracasan porque están construidos sobre <strong>deseos superficiales</strong> en lugar de necesidades profundas. "Quiero ganar más dinero" no es un plan — es un deseo. La pregunta es: ¿para qué? ¿Qué necesidad profunda hay detrás?</p>

      <h3>Necesidades vs. Deseos</h3>
      <ul>
        <li><strong>Necesidad:</strong> Seguridad económica para mi familia → Profunda, duradera</li>
        <li><strong>Deseo:</strong> Un coche nuevo → Superficial, temporal</li>
        <li><strong>Necesidad:</strong> Sentirme valorado y competente → Motor de crecimiento</li>
        <li><strong>Deseo:</strong> Un título más en mi currículum → Puede o no satisfacer la necesidad</li>
      </ul>

      <h3>Alinear valores con metas</h3>
      <p>Una meta que contradice tus valores generará conflicto interno aunque la logres. Ejemplo: si tu valor principal es la familia y tu meta es un puesto que requiere viajar 80% del tiempo, el logro vendrá acompañado de malestar.</p>

      <h3>Diseña tu plan de vida</h3>
      <p>Para cada una de las 6 dimensiones de vida:</p>
      <ol>
        <li>Define tu <strong>visión a 5 años:</strong> ¿Cómo quiero estar en esta dimensión?</li>
        <li>Define <strong>3 metas a 1 año</strong> que te acerquen a esa visión (SMART: específicas, medibles, alcanzables, relevantes, con tiempo definido)</li>
        <li>Define <strong>3 acciones para esta semana</strong> que contribuyan a esas metas</li>
      </ol>

      <h3>La revisión periódica</h3>
      <p>Un plan de vida no es un documento que haces una vez y guardas. Revísalo cada trimestre: ¿estoy avanzando? ¿siguen vigentes mis metas? ¿necesito ajustar? La vida cambia, y tu plan debe evolucionar contigo.</p>
    `,
    references: ["Maslow, A. - Motivación y personalidad", "Casares, D. - Planeación de vida y carrera", "Frankl, V. - El hombre en busca de sentido"],
    durationMinutes: 30
  },
  {
    title: "Mi Plan de Vida y Trabajo: Integración Final",
    description: "Construcción del plan integral de vida y trabajo personalizado",
    contentHtml: `
      <h2>Tu plan, tus reglas</h2>
      <p>Este módulo es completamente práctico. Con todo lo aprendido, vas a construir tu <strong>Plan de Vida y Trabajo personalizado</strong>.</p>

      <h3>Paso 1: Tu declaración de propósito</h3>
      <p>Completa: "Quiero ser recordado/a como una persona que _________ y que contribuyó a _________." Esta es tu brújula. Cuando dudes entre dos caminos, elige el que esté más alineado con esta declaración.</p>

      <h3>Paso 2: Visión por dimensiones (5 años)</h3>
      <p>Escribe en presente, como si ya lo hubieras logrado:</p>
      <ul>
        <li>"En mi trabajo, yo soy/hago..."</li>
        <li>"En mi salud, yo..."</li>
        <li>"En mis relaciones, yo..."</li>
        <li>"En mis finanzas, yo..."</li>
        <li>"En mi desarrollo personal, yo..."</li>
        <li>"En mi trascendencia, yo..."</li>
      </ul>

      <h3>Paso 3: Metas SMART a 1 año</h3>
      <p>Selecciona las 3 dimensiones más urgentes. Para cada una, define una meta SMART:</p>
      <ul>
        <li><strong>S</strong>pecífica: ¿Qué exactamente?</li>
        <li><strong>M</strong>edible: ¿Cómo sé que lo logré?</li>
        <li><strong>A</strong>lcanzable: ¿Es realista con mis recursos actuales?</li>
        <li><strong>R</strong>elevante: ¿Contribuye a mi visión?</li>
        <li><strong>T</strong>emporal: ¿Para cuándo?</li>
      </ul>

      <h3>Paso 4: Plan de acción semanal</h3>
      <p>Las metas grandes se logran con acciones pequeñas y consistentes. Define 3 acciones semanales (una por meta prioritaria) que puedas hacer sin excusas.</p>

      <h3>Paso 5: Sistema de revisión</h3>
      <ul>
        <li><strong>Semanal:</strong> ¿Hice mis 3 acciones? ¿Qué me frenó?</li>
        <li><strong>Mensual:</strong> ¿Estoy avanzando hacia las metas anuales?</li>
        <li><strong>Trimestral:</strong> ¿Necesito ajustar el plan?</li>
        <li><strong>Anual:</strong> Balance completo y replaneación</li>
      </ul>

      <h3>Tu plan empieza hoy</h3>
      <p>No mañana, no el lunes, no en enero. El mejor momento para empezar a vivir con propósito es ahora. Tu plan no tiene que ser perfecto — tiene que ser <strong>tuyo</strong> y tiene que estar <strong>en acción</strong>.</p>
    `,
    references: ["Casares, D. - Planeación de vida y carrera", "Doran, G.T. - SMART Goals", "Allen, D. - Getting Things Done"],
    durationMinutes: 30
  }
],

// ═══ 10. CAPACIDAD ANALÍTICA Y RESOLUCIÓN DE PROBLEMAS ═══
"capacidad-analitica-resolucion-problemas": [
  {
    title: "Pensamiento Analítico y Crítico",
    description: "Fundamentos del pensamiento analítico para resolver problemas laborales con método",
    contentHtml: `
      <h2>Pensar con método</h2>
      <p>El pensamiento analítico es la capacidad de <strong>descomponer un problema complejo en partes manejables</strong>, examinar cada parte, y construir una solución fundamentada. Es la diferencia entre "reaccionar" ante un problema y "resolverlo".</p>

      <h3>Pensamiento analítico vs. pensamiento intuitivo</h3>
      <ul>
        <li><strong>Intuitivo:</strong> Rápido, automático, basado en experiencia y emociones. Útil para decisiones rutinarias. Riesgo: sesgos y errores sistemáticos</li>
        <li><strong>Analítico:</strong> Deliberado, estructurado, basado en datos y lógica. Necesario para problemas complejos. Requiere tiempo y disciplina</li>
      </ul>
      <p>La clave no es elegir uno u otro, sino saber cuándo usar cada uno.</p>

      <h3>Habilidades del pensador analítico</h3>
      <ol>
        <li><strong>Observación:</strong> Ver lo que otros no ven — los detalles, los patrones, las anomalías</li>
        <li><strong>Descomposición:</strong> Dividir un problema grande en problemas pequeños y manejables</li>
        <li><strong>Razonamiento lógico:</strong> Conectar causas con efectos de manera fundamentada</li>
        <li><strong>Evaluación de evidencia:</strong> Distinguir hechos de opiniones, datos de suposiciones</li>
        <li><strong>Síntesis:</strong> Integrar las partes analizadas en una visión coherente</li>
      </ol>

      <h3>Pensamiento crítico: el complemento</h3>
      <p>El pensamiento crítico agrega la capacidad de <strong>cuestionar</strong>: ¿Es cierto? ¿Cómo lo sabemos? ¿Hay otra explicación? ¿Quién se beneficia de que aceptemos esta versión? Es pensar sobre cómo pensamos.</p>

      <h3>Ejercicio</h3>
      <p>Piensa en un problema actual en tu trabajo. Antes de buscar soluciones, dedica 10 minutos solo a analizarlo: ¿Cuáles son los hechos? ¿Qué supuestos estoy haciendo? ¿Qué información me falta? ¿Cuál es la verdadera causa?</p>
    `,
    references: ["Paul, R. & Elder, L. - Critical Thinking", "Kahneman, D. - Pensar rápido, pensar despacio", "Goldratt, E. - La Meta"],
    durationMinutes: 30
  },
  {
    title: "Metodologías de Resolución de Problemas",
    description: "Herramientas prácticas: Ishikawa, 5 Porqués, 8D y análisis de causa raíz",
    contentHtml: `
      <h2>Herramientas que funcionan</h2>
      <p>No necesitas reinventar la rueda. Existen metodologías probadas que te guían paso a paso para resolver problemas de manera efectiva.</p>

      <h3>1. Los 5 Porqués</h3>
      <p>La herramienta más simple y poderosa. Pregunta "¿por qué?" 5 veces hasta llegar a la causa raíz.</p>
      <p><strong>Ejemplo:</strong> El cliente recibió el pedido equivocado → ¿Por qué? Se empacó mal → ¿Por qué? La etiqueta era incorrecta → ¿Por qué? El sistema imprimió la etiqueta del pedido anterior → ¿Por qué? No se actualiza automáticamente entre pedidos → ¿Por qué? No se programó la función de auto-reset. <strong>Solución: programar auto-reset entre pedidos.</strong></p>

      <h3>2. Diagrama de Ishikawa (Espina de Pescado)</h3>
      <p>Organiza las posibles causas de un problema en 6 categorías (6M):</p>
      <ul>
        <li><strong>Mano de obra:</strong> ¿El personal está capacitado? ¿Hay suficiente?</li>
        <li><strong>Método:</strong> ¿El proceso está bien diseñado? ¿Se sigue?</li>
        <li><strong>Maquinaria:</strong> ¿El equipo funciona correctamente? ¿Tiene mantenimiento?</li>
        <li><strong>Material:</strong> ¿La materia prima cumple especificaciones?</li>
        <li><strong>Medición:</strong> ¿Se mide correctamente? ¿Los instrumentos están calibrados?</li>
        <li><strong>Medio ambiente:</strong> ¿Las condiciones del entorno afectan? (temperatura, iluminación, ruido)</li>
      </ul>

      <h3>3. Metodología 8D (8 Disciplinas)</h3>
      <ol>
        <li>Formar equipo</li>
        <li>Describir el problema</li>
        <li>Implementar contención (acción inmediata temporal)</li>
        <li>Identificar causa raíz</li>
        <li>Verificar acciones correctivas</li>
        <li>Implementar acciones correctivas permanentes</li>
        <li>Prevenir recurrencia</li>
        <li>Reconocer al equipo</li>
      </ol>

      <h3>¿Cuál usar?</h3>
      <ul>
        <li><strong>5 Porqués:</strong> Problemas simples con una causa principal</li>
        <li><strong>Ishikawa:</strong> Problemas con múltiples posibles causas</li>
        <li><strong>8D:</strong> Problemas complejos que requieren equipo y seguimiento formal</li>
      </ul>
    `,
    references: ["Ishikawa, K. - ¿Qué es el control total de calidad?", "Ohno, T. - Sistema de producción Toyota", "AIAG - 8D Problem Solving"],
    durationMinutes: 30
  },
  {
    title: "Toma de Decisiones Basada en Datos",
    description: "Cómo usar información y datos para tomar decisiones más efectivas",
    contentHtml: `
      <h2>Datos, no corazonadas</h2>
      <p>En muchas organizaciones, las decisiones se toman por costumbre, por presión del más fuerte, o por "gut feeling". La toma de decisiones basada en datos propone algo diferente: <strong>recopilar información relevante, analizarla y usarla como base para decidir</strong>.</p>

      <h3>El ciclo datos → información → decisión</h3>
      <ol>
        <li><strong>Datos:</strong> Números crudos, registros, observaciones (ej: "produjimos 500 piezas hoy")</li>
        <li><strong>Información:</strong> Datos con contexto y significado (ej: "produjimos 500 piezas, 15% menos que el promedio")</li>
        <li><strong>Conocimiento:</strong> Información interpretada con experiencia (ej: "la baja se debe al cambio de turno sin capacitación")</li>
        <li><strong>Decisión:</strong> Acción basada en conocimiento (ej: "capacitar al turno nuevo antes del cambio")</li>
      </ol>

      <h3>Herramientas simples de análisis</h3>
      <ul>
        <li><strong>Diagrama de Pareto (80/20):</strong> El 80% de los problemas viene del 20% de las causas. Identifica ese 20% y enfócate ahí</li>
        <li><strong>Gráficos de tendencia:</strong> ¿El problema está mejorando, empeorando o estable? Un simple gráfico de línea te lo dice</li>
        <li><strong>Comparaciones:</strong> Antes vs. después, este mes vs. el anterior, mi área vs. el estándar</li>
      </ul>

      <h3>Errores comunes al usar datos</h3>
      <ul>
        <li><strong>Cherry-picking:</strong> Seleccionar solo los datos que apoyan tu conclusión preconcebida</li>
        <li><strong>Correlación ≠ Causalidad:</strong> Que dos cosas sucedan juntas no significa que una cause la otra</li>
        <li><strong>Muestras pequeñas:</strong> Sacar conclusiones de muy pocos datos</li>
        <li><strong>Ignorar el contexto:</strong> Los números sin contexto mienten</li>
      </ul>

      <h3>Ejercicio</h3>
      <p>Identifica un problema recurrente en tu trabajo. Recopila datos reales de las últimas 4 semanas. Haz un Pareto simple: ¿cuáles son las causas más frecuentes? ¿Dónde está el 20% que genera el 80% del problema?</p>
    `,
    references: ["Deming, W.E. - Out of the Crisis", "Pareto, V. - Principio de Pareto", "Davenport, T. - Competing on Analytics"],
    durationMinutes: 30
  },
  {
    title: "Casos Prácticos: Resolución de Problemas en el Ámbito Laboral",
    description: "Aplicación integrada de herramientas analíticas a problemas reales del trabajo",
    contentHtml: `
      <h2>Manos a la obra</h2>

      <h3>Caso 1: El desperdicio en producción</h3>
      <p><strong>Situación:</strong> Una cooperativa de manufactura tiene un 12% de desperdicio en su línea principal. El promedio de la industria es 5%. El costo mensual del desperdicio es de $85,000 MXN.</p>
      <p><strong>Aplica:</strong></p>
      <ol>
        <li>Ishikawa: Analiza las 6M para identificar todas las posibles causas</li>
        <li>Pareto: Con datos de las últimas 4 semanas, identifica las 3 causas principales</li>
        <li>5 Porqués: Para cada causa principal, llega a la raíz</li>
        <li>Plan de acción: Define acciones correctivas con responsable y fecha</li>
      </ol>

      <h3>Caso 2: La queja de clientes</h3>
      <p><strong>Situación:</strong> Las quejas de clientes han aumentado un 40% en el último trimestre. La principal queja es "tiempo de respuesta lento".</p>
      <p><strong>Aplica:</strong> 5 Porqués → ¿Por qué es lento? → ¿Por qué hay retraso en esa etapa? → ¿Cuál es la causa raíz? Diseña una solución que ataque la raíz, no el síntoma.</p>

      <h3>Caso 3: La rotación de personal</h3>
      <p><strong>Situación:</strong> 8 de 30 operarios han renunciado en 6 meses. El costo de reemplazo y capacitación es de $15,000 MXN por persona.</p>
      <p><strong>Aplica:</strong> Recopila datos (entrevistas de salida, encuestas de clima). Ishikawa con las 6M adaptadas a RH. Identifica patrones. ¿Es liderazgo? ¿Salario? ¿Condiciones? ¿Oportunidades? Diseña intervención basada en datos.</p>

      <h3>Framework de resolución rápida (para problemas del día a día)</h3>
      <ol>
        <li><strong>PARA:</strong> No reacciones impulsivamente. Tómate 2 minutos para pensar</li>
        <li><strong>DEFINE:</strong> ¿Cuál es el problema real? (no el síntoma)</li>
        <li><strong>ANALIZA:</strong> ¿Qué sé? ¿Qué me falta? ¿Cuál es la causa?</li>
        <li><strong>OPCIONES:</strong> Genera al menos 2 alternativas</li>
        <li><strong>DECIDE:</strong> Elige la mejor con los datos disponibles</li>
        <li><strong>ACTÚA:</strong> Implementa y mide el resultado</li>
      </ol>
    `,
    references: ["Goldratt, E. - La Meta", "Toyota - Método de resolución de problemas", "Deming, W.E. - Ciclo PDCA"],
    durationMinutes: 30
  }
],
  "prevencion-riesgos-laborales": [
    {
      title: "Conceptos Fundamentales de Riesgos Laborales",
      description: "Diferencia entre peligro y riesgo, actos y condiciones inseguras.",
      contentHtml: `<h2>Conceptos Básicos</h2><h3>Peligro vs. Riesgo</h3><ul><li><strong>Peligro:</strong> Fuente, situación o acto con potencial de causar daño (lesión, enfermedad)</li><li><strong>Riesgo:</strong> Combinación de la probabilidad de que ocurra un evento peligroso y la severidad del daño</li></ul><h3>Actos Inseguros</h3><p>Comportamientos del trabajador que violan normas de seguridad:</p><ul><li>Operar equipos sin autorización</li><li>No usar el EPP</li><li>Desactivar dispositivos de seguridad</li><li>Trabajar bajo efectos de alcohol o drogas</li></ul><h3>Condiciones Inseguras</h3><p>Características del ambiente que favorecen accidentes:</p><ul><li>Pisos mojados o resbaladizos</li><li>Falta de iluminación</li><li>Cables eléctricos expuestos</li><li>Equipos defectuosos</li></ul><p>La <strong>teoría del queso suizo</strong> de James Reason explica que los accidentes ocurren cuando múltiples fallas (capas de protección) se alinean simultáneamente.</p>`,
      references: ["Reason, J. (1990). Human Error", "NOM-030-STPS-2009"],
      durationMinutes: 25,
    },
    {
      title: "Identificación y Evaluación de Riesgos",
      description: "Métodos para identificar peligros y evaluar niveles de riesgo.",
      contentHtml: `<h2>Identificación de Peligros</h2><h3>Métodos de Identificación</h3><ul><li><strong>Inspecciones de seguridad:</strong> Recorridos programados para detectar condiciones inseguras</li><li><strong>Análisis de Seguridad en el Trabajo (AST):</strong> Desglose paso a paso de una tarea para identificar peligros en cada etapa</li><li><strong>Reportes de casi-accidentes:</strong> Eventos que no causaron daño pero pudieron hacerlo</li><li><strong>Investigación de accidentes:</strong> Análisis de eventos pasados para prevenir recurrencia</li></ul><h3>Matriz de Riesgos</h3><p>Herramienta que cruza <strong>probabilidad × severidad</strong> para clasificar riesgos:</p><ul><li><strong>Alto:</strong> Requiere acción inmediata</li><li><strong>Medio:</strong> Requiere acción planificada</li><li><strong>Bajo:</strong> Requiere monitoreo</li></ul><h3>Pirámide de Bird</h3><p>Frank Bird demostró la relación: por cada accidente grave hay 10 accidentes leves, 30 daños a la propiedad y 600 incidentes sin lesión. Trabajar en la base reduce la cima.</p>`,
      references: ["Bird, F. (1969). Management Guide to Loss Control", "Heinrich, H.W. (1931). Industrial Accident Prevention"],
      durationMinutes: 30,
    },
    {
      title: "Jerarquía de Controles de Riesgo",
      description: "Eliminación, sustitución, ingeniería, administración y EPP.",
      contentHtml: `<h2>Jerarquía de Controles</h2><p>La NIOSH establece una jerarquía de controles en orden de eficacia:</p><ol><li><strong>Eliminación:</strong> Remover completamente el peligro (lo más efectivo)</li><li><strong>Sustitución:</strong> Reemplazar el peligro por algo menos peligroso</li><li><strong>Controles de ingeniería:</strong> Aislar al trabajador del peligro (guardas, ventilación, barreras)</li><li><strong>Controles administrativos:</strong> Procedimientos, señalización, capacitación, rotación de puestos</li><li><strong>EPP:</strong> Equipo de protección personal (último recurso, menos efectivo)</li></ol><h3>Aplicación Práctica</h3><p>Ejemplo: Ruido excesivo en planta</p><ul><li><strong>Eliminación:</strong> Cambiar el proceso que genera ruido</li><li><strong>Sustitución:</strong> Usar máquina más silenciosa</li><li><strong>Ingeniería:</strong> Instalar cabinas acústicas</li><li><strong>Administrativo:</strong> Limitar tiempo de exposición, rotación</li><li><strong>EPP:</strong> Tapones auditivos, orejeras</li></ul><p>Siempre se debe buscar el <strong>nivel más alto</strong> de la jerarquía que sea factible.</p>`,
      references: ["NIOSH Hierarchy of Controls", "NOM-011-STPS-2001"],
      durationMinutes: 25,
    },
    {
      title: "Plan de Prevención y Marco Legal",
      description: "Elaboración de planes preventivos y normatividad mexicana aplicable.",
      contentHtml: `<h2>Plan de Prevención</h2><h3>Componentes del Plan</h3><ol><li><strong>Diagnóstico:</strong> Inventario de peligros y evaluación de riesgos</li><li><strong>Política de seguridad:</strong> Compromiso documentado de la dirección</li><li><strong>Objetivos y metas:</strong> Indicadores medibles (tasa de accidentes, índice de frecuencia)</li><li><strong>Programas de acción:</strong> Capacitación, inspecciones, simulacros</li><li><strong>Responsabilidades:</strong> Asignación clara de roles en seguridad</li><li><strong>Seguimiento:</strong> Auditorías internas, revisión por la dirección</li></ol><h3>Marco Legal Mexicano</h3><ul><li><strong>LFT Art. 132:</strong> Obligación del patrón de garantizar condiciones seguras</li><li><strong>NOM-030-STPS:</strong> Servicios preventivos de seguridad y salud</li><li><strong>NOM-019-STPS:</strong> Comisiones de seguridad e higiene</li><li><strong>RIMSS:</strong> Reglamento Interior del IMSS para registro de accidentes</li></ul><p>El incumplimiento conlleva <strong>multas de 50 a 5,000 UMAs</strong> por la STPS y responsabilidad civil y penal en caso de accidentes.</p>`,
      references: ["Ley Federal del Trabajo", "NOM-030-STPS-2009", "Reglamento Federal de Seguridad y Salud en el Trabajo"],
      durationMinutes: 30,
    },
  ],
  "equipo-proteccion-personal": [
    {
      title: "Fundamentos del EPP y NOM-017-STPS",
      description: "Concepto de EPP, marco normativo y responsabilidades del patrón y trabajador.",
      contentHtml: `<h2>Equipo de Protección Personal</h2><p>El EPP es el <strong>último recurso</strong> en la jerarquía de controles, pero sigue siendo indispensable cuando otras medidas no eliminan completamente el riesgo.</p><h3>NOM-017-STPS-2008</h3><p>Establece:</p><ul><li>Obligación del patrón de <strong>proporcionar EPP sin costo</strong></li><li>Selección basada en el <strong>análisis de riesgos</strong> por puesto de trabajo</li><li>Capacitación en uso, mantenimiento y limitaciones del EPP</li><li>Obligación del trabajador de <strong>usarlo correctamente</strong></li></ul><h3>Clasificación del EPP por Región Corporal</h3><ul><li><strong>Cabeza:</strong> Cascos, cofias, capuchas</li><li><strong>Ojos y cara:</strong> Lentes, gogles, caretas</li><li><strong>Oídos:</strong> Tapones, orejeras</li><li><strong>Vías respiratorias:</strong> Mascarillas, respiradores</li><li><strong>Tronco:</strong> Mandiles, chalecos, arneses</li><li><strong>Manos:</strong> Guantes de diversos materiales</li><li><strong>Pies:</strong> Calzado de seguridad, botas dieléctricas</li></ul>`,
      references: ["NOM-017-STPS-2008", "STPS - Guía para selección de EPP"],
      durationMinutes: 25,
    },
    {
      title: "Selección del EPP Adecuado",
      description: "Criterios técnicos para elegir el EPP correcto según el riesgo.",
      contentHtml: `<h2>Selección Técnica del EPP</h2><h3>Proceso de Selección</h3><ol><li><strong>Identificar el peligro:</strong> Químico, físico, biológico, ergonómico</li><li><strong>Evaluar la exposición:</strong> Concentración, duración, frecuencia</li><li><strong>Seleccionar el nivel de protección:</strong> Según normatividad aplicable</li><li><strong>Verificar certificaciones:</strong> ANSI, EN, NOM, NIOSH</li><li><strong>Considerar ergonomía:</strong> Comodidad, talla, compatibilidad con otros EPP</li></ol><h3>Guantes: Criterios de Selección</h3><ul><li><strong>Químicos:</strong> Nitrilo, neopreno, butilo según la sustancia</li><li><strong>Corte:</strong> Niveles A1-A9 según ANSI/ISEA 105</li><li><strong>Calor:</strong> Cuero, fibras aramidas (Kevlar)</li><li><strong>Eléctricos:</strong> Clases 00-4 según voltaje</li></ul><h3>Protección Respiratoria</h3><ul><li><strong>Partículas:</strong> N95, P100 según tamaño y tipo</li><li><strong>Gases/vapores:</strong> Cartuchos específicos por contaminante</li><li><strong>IDLH (Inmediatamente peligroso):</strong> Equipo autónomo (SCBA)</li></ul>`,
      references: ["ANSI/ISEA 105 - Cut Resistance", "OSHA 29 CFR 1910.134 - Respiratory Protection"],
      durationMinutes: 30,
    },
    {
      title: "Uso Correcto y Mantenimiento del EPP",
      description: "Procedimientos de colocación, inspección y mantenimiento preventivo.",
      contentHtml: `<h2>Uso y Mantenimiento</h2><h3>Inspección Pre-Uso</h3><p>Antes de cada uso verificar:</p><ul><li>Sin grietas, rasgaduras o deformaciones</li><li>Componentes completos y funcionales</li><li>Fecha de caducidad vigente (cuando aplique)</li><li>Ajuste correcto al cuerpo del trabajador</li></ul><h3>Colocación Correcta</h3><p>El EPP mal colocado es casi tan peligroso como no usarlo:</p><ul><li><strong>Casco:</strong> Ajustar tafilete, barboquejo cuando hay riesgo de caída del casco</li><li><strong>Respirador:</strong> Prueba de ajuste (presión positiva y negativa)</li><li><strong>Arnés:</strong> Verificar cada hebilla, punto de anclaje correcto</li></ul><h3>Mantenimiento</h3><ul><li><strong>Limpieza:</strong> Después de cada uso según instrucciones del fabricante</li><li><strong>Almacenamiento:</strong> Lugar seco, ventilado, protegido de luz solar directa</li><li><strong>Reemplazo:</strong> Al detectar daño, después de un impacto, o al cumplir vida útil</li></ul><p>Mantener un <strong>registro de entrega</strong> firmado por cada trabajador es obligatorio según la NOM-017.</p>`,
      references: ["NOM-017-STPS-2008", "3M - Guía de uso y mantenimiento de EPP"],
      durationMinutes: 25,
    },
    {
      title: "Gestión del Programa de EPP",
      description: "Implementación de un programa integral de EPP en la organización.",
      contentHtml: `<h2>Programa de EPP</h2><h3>Elementos del Programa</h3><ol><li><strong>Estudio de EPP por puesto:</strong> Matriz que cruza puestos con riesgos y EPP requerido</li><li><strong>Presupuesto:</strong> Asignación de recursos para compra y reposición</li><li><strong>Proveedores calificados:</strong> EPP certificado y de calidad comprobada</li><li><strong>Capacitación continua:</strong> Uso, cuidado, limitaciones</li><li><strong>Auditoría de cumplimiento:</strong> Verificar uso correcto en campo</li></ol><h3>Indicadores de Gestión</h3><ul><li>Porcentaje de cumplimiento en uso de EPP</li><li>Tasa de incidentes relacionados con falta de EPP</li><li>Tiempo promedio de reposición</li><li>Costo per cápita de EPP</li></ul><h3>Cultura de Seguridad</h3><p>El EPP no es solo un equipo, es parte de una <strong>cultura de seguridad</strong>. Se requiere:</p><ul><li>Liderazgo visible (supervisores usando EPP)</li><li>Reconocimiento positivo por uso correcto</li><li>Consecuencias consistentes por incumplimiento</li><li>Participación de los trabajadores en la selección</li></ul>`,
      references: ["NOM-017-STPS-2008", "Cortés Díaz, J.M. (2007). Seguridad e Higiene del Trabajo"],
      durationMinutes: 30,
    },
  ],
  "operario-limpieza": [
    {
      title: "Fundamentos de Higiene y Limpieza Profesional",
      description: "Principios de limpieza, desinfección y sanitización en ambientes laborales.",
      contentHtml: `<h2>Limpieza Profesional</h2><h3>Diferencias Clave</h3><ul><li><strong>Limpieza:</strong> Remoción de suciedad visible (polvo, grasa, residuos)</li><li><strong>Desinfección:</strong> Eliminación de microorganismos patógenos de superficies</li><li><strong>Sanitización:</strong> Reducción de microorganismos a niveles seguros</li><li><strong>Esterilización:</strong> Eliminación total de microorganismos (uso médico)</li></ul><h3>Principios del Orden de Limpieza</h3><ol><li><strong>De arriba hacia abajo:</strong> Techos → paredes → pisos</li><li><strong>De adentro hacia afuera:</strong> Desde el fondo del área hacia la salida</li><li><strong>De lo limpio a lo sucio:</strong> Para no contaminar áreas limpias</li><li><strong>De lo seco a lo húmedo:</strong> Barrer antes de trapear</li></ol><h3>Tipos de Suciedad</h3><ul><li><strong>Suelta:</strong> Polvo, arena (se remueve con barrido o aspirado)</li><li><strong>Adherida:</strong> Grasa, manchas (requiere producto y frotado)</li><li><strong>Incrustada:</strong> Sarro, óxido (requiere producto especializado y tiempo de contacto)</li></ul>`,
      references: ["ISSA - International Sanitary Supply Association", "Manual de limpieza institucional"],
      durationMinutes: 25,
    },
    {
      title: "Productos Químicos de Limpieza",
      description: "Clasificación, uso seguro y compatibilidad de productos de limpieza.",
      contentHtml: `<h2>Productos de Limpieza</h2><h3>Clasificación</h3><ul><li><strong>Detergentes:</strong> Eliminan grasa y suciedad adherida (pH neutro a alcalino)</li><li><strong>Desinfectantes:</strong> Hipoclorito de sodio (cloro), amonio cuaternario, peróxido de hidrógeno</li><li><strong>Desengrasantes:</strong> Para superficies con grasa pesada</li><li><strong>Desincrustantes:</strong> Ácidos para sarro y depósitos minerales</li></ul><h3>Mezclas Peligrosas — NUNCA mezclar</h3><ul><li><strong>Cloro + Amoniaco:</strong> Genera cloraminas (gas tóxico)</li><li><strong>Cloro + Ácidos:</strong> Genera gas cloro (letal)</li><li><strong>Cloro + Vinagre:</strong> Genera gas cloro</li><li><strong>Desengrasante + Desinfectante:</strong> Pueden neutralizarse</li></ul><h3>Diluciones Correctas</h3><p>Más concentrado NO es más efectivo. Seguir siempre las indicaciones del fabricante. El cloro doméstico (5.25%) para desinfección general se diluye: 10 ml por litro de agua (200 ppm).</p><h3>Hoja de Datos de Seguridad (HDS)</h3><p>Documento de 16 secciones con toda la información de seguridad del producto. Debe estar accesible en el lugar de trabajo.</p>`,
      references: ["NOM-018-STPS-2015 - SGA", "CDC - Guideline for Disinfection and Sterilization"],
      durationMinutes: 30,
    },
    {
      title: "Seguridad del Operario de Limpieza",
      description: "EPP específico, manejo de residuos y señalización de áreas.",
      contentHtml: `<h2>Seguridad en Limpieza</h2><h3>EPP del Operario</h3><ul><li><strong>Guantes:</strong> Látex o nitrilo para químicos, resistentes a corte para vidrios</li><li><strong>Calzado:</strong> Antiderrapante e impermeable</li><li><strong>Protección ocular:</strong> Al manipular productos irritantes</li><li><strong>Mascarilla:</strong> Al usar productos con vapores fuertes</li><li><strong>Uniforme:</strong> Manga larga para proteger la piel</li></ul><h3>Señalización</h3><p>Colocar señal de <strong>"Piso Mojado / Precaución"</strong> SIEMPRE que el piso esté húmedo. La responsabilidad legal por resbalones recae en quien realizó la limpieza.</p><h3>Manejo de Residuos</h3><ul><li><strong>Orgánicos:</strong> Contenedor verde</li><li><strong>Inorgánicos reciclables:</strong> Contenedor azul</li><li><strong>No reciclables:</strong> Contenedor gris</li><li><strong>RPBI:</strong> Contenedor rojo con bolsa roja (residuos biológico-infecciosos)</li><li><strong>Punzocortantes:</strong> Contenedor rígido rojo</li></ul><p>Nunca comprimir manualmente las bolsas de basura. Usar guantes gruesos y verificar peso antes de levantar.</p>`,
      references: ["NOM-087-SEMARNAT-SSA1-2002 - RPBI", "STPS - Manual de seguridad para personal de limpieza"],
      durationMinutes: 25,
    },
    {
      title: "Técnicas Especializadas y Protocolos",
      description: "Limpieza de sanitarios, áreas de alimentos y protocolos post-pandemia.",
      contentHtml: `<h2>Técnicas Especializadas</h2><h3>Limpieza de Sanitarios</h3><ol><li>Colocar señal de precaución y restringir acceso</li><li>Aplicar desinfectante en sanitarios (tiempo de contacto 10 min)</li><li>Limpiar espejos y dispensadores</li><li>Fregar pisos con desinfectante</li><li>Reponer insumos (papel, jabón, gel)</li><li>Retirar señalización al secar</li></ol><h3>Áreas de Alimentos</h3><p>Requieren <strong>sanitización</strong> (no solo limpieza). Superficies de contacto con alimentos deben sanitizarse con productos aprobados (amonio cuaternario 200 ppm o cloro 100 ppm). Frecuencia: después de cada uso y al menos cada 4 horas.</p><h3>Protocolo de Derrames</h3><ol><li>Delimitar el área</li><li>Identificar la sustancia (consultar HDS si es químico)</li><li>Usar EPP adecuado</li><li>Contener con material absorbente</li><li>Limpiar del exterior al centro</li><li>Disponer residuos según clasificación</li></ol>`,
      references: ["NOM-251-SSA1-2009 - Prácticas de higiene para alimentos", "Protocolo de limpieza y desinfección COVID-19"],
      durationMinutes: 30,
    },
  ],
  "seguridad-energia-electrica": [
    {
      title: "Fundamentos de Electricidad y Riesgos",
      description: "Conceptos eléctricos básicos y efectos de la corriente en el cuerpo humano.",
      contentHtml: `<h2>Electricidad y Riesgos</h2><h3>Conceptos Básicos</h3><ul><li><strong>Voltaje (V):</strong> Diferencia de potencial que impulsa la corriente</li><li><strong>Corriente (A):</strong> Flujo de electrones a través de un conductor</li><li><strong>Resistencia (Ω):</strong> Oposición al flujo de corriente</li><li><strong>Ley de Ohm:</strong> V = I × R (la corriente depende del voltaje y la resistencia)</li></ul><h3>Efectos en el Cuerpo Humano</h3><ul><li><strong>1 mA:</strong> Percepción (cosquilleo)</li><li><strong>10-20 mA:</strong> Contracción muscular involuntaria (no puede soltar)</li><li><strong>50-100 mA:</strong> Fibrilación ventricular (potencialmente mortal)</li><li><strong>>100 mA:</strong> Paro cardíaco, quemaduras internas severas</li></ul><h3>Tipos de Contacto</h3><ul><li><strong>Directo:</strong> Tocar partes energizadas</li><li><strong>Indirecto:</strong> Tocar partes que se energizaron por falla (carcasa metálica)</li><li><strong>Arco eléctrico:</strong> Descarga a través del aire a altas temperaturas (hasta 19,000°C)</li></ul><p>La resistencia del cuerpo humano varía: piel seca ~100,000 Ω, piel húmeda ~1,000 Ω. Por eso el agua multiplica el riesgo.</p>`,
      references: ["NOM-029-STPS-2011", "NFPA 70E - Standard for Electrical Safety in the Workplace"],
      durationMinutes: 30,
    },
    {
      title: "Normatividad y Análisis de Riesgos Eléctricos",
      description: "NOM-029-STPS, categorías de peligro y permisos de trabajo eléctrico.",
      contentHtml: `<h2>Marco Normativo Eléctrico</h2><h3>NOM-029-STPS-2011</h3><p>Establece condiciones de seguridad para mantenimiento de instalaciones eléctricas en centros de trabajo:</p><ul><li>Obligaciones del patrón y trabajadores</li><li>Procedimientos de seguridad para trabajos eléctricos</li><li>EPP dieléctrico requerido</li><li>Señalización y delimitación de áreas</li></ul><h3>Categorías de Peligro por Arco Eléctrico (NFPA 70E)</h3><ul><li><strong>Categoría 1:</strong> 4 cal/cm² — Ropa resistente a arco de una capa</li><li><strong>Categoría 2:</strong> 8 cal/cm² — Ropa resistente a arco de doble capa</li><li><strong>Categoría 3:</strong> 25 cal/cm² — Traje completo resistente a arco</li><li><strong>Categoría 4:</strong> 40 cal/cm² — Traje completo con capucha y protección máxima</li></ul><h3>Análisis de Riesgos Eléctricos</h3><p>Antes de cualquier trabajo eléctrico se debe realizar un análisis documentado que identifique peligros, distancias de seguridad, EPP requerido y procedimientos específicos.</p>`,
      references: ["NOM-029-STPS-2011", "NFPA 70E-2021", "NOM-001-SEDE-2012"],
      durationMinutes: 30,
    },
    {
      title: "Procedimientos de Trabajo Seguro",
      description: "LOTO eléctrico, distancias de seguridad y trabajo en líneas energizadas.",
      contentHtml: `<h2>Procedimientos Seguros</h2><h3>Bloqueo y Etiquetado Eléctrico</h3><ol><li>Notificar a personal afectado</li><li>Identificar todas las fuentes de energía</li><li>Abrir dispositivos de desconexión</li><li>Colocar candados y etiquetas</li><li>Verificar ausencia de energía con equipo calibrado</li><li>Conectar a tierra el equipo (cuando aplique)</li></ol><h3>Distancias de Seguridad</h3><p>Según la NOM-029, las distancias mínimas dependen del voltaje:</p><ul><li><strong>Hasta 50V:</strong> Sin restricción especial con EPP adecuado</li><li><strong>51-1,000V:</strong> Mínimo la distancia del brazo extendido</li><li><strong>>1,000V:</strong> Distancias específicas calculadas según voltaje</li></ul><h3>Equipo de Medición</h3><ul><li><strong>Multímetro:</strong> Verificar ausencia de voltaje (CAT III o IV)</li><li><strong>Detector de voltaje sin contacto:</strong> Verificación rápida</li><li><strong>Amperímetro de gancho:</strong> Medir corriente sin desconectar</li></ul><p>Siempre verificar el instrumento de medición en una fuente conocida ANTES y DESPUÉS de medir.</p>`,
      references: ["NOM-029-STPS-2011", "NFPA 70E - Lockout/Tagout"],
      durationMinutes: 30,
    },
    {
      title: "EPP Dieléctrico y Respuesta a Emergencias",
      description: "Equipo dieléctrico, primeros auxilios y respuesta ante accidentes eléctricos.",
      contentHtml: `<h2>EPP Dieléctrico y Emergencias</h2><h3>Equipo de Protección Dieléctrico</h3><ul><li><strong>Guantes dieléctricos:</strong> Clases 00 (500V) a 4 (36,000V), con protector de cuero</li><li><strong>Calzado dieléctrico:</strong> Aislamiento certificado, sin partes metálicas</li><li><strong>Tapetes dieléctricos:</strong> Para zonas de trabajo frente a tableros</li><li><strong>Mantas aislantes:</strong> Para cubrir partes energizadas adyacentes</li><li><strong>Pértigas aislantes:</strong> Para operar equipos a distancia segura</li></ul><h3>Inspección del EPP Dieléctrico</h3><p>Los guantes dieléctricos deben probarse cada 6 meses mediante prueba de inflado y prueba dieléctrica en laboratorio certificado.</p><h3>Primeros Auxilios Eléctricos</h3><ol><li><strong>NO tocar</strong> a la víctima si aún está en contacto con la fuente</li><li>Cortar la energía o separar con material aislante</li><li>Llamar a servicios de emergencia</li><li>Verificar pulso y respiración</li><li>Iniciar RCP si es necesario</li><li>Tratar quemaduras sin retirar ropa adherida</li></ol><p>Las lesiones eléctricas pueden tener daño interno severo aun con pocas marcas externas. Siempre requieren evaluación médica.</p>`,
      references: ["ASTM D120 - Specification for Rubber Insulating Gloves", "NOM-029-STPS-2011"],
      durationMinutes: 25,
    },
  ],
  "brigada-contra-incendios": [
    {
      title: "Química del Fuego y Clasificación de Incendios",
      description: "Triángulo y tetraedro del fuego, clases de incendios y mecanismos de propagación.",
      contentHtml: `<h2>Química del Fuego</h2><h3>Triángulo del Fuego</h3><p>Para que exista fuego se necesitan tres elementos simultáneamente:</p><ul><li><strong>Combustible:</strong> Material que puede arder (sólido, líquido, gas)</li><li><strong>Comburente:</strong> Oxígeno (normalmente del aire, 21%)</li><li><strong>Calor:</strong> Energía de activación suficiente para iniciar la combustión</li></ul><h3>Tetraedro del Fuego</h3><p>Agrega un cuarto elemento: la <strong>reacción en cadena</strong>. Los radicales libres mantienen la combustión. Algunos extintores actúan rompiendo esta cadena.</p><h3>Clases de Incendio</h3><ul><li><strong>Clase A:</strong> Sólidos (madera, papel, tela) — dejan cenizas</li><li><strong>Clase B:</strong> Líquidos y gases inflamables (gasolina, gas LP)</li><li><strong>Clase C:</strong> Equipos eléctricos energizados</li><li><strong>Clase D:</strong> Metales combustibles (magnesio, titanio, sodio)</li><li><strong>Clase K:</strong> Aceites y grasas de cocina</li></ul><h3>Mecanismos de Propagación</h3><ul><li><strong>Conducción:</strong> A través de materiales sólidos</li><li><strong>Convección:</strong> A través de corrientes de aire caliente</li><li><strong>Radiación:</strong> Ondas de calor a través del espacio</li></ul>`,
      references: ["NFPA 10 - Standard for Portable Fire Extinguishers", "NOM-002-STPS-2010"],
      durationMinutes: 30,
    },
    {
      title: "Extintores y Agentes Extintores",
      description: "Tipos de extintores, selección, uso correcto y mantenimiento.",
      contentHtml: `<h2>Extintores Portátiles</h2><h3>Agentes Extintores</h3><ul><li><strong>Agua:</strong> Clase A. Enfría el combustible. NUNCA en Clase B, C o D</li><li><strong>Polvo Químico Seco (PQS):</strong> ABC. Rompe la reacción en cadena</li><li><strong>CO2:</strong> BC. Desplaza el oxígeno. No deja residuos</li><li><strong>Espuma (AFFF):</strong> AB. Crea barrera entre combustible y oxígeno</li><li><strong>Agente limpio:</strong> ABC. Para equipos electrónicos sensibles</li></ul><h3>Técnica PASS</h3><ol><li><strong>P (Pull):</strong> Jalar el seguro</li><li><strong>A (Aim):</strong> Apuntar la boquilla a la BASE del fuego</li><li><strong>S (Squeeze):</strong> Apretar la manija de descarga</li><li><strong>S (Sweep):</strong> Barrer de lado a lado</li></ol><h3>Mantenimiento</h3><ul><li><strong>Inspección mensual:</strong> Presión, seguro, manguera, accesibilidad</li><li><strong>Mantenimiento anual:</strong> Por empresa certificada</li><li><strong>Prueba hidrostática:</strong> Cada 5 años (CO2) o 12 años (PQS)</li><li><strong>Recarga:</strong> Después de cada uso, parcial o total</li></ul>`,
      references: ["NFPA 10", "NOM-100-STPS-1994", "NOM-002-STPS-2010"],
      durationMinutes: 30,
    },
    {
      title: "Organización de la Brigada y Plan de Emergencia",
      description: "Estructura de la brigada, roles, comunicación y plan contra incendios.",
      contentHtml: `<h2>Brigada Contra Incendios</h2><h3>Estructura</h3><ul><li><strong>Jefe de brigada:</strong> Coordina acciones, toma decisiones</li><li><strong>Brigadistas:</strong> Operan extintores, hidrantes, apoyan evacuación</li><li><strong>Apoyo:</strong> Corte de energía, apertura de accesos, comunicación</li></ul><h3>Requisitos del Brigadista</h3><ul><li>Capacitación teórica y práctica actualizada</li><li>Condición física adecuada</li><li>Disponibilidad y voluntariado</li><li>Conocimiento de las instalaciones</li></ul><h3>Plan de Emergencia</h3><ol><li><strong>Detección:</strong> Sistemas automáticos o detección humana</li><li><strong>Alarma:</strong> Activación del sistema de alarma</li><li><strong>Evaluación:</strong> Determinar magnitud y tipo de incendio</li><li><strong>Respuesta:</strong> Combate inicial si es seguro, o evacuación</li><li><strong>Evacuación:</strong> Por rutas establecidas al punto de reunión</li><li><strong>Conteo:</strong> Verificar que todo el personal esté presente</li></ol><h3>Comunicación</h3><p>La brigada debe tener un <strong>directorio de emergencias</strong> visible: bomberos, Cruz Roja, Protección Civil, hospitales cercanos.</p>`,
      references: ["NOM-002-STPS-2010", "NFPA 600 - Facility Fire Brigades"],
      durationMinutes: 25,
    },
    {
      title: "Simulacros y Evaluación Post-Incendio",
      description: "Planeación de simulacros, evacuación y análisis posterior a emergencias.",
      contentHtml: `<h2>Simulacros</h2><h3>Tipos de Simulacros</h3><ul><li><strong>De gabinete:</strong> En sala, se discuten escenarios teóricos</li><li><strong>Parcial:</strong> Involucra un área o piso específico</li><li><strong>General:</strong> Todo el centro de trabajo</li><li><strong>Sin aviso:</strong> Para evaluar la respuesta real (avanzado)</li></ul><h3>Frecuencia</h3><p>La NOM-002-STPS establece al menos <strong>un simulacro anual</strong>. Se recomienda uno cada semestre, alternando parciales y generales.</p><h3>Evaluación del Simulacro</h3><ul><li>Tiempo de evacuación total</li><li>Claridad de las instrucciones</li><li>Funcionamiento de alarmas y señalización</li><li>Uso correcto de rutas de evacuación</li><li>Conteo de personal en punto de reunión</li></ul><h3>Investigación Post-Incendio</h3><p>Después de un incendio real, la brigada debe:</p><ol><li>Asegurar que el área esté libre de peligro</li><li>Documentar daños con fotografías</li><li>Investigar la causa del incendio</li><li>Identificar fallas en el plan de emergencia</li><li>Implementar acciones correctivas</li><li>Actualizar el plan según lecciones aprendidas</li></ol>`,
      references: ["NOM-002-STPS-2010", "Protección Civil - Guía de simulacros"],
      durationMinutes: 25,
    },
  ],
  "sistema-globalmente-armonizado-sga": [
    {
      title: "Introducción al SGA y NOM-018-STPS",
      description: "Origen, propósito y marco normativo del Sistema Globalmente Armonizado.",
      contentHtml: `<h2>Sistema Globalmente Armonizado (SGA)</h2><h3>¿Qué es el SGA?</h3><p>El SGA (GHS en inglés) es un sistema internacional para <strong>clasificar sustancias químicas</strong> según sus peligros y comunicar esa información de manera estandarizada a nivel mundial.</p><h3>Origen</h3><p>Desarrollado por la ONU para unificar los diferentes sistemas de clasificación que existían en cada país. México lo adoptó a través de la <strong>NOM-018-STPS-2015</strong>.</p><h3>Elementos del SGA</h3><ol><li><strong>Clasificación de peligros:</strong> Físicos, para la salud y para el medio ambiente</li><li><strong>Etiquetado:</strong> Pictogramas, palabra de advertencia, indicaciones de peligro y consejos de prudencia</li><li><strong>Hojas de Datos de Seguridad (HDS):</strong> 16 secciones estandarizadas</li></ol><h3>Beneficios</h3><ul><li>Lenguaje universal de peligros químicos</li><li>Facilita el comercio internacional</li><li>Mejora la protección de trabajadores</li><li>Estandariza la respuesta a emergencias</li></ul>`,
      references: ["NOM-018-STPS-2015", "ONU - Globally Harmonized System (GHS), Rev. 9"],
      durationMinutes: 25,
    },
    {
      title: "Clasificación de Peligros y Pictogramas",
      description: "Las 3 categorías de peligro, los 9 pictogramas y palabras de advertencia.",
      contentHtml: `<h2>Clasificación y Pictogramas</h2><h3>Categorías de Peligro</h3><ul><li><strong>Peligros físicos (16 clases):</strong> Explosivos, inflamables, oxidantes, gases a presión, corrosivos a metales, etc.</li><li><strong>Peligros para la salud (10 clases):</strong> Toxicidad aguda, irritación, sensibilización, carcinogenicidad, mutagenicidad, toxicidad reproductiva, etc.</li><li><strong>Peligros para el medio ambiente (2 clases):</strong> Toxicidad acuática aguda y crónica</li></ul><h3>Los 9 Pictogramas</h3><p>Cada pictograma tiene forma de <strong>diamante rojo sobre fondo blanco</strong>:</p><ol><li>🔥 <strong>Llama:</strong> Inflamables</li><li>⭕ <strong>Llama sobre círculo:</strong> Oxidantes</li><li>💀 <strong>Calavera:</strong> Toxicidad aguda severa</li><li>⚠️ <strong>Exclamación:</strong> Irritante, toxicidad aguda leve</li><li>🫁 <strong>Silueta dañada:</strong> Peligros crónicos para la salud</li><li>🧪 <strong>Corrosión:</strong> Corrosivos</li><li>💣 <strong>Bomba explotando:</strong> Explosivos</li><li>🔵 <strong>Cilindro de gas:</strong> Gases a presión</li><li>🌊 <strong>Medio ambiente:</strong> Peligro acuático</li></ol><h3>Palabras de Advertencia</h3><ul><li><strong>PELIGRO:</strong> Categorías de mayor severidad</li><li><strong>ATENCIÓN:</strong> Categorías de menor severidad</li></ul>`,
      references: ["NOM-018-STPS-2015", "UNECE - GHS Pictograms"],
      durationMinutes: 30,
    },
    {
      title: "Etiquetado SGA y Frases H/P",
      description: "Elementos obligatorios de la etiqueta, frases de peligro y consejos de prudencia.",
      contentHtml: `<h2>Etiquetado SGA</h2><h3>Elementos Obligatorios de la Etiqueta</h3><ol><li><strong>Identificación del producto:</strong> Nombre químico y comercial</li><li><strong>Pictogramas:</strong> Los que apliquen según la clasificación</li><li><strong>Palabra de advertencia:</strong> PELIGRO o ATENCIÓN</li><li><strong>Indicaciones de peligro (frases H):</strong> Describen el peligro</li><li><strong>Consejos de prudencia (frases P):</strong> Medidas preventivas</li><li><strong>Identificación del proveedor:</strong> Nombre, dirección, teléfono</li></ol><h3>Frases H (Hazard)</h3><p>Codificadas por tipo de peligro:</p><ul><li><strong>H200-H290:</strong> Peligros físicos (H220: Gas extremadamente inflamable)</li><li><strong>H300-H373:</strong> Peligros para la salud (H301: Tóxico si se ingiere)</li><li><strong>H400-H420:</strong> Peligros ambientales (H400: Muy tóxico para organismos acuáticos)</li></ul><h3>Frases P (Precautionary)</h3><ul><li><strong>P100:</strong> Generales (P102: Mantener fuera del alcance de los niños)</li><li><strong>P200:</strong> Prevención (P210: Mantener alejado del calor)</li><li><strong>P300:</strong> Respuesta (P301: En caso de ingestión...)</li><li><strong>P400:</strong> Almacenamiento (P403: Almacenar en lugar ventilado)</li><li><strong>P500:</strong> Eliminación (P501: Eliminar según normativa)</li></ul>`,
      references: ["NOM-018-STPS-2015", "GHS Rev.9 - Annex 3: Precautionary Statements"],
      durationMinutes: 30,
    },
    {
      title: "Hojas de Datos de Seguridad (HDS)",
      description: "Las 16 secciones de la HDS y su aplicación práctica en el centro de trabajo.",
      contentHtml: `<h2>Hojas de Datos de Seguridad</h2><h3>Las 16 Secciones</h3><ol><li><strong>Identificación:</strong> Producto, usos, proveedor, teléfono de emergencia</li><li><strong>Identificación de peligros:</strong> Clasificación SGA, pictogramas, frases H/P</li><li><strong>Composición:</strong> Ingredientes, concentraciones, CAS numbers</li><li><strong>Primeros auxilios:</strong> Medidas por vía de exposición</li><li><strong>Medidas contra incendio:</strong> Agentes extintores, productos de combustión</li><li><strong>Medidas ante derrames:</strong> Contención, limpieza, EPP</li><li><strong>Manejo y almacenamiento:</strong> Precauciones, incompatibilidades</li><li><strong>Controles de exposición/EPP:</strong> Límites de exposición, EPP requerido</li><li><strong>Propiedades físicas y químicas:</strong> pH, punto de inflamación, etc.</li><li><strong>Estabilidad y reactividad:</strong> Condiciones a evitar, materiales incompatibles</li><li><strong>Información toxicológica:</strong> Efectos por exposición</li><li><strong>Información ecológica:</strong> Impacto ambiental</li><li><strong>Disposición:</strong> Métodos de eliminación</li><li><strong>Transporte:</strong> Número ONU, clase de peligro</li><li><strong>Información reglamentaria:</strong> Normatividad aplicable</li><li><strong>Otra información:</strong> Fecha de elaboración, revisiones</li></ol><h3>Uso Práctico</h3><p>Las HDS deben estar <strong>disponibles y accesibles</strong> en todo lugar donde se manejen sustancias químicas. El personal debe estar capacitado para consultarlas.</p>`,
      references: ["NOM-018-STPS-2015", "ISO 11014:2009 - Safety Data Sheet"],
      durationMinutes: 30,
    },
  ],
  "nom-035-stps-medina": [
    {
      title: "Marco General de la NOM-035-STPS",
      description: "Objetivo, alcance y obligaciones generales de la norma.",
      contentHtml: `<h2>NOM-035-STPS-2018</h2><h3>Objetivo</h3><p>Establecer elementos para <strong>identificar, analizar y prevenir factores de riesgo psicosocial</strong>, así como para promover un entorno organizacional favorable.</p><h3>Alcance</h3><p>Aplica a <strong>todos los centros de trabajo</strong> en territorio nacional, con obligaciones diferenciadas según número de trabajadores:</p><ul><li><strong>1-15 trabajadores:</strong> Política, medidas de prevención, identificación de ATS</li><li><strong>16-50 trabajadores:</strong> Además: identificar FRP con Guía II</li><li><strong>Más de 50:</strong> Además: identificar y analizar FRP con Guía III, evaluar entorno organizacional</li></ul><h3>Factores de Riesgo Psicosocial (FRP)</h3><ul><li>Condiciones peligrosas e inseguras del ambiente</li><li>Cargas de trabajo excesivas</li><li>Falta de control sobre el trabajo</li><li>Jornadas superiores a las previstas en la LFT</li><li>Interferencia trabajo-familia</li><li>Liderazgo y relaciones negativas</li><li>Violencia laboral</li></ul>`,
      references: ["NOM-035-STPS-2018", "DOF - Diario Oficial de la Federación"],
      durationMinutes: 30,
    },
    {
      title: "Guías de Referencia y Cuestionarios",
      description: "Las Guías I, II y III: aplicación, interpretación y resultados.",
      contentHtml: `<h2>Guías de Referencia</h2><h3>Guía I: Acontecimientos Traumáticos Severos</h3><p>Cuestionario para identificar trabajadores que vivieron ATS: asaltos, secuestros, accidentes graves, actos de violencia extrema. Se aplica a <strong>todos los trabajadores</strong>.</p><h3>Guía II: Factores de Riesgo Psicosocial (16-50 trabajadores)</h3><p>Cuestionario de 46 preguntas que evalúa:</p><ul><li>Ambiente de trabajo</li><li>Factores propios de la actividad</li><li>Organización del tiempo de trabajo</li><li>Liderazgo y relaciones</li></ul><h3>Guía III: Factores de Riesgo Psicosocial (más de 50)</h3><p>Cuestionario de 72 preguntas más completo:</p><ul><li>Todo lo de Guía II más:</li><li>Entorno organizacional</li><li>Sentido de pertenencia</li><li>Formación y capacitación</li><li>Reconocimiento y desarrollo</li></ul><h3>Interpretación</h3><p>Los resultados se clasifican en niveles: <strong>Nulo o despreciable, Bajo, Medio, Alto, Muy alto</strong>. Los niveles alto y muy alto requieren acción inmediata.</p><h3>Frecuencia</h3><p>Los cuestionarios deben aplicarse <strong>cada 2 años</strong>.</p>`,
      references: ["NOM-035-STPS-2018 - Guías de Referencia", "STPS - Manual de aplicación"],
      durationMinutes: 30,
    },
    {
      title: "Política y Medidas de Prevención",
      description: "Elaboración de la política de prevención y acciones contra riesgos psicosociales.",
      contentHtml: `<h2>Política de Prevención</h2><h3>Contenido Obligatorio</h3><p>La política debe incluir:</p><ol><li><strong>Prevención de FRP:</strong> Compromiso de identificar y controlar los factores</li><li><strong>Prevención de violencia laboral:</strong> Cero tolerancia al acoso, hostigamiento y malos tratos</li><li><strong>Entorno favorable:</strong> Promoción del sentido de pertenencia, capacitación y comunicación</li><li><strong>Mecanismos de denuncia:</strong> Buzones, líneas telefónicas, correos confidenciales</li></ol><h3>Medidas de Prevención</h3><ul><li><strong>Organizacionales:</strong> Distribución equitativa de cargas, definición de roles, horarios razonables</li><li><strong>De liderazgo:</strong> Capacitación a jefes, comunicación asertiva, reconocimiento</li><li><strong>De apoyo:</strong> Programas de bienestar, actividades de integración, acceso a servicios de salud</li></ul><h3>Difusión</h3><p>La política debe ser <strong>comunicada a todos los trabajadores</strong> y estar visible en el centro de trabajo. Se recomienda incluirla en la inducción de personal nuevo.</p>`,
      references: ["NOM-035-STPS-2018", "OIT - Factores psicosociales en el trabajo"],
      durationMinutes: 25,
    },
    {
      title: "Implementación, Vigilancia y Sanciones",
      description: "Proceso de implementación, verificación de la STPS y consecuencias legales.",
      contentHtml: `<h2>Implementación y Vigilancia</h2><h3>Proceso de Implementación</h3><ol><li><strong>Fase 1:</strong> Elaborar y difundir la política (obligatorio desde Oct. 2019)</li><li><strong>Fase 2:</strong> Aplicar cuestionarios e identificar FRP (obligatorio desde Oct. 2020)</li><li><strong>Fase 3:</strong> Implementar medidas correctivas según resultados</li><li><strong>Fase 4:</strong> Dar seguimiento y reaplicar cada 2 años</li></ol><h3>Evidencia Documental</h3><p>El centro de trabajo debe conservar:</p><ul><li>Política de prevención firmada</li><li>Resultados de cuestionarios (anonimizados)</li><li>Programa de acciones preventivas</li><li>Evidencia de difusión y capacitación</li><li>Registros de ATS atendidos</li></ul><h3>Inspección STPS</h3><p>La STPS puede realizar inspecciones de verificación. Revisan: existencia de política, aplicación de cuestionarios, evidencia de acciones preventivas.</p><h3>Sanciones</h3><p>El incumplimiento puede resultar en multas de <strong>50 a 5,000 UMAs</strong> (Unidades de Medida y Actualización). En 2024, una UMA equivale a ~$108.57 MXN, por lo que las multas pueden ser de $5,428 a $542,850 MXN.</p>`,
      references: ["NOM-035-STPS-2018", "LFT - Art. 994 (Sanciones)", "STPS - Criterios de inspección"],
      durationMinutes: 30,
    },
  ],
  "formacion-instructores": [
    {
      title: "El Instructor y el Marco Legal de Capacitación",
      description: "Perfil del instructor, LFT y obligaciones de capacitación en México.",
      contentHtml: `<h2>El Instructor y la Capacitación</h2><h3>Marco Legal</h3><ul><li><strong>Art. 153-A LFT:</strong> Todo trabajador tiene derecho a capacitación y adiestramiento</li><li><strong>Art. 153-B LFT:</strong> La capacitación tendrá por objeto preparar al trabajador para el puesto</li><li><strong>DC-3:</strong> Constancia de competencias o habilidades laborales</li><li><strong>DC-4:</strong> Lista de constancias de competencias expedidas</li></ul><h3>Perfil del Instructor Efectivo</h3><ul><li><strong>Dominio del tema:</strong> Conocimiento profundo y actualizado</li><li><strong>Habilidades pedagógicas:</strong> Capacidad de transmitir conocimiento</li><li><strong>Comunicación:</strong> Clara, empática, adaptable al grupo</li><li><strong>Empatía:</strong> Comprende las necesidades y resistencias del participante</li><li><strong>Flexibilidad:</strong> Adapta su estilo a la situación</li></ul><h3>Detección de Necesidades de Capacitación (DNC)</h3><p>Proceso para identificar brechas entre competencias actuales y requeridas. Métodos: encuestas, entrevistas, observación directa, análisis de indicadores (accidentes, quejas, errores).</p>`,
      references: ["Ley Federal del Trabajo - Capítulo III Bis", "STPS - Formatos DC"],
      durationMinutes: 30,
    },
    {
      title: "Diseño Instruccional y Objetivos de Aprendizaje",
      description: "Taxonomía de Bloom, redacción de objetivos y diseño de sesiones de capacitación.",
      contentHtml: `<h2>Diseño Instruccional</h2><h3>Taxonomía de Bloom Revisada</h3><p>Seis niveles cognitivos de menor a mayor complejidad:</p><ol><li><strong>Recordar:</strong> Reconocer, listar, definir</li><li><strong>Comprender:</strong> Explicar, clasificar, resumir</li><li><strong>Aplicar:</strong> Usar, ejecutar, implementar</li><li><strong>Analizar:</strong> Diferenciar, organizar, comparar</li><li><strong>Evaluar:</strong> Verificar, juzgar, criticar</li><li><strong>Crear:</strong> Generar, planear, producir (nivel más alto)</li></ol><h3>Redacción de Objetivos</h3><p>Un objetivo de aprendizaje debe incluir:</p><ul><li><strong>Sujeto:</strong> ¿Quién? (El participante)</li><li><strong>Verbo:</strong> ¿Qué hará? (acción observable y medible)</li><li><strong>Objeto:</strong> ¿Sobre qué?</li><li><strong>Condición:</strong> ¿Bajo qué circunstancias?</li><li><strong>Criterio:</strong> ¿Con qué nivel de desempeño?</li></ul><h3>Dominios de Aprendizaje</h3><ul><li><strong>Cognitivo:</strong> Conocimientos (saber)</li><li><strong>Afectivo:</strong> Actitudes y valores (saber ser)</li><li><strong>Psicomotor:</strong> Habilidades (saber hacer)</li></ul>`,
      references: ["Bloom, B.S. (1956). Taxonomy of Educational Objectives", "Anderson, L.W. & Krathwohl, D.R. (2001). A Taxonomy for Learning"],
      durationMinutes: 30,
    },
    {
      title: "Técnicas Didácticas y Manejo de Grupo",
      description: "Métodos de enseñanza, dinámicas grupales y manejo de participantes difíciles.",
      contentHtml: `<h2>Técnicas Didácticas</h2><h3>Métodos de Enseñanza</h3><ul><li><strong>Expositiva:</strong> Presentación del instructor. Eficaz para información nueva, poco participativa</li><li><strong>Demostrativa:</strong> El instructor muestra y el participante practica. Ideal para habilidades</li><li><strong>Interrogativa:</strong> Preguntas dirigidas que estimulan la reflexión</li><li><strong>Estudio de caso:</strong> Análisis de situaciones reales. Desarrolla pensamiento crítico</li><li><strong>Simulación/Role-playing:</strong> Práctica en ambiente controlado</li><li><strong>Phillips 66:</strong> Grupos de 6 personas discuten 6 minutos un tema</li></ul><h3>Manejo de Participantes Difíciles</h3><ul><li><strong>El que domina:</strong> Agradecer y redirigir al grupo: "¿Alguien más tiene una perspectiva?"</li><li><strong>El silencioso:</strong> Hacer preguntas directas, simples y no amenazantes</li><li><strong>El negativo:</strong> Reconocer su punto, pedir alternativas constructivas</li><li><strong>El distraído:</strong> Acercarse físicamente, hacer contacto visual</li></ul><h3>Regla 70-20-10</h3><p>Las personas aprenden: 70% haciendo, 20% interactuando con otros, 10% en capacitación formal.</p>`,
      references: ["Silberman, M. (1998). Active Training", "Knowles, M.S. (1984). The Adult Learner"],
      durationMinutes: 30,
    },
    {
      title: "Evaluación del Aprendizaje y la DC-3",
      description: "Niveles de evaluación de Kirkpatrick, instrumentos y emisión de constancias.",
      contentHtml: `<h2>Evaluación y Constancias</h2><h3>Modelo de Kirkpatrick (4 Niveles)</h3><ol><li><strong>Reacción:</strong> ¿Les gustó? Encuesta de satisfacción al final del curso</li><li><strong>Aprendizaje:</strong> ¿Aprendieron? Evaluaciones pre/post, exámenes, demostraciones</li><li><strong>Comportamiento:</strong> ¿Lo aplican? Observación en el puesto, seguimiento a 30-90 días</li><li><strong>Resultados:</strong> ¿Impactó al negocio? Reducción de accidentes, errores, costos</li></ol><h3>Instrumentos de Evaluación</h3><ul><li><strong>Examen escrito:</strong> Opción múltiple, verdadero/falso, completar (nivel cognitivo)</li><li><strong>Lista de cotejo:</strong> Verificar pasos de un procedimiento (nivel psicomotor)</li><li><strong>Rúbrica:</strong> Criterios con niveles de desempeño (evaluaciones complejas)</li><li><strong>Escala Likert:</strong> Medir actitudes y percepciones (nivel afectivo)</li></ul><h3>Constancia DC-3</h3><p>La DC-3 certifica que el trabajador recibió capacitación. Debe incluir:</p><ul><li>Datos del trabajador y del patrón</li><li>Nombre del curso y duración</li><li>Periodo de capacitación</li><li>Área temática según catálogo STPS</li></ul><p>El patrón está obligado a conservar las DC-3 y presentarlas ante inspección de la STPS.</p>`,
      references: ["Kirkpatrick, D. (1994). Evaluating Training Programs", "STPS - Formato DC-3"],
      durationMinutes: 30,
    },
  ],
  "bloqueo-etiquetado-loto": [
    {
      title: "Fundamentos de LOTO y Energías Peligrosas",
      description: "Concepto de LOTO, tipos de energía peligrosa y normatividad aplicable.",
      contentHtml: `<h2>Bloqueo y Etiquetado (LOTO)</h2><h3>¿Qué es LOTO?</h3><p>LOTO (Lockout/Tagout) es un procedimiento de seguridad para <strong>controlar energías peligrosas</strong> durante mantenimiento, reparación o limpieza de maquinaria y equipos.</p><h3>Tipos de Energía Peligrosa</h3><ul><li><strong>Eléctrica:</strong> Corriente alterna o directa en circuitos</li><li><strong>Mecánica:</strong> Movimiento de partes (rotación, traslación)</li><li><strong>Hidráulica:</strong> Fluidos presurizados en sistemas hidráulicos</li><li><strong>Neumática:</strong> Aire comprimido en sistemas neumáticos</li><li><strong>Térmica:</strong> Calor o frío extremo en procesos</li><li><strong>Química:</strong> Reacciones químicas, sustancias tóxicas</li><li><strong>Gravitacional:</strong> Objetos elevados que pueden caer</li><li><strong>Residual:</strong> Energía almacenada (resortes, capacitores)</li></ul><h3>¿Cuándo Aplicar LOTO?</h3><p>Siempre que un trabajador pueda exponerse a la <strong>liberación inesperada de energía</strong> durante actividades no rutinarias en maquinaria y equipos.</p>`,
      references: ["OSHA 29 CFR 1910.147", "NOM-004-STPS-1999"],
      durationMinutes: 25,
    },
    {
      title: "Dispositivos y Procedimiento de Bloqueo",
      description: "Candados, etiquetas, dispositivos de bloqueo y los 6 pasos del procedimiento.",
      contentHtml: `<h2>Dispositivos y Procedimiento</h2><h3>Dispositivos de Bloqueo</h3><ul><li><strong>Candados:</strong> Uno por trabajador, con llave única. Colores: rojo (mantenimiento), azul (eléctrico)</li><li><strong>Etiquetas:</strong> Información del bloqueo: nombre, fecha, motivo, departamento</li><li><strong>Tenazas multipunto:</strong> Permiten que varios candados bloqueen un mismo punto</li><li><strong>Bloqueadores de válvulas:</strong> Para válvulas de compuerta, bola, mariposa</li><li><strong>Bloqueadores eléctricos:</strong> Para interruptores, enchufes, breakers</li></ul><h3>Los 6 Pasos del LOTO</h3><ol><li><strong>Preparación:</strong> Identificar todas las fuentes de energía del equipo</li><li><strong>Notificación:</strong> Informar a todos los trabajadores afectados</li><li><strong>Apagado:</strong> Apagar el equipo por medios normales</li><li><strong>Aislamiento:</strong> Operar dispositivos de aislamiento de energía</li><li><strong>Bloqueo y etiquetado:</strong> Colocar candados y etiquetas en cada punto de aislamiento</li><li><strong>Verificación de energía cero:</strong> Confirmar con instrumentos que no hay energía</li></ol>`,
      references: ["OSHA 29 CFR 1910.147", "Brady Corporation - Guía de dispositivos LOTO"],
      durationMinutes: 30,
    },
    {
      title: "Bloqueo Grupal y Situaciones Especiales",
      description: "LOTO con múltiples trabajadores, cambios de turno y procedimientos de emergencia.",
      contentHtml: `<h2>Situaciones Especiales</h2><h3>Bloqueo Grupal</h3><p>Cuando varios trabajadores intervienen el mismo equipo:</p><ul><li>Cada persona coloca su propio candado</li><li>Se usa una <strong>tenaza multipunto (hasp)</strong> que permite varios candados</li><li>Cada trabajador retira SOLO su candado al terminar</li><li>El equipo no puede reiniciarse hasta que TODOS retiren sus candados</li></ul><h3>Cambios de Turno</h3><p>Procedimiento de transferencia:</p><ol><li>El trabajador del turno saliente informa al entrante</li><li>El trabajador entrante coloca su candado</li><li>Solo entonces el saliente retira el suyo</li><li>En ningún momento el equipo queda sin candado</li></ol><h3>Retiro de Candado por Emergencia</h3><p>Solo cuando el trabajador que lo colocó no está disponible:</p><ol><li>Autorización documentada del supervisor</li><li>Verificar que el trabajador no está en la zona</li><li>Intentar contactar al trabajador</li><li>Retirar el candado con llave maestra autorizada</li><li>Notificar al trabajador antes de su próximo turno</li></ol>`,
      references: ["OSHA 29 CFR 1910.147(f)", "ANSI/ASSE Z244.1"],
      durationMinutes: 25,
    },
    {
      title: "Auditoría del Programa LOTO y Capacitación",
      description: "Verificación del cumplimiento, capacitación periódica e indicadores.",
      contentHtml: `<h2>Auditoría y Capacitación</h2><h3>Auditoría Anual</h3><p>La OSHA requiere una <strong>inspección periódica al menos anual</strong> del programa LOTO:</p><ul><li>Revisar procedimientos escritos para cada equipo</li><li>Observar la aplicación real del procedimiento</li><li>Entrevistar a trabajadores autorizados</li><li>Verificar que los dispositivos están en buen estado</li><li>Documentar hallazgos y acciones correctivas</li></ul><h3>Tipos de Trabajadores en LOTO</h3><ul><li><strong>Autorizado:</strong> Aplica el bloqueo. Capacitación completa</li><li><strong>Afectado:</strong> Trabaja en el área bloqueada. Conoce el procedimiento</li><li><strong>Otro:</strong> Cualquier persona que trabaje cerca. Conocimiento básico</li></ul><h3>Capacitación</h3><p>Debe incluir:</p><ul><li>Reconocimiento de fuentes de energía peligrosa</li><li>Procedimiento paso a paso</li><li>Uso correcto de dispositivos</li><li>Práctica supervisada</li><li>Recertificación cuando hay cambios en equipos o procedimientos</li></ul><h3>Indicadores</h3><ul><li>Porcentaje de cumplimiento en auditorías</li><li>Incidentes por falla de LOTO</li><li>Cobertura de procedimientos escritos</li><li>Personal capacitado vs. requerido</li></ul>`,
      references: ["OSHA 29 CFR 1910.147(c)(6)", "ANSI/ASSE Z244.1-2016"],
      durationMinutes: 30,
    },
  ],
  "nom-026-colores-senales-seguridad": [
    {
      title: "Fundamentos de la NOM-026-STPS",
      description: "Objetivo de la norma, colores de seguridad y colores contrastantes.",
      contentHtml: `<h2>NOM-026-STPS-2008</h2><h3>Objetivo</h3><p>Establecer los <strong>colores y señales de seguridad e higiene</strong>, así como la identificación de riesgos por fluidos en tuberías y los criterios de comunicación de peligros.</p><h3>Colores de Seguridad</h3><ul><li><strong>Rojo:</strong> Prohibición, peligro, equipo contra incendio, paro de emergencia</li><li><strong>Amarillo:</strong> Precaución, advertencia, verificación</li><li><strong>Verde:</strong> Condición segura, primeros auxilios, evacuación</li><li><strong>Azul:</strong> Obligación (uso de EPP, acción específica)</li></ul><h3>Colores Contrastantes</h3><p>Acompañan al color de seguridad para mejorar su visibilidad:</p><ul><li>Rojo → <strong>Blanco</strong></li><li>Amarillo → <strong>Negro</strong></li><li>Verde → <strong>Blanco</strong></li><li>Azul → <strong>Blanco</strong></li></ul><h3>Proporción</h3><p>El color de seguridad debe cubrir al menos el <strong>50%</strong> de la superficie de la señal.</p>`,
      references: ["NOM-026-STPS-2008", "ISO 3864-1:2011"],
      durationMinutes: 25,
    },
    {
      title: "Tipos de Señales de Seguridad",
      description: "Formas geométricas, señales de prohibición, obligación, precaución e información.",
      contentHtml: `<h2>Tipos de Señales</h2><h3>Clasificación por Forma</h3><ul><li><strong>Círculo con diagonal (rojo):</strong> PROHIBICIÓN — No fumar, no pasar</li><li><strong>Círculo (azul):</strong> OBLIGACIÓN — Uso de casco, lentes, guantes</li><li><strong>Triángulo (amarillo):</strong> PRECAUCIÓN — Piso resbaloso, alta tensión, material inflamable</li><li><strong>Cuadrado/rectángulo (verde):</strong> INFORMACIÓN — Salida, ruta de evacuación, punto de reunión</li><li><strong>Cuadrado/rectángulo (rojo):</strong> EQUIPO CONTRA INCENDIO — Extintor, hidrante, alarma</li></ul><h3>Requisitos de las Señales</h3><ul><li><strong>Ubicación:</strong> Donde exista el riesgo y sea visible desde cualquier punto de acceso</li><li><strong>Altura:</strong> Al menos 2.10 m del piso en interiores</li><li><strong>Iluminación:</strong> Adecuada para su visibilidad, fotoluminiscentes en rutas de evacuación</li><li><strong>Material:</strong> Resistente al ambiente (intemperie, químicos, temperatura)</li></ul><h3>Señales Complementarias</h3><p>Pueden incluir texto debajo del pictograma. El texto debe ser legible a la distancia de observación y en español.</p>`,
      references: ["NOM-026-STPS-2008", "NOM-003-SEGOB-2011 - Señales y avisos para protección civil"],
      durationMinutes: 30,
    },
    {
      title: "Señalización de Tuberías",
      description: "Código de colores para identificación de fluidos en tuberías industriales.",
      contentHtml: `<h2>Identificación de Tuberías</h2><h3>Código de Colores NOM-026</h3><ul><li><strong>Verde:</strong> Agua (potable, tratada, enfriamiento)</li><li><strong>Gris plata:</strong> Vapor de agua</li><li><strong>Café:</strong> Aceites y combustibles líquidos</li><li><strong>Amarillo ocre:</strong> Gases no licuados (aire comprimido, nitrógeno)</li><li><strong>Violeta:</strong> Ácidos y álcalis</li><li><strong>Azul:</strong> Aire comprimido</li><li><strong>Blanco:</strong> Refrigerantes</li><li><strong>Naranja:</strong> Productos tóxicos</li><li><strong>Rojo:</strong> Sistemas contra incendio</li></ul><h3>Aplicación</h3><ul><li>Franjas o bandas de al menos 100 mm de ancho</li><li>En puntos de: válvulas, conexiones, cambios de dirección, paso por muros</li><li>Flechas indicando la dirección del flujo</li></ul><h3>Información Adicional</h3><p>Junto al color se puede indicar: nombre del fluido, presión, temperatura, dirección del flujo. Especialmente importante para sustancias peligrosas.</p>`,
      references: ["NOM-026-STPS-2008", "ANSI/ASME A13.1 - Pipe Marking"],
      durationMinutes: 25,
    },
    {
      title: "Implementación del Sistema de Señalización",
      description: "Diagnóstico, plan de señalización, mantenimiento y auditoría.",
      contentHtml: `<h2>Implementación</h2><h3>Diagnóstico Inicial</h3><ol><li><strong>Recorrido de campo:</strong> Identificar todos los riesgos por área</li><li><strong>Inventario actual:</strong> Evaluar señalización existente (condición, vigencia, ubicación)</li><li><strong>Brechas:</strong> Identificar áreas sin señalización o con señales deterioradas</li><li><strong>Plano de señalización:</strong> Ubicar cada señal en un plano del centro de trabajo</li></ol><h3>Criterios de Colocación</h3><ul><li><strong>Visible:</strong> Sin obstáculos que impidan su visibilidad</li><li><strong>Distancia de lectura:</strong> El tamaño de la señal debe ser legible a la distancia necesaria</li><li><strong>No saturar:</strong> Demasiadas señales juntas causan que se ignoren</li><li><strong>Consistente:</strong> Usar el mismo estilo en todo el centro de trabajo</li></ul><h3>Mantenimiento</h3><ul><li>Inspección trimestral de condición de señales</li><li>Reemplazo de señales deterioradas, decoloradas o dañadas</li><li>Actualización cuando cambian las condiciones de riesgo</li><li>Limpieza periódica para mantener visibilidad</li></ul><h3>Señalización Fotoluminiscente</h3><p>Obligatoria en <strong>rutas de evacuación</strong>. Se carga con luz ambiental y brilla en oscuridad. Debe mantener visibilidad durante al menos 60 minutos sin energía.</p>`,
      references: ["NOM-026-STPS-2008", "ISO 16069:2017 - Safety Way Guidance Systems"],
      durationMinutes: 30,
    },
  ],
  "herramientas-manuales-poder": [
    {
      title: "Clasificación y Riesgos de Herramientas Manuales",
      description: "Tipos de herramientas, riesgos asociados y causas comunes de accidentes.",
      contentHtml: `<h2>Herramientas Manuales</h2><h3>Clasificación</h3><ul><li><strong>Corte:</strong> Cuchillos, navajas, tijeras, serruchos</li><li><strong>Golpe:</strong> Martillos, mazos, cinceles</li><li><strong>Torsión:</strong> Llaves (españolas, Allen, Stillson), desarmadores</li><li><strong>Sujeción:</strong> Pinzas, alicates, prensas</li><li><strong>Medición:</strong> Flexómetros, escuadras, niveles</li></ul><h3>Riesgos Principales</h3><ul><li><strong>Golpes:</strong> Por martillo, llave que resbala</li><li><strong>Cortes:</strong> Por filos, puntas, rebabas</li><li><strong>Proyección:</strong> Fragmentos de cincel, cabeza de martillo</li><li><strong>Atrapamiento:</strong> Dedos entre herramientas y piezas</li><li><strong>Sobreesfuerzo:</strong> Postura inadecuada, fuerza excesiva</li></ul><h3>Causas de Accidentes</h3><ol><li>Herramienta inadecuada para la tarea (60% de accidentes)</li><li>Herramienta en mal estado (mangos rotos, filos desgastados)</li><li>Falta de EPP (sin guantes, sin lentes)</li><li>Mala técnica de uso</li><li>Almacenamiento inadecuado</li></ol>`,
      references: ["NOM-004-STPS-1999", "OSHA - Hand and Power Tools Safety"],
      durationMinutes: 25,
    },
    {
      title: "Herramientas de Poder y sus Riesgos",
      description: "Tipos de herramientas eléctricas y neumáticas, guardas de seguridad y riesgos.",
      contentHtml: `<h2>Herramientas de Poder</h2><h3>Clasificación por Fuente de Energía</h3><ul><li><strong>Eléctricas:</strong> Taladros, esmeriladoras, sierras, lijadoras</li><li><strong>Neumáticas:</strong> Pistolas de impacto, clavadoras, sopleteras</li><li><strong>Hidráulicas:</strong> Gatos, prensas, cortadoras</li><li><strong>De combustión:</strong> Motosierras, cortadoras de concreto</li></ul><h3>Guardas de Seguridad</h3><p>La <strong>guarda</strong> es una cubierta protectora que:</p><ul><li>Impide contacto con partes móviles (discos, hojas, brocas)</li><li>Contiene proyecciones de material</li><li>NUNCA debe retirarse o desactivarse</li><li>Si está dañada, la herramienta no debe usarse</li></ul><h3>Riesgos Específicos</h3><ul><li><strong>Esmeriladora:</strong> Ruptura del disco (puede ser letal), proyecciones, chispas</li><li><strong>Taladro:</strong> Atrapamiento de ropa/cabello, brocas que se traban</li><li><strong>Sierra circular:</strong> Retroceso (kickback), cortes severos</li><li><strong>Pistola de clavos:</strong> Disparos accidentales, doble disparo</li></ul>`,
      references: ["NOM-004-STPS-1999", "ANSI B11 - Machine Tools Safety"],
      durationMinutes: 30,
    },
    {
      title: "Inspección, Uso Correcto y EPP",
      description: "Inspección pre-uso, técnicas seguras de operación y equipo de protección.",
      contentHtml: `<h2>Uso Seguro</h2><h3>Inspección Pre-Uso (Obligatoria)</h3><ul><li><strong>Manuales:</strong> Mangos sin grietas, filos en buen estado, sin holguras, limpia</li><li><strong>Eléctricas:</strong> Cable sin daño, conexión a tierra, guarda instalada, interruptor funcional</li><li><strong>Neumáticas:</strong> Mangueras sin daño, conexiones seguras, presión correcta</li></ul><h3>Técnicas de Uso Seguro</h3><ol><li>Usar la herramienta correcta para cada tarea</li><li>Verificar que la pieza esté asegurada (no sostener con la mano)</li><li>Mantener la herramienta alejada del cuerpo</li><li>No usar herramientas con las manos mojadas o grasosas</li><li>No usar accesorios no diseñados para la herramienta</li><li>Desconectar antes de cambiar accesorios</li></ol><h3>EPP Requerido</h3><ul><li><strong>Siempre:</strong> Lentes de seguridad</li><li><strong>Corte/esmerilado:</strong> Careta, guantes resistentes a corte</li><li><strong>Impacto/ruido:</strong> Protección auditiva (&gt;85 dB)</li><li><strong>Vibración:</strong> Guantes anti-vibración</li><li><strong>Polvo:</strong> Mascarilla o respirador</li></ul>`,
      references: ["NOM-004-STPS-1999", "NOM-017-STPS-2008"],
      durationMinutes: 25,
    },
    {
      title: "Almacenamiento, Transporte y Programa de Gestión",
      description: "Manejo seguro, almacenamiento ordenado y programa organizacional de herramientas.",
      contentHtml: `<h2>Gestión de Herramientas</h2><h3>Almacenamiento</h3><ul><li>Lugar designado para cada herramienta (tablero, caja, estante)</li><li>Filos y puntas protegidos con fundas o tapas</li><li>Herramientas eléctricas desconectadas y con gatillo bloqueado</li><li>Separadas de humedad, químicos y temperaturas extremas</li></ul><h3>Transporte</h3><ul><li>En cinturones porta-herramientas o cajas cerradas</li><li>NUNCA en bolsillos del pantalón (riesgo de punción)</li><li>Las herramientas de poder se transportan desconectadas y con guarda</li><li>En alturas: usar bolsas de lona con sistema de izado, NUNCA arrojar</li></ul><h3>Programa de Gestión</h3><ol><li><strong>Inventario:</strong> Lista de herramientas por área y responsable</li><li><strong>Inspección periódica:</strong> Calendario de revisión (mensual o trimestral)</li><li><strong>Mantenimiento preventivo:</strong> Afilado, lubricación, calibración</li><li><strong>Baja:</strong> Procedimiento para retirar herramientas defectuosas</li><li><strong>Capacitación:</strong> Uso seguro para todo personal que las utilice</li></ol><p>La regla de oro: <strong>"Si está dañada, no la uses. Si no es la correcta, no la adaptes."</strong></p>`,
      references: ["NOM-004-STPS-1999", "OSHA 1926.301 - Hand Tools"],
      durationMinutes: 25,
    },
  ],
  "ergonomia-trastornos-musculoesqueleticos": [
    {
      title: "Fundamentos de Ergonomía",
      description: "Definición, tipos de ergonomía y su importancia en la prevención de TME.",
      contentHtml: `<h2>Ergonomía</h2><h3>Definición</h3><p>La ergonomía es la ciencia que estudia la <strong>interacción entre las personas y los elementos del sistema de trabajo</strong>, buscando optimizar el bienestar humano y el rendimiento del sistema (IEA, 2000).</p><h3>Tipos de Ergonomía</h3><ul><li><strong>Física:</strong> Posturas, manejo de cargas, movimientos repetitivos, diseño del puesto</li><li><strong>Cognitiva:</strong> Carga mental, toma de decisiones, estrés laboral</li><li><strong>Organizacional:</strong> Diseño de turnos, comunicación, trabajo en equipo</li></ul><h3>Trastornos Musculoesqueléticos (TME)</h3><p>Los TME son <strong>lesiones o trastornos de músculos, tendones, ligamentos, nervios o articulaciones</strong> causados o agravados por el trabajo. Son la primera causa de incapacidad laboral en México.</p><h3>TME más Comunes</h3><ul><li><strong>Lumbalgia:</strong> Dolor de espalda baja (la más frecuente)</li><li><strong>Síndrome del túnel carpiano:</strong> Compresión del nervio mediano en la muñeca</li><li><strong>Tendinitis:</strong> Inflamación de tendones por movimientos repetitivos</li><li><strong>Cervicalgia:</strong> Dolor de cuello por postura sostenida</li><li><strong>Epicondilitis:</strong> "Codo de tenista" por movimientos repetitivos del antebrazo</li></ul>`,
      references: ["IEA - International Ergonomics Association", "NOM-036-1-STPS-2018"],
      durationMinutes: 25,
    },
    {
      title: "Factores de Riesgo Ergonómico",
      description: "Posturas, repetitividad, cargas, vibración y factores ambientales.",
      contentHtml: `<h2>Factores de Riesgo</h2><h3>Posturas Forzadas</h3><ul><li><strong>Flexión/extensión extrema:</strong> Cuello, espalda, muñecas</li><li><strong>Rotación:</strong> Tronco girado por tiempo prolongado</li><li><strong>Postura estática:</strong> Misma posición más de 2 horas continuas</li><li><strong>Postura anti-gravitacional:</strong> Brazos por encima de los hombros</li></ul><h3>Movimientos Repetitivos</h3><p>Movimientos similares más de <strong>2 veces por minuto</strong> durante más de 2 horas. Especialmente riesgosos en manos, muñecas y brazos.</p><h3>Manejo Manual de Cargas</h3><ul><li><strong>Levantamiento:</strong> Principal factor de riesgo para lumbalgia</li><li><strong>Empuje/arrastre:</strong> Carros, tarimas, contenedores</li><li><strong>Transporte:</strong> Cargar objetos caminando</li></ul><h3>NOM-036-1-STPS-2018</h3><p>Establece:</p><ul><li>Límites de peso: <strong>25 kg hombres, 12.5 kg mujeres</strong> (condiciones ideales)</li><li>Obligación de evaluar factores de riesgo ergonómico</li><li>Medidas de prevención y control</li><li>Vigilancia de la salud</li></ul><h3>Otros Factores</h3><ul><li><strong>Vibración:</strong> Herramientas vibratorias → síndrome de mano-brazo</li><li><strong>Compresión:</strong> Bordes duros contra la piel/tejidos</li><li><strong>Temperaturas extremas:</strong> Frío reduce destreza, calor aumenta fatiga</li></ul>`,
      references: ["NOM-036-1-STPS-2018", "ISO 11228 - Ergonomics — Manual handling"],
      durationMinutes: 30,
    },
    {
      title: "Evaluación Ergonómica de Puestos",
      description: "Métodos de evaluación: RULA, REBA, NIOSH, checklist OSHA.",
      contentHtml: `<h2>Métodos de Evaluación</h2><h3>RULA (Rapid Upper Limb Assessment)</h3><p>Evalúa la postura de miembros superiores: cuello, tronco, brazos, muñecas. Puntuación 1-7, donde 7 indica necesidad de cambio inmediato. Ideal para trabajo de oficina y ensamble.</p><h3>REBA (Rapid Entire Body Assessment)</h3><p>Evalúa todo el cuerpo incluyendo piernas. Más completo que RULA. Puntuación 1-15. Útil para posturas dinámicas y manejo de cargas.</p><h3>Ecuación de NIOSH</h3><p>Calcula el <strong>peso límite recomendado (RWL)</strong> para levantamientos:</p><p>RWL = LC × HM × VM × DM × AM × FM × CM</p><p>Donde LC=23 kg (constante), y los multiplicadores consideran: distancia horizontal, vertical, desplazamiento, asimetría, frecuencia y agarre.</p><h3>Checklist de la NOM-036</h3><p>La norma incluye un <strong>cuestionario de verificación</strong> para identificar factores de riesgo en el puesto. Es obligatorio para todos los centros de trabajo donde exista manejo manual de cargas.</p><h3>Proceso de Evaluación</h3><ol><li>Observar la tarea completa</li><li>Documentar posturas con video/fotografía</li><li>Aplicar el método de evaluación apropiado</li><li>Clasificar el nivel de riesgo</li><li>Proponer medidas de control</li></ol>`,
      references: ["McAtamney, L. & Corlett, E.N. (1993). RULA", "Hignett, S. & McAtamney, L. (2000). REBA", "NIOSH Lifting Equation"],
      durationMinutes: 30,
    },
    {
      title: "Intervención Ergonómica y Pausas Activas",
      description: "Rediseño de puestos, pausas activas y programas de ergonomía organizacional.",
      contentHtml: `<h2>Intervención Ergonómica</h2><h3>Rediseño del Puesto de Trabajo</h3><ul><li><strong>Oficina:</strong> Monitor a nivel de ojos (50-70 cm), silla ajustable con soporte lumbar, teclado y ratón a altura de codos</li><li><strong>Industrial:</strong> Altura de mesa de trabajo a nivel de codos, herramientas suspendidas, rotación de tareas</li><li><strong>Almacén:</strong> Productos pesados a la altura de cintura, ayudas mecánicas, plataformas ajustables</li></ul><h3>Pausas Activas</h3><p>Ejercicios breves de 5-10 minutos cada 1-2 horas:</p><ul><li><strong>Cuello:</strong> Rotaciones suaves, inclinaciones laterales</li><li><strong>Hombros:</strong> Encogimientos, rotaciones hacia atrás</li><li><strong>Espalda:</strong> Extensión, gato-vaca, rotación de tronco</li><li><strong>Muñecas:</strong> Flexión/extensión, rotaciones, estiramientos</li><li><strong>Piernas:</strong> Sentadillas suaves, elevación de talones</li></ul><h3>Programa de Ergonomía</h3><ol><li>Compromiso de la dirección</li><li>Capacitación a trabajadores y supervisores</li><li>Evaluación de todos los puestos con riesgo</li><li>Implementación de mejoras priorizadas</li><li>Seguimiento con indicadores (incidencia de TME, ausentismo)</li></ol><p>La inversión en ergonomía tiene un retorno positivo: cada dólar invertido genera <strong>$3-6 dólares</strong> en reducción de costos por lesiones y ausentismo.</p>`,
      references: ["NOM-036-1-STPS-2018", "OSHA Ergonomics - eTool", "Hendrick, H. (2003). Determining the Cost-Effectiveness of Ergonomics"],
      durationMinutes: 30,
    },
  ],
  "soldadura-corte-seguridad": [
    {
      title: "Procesos de Soldadura y sus Riesgos",
      description: "Tipos de soldadura, riesgos físicos, químicos y ergonómicos asociados.",
      contentHtml: `<h2>Procesos de Soldadura</h2><h3>Tipos Principales</h3><ul><li><strong>SMAW (Electrodo revestido):</strong> El más común. Arco eléctrico entre electrodo y pieza</li><li><strong>GMAW (MIG/MAG):</strong> Alambre continuo con gas de protección</li><li><strong>GTAW (TIG):</strong> Electrodo de tungsteno con gas argón. Alta precisión</li><li><strong>Oxiacetileno:</strong> Mezcla de oxígeno y acetileno. Soldadura y corte</li></ul><h3>Riesgos del Soldador</h3><ul><li><strong>Radiación:</strong> UV, IR y luz visible intensa → daño ocular (queratitis actínica, cataratas)</li><li><strong>Humos metálicos:</strong> Partículas de zinc, plomo, cromo, manganeso → enfermedades respiratorias</li><li><strong>Gases tóxicos:</strong> Ozono, monóxido de carbono, óxidos de nitrógeno</li><li><strong>Quemaduras:</strong> Chispas, salpicaduras de metal fundido, radiación</li><li><strong>Incendio/explosión:</strong> Material combustible cercano, contenedores con residuos inflamables</li><li><strong>Descarga eléctrica:</strong> Contacto con partes energizadas del equipo</li><li><strong>Ruido:</strong> Niveles superiores a 85 dB en muchos procesos</li></ul>`,
      references: ["AWS - American Welding Society", "NOM-027-STPS-2008"],
      durationMinutes: 30,
    },
    {
      title: "EPP del Soldador y Protección Radiológica",
      description: "Equipo completo del soldador, filtros ópticos y protección respiratoria.",
      contentHtml: `<h2>EPP del Soldador</h2><h3>Equipo Obligatorio</h3><ul><li><strong>Careta de soldar:</strong> Con filtro del número adecuado según el proceso</li><li><strong>Guantes de carnaza:</strong> Largos (hasta el codo), resistentes al calor</li><li><strong>Peto o mandil de cuero:</strong> Protege tronco de chispas y salpicaduras</li><li><strong>Polainas:</strong> Cubren las botas contra chispas que caen</li><li><strong>Calzado de seguridad:</strong> Con casquillo, resistente al calor</li><li><strong>Protección respiratoria:</strong> Según contaminante y concentración</li></ul><h3>Filtros Ópticos</h3><p>El número del filtro depende del proceso y amperaje:</p><ul><li><strong>Oxicorte:</strong> No. 3-5</li><li><strong>SMAW (hasta 160A):</strong> No. 10-11</li><li><strong>SMAW (160-250A):</strong> No. 12</li><li><strong>SMAW (250-500A):</strong> No. 14</li><li><strong>MIG/MAG:</strong> No. 10-14 según amperaje</li><li><strong>TIG:</strong> No. 10-14 según amperaje</li></ul><h3>Caretas Autooscurecibles</h3><p>Caretas electrónicas que se oscurecen automáticamente al detectar el arco. Ventajas: permiten ver sin levantar la careta, reducen fatiga visual.</p>`,
      references: ["NOM-017-STPS-2008", "ANSI Z87.1 - Eye and Face Protection"],
      durationMinutes: 25,
    },
    {
      title: "Trabajo en Caliente y Permisos",
      description: "Permiso de trabajo en caliente, vigilancia contra incendio y espacios confinados.",
      contentHtml: `<h2>Trabajo en Caliente</h2><h3>¿Qué es?</h3><p>Cualquier operación que genere chispas, llama abierta o calor suficiente para encender materiales combustibles: soldadura, corte, esmerilado, uso de soplete.</p><h3>Permiso de Trabajo en Caliente</h3><p>Documento obligatorio cuando se suelda fuera de áreas designadas:</p><ol><li><strong>Evaluación del área:</strong> Identificar materiales combustibles en 11 metros</li><li><strong>Preparación:</strong> Retirar o cubrir combustibles, mojar el área</li><li><strong>Protección:</strong> Mantas ignífugas, extintor disponible</li><li><strong>Autorización:</strong> Firma del responsable de área</li><li><strong>Vigía:</strong> Persona dedicada a vigilar durante y después del trabajo</li></ol><h3>Vigilancia Post-Trabajo</h3><p>El vigía debe permanecer al menos <strong>30-60 minutos después</strong> de finalizar la soldadura para detectar posibles focos de incendio latente.</p><h3>Soldadura en Espacios Confinados</h3><p>Riesgos adicionales:</p><ul><li>Acumulación de gases tóxicos y humos</li><li>Deficiencia de oxígeno</li><li>Requiere ventilación forzada y monitoreo de atmósfera</li><li>Permiso de entrada a espacio confinado adicional al de trabajo en caliente</li></ul>`,
      references: ["NFPA 51B - Fire Prevention During Welding", "NOM-033-STPS-2015 - Espacios confinados"],
      durationMinutes: 30,
    },
    {
      title: "Manejo Seguro de Gases y Cilindros",
      description: "Almacenamiento, transporte e inspección de cilindros de gas para soldadura.",
      contentHtml: `<h2>Gases y Cilindros</h2><h3>Gases Comunes en Soldadura</h3><ul><li><strong>Acetileno:</strong> Gas combustible. Extremadamente inflamable, inestable a más de 15 psi sin disolver</li><li><strong>Oxígeno:</strong> Comburente. No es inflamable pero acelera violentamente la combustión</li><li><strong>Argón:</strong> Gas inerte de protección (TIG, MIG)</li><li><strong>CO2:</strong> Gas de protección (MAG)</li><li><strong>Mezclas:</strong> Argón/CO2 para aplicaciones específicas</li></ul><h3>Almacenamiento de Cilindros</h3><ul><li>Verticales, asegurados con cadena o rack</li><li>Separar <strong>oxígeno de combustibles</strong> mínimo 6 metros o barrera de 1.5 m</li><li>Lejos de fuentes de calor y chispas</li><li>Área ventilada, techada, señalizada</li><li>Capuchón protector siempre colocado cuando no se usa</li></ul><h3>Transporte</h3><ul><li>En carretilla porta-cilindros, nunca rodarlos o arrastrarlos</li><li>Capuchón puesto y válvula cerrada</li><li>No transportar con regulador instalado</li><li>No levantar por la válvula</li></ul><h3>Inspección</h3><p>Verificar: fecha de prueba hidrostática vigente, sin abolladuras o corrosión, válvula en buen estado, no expuestos a más de 52°C.</p>`,
      references: ["CGA - Compressed Gas Association", "NOM-002-STPS-2010"],
      durationMinutes: 30,
    },
  ],
  "operacion-segura-montacargas": [
    {
      title: "Fundamentos del Montacargas y Certificación",
      description: "Tipos de montacargas, marco legal y requisitos de certificación del operador.",
      contentHtml: `<h2>Fundamentos del Montacargas</h2><h3>Tipos de Montacargas</h3><ul><li><strong>Contrabalanceado:</strong> El más común. Motor y contrapeso en la parte trasera</li><li><strong>De alcance (Reach):</strong> Para pasillos angostos, horquillas extensibles</li><li><strong>Apilador:</strong> Compacto, para espacios reducidos</li><li><strong>Order Picker:</strong> El operador se eleva con la plataforma</li><li><strong>Todoterreno:</strong> Para exteriores, terreno irregular</li></ul><h3>Fuentes de Energía</h3><ul><li><strong>Eléctrico:</strong> Interiores, sin emisiones. Requiere área de carga de baterías</li><li><strong>GLP (Gas LP):</strong> Interior y exterior. Requiere ventilación adecuada</li><li><strong>Diésel:</strong> Solo exteriores. Mayor capacidad de carga</li></ul><h3>Certificación del Operador</h3><p>La STPS requiere que todo operador tenga:</p><ul><li><strong>DC-3:</strong> Constancia de capacitación vigente</li><li><strong>Capacitación teórica:</strong> Principios de operación, riesgos, normatividad</li><li><strong>Capacitación práctica:</strong> Operación supervisada, maniobras, emergencias</li><li><strong>Evaluación:</strong> Teórica y práctica aprobada</li></ul>`,
      references: ["NOM-006-STPS-2014", "OSHA 29 CFR 1910.178"],
      durationMinutes: 30,
    },
    {
      title: "Estabilidad y Capacidad de Carga",
      description: "Triángulo de estabilidad, centro de carga, placa de datos y factores de vuelco.",
      contentHtml: `<h2>Estabilidad del Montacargas</h2><h3>Triángulo de Estabilidad</h3><p>El montacargas tiene tres puntos de apoyo que forman un triángulo:</p><ul><li>Dos puntos en el eje delantero (ruedas con la carga)</li><li>Un punto de pivote en el eje trasero (dirección)</li></ul><p>Para mantener la estabilidad, el <strong>centro de gravedad combinado</strong> (montacargas + carga) debe permanecer dentro del triángulo.</p><h3>Centro de Carga</h3><p>Distancia desde la cara de las horquillas hasta el centro de gravedad de la carga. El estándar es <strong>600 mm (24 pulgadas)</strong>. Si la carga tiene un centro de carga mayor, la capacidad se reduce.</p><h3>Placa de Datos</h3><p>Información crítica que nunca debe retirarse:</p><ul><li>Modelo y número de serie</li><li>Capacidad nominal de carga</li><li>Centro de carga estándar</li><li>Altura máxima de elevación</li><li>Peso del montacargas</li><li>Tipo de combustible/energía</li></ul><h3>Factores de Vuelco</h3><ul><li>Exceder la capacidad de carga</li><li>Carga mal centrada o inestable</li><li>Girar a velocidad excesiva</li><li>Transitar por pendientes pronunciadas</li><li>Operar con horquillas elevadas</li></ul>`,
      references: ["NOM-006-STPS-2014", "OSHA eTool - Powered Industrial Trucks"],
      durationMinutes: 30,
    },
    {
      title: "Operación Segura y Maniobras",
      description: "Inspección pre-operacional, técnicas de conducción y reglas de tránsito interno.",
      contentHtml: `<h2>Operación Segura</h2><h3>Inspección Pre-Operacional</h3><p>Antes de cada turno, el operador debe verificar:</p><ul><li><strong>Visual:</strong> Daños en estructura, horquillas, cadenas, mástil, llantas</li><li><strong>Fluidos:</strong> Aceite motor, hidráulico, refrigerante, electrolito de batería</li><li><strong>Funcional:</strong> Frenos (servicio y estacionamiento), dirección, claxon, alarma de reversa</li><li><strong>Elevación:</strong> Subir/bajar horquillas, inclinar mástil adelante/atrás</li><li><strong>Luces:</strong> Faros, intermitentes, estrobo (si aplica)</li></ul><h3>Reglas de Operación</h3><ul><li>Horquillas a 15-20 cm del piso durante traslado</li><li>Mástil inclinado ligeramente hacia atrás</li><li>Velocidad máxima: 5-10 km/h en interiores</li><li>Reducir velocidad en intersecciones, esquinas y zonas peatonales</li><li>Siempre ceder el paso a peatones</li><li>No usar celular mientras opera</li></ul><h3>Maniobras en Pendientes</h3><ul><li><strong>Subir con carga:</strong> De frente (carga cuesta arriba)</li><li><strong>Bajar con carga:</strong> De reversa (carga cuesta arriba)</li><li><strong>Sin carga:</strong> Invertir las reglas</li><li>Nunca girar en una pendiente</li></ul>`,
      references: ["NOM-006-STPS-2014", "OSHA 29 CFR 1910.178(n)"],
      durationMinutes: 30,
    },
    {
      title: "Emergencias y Responsabilidades del Operador",
      description: "Situaciones de emergencia, prohibiciones y responsabilidad legal del operador.",
      contentHtml: `<h2>Emergencias y Responsabilidades</h2><h3>Qué Hacer en Caso de Vuelco</h3><ol><li><strong>NO saltar:</strong> El montacargas tiene estructura ROPS (protección contra vuelco)</li><li>Agarrarse firmemente del volante</li><li>Inclinarse hacia el lado contrario del vuelco</li><li>Mantener el cinturón de seguridad puesto en todo momento</li></ol><h3>Prohibiciones Absolutas</h3><ul><li><strong>No transportar personas</strong> en las horquillas, plataformas o cargas</li><li><strong>No elevar personas</strong> sin plataforma aprobada y asegurada</li><li><strong>No bloquear</strong> salidas de emergencia o equipo contra incendio</li><li><strong>No operar</strong> bajo efectos de alcohol, drogas o medicamentos que alteren la atención</li><li><strong>No competir</strong> o hacer maniobras innecesarias</li></ul><h3>Estacionamiento</h3><ol><li>Superficie plana y nivelada</li><li>Horquillas completamente abajo, planas contra el piso</li><li>Freno de estacionamiento aplicado</li><li>Motor apagado y llave retirada</li><li>Si está en pendiente, calzar las ruedas</li></ol><h3>Responsabilidad Legal</h3><p>El operador puede ser responsable civil y penalmente por accidentes causados por negligencia o incumplimiento de normas.</p>`,
      references: ["NOM-006-STPS-2014", "LFT - Responsabilidades laborales"],
      durationMinutes: 25,
    },
  ],
  "actualizacion-montacargas": [
    {
      title: "Nuevas Tecnologías en Montacargas",
      description: "Sistemas de asistencia, telemetría y montacargas autónomos.",
      contentHtml: `<h2>Tecnologías Modernas</h2><h3>Sistemas de Asistencia al Operador</h3><ul><li><strong>Cámaras de reversa:</strong> Visibilidad trasera en pantalla integrada</li><li><strong>Sensores de proximidad:</strong> Alertan presencia de personas u objetos</li><li><strong>Limitadores de velocidad:</strong> Reducen velocidad automáticamente en zonas designadas</li><li><strong>Sistemas anti-colisión:</strong> Detectan otros montacargas y objetos fijos</li></ul><h3>Telemetría</h3><p>Sistemas de monitoreo remoto que registran:</p><ul><li>Ubicación en tiempo real (GPS/UWB)</li><li>Velocidad, aceleraciones y frenadas bruscas</li><li>Horas de operación y tiempos muertos</li><li>Impactos y sacudidas (detección de accidentes)</li><li>Identificación del operador (acceso por PIN o tarjeta)</li></ul><h3>Montacargas Autónomos (AGV/AMR)</h3><p>Vehículos guiados automáticamente que:</p><ul><li>Siguen rutas predefinidas o navegan de forma autónoma</li><li>Detectan obstáculos y se detienen automáticamente</li><li>Operan 24/7 sin fatiga</li><li>Requieren infraestructura de guía (magnética, láser, visión artificial)</li></ul><p>Aún requieren <strong>supervisión humana</strong> y personal capacitado para mantenimiento e intervención.</p>`,
      references: ["Material Handling Institute (MHI)", "AGV/AMR Safety Standards - ANSI/ITSDF B56.5"],
      durationMinutes: 30,
    },
    {
      title: "Montacargas Eléctricos y Sustentabilidad",
      description: "Baterías de litio-ion, carga rápida, ventajas ambientales y consideraciones.",
      contentHtml: `<h2>Montacargas Eléctricos</h2><h3>Evolución de Baterías</h3><ul><li><strong>Plomo-ácido (tradicional):</strong> Bajo costo, pero requiere mantenimiento, gases de hidrógeno durante carga</li><li><strong>Litio-ion (Li-ion):</strong> Sin mantenimiento, carga de oportunidad, sin gases, mayor vida útil</li></ul><h3>Ventajas de Li-ion</h3><ul><li>Carga en cualquier momento sin efecto memoria</li><li>Carga completa en 1-2 horas vs. 8 horas plomo-ácido</li><li>Sin necesidad de área de carga especializada con ventilación</li><li>Sin derrames de ácido</li><li>30% más eficientes energéticamente</li></ul><h3>Consideraciones de Seguridad</h3><ul><li><strong>Plomo-ácido:</strong> Área de carga ventilada (gases de hidrógeno explosivos), protección contra derrames de ácido sulfúrico, EPP para manipulación</li><li><strong>Li-ion:</strong> Riesgo de fuga térmica (thermal runaway), requiere cargadores certificados, no perforar ni dañar la batería</li></ul><h3>Sustentabilidad</h3><p>Los montacargas eléctricos eliminan emisiones directas, reducen ruido y tienen menor huella de carbono. Muchas empresas migran a flotas 100% eléctricas como parte de sus compromisos ESG.</p>`,
      references: ["OSHA - Battery Charging Safety", "EPA - Sustainable Materials Management"],
      durationMinutes: 25,
    },
    {
      title: "Actualizaciones Normativas y Recertificación",
      description: "Cambios en NOM-006, recertificación de operadores y mejores prácticas.",
      contentHtml: `<h2>Actualizaciones Normativas</h2><h3>NOM-006-STPS-2014 — Puntos Clave</h3><ul><li>Obligación de capacitación y evaluación para todo operador</li><li>Inspección diaria documentada del montacargas</li><li>Mantenimiento preventivo con registro</li><li>Señalización de zonas de tránsito de montacargas</li><li>Protección para peatones (barreras, espejos, alertas)</li></ul><h3>Recertificación</h3><p>Se recomienda cada <strong>3 años</strong> o cuando:</p><ul><li>El operador comete una infracción de seguridad</li><li>Ocurre un accidente o casi-accidente</li><li>Cambia el tipo de montacargas</li><li>Cambian las condiciones del área de operación</li><li>La evaluación periódica detecta deficiencias</li></ul><h3>Mejores Prácticas Actuales</h3><ul><li><strong>Gestión de tráfico:</strong> Separar zonas peatonales y vehiculares</li><li><strong>Simuladores:</strong> Capacitación inicial en simulador antes del equipo real</li><li><strong>Coaching en campo:</strong> Observación y retroalimentación periódica</li><li><strong>Indicadores:</strong> Tasas de incidentes, daños a producto, cumplimiento de inspecciones</li></ul>`,
      references: ["NOM-006-STPS-2014", "OSHA 29 CFR 1910.178(l)"],
      durationMinutes: 30,
    },
    {
      title: "Casos de Estudio y Lecciones Aprendidas",
      description: "Análisis de accidentes reales con montacargas y lecciones para la prevención.",
      contentHtml: `<h2>Casos de Estudio</h2><h3>Caso 1: Vuelco Lateral</h3><p><strong>Situación:</strong> Operador giró bruscamente con carga elevada a velocidad excesiva.</p><p><strong>Consecuencia:</strong> Vuelco lateral, operador sin cinturón fue expulsado y el montacargas cayó sobre él.</p><p><strong>Lecciones:</strong></p><ul><li>Siempre usar cinturón de seguridad</li><li>Bajar la carga antes de girar</li><li>Reducir velocidad en curvas</li></ul><h3>Caso 2: Atropellamiento de Peatón</h3><p><strong>Situación:</strong> Peatón cruzó detrás de montacargas en reversa sin alarma funcional.</p><p><strong>Consecuencia:</strong> Fractura de pierna del peatón.</p><p><strong>Lecciones:</strong></p><ul><li>Inspección diaria debe verificar alarma de reversa</li><li>Espejos convexos en intersecciones</li><li>Rutas separadas para peatones y montacargas</li></ul><h3>Caso 3: Caída de Carga desde Altura</h3><p><strong>Situación:</strong> Carga mal estibada se deslizó al elevarla a tercer nivel de rack.</p><p><strong>Consecuencia:</strong> Daño a producto y equipo. Sin lesiones por fortuna.</p><p><strong>Lecciones:</strong></p><ul><li>Verificar estabilidad de la carga antes de elevar</li><li>Usar film stretch o flejes cuando sea necesario</li><li>No exceder capacidad en altura</li></ul>`,
      references: ["OSHA Fatal Facts - Forklift Accidents", "CSB - Chemical Safety Board Investigations"],
      durationMinutes: 25,
    },
  ],
  "nom-019-comisiones-seguridad-higiene": [
    {
      title: "Marco Legal y Constitución de la Comisión",
      description: "Fundamento legal, obligación de constituir la comisión y proceso de integración.",
      contentHtml: `<h2>Comisiones de Seguridad e Higiene</h2><h3>Fundamento Legal</h3><ul><li><strong>Art. 509 LFT:</strong> En cada empresa se organizarán comisiones de seguridad e higiene</li><li><strong>NOM-019-STPS-2011:</strong> Establece la constitución, integración, organización y funcionamiento</li><li><strong>RFSHMAT:</strong> Reglamento Federal de Seguridad, Higiene y Medio Ambiente de Trabajo</li></ul><h3>¿Quiénes deben constituirla?</h3><p><strong>Todos los centros de trabajo</strong> deben tener al menos una comisión de seguridad e higiene, sin importar el número de trabajadores o giro.</p><h3>Proceso de Constitución</h3><ol><li>Convocar a representantes de trabajadores y patrón</li><li>Elegir representantes de forma paritaria (igual número de cada parte)</li><li>Levantar acta constitutiva con datos del centro de trabajo</li><li>Registrar nombres y firmas de los integrantes</li><li>Definir el programa anual de actividades</li></ol><h3>Composición</h3><ul><li><strong>Coordinador:</strong> Dirige las actividades de la comisión</li><li><strong>Secretario:</strong> Lleva los registros y actas</li><li><strong>Vocales:</strong> Participan en recorridos e investigaciones</li></ul>`,
      references: ["NOM-019-STPS-2011", "Ley Federal del Trabajo - Art. 509-510"],
      durationMinutes: 30,
    },
    {
      title: "Funciones y Actividades de la Comisión",
      description: "Recorridos de verificación, investigación de accidentes y programa anual.",
      contentHtml: `<h2>Funciones de la Comisión</h2><h3>Funciones Principales</h3><ul><li>Identificar condiciones peligrosas y actos inseguros</li><li>Investigar accidentes y enfermedades de trabajo</li><li>Proponer medidas preventivas y correctivas</li><li>Vigilar el cumplimiento de las normas de seguridad</li><li>Promover la cultura de seguridad entre los trabajadores</li></ul><h3>Recorridos de Verificación</h3><p>Deben realizarse al menos <strong>cada 90 días</strong> (trimestralmente):</p><ol><li>Planificar el recorrido (áreas, checklist, participantes)</li><li>Recorrer todas las áreas del centro de trabajo</li><li>Identificar condiciones peligrosas y actos inseguros</li><li>Documentar hallazgos con evidencia fotográfica</li><li>Elaborar el acta de recorrido</li><li>Dar seguimiento a las recomendaciones</li></ol><h3>Investigación de Accidentes</h3><p>La comisión debe investigar <strong>todos los accidentes</strong> que ocurran:</p><ul><li>Acudir al lugar lo antes posible</li><li>Entrevistar al accidentado y testigos</li><li>Recopilar evidencia</li><li>Determinar causas (actos y condiciones inseguras)</li><li>Proponer medidas para evitar recurrencia</li></ul>`,
      references: ["NOM-019-STPS-2011", "STPS - Guía para recorridos de verificación"],
      durationMinutes: 30,
    },
    {
      title: "Documentación y Registros de la Comisión",
      description: "Actas, bitácoras, formatos y evidencia documental requerida.",
      contentHtml: `<h2>Documentación</h2><h3>Documentos Obligatorios</h3><ul><li><strong>Acta constitutiva:</strong> Fecha, datos del centro de trabajo, integrantes, firmas</li><li><strong>Programa anual:</strong> Calendario de recorridos, capacitaciones, actividades</li><li><strong>Actas de recorrido:</strong> Hallazgos, evidencia, recomendaciones, seguimiento</li><li><strong>Actas de investigación de accidentes:</strong> Análisis de causas y medidas preventivas</li><li><strong>Minutas de reuniones:</strong> Acuerdos, seguimiento de acciones</li></ul><h3>Formato del Acta de Recorrido</h3><ol><li>Fecha, hora y área recorrida</li><li>Integrantes presentes</li><li>Condiciones peligrosas encontradas</li><li>Actos inseguros observados</li><li>Evidencia (fotografías, mediciones)</li><li>Recomendaciones y plazos</li><li>Seguimiento de recomendaciones anteriores</li><li>Firmas de los participantes</li></ol><h3>Conservación</h3><p>Toda la documentación debe conservarse por al menos <strong>5 años</strong> y estar disponible para inspección de la STPS.</p>`,
      references: ["NOM-019-STPS-2011", "RFSHMAT - Art. 124-127"],
      durationMinutes: 25,
    },
    {
      title: "Capacitación, Evaluación y Mejora Continua",
      description: "Formación de los integrantes, indicadores de gestión y mejora del programa.",
      contentHtml: `<h2>Capacitación y Mejora</h2><h3>Capacitación de Integrantes</h3><p>Los miembros de la comisión deben recibir capacitación en:</p><ul><li>Funcionamiento de la comisión (NOM-019)</li><li>Identificación de condiciones peligrosas</li><li>Investigación de accidentes</li><li>Normas de seguridad aplicables al centro de trabajo</li><li>Primeros auxilios básicos</li></ul><h3>Duración del Cargo</h3><p>Los representantes duran <strong>2 años</strong> en funciones y pueden ser reelectos. La renovación escalonada permite continuidad.</p><h3>Indicadores de Gestión</h3><ul><li><strong>Cumplimiento de recorridos:</strong> Realizados vs. programados</li><li><strong>Cierre de hallazgos:</strong> Recomendaciones implementadas vs. emitidas</li><li><strong>Tiempo de cierre:</strong> Días promedio para resolver un hallazgo</li><li><strong>Accidentabilidad:</strong> Tasa de frecuencia y gravedad</li></ul><h3>Mejora Continua</h3><p>La comisión debe:</p><ol><li>Revisar su programa anual al final de cada periodo</li><li>Analizar tendencias de accidentabilidad</li><li>Actualizar procedimientos según lecciones aprendidas</li><li>Participar en la capacitación continua</li><li>Compartir buenas prácticas entre áreas</li></ol><p>Una comisión activa y bien capacitada puede reducir la accidentabilidad hasta en un <strong>50%</strong>.</p>`,
      references: ["NOM-019-STPS-2011", "OIT - Seguridad y salud en el trabajo"],
      durationMinutes: 30,
    },
  ],
};

export const EXTRA_QUIZ_DATA: Record<string, { title: string; passingScore: number; questions: { question: string; options: string[]; correctIndex: number; explanation: string }[] }> = {
"diagnostico-prevencion-bullying": {
  title: "Evaluación: Diagnóstico, Prevención e Intervención del Bullying",
  passingScore: 70,
  questions: [
    { question: "¿Cuáles son los 4 criterios para identificar bullying?", options: ["Intencionalidad, repetición, desequilibrio de poder, indefensión", "Agresión, duración, jerarquía, daño", "Frecuencia, gravedad, intención, público", "Violencia, aislamiento, poder, repetición"], correctIndex: 0, explanation: "Los 4 criterios clave son: intencionalidad, repetición (patrón sostenido), desequilibrio de poder y situación de indefensión de la víctima." },
    { question: "El mobbing vertical descendente (bossing) se refiere a:", options: ["Acoso entre compañeros del mismo nivel", "Acoso del jefe hacia el subordinado", "Acoso del subordinado hacia el jefe", "Acoso de clientes hacia empleados"], correctIndex: 1, explanation: "El bossing es el acoso ejercido desde una posición de autoridad hacia un subordinado." },
    { question: "¿Cuál de estos NO es un factor organizacional que propicia el bullying?", options: ["Cultura permisiva ante la agresión", "Alta productividad del equipo", "Ausencia de protocolos de denuncia", "Liderazgo negligente"], correctIndex: 1, explanation: "La alta productividad no propicia bullying. Los factores organizacionales incluyen culturas permisivas, falta de protocolos y liderazgo negligente." },
    { question: "En el triángulo del bullying, ¿cuál es el rol más crucial para romper el ciclo?", options: ["El agresor", "La víctima", "Los espectadores/testigos", "El departamento de RH"], correctIndex: 2, explanation: "Los espectadores pueden romper el ciclo al dejar de ser pasivos y convertirse en defensores activos de la víctima." },
    { question: "¿Cuál es el primer paso del protocolo de intervención organizacional?", options: ["Sancionar al agresor", "Documentar los hechos", "Detección mediante canales confidenciales", "Separar a las partes involucradas"], correctIndex: 2, explanation: "La detección es el primer paso, implementando canales de denuncia confidenciales y capacitando líderes para reconocer señales." },
    { question: "Los factores de la víctima (introversión, ser nuevo, etc.):", options: ["Justifican parcialmente el acoso", "Nunca justifican el bullying", "Son la causa principal del bullying", "Pueden eliminarse con capacitación"], correctIndex: 1, explanation: "Los factores de la víctima NUNCA justifican el bullying. La responsabilidad siempre es del agresor y del sistema que lo permite." },
    { question: "El costo estimado del mobbing para una organización por caso es:", options: ["$1,000 a $5,000 USD", "$15,000 a $50,000 USD", "$100,000 a $500,000 USD", "No tiene costo medible"], correctIndex: 1, explanation: "Estudios estiman entre $15,000 y $50,000 USD por caso al sumar ausentismo, rotación, pérdida de productividad y costos legales." }
  ]
},

"camino-autodependencia": {
  title: "Evaluación: Camino a la Autodependencia",
  passingScore: 70,
  questions: [
    { question: "¿Qué es la autodependencia?", options: ["No necesitar a nadie nunca", "Hacerte cargo de tus emociones, decisiones y bienestar", "Ser autosuficiente en todo", "Evitar relaciones para no depender"], correctIndex: 1, explanation: "La autodependencia es la capacidad de hacerte cargo de ti mismo — emociones, decisiones y bienestar — sin depender emocionalmente de otros." },
    { question: "¿Cuál es la diferencia entre autodependencia y contradependencia?", options: ["Son lo mismo", "La autodependencia elige estar con otros desde la libertad; la contradependencia rechaza toda cercanía por miedo", "La contradependencia es más saludable", "La autodependencia es un estado temporal"], correctIndex: 1, explanation: "La contradependencia ('no necesito a nadie') es miedo a la vulnerabilidad disfrazado de fortaleza. La autodependencia permite elegir relaciones desde la libertad." },
    { question: "Según el modelo de Kübler-Ross, las etapas del duelo son:", options: ["Tristeza, enojo, aceptación", "Negación, enojo, negociación, tristeza, aceptación", "Shock, llanto, superación", "Rechazo, ira, resignación"], correctIndex: 1, explanation: "Las 5 etapas son: negación, enojo, negociación, tristeza y aceptación. No son lineales ni tienen un tiempo definido." },
    { question: "Según Viktor Frankl, los tres caminos hacia el sentido de vida son:", options: ["Dinero, poder y fama", "Valores de creación, de experiencia y de actitud", "Trabajo, familia y salud", "Éxito, reconocimiento y trascendencia"], correctIndex: 1, explanation: "Frankl propone: valores de creación (lo que aportas), de experiencia (lo que recibes) y de actitud (tu postura ante el sufrimiento)." },
    { question: "¿Qué son los 'mandatos' en el contexto de autodependencia?", options: ["Órdenes laborales del jefe", "Mensajes inconscientes recibidos desde la infancia que se convierten en creencias", "Reglas de la cooperativa", "Leyes que debemos cumplir"], correctIndex: 1, explanation: "Los mandatos son mensajes que internalizamos desde la infancia ('no llores', 'sé fuerte') y que guían nuestro comportamiento de forma inconsciente." },
    { question: "Poner límites en una relación es:", options: ["Ser egoísta", "Ser honesto sobre lo que sí y lo que no estás dispuesto a aceptar", "Rechazar al otro", "Señal de baja autoestima"], correctIndex: 1, explanation: "Poner límites es un acto de honestidad y respeto propio. Los límites claros generan relaciones más sanas al eliminar el resentimiento." },
    { question: "La completitud, según este curso, significa:", options: ["Ser perfecto en todo", "Aceptar que ya eres completo con lo que eres y tienes", "Lograr todas tus metas", "No tener carencias ni necesidades"], correctIndex: 1, explanation: "Ser completo no es ser perfecto ni no tener carencias. Es aceptar que con lo que eres hoy puedes vivir una vida con sentido." }
  ]
},

"valores-humanos-organizacion": {
  title: "Evaluación: Valores Humanos en la Organización",
  passingScore: 70,
  questions: [
    { question: "Los valores son:", options: ["Opiniones pasajeras sobre lo correcto", "Principios profundos que guían nuestras decisiones y comportamientos", "Reglas impuestas por la empresa", "Sentimientos que cambian según el día"], correctIndex: 1, explanation: "Los valores son principios profundos que guían decisiones, actitudes y comportamientos. Son lo que hacemos cuando nadie nos ve." },
    { question: "Según Louis Raths, un valor genuino cumple 7 criterios. ¿Cuál NO es uno de ellos?", options: ["Elegido libremente", "Impuesto por la autoridad", "Actuado de manera consistente", "Afirmado públicamente"], correctIndex: 1, explanation: "Un valor genuino debe ser elegido libremente, no impuesto. Los 7 criterios incluyen libre elección, consideración de alternativas, consecuencias, aprecio, afirmación pública y acción consistente." },
    { question: "Cuando los valores personales y organizacionales están en conflicto:", options: ["No importa, el trabajo es solo trabajo", "Surge malestar, desmotivación y eventualmente la salida", "Los valores personales siempre deben ceder", "Los valores organizacionales no existen realmente"], correctIndex: 1, explanation: "El conflicto de valores genera malestar profundo, desmotivación y eventualmente la persona busca irse o se desconecta emocionalmente." },
    { question: "La mejor forma de descubrir tus valores REALES (no los declarados) es:", options: ["Hacer un test de personalidad", "Observar en qué gastas tu tiempo y dinero", "Preguntar a tu familia", "Leer libros de autoayuda"], correctIndex: 1, explanation: "Tus prioridades reales se revelan en cómo distribuyes tu tiempo y dinero — ahí están tus valores en acción." },
    { question: "En una cooperativa, los valores cooperativos incluyen:", options: ["Competencia y jerarquía", "Solidaridad, democracia, equidad y responsabilidad", "Individualismo y eficiencia", "Obediencia y disciplina"], correctIndex: 1, explanation: "Los principios cooperativos de la ACI incluyen solidaridad, democracia, equidad, responsabilidad, transparencia y preocupación por la comunidad." },
    { question: "Ver el trabajo como 'vocación' significa:", options: ["Trabajar sin cobrar", "Encontrar significado y propósito en el trabajo mismo", "Solo trabajar en lo que te gusta", "Tener un título profesional"], correctIndex: 1, explanation: "La vocación es ver el trabajo como expresión de propósito — 'trabajo porque esto importa y contribuyo a algo mayor'." },
    { question: "La coherencia entre valores y acciones:", options: ["No importa si actúas diferente a lo que crees", "Fortalece la autoestima y la integridad personal", "Es imposible de lograr", "Solo importa en el trabajo, no en la vida personal"], correctIndex: 1, explanation: "Actuar coherentemente con tus valores fortalece tu autoestima e integridad. Cada vez que los traicionas, tu confianza en ti mismo se erosiona." }
  ]
},

"como-es-mi-comunicacion": {
  title: "Evaluación: Cómo Es Mi Comunicación",
  passingScore: 70,
  questions: [
    { question: "¿Cuál es el estilo de comunicación más efectivo?", options: ["Pasivo", "Agresivo", "Asertivo", "Evasivo"], correctIndex: 2, explanation: "El estilo asertivo expresa necesidades y opiniones con respeto, escucha activamente y pone límites sin agredir." },
    { question: "El modelo ABC de Albert Ellis establece que nuestras emociones son causadas por:", options: ["Las situaciones directamente", "Nuestra interpretación (creencias) sobre las situaciones", "Otras personas", "Nuestros genes"], correctIndex: 1, explanation: "No son las situaciones (A) las que causan emociones (C), sino las creencias/interpretaciones (B) que hacemos sobre ellas." },
    { question: "La 'catastrofización' es:", options: ["Un tipo de comunicación asertiva", "Una distorsión cognitiva que imagina el peor escenario posible", "Una técnica de escucha activa", "Un estilo de liderazgo"], correctIndex: 1, explanation: "La catastrofización es una distorsión cognitiva donde imaginamos que todo será 'un desastre total' sin evidencia que lo respalde." },
    { question: "La escucha activa incluye:", options: ["Pensar en tu respuesta mientras el otro habla", "Parafrasear, no interrumpir y validar emociones", "Dar consejos inmediatamente", "Cambiar de tema cuando no estás de acuerdo"], correctIndex: 1, explanation: "La escucha activa implica parafrasear ('lo que entiendo es que...'), no interrumpir, hacer preguntas abiertas y validar emociones." },
    { question: "Según la investigación, una persona tiene entre:", options: ["100 y 500 pensamientos al día", "1,000 y 5,000 pensamientos al día", "12,000 y 60,000 pensamientos al día", "Más de 100,000 pensamientos al día"], correctIndex: 2, explanation: "Se estima que tenemos entre 12,000 y 60,000 pensamientos diarios, la mayoría automáticos y repetitivos." },
    { question: "¿Qué factor es el predictor más fuerte de bienestar y longevidad?", options: ["El dinero", "El estatus social", "La calidad de las relaciones y la comunicación", "La genética"], correctIndex: 2, explanation: "Investigaciones como el Harvard Study of Adult Development muestran que las relaciones sólidas predicen más el bienestar que el dinero, estatus o genética." },
    { question: "Para cambiar el diálogo interior negativo, el primer paso es:", options: ["Ignorar los pensamientos negativos", "Detectar el pensamiento automático negativo", "Pensar solo cosas positivas", "Dejar de pensar"], correctIndex: 1, explanation: "El primer paso es detectar y hacer consciente el pensamiento automático. Luego se cuestiona y finalmente se reemplaza con uno más realista." }
  ]
},

"relaciones-humanas": {
  title: "Evaluación: Relaciones Humanas",
  passingScore: 70,
  questions: [
    { question: "Según Maslow, la necesidad de pertenencia se ubica en:", options: ["El primer nivel (necesidades básicas)", "El segundo nivel (seguridad)", "El tercer nivel, después de las necesidades básicas y de seguridad", "El quinto nivel (autorrealización)"], correctIndex: 2, explanation: "Maslow ubicó la pertenencia en el tercer nivel: después de las necesidades fisiológicas y de seguridad, necesitamos pertenecer." },
    { question: "La Ventana de Johari tiene 4 áreas. El 'área ciega' es:", options: ["Lo que yo sé de mí y otros también saben", "Lo que otros ven de mí pero yo no veo", "Lo que yo sé de mí pero otros no saben", "Lo que nadie conoce"], correctIndex: 1, explanation: "El área ciega contiene aspectos de nuestra persona que otros perciben pero nosotros no — como hábitos inconscientes o el impacto que generamos." },
    { question: "Para expandir el 'área abierta' de la Ventana de Johari necesitas:", options: ["Guardar más secretos", "Auto-revelación y retroalimentación", "Evitar la comunicación personal", "Controlar la información que otros tienen"], correctIndex: 1, explanation: "Se expande el área abierta mediante auto-revelación (compartir del área oculta) y retroalimentación (aprender del área ciega)." },
    { question: "¿Cuál de estos factores DETERIORA las relaciones humanas?", options: ["Empatía", "Chismes y comunicación indirecta", "Cooperación", "Tolerancia a las diferencias"], correctIndex: 1, explanation: "Los chismes y la comunicación indirecta deterioran la confianza y generan conflictos. La comunicación directa y respetuosa fortalece las relaciones." },
    { question: "Adaptar tu estilo de comunicación según la personalidad del otro significa:", options: ["Ser falso o manipulador", "Comunicar de forma que el otro pueda recibir mejor tu mensaje", "Cambiar tu personalidad", "Hacer siempre lo que el otro quiere"], correctIndex: 1, explanation: "Adaptarse no es falsedad — es inteligencia relacional. Es ajustar tu estilo para que la comunicación sea más efectiva." },
    { question: "En una cooperativa, las relaciones humanas son especialmente importantes porque:", options: ["Hay un jefe que obliga a llevarse bien", "Todos son socios y la convivencia se construye por acuerdo democrático", "No importan las relaciones, solo la productividad", "Las cooperativas no tienen conflictos"], correctIndex: 1, explanation: "En la cooperativa todos son socios — no hay un jefe que imponga. La convivencia se construye por acuerdo, requiriendo más madurez relacional." },
    { question: "La apertura gradual en relaciones laborales significa:", options: ["Contar tu vida entera al primer encuentro", "Ir profundizando la confianza progresivamente, de lo superficial a lo significativo", "Nunca compartir nada personal", "Solo hablar de trabajo"], correctIndex: 1, explanation: "La apertura es gradual — empiezas con lo superficial y profundizas conforme la confianza crece. Como quitar capas de una cebolla." }
  ]
},

"autoestima": {
  title: "Evaluación: Autoestima",
  passingScore: 70,
  questions: [
    { question: "Según Nathaniel Branden, los dos componentes de la autoestima son:", options: ["Inteligencia y belleza", "Autoeficacia y autodignidad", "Éxito y reconocimiento", "Confianza y popularidad"], correctIndex: 1, explanation: "Autoeficacia ('puedo' — confianza en tu capacidad) y autodignidad ('merezco' — convicción de que mereces respeto y bienestar)." },
    { question: "¿Cuál de estos es un pilar de la autoestima según Branden?", options: ["Acumular riqueza", "Vivir conscientemente", "Tener muchos amigos", "Evitar todo riesgo"], correctIndex: 1, explanation: "Los 6 pilares incluyen: vivir conscientemente, aceptarse, responsabilidad personal, autoafirmación, vivir con propósito e integridad." },
    { question: "La autoestima alta es diferente del narcisismo porque:", options: ["Son lo mismo", "La autoestima genuina es silenciosa y firme; el narcisismo es una máscara que necesita demostrar", "El narcisismo es mejor", "La autoestima alta siempre es arrogante"], correctIndex: 1, explanation: "La autoestima saludable no necesita presumir ni menospreciar. El narcisismo es una máscara de seguridad que esconde inseguridad profunda." },
    { question: "El autoconcepto se forma principalmente a través de:", options: ["Solo la genética", "El espejo de los demás, experiencias de éxito/fracaso y comparación social", "Solo la educación formal", "Solo las experiencias laborales"], correctIndex: 1, explanation: "El autoconcepto se forma por cómo nos vieron nuestras figuras significativas, nuestras experiencias, la comparación social y los roles que desempeñamos." },
    { question: "Para transformar una creencia limitante, el primer paso es:", options: ["Ignorarla", "Identificar la creencia y cuestionar su origen", "Pensar solo en positivo", "Pedir a otros que te digan cosas bonitas"], correctIndex: 1, explanation: "El proceso es: identificar la creencia, cuestionar su origen y validez, buscar evidencia contraria, reformular y actuar en consecuencia." },
    { question: "'Separar identidad de rol' en el trabajo significa:", options: ["No involucrarte en tu trabajo", "Entender que tú no ERES tu trabajo — tu valor no depende de tu puesto", "Tener dos personalidades", "No importar si te despiden"], correctIndex: 1, explanation: "Tu valor como persona es independiente de tu puesto laboral. Puedes perder un trabajo sin perder tu identidad ni tu valor." },
    { question: "Un registro semanal de logros sirve para:", options: ["Presumir ante los demás", "Fortalecer la autoestima con evidencia real de tus capacidades", "Pedir aumento de sueldo", "Compararte con otros"], correctIndex: 1, explanation: "El registro de logros es una herramienta de autoestima: cuando dudes de ti, tienes evidencia concreta de lo que has logrado." }
  ]
},

"manejo-conflictos-toma-decisiones": {
  title: "Evaluación: Manejo de Conflictos y Toma de Decisiones",
  passingScore: 70,
  questions: [
    { question: "¿Cuál es el primer paso del proceso de toma de decisiones?", options: ["Generar alternativas", "Identificar y definir el problema", "Establecer criterios", "Evaluar opciones"], correctIndex: 1, explanation: "Antes de buscar soluciones, necesitas definir correctamente el problema. Es el paso más importante y más frecuentemente omitido." },
    { question: "La técnica de los '5 Porqués' sirve para:", options: ["Generar alternativas de solución", "Encontrar la causa raíz de un problema", "Evaluar el desempeño del equipo", "Seleccionar la mejor alternativa"], correctIndex: 1, explanation: "Los 5 Porqués profundizan preguntando 'por qué' repetidamente hasta llegar a la causa raíz, no solo al síntoma." },
    { question: "El sesgo de confirmación nos hace:", options: ["Tomar decisiones rápidas y correctas", "Buscar solo información que confirme lo que ya creemos", "Ser más objetivos", "Consultar con más personas"], correctIndex: 1, explanation: "El sesgo de confirmación nos lleva a buscar, interpretar y recordar selectivamente la información que apoya nuestras creencias previas." },
    { question: "Según Thomas-Kilmann, el estilo 'Colaborar' se caracteriza por:", options: ["Baja asertividad y baja cooperación", "Alta asertividad y alta cooperación", "Alta asertividad y baja cooperación", "Baja asertividad y alta cooperación"], correctIndex: 1, explanation: "Colaborar combina alta asertividad (expresar tus necesidades) con alta cooperación (atender las del otro) para buscar ganar-ganar." },
    { question: "En la Comunicación No Violenta, la estructura correcta es:", options: ["Acusar → Exigir → Amenazar", "Observación → Sentimiento → Necesidad → Petición", "Problema → Solución → Implementación", "Queja → Ultimátum → Consecuencia"], correctIndex: 1, explanation: "La CNV de Rosenberg sigue: observar sin juzgar, expresar sentimiento, identificar necesidad y hacer petición concreta." },
    { question: "¿Cuántas alternativas mínimo debes generar antes de tomar una decisión?", options: ["1", "2", "Al menos 3", "5 o más"], correctIndex: 2, explanation: "La regla es generar al menos 3 alternativas. La primera idea rara vez es la mejor — es solo la más obvia." },
    { question: "El sesgo de 'status quo' nos hace:", options: ["Buscar siempre el cambio", "Preferir no cambiar aunque el cambio sea mejor", "Ser más innovadores", "Cuestionar todo"], correctIndex: 1, explanation: "El status quo nos hace resistir el cambio y preferir lo conocido, incluso cuando la evidencia muestra que cambiar sería mejor." }
  ]
},

"integracion-grupos-equipo": {
  title: "Evaluación: Integración de Grupos y el Equipo",
  passingScore: 70,
  questions: [
    { question: "La diferencia principal entre un grupo y un equipo es:", options: ["El tamaño", "El equipo tiene objetivo compartido, roles complementarios y responsabilidad mutua", "El grupo es más productivo", "No hay diferencia"], correctIndex: 1, explanation: "Un grupo comparte espacio; un equipo tiene objetivo compartido, roles complementarios y responsabilidad mutua por los resultados." },
    { question: "Según Tuckman, la etapa más incómoda pero más importante es:", options: ["Formación", "Tormenta", "Normalización", "Desempeño"], correctIndex: 1, explanation: "La tormenta (conflictos, choques, lucha por liderazgo) es incómoda pero necesaria. Los equipos que la evitan nunca alcanzan el desempeño real." },
    { question: "El 'pensamiento grupal' (Groupthink) ocurre cuando:", options: ["El grupo es muy diverso", "La cohesión excesiva impide cuestionar y considerar alternativas", "Hay mucho conflicto", "El líder es débil"], correctIndex: 1, explanation: "Groupthink surge cuando el grupo valora tanto la armonía que evita disentir, resultando en decisiones malas que nadie cuestiona." },
    { question: "Según Belbin, un equipo efectivo necesita:", options: ["Solo personas muy inteligentes", "Diversidad de roles (acción, sociales, mentales)", "Personas con la misma personalidad", "Solo líderes fuertes"], correctIndex: 1, explanation: "Belbin identificó 9 roles necesarios. Si todos son 'cerebros', habrá ideas pero poca ejecución. La diversidad de roles es clave." },
    { question: "Ante un participante que habla mucho en reuniones, la mejor estrategia es:", options: ["Ignorarlo hasta que se canse", "Decir 'Gracias por tu aporte, me gustaría escuchar también a los demás'", "Sacarlo de la reunión", "Dejarlo hablar sin límite"], correctIndex: 1, explanation: "Reconocer su aporte y redirigir hacia otros participantes es la técnica de facilitación más efectiva y respetuosa." },
    { question: "Las 5 disfunciones de un equipo según Lencioni empiezan con:", options: ["Falta de resultados", "Ausencia de confianza", "Evasión de responsabilidad", "Falta de compromiso"], correctIndex: 1, explanation: "La base es la ausencia de confianza. Sin confianza no hay conflicto honesto, sin conflicto no hay compromiso, y así en cascada." },
    { question: "En una cooperativa, el reto especial de los equipos es:", options: ["Que hay un jefe claro que decide todo", "El doble rol de trabajador y dueño, con decisiones democráticas", "Que no hay necesidad de trabajo en equipo", "Que todos piensan igual"], correctIndex: 1, explanation: "En cooperativas todos son socios con doble rol. Las decisiones democráticas requieren más habilidades de integración y comunicación." }
  ]
},

"planeacion-vida-trabajo": {
  title: "Evaluación: Planeación de Vida y Trabajo",
  passingScore: 70,
  questions: [
    { question: "Las 6 dimensiones de una vida plena incluyen:", options: ["Solo trabajo y dinero", "Profesional, personal, familiar, física, económica y espiritual", "Trabajo, diversión y descanso", "Salud, dinero y amor"], correctIndex: 1, explanation: "Un plan de vida integral atiende 6 dimensiones: profesional, personal/emocional, familiar, física/salud, económica y espiritual/trascendente." },
    { question: "El FODA Personal analiza:", options: ["Solo fortalezas y debilidades", "Fortalezas y oportunidades (favorables) + debilidades y amenazas (desfavorables)", "Solo factores externos", "Solo factores internos"], correctIndex: 1, explanation: "El FODA combina factores internos (fortalezas y debilidades) con externos (oportunidades y amenazas) para un diagnóstico completo." },
    { question: "Según Gallup, las personas que desarrollan sus fortalezas son:", options: ["Menos productivas", "6 veces más propensas a estar comprometidas con su trabajo", "Iguales a las demás", "Más arrogantes"], correctIndex: 1, explanation: "La investigación de Gallup muestra que enfocarse en fortalezas produce 6 veces más compromiso laboral que enfocarse solo en corregir debilidades." },
    { question: "La diferencia entre una necesidad y un deseo es:", options: ["Son lo mismo", "La necesidad es profunda y duradera; el deseo es más superficial y temporal", "Los deseos son más importantes", "Las necesidades no se pueden satisfacer"], correctIndex: 1, explanation: "Las necesidades (seguridad, pertenencia, propósito) son profundas. Los deseos (coche nuevo, título) son medios que pueden o no satisfacer la necesidad real." },
    { question: "Una meta SMART debe ser:", options: ["Simple, motivadora, atractiva, rápida, temporal", "Específica, medible, alcanzable, relevante y temporal", "Secreta, masiva, agresiva, radical, total", "Solo ambiciosa"], correctIndex: 1, explanation: "SMART: Específica (qué exactamente), Medible (cómo sé que lo logré), Alcanzable (realista), Relevante (contribuye a mi visión), Temporal (con fecha)." },
    { question: "¿Con qué frecuencia se recomienda revisar un plan de vida?", options: ["Solo una vez al hacerlo", "Semanal (acciones), mensual (metas), trimestral (ajustes), anual (balance completo)", "Cada 5 años", "Nunca, una vez hecho no se cambia"], correctIndex: 1, explanation: "El plan necesita revisión constante: semanal para acciones, mensual para metas, trimestral para ajustes y anual para balance completo." },
    { question: "La Rueda de la Vida es una herramienta para:", options: ["Planificar las vacaciones", "Evaluar tu satisfacción actual en las 6 dimensiones de vida e identificar prioridades", "Medir la productividad en el trabajo", "Calcular tu salario ideal"], correctIndex: 1, explanation: "La Rueda de la Vida evalúa del 1 al 10 cada dimensión, revelando visualmente dónde están tus áreas de mayor oportunidad." }
  ]
},

"capacidad-analitica-resolucion-problemas": {
  title: "Evaluación: Capacidad Analítica y Resolución de Problemas",
  passingScore: 70,
  questions: [
    { question: "El pensamiento analítico se diferencia del intuitivo en que:", options: ["Es más rápido", "Es deliberado, estructurado y basado en datos y lógica", "Siempre es correcto", "No requiere información"], correctIndex: 1, explanation: "El pensamiento analítico es deliberado y estructurado, basado en datos y lógica. El intuitivo es rápido y automático, útil para lo rutinario." },
    { question: "El Diagrama de Ishikawa organiza las causas en categorías llamadas:", options: ["Las 3R", "Las 6M (Mano de obra, Método, Maquinaria, Material, Medición, Medio ambiente)", "Los 5 Porqués", "Las 4P"], correctIndex: 1, explanation: "Ishikawa usa las 6M para organizar sistemáticamente todas las posibles causas de un problema." },
    { question: "El principio de Pareto (80/20) establece que:", options: ["El 80% de los trabajadores hace el 20% del trabajo", "El 80% de los problemas viene del 20% de las causas", "El 80% del presupuesto se gasta en el 20% del tiempo", "Ninguna de las anteriores"], correctIndex: 1, explanation: "Pareto nos dice que identificando y atacando el 20% de las causas principales, resolvemos el 80% del problema." },
    { question: "¿Cuándo es más apropiado usar la metodología 8D?", options: ["Problemas simples del día a día", "Problemas complejos que requieren equipo y seguimiento formal", "Solo para problemas de calidad", "Cuando no hay tiempo para analizar"], correctIndex: 1, explanation: "Las 8 Disciplinas son para problemas complejos que requieren formar un equipo, investigar a fondo y prevenir recurrencia." },
    { question: "Que 'correlación no implica causalidad' significa:", options: ["Los datos siempre mienten", "Que dos cosas sucedan juntas no significa que una cause la otra", "No se pueden usar datos para decidir", "Las estadísticas son inútiles"], correctIndex: 1, explanation: "Es un error común: ver que A y B ocurren juntos y concluir que A causa B, cuando puede haber un factor C detrás de ambos." },
    { question: "En el ciclo datos → información → conocimiento → decisión, la 'información' es:", options: ["Números crudos sin contexto", "Datos con contexto y significado", "La decisión final", "Solo opiniones"], correctIndex: 1, explanation: "Los datos son crudos (500 piezas hoy). La información agrega contexto (500 piezas = 15% menos que el promedio). El conocimiento interpreta (la baja se debe a...)." },
    { question: "El framework PARA-DEFINE-ANALIZA-OPCIONES-DECIDE-ACTÚA es útil para:", options: ["Solo problemas grandes", "Resolución rápida de problemas cotidianos en el trabajo", "Solo problemas técnicos", "Problemas personales exclusivamente"], correctIndex: 1, explanation: "Este framework simplificado permite resolver problemas del día a día de forma estructurada sin necesitar herramientas complejas." }
  ]
}
,
  "prevencion-riesgos-laborales": {
    title: "Evaluación: Prevención de Riesgos Laborales",
    passingScore: 70,
    questions: [
      { question: "¿Cuál es la diferencia entre peligro y riesgo?", options: ["Son lo mismo", "El peligro es la fuente de daño potencial; el riesgo es la probabilidad de que ocurra", "El riesgo es más grave que el peligro", "El peligro solo aplica a máquinas"], correctIndex: 1, explanation: "El peligro es la fuente o situación con potencial de causar daño; el riesgo es la probabilidad de que ese daño ocurra combinada con su severidad." },
      { question: "¿Qué es un acto inseguro?", options: ["Una máquina defectuosa", "Una acción o comportamiento del trabajador que puede causar un accidente", "Un desastre natural", "Una política de la empresa"], correctIndex: 1, explanation: "Un acto inseguro es una acción o comportamiento del trabajador que viola las normas de seguridad y puede causar un accidente." },
      { question: "¿Qué es una condición insegura?", options: ["Un comportamiento imprudente", "Una característica del ambiente que puede causar un accidente", "Un conflicto laboral", "Una queja del trabajador"], correctIndex: 1, explanation: "Una condición insegura es una característica física del ambiente de trabajo que puede causar un accidente (pisos mojados, cables expuestos, etc.)." },
      { question: "¿Qué norma mexicana establece las condiciones de seguridad para prevenir riesgos en centros de trabajo?", options: ["NOM-001-STPS", "NOM-035-STPS", "NOM-030-STPS", "NOM-017-STPS"], correctIndex: 2, explanation: "La NOM-030-STPS establece las funciones y actividades de los servicios preventivos de seguridad y salud en el trabajo." },
      { question: "¿Cuál es el primer paso en la evaluación de riesgos?", options: ["Implementar controles", "Identificar los peligros", "Capacitar al personal", "Comprar EPP"], correctIndex: 1, explanation: "El primer paso es identificar los peligros presentes en el centro de trabajo antes de poder evaluar los riesgos asociados." },
      { question: "¿Qué es la pirámide de Bird en seguridad industrial?", options: ["Una estructura de mando", "Un modelo que muestra la relación entre incidentes menores y accidentes graves", "Un tipo de extintor", "Un plan de evacuación"], correctIndex: 1, explanation: "La pirámide de Bird muestra que por cada accidente grave hay muchos incidentes menores y actos inseguros, permitiendo prevenir accidentes trabajando en la base." },
      { question: "¿Qué debe contener un plan de prevención de riesgos?", options: ["Solo la lista de EPP", "Identificación de peligros, evaluación de riesgos, medidas de control y capacitación", "Solo números de emergencia", "Solo horarios de trabajo"], correctIndex: 1, explanation: "Un plan integral incluye identificación de peligros, evaluación de riesgos, medidas de control, capacitación, y seguimiento." },
    ],
  },
  "equipo-proteccion-personal": {
    title: "Evaluación: Equipo de Protección Personal",
    passingScore: 70,
    questions: [
      { question: "¿Qué norma mexicana regula el equipo de protección personal?", options: ["NOM-026-STPS", "NOM-017-STPS", "NOM-035-STPS", "NOM-019-STPS"], correctIndex: 1, explanation: "La NOM-017-STPS-2008 establece los requisitos para la selección, uso y manejo de equipo de protección personal." },
      { question: "¿Cuál es el último recurso en la jerarquía de controles de riesgos?", options: ["Eliminación del peligro", "Controles administrativos", "Equipo de protección personal", "Sustitución"], correctIndex: 2, explanation: "El EPP es el último recurso en la jerarquía: Eliminación → Sustitución → Controles de ingeniería → Controles administrativos → EPP." },
      { question: "¿Quién es responsable de proporcionar el EPP según la normatividad?", options: ["El trabajador", "El patrón", "El gobierno", "El sindicato"], correctIndex: 1, explanation: "Según la NOM-017-STPS, el patrón es responsable de proporcionar el EPP adecuado sin costo para el trabajador." },
      { question: "¿Qué tipo de protección ocular se usa contra partículas volátiles?", options: ["Lentes de sol", "Gogles de seguridad", "Lentes de lectura", "Visor facial solamente"], correctIndex: 1, explanation: "Los gogles de seguridad proporcionan protección sellada contra partículas volátiles, salpicaduras y polvo." },
      { question: "¿Con qué frecuencia se debe inspeccionar el EPP?", options: ["Una vez al año", "Antes de cada uso", "Solo cuando se rompe", "Cada seis meses"], correctIndex: 1, explanation: "El EPP debe inspeccionarse antes de cada uso para verificar que esté en buenas condiciones y brinde la protección adecuada." },
      { question: "¿Qué tipo de calzado se requiere en áreas con riesgo de caída de objetos?", options: ["Tenis deportivos", "Zapatos de vestir", "Calzado de seguridad con casquillo", "Sandalias industriales"], correctIndex: 2, explanation: "El calzado de seguridad con casquillo (punta de acero o composite) protege contra la caída de objetos pesados." },
      { question: "¿Qué se debe hacer con un EPP dañado?", options: ["Repararlo con cinta", "Retirarlo y reemplazarlo inmediatamente", "Seguir usándolo hasta el siguiente pedido", "Prestarlo a otro trabajador"], correctIndex: 1, explanation: "Un EPP dañado debe retirarse de uso y reemplazarse inmediatamente, ya que no garantiza la protección adecuada." },
    ],
  },
  "operario-limpieza": {
    title: "Evaluación: Operario de Limpieza",
    passingScore: 70,
    questions: [
      { question: "¿Qué es una Hoja de Datos de Seguridad (HDS)?", options: ["Un manual de limpieza", "Un documento con información sobre peligros y manejo seguro de un producto químico", "Una lista de precios", "Un formulario de quejas"], correctIndex: 1, explanation: "La HDS contiene información sobre composición, peligros, medidas de primeros auxilios, manejo seguro y disposición de un producto químico." },
      { question: "¿Cuál es el orden correcto de limpieza de un área?", options: ["Barrer, trapear, desinfectar", "De arriba hacia abajo y de adentro hacia afuera", "De abajo hacia arriba", "Solo trapear"], correctIndex: 1, explanation: "La limpieza se realiza de arriba hacia abajo y de adentro hacia afuera para evitar contaminar áreas ya limpias." },
      { question: "¿Por qué nunca se deben mezclar cloro con amoniaco?", options: ["Porque no limpian bien juntos", "Porque generan gases tóxicos peligrosos", "Porque manchan las superficies", "Porque son muy costosos"], correctIndex: 1, explanation: "La mezcla de cloro con amoniaco genera cloraminas, gases tóxicos que pueden causar daño respiratorio grave e incluso la muerte." },
      { question: "¿Qué EPP mínimo debe usar un operario de limpieza?", options: ["Solo uniforme", "Guantes, calzado antiderrapante y protección ocular según la tarea", "Solo guantes", "Ninguno si no hay químicos"], correctIndex: 1, explanation: "El EPP mínimo incluye guantes resistentes a químicos, calzado antiderrapante, y protección ocular cuando se manejan productos irritantes." },
      { question: "¿Qué señalización se debe colocar en un piso mojado?", options: ["Ninguna", "Señal de piso mojado/precaución", "Un letrero de prohibido el paso", "Solo avisar verbalmente"], correctIndex: 1, explanation: "Se debe colocar la señal de piso mojado/precaución para prevenir resbalones y caídas de personas que transiten por el área." },
      { question: "¿Cómo se deben almacenar los productos de limpieza?", options: ["Junto a los alimentos", "En un lugar ventilado, etiquetados y separados por compatibilidad", "En cualquier lugar disponible", "En los baños"], correctIndex: 1, explanation: "Los productos deben almacenarse en un lugar ventilado, con etiquetas visibles y separados según su compatibilidad química." },
      { question: "¿Qué son los residuos RPBI?", options: ["Residuos de papel y cartón", "Residuos Peligrosos Biológico-Infecciosos", "Residuos plásticos biodegradables", "Residuos de producción industrial"], correctIndex: 1, explanation: "RPBI son Residuos Peligrosos Biológico-Infecciosos que requieren manejo especial: materiales con sangre, jeringas, etc." },
    ],
  },
  "seguridad-energia-electrica": {
    title: "Evaluación: Seguridad en Trabajos con Energía Eléctrica",
    passingScore: 70,
    questions: [
      { question: "¿Qué norma mexicana regula el mantenimiento de instalaciones eléctricas?", options: ["NOM-017-STPS", "NOM-029-STPS", "NOM-026-STPS", "NOM-001-SEDE"], correctIndex: 1, explanation: "La NOM-029-STPS-2011 establece las condiciones de seguridad para realizar actividades de mantenimiento en instalaciones eléctricas." },
      { question: "¿Cuál es el efecto más peligroso de la corriente eléctrica en el cuerpo?", options: ["Quemaduras superficiales", "Fibrilación ventricular (paro cardíaco)", "Dolor muscular", "Mareos"], correctIndex: 1, explanation: "La fibrilación ventricular es el efecto más peligroso, ya que detiene el bombeo eficaz del corazón y puede causar la muerte." },
      { question: "¿A partir de qué amperaje la corriente eléctrica puede ser mortal?", options: ["10 amperes", "1 ampere", "0.1 amperes (100 mA)", "50 amperes"], correctIndex: 2, explanation: "Corrientes tan bajas como 100 mA (0.1 A) pueden causar fibrilación ventricular y ser mortales." },
      { question: "¿Qué es el equipo de protección dieléctrico?", options: ["EPP para trabajo en alturas", "EPP aislante contra descargas eléctricas", "EPP contra químicos", "EPP contra ruido"], correctIndex: 1, explanation: "El equipo dieléctrico incluye guantes, tapetes, mantas y herramientas aislantes que protegen contra descargas eléctricas." },
      { question: "¿Qué se debe hacer antes de trabajar en una instalación eléctrica?", options: ["Solo informar al supervisor", "Aplicar el procedimiento de bloqueo y etiquetado (LOTO)", "Trabajar rápidamente", "Usar guantes de algodón"], correctIndex: 1, explanation: "Antes de cualquier trabajo eléctrico se debe aplicar LOTO para asegurar que la energía esté completamente desenergizada y controlada." },
      { question: "¿Qué es la distancia de seguridad en trabajos eléctricos?", options: ["La distancia entre dos postes", "La separación mínima que debe mantenerse de partes energizadas", "La longitud del cable", "La distancia entre trabajadores"], correctIndex: 1, explanation: "La distancia de seguridad es la separación mínima entre el trabajador y las partes energizadas para prevenir arcos eléctricos o contacto accidental." },
      { question: "¿Qué hacer si una persona sufre una descarga eléctrica?", options: ["Tocarla para separarla de la fuente", "Cortar la energía o usar material aislante para separarla, luego dar primeros auxilios", "Echarle agua", "Esperar a que se separe sola"], correctIndex: 1, explanation: "Primero se debe cortar la energía o usar material aislante (madera, plástico) para separar a la víctima, nunca tocarla directamente." },
    ],
  },
  "brigada-contra-incendios": {
    title: "Evaluación: Brigada Contra Incendios",
    passingScore: 70,
    questions: [
      { question: "¿Cuáles son los tres elementos del triángulo del fuego?", options: ["Agua, aire y tierra", "Combustible, oxígeno y calor", "Gas, electricidad y chispa", "Madera, papel y gasolina"], correctIndex: 1, explanation: "El triángulo del fuego requiere tres elementos: combustible, comburente (oxígeno) y fuente de calor (energía de activación)." },
      { question: "¿Qué clase de fuego involucra líquidos inflamables?", options: ["Clase A", "Clase B", "Clase C", "Clase D"], correctIndex: 1, explanation: "Los incendios Clase B involucran líquidos inflamables y combustibles como gasolina, aceites, solventes y gases." },
      { question: "¿Qué tipo de extintor se usa para fuegos eléctricos (Clase C)?", options: ["Agua a presión", "CO2 o polvo químico seco", "Espuma", "Agua con aditivos"], correctIndex: 1, explanation: "Para fuegos Clase C (equipos eléctricos energizados) se usa CO2 o polvo químico seco, nunca agua." },
      { question: "¿Qué significa la técnica PASS para usar un extintor?", options: ["Presionar, Apuntar, Salir, Soplar", "Pull (jalar), Aim (apuntar), Squeeze (apretar), Sweep (barrer)", "Pedir, Avisar, Salir, Socorrer", "Proteger, Alertar, Salvar, Señalar"], correctIndex: 1, explanation: "PASS: Pull (jalar el seguro), Aim (apuntar a la base del fuego), Squeeze (apretar la manija), Sweep (barrer de lado a lado)." },
      { question: "¿Cada cuánto tiempo se deben revisar los extintores?", options: ["Cada 5 años", "Mensualmente y recarga anual", "Solo cuando se usan", "Cada 2 años"], correctIndex: 1, explanation: "Los extintores deben revisarse mensualmente (inspección visual) y recargarse/mantenerse anualmente por personal certificado." },
      { question: "¿Cuál es la primera acción al detectar un incendio?", options: ["Intentar apagarlo solo", "Activar la alarma y alertar a los demás", "Evacuar sin avisar", "Buscar un extintor"], correctIndex: 1, explanation: "La primera acción es activar la alarma de incendio y alertar a las personas cercanas para iniciar la evacuación." },
      { question: "¿Qué es un punto de reunión?", options: ["La oficina del jefe", "Un lugar seguro predeterminado donde se concentra el personal tras una evacuación", "La puerta principal", "El estacionamiento"], correctIndex: 1, explanation: "El punto de reunión es un lugar seguro, previamente designado, donde el personal se concentra después de una evacuación para realizar el conteo." },
    ],
  },
  "sistema-globalmente-armonizado-sga": {
    title: "Evaluación: Sistema Globalmente Armonizado (SGA)",
    passingScore: 70,
    questions: [
      { question: "¿Qué norma mexicana establece el SGA para comunicación de peligros?", options: ["NOM-017-STPS", "NOM-018-STPS", "NOM-026-STPS", "NOM-029-STPS"], correctIndex: 1, explanation: "La NOM-018-STPS-2015 establece el sistema armonizado para la identificación y comunicación de peligros por sustancias químicas." },
      { question: "¿Cuántos pictogramas tiene el SGA?", options: ["6", "9", "12", "4"], correctIndex: 1, explanation: "El SGA tiene 9 pictogramas estandarizados con marco rojo en forma de diamante sobre fondo blanco." },
      { question: "¿Cuáles son las dos palabras de advertencia del SGA?", options: ["Alto y Precaución", "Peligro y Atención", "Riesgo y Cuidado", "Tóxico y Nocivo"], correctIndex: 1, explanation: "Las palabras de advertencia son 'Peligro' (para categorías más severas) y 'Atención' (para categorías menos severas)." },
      { question: "¿Qué son las frases H en el SGA?", options: ["Frases de higiene", "Indicaciones de peligro (Hazard statements)", "Frases de hospital", "Frases de humedad"], correctIndex: 1, explanation: "Las frases H (Hazard) son indicaciones estandarizadas que describen la naturaleza y gravedad del peligro de una sustancia." },
      { question: "¿Cuántas secciones tiene una Hoja de Datos de Seguridad según el SGA?", options: ["8", "12", "16", "20"], correctIndex: 2, explanation: "La HDS según el SGA tiene 16 secciones estandarizadas, desde identificación del producto hasta información reglamentaria." },
      { question: "¿Qué pictograma representa un peligro para la salud (toxicidad crónica)?", options: ["Calavera con tibias cruzadas", "Silueta humana con estrella en el pecho", "Signo de exclamación", "Llama"], correctIndex: 1, explanation: "La silueta humana con estrella en el pecho indica peligros crónicos para la salud como carcinogenicidad, mutagenicidad o toxicidad reproductiva." },
      { question: "¿Qué son las frases P en el SGA?", options: ["Frases de producción", "Consejos de prudencia (Precautionary statements)", "Frases de precio", "Frases de peso"], correctIndex: 1, explanation: "Las frases P (Precautionary) son consejos de prudencia que indican medidas para minimizar la exposición y sus efectos." },
    ],
  },
  "nom-035-stps-medina": {
    title: "Evaluación: NOM-035-STPS (Perspectiva Ingeniería)",
    passingScore: 70,
    questions: [
      { question: "¿Cuál es la Guía de Referencia I de la NOM-035?", options: ["Cuestionario para evaluar el entorno organizacional", "Cuestionario para identificar acontecimientos traumáticos severos", "Cuestionario para medir estrés", "Cuestionario de satisfacción laboral"], correctIndex: 1, explanation: "La Guía de Referencia I es para identificar a trabajadores que fueron sujetos a acontecimientos traumáticos severos." },
      { question: "¿Qué centros de trabajo deben aplicar la Guía de Referencia III?", options: ["Todos", "Centros con más de 50 trabajadores", "Solo los industriales", "Solo los gubernamentales"], correctIndex: 1, explanation: "Los centros de trabajo con más de 50 trabajadores deben aplicar la Guía de Referencia III para identificar y analizar factores de riesgo psicosocial." },
      { question: "¿Qué es la violencia laboral según la NOM-035?", options: ["Solo agresiones físicas", "Actos de hostigamiento, acoso o malos tratos contra trabajadores", "Discusiones entre compañeros", "Reclamos de clientes"], correctIndex: 1, explanation: "La violencia laboral incluye acoso, hostigamiento y malos tratos que dañan la integridad del trabajador." },
      { question: "¿Qué debe contener la política de prevención de riesgos psicosociales?", options: ["Solo el logotipo de la empresa", "Compromiso de prevención, medidas de acción, mecanismos de denuncia y acciones de difusión", "Solo las sanciones", "Solo los horarios"], correctIndex: 1, explanation: "La política debe incluir el compromiso del patrón, medidas de prevención, mecanismos de denuncia confidencial y acciones de difusión." },
      { question: "¿Cada cuánto tiempo se deben aplicar los cuestionarios de la NOM-035?", options: ["Mensualmente", "Cada 2 años", "Solo al inicio", "Cada 5 años"], correctIndex: 1, explanation: "Los cuestionarios de identificación de factores de riesgo psicosocial deben aplicarse cada 2 años." },
      { question: "¿Qué es un acontecimiento traumático severo?", options: ["Cualquier problema laboral", "Un evento único o excepcional que pone en peligro la vida o integridad", "Un cambio de puesto", "Una evaluación de desempeño negativa"], correctIndex: 1, explanation: "Un ATS es un evento que pone en peligro la vida o integridad física, como asaltos, secuestros, accidentes graves o actos de violencia." },
      { question: "¿Qué consecuencia legal tiene el incumplimiento de la NOM-035?", options: ["Ninguna", "Multas de 50 a 5,000 UMAs por la STPS", "Solo una recomendación", "Cierre temporal obligatorio"], correctIndex: 1, explanation: "El incumplimiento puede resultar en multas de 50 a 5,000 UMAs impuestas por la STPS en inspecciones de verificación." },
    ],
  },
  "formacion-instructores": {
    title: "Evaluación: Formación de Instructores",
    passingScore: 70,
    questions: [
      { question: "¿Qué es la DNC en capacitación?", options: ["Dirección Nacional de Capacitación", "Detección de Necesidades de Capacitación", "Documento Normativo de Cursos", "División de Nuevos Contenidos"], correctIndex: 1, explanation: "La DNC (Detección de Necesidades de Capacitación) es el proceso de identificar las brechas entre competencias actuales y requeridas del personal." },
      { question: "¿Qué artículo de la LFT establece la obligación de capacitar?", options: ["Artículo 123", "Artículo 153-A", "Artículo 47", "Artículo 35"], correctIndex: 1, explanation: "El Artículo 153-A de la Ley Federal del Trabajo establece la obligación del patrón de proporcionar capacitación y adiestramiento." },
      { question: "¿Cuáles son los dominios de aprendizaje según Bloom?", options: ["Visual, auditivo, kinestésico", "Cognitivo, afectivo y psicomotor", "Lógico, creativo, social", "Individual, grupal, organizacional"], correctIndex: 1, explanation: "La taxonomía de Bloom define tres dominios: cognitivo (conocimiento), afectivo (actitudes) y psicomotor (habilidades)." },
      { question: "¿Qué técnica didáctica es más efectiva para enseñar habilidades prácticas?", options: ["Conferencia magistral", "Lectura de manual", "Demostración con práctica supervisada", "Examen escrito"], correctIndex: 2, explanation: "La demostración con práctica supervisada permite al participante observar, practicar y recibir retroalimentación inmediata." },
      { question: "¿Qué es una constancia DC-3?", options: ["Un título universitario", "Constancia de competencias o habilidades laborales emitida por la STPS", "Una licencia de manejo", "Un certificado médico"], correctIndex: 1, explanation: "La DC-3 es la constancia de competencias o habilidades laborales que certifica que un trabajador recibió capacitación, emitida bajo lineamientos de la STPS." },
      { question: "¿Cuál es el nivel más alto de la taxonomía de Bloom revisada?", options: ["Analizar", "Evaluar", "Crear", "Aplicar"], correctIndex: 2, explanation: "En la taxonomía revisada de Bloom, 'Crear' (generar, planear, producir) es el nivel cognitivo más alto." },
      { question: "¿Qué debe incluir un plan de sesión de capacitación?", options: ["Solo el tema", "Objetivo, contenido, técnicas, materiales, tiempo y evaluación", "Solo la presentación", "Solo la lista de asistencia"], correctIndex: 1, explanation: "Un plan de sesión completo incluye: objetivo de aprendizaje, contenido temático, técnicas didácticas, materiales, distribución del tiempo y forma de evaluación." },
    ],
  },
  "bloqueo-etiquetado-loto": {
    title: "Evaluación: Bloqueo y Etiquetado LOTO",
    passingScore: 70,
    questions: [
      { question: "¿Qué significa LOTO?", options: ["Lock On, Tag On", "Lockout/Tagout (Bloqueo/Etiquetado)", "Low Output Technical Operation", "Limit of Time Operation"], correctIndex: 1, explanation: "LOTO significa Lockout/Tagout, que en español es Bloqueo y Etiquetado de energías peligrosas." },
      { question: "¿Qué tipos de energía peligrosa deben controlarse con LOTO?", options: ["Solo eléctrica", "Eléctrica, mecánica, hidráulica, neumática, térmica y química", "Solo mecánica", "Solo la que cause ruido"], correctIndex: 1, explanation: "LOTO debe aplicarse a todas las formas de energía peligrosa: eléctrica, mecánica, hidráulica, neumática, térmica, química y gravitacional." },
      { question: "¿Qué es la verificación de energía cero?", options: ["Apagar el interruptor principal", "Comprobar que todas las fuentes de energía están efectivamente aisladas y en nivel cero", "Revisar el medidor de luz", "Verificar que no hay nadie en el área"], correctIndex: 1, explanation: "La verificación de energía cero confirma que todas las fuentes de energía están completamente aisladas antes de iniciar el trabajo." },
      { question: "¿Quién puede retirar un candado de bloqueo?", options: ["Cualquier persona", "Solo la persona que lo colocó, salvo procedimiento especial de emergencia", "El supervisor cuando quiera", "El personal de limpieza"], correctIndex: 1, explanation: "Solo la persona que colocó el candado puede retirarlo. En casos excepcionales, existe un procedimiento de emergencia con autorizaciones especiales." },
      { question: "¿Qué debe incluir la etiqueta de bloqueo?", options: ["Solo el nombre del equipo", "Nombre del trabajador, fecha, hora, motivo del bloqueo y departamento", "Solo un color rojo", "Solo un candado"], correctIndex: 1, explanation: "La etiqueta debe incluir: nombre del trabajador autorizado, fecha y hora del bloqueo, motivo, departamento y equipo bloqueado." },
      { question: "¿Cuándo se debe aplicar LOTO?", options: ["Solo en equipos nuevos", "Durante mantenimiento, reparación, limpieza o ajuste de maquinaria", "Solo cuando hay accidentes", "Solo en turno nocturno"], correctIndex: 1, explanation: "LOTO se aplica siempre que se realice mantenimiento, reparación, limpieza, inspección o ajuste de maquinaria que involucre energías peligrosas." },
      { question: "¿Qué debe hacerse antes de retirar el bloqueo y reiniciar la maquinaria?", options: ["Solo prender el equipo", "Verificar que todas las herramientas y personas estén fuera del área, y avisar al personal", "Nada especial", "Solo avisar al supervisor"], correctIndex: 1, explanation: "Antes de retirar el bloqueo se debe: verificar que herramientas estén retiradas, que todo el personal esté fuera del área, avisar y obtener confirmación." },
    ],
  },
  "nom-026-colores-senales-seguridad": {
    title: "Evaluación: NOM-026 — Colores y Señales de Seguridad",
    passingScore: 70,
    questions: [
      { question: "¿Qué color de seguridad indica prohibición o peligro?", options: ["Azul", "Amarillo", "Rojo", "Verde"], correctIndex: 2, explanation: "El color rojo indica prohibición, peligro, material/equipo contra incendio y parada de emergencia." },
      { question: "¿Qué color indica una obligación (uso obligatorio de EPP)?", options: ["Rojo", "Azul", "Verde", "Amarillo"], correctIndex: 1, explanation: "El color azul indica obligación, como el uso obligatorio de equipo de protección personal." },
      { question: "¿Qué color identifica las condiciones seguras y rutas de evacuación?", options: ["Rojo", "Amarillo", "Azul", "Verde"], correctIndex: 3, explanation: "El verde indica condiciones seguras: rutas de evacuación, salidas de emergencia, puntos de reunión, primeros auxilios." },
      { question: "¿Qué forma tienen las señales de prohibición?", options: ["Triángulo", "Círculo con diagonal", "Cuadrado", "Rombo"], correctIndex: 1, explanation: "Las señales de prohibición tienen forma circular con una banda diagonal roja sobre fondo blanco." },
      { question: "¿Qué color se usa para señalizar tuberías que transportan agua?", options: ["Rojo", "Amarillo", "Verde", "Azul"], correctIndex: 2, explanation: "Según la NOM-026, el verde se utiliza para señalizar tuberías que transportan agua." },
      { question: "¿Qué indica una señal con fondo amarillo y símbolo negro en forma de triángulo?", options: ["Prohibición", "Obligación", "Precaución/Advertencia", "Información"], correctIndex: 2, explanation: "Las señales triangulares con fondo amarillo y símbolo negro indican precaución o advertencia de peligro." },
      { question: "¿Qué es el color contrastante según la NOM-026?", options: ["Un color decorativo", "El color que mejora la visibilidad del color de seguridad", "El color del piso", "El color de la ropa"], correctIndex: 1, explanation: "El color contrastante acompaña al color de seguridad para mejorar su visibilidad (ej: blanco contrasta con rojo, verde y azul)." },
    ],
  },
  "herramientas-manuales-poder": {
    title: "Evaluación: Herramientas Manuales y de Poder",
    passingScore: 70,
    questions: [
      { question: "¿Cuál es la causa más común de accidentes con herramientas manuales?", options: ["Herramientas muy caras", "Uso inadecuado o falta de inspección", "Color de las herramientas", "Marca de las herramientas"], correctIndex: 1, explanation: "La mayoría de accidentes ocurren por uso inadecuado, falta de inspección previa, o uso de herramientas defectuosas." },
      { question: "¿Qué se debe verificar en una herramienta manual antes de usarla?", options: ["Su precio", "Estado del mango, filo, desgaste y que sea la herramienta correcta para la tarea", "Solo su tamaño", "Que sea nueva"], correctIndex: 1, explanation: "Antes de usar una herramienta se debe verificar: estado del mango (sin grietas), filo adecuado, desgaste, y que sea la correcta para la tarea." },
      { question: "¿Cuál es la protección mínima al usar una esmeriladora angular?", options: ["Solo guantes", "Careta o gogles, guantes, protección auditiva y guarda de disco", "Solo lentes oscuros", "Ninguna si es rápido"], correctIndex: 1, explanation: "Al usar esmeriladora se requiere: careta o gogles, guantes resistentes a corte, protección auditiva, y la guarda del disco instalada." },
      { question: "¿Por qué no se debe usar un desarmador como cincel?", options: ["Porque es más caro", "Porque no está diseñado para resistir impacto y puede romperse o resbalarse causando lesión", "Porque se ensucia", "Porque es más pequeño"], correctIndex: 1, explanation: "Los desarmadores no están diseñados para soportar golpes; usarlos como cincel puede provocar que la punta se rompa o resbale causando lesiones." },
      { question: "¿Cómo se deben transportar las herramientas manuales?", options: ["En los bolsillos del pantalón", "En cinturones porta-herramientas o cajas, con los filos protegidos", "Sueltas en las manos", "En bolsas de plástico"], correctIndex: 1, explanation: "Las herramientas deben transportarse en cinturones, cajas o bolsas especiales, con los filos y puntas protegidos para evitar lesiones." },
      { question: "¿Qué se debe verificar en el cable de una herramienta eléctrica?", options: ["Solo la longitud", "Que no tenga daños en el aislamiento, conexiones firmes y tierra física", "Solo el color", "Nada si funciona"], correctIndex: 1, explanation: "Se debe verificar que el cable no tenga daños en el aislamiento, que las conexiones estén firmes y que tenga conexión a tierra." },
      { question: "¿Qué es la guarda de seguridad en herramientas de poder?", options: ["Un candado", "Una cubierta protectora que evita el contacto con partes móviles o proyecciones", "Un manual de usuario", "Una etiqueta de precio"], correctIndex: 1, explanation: "La guarda es una cubierta protectora que impide el contacto accidental con discos, hojas o partes móviles y detiene proyecciones de material." },
    ],
  },
  "ergonomia-trastornos-musculoesqueleticos": {
    title: "Evaluación: Ergonomía y Trastornos Musculoesqueléticos",
    passingScore: 70,
    questions: [
      { question: "¿Qué es la ergonomía?", options: ["El estudio de la electricidad", "La ciencia que adapta el trabajo a las capacidades del ser humano", "Un tipo de ejercicio", "Un método de limpieza"], correctIndex: 1, explanation: "La ergonomía es la ciencia que estudia la interacción entre el ser humano y su entorno de trabajo, buscando adaptar las tareas a las capacidades humanas." },
      { question: "¿Cuál es el TME más común en trabajadores de oficina?", options: ["Fractura de pierna", "Síndrome del túnel carpiano", "Quemaduras", "Sordera"], correctIndex: 1, explanation: "El síndrome del túnel carpiano es uno de los TME más comunes en oficina, causado por movimientos repetitivos de muñeca en teclado y ratón." },
      { question: "¿Cuál es la postura correcta al estar sentado en una estación de trabajo?", options: ["Inclinado hacia adelante", "Pies apoyados, espalda recta con soporte lumbar, pantalla a nivel de ojos", "Piernas cruzadas", "Reclinado hacia atrás completamente"], correctIndex: 1, explanation: "La postura correcta incluye: pies apoyados en el piso, espalda recta con soporte lumbar, codos a 90°, pantalla a nivel de ojos a 50-70 cm." },
      { question: "¿Qué son las pausas activas?", options: ["Descansos para comer", "Ejercicios breves durante la jornada para prevenir fatiga y TME", "Tiempo para revisar el celular", "Salir a fumar"], correctIndex: 1, explanation: "Las pausas activas son ejercicios breves (5-10 minutos) realizados durante la jornada para prevenir fatiga muscular y trastornos musculoesqueléticos." },
      { question: "¿Cuál es el peso máximo recomendado para carga manual según normas mexicanas?", options: ["50 kg para hombres", "25 kg para hombres y 12.5 kg para mujeres", "No hay límite", "10 kg para todos"], correctIndex: 1, explanation: "La NOM-036-1-STPS establece límites de 25 kg para hombres y 12.5 kg para mujeres en condiciones ideales de levantamiento." },
      { question: "¿Qué factores de riesgo ergonómico causan TME?", options: ["Solo el peso de los objetos", "Posturas forzadas, movimientos repetitivos, manejo de cargas, vibración y tiempo de exposición", "Solo la temperatura", "Solo el ruido"], correctIndex: 1, explanation: "Los principales factores son: posturas forzadas, movimientos repetitivos, manejo manual de cargas, vibración y exposición prolongada." },
      { question: "¿Cada cuánto tiempo se recomienda tomar pausas activas?", options: ["Una vez al día", "Cada 1-2 horas de trabajo continuo", "Solo al inicio del turno", "Solo cuando hay dolor"], correctIndex: 1, explanation: "Se recomienda realizar pausas activas cada 1-2 horas de trabajo continuo para prevenir la acumulación de fatiga y tensión muscular." },
    ],
  },
  "soldadura-corte-seguridad": {
    title: "Evaluación: Soldadura y Corte — Seguridad",
    passingScore: 70,
    questions: [
      { question: "¿Cuál es el principal riesgo al soldar sin protección visual?", options: ["Dolor de cabeza", "Daño ocular por radiación ultravioleta e infrarroja (queratitis actínica)", "Mareos", "Fatiga"], correctIndex: 1, explanation: "La radiación UV e IR de la soldadura causa queratitis actínica ('ojo de soldador'), daño a la retina y cataratas." },
      { question: "¿Qué número de filtro mínimo se recomienda para soldadura por arco?", options: ["No. 3", "No. 5", "No. 10-12", "No. 1"], correctIndex: 2, explanation: "Para soldadura por arco eléctrico se recomiendan filtros No. 10 a 14 dependiendo del amperaje utilizado." },
      { question: "¿Qué gases tóxicos puede generar la soldadura?", options: ["Solo oxígeno", "Monóxido de carbono, ozono, óxidos de nitrógeno y humos metálicos", "Solo vapor de agua", "Ninguno si hay ventilación"], correctIndex: 1, explanation: "La soldadura genera gases tóxicos como monóxido de carbono, ozono, óxidos de nitrógeno, y humos metálicos que requieren ventilación adecuada." },
      { question: "¿A qué distancia mínima deben estar los cilindros de gas de la zona de soldadura?", options: ["1 metro", "3 metros", "6 metros (20 pies)", "Sin restricción"], correctIndex: 2, explanation: "Los cilindros de gas deben estar a mínimo 6 metros (20 pies) de la zona de soldadura o corte para prevenir explosiones." },
      { question: "¿Qué es un permiso de trabajo en caliente?", options: ["Un permiso para trabajar con calor ambiental", "Autorización documentada para realizar soldadura o corte en áreas no designadas", "Un permiso de vacaciones", "Un documento fiscal"], correctIndex: 1, explanation: "El permiso de trabajo en caliente autoriza la soldadura, corte u operaciones con chispa en áreas donde normalmente no se realizan estas actividades." },
      { question: "¿Qué EPP es obligatorio para el soldador?", options: ["Solo guantes", "Careta con filtro, guantes de carnaza, peto, polainas, calzado de seguridad y protección respiratoria", "Solo lentes oscuros", "Solo mandil"], correctIndex: 1, explanation: "El soldador requiere: careta con filtro adecuado, guantes de carnaza, peto de cuero, polainas, calzado de seguridad y protección respiratoria." },
      { question: "¿Cuánto tiempo debe mantenerse la vigilancia contra incendio después de soldar?", options: ["5 minutos", "30-60 minutos mínimo", "No es necesario", "Solo si hubo chispas"], correctIndex: 1, explanation: "Se debe mantener vigilancia contra incendio durante al menos 30-60 minutos después de terminar los trabajos de soldadura o corte." },
    ],
  },
  "operacion-segura-montacargas": {
    title: "Evaluación: Operación Segura de Montacargas",
    passingScore: 70,
    questions: [
      { question: "¿Qué documento debe tener un operador de montacargas?", options: ["Licencia de conducir tipo A", "Licencia o constancia de capacitación DC-3 para operar montacargas", "Solo credencial de elector", "Pasaporte"], correctIndex: 1, explanation: "El operador debe contar con una constancia de capacitación (DC-3) que acredite su competencia para operar montacargas." },
      { question: "¿Cuál es la capacidad de carga que nunca debe excederse?", options: ["La que indique el supervisor", "La especificada en la placa de datos del montacargas", "La que el operador considere segura", "No hay límite"], correctIndex: 1, explanation: "Nunca debe excederse la capacidad nominal indicada en la placa de datos del montacargas, considerando el centro de carga." },
      { question: "¿A qué altura deben transportarse las horquillas cuando el montacargas está en movimiento?", options: ["A la máxima altura", "A 15-20 cm del piso", "A la altura de los ojos", "No importa la altura"], correctIndex: 1, explanation: "Las horquillas deben transportarse a 15-20 cm del piso con el mástil inclinado hacia atrás para mantener estabilidad y visibilidad." },
      { question: "¿Qué se debe hacer en pendientes con carga?", options: ["Subir de reversa y bajar de frente", "Subir de frente con carga adelante y bajar de reversa", "No transitar pendientes", "Acelerar para mantener el impulso"], correctIndex: 1, explanation: "En pendientes: subir con la carga cuesta arriba (de frente) y bajar con la carga cuesta arriba (de reversa) para evitar que la carga se deslice." },
      { question: "¿Cuál es la inspección que debe realizarse antes de cada turno?", options: ["Solo verificar combustible", "Inspección pre-operacional: frenos, dirección, horquillas, llantas, fluidos, alarmas y luces", "Solo arrancar el motor", "Ninguna si se usó el día anterior"], correctIndex: 1, explanation: "La inspección pre-operacional incluye: frenos, dirección, horquillas, llantas, niveles de fluidos, claxon, alarma de reversa y luces." },
      { question: "¿Qué hacer si la carga obstruye la visión hacia adelante?", options: ["Conducir lentamente mirando por un lado", "Conducir en reversa o solicitar un guía señalero", "Subir más las horquillas", "Acelerar para llegar rápido"], correctIndex: 1, explanation: "Si la carga obstruye la visión, se debe conducir en reversa o contar con un guía señalero que dirija el trayecto." },
      { question: "¿Está permitido transportar personas en las horquillas del montacargas?", options: ["Sí, si van sentadas", "No, nunca está permitido transportar personas en las horquillas", "Sí, solo distancias cortas", "Sí, con autorización"], correctIndex: 1, explanation: "Nunca está permitido transportar personas en las horquillas, plataformas improvisadas o cualquier parte del montacargas no diseñada para ello." },
    ],
  },
  "actualizacion-montacargas": {
    title: "Evaluación: Actualización de Montacargas",
    passingScore: 70,
    questions: [
      { question: "¿Cada cuánto tiempo se recomienda la recertificación de operadores de montacargas?", options: ["Cada 5 años", "Cada 3 años", "Cada año", "Solo una vez en la vida"], correctIndex: 1, explanation: "Se recomienda la recertificación cada 3 años o cuando haya accidentes, cambio de equipo, o modificación en las condiciones del área." },
      { question: "¿Qué es el triángulo de estabilidad del montacargas?", options: ["Un dispositivo de seguridad", "El área formada por los tres puntos de apoyo que determina la estabilidad", "Un tipo de carga", "Una señal de tránsito"], correctIndex: 1, explanation: "El triángulo de estabilidad está formado por los dos ejes de las ruedas delanteras y el punto de pivote del eje trasero; la carga y el centro de gravedad deben permanecer dentro." },
      { question: "¿Qué es el centro de carga?", options: ["El lugar donde se almacenan las cargas", "La distancia desde la cara de las horquillas hasta el centro de gravedad de la carga", "El centro del almacén", "La mitad del peso de la carga"], correctIndex: 1, explanation: "El centro de carga es la distancia horizontal desde la cara vertical de las horquillas hasta el centro de gravedad de la carga." },
      { question: "¿Cuál es la velocidad máxima segura dentro de un almacén?", options: ["20 km/h", "5-10 km/h según condiciones", "30 km/h", "No hay límite"], correctIndex: 1, explanation: "La velocidad dentro de almacenes debe ser de 5-10 km/h, reduciendo en intersecciones, zonas peatonales y pisos irregulares." },
      { question: "¿Qué cambio tecnológico reciente impacta la operación de montacargas?", options: ["Solo el color", "Sistemas de asistencia (cámaras, sensores de proximidad, telemetría)", "Nada ha cambiado", "Solo el combustible"], correctIndex: 1, explanation: "Las nuevas tecnologías incluyen: cámaras de reversa, sensores de proximidad, sistemas de telemetría, limitadores de velocidad automáticos y montacargas eléctricos." },
      { question: "¿Qué precaución adicional requieren los montacargas eléctricos?", options: ["Ninguna especial", "Cuidado con el área de carga de baterías (ventilación, derrames ácidos, chispas)", "Solo cargar de noche", "Usar gasolina de reserva"], correctIndex: 1, explanation: "Los montacargas eléctricos requieren áreas de carga de baterías ventiladas, protección contra derrames de ácido y prevención de chispas por gases de hidrógeno." },
      { question: "¿Qué debe hacer un operador si detecta una falla mecánica durante la operación?", options: ["Continuar trabajando hasta el fin del turno", "Detener el equipo inmediatamente, reportar la falla y no usarlo hasta que sea reparado", "Solo reportar al final del día", "Intentar repararlo él mismo"], correctIndex: 1, explanation: "Ante cualquier falla mecánica el operador debe detener el equipo de inmediato, estacionarlo de forma segura, reportar la falla y no utilizarlo hasta su reparación." },
    ],
  },
  "nom-019-comisiones-seguridad-higiene": {
    title: "Evaluación: NOM-019 — Comisiones de Seguridad e Higiene",
    passingScore: 70,
    questions: [
      { question: "¿Qué establece la NOM-019-STPS?", options: ["Colores de señalización", "La constitución, integración, organización y funcionamiento de las comisiones de seguridad e higiene", "El uso de EPP", "El bloqueo de energías"], correctIndex: 1, explanation: "La NOM-019-STPS establece los lineamientos para constituir, integrar, organizar y hacer funcionar las comisiones de seguridad e higiene." },
      { question: "¿Qué centros de trabajo están obligados a tener una comisión de seguridad e higiene?", options: ["Solo los de más de 100 trabajadores", "Todos los centros de trabajo", "Solo los industriales", "Solo los gubernamentales"], correctIndex: 1, explanation: "Todos los centros de trabajo están obligados a constituir al menos una comisión de seguridad e higiene." },
      { question: "¿Cómo se integra la comisión de seguridad e higiene?", options: ["Solo por el patrón", "Con igual número de representantes de los trabajadores y del patrón", "Solo por los trabajadores", "Por un consultor externo"], correctIndex: 1, explanation: "La comisión se integra de manera paritaria: igual número de representantes de los trabajadores y del patrón." },
      { question: "¿Cuál es la función principal de la comisión?", options: ["Contratar personal", "Investigar accidentes, identificar riesgos y proponer medidas preventivas", "Calcular nómina", "Vender productos"], correctIndex: 1, explanation: "La comisión investiga accidentes, identifica condiciones peligrosas, propone medidas preventivas y vigila el cumplimiento normativo." },
      { question: "¿Con qué frecuencia mínima debe realizar recorridos la comisión?", options: ["Anualmente", "Semestralmente", "Trimestralmente o cada 90 días", "Mensualmente"], correctIndex: 2, explanation: "La comisión debe realizar recorridos de verificación al menos cada 90 días (trimestralmente) para identificar condiciones peligrosas." },
      { question: "¿Qué documentos debe generar la comisión?", options: ["Solo actas de reunión", "Actas de constitución, de recorridos, programas de actividades y reportes de investigación de accidentes", "Solo la nómina", "Solo informes al IMSS"], correctIndex: 1, explanation: "La comisión genera: acta constitutiva, actas de recorridos de verificación, programa anual de actividades y reportes de investigación de accidentes." },
      { question: "¿Cuánto tiempo dura el cargo de los representantes de la comisión?", options: ["1 año", "2 años", "3 años", "Indefinido"], correctIndex: 1, explanation: "Los representantes de la comisión de seguridad e higiene duran en su cargo 2 años, pudiendo ser reelectos." },
    ],
  },
};

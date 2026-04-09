// ═══════════════════════════════════════════════════════════
// QUIZZES — CURSOS PROCADIST (PARTE 1: 15 cursos)
// 7 preguntas por curso | Formato TypeScript para Replit
// ═══════════════════════════════════════════════════════════

export const procadistQuizzes: Record<string, any> = {

"comunicacion-efectiva-trabajo": {
  title: "Evaluación: Comunicación Efectiva en el Trabajo", passingScore: 70,
  questions: [
    { question: "Según el modelo de Mehrabian, ¿qué porcentaje del mensaje se transmite con palabras?", options: ["7%", "38%", "55%", "93%"], correctIndex: 0, explanation: "Solo el 7% es verbal. El 38% es tono de voz y el 55% es lenguaje corporal." },
    { question: "La retroalimentación en el proceso comunicativo es:", options: ["Opcional y poco importante", "La respuesta del receptor que confirma si el mensaje fue entendido", "Solo necesaria en comunicación escrita", "Responsabilidad exclusiva del emisor"], correctIndex: 1, explanation: "La retroalimentación es el elemento que cierra el ciclo comunicativo y verifica comprensión." },
    { question: "El estilo de comunicación asertivo se caracteriza por:", options: ["Imponer tus necesidades sobre las de otros", "Evitar expresar opiniones para no generar conflicto", "Expresar necesidades con respeto y escuchar activamente", "Usar sarcasmo e ironía para comunicar"], correctIndex: 2, explanation: "La asertividad expresa necesidades y opiniones con respeto, sin agresividad ni pasividad." },
    { question: "La comunicación descendente en una organización va:", options: ["De trabajadores a jefes", "De jefes a trabajadores", "Entre compañeros del mismo nivel", "De clientes a la empresa"], correctIndex: 1, explanation: "Descendente: de jefes a colaboradores. Ascendente: de colaboradores a jefes. Horizontal: entre pares." },
    { question: "La técnica de parafraseo consiste en:", options: ["Repetir exactamente lo que dijo la otra persona", "Decir con tus palabras lo que entendiste para verificar", "Cambiar de tema cuando no entiendes", "Interrumpir para corregir"], correctIndex: 1, explanation: "'Lo que entiendo es que...' permite verificar comprensión y reducir malentendidos hasta en un 80%." },
    { question: "¿Cuál NO es una barrera de la comunicación?", options: ["Ruido ambiental (física)", "Jerga técnica (semántica)", "Escucha empática", "Prejuicios (psicológica)"], correctIndex: 2, explanation: "La escucha empática es una SOLUCIÓN a las barreras, no una barrera. Las barreras son físicas, semánticas, psicológicas, culturales y organizacionales." },
    { question: "Para temas delicados en el trabajo, el canal más recomendado es:", options: ["WhatsApp", "Correo electrónico", "Cara a cara", "Mensaje de voz"], correctIndex: 2, explanation: "Los temas delicados requieren comunicación cara a cara donde se pueda leer el lenguaje corporal y responder en tiempo real." }
  ]
},

"trabajo-en-equipo-procadist": {
  title: "Evaluación: Trabajo en Equipo", passingScore: 70,
  questions: [
    { question: "La diferencia principal entre un grupo y un equipo es:", options: ["El tamaño", "El equipo tiene objetivo compartido, roles complementarios y responsabilidad mutua", "El grupo tiene líder y el equipo no", "No hay diferencia real"], correctIndex: 1, explanation: "Un grupo comparte espacio; un equipo comparte objetivo, roles complementarios y responsabilidad mutua." },
    { question: "Según Tuckman, la etapa donde surgen los conflictos es:", options: ["Formación", "Tormenta", "Normalización", "Desempeño"], correctIndex: 1, explanation: "La tormenta es donde afloran conflictos, choques y luchas por liderazgo. Es incómoda pero necesaria." },
    { question: "Según Belbin, un equipo efectivo necesita:", options: ["Solo personas muy inteligentes", "Diversidad de roles: acción, sociales y mentales", "Personas con la misma personalidad", "Al menos 20 miembros"], correctIndex: 1, explanation: "La diversidad de roles asegura que el equipo tenga ideas, ejecución, análisis y armonía." },
    { question: "Las 5 disfunciones de un equipo (Lencioni) comienzan con:", options: ["Falta de resultados", "Ausencia de confianza", "Temor al conflicto", "Falta de compromiso"], correctIndex: 1, explanation: "Sin confianza, no hay conflicto honesto; sin conflicto, no hay compromiso; y así en cascada." },
    { question: "En un conflicto de equipo, 'separar el problema de la persona' significa:", options: ["Ignorar a la persona", "Criticar la situación, no atacar al individuo", "Resolver sin hablar con nadie", "Dejar que el jefe decida"], correctIndex: 1, explanation: "'El reporte está incompleto' (situación) es diferente a 'Eres irresponsable' (ataque personal)." },
    { question: "El stand-up diario de 5 minutos responde:", options: ["¿Cuánto gané hoy?", "¿Qué hice ayer? ¿Qué haré hoy? ¿Qué me bloquea?", "¿Quién es el mejor del equipo?", "¿Cuántas horas trabajaste?"], correctIndex: 1, explanation: "Estas 3 preguntas mantienen al equipo alineado, detectan bloqueos rápido y fomentan la transparencia." },
    { question: "El 'pensamiento grupal' (Groupthink) ocurre cuando:", options: ["Hay mucho conflicto", "La cohesión excesiva impide cuestionar ideas", "El equipo es muy diverso", "Hay un líder muy fuerte"], correctIndex: 1, explanation: "Demasiada armonía puede evitar que se cuestionen ideas malas, resultando en decisiones pobres que nadie desafió." }
  ]
},

"ia-vida-trabajo": {
  title: "Evaluación: IA para la Vida y el Trabajo", passingScore: 70,
  questions: [
    { question: "La Inteligencia Artificial es:", options: ["Solo robots humanoides", "La capacidad de las máquinas para realizar tareas que requieren inteligencia humana", "Una moda pasajera sin aplicación real", "Solo para programadores"], correctIndex: 1, explanation: "La IA permite a las máquinas entender lenguaje, reconocer imágenes, tomar decisiones y aprender de datos." },
    { question: "La diferencia entre IA tradicional e IA Generativa es:", options: ["No hay diferencia", "La generativa CREA contenido nuevo; la tradicional clasifica y predice", "La tradicional es más poderosa", "La generativa solo hace imágenes"], correctIndex: 1, explanation: "IA tradicional: clasifica y predice. IA Generativa: crea contenido nuevo (texto, imágenes, código, audio)." },
    { question: "Un 'prompt' es:", options: ["Un tipo de virus informático", "La instrucción o pregunta que le das a la IA", "El resultado que da la IA", "Una marca de computadora"], correctIndex: 1, explanation: "El prompt es tu instrucción a la IA. Mejor prompt = mejor resultado." },
    { question: "Las 'alucinaciones' de la IA son:", options: ["Cuando la IA sueña", "Información inventada que suena convincente pero es falsa", "Errores de conexión a internet", "Problemas de hardware"], correctIndex: 1, explanation: "Las IA generativas pueden inventar datos, citas o hechos que suenan reales pero son completamente falsos. Siempre verifica." },
    { question: "¿Qué NO debes compartir con herramientas de IA públicas?", options: ["Preguntas de cultura general", "Datos confidenciales, contraseñas o información financiera personal", "Solicitudes de recetas de cocina", "Ideas para proyectos personales"], correctIndex: 1, explanation: "Nunca compartas datos sensibles con IA pública. Los datos pueden ser procesados y almacenados." },
    { question: "Para hacer un buen prompt, lo más importante es:", options: ["Escribir muy largo", "Ser específico, dar contexto y definir el formato esperado", "Usar palabras técnicas complicadas", "Copiar prompts de internet sin cambios"], correctIndex: 1, explanation: "Especificidad + contexto + formato = resultados útiles. Iterar mejora aún más el resultado." },
    { question: "La IA va a:", options: ["Reemplazar a todos los trabajadores", "Reemplazar a los trabajadores que no sepan usarla", "Desaparecer en 5 años", "Solo afectar al sector tecnológico"], correctIndex: 1, explanation: "La IA no reemplaza personas — amplifica capacidades. Quienes la dominen tendrán ventaja competitiva." }
  ]
},

"derechos-laborales-reforma": {
  title: "Evaluación: Derechos Laborales y Reforma Laboral", passingScore: 70,
  questions: [
    { question: "El artículo constitucional que establece el derecho al trabajo digno es:", options: ["Artículo 3", "Artículo 27", "Artículo 123", "Artículo 135"], correctIndex: 2, explanation: "El Art. 123 establece el derecho al trabajo digno y socialmente útil, y las condiciones mínimas laborales." },
    { question: "Según la LFT, el salario mínimo general diario en 2026 es aproximadamente:", options: ["$100 MXN", "$200 MXN", "Alrededor de $278 MXN", "$500 MXN"], correctIndex: 2, explanation: "El salario mínimo general 2026 es de $278.80 MXN diarios ($419.88 en la frontera norte)." },
    { question: "Las vacaciones mínimas en el primer año de trabajo son:", options: ["6 días", "12 días", "15 días", "20 días"], correctIndex: 1, explanation: "La reforma de vacaciones dignas (2023) estableció 12 días de vacaciones en el primer año de trabajo." },
    { question: "La Reforma Laboral de 2019 creó:", options: ["El IMSS", "El Centro Federal de Conciliación y Registro Laboral y nuevos tribunales laborales", "La STPS", "El salario mínimo"], correctIndex: 1, explanation: "La reforma creó el CFCRL, nuevos tribunales laborales, y fortaleció la democracia sindical." },
    { question: "PROFEDET es:", options: ["Un sindicato", "Un servicio gratuito de asesoría legal laboral del gobierno", "Un seguro médico", "Una empresa privada de abogados"], correctIndex: 1, explanation: "PROFEDET ofrece asesoría y representación legal gratuita a trabajadores. Línea: 800-911-7877." },
    { question: "El acoso laboral (mobbing) está regulado en:", options: ["No está regulado en México", "LFT Art. 3 Bis y NOM-035-STPS-2018", "Solo en el Código Penal", "Solo en convenios internacionales"], correctIndex: 1, explanation: "La LFT Art. 3 Bis define violencia laboral y la NOM-035 obliga a prevenirla como factor de riesgo psicosocial." },
    { question: "Los Principios Rectores de la ONU sobre Empresas y DDHH establecen que las empresas deben:", options: ["Solo obedecer las leyes locales", "Proteger, respetar y remediar violaciones a derechos humanos", "No tienen obligaciones en DDHH", "Solo las transnacionales tienen obligaciones"], correctIndex: 1, explanation: "Los 3 pilares: el Estado protege, las empresas respetan, y deben existir mecanismos de remediación." }
  ]
},

"habilidades-directivas": {
  title: "Evaluación: Habilidades Directivas", passingScore: 70,
  questions: [
    { question: "En la Matriz de Eisenhower, las tareas 'Importantes pero No Urgentes' deben:", options: ["Hacerse inmediatamente", "Planificarse para hacerlas pronto", "Delegarse", "Eliminarse"], correctIndex: 1, explanation: "Las tareas importantes-no urgentes (desarrollo, prevención, estrategia) deben planificarse. Son las que más impacto tienen." },
    { question: "Según Daniel Pink, lo que realmente motiva a largo plazo es:", options: ["Solo el dinero", "Autonomía, maestría y propósito", "Premios y castigos", "Competencia entre compañeros"], correctIndex: 1, explanation: "Después de cubrir necesidades básicas, la autonomía, maestría y propósito son motivadores más poderosos que el dinero." },
    { question: "En el liderazgo situacional, un 'delegador' se usa con:", options: ["Novatos que necesitan instrucciones", "Personas en desarrollo", "Expertos autónomos que solo necesitan libertad", "Personas desmotivadas"], correctIndex: 2, explanation: "El estilo delegador (baja dirección, baja relación) es para personas competentes y motivadas que funcionan mejor con autonomía." },
    { question: "Al delegar, lo correcto es definir:", options: ["El resultado esperado, plazo y recursos (el qué, no el cómo)", "Cada paso exacto que la persona debe seguir", "Solo la fecha límite", "Nada, confiar ciegamente"], correctIndex: 0, explanation: "Delegar efectivamente es definir el resultado esperado y dar libertad sobre el método. Así se desarrolla al equipo." },
    { question: "La negociación basada en intereses propone:", options: ["Ganar a toda costa", "Enfocarse en intereses subyacentes, no en posiciones", "Ceder siempre para mantener la paz", "No negociar, imponer"], correctIndex: 1, explanation: "Las posiciones son lo que pides; los intereses son lo que realmente necesitas. Enfocarse en intereses abre más opciones de solución." },
    { question: "¿Qué NO se debe delegar?", options: ["Tareas repetitivas", "Responsabilidad final y rendición de cuentas", "Tareas que desarrollen al equipo", "Actividades operativas"], correctIndex: 1, explanation: "Se delega la tarea pero no la responsabilidad final. El líder siempre rinde cuentas por los resultados de su equipo." },
    { question: "Los 'ladrones del tiempo' más comunes son:", options: ["Los compañeros amables", "Reuniones innecesarias, interrupciones, falta de priorización y perfeccionismo", "Las pausas de café", "El trabajo en equipo"], correctIndex: 1, explanation: "Reuniones sin objetivo, interrupciones constantes, no priorizar y querer que todo sea perfecto consumen tiempo sin agregar valor." }
  ]
},

"administracion-capacitacion-rh-1": {
  title: "Evaluación: Administración de la Capacitación y RH", passingScore: 70,
  questions: [
    { question: "El artículo de la LFT que establece el derecho a la capacitación es:", options: ["Art. 3", "Art. 123", "Art. 153-A", "Art. 512"], correctIndex: 2, explanation: "El Art. 153-A establece que todo trabajador tiene derecho a recibir capacitación o adiestramiento de su patrón." },
    { question: "El formato DC-3 es:", options: ["El plan de capacitación", "La constancia de competencias/habilidades laborales del trabajador", "La lista de asistencia", "El registro del agente capacitador"], correctIndex: 1, explanation: "El DC-3 es la constancia individual que acredita que el trabajador recibió y aprobó la capacitación." },
    { question: "La DNC (Detección de Necesidades de Capacitación) se hace ANTES de:", options: ["Pagar la nómina", "Diseñar el programa de capacitación", "Contratar personal", "Abrir la empresa"], correctIndex: 1, explanation: "Primero detectas qué se necesita (DNC), luego diseñas el programa (DC-1) que responda a esas necesidades." },
    { question: "La CMCAP (Comisión Mixta de Capacitación) se integra con:", options: ["Solo representantes del patrón", "Solo el área de RH", "Representantes del patrón y de los trabajadores en partes iguales", "Solo el sindicato"], correctIndex: 2, explanation: "Es bipartita: igual número de representantes patronales y de trabajadores, para supervisar la capacitación." },
    { question: "La capacitación debe impartirse preferentemente:", options: ["Fuera del horario laboral", "Durante la jornada de trabajo", "Los fines de semana", "Solo en vacaciones"], correctIndex: 1, explanation: "El Art. 153-E de la LFT establece que la capacitación se imparte durante la jornada, salvo acuerdo entre las partes." },
    { question: "¿Cuánto tiempo debe conservarse la evidencia de capacitación?", options: ["1 año", "Al menos 3 años", "5 años", "Permanentemente"], correctIndex: 1, explanation: "La STPS puede solicitar evidencia de capacitación, por lo que se recomienda conservarla al menos 3 años." },
    { question: "El microlearning es:", options: ["Aprender con microscopio", "Contenidos breves de 5-15 minutos enfocados en un tema específico", "Capacitación solo para micro-empresas", "Aprendizaje solo por celular"], correctIndex: 1, explanation: "El microlearning divide el contenido en módulos cortos y específicos, aprovechando mejor la atención y facilitando el aprendizaje." }
  ]
},

"nom-002-prevencion-incendios": {
  title: "Evaluación: NOM-002 Prevención de Incendios", passingScore: 70,
  questions: [
    { question: "La NOM-002-STPS-2010 clasifica el riesgo de incendio como:", options: ["Bajo, medio y alto", "Ordinario y alto", "Clase A, B y C", "Verde, amarillo y rojo"], correctIndex: 1, explanation: "La NOM-002 clasifica los centros de trabajo como riesgo ordinario (materiales clase A moderados) o riesgo alto (grandes cantidades o líquidos/gases)." },
    { question: "La distancia máxima para alcanzar un extintor debe ser:", options: ["5 metros", "10 metros", "15 metros", "25 metros"], correctIndex: 2, explanation: "El recorrido máximo para alcanzar un extintor no debe exceder 15 metros según la NOM-002." },
    { question: "¿Cuántos simulacros al año requiere la NOM-002 como mínimo?", options: ["Ninguno", "Al menos 1", "Al menos 2", "Al menos 4"], correctIndex: 1, explanation: "La NOM-002 requiere al menos 1 simulacro anual. La recomendación práctica es hacer 2 (uno con aviso, otro sin aviso)." },
    { question: "Los detectores de humo fotoeléctricos son mejores para:", options: ["Llamas rápidas", "Fuegos con humo denso y lento", "Fuegos de clase K", "Incendios eléctricos"], correctIndex: 1, explanation: "Los fotoeléctricos detectan humo denso de combustión lenta. Los iónicos son mejores para llamas rápidas con poco humo." },
    { question: "Un sistema de rociadores automáticos se activa por:", options: ["Un botón manual", "Calor que funde un sello en cada rociador", "Humo detectado", "Movimiento"], correctIndex: 1, explanation: "Los rociadores tienen un elemento fusible que se rompe con el calor, activando solo los rociadores en la zona del fuego." },
    { question: "El 'vigía de fuego' después de trabajos en caliente debe permanecer:", options: ["5 minutos", "15 minutos", "30 minutos", "1 hora"], correctIndex: 2, explanation: "El vigía permanece mínimo 30 minutos después de terminar, ya que chispas pueden generar fuego latente." },
    { question: "La iluminación de emergencia debe funcionar al menos:", options: ["15 minutos", "30 minutos", "1 hora", "4 horas"], correctIndex: 2, explanation: "La iluminación de emergencia debe tener autonomía mínima de 1 hora para permitir evacuación segura." }
  ]
},

"nom-006-manejo-almacenamiento": {
  title: "Evaluación: NOM-006 Manejo y Almacenamiento", passingScore: 70,
  questions: [
    { question: "Al levantar una carga del piso, lo correcto es:", options: ["Doblar la espalda para alcanzar", "Flexionar rodillas, espalda recta, levantar con las piernas", "Levantar con un solo brazo", "Girar el tronco mientras levantas"], correctIndex: 1, explanation: "Rodillas flexionadas, espalda recta, carga pegada al cuerpo, levantar con piernas. Nunca girar el tronco." },
    { question: "El peso máximo recomendado para levantamiento manual en condiciones ideales es:", options: ["10 kg", "25 kg para hombres, 12.5 kg para mujeres", "50 kg", "Sin límite si tienes fuerza"], correctIndex: 1, explanation: "La NOM-036-1-STPS establece 25 kg (hombres) y 12.5 kg (mujeres) en condiciones ideales. Se reduce según factores." },
    { question: "PEPS en almacenamiento significa:", options: ["Productos Especiales Para Seguridad", "Primeras Entradas, Primeras Salidas", "Peligro En Pisos Superiores", "Plan Estratégico de Prevención y Seguridad"], correctIndex: 1, explanation: "PEPS asegura que los productos más antiguos se usen primero, evitando caducidades y deterioro." },
    { question: "Los racks de almacenamiento deben anclarse al piso cuando superan:", options: ["0.5 metros", "1.0 metro", "1.5 metros de altura", "3 metros"], correctIndex: 2, explanation: "Estantería de más de 1.5 metros debe anclarse para prevenir volcaduras por sismo, impacto o sobrecarga." },
    { question: "¿Quién puede operar un montacargas?", options: ["Cualquier trabajador", "Solo personal capacitado y autorizado", "El más antiguo del turno", "Cualquiera con licencia de conducir"], correctIndex: 1, explanation: "Solo personal que haya recibido capacitación específica y autorización formal puede operar montacargas." },
    { question: "Materiales oxidantes y materiales inflamables deben almacenarse:", options: ["Juntos para ahorrar espacio", "Separados, según compatibilidad química", "En cualquier lugar ventilado", "Solo en exteriores"], correctIndex: 1, explanation: "Almacenar materiales incompatibles juntos puede causar reacciones peligrosas, incendios o explosiones." },
    { question: "Al apilar materiales, las cargas más pesadas deben ir:", options: ["Arriba para mejor visibilidad", "Abajo para mayor estabilidad", "Al centro", "No importa el orden"], correctIndex: 1, explanation: "Cargas pesadas abajo mantienen el centro de gravedad bajo, dando mayor estabilidad a la pila." }
  ]
},

"nom-009-trabajos-altura": {
  title: "Evaluación: NOM-009 Trabajos en Altura", passingScore: 70,
  questions: [
    { question: "Se considera 'trabajo en altura' a partir de:", options: ["1 metro", "1.80 metros", "3 metros", "5 metros"], correctIndex: 1, explanation: "La NOM-009 define trabajo en altura como toda actividad a 1.80 metros o más sobre el nivel de referencia." },
    { question: "El ÚNICO dispositivo aceptado para protección contra caídas es:", options: ["Cinturón de seguridad", "Arnés de cuerpo completo", "Cuerda amarrada a la cintura", "Casco con barbiquejo"], correctIndex: 1, explanation: "Solo el arnés de cuerpo completo es aceptado. Los cinturones de seguridad no distribuyen la fuerza y pueden causar lesiones." },
    { question: "Un punto de anclaje debe soportar al menos:", options: ["500 kg", "1,000 kg", "2,268 kg (5,000 lb) por persona", "5,000 kg"], correctIndex: 2, explanation: "El punto de anclaje debe resistir 2,268 kg (5,000 lb) por persona para garantizar que soporte la fuerza de una caída." },
    { question: "Si un trabajador cae y queda suspendido del arnés, el tiempo máximo seguro es:", options: ["1 hora", "30 minutos", "15-20 minutos antes del síndrome de suspensión", "Sin límite si tiene arnés"], correctIndex: 2, explanation: "El síndrome de suspensión puede ser fatal en 15-20 minutos si la persona queda inmóvil. El rescate debe ser rápido." },
    { question: "La regla 4:1 para escaleras significa:", options: ["4 personas máximo por escalera", "Por cada 4 metros de altura, la base se aleja 1 metro de la pared", "4 puntos de apoyo, 1 persona", "4 minutos máximo en la escalera"], correctIndex: 1, explanation: "La proporción 4:1 asegura el ángulo correcto (~75°) para estabilidad de la escalera." },
    { question: "¿Qué condición prohíbe realizar trabajos en altura?", options: ["Temperatura de 30°C", "Vientos mayores a 35 km/h", "Nubes en el cielo", "Que sea lunes"], correctIndex: 1, explanation: "Vientos >35 km/h, tormentas eléctricas, lluvia intensa y oscuridad sin iluminación prohíben el trabajo en altura." },
    { question: "Al rescatar a una persona suspendida, NO se debe:", options: ["Actuar rápidamente", "Acostarla inmediatamente (mantenerla semi-sentada)", "Llamar a servicios médicos", "Usar equipo de rescate"], correctIndex: 1, explanation: "NO acostar inmediatamente — la sangre acumulada en las piernas puede causar shock al redistribuirse de golpe. Posición semi-sentada." }
  ]
},

"nom-025-iluminacion": {
  title: "Evaluación: NOM-025 Iluminación", passingScore: 70,
  questions: [
    { question: "El nivel mínimo de iluminación para oficinas es:", options: ["50 lux", "200 lux", "300 lux", "500 lux"], correctIndex: 2, explanation: "300 lux para oficinas y trabajo de escritorio. 200 para producción general. 500+ para trabajo de detalle fino." },
    { question: "La iluminación se mide con:", options: ["Termómetro", "Luxómetro", "Decibelímetro", "Barómetro"], correctIndex: 1, explanation: "El luxómetro mide la intensidad de iluminación en lux, en el plano de trabajo donde se realiza la tarea." },
    { question: "El deslumbramiento es causado por:", options: ["Poca luz", "Luz excesiva o mal dirigida que ciega", "Luz natural", "Colores oscuros en las paredes"], correctIndex: 1, explanation: "El deslumbramiento directo o reflejado reduce la visibilidad, causa fatiga y puede provocar accidentes." },
    { question: "Las luminarias LED comparadas con las tradicionales:", options: ["Consumen más energía", "Consumen 60-80% menos energía y duran más", "Son iguales", "No sirven para trabajo industrial"], correctIndex: 1, explanation: "LED consume 60-80% menos, dura 5-10 veces más, no genera calor excesivo y da luz más uniforme." },
    { question: "¿Cada cuánto se deben limpiar las luminarias?", options: ["Cada semana", "Mínimo cada 6 meses", "Una vez al año", "Solo cuando se fundan"], correctIndex: 1, explanation: "El polvo acumulado puede reducir hasta un 50% la iluminación. Limpieza mínima cada 6 meses." },
    { question: "La forma más económica de mejorar la iluminación es:", options: ["Comprar luminarias nuevas", "Limpiar las existentes y pintar paredes de colores claros", "Trabajar solo de día", "Abrir ventanas"], correctIndex: 1, explanation: "Antes de comprar: limpiar luminarias, paredes claras, y reorganizar para aprovechar luz natural puede ser suficiente." },
    { question: "La iluminación de emergencia debe tener autonomía mínima de:", options: ["15 minutos", "30 minutos", "1 hora", "4 horas"], correctIndex: 2, explanation: "Mínimo 1 hora de autonomía para permitir evacuación segura en caso de corte de energía eléctrica." }
  ]
},

"nom-030-servicios-preventivos": {
  title: "Evaluación: NOM-030 Servicios Preventivos", passingScore: 70,
  questions: [
    { question: "La NOM-030 establece lineamientos para:", options: ["Solo el uso de EPP", "Organizar los servicios preventivos de seguridad y salud", "Solo la prevención de incendios", "Solo las comisiones de seguridad"], correctIndex: 1, explanation: "La NOM-030 es la norma marco que organiza TODA la gestión de seguridad y salud del centro de trabajo." },
    { question: "Centros de trabajo con más de 100 trabajadores necesitan:", options: ["Solo una lista de acciones", "Un programa de seguridad y salud completo y documentado", "Solo extintores", "Nada especial"], correctIndex: 1, explanation: "100+ trabajadores requieren programa completo. Menos de 100 pueden usar una relación de acciones preventivas." },
    { question: "El primer paso del ciclo PDCA es:", options: ["Hacer", "Planear (diagnóstico → programa)", "Verificar", "Actuar"], correctIndex: 1, explanation: "Plan (diagnóstico y programa) → Do (implementar) → Check (medir) → Act (ajustar). Se repite continuamente." },
    { question: "Los indicadores proactivos de seguridad miden:", options: ["Accidentes ocurridos", "Acciones de prevención realizadas (inspecciones, capacitaciones, reportes)", "Costos de indemnización", "Días perdidos"], correctIndex: 1, explanation: "Los proactivos miden prevención (lo que haces ANTES). Los reactivos miden consecuencias (lo que ya pasó)." },
    { question: "El responsable de servicios preventivos coordina:", options: ["Solo los extintores", "El cumplimiento de TODAS las NOMs aplicables al centro de trabajo", "Solo la NOM-035", "Solo la capacitación"], correctIndex: 1, explanation: "Es el 'director de orquesta' que coordina NOM-019, NOM-017, NOM-035, NOM-002, NOM-026 y todas las aplicables." },
    { question: "El PASST de la STPS es:", options: ["Un examen obligatorio", "Un programa voluntario de autogestión en seguridad con beneficios para la empresa", "Un sistema de multas", "Un formato obligatorio"], correctIndex: 1, explanation: "El Programa de Autogestión es voluntario. Las empresas adheridas reciben reconocimiento y beneficios ante inspecciones." },
    { question: "El diagnóstico de seguridad incluye:", options: ["Solo contar los extintores", "Evaluación de cumplimiento de NOMs, identificación de riesgos y revisión de accidentes", "Solo entrevistar al gerente", "Solo medir la iluminación"], correctIndex: 1, explanation: "El diagnóstico es integral: NOMs aplicables, riesgos por área/puesto, historial de accidentes y estado de equipos." }
  ]
},

"desarrollo-cursos-linea": {
  title: "Evaluación: Desarrollo de Cursos en Línea", passingScore: 70,
  questions: [
    { question: "El primer paso para crear un curso en línea es:", options: ["Diseñar las diapositivas", "Analizar necesidades y definir el perfil del participante", "Grabar los videos", "Elegir la plataforma"], correctIndex: 1, explanation: "Antes de crear contenido, necesitas saber: ¿para quién es? ¿qué problema resuelve? ¿qué debe poder hacer al terminar?" },
    { question: "Los módulos de microlearning duran idealmente:", options: ["1-2 minutos", "15-20 minutos máximo", "1 hora", "3 horas"], correctIndex: 1, explanation: "El microlearning divide el contenido en bloques de 15-20 minutos máximo, respetando los límites de atención del adulto." },
    { question: "Un objetivo de aprendizaje bien escrito contiene:", options: ["Solo el tema", "Verbo de acción + contenido + condición + criterio", "El nombre del instructor", "La fecha del curso"], correctIndex: 1, explanation: "Ejemplo: 'El participante identificará (verbo) los pictogramas SGA (contenido) al observar etiquetas (condición) con 100% de aciertos (criterio).'" },
    { question: "LMS significa:", options: ["Learning Management System", "Local Machine Software", "Lecture and Media Server", "Limited Module Structure"], correctIndex: 0, explanation: "Learning Management System: plataforma que aloja cursos, gestiona inscripciones, registra progreso y emite certificados." },
    { question: "La evaluación formativa se realiza:", options: ["Solo al final del curso", "Durante el curso para verificar comprensión", "Solo antes del curso", "Solo por el jefe"], correctIndex: 1, explanation: "La formativa es durante el proceso (¿están entendiendo?). La sumativa es al final (¿lograron los objetivos?)." },
    { question: "Antes de lanzar un curso en línea, lo ideal es:", options: ["Publicarlo inmediatamente", "Hacer una prueba piloto con 5-10 personas del perfil objetivo", "Esperar 6 meses", "Solo revisar la ortografía"], correctIndex: 1, explanation: "La prueba piloto detecta problemas de contenido, navegación y claridad que el diseñador no ve porque está muy familiarizado." },
    { question: "La estructura ideal de un curso es:", options: ["Solo texto largo", "Apertura (10-15%) → Desarrollo (70-80%) → Cierre (10-15%)", "Solo videos", "Solo evaluaciones"], correctIndex: 1, explanation: "Apertura: objetivos y encuadre. Desarrollo: contenido + práctica. Cierre: resumen, evaluación y compromisos." }
  ]
},

"nom-020-recipientes-presion": {
  title: "Evaluación: NOM-020 Recipientes a Presión", passingScore: 70,
  questions: [
    { question: "Un recipiente a presión es:", options: ["Cualquier tanque de agua", "Un contenedor diseñado para operar a presión mayor a la atmosférica", "Solo los cilindros de gas", "Solo las calderas"], correctIndex: 1, explanation: "Cualquier contenedor a presión superior a la atmosférica: calderas, compresores, autoclaves, tanques, cilindros." },
    { question: "La válvula de seguridad de una caldera:", options: ["Es decorativa", "Se abre automáticamente si la presión supera el límite — es la última defensa", "Solo se usa manualmente", "Se puede bloquear si estorba"], correctIndex: 1, explanation: "La válvula de seguridad es la última línea de defensa contra explosión. NUNCA debe bloquearse ni manipularse." },
    { question: "Si el nivel de agua de una caldera baja demasiado:", options: ["No pasa nada", "Los tubos se sobrecalientan y pueden explotar", "La caldera se apaga sola", "Solo baja la presión"], correctIndex: 1, explanation: "Sin agua suficiente, los tubos se sobrecalientan al rojo, pierden resistencia y pueden fallar catastróficamente." },
    { question: "Los cilindros de oxígeno y acetileno deben almacenarse:", options: ["Juntos", "Separados mínimo 6 metros o con muro cortafuego", "Acostados en el piso", "En cualquier lugar"], correctIndex: 1, explanation: "El oxígeno (comburente) y el acetileno (inflamable) juntos son una bomba potencial. Separación obligatoria." },
    { question: "Las pruebas hidrostáticas a recipientes a presión se realizan:", options: ["Diariamente", "Cada semana", "Periódicamente (típicamente cada 5-10 años)", "Solo si hay fuga visible"], correctIndex: 2, explanation: "Las pruebas hidrostáticas verifican la integridad estructural del recipiente y deben realizarse por personal certificado." },
    { question: "¿Qué NUNCA se debe usar en conexiones de oxígeno?", options: ["Cinta de teflón", "Grasa o aceite", "Reguladores certificados", "Conexiones de bronce"], correctIndex: 1, explanation: "Grasa y aceite en contacto con oxígeno a presión pueden auto-inflamarse explosivamente." },
    { question: "Solo pueden operar calderas:", options: ["Cualquier trabajador", "Personal capacitado y autorizado específicamente", "El personal de limpieza", "Cualquiera con experiencia general"], correctIndex: 1, explanation: "Las calderas son equipo de alto riesgo que requiere operadores específicamente capacitados y autorizados." }
  ]
},

"habitos-saludables-trabajo": {
  title: "Evaluación: Hábitos Saludables en el Trabajo", passingScore: 70,
  questions: [
    { question: "La OMS recomienda al menos cuántos minutos de actividad física moderada por semana:", options: ["30 minutos", "60 minutos", "150 minutos", "300 minutos"], correctIndex: 2, explanation: "150 minutos semanales de actividad moderada (caminar rápido, nadar, andar en bici) es el mínimo recomendado." },
    { question: "La deshidratación puede causar síntomas laborales como:", options: ["Aumento de energía", "Dolor de cabeza y fatiga ANTES de sentir sed", "Mejora en la concentración", "No tiene efectos laborales"], correctIndex: 1, explanation: "Cuando sientes sed, ya estás deshidratado. Los primeros síntomas son dolor de cabeza, fatiga y pérdida de concentración." },
    { question: "La regla 20-20-20 para trabajo en pantalla significa:", options: ["20 horas, 20 descansos, 20 ejercicios", "Cada 20 minutos mira algo a 20 pies (6m) por 20 segundos", "20% descanso, 20% trabajo, 20% comida", "Pantalla a 20cm, brillo al 20%, 20 minutos máximo"], correctIndex: 1, explanation: "Reduce la fatiga visual: cada 20 minutos, enfoca algo a 6 metros por 20 segundos para relajar la musculatura ocular." },
    { question: "La técnica de respiración 4-7-8 consiste en:", options: ["Respirar 4 veces rápido", "Inhalar 4 seg, retener 7 seg, exhalar 8 seg", "Respirar cada 4, 7 y 8 minutos", "No existe tal técnica"], correctIndex: 1, explanation: "Es una técnica rápida y efectiva para reducir ansiedad y estrés en el momento. Repetir 3 veces." },
    { question: "Las principales causas de incapacidad laboral en México son:", options: ["Accidentes de trabajo", "Diabetes e hipertensión (enfermedades crónicas)", "Problemas dentales", "Enfermedades respiratorias"], correctIndex: 1, explanation: "Las enfermedades crónicas relacionadas con alimentación y sedentarismo son la principal causa de incapacidades en México." },
    { question: "Las pausas activas son:", options: ["Descansos para usar el celular", "Ejercicios de estiramiento de 5-10 minutos cada 2 horas", "Pausas para fumar", "Siestas en el trabajo"], correctIndex: 1, explanation: "Estiramientos breves y regulares durante la jornada que previenen TME, reducen fatiga y mejoran la circulación." },
    { question: "Un trabajador con hábitos saludables es:", options: ["Más lento en su trabajo", "Más productivo, con menos ausentismo y mejor actitud", "Igual que uno sin hábitos saludables", "Solo más delgado"], correctIndex: 1, explanation: "La salud impacta directamente en productividad, concentración, creatividad, resiliencia y asistencia." }
  ]
},

"control-sanitario-alimentos": {
  title: "Evaluación: Control Sanitario de Alimentos", passingScore: 70,
  questions: [
    { question: "La 'zona de peligro' de temperatura para los alimentos es:", options: ["0 a 4°C", "4 a 60°C", "60 a 100°C", "Mayor a 100°C"], correctIndex: 1, explanation: "Entre 4°C y 60°C las bacterias se multiplican rápidamente. Los alimentos no deben permanecer en esta zona más de 2 horas." },
    { question: "Las 5 claves de la OMS para inocuidad alimentaria incluyen:", options: ["Cocinar rápido, enfriar lento", "Limpieza, separar crudos de cocidos, cocinar completamente, temperaturas seguras, agua segura", "Solo lavar las manos", "Solo usar refrigerador"], correctIndex: 1, explanation: "Las 5 claves de la OMS cubren los pilares de la seguridad alimentaria de forma simple y práctica." },
    { question: "El lavado con agua sola para frutas y verduras:", options: ["Es suficiente", "NO es suficiente — se requiere desinfección", "Solo funciona para frutas con cáscara", "Es igual que desinfectar"], correctIndex: 1, explanation: "El agua sola no elimina bacterias ni parásitos adheridos. Se requiere desinfección con solución de cloro para alimentos." },
    { question: "PEPS en almacenamiento de alimentos significa:", options: ["Primeras Entradas, Primeras Salidas", "Productos Especiales Para Servicio", "Preparación Específica de Productos Sanitarios", "Primeros Empleados, Primeros Servidos"], correctIndex: 0, explanation: "Primeras Entradas, Primeras Salidas: los productos más antiguos se usan primero para evitar caducidad y desperdicio." },
    { question: "En refrigeración, los alimentos crudos deben colocarse:", options: ["Arriba de los cocidos", "Abajo de los cocidos (para evitar goteo contaminante)", "Junto a los cocidos sin problema", "Fuera del refrigerador"], correctIndex: 1, explanation: "Crudos abajo evita que sus jugos gotee sobre alimentos cocidos y los contaminen. Es la regla básica de contaminación cruzada." },
    { question: "La temperatura interna mínima de cocción para pollo es:", options: ["50°C", "65°C", "75°C", "100°C"], correctIndex: 2, explanation: "El pollo debe alcanzar 75°C internos para eliminar salmonella y otras bacterias patógenas." },
    { question: "HACCP es un sistema de:", options: ["Higiene personal", "Análisis de peligros y puntos críticos de control para prevención", "Limpieza de instalaciones", "Control de plagas exclusivamente"], correctIndex: 1, explanation: "HACCP (Hazard Analysis Critical Control Points) es un sistema preventivo que identifica peligros y establece controles en puntos críticos del proceso." }
  ]
}

};
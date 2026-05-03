# Manual de Identidad de Marca — Ceduverse

---

## 1. Logotipo

### Estructura del logotipo
El logotipo de Ceduverse tiene dos elementos:
1. **Isotipo**: Cuadrado azul redondeado con la letra "C" en blanco
2. **Logotipo**: "Cedu" en negro + "verse" en azul itálica

### Versiones disponibles

| Archivo | Uso |
|---------|-----|
| `logo-full-color.svg` | Uso principal — fondo claro |
| `logo-icon-only.svg` | Favicon, avatares, espacios reducidos |
| `logo-white-on-blue.svg` | Sobre fondos azules (headers de email, banners) |
| `logo-dark-bg.svg` | Sobre fondos oscuros |

### Reglas de uso

**Hacer:**
- Mantener la proporción original del logotipo
- Usar sobre fondos claros (#faf8f4 o blanco) cuando sea posible
- Dejar un espacio libre alrededor del logotipo igual al ancho del isotipo "C"
- Usar las versiones SVG para calidad máxima

**No hacer:**
- No cambiar los colores del logotipo
- No estirar o distorsionar el logotipo
- No rotar el logotipo
- No colocar el logotipo sobre fondos con mucho contraste o ruido visual
- No separar el isotipo del logotipo texto en materiales formales
- No usar sombras o efectos sobre el logotipo

### Tamaño mínimo
- **Digital**: 120px de ancho (logotipo completo) / 24px (isotipo solo)
- **Impreso**: 30mm de ancho (logotipo completo) / 8mm (isotipo solo)

---

## 2. Paleta de Colores

### Colores Principales

| Color | Hex | Uso |
|-------|-----|-----|
| **Azul Ceduverse** | `#1b5adf` | Color principal de marca, botones, enlaces, isotipo |
| **Azul Claro** | `#e8f0ff` | Fondos de secciones destacadas |
| **Azul Oscuro** | `#0a3a9e` | Hover states, énfasis |

### Colores de Texto

| Color | Hex | Uso |
|-------|-----|-----|
| **Tinta** | `#1a1a2e` | Texto principal, títulos |
| **Tinta Suave** | `#3d3d5c` | Texto secundario |
| **Tinta Muted** | `#7a7a99` | Texto terciario, placeholders |

### Colores de Fondo

| Color | Hex | Uso |
|-------|-----|-----|
| **Crema** | `#faf8f4` | Fondo principal de la plataforma |
| **Warm** | `#fff9f0` | Fondo de secciones cálidas |
| **Blanco** | `#ffffff` | Tarjetas, modales |

### Colores de Acento

| Color | Hex | Uso |
|-------|-----|-----|
| **Naranja** | `#f28023` | Acentos secundarios, CTAs, precios |
| **Naranja Claro** | `#fff3e6` | Fondos de alertas, badges |
| **Verde** | `#00b87a` | Éxito, confirmaciones, progreso |
| **Verde Claro** | `#e6fff5` | Fondos de mensajes exitosos |
| **Violeta** | `#7c3aed` | Acentos terciarios, badges premium |
| **Violeta Claro** | `#f3edff` | Fondos de secciones premium |
| **Coral** | `#ff6b6b` | Errores, alertas críticas |

### Proporciones de uso
- **60%** Crema/Blanco (fondos)
- **25%** Azul Ceduverse (marca, acciones)
- **10%** Naranja (acentos, llamadas a la acción)
- **5%** Verde/Violeta/Coral (estados, feedback)

---

## 3. Tipografía

### Fuentes Principales

| Fuente | Uso | Pesos |
|--------|-----|-------|
| **DM Serif Display** | Títulos, logotipo, headings | Regular, Italic |
| **Plus Jakarta Sans** | Texto general, UI, botones | 300, 400, 500, 600, 700, 800 |
| **Menlo** | Código, datos técnicos, monoespaciado | Regular |

### Alternativas (fallback)
- Serif: Georgia, Times New Roman
- Sans: system-ui, sans-serif
- Mono: Courier New, monospace

### Jerarquía Tipográfica

| Elemento | Fuente | Tamaño | Peso |
|----------|--------|--------|------|
| H1 (Hero) | DM Serif Display | clamp(2rem, 5vw, 3.2rem) | Regular |
| H2 (Sección) | DM Serif Display | clamp(2rem, 4vw, 3rem) | Regular |
| H3 (Subsección) | DM Serif Display | 1.125rem (18px) | Regular |
| Body | Plus Jakarta Sans | 15px | 400 |
| Body Bold | Plus Jakarta Sans | 15px | 600-700 |
| Small/Caption | Plus Jakarta Sans | 13px | 600 |
| Button | Plus Jakarta Sans | 13-15px | 700 |
| Badge | Plus Jakarta Sans | 11px | 700 |
| Monospace | Menlo | 11-13px | 400 |

---

## 4. Iconografía

### Sistema de iconos
- **Librería**: Lucide React (lucide.dev)
- **Estilo**: Línea (stroke), no relleno
- **Tamaños estándar**: 16px (inline), 20px (botones), 24px (navegación)
- **Grosor de línea**: 2px (default)

### Iconos frecuentes

| Concepto | Icono Lucide |
|----------|-------------|
| Cursos | `GraduationCap` |
| Certificados | `Award` |
| Empresas | `Building2` |
| Socios | `Users` |
| Pagos | `CreditCard` |
| Seguridad | `Shield` |
| Configuración | `Settings` |

---

## 5. Componentes UI

### Botones

| Tipo | Fondo | Texto | Border Radius |
|------|-------|-------|---------------|
| **Primario** | `#1b5adf` | Blanco | 12px |
| **Primario Hover** | `#0a3a9e` | Blanco | 12px |
| **Secundario (Ink)** | `#1a1a2e` | Blanco | 12px |
| **Outline** | Transparente | `#1a1a2e` | 12px |
| **CTA (Naranja)** | `#f28023` | Blanco | 50px (pill) |

### Tarjetas
- **Fondo**: `#ffffff`
- **Border**: `rgba(0,0,0,0.06)` — 1px solid
- **Border Radius**: 16px
- **Sombra**: Ninguna (diseño plano)
- **Padding**: 24-32px

### Badges/Etiquetas
- **Border Radius**: 8-12px
- **Padding**: 4px 8px
- **Fuente**: 11px, peso 700, uppercase con tracking
- **Colores**: Varían según categoría (ver paleta de acentos)

---

## 6. Espaciado y Layout

### Grid
- **Contenedor máximo**: 1160px
- **Padding lateral**: 24px (6 en Tailwind)
- **Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

### Espaciado entre secciones
- **Entre secciones mayores**: 72px top padding
- **Entre elementos**: 16-24px
- **Entre texto**: 8-12px

---

## 7. Tono de Voz

### Principios
1. **Profesional pero accesible** — No somos corporativos fríos, pero tampoco casuales
2. **Mexicano** — Usamos español mexicano natural, no neutro
3. **Educativo** — Explicamos con claridad, sin condescender
4. **Cooperativista** — Enfatizamos comunidad, beneficio mutuo, crecimiento conjunto

### Ejemplos

| Hacer | No hacer |
|-------|----------|
| "Tu código de acceso" | "Your access code" |
| "Capacitación laboral inteligente" | "Training platform" |
| "Registrar Empresa" | "Sign Up Corporate" |
| "Socios cooperativistas" | "Users/Members" |
| "Aportación mensual" | "Monthly payment" |

---

## 8. Aplicaciones del Logotipo

### Email
- Header: Logo blanco sobre fondo azul (`#1b5adf`)
- Usar `logo-white-on-blue.svg`

### Favicon
- Usar `logo-icon-only.svg`
- Generar favicon.ico en 16x16, 32x32, 192x192

### Redes Sociales
- Foto de perfil: Isotipo azul sobre fondo crema
- Banner: Logotipo completo centrado sobre fondo crema

### Documentos PDF
- Esquina superior izquierda
- Tamaño mínimo: 30mm de ancho
- Sobre fondo blanco o crema

---

## 9. Archivos Incluidos

```
brand/
  logo-full-color.svg      — Logotipo principal (fondo claro)
  logo-icon-only.svg       — Isotipo solo (favicon, avatar)
  logo-white-on-blue.svg   — Logo blanco (fondo azul)
  logo-dark-bg.svg         — Logo para fondos oscuros
  MANUAL_DE_MARCA.md       — Este documento
```

---

*Ceduverse — Capacitación laboral inteligente para América Latina*
*Manual de marca v1.0 — Abril 2026*

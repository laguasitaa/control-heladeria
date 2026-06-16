# Design System — Panel de Control Heladería

## Product Context
- **What this is:** Panel de control interno para heladería de yoghurt griego en Los Cabos — gestión de gastos, ventas y vencimientos de contratos/rentas.
- **Who it's for:** Dueña y una empleada de confianza. 2 usuarios, acceso completo igual.
- **Space/industry:** Food & beverage, gestión de negocio local. No es app de consumidor — es herramienta de trabajo diario.
- **Project type:** Mobile-first web app (dashboard de dueño). Prioridad: celular. Desktop secundario.

## Aesthetic Direction
- **Direction:** Warm Utilitarian — funcional y denso en datos, con calidez mediterránea derivada del logo.
- **Decoration level:** Minimal — la tipografía y el color hacen todo el trabajo. Sin blobs, sin gradientes decorativos, sin ilustraciones.
- **Mood:** La app debe sentirse como una herramienta confiable y personal, no como software corporativo. Entra, ves los números, sabes cómo va el mes. Cálida pero sin distracciones.
- **Logo anchor:** Fondo amarillo dorado texturizado (#E8B84B), ícono oval embossed de copa de helado. El amber del accent (#A06C10) es el dorado del logo oscurecido para contraste WCAG AA 4.7:1.

## Typography

- **Display / Totales / Headings:** Cabinet Grotesk — Bold (700) y ExtraBold (800). Geométrica, moderna, excelente en mobile a tamaños grandes. Perfecta para montos grandes ($48,500).
- **Body / UI / Labels / Data:** Plus Jakarta Sans — 400 y 600. Legible en tamaños pequeños en pantallas de celular. Soporte nativo de `font-variant-numeric: tabular-nums` para que las columnas de montos alineen verticalmente.
- **Loading:** Google Fonts — `https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@500;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap`
- **Scale:**
  - `--fs-xs`: 11px — labels de sección, uppercase tracking
  - `--fs-sm`: 13px — secondary text, badges, fechas
  - `--fs-base`: 15px — body, form inputs, list items
  - `--fs-md`: 18px — subheadings
  - `--fs-lg`: 22px — screen titles
  - `--fs-xl`: 28px — heading principal
  - `--fs-2xl`: 40px — montos grandes (total ventas/gastos)

## Color

- **Approach:** Restrained — 1 accent + neutrals cálidos. El color es raro y significativo. Solo los estados semánticos (success/warning/danger) usan color además del accent.
- **Fondo (bg):** #F2EDE5 — lino desgastado. Más oscuro y cálido que un crema digital.
- **Superficie (surface):** #FAF7F2 — no blanco puro — tiene suciedad sana, como papel envejecido.
- **Superficie cálida (surface-warm):** #F5EFE5 — fondo de áreas con accent.
- **Texto:** #241C0E — marrón-negro terroso. Más cálido que #000, no tan brillante.
- **Texto muted:** #8A7868 — arena desaturada.
- **Texto placeholder:** #B8AD9E — tierra clara.
- **Accent:** #7A5A1E — ocre terroso. El dorado del logo muy desaturado, casi tierra quemada.
- **Accent light:** #EDE3D0 — fondo tinted cálido para chips/states activos.
- **Accent hover:** #644A18 — más oscuro para hover/pressed.
- **Success:** #4A7060 — verde salvia desaturado. No verde brillante — más musgo.
- **Success light:** #D4E8E0 — fondo opaco, no neón.
- **Warning:** #9A7820 — amarillo-mostaza oscuro. Más tierra que dorado.
- **Warning light:** #F0E6C0 — fondo amarillo envejecido.
- **Danger:** #9C3535 — rojo ladrillo. No rojo digital brillante.
- **Danger light:** #F0D8D8 — rosa terroso.
- **Border:** #DDD5C8 — borde arena, más visible que un gris frío.
- **Border subtle:** #EAE3DA — separador interno casi invisible.
- **Dark mode:** surfaces oscurecen a browns (#221E19 surface, #171210 bg), accent sube a #C9880E (más visible sobre dark), reducción de saturación ~15% en colores semánticos. Ver tokens en globals.css.

## Spacing

- **Base unit:** 4px
- **Density:** Comfortable — la dueña ve esto en el celular mientras atiende clientes. Targets de toque ≥44px.
- **Scale:**
  - `--sp-1`: 4px
  - `--sp-2`: 8px
  - `--sp-3`: 12px
  - `--sp-4`: 16px
  - `--sp-5`: 20px
  - `--sp-6`: 24px
  - `--sp-8`: 32px
  - `--sp-12`: 48px
  - `--sp-16`: 64px

## Layout

- **Approach:** Grid-disciplined — estructura predecible para tool de trabajo. Sin asimetría editorial.
- **Mobile (<768px):** Single column. Bottom tab bar 60px (Dashboard | Gastos | Ventas | Vencimientos). FAB (+) sobre el tab bar, bottom-right.
- **Desktop (≥768px):** Sidebar 220px fija + main content fluid. Tab bar se convierte en nav sidebar.
- **Max content width:** 960px (desktop).
- **Border radius:**
  - `--r-sm`: 6px — badges, chips pequeños
  - `--r-md`: 10px — buttons, inputs, cards pequeños
  - `--r-lg`: 16px — cards principales, bottom sheet corners
  - `--r-full`: 9999px — pills, FAB, avatares

## Motion

- **Approach:** Minimal-functional — solo transiciones que ayudan a entender estado. Sin animaciones decorativas.
- **Easing:** enter `ease-out` · exit `ease-in` · move `ease-in-out`
- **Durations:**
  - micro: 80ms — hover states, focus rings
  - short: 160ms — button press, badge state change
  - medium: 280ms — bottom sheet open/close, page transition
  - long: 480ms — FAB expand (si se implementa)
- **Bottom sheet:** slide-up 280ms ease-out. No fade solo — el movimiento vertical comunica que viene de abajo.
- **Tab bar active:** color transition 160ms ease-out.

## Decisions Log

| Fecha | Decisión | Razón |
|-------|----------|-------|
| 2026-06-16 | Accent #A06C10 (amber oscuro) | Logo es dorado #E8B84B. Oscurecido para WCAG AA 4.7:1 sobre fondo claro. |
| 2026-06-16 | Success verde mediterráneo #2D6A4F | Evoca yoghurt griego / Mediterráneo. Diferenciado del amber sin contrastar. |
| 2026-06-16 | Cabinet Grotesk para display | Geométrica moderna, excelente en mobile para montos grandes. No Inter/Poppins. |
| 2026-06-16 | Plus Jakarta Sans para body | Ya en plan de arquitectura. Tabular-nums para columnas de montos. Legible en 13-15px en mobile. |
| 2026-06-16 | Fondo crema #FAF9F6 | Eco de la textura del logo. Nunca blanco puro — reduce fatiga visual en uso diario. |
| 2026-06-16 | Bottom sheet (no modal centrado) | El teclado en mobile tapa un modal centrado. El bottom sheet sube con el teclado. |
| 2026-06-16 | Bottom tab bar mobile / Sidebar desktop | Navegación a pulgar en mobile. Sidebar en desktop aprovecha espacio horizontal. |
| 2026-06-16 | Decoration level minimal | Herramienta de trabajo, no app de consumidor. Sin blobs, gradientes ni ilustraciones. |
| 2026-06-16 | Sistema creado con /design-consultation | Logo subido en setup-design sub-flow de raicode. |

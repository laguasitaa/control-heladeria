# TODOS — control-heladeria

## P0 — Antes de construir pantallas

### [ ] Sub-flow de diseño (DESIGN.md + logo)
- **Qué:** Correr el sub-flow de diseño en raicode para definir palette real, tipografía, logo y tokens CSS definitivos.
- **Por qué:** El plan de diseño actual usa `--c-accent: #0ea5e9` como placeholder. Si construimos pantallas antes, el color accent queda hardcoded y hay que reemplazarlo en todos los componentes después.
- **Cómo:** Ir a `raicode.ai/wizard/26aa177d-0eec-4724-aab2-210a4f8ec06c/setup-design`. Sale en 20-30 min. Al terminar, Claude actualiza `DESIGN.md` y `globals.css` con los tokens reales.
- **Effort CC:** ~20min
- **Depends on:** Nada — puede hacerse ahora mismo antes de arrancar la build.

## P2 — Post-MVP (alta prioridad cuando el MVP esté en uso)

### [ ] Email alerts de vencimientos
- **Qué:** Email automático cuando un vencimiento está a 7 días y 1 día de caducar.
- **Por qué:** La app solo avisa in-app. Si no la abres ese día, el vencimiento puede pasar desapercibido.
- **Cómo:** Resend (email, plan gratuito hasta 3000/mes) + Vercel Cron Job diario que checa vencimientos próximos.
- **Effort CC:** ~2h
- **Depends on:** MVP deployed y en uso real.

### [ ] Gráfico de tendencia mes a mes (Recharts)
- **Qué:** Mini gráfica en el dashboard: gastos vs ventas de los últimos 6 meses.
- **Por qué:** Visibilidad de tendencia sin tener que recordar números. ¿Está subiendo el negocio?
- **Cómo:** Recharts + query agrupada por mes en Supabase.
- **Effort CC:** ~20min
- **Depends on:** 2-3 meses de datos reales en la app antes de construir.

## P3 — Mejoras convenientes

### [ ] Export CSV de gastos y ventas
- **Qué:** Botón de descarga que genera un .csv con los datos del mes actual.
- **Por qué:** Útil para compartir con contador o hacer análisis en Excel.
- **Cómo:** API route `/api/export/gastos` y `/api/export/ventas` que genera CSV.
- **Effort CC:** ~5min
- **Depends on:** nada, puede agregarse en cualquier momento.

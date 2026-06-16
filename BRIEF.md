# control-heladeria — Brief

> Este es el resumen de tu proyecto tal como lo confirmaste en raicode.ai.
> Vive en la raíz de la carpeta del proyecto como referencia rápida.
> Si necesitas las reglas de comportamiento de Claude, ve a `CLAUDE.md`.

## La idea

Panel de control para heladería que centraliza gastos, ventas, inventario, contratos, rentas y empleados ordenados por actualización más reciente

## Para quién

Dueña de heladería de yoghurt griego en Los Cabos

## Cómo lo hacen hoy (status quo)

Excel o Google Sheets separados por tema

## Qué duele del proceso (pain point superficial)

Se desorganiza rápido y la info queda dispersa en varios archivos

## Qué cuesta eso al usuario (pain impact)

Toma más tiempo gestionarlo y es difícil tener visibilidad completa del negocio en un solo lugar

## MVP (punto de partida)

Registro y listado de gastos ordenados por fecha de actualización, con categorías básicas (renta, empleados, inventario, etc.) y notificacion de vencimientos para rentas y inventarios.

## Guarda información

Sí — el proyecto guarda datos (usamos Supabase)

## Privacidad

🔒 **App privada** — guarda info que solo el dueño o personas específicas deberían ver. Requiere auth (login con usuarios) configurado antes del deploy a Vercel.

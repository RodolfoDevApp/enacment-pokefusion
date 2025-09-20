# PokéFusion (Angular 18 + PokeAPI)

**Demo**: https://enacment-pokefusion-2bea3.web.app/
**Reto**: PokéFusion (PokeAPI) – Enacment 2025

## Reto y alcance
- Fusión de **3 Pokémon** (nombre, tipos, stats promedio y 1–2 movimientos).
- **Core**: aleatorizar desde **PokeAPI** y mostrar en tarjeta.
- **Tu toque**: botón **Re-fusionar**.
- **Persistencia**: **localStorage** (favoritos). Sin Firestore/RTDB.
- **SPA** en **Firebase Hosting**.

## Stack y arquitectura
- Angular 18 (standalone, **signals**, `@if/@for`, `provideHttpClient(withFetch)`).
- Tailwind CSS.
- **Runtime config**: `public/app.config.json` via `APP_INITIALIZER` + `APP_CONFIG`.


## Instalación y ejecución

npm i
ng serve -o

## Build & Deploy (Firebase Hosting)

ng build --configuration production
npx firebase-tools@latest deploy --only hosting

## Decisiones técnicas
Signals en lugar de NgRx (alcance pequeño).

Config en runtime (sin fileReplacements).

Favoritos en localStorage (sin credenciales/reglas).

UI con Tailwind para velocidad y a11y básico.

Estados, rendimiento, a11y
Estados: loading/error/empty cubiertos.

Posible cache in-memory y fetch concurrente (ver store).

A11y: [attr.aria-label], foco visible, contraste.

## Uso de IA (resumen)
Scaffold de store/servicio y heurística de fusión (nombres por cortes, tipos por frecuencia, stats por promedio).

Ajustes de a11y, layout y runtime config.

Riesgos: latencia/errores PokeAPI → retry/estado; aleatoriedad → Re-fusionar; performance → concurrente + cache.
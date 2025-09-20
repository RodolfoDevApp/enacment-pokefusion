import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from './config/app-config';

function loadAppConfig(): () => Promise<void> {
  return async () => {
    // Buscamos primero en / (public/) y luego en /assets (por si lo mueves)
    const candidates = ['app.config.json', 'assets/app.config.json'];
    let lastError: unknown = null;

    for (const path of candidates) {
      const url = new URL(path, document.baseURI).toString();
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
          lastError = new Error(`HTTP ${res.status} al cargar ${url}`);
          continue;
        }

        const cfg = (await res.json()) as Partial<AppConfig>;
        // Validación mínima del shape
        if (!cfg || typeof cfg.pokeApiBaseUrl !== 'string' || !cfg.pokeApiBaseUrl) {
          lastError = new Error(`Config inválida en ${url}`);
          continue;
        }

        (window as any).__APP_CONFIG__ = cfg as AppConfig;
        return; // listo, cargado OK
      } catch (err) {
        // Registramos y seguimos probando el siguiente candidato
        console.warn('[AppConfig] Fallo leyendo', url, err);
        lastError = err;
        continue;
      }
    }

    // Fallback para no tumbar la app si no hubo config
    console.warn('[AppConfig] Usando fallback por error/ausencia de config:', lastError);
    (window as any).__APP_CONFIG__ =
      { pokeApiBaseUrl: 'https://pokeapi.co/api/v2' } satisfies AppConfig;
  };
}

function appConfigFactory(): AppConfig {
  return (window as any).__APP_CONFIG__ as AppConfig;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    { provide: APP_INITIALIZER, multi: true, useFactory: loadAppConfig },
    { provide: APP_CONFIG, useFactory: appConfigFactory }

    ]
};

import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from './config/app-config';

function loadAppConfig(): () => Promise<void> {
  return () =>
    fetch('/assets/app.config.json')
      .then(r => r.json())
      .then((cfg: AppConfig) => { (window as any).__APP_CONFIG__ = cfg; });
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

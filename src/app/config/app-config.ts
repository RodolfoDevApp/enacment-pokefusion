import { InjectionToken } from '@angular/core';
export interface AppConfig { pokeApiBaseUrl: string; }
export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

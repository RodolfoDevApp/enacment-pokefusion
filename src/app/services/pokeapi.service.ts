import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG, AppConfig } from '../config/app-config';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PokeapiService {

  constructor(
    private http: HttpClient,
    @Inject(APP_CONFIG) private cfg: AppConfig
  ) {}
  getCount() 
  {
     return this.http.get<{ count: number }>(`${this.cfg.pokeApiBaseUrl}/pokemon?limit=1`); 
  }
  
  getPokemon(idOrName: number | string)
  { 
    return this.http.get<any>(`${this.cfg.pokeApiBaseUrl}/pokemon/${idOrName}`); 
  }
}

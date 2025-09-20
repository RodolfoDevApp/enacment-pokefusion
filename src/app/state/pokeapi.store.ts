import { computed, inject, Injectable, signal } from '@angular/core';
import { PokeapiService } from '../services/pokeapi.service';
import { Fusion, PokemonAPI } from '../models/pokemon.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class PokeFusionStore {
  private api = inject(PokeapiService);

  // Estado base
  loading = signal(false);
  error = signal<string | null>(null);
  fusion = signal<Fusion | null>(null);
  favorites = signal<Fusion[]>([]);

  // Derivados
  hasFusion = computed(() => this.fusion() !== null);
  favoritesCount = computed(() => this.favorites().length);

  // Rango seguro para ids de /pokemon/{id}
  private readonly MIN_ID = 1;
  private readonly MAX_ID = 1025;

  // Init: cargar favoritos y generar primera fusion
  async init(): Promise<void> {
    this.loadFavoritesFromStorage();
    if (!this.fusion()) {
      await this.refusionar();
    }
  }

  // Accion: generar una nueva fusion
  async refusionar(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const ids = this.pickUniqueRandom(3, this.MIN_ID, this.MAX_ID);
      const bases: PokemonAPI[] = [];
      for (const id of ids) {
        const p = await firstValueFrom(this.api.getPokemon(id)) as PokemonAPI;
        bases.push(p);
      }
      this.fusion.set(this.buildFusion(bases));
    } catch {
      // Reintento simple una vez
      try {
        const ids2 = this.pickUniqueRandom(3, this.MIN_ID, this.MAX_ID);
        const bases2: PokemonAPI[] = [];
        for (const id of ids2) {
          bases2.push(await firstValueFrom(this.api.getPokemon(id)) as PokemonAPI);
        }
        this.fusion.set(this.buildFusion(bases2));
      } catch {
        this.error.set('Error al fusionar. Intenta de nuevo.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  // Acciones de favoritos
  addFavorite(): void {
    const f = this.fusion();
    if (!f) return;
    this.favorites.set([f, ...this.favorites()]);
    this.saveFavoritesToStorage();
  }

  removeFavoriteByName(name: string): void {
    this.favorites.set(this.favorites().filter(x => x.name !== name));
    this.saveFavoritesToStorage();
  }

  clearFavorites(): void {
    this.favorites.set([]);
    this.saveFavoritesToStorage();
  }

  // -------- Helpers internos --------

  private pickUniqueRandom(n: number, min: number, max: number): number[] {
    const out = new Set<number>();
    while (out.size < n) out.add(this.randInt(min, max));
    return [...out];
  }

  private randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private buildFusion(pokemons: PokemonAPI[]): Fusion {
    const [p1, p2, p3] = pokemons;
    const name = this.nameFusion(p1.name, p2.name, p3.name);
    const { typeA, typeB } = this.typeFusion(pokemons);
    const stats = this.avgStats(pokemons);
    const moves = this.pickMoves(pokemons, 2);
    const spriteUrls = pokemons
      .map(p => this.spriteUrl(p))
      .filter((u): u is string => !!u);

    return {
      name,
      typeA,
      typeB,
      stats,
      moves,
      spriteUrls,
      bases: pokemons.map(p => ({ id: p.id, name: p.name }))
    };
  }

  private nameFusion(a: string, b: string, c: string): string {
    const A = a.toLowerCase();
    const B = b.toLowerCase();
    const C = c.toLowerCase();
    const p1 = A.slice(0, Math.max(2, Math.min(4, A.length)));
    const p2 = B.slice(Math.max(0, B.length - 3));
    const p3 = C.charAt(0);
    const fused = (p1 + p2 + p3).replace(/[^a-z]/g, '');
    return fused.charAt(0).toUpperCase() + fused.slice(1);
  }

  private typeFusion(pokemons: PokemonAPI[]): { typeA: string; typeB?: string } {
    const bag: string[] = [];
    pokemons.forEach(p => p.types.forEach(t => bag.push(t.type.name)));
    const freq = new Map<string, number>();
    bag.forEach(t => freq.set(t, (freq.get(t) || 0) + 1));
    const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]);
    return { typeA: sorted[0][0], typeB: sorted[1]?.[0] };
  }

  private avgStats(pokemons: PokemonAPI[]): Record<string, number> {
    const keys = new Set<string>();
    pokemons.forEach(p => p.stats.forEach(s => keys.add(s.stat.name)));
    const out: Record<string, number> = {};
    keys.forEach(k => {
      const vals = pokemons.map(p => p.stats.find(s => s.stat.name === k)?.base_stat || 0);
      const avg = Math.round(vals.reduce((a, b) => a + b, 0) / pokemons.length);
      out[k] = avg;
    });
    return out;
  }

  private pickMoves(pokemons: PokemonAPI[], n: number): string[] {
    const pool = new Set<string>();
    pokemons.forEach(p => p.moves.forEach(m => pool.add(m.move.name)));
    const arr = [...pool];
    const out: string[] = [];
    while (out.length < Math.min(n, arr.length)) {
      const i = this.randInt(0, arr.length - 1);
      out.push(arr.splice(i, 1)[0]);
    }
    return out;
  }

  private spriteUrl(p: PokemonAPI): string | null {
    return p.sprites.other?.['official-artwork']?.front_default || p.sprites.front_default || null;
  }

  private saveFavoritesToStorage(): void {
    try { localStorage.setItem('favorites', JSON.stringify(this.favorites())); } catch {}
  }

  private loadFavoritesFromStorage(): void {
    try {
      const raw = localStorage.getItem('favorites');
      if (!raw) return;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) this.favorites.set(arr);
    } catch {}
  }

}

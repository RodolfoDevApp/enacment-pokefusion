export interface PokemonAPI {
  id: number;
  name: string;
  types: { slot: number; type: { name: string; url: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  moves: { move: { name: string } }[];
  sprites: {
    front_default: string | null;
    other?: { "official-artwork"?: { front_default?: string | null } };
  };
}

export interface Fusion {
  name: string;
  typeA: string;
  typeB?: string;
  stats: { [k: string]: number };
  moves: string[];
  spriteUrls: string[];
  bases: { id: number; name: string }[];
}

import { Component, inject } from '@angular/core';
import { PokeFusionStore } from '../../state/pokeapi.store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fusion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fusion.component.html',
  styleUrl: './fusion.component.scss'
})
export class FusionComponent {

  store = inject(PokeFusionStore);

  async ngOnInit() {
    await this.store.init();
  }

  refusionar() { this.store.refusionar(); }
  addFav() { this.store.addFavorite(); }
  rmFav(n: string) { this.store.removeFavoriteByName(n); }
  clearFav() { this.store.clearFavorites(); }

}

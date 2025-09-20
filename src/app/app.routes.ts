import { Routes } from '@angular/router';
import { FusionComponent } from './pages/fusion/fusion.component';

export const routes: Routes = [
    { path: '', component: FusionComponent },
    { path: '**', redirectTo: '' }
];

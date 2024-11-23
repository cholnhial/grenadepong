import { Routes } from '@angular/router';
import {StartComponent} from './pages/start/start.component';
import {NameComponent} from './pages/name/name.component';
import {GameComponent} from './pages/game/game.component';

export const routes: Routes = [
  { path: '',   redirectTo: '/start', pathMatch: 'full' },
  { path: 'start', component: StartComponent },
  { path: 'name', component: NameComponent },
  { path: 'game', component:  GameComponent},
];

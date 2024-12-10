import { Routes } from '@angular/router';
import {StartComponent} from './pages/start/start.component';
import {NameComponent} from './pages/name/name.component';
import {GameComponent} from './pages/game/game.component';
import {WaitComponent} from './pages/wait/wait.component';
import {ScoreComponent} from './pages/score/score.component';

export const routes: Routes = [
  { path: '',   redirectTo: '/start', pathMatch: 'full' },
  { path: 'start', component: StartComponent },
  { path: 'name', component: NameComponent },
  { path: 'game', component:  GameComponent},
  { path: 'wait', component:  WaitComponent},
  { path: 'score', component:  ScoreComponent}
];

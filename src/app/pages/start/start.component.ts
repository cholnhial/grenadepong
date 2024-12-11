import { Component } from '@angular/core';
import {CardComponent} from '../../components/card/card.component';
import {ButtonComponent} from '../../components/button/button.component';
import {Router, RouterModule} from '@angular/router';
import {GameService} from '../../services/game.service';
import {generatePeerId} from '../../utils';
import {GameMessage} from '../../models/game-message';
import {PlayerMode} from '../../models/player';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-start',
  imports: [CardComponent, ButtonComponent, RouterModule],
  templateUrl: './start.component.html',
  styleUrl: './start.component.scss'
})
export class StartComponent {

  constructor(private router: Router,
              private gameService: GameService) {
  }

  async onCreateNew() {
    this.gameService.setMode(PlayerMode.HOSTING)
    this.gameService.setHostPeerId(generatePeerId());
    await this.router.navigate(['/name']);
  }

  async onJoin() {
    await this.router.navigate(['/join']);
  }

  protected readonly environment = environment;
}

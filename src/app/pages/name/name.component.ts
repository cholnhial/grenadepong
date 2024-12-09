import {Component, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {CardComponent} from '../../components/card/card.component';
import {ButtonComponent} from '../../components/button/button.component';
import {ActivatedRoute, Router} from '@angular/router';
import {GameService } from '../../services/game.service';
import {PlayerMode} from '../../models/player';

@Component({
  selector: 'app-name',
  imports: [FormsModule, CommonModule, CardComponent, ButtonComponent],
  templateUrl: './name.component.html',
  styleUrl: './name.component.scss'
})
export class NameComponent implements OnInit {

  name = signal('');
  isJoining = false;

  constructor(private route: ActivatedRoute,
              private gameService: GameService,
              private router: Router) {}

  ngOnInit() {
    const hostPeerId = this.route.snapshot.queryParamMap.get('host-peer-id');
    const backgroundIndex = this.route.snapshot.queryParamMap.get('background-index');
    if (hostPeerId) {
      this.gameService.setHostPeerId(hostPeerId);
      this.gameService.setMode(PlayerMode.JOINING);
      this.isJoining = true;
    }
    if (backgroundIndex) {
      this.gameService.setRandomBackgroundIndex(Number.parseInt(backgroundIndex));
    }
  }

  async onSubmit() {
    this.gameService.setPlayerName(this.name());
    if (this.gameService.getMode() != PlayerMode.JOINING) {
      await this.router.navigate(['/wait']);
    } else {
      this.gameService.setMode(PlayerMode.JOINING)
      await this.router.navigate(['/game']);
    }

  }
}

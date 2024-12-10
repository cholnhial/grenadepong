import {AfterViewInit, Component} from '@angular/core';
import {GameService} from '../../services/game.service';
import {PlayerMode, ScoreStatus} from '../../models/player';
import {ButtonComponent} from '../../components/button/button.component';
import {CardComponent} from '../../components/card/card.component';
import confetti from 'canvas-confetti';
import {PeerService} from '../../services/peer.service';
import {GameMessage, GameMessageType} from '../../models/game-message';
import {Router} from '@angular/router';

@Component({
  selector: 'app-score',
  imports: [ButtonComponent, CardComponent],
  templateUrl: './score.component.html',
  styleUrl: './score.component.scss'
})
export class ScoreComponent implements AfterViewInit {

  constructor(private gameService: GameService,
              private router: Router,
              private peerService: PeerService) {}

  get scoreStatus() {
    return this.gameService.getScoreStatus();
  }

  get otherPlayerName() {
    return this.gameService.getOtherPlayerName();
  }

  get isHost() {
    return this.gameService.getMode() == PlayerMode.HOSTING;
  }

 ngAfterViewInit() {
    if (this.scoreStatus == ScoreStatus.WIN) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    if (!this.isHost) {
      this.peerService.getOnDataSubject().subscribe(async (message: GameMessage) => {
        if (message.type === GameMessageType.RESTART) {
          this.gameService.setIsRestart(true);
          await this.router.navigate(['game'], { queryParams: { reload: Date.now() }});
        }
      })
    }
  }

  async onPlayAgain() {
    await this.gameService.restartGame();
  }

  protected readonly ScoreStatus = ScoreStatus;
}

import {Component, OnInit} from '@angular/core';
import {QrCodeService} from '../../services/QrCodeService';
import {Observable} from 'rxjs';
import {CardComponent} from '../../components/card/card.component';
import {ButtonComponent} from '../../components/button/button.component';
import {CommonModule} from '@angular/common';
import {PeerService} from '../../services/peer.service';
import {Router} from '@angular/router';
import {GameService} from '../../services/game.service';
import {GameMessage, GameMessageType} from '../../models/game-message';
import {PlayerMode} from '../../models/player';

@Component({
  selector: 'app-wait',
  imports: [CardComponent, ButtonComponent, CommonModule],
  templateUrl: './wait.component.html',
  styleUrl: './wait.component.scss'
})
export class WaitComponent implements OnInit {

  constructor(private router: Router,
              private qrCodeService: QrCodeService,
              private gameService: GameService,
              private peerService: PeerService) {
  }

  qrCodeBase64$!: Observable<string>;
  joiningId!: string | null;

  async ngOnInit() {

    if (this.gameService.getMode() === PlayerMode.HOSTING) {
      const peerId =  this.gameService.getHostPeerId();
      this.joiningId = peerId;
      this.peerService.init(peerId!);

      const backgroundIndex = this.gameService.getRandomBackgroundIndex();
      const url = `http://192.168.1.110:4200/#name?host-peer-id=${peerId}&background-index=${backgroundIndex}`;
      this.qrCodeBase64$ = this.qrCodeService.generateQrCode(url);
      console.log(url);
      this.peerService.getOnDataSubject().subscribe((data: GameMessage) => {
        if (data.type == GameMessageType.HELLO) {
          this.router.navigate(['/game']); // peer has connected start game
        }

      })
    }
  }

}

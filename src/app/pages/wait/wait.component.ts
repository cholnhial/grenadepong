import {Component, OnInit} from '@angular/core';
import {QrCodeService} from '../../services/QrCodeService';
import {Observable} from 'rxjs';
import {CardComponent} from '../../components/card/card.component';
import {ButtonComponent} from '../../components/button/button.component';
import {CommonModule} from '@angular/common';
import {PeerService} from '../../services/peer.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-wait',
  imports: [CardComponent, ButtonComponent, CommonModule],
  templateUrl: './wait.component.html',
  styleUrl: './wait.component.scss'
})
export class WaitComponent implements OnInit {

  constructor(private router: Router, private qrCodeService: QrCodeService, private peerService: PeerService) {
  }

  qrCodeBase64$!: Observable<string>;

  async ngOnInit() {

    if (localStorage.getItem('mode') && localStorage.getItem('mode') === 'host') {
      const peerId =  localStorage.getItem('hostPeerId');
      this.peerService.init(peerId!);
      this.qrCodeBase64$ = this.qrCodeService.generateQrCode(`http://192.168.1.106:4200/name?host-peer-id=${peerId}`);
      console.log(`http://192.168.1.106:4200/name?host-peer-id=${peerId}`);
      this.peerService.getOnDataSubject().subscribe((data) => {
        console.log(data);
        this.router.navigate(['/game']);
      })
    }
  }

}

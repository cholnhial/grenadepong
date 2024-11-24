import { Component } from '@angular/core';
import {CardComponent} from '../../components/card/card.component';
import {ButtonComponent} from '../../components/button/button.component';
import {Router, RouterModule} from '@angular/router';
import {GameService} from '../../services/game.service';
import {generatePeerId} from '../../utils';

@Component({
  selector: 'app-start',
  imports: [CardComponent, ButtonComponent, RouterModule],
  templateUrl: './start.component.html',
  styleUrl: './start.component.scss'
})
export class StartComponent {


  constructor(private router: Router) {
  }

  async onCreateNew() {
    localStorage.setItem('mode', 'host');
    localStorage.setItem('hostPeerId', generatePeerId());
    await this.router.navigate(['/name']);
  }

  async onJoin() {
    await this.router.navigate(['/name']);
  }
}

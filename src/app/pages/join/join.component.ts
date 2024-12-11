import {Component, signal} from '@angular/core';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';
import {CardComponent} from '../../components/card/card.component';
import {ButtonComponent} from '../../components/button/button.component';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-join',
  imports: [CardComponent, ButtonComponent, FormsModule, CommonModule],
  templateUrl: './join.component.html',
  styleUrl: './join.component.scss'
})
export class JoinComponent {

  constructor(private router: Router) {
  }

  joinId = signal('');

  async onSubmit() {
    const backgroundIndex = this.joinId().substring(this.joinId().length - 1, this.joinId().length);
    const peerId= this.joinId().substring(0, this.joinId().length - 1);

    await this.router.navigate(['/name'], {queryParams: {
      'host-peer-id': `GP-${peerId}`,
      'background-index': backgroundIndex,
      }})
  }

  protected readonly environment = environment;
}

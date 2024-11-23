import { Component } from '@angular/core';
import {CardComponent} from '../../components/card/card.component';
import {ButtonComponent} from '../../components/button/button.component';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-start',
  imports: [CardComponent, ButtonComponent, RouterModule],
  templateUrl: './start.component.html',
  styleUrl: './start.component.scss'
})
export class StartComponent {

}

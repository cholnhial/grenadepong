import { Component } from '@angular/core';
import {CardComponent} from '../../components/card/card.component';
import {ButtonComponent} from '../../components/button/button.component';

@Component({
  selector: 'app-start',
  imports: [CardComponent, ButtonComponent],
  templateUrl: './start.component.html',
  styleUrl: './start.component.scss'
})
export class StartComponent {

}

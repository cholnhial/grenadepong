import {Component, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {CardComponent} from '../../components/card/card.component';
import {ButtonComponent} from '../../components/button/button.component';

@Component({
  selector: 'app-name',
  imports: [FormsModule, CommonModule, CardComponent, ButtonComponent],
  templateUrl: './name.component.html',
  styleUrl: './name.component.scss'
})
export class NameComponent {

  name = signal('');

  onSubmit() {
    localStorage.setItem('name', this.name());
  }
}

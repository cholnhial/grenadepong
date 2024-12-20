import {Component, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  color = input<string>('default');
  disabled = input<boolean>(false);
  click = output<void>();

  onClick() {
    this.click.emit();
  }
}

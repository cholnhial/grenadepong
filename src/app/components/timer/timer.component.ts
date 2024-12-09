import { Component } from '@angular/core';
import {TimerService} from '../../services/timer.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-timer',
  imports: [CommonModule],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss'
})
export class TimerComponent {

  constructor(protected timerService: TimerService) {
  }
}

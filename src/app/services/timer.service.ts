import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {

  intervalInstance: any;
  timeLimit!: number;
  timeoutCallback: (() => void) | null = null;
  secondsRemaining = 0;
  running: boolean = false;
  countdown = new Subject<string>();

  setTimeLimitInSecs(secs: number) {
    this.timeLimit = secs;
  }

  setOnTimeout(callback: () => void) {
    this.timeoutCallback = callback;
  }

  start() {
    this.countdown.next(this.display);
    this.running = true;
    this.secondsRemaining = this.timeLimit;
    this.intervalInstance = setInterval(() => {
      if (this.secondsRemaining <= 0) {
        if (this.timeoutCallback) {
          this.timeoutCallback();
          this.stop();
        }
      }
      this.secondsRemaining -= 1;
      this.countdown.next(this.display);
    },1000);
  }

  stop() {
    this.secondsRemaining = this.timeLimit;
    clearTimeout(this.intervalInstance);
    this.running = false;
  }

  reset() {
    this.stop();
    this.start()
  }

  get display() {
    const minutes = !this.running ? 0 : Math.floor(this.secondsRemaining / 60);
    const seconds = !this.running ? 0 : this.secondsRemaining - (minutes*60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  countdownObservable() {
    return this.countdown;
  }

}

import {Component, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {CardComponent} from '../../components/card/card.component';
import {ButtonComponent} from '../../components/button/button.component';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-name',
  imports: [FormsModule, CommonModule, CardComponent, ButtonComponent],
  templateUrl: './name.component.html',
  styleUrl: './name.component.scss'
})
export class NameComponent implements OnInit {

  name = signal('');
  isJoining = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const param = this.route.snapshot.queryParamMap.get('host-peer-id');
    if (param) {
      localStorage.setItem('hostPeerId', param);
      this.isJoining = true;
    }
  }

  async onSubmit() {
    localStorage.setItem('name', this.name());
    if (!this.isJoining) {
      await this.router.navigate(['/wait']);
    } else {
      localStorage.setItem('mode', 'joining');
      await this.router.navigate(['/game']);
    }

  }
}

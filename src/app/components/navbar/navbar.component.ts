import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SoundService } from '../../services/sound.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="nav">
      <div class="brand"><a routerLink="/">University Accounting</a></div>
      <ul class="links">
        <li><a routerLink="/">Home</a></li>
        <li><a routerLink="/accounting">Accounting</a></li>
        <li><a routerLink="/staff-payroll">Staff Payroll</a></li>
        <li><a routerLink="/department-budget">Dept Budget</a></li>
        <li><a routerLink="/chat">Chat</a></li>
      </ul>
      <div class="actions">
        <button class="sound" (click)="toggleSound()">{{ soundService.isEnabled() ? '🔊' : '🔈' }}</button>
        <a *ngIf="!isLoggedIn" routerLink="/login">Login</a>
        <a *ngIf="!isLoggedIn" routerLink="/signup">Signup</a>
        <a *ngIf="isLoggedIn" routerLink="/profile">Profile</a>
        <button *ngIf="isLoggedIn" (click)="logout()">Logout</button>
      </div>
    </nav>
  `,
  styles: [`
    .nav { display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:#f3f4f6 }
    .brand a { font-weight:700; color:#111; text-decoration:none }
    .links { list-style:none; display:flex; gap:12px; margin:0; padding:0 }
    .links a { text-decoration:none; color:#333 }
    .actions { display:flex; gap:8px; align-items:center }
    .sound { background:transparent; border:0; cursor:pointer; font-size:18px }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService, public router: Router, public soundService: SoundService, private storage: StorageService) {}

  get isLoggedIn() { return this.auth.isLoggedIn(); }

  async toggleSound() {
    if (this.soundService.isEnabled()) {
      this.soundService.disable();
    } else {
      await this.soundService.resume();
    }
  }

  logout() {
    this.auth.logout();
  }

  get lastUserCookie() {
    try { return this.storage.getCookie('lastUser'); } catch (e) { return null; }
  }
}

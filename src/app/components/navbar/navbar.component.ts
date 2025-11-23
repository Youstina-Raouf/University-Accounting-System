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
      <div class="user-info" style="margin-left:12px; font-weight:600">
        {{ displayName }}
        <span *ngIf="lastUserCookie" style="margin-left:8px; color:#666">(last: {{ lastUserCookie }})</span>
      </div>
      <div class="actions">
        <button class="sound" (click)="toggleSound()">{{ soundService.isEnabled() ? '🔊' : '🔈' }}</button>
        <button class="debug" title="Inspect cookies & storage" (click)="debugStorage()">🔍</button>
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

  get currentUser() {
    return this.auth.getCurrentUser();
  }

  get displayName() {
    const u: any = this.currentUser;
    if (!u) return 'Guest';
    const name = (u.firstname || u.firstname === '' ? (u.firstname || '') : '') + (u.lastname ? (' ' + u.lastname) : '');
    if (name.trim()) return name.trim();
    return u.username || 'User';
  }

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

  debugStorage() {
    try { console.log('document.cookie ->', document.cookie); } catch (e) { console.error('cookie read err', e); }
    try { console.log('session currentUser ->', this.storage.getSession('currentUser')); } catch (e) { console.error('session read err', e); }
    try { console.log('local currentUser ->', this.storage.getLocal('currentUser')); } catch (e) { console.error('local currentUser read err', e); }
    try { console.log('local lastUser ->', this.storage.getLocal('lastUser'), 'local lastPass ->', this.storage.getLocal('lastPass')); } catch (e) { console.error('local last* read err', e); }
    try { console.log('localStorage keys ->', Object.keys(localStorage).sort()); } catch (e) {}
    try { console.log('sessionStorage keys ->', Object.keys(sessionStorage).sort()); } catch (e) {}
    alert('Storage logged to console. Open DevTools → Console and Application → Cookies to inspect values.');
  }

  get lastUserCookie() {
    try {
      const c = this.storage.getCookie('lastUser');
      if (c) return c;
      // fallback: some environments block cookies; check localStorage fallback saved by AuthService
      try {
        const local = this.storage.getLocal('lastUser');
        return local || null;
      } catch (e) {
        return null;
      }
    } catch (e) { return null; }
  }
}

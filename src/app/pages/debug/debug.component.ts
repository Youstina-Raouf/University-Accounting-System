import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="max-width:900px;margin:18px auto;padding:12px;border:1px solid #eee;border-radius:8px;">
      <h2>Debug: Storage & Cookies</h2>
      <p>This page reads storage and cookie values from the browser so you can verify they are working.</p>
      <div style="margin-top:12px;">
        <h3>Session Storage (<code>currentUser</code>)</h3>
        <pre>{{ session | json }}</pre>
      </div>
      <div style="margin-top:12px;">
        <h3>Local Storage (<code>users</code>, <code>currentUser</code>)</h3>
        <pre>{{ local | json }}</pre>
      </div>
      <div style="margin-top:12px;">
        <h3>Cookie <code>lastUser</code></h3>
        <pre>{{ cookie }}</pre>
      </div>
      <div style="margin-top:12px;">
        <h3>Raw document.cookie</h3>
        <pre>{{ raw }}</pre>
      </div>
      <div style="margin-top:12px; display:flex; gap:8px;">
        <button (click)="refresh()" class="btn">Refresh</button>
        <button (click)="setTestCookie()" class="btn">Set test cookie</button>
        <button (click)="setTestCookieNoAttrs()" class="btn">Set cookie (no attrs)</button>
      </div>
    </div>
  `
})
export class DebugComponent {
  session: any = null;
  local: any = null;
  cookie: string | null = null;
  raw: string = '';

  constructor(private storage: StorageService) {
    this.refresh();
  }

  refresh() {
    try { this.session = this.storage.getSession('currentUser'); } catch (e) { this.session = null; }
    try { this.local = this.storage.getLocal('users') || { currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null') }; } catch (e) { this.local = null; }
    try { this.cookie = this.storage.getCookie('lastUser'); } catch (e) { this.cookie = null; }
    try { this.raw = document.cookie || ''; } catch (e) { this.raw = ''; }
  }

  setTestCookie() {
    try {
      this.storage.setCookie('lastUser', 'debug-test-' + Date.now(), 1);
    } catch (e) {}
    this.refresh();
  }

  // For narrow debugging: set a cookie without SameSite/Secure attributes so we can see if attributes are the issue
  setTestCookieNoAttrs() {
    try {
      const name = 'lastUser';
      const value = 'debug-plain-' + Date.now();
      const expires = new Date(Date.now() + 1 * 864e5).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
    } catch (e) {}
    this.refresh();
  }
}

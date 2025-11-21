import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  // Local storage (persist across browser restarts)
  setLocal(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  getLocal<T = any>(key: string): T | null {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) as T : null;
  }
  removeLocal(key: string) { localStorage.removeItem(key); }

  // Session storage (cleared when tab/window closes)
  setSession(key: string, value: any) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
  getSession<T = any>(key: string): T | null {
    const v = sessionStorage.getItem(key);
    return v ? JSON.parse(v) as T : null;
  }
  removeSession(key: string) { sessionStorage.removeItem(key); }

  // Simple cookie helpers (not secure; for demo only)
  setCookie(name: string, value: string, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
  }
  getCookie(name: string): string | null {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, null as string | null);
  }
  deleteCookie(name: string) {
    this.setCookie(name, '', -1);
  }
}

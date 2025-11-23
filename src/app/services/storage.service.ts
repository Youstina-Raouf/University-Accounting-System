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
    try {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      // Add SameSite=Lax to make cookies visible in most dev setups; only add Secure if running over HTTPS
      const sameSite = 'SameSite=Lax';
      const secure = location.protocol === 'https:' ? '; Secure' : '';
      const cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; ${sameSite}${secure}`;
      document.cookie = cookie;
      // helpful debug log
      try { console.debug('[StorageService] setCookie', cookie); } catch (e) {}

      // Verify cookie was set; some environments (or strict browsers) may reject attributes.
      try {
        const present = document.cookie.split('; ').some(c => c.startsWith(name + '='));
        if (!present) {
          // Fallback: try without SameSite/Secure attributes (useful for some dev setups)
          const fallback = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
          document.cookie = fallback;
          try { console.debug('[StorageService] setCookie fallback used', fallback); } catch (e) {}
        }
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // swallow
    }
  }
  getCookie(name: string): string | null {
    try {
      return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts.slice(1).join('=')) : r;
      }, null as string | null);
    } catch (e) {
      return null;
    }
  }
  deleteCookie(name: string) {
    // set expiry in the past and clear value
    try {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
      // also clear a fallback (no attrs)
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    } catch (e) {}
  }
}

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
  /**
   * Try to set a cookie and verify it was accepted by the browser.
   * Returns true when the cookie was observed in document.cookie, false otherwise.
   */
  setCookie(name: string, value: string, days = 7): boolean {
    try {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      const encoded = encodeURIComponent(value);

      // Candidate cookie strings to try (some browsers/dev envs are picky about attribute order)
      const candidates = [
        `${name}=${encoded}; expires=${expires}; path=/; SameSite=Lax`,
        `${name}=${encoded}; expires=${expires}; path=/; SameSite=Lax; Secure`,
        `${name}=${encoded}; expires=${expires}; path=/`,
        `${name}=${encoded}; path=/; expires=${expires}`
      ];

      for (const cookieStr of candidates) {
        try {
          document.cookie = cookieStr;
        } catch (e) {
          // ignore and try next candidate
        }

        // quick verification
        try {
          const present = document.cookie.split('; ').some(c => c.startsWith(name + '='));
          if (present) {
            try { console.debug('[StorageService] setCookie success', cookieStr); } catch (e) {}
            return true;
          }
        } catch (e) {
          // ignore parse errors and continue
        }
      }

      // At this point, cookie was not reflected in document.cookie. Log a warning and return false.
      try { console.warn('[StorageService] setCookie failed to persist cookie in document.cookie', { name }); } catch (e) {}
      return false;
    } catch (e) {
      try { console.error('[StorageService] setCookie unexpected error', e); } catch (e) {}
      return false;
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

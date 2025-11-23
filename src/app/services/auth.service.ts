import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';

type UserRole = 'student' | 'admin' | 'accounting';

interface User {
  username: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserKey = 'currentUser';
  private usersKey = 'users';

  constructor(private router: Router, private storageService: StorageService) {
    this.initializeUsers();
  }

  private initializeUsers() {
    if (!localStorage.getItem(this.usersKey)) {
      localStorage.setItem(this.usersKey, JSON.stringify([]));
    }
  }

  // login now records sessionStorage for current session and sets a cookie 'lastUser' for convenience
  login(username: string, password: string, remember = false): boolean {
    try {
      const users = this.getUsers();

      if (!users || users.length === 0) {
        console.error('No users found in localStorage');
        return false;
      }

      const trimmedUsername = username.trim().toLowerCase();
      const user = users.find(u => {
        const storedUsername = (u.username || '').trim().toLowerCase();
        const storedPassword = u.password || '';
        return storedUsername === trimmedUsername && storedPassword === password;
      });

      if (user) {
        // Store user without password in currentUser
        const userToStore: User = {
          username: user.username,
          // normalize role to lowercase to avoid case-mismatch when checking route roles
          role: (user.role || '').toString().toLowerCase() as any
        };

        // Add optional fields if they exist
        if (user.firstname) {
          (userToStore as any).firstname = user.firstname;
        }
        if (user.lastname) {
          (userToStore as any).lastname = user.lastname;
        }
        if (user.email) {
          (userToStore as any).email = user.email;
        }

        // Store in sessionStorage for current session
        try {
          this.storageService.setSession(this.currentUserKey, userToStore);
        } catch (e) {
          // Fallback to localStorage if sessionStorage isn't available
          localStorage.setItem(this.currentUserKey, JSON.stringify(userToStore));
        }
        console.log('User stored for session:', userToStore);

        // If remember requested, persist minimal info in cookie and localStorage
        if (remember) {
          try {
            // Store username and (obfuscated) password in cookies for demo "remember me" behavior.
            // NOTE: Storing plaintext passwords in client cookies is insecure. We base64-encode the password here
            // only to avoid storing raw characters; this is NOT secure and should not be used in production.
            const ok1 = this.storageService.setCookie('lastUser', userToStore.username, 30);
            let ok2 = true;
            try { ok2 = this.storageService.setCookie('lastPass', btoa(password), 30); } catch(e) { ok2 = false; }

            // If cookies could not be set (some dev environments block them), keep a reliable fallback
            // in localStorage so the UI can still show a "remembered" username.
            if (!ok1) {
              try { localStorage.setItem('lastUser', userToStore.username); } catch (e) {}
            }
            if (!ok2) {
              try { localStorage.setItem('lastPass', btoa(password)); } catch (e) {}
            }
          } catch(e){}
          localStorage.setItem(this.currentUserKey, JSON.stringify(userToStore));
        }

        // Verify it was stored correctly
        const stored = this.getCurrentUser();
        if (!stored || stored.username !== user.username || stored.role !== user.role) {
          console.error('Failed to verify stored user');
          return false;
        }

        return true;
      }

      console.error('User not found or password incorrect', {
        searchedUsername: trimmedUsername,
        availableUsers: users.map(u => u.username)
      });
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  logout() {
    try { this.storageService.removeSession(this.currentUserKey); } catch(e) { localStorage.removeItem(this.currentUserKey); }
    try { this.storageService.deleteCookie('lastUser'); } catch(e) {}
    try { this.storageService.deleteCookie('lastPass'); } catch(e) {}
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    try {
      // Prefer sessionStorage (active session) over localStorage
      let userStr = null;
      try { userStr = this.storageService.getSession(this.currentUserKey) ? JSON.stringify(this.storageService.getSession(this.currentUserKey)) : null; } catch (e) { userStr = null; }
      if (!userStr) {
        userStr = localStorage.getItem(this.currentUserKey);
      }
      if (!userStr) {
        return null;
      }
      const user = JSON.parse(userStr);
      // Ensure user has required fields
      if (!user || !user.username || !user.role) {
        console.error('Invalid user data in localStorage:', user);
        return null;
      }
      return user;
    } catch (error) {
      console.error('Error parsing current user from localStorage:', error);
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  getUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user ? (user.role ? (user.role as string).toString().toLowerCase() as UserRole : null) : null;
  }

  private getUsers(): any[] {
    try {
      const usersStr = localStorage.getItem(this.usersKey);
      if (!usersStr) {
        // Initialize if not exists
        this.initializeUsers();
        const usersStrAfterInit = localStorage.getItem(this.usersKey);
        return usersStrAfterInit ? JSON.parse(usersStrAfterInit) : [];
      }
      return JSON.parse(usersStr);
    } catch (error) {
      console.error('Error reading users from localStorage:', error);
      return [];
    }
  }

  getHomeRoute(): string {
    const role = this.getUserRole();
    switch (role) {
      case 'admin': return '/admin';
      case 'accounting': return '/accounting';
      case 'student': return '/student';
      default: return '/login';
    }
  }

  // Helper method to verify users in localStorage (for debugging)
  getAllUsersForDebug(): any[] {
    return this.getUsers();
  }
}

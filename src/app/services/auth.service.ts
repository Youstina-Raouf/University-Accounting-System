import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {
    this.initializeUsers();
  }

  private initializeUsers() {
    if (!localStorage.getItem(this.usersKey)) {
      localStorage.setItem(this.usersKey, JSON.stringify([]));
    }
  }

  login(username: string, password: string): boolean {
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
          role: user.role
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
        
        localStorage.setItem(this.currentUserKey, JSON.stringify(userToStore));
        console.log('User stored in localStorage:', userToStore);
        
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
    localStorage.removeItem(this.currentUserKey);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.currentUserKey);
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
    return user ? user.role : null;
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

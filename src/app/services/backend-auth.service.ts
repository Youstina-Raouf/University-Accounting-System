import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService, User, AuthResponse } from './api.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class BackendAuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private tokenKey = 'authToken';
  private userKey = 'currentUser';

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router,
    private storageService: StorageService
  ) {
    this.initializeAuth();
  }

  private initializeAuth() {
    const token = this.getToken();
    const user = this.getStoredUser();
    
    if (token && user) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } else {
      this.clearAuth();
    }
  }

  register(userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    address?: string;
    date_of_birth?: string;
  }): Observable<AuthResponse> {
    return this.apiService.register(userData).pipe(
      tap(response => {
        this.setAuth(response.user, response.token);
      })
    );
  }

  login(email: string, password: string, remember = false): Observable<AuthResponse> {
    return this.apiService.login({ email, password }).pipe(
      tap(response => {
        this.setAuth(response.user, response.token);
        
        if (remember) {
          this.storageService.setCookie('rememberEmail', email, 30);
        } else {
          this.storageService.deleteCookie('rememberEmail');
        }
      })
    );
  }

  logout(): Observable<{ message: string }> {
    return this.apiService.logout().pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/login']);
      })
    );
  }

  getCurrentUser(): Observable<{ user: User }> {
    return this.apiService.getCurrentUser().pipe(
      tap(response => {
        this.currentUserSubject.next(response.user);
        this.setStoredUser(response.user);
      })
    );
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.apiService.verifyEmail(token).pipe(
      tap(() => {
        // Refresh current user data to update email verification status
        if (this.isAuthenticated()) {
          this.getCurrentUser().subscribe();
        }
      })
    );
  }

  resendVerification(): Observable<{ message: string }> {
    return this.apiService.resendVerification();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) || this.storageService.getCookie(this.tokenKey);
  }

  private setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this.storageService.setCookie(this.tokenKey, token, 1); // 1 day
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  private setStoredUser(user: User) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private setAuth(user: User, token: string) {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    this.setToken(token);
    this.setStoredUser(user);
  }

  private clearAuth() {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.storageService.deleteCookie(this.tokenKey);
    this.storageService.deleteCookie('rememberEmail');
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isEmailVerified(): boolean {
    const user = this.getCurrentUserValue();
    return user ? !!user.email_verified_at : false;
  }

  getRememberedEmail(): string | null {
    return this.storageService.getCookie('rememberEmail') || localStorage.getItem('rememberEmail');
  }

  getHomeRoute(): string {
    const user = this.getCurrentUserValue();
    if (!user) return '/login';
    
    // For now, all users go to dashboard
    // You can implement role-based routing later
    return '/dashboard';
  }

  // Refresh token and user data
  refreshAuth(): void {
    if (this.getToken()) {
      this.getCurrentUser().subscribe({
        error: () => {
          this.clearAuth();
          this.router.navigate(['/login']);
        }
      });
    }
  }
}

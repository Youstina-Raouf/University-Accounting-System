import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ErrorHandlingService } from './error-handling.service';
import { PerformanceMonitoringService } from './performance-monitoring.service';
import { logRocketService } from './logrocket.service';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();
  token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private errorHandling: ErrorHandlingService,
    private performanceService: PerformanceMonitoringService
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.tokenSubject.next(storedToken);
        logRocketService.identify(user.id.toString(), {
          name: user.name,
          email: user.email
        });
      } catch (error) {
        this.logout();
      }
    }
  }

  register(userData: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/register`, userData).pipe(
      map(response => {
        this.handleAuthentication(response);
        this.performanceService.trackFormSubmission('register', true);
        return response;
      }),
      catchError(error => {
        this.performanceService.trackFormSubmission('register', false);
        this.errorHandling.handleHttpError(error, 'auth_register');
        throw error;
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      map(response => {
        this.handleAuthentication(response);
        this.performanceService.trackFormSubmission('login', true);
        return response;
      }),
      catchError(error => {
        this.performanceService.trackFormSubmission('login', false);
        this.errorHandling.handleHttpError(error, 'auth_login');
        throw error;
      })
    );
  }

  logout(): void {
    const token = this.tokenSubject.value;
    if (token) {
      this.http.post(`${this.API_URL}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => {
          this.clearUserData();
          logRocketService.track('logout_success');
        },
        error: () => {
          this.clearUserData();
          logRocketService.track('logout_error');
        }
      });
    } else {
      this.clearUserData();
    }
  }

  getCurrentUser(): Observable<User> {
    const token = this.tokenSubject.value;
    return this.http.get<{ user: User }>(`${this.API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      map(response => response.user),
      catchError(error => {
        if (error.status === 401) {
          this.logout();
        }
        this.errorHandling.handleHttpError(error, 'get_current_user');
        throw error;
      })
    );
  }

  updateUser(userData: Partial<User>): Observable<User> {
    const token = this.tokenSubject.value;
    const currentUser = this.currentUserSubject.value;
    
    return this.http.put<{ message: string; user: User }>(
      `${this.API_URL}/users/${currentUser?.id}`, 
      userData,
      { headers: { Authorization: `Bearer ${token}` } }
    ).pipe(
      map(response => {
        this.currentUserSubject.next(response.user);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        logRocketService.track('profile_updated', { fields: Object.keys(userData) });
        return response.user;
      }),
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'update_profile');
        throw error;
      })
    );
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  private handleAuthentication(response: LoginResponse): void {
    this.currentUserSubject.next(response.user);
    this.tokenSubject.next(response.token);
    
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    localStorage.setItem('authToken', response.token);
    
    logRocketService.identify(response.user.id.toString(), {
      name: response.user.name,
      email: response.user.email
    });
    
    logRocketService.track('login_success', {
      method: 'email_password'
    });
    
    this.errorHandling.showSuccessFeedback('Login successful!');
  }

  refreshToken(): Observable<any> {
    const token = this.tokenSubject.value;
    return this.http.post(`${this.API_URL}/refresh`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      map((response: any) => {
        this.tokenSubject.next(response.token);
        localStorage.setItem('authToken', response.token);
        return response.token;
      }),
      catchError(error => {
        this.logout();
        throw error;
      })
    );
  }

  private clearUserData(): void {
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
}

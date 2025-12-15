import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  email_sent?: boolean;
  email_verified?: boolean;
}

export interface Transaction {
  id: number;
  user_id: number;
  account_id: number;
  category_id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  transaction_date: string;
  reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  account?: any;
  category?: any;
}

export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: string;
  balance: number;
  currency: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  transactions_count?: number;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  transactions_count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL = 'http://localhost:8000/api';

  constructor(
    private http: HttpClient,
    private errorHandling: ErrorHandlingService,
    private performanceService: PerformanceMonitoringService
  ) {}

  // Authentication methods
  register(userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    address?: string;
    date_of_birth?: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'register');
        throw error;
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'login');
        throw error;
      })
    );
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/logout`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'logout');
        throw error;
      })
    );
  }

  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.API_URL}/me`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'get_current_user');
        throw error;
      })
    );
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.API_URL}/verify-email/${token}`).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'verify_email');
        throw error;
      })
    );
  }

  resendVerification(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/resend-verification`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'resend_verification');
        throw error;
      })
    );
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  getTransactions(): Observable<{ transactions: Transaction[] }> {
    return this.http.get<{ transactions: Transaction[] }>(`${this.API_URL}/transactions`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'get_transactions');
        throw error;
      })
    );
  }

  createTransaction(transactionData: Partial<Transaction>): Observable<{ message: string; transaction: Transaction }> {
    return this.http.post<{ message: string; transaction: Transaction }>(`${this.API_URL}/transactions`, transactionData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'create_transaction');
        throw error;
      })
    );
  }

  updateTransaction(id: number, transactionData: Partial<Transaction>): Observable<{ message: string; transaction: Transaction }> {
    return this.http.put<{ message: string; transaction: Transaction }>(`${this.API_URL}/transactions/${id}`, transactionData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'update_transaction');
        throw error;
      })
    );
  }

  deleteTransaction(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/transactions/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'delete_transaction');
        throw error;
      })
    );
  }

  getAccounts(): Observable<{ accounts: Account[] }> {
    return this.http.get<{ accounts: Account[] }>(`${this.API_URL}/accounts`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'get_accounts');
        throw error;
      })
    );
  }

  createAccount(accountData: Partial<Account>): Observable<{ message: string; account: Account }> {
    return this.http.post<{ message: string; account: Account }>(`${this.API_URL}/accounts`, accountData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'create_account');
        throw error;
      })
    );
  }

  updateAccount(id: number, accountData: Partial<Account>): Observable<{ message: string; account: Account }> {
    return this.http.put<{ message: string; account: Account }>(`${this.API_URL}/accounts/${id}`, accountData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'update_account');
        throw error;
      })
    );
  }

  deleteAccount(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/accounts/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'delete_account');
        throw error;
      })
    );
  }

  getAccountSummary(): Observable<{ total_balance: number; active_accounts: number; total_accounts: number }> {
    return this.http.get<{ total_balance: number; active_accounts: number; total_accounts: number }>(`${this.API_URL}/accounts/summary`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'get_account_summary');
        throw error;
      })
    );
  }

  getCategories(): Observable<{ categories: Category[] }> {
    return this.http.get<{ categories: Category[] }>(`${this.API_URL}/categories`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'get_categories');
        throw error;
      })
    );
  }

  getCategoriesByType(type: 'income' | 'expense'): Observable<{ categories: Category[] }> {
    return this.http.get<{ categories: Category[] }>(`${this.API_URL}/categories/${type}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'get_categories_by_type');
        throw error;
      })
    );
  }

  createCategory(categoryData: Partial<Category>): Observable<{ message: string; category: Category }> {
    return this.http.post<{ message: string; category: Category }>(`${this.API_URL}/categories`, categoryData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'create_category');
        throw error;
      })
    );
  }

  updateCategory(id: number, categoryData: Partial<Category>): Observable<{ message: string; category: Category }> {
    return this.http.put<{ message: string; category: Category }>(`${this.API_URL}/categories/${id}`, categoryData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'update_category');
        throw error;
      })
    );
  }

  deleteCategory(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/categories/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        this.errorHandling.handleHttpError(error, 'delete_category');
        throw error;
      })
    );
  }
}

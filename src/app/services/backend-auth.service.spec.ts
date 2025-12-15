import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { BackendAuthService } from './backend-auth.service';
import { ApiService, User } from './api.service';
import { StorageService } from './storage.service';

describe('BackendAuthService', () => {
  let service: BackendAuthService;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockStorageService: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiService', [
      'register',
      'login',
      'logout',
      'getCurrentUser',
      'verifyEmail',
      'resendVerification'
    ]);
    
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const storageSpy = jasmine.createSpyObj('StorageService', ['setCookie', 'getCookie', 'deleteCookie']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BackendAuthService,
        { provide: ApiService, useValue: apiSpy },
        { provide: Router, useValue: routerSpy }
        ,{ provide: StorageService, useValue: storageSpy }
      ]
    });

    service = TestBed.inject(BackendAuthService);
    mockApiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockStorageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  function makeUser(partial?: Partial<User>): User {
    return {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
      ...partial
    };
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should register user successfully', () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        password_confirmation: 'password123'
      };

      const response = {
        message: 'Registration successful',
        user: makeUser(),
        token: 'test-token',
        email_sent: true
      };

      mockApiService.register.and.returnValue(of(response));

      service.register(userData).subscribe(result => {
        expect(result).toEqual(response);
        expect(mockApiService.register).toHaveBeenCalledWith(userData);
      });
    });

    it('should handle registration error', () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        password_confirmation: 'password123'
      };

      const errorResponse = {
        error: {
          message: 'Registration failed',
          errors: { email: ['Email already exists'] }
        }
      };

      mockApiService.register.and.returnValue(throwError(errorResponse));

      service.register(userData).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', () => {
      const email = 'john@example.com';
      const password = 'password123';

      const response = {
        message: 'Login successful',
        user: makeUser(),
        token: 'test-token',
        email_verified: true
      };

      mockApiService.login.and.returnValue(of(response));

      service.login(email, password).subscribe(result => {
        expect(result).toEqual(response);
        expect(mockApiService.login).toHaveBeenCalledWith({ email, password });
        expect(localStorage.getItem('authToken')).toBe('test-token');
        expect(localStorage.getItem('currentUser')).toBeTruthy();
      });
    });

    it('should handle login error', () => {
      const email = 'john@example.com';
      const password = 'wrongpassword';

      const errorResponse = {
        error: {
          message: 'Invalid credentials'
        }
      };

      mockApiService.login.and.returnValue(throwError(errorResponse));

      service.login(email, password).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toEqual(errorResponse);
          expect(localStorage.getItem('authToken')).toBeNull();
        }
      });
    });

    it('should handle unverified email login', () => {
      const email = 'john@example.com';
      const password = 'password123';

      const response = {
        message: 'Login successful but email not verified',
        user: makeUser(),
        token: 'test-token',
        email_verified: false
      };

      mockApiService.login.and.returnValue(of(response));

      service.login(email, password).subscribe(result => {
        expect(result.email_verified).toBeFalse();
      });
    });
  });

  describe('logout', () => {
    it('should logout user successfully', () => {
      // First login to set up the state
      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('currentUser', JSON.stringify({ id: 1, name: 'John Doe' }));

      const response = { message: 'Successfully logged out' };
      mockApiService.logout.and.returnValue(of(response));

      service.logout().subscribe(result => {
        expect(result).toEqual(response);
        expect(localStorage.getItem('authToken')).toBeNull();
        expect(localStorage.getItem('currentUser')).toBeNull();
        expect(mockRouter.navigate).toHaveBeenCalled();
      });
    });

    it('should handle logout error', () => {
      localStorage.setItem('authToken', 'test-token');

      const errorResponse = {
        error: {
          message: 'Logout failed'
        }
      };

      mockApiService.logout.and.returnValue(throwError(errorResponse));

      service.logout().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', () => {
      const userResponse = {
        user: makeUser()
      };

      mockApiService.getCurrentUser.and.returnValue(of(userResponse));

      service.getCurrentUser().subscribe(result => {
        expect(result).toEqual(userResponse);
        expect(mockApiService.getCurrentUser).toHaveBeenCalled();
      });
    });

    it('should handle get current user error', () => {
      const errorResponse = {
        error: {
          message: 'User not found'
        }
      };

      mockApiService.getCurrentUser.and.returnValue(throwError(errorResponse));

      service.getCurrentUser().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', () => {
      const token = 'verification-token';
      const response = { message: 'Email verified successfully' };

      mockApiService.verifyEmail.and.returnValue(of(response));

      service.verifyEmail(token).subscribe(result => {
        expect(result).toEqual(response);
        expect(mockApiService.verifyEmail).toHaveBeenCalledWith(token);
      });
    });
  });

  describe('resendVerification', () => {
    it('should resend verification email successfully', () => {
      const response = { message: 'Verification email sent' };

      mockApiService.resendVerification.and.returnValue(of(response));

      service.resendVerification().subscribe(result => {
        expect(result).toEqual(response);
        expect(mockApiService.resendVerification).toHaveBeenCalled();
      });
    });
  });

  describe('state management', () => {
    it('should return authentication status', () => {
      expect(service.isAuthenticated()).toBeFalse();

      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('currentUser', JSON.stringify(makeUser()));
      // Service reads localStorage only during initialization
      (service as any).initializeAuth();
      expect(service.isAuthenticated()).toBeTrue();

      localStorage.removeItem('authToken');
      (service as any).initializeAuth();
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return current user from localStorage', () => {
      const user = makeUser();
      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('currentUser', JSON.stringify(user));

      (service as any).initializeAuth();

      expect(service.getCurrentUserValue()).toEqual(user);
    });

    it('should return null when no user in localStorage', () => {
      expect(service.getCurrentUserValue()).toBeNull();
    });

    it('should handle malformed localStorage data', () => {
      localStorage.setItem('currentUser', 'invalid-json');
      expect(service.getCurrentUserValue()).toBeNull();
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { BackendAuthService } from '../../services/backend-auth.service';
import { SoundService } from '../../services/sound.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<BackendAuthService>;
  let mockActivatedRoute: any;
  let router: Router;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('BackendAuthService', [
      'login',
      'isAuthenticated',
      'getRememberedEmail',
      'getHomeRoute'
    ]);

    const soundSpy = jasmine.createSpyObj('SoundService', ['playSuccess']);

    mockActivatedRoute = {
      snapshot: {
        queryParams: {}
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        LoginComponent
      ],
      providers: [
        { provide: BackendAuthService, useValue: authSpy },
        { provide: SoundService, useValue: soundSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    mockAuthService = TestBed.inject(BackendAuthService) as jasmine.SpyObj<BackendAuthService>;
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('');
    expect(component.rememberMe).toBeFalse();
  });

  describe('ngOnInit', () => {
    it('should load remembered email on init', () => {
      const rememberedEmail = 'test@example.com';
      mockAuthService.getRememberedEmail.and.returnValue(rememberedEmail);

      component.ngOnInit();

      expect(component.email).toBe(rememberedEmail);
      expect(component.rememberMe).toBeTrue();
    });

    it('should handle return URL from query params', () => {
      mockActivatedRoute.snapshot.queryParams = { returnUrl: '/dashboard' };
      
      component.ngOnInit();

      expect(component.returnUrl).toBe('/dashboard');
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', () => {
      component.email = 'test@example.com';
      component.password = 'password123';
      component.rememberMe = true;

      const loginResponse = {
        message: 'Login successful',
        user: { id: 1, name: 'Test User', email: 'test@example.com', created_at: '2025-01-01T00:00:00.000Z', updated_at: '2025-01-01T00:00:00.000Z' },
        token: 'test-token',
        email_verified: true
      };

      mockAuthService.login.and.returnValue(of(loginResponse));
      mockAuthService.getHomeRoute.and.returnValue('/dashboard');
      const navSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

      component.login();

      expect(component.isLoading).toBeTrue();
      expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123', true);

      fixture.whenStable().then(() => {
        expect(component.isLoading).toBeFalse();
        expect(component.errorMessage).toBe('');
        expect(navSpy).toHaveBeenCalledWith(['/dashboard'], { replaceUrl: true });
      });
    });

    it('should handle login error', () => {
      component.email = 'test@example.com';
      component.password = 'wrongpassword';

      const errorResponse = {
        error: {
          message: 'Invalid credentials'
        }
      };

      mockAuthService.login.and.returnValue(throwError(errorResponse));

      component.login();

      // throwError emits synchronously; component sets isLoading false in error handler
      expect(component.isLoading).toBeFalse();
      expect(component.errorMessage).toBe('Invalid credentials');
    });

    it('should handle validation errors', () => {
      component.email = '';
      component.password = '';

      component.login();

      expect(component.errorMessage).toBe('Please enter both email and password');
      expect(component.isLoading).toBeFalse();
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should handle email verification required', () => {
      component.email = 'test@example.com';
      component.password = 'password123';

      const loginResponse = {
        message: 'Login successful',
        user: { id: 1, name: 'Test User', email: 'test@example.com', created_at: '2025-01-01T00:00:00.000Z', updated_at: '2025-01-01T00:00:00.000Z' },
        token: 'test-token',
        email_verified: false
      };

      mockAuthService.login.and.returnValue(of(loginResponse));

      component.login();

      expect(component.errorMessage).toBe('Please verify your email address. Check your inbox for a verification link.');
      expect(component.isLoading).toBeFalse();
    });

    it('should handle network errors gracefully', () => {
      component.email = 'test@example.com';
      component.password = 'password123';

      mockAuthService.login.and.returnValue(throwError('Network error'));

      component.login();

      // Component uses fallback invalid credentials message when error isn't a structured object
      expect(component.errorMessage).toBe('Invalid email or password. Please check your credentials and try again.');
      expect(component.isLoading).toBeFalse();
    });
  });

  // Note: LoginComponent does not currently validate email format/password length.
});

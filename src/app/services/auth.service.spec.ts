import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

class MockRouter {
  navigate() { return Promise.resolve(true); }
}

describe('AuthService (frontend mock)', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: Router, useClass: MockRouter }] });
    service = TestBed.inject(AuthService);
    // seed a user
    localStorage.setItem('users', JSON.stringify([{ username: 'test', password: 'pass', role: 'student' }]));
  });

  afterEach(() => {
    localStorage.removeItem('users');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
  });

  it('should login and store user in sessionStorage', () => {
    const ok = service.login('test', 'pass', false);
    expect(ok).toBeTrue();
    const u = service.getCurrentUser();
    expect(u).not.toBeNull();
    expect(u!.username).toBe('test');
  });
});

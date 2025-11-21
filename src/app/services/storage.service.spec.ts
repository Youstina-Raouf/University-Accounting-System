import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let svc: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [StorageService] });
    svc = TestBed.inject(StorageService);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    // clear cookies by setting expiry
    document.cookie = 'lastUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  });

  it('should set and get local/session storage', () => {
    svc.setLocal('x', { a: 1 });
    expect(svc.getLocal('x')!.a).toBe(1);
    svc.setSession('y', [1,2,3]);
    expect(svc.getSession('y')!.length).toBe(3);
  });

  it('should set and get cookie', () => {
    svc.setCookie('lastUser', 'someone', 1);
    expect(svc.getCookie('lastUser')).toBe('someone');
    svc.deleteCookie('lastUser');
    expect(svc.getCookie('lastUser')).toBeNull();
  });
});

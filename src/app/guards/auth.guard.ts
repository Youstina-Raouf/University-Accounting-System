import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

type UserRole = 'student' | 'admin' | 'accounting';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const isPublicRoute = route.data['public'] === true;
    const requiredRoles = route.data['roles'] as UserRole[];
    const isLoggedIn = this.authService.isLoggedIn();
  const currentUserRole = (this.authService.getUserRole() || '')?.toString().toLowerCase();

    // Allow access to public routes (login/signup) - don't redirect logged-in users
    // This allows users to logout and login as different users
    if (isPublicRoute) {
      return true;
    }

    // If user is not logged in and tries to access protected route, redirect to login
    if (!isLoggedIn) {
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Check if route requires specific roles
    if (requiredRoles && requiredRoles.length > 0) {
      const req = requiredRoles.map(r => (r || '').toString().toLowerCase());
      const hasRequiredRole = req.some(role => role === currentUserRole);
      if (!hasRequiredRole) {
        // If user doesn't have required role, redirect to their home
        return this.router.createUrlTree([this.authService.getHomeRoute()]);
      }
    }

    // Allow access to the route
    return true;
  }
}

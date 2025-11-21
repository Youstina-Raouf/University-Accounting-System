import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

// Use lazy-loaded standalone components via loadComponent for faster initial load
export const routes: Routes = [

  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // PUBLIC ROUTES (NO GUARDS)
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent), data: { public: true } },
  { path: 'signup', loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent), data: { public: true } },

  // PROTECTED ROUTES (lazy-loaded standalone components)
  { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent), canActivate: [AuthGuard] },
  { path: 'admin', loadComponent: () => import('./pages/admin-home/admin-home.component').then(m => m.AdminHomeComponent), canActivate: [AuthGuard], data: { roles: ['admin'] }},
  { path: 'accounting', loadComponent: () => import('./pages/accounting-home/accounting-home.component').then(m => m.AccountingHomeComponent), canActivate: [AuthGuard], data: { roles: ['accounting'] }},
  { path: 'student', loadComponent: () => import('./pages/student-home/student-home.component').then(m => m.StudentHomeComponent), canActivate: [AuthGuard], data: { roles: ['student'] }},

  { path: '**', redirectTo: '/login' }
];

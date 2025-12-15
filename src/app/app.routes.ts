import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

// Use lazy-loaded standalone components via loadComponent for faster initial load
export const routes: Routes = [

  // PUBLIC LANDING
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent), data: { public: true } },

  // PUBLIC ROUTES (NO GUARDS)
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent), data: { public: true } },
  { path: 'signup', loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent), data: { public: true } },
  { path: 'email-verification-sent', loadComponent: () => import('./pages/email-verification-sent/email-verification-sent.component').then(m => m.EmailVerificationSentComponent), data: { public: true } },
  { path: 'chat', loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent), data: { public: true } },
  { path: 'debug', loadComponent: () => import('./pages/debug/debug.component').then(m => m.DebugComponent), data: { public: true } },

  // PROTECTED ROUTES (lazy-loaded standalone components)
  { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent), canActivate: [AuthGuard] },
  { path: 'admin', loadComponent: () => import('./pages/admin-home/admin-home.component').then(m => m.AdminHomeComponent), canActivate: [AuthGuard], data: { roles: ['admin'] }},
  { path: 'accounting', loadComponent: () => import('./pages/accounting-home/accounting-home.component').then(m => m.AccountingHomeComponent), canActivate: [AuthGuard], data: { roles: ['accounting'] }},
  { path: 'student', loadComponent: () => import('./pages/student-home/student-home.component').then(m => m.StudentHomeComponent), canActivate: [AuthGuard], data: { roles: ['student'] }},

  // New admin/accounting tools
  { path: 'staff-payroll', loadComponent: () => import('./pages/staff-payroll/staff-payroll.component').then(m => m.StaffPayrollComponent), canActivate: [AuthGuard], data: { roles: ['admin'] } },
  { path: 'department-budget', loadComponent: () => import('./pages/department-budget/department-budget.component').then(m => m.DepartmentBudgetComponent), canActivate: [AuthGuard], data: { roles: ['admin', 'accounting'] } },
  
  // Payment routes
  { path: 'credit-card-payment', loadComponent: () => import('./pages/credit-card-payment/credit-card-payment.component').then(m => m.CreditCardPaymentComponent), canActivate: [AuthGuard], data: { roles: ['student'] } },

  { path: '**', redirectTo: '' }
];

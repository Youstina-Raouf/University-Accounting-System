import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AdminHomeComponent } from './pages/admin-home/admin-home.component';
import { AccountingHomeComponent } from './pages/accounting-home/accounting-home.component';
import { StudentHomeComponent } from './pages/student-home/student-home.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [

  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // PUBLIC ROUTES (NO GUARDS)
  { path: 'login', component: LoginComponent, data: { public: true } },
  { path: 'signup', component: SignupComponent, data: { public: true } },

  // PROTECTED ROUTES
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminHomeComponent, canActivate: [AuthGuard], data: { roles: ['admin'] }},
  { path: 'accounting', component: AccountingHomeComponent, canActivate: [AuthGuard], data: { roles: ['accounting'] }},
  { path: 'student', component: StudentHomeComponent, canActivate: [AuthGuard], data: { roles: ['student'] }},

  { path: '**', redirectTo: '/login' }
];

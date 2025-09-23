import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { authGuard, loginGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./features/auth/auth.component').then(c => c.AuthComponent),
    canActivate: [loginGuard]
  },
  {
    path: 'home',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
      { path: 'attendance', loadComponent: () => import('./features/attendance/attendance.component').then(c => c.AttendanceComponent) },
      { path: 'employees', loadComponent: () => import('./features/employees/employees.component').then(c => c.EmployeesComponent), canActivate: [adminGuard] },
      { path: 'leaves', loadComponent: () => import('./features/leaves/leaves.component').then(c => c.LeavesComponent) },
      { path: 'notifications', loadComponent: () => import('./features/notifications/notifications.component').then(c => c.NotificationsComponent) },
      { path: 'register', loadComponent: () => import('./features/register/register.component').then(c => c.RegisterComponent), canActivate: [adminGuard] }
    ]
  },
  { 
    path: '**', 
    loadComponent: () => import('./shared/components/page-not-found/page-not-found.component').then(c => c.PageNotFoundComponent)
  }
];

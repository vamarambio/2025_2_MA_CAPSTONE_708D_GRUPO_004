import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./screens/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./screens/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./screens/home/home.page').then( m => m.HomePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'servicios',
    loadComponent: () => import('./screens/servicios/servicios.page').then( m => m.ServiciosPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'qr-scan',
    loadComponent: () => import('./screens/qr-scan/qr-scan.page').then( m => m.QrScanPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'create-request',
    loadComponent: () => import('./screens/create-request/create-request.page').then( m => m.CreateRequestPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'request-detail',
    loadComponent: () => import('./screens/request-detail/request-detail.page').then( m => m.RequestDetailPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'classroom-history',
    loadComponent: () => import('./screens/classroom-history/classroom-history.page').then( m => m.ClassroomHistoryPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'export-report',
    loadComponent: () => import('./screens/export-report/export-report.page').then( m => m.ExportReportPage),
    canActivate: [AuthGuard]
  },
  // --- RUTA DE ADMINISTRADOR ---
  {
    path: 'admin',
    loadComponent: () => import('./screens/admin/dashboard/dashboard.page').then( m => m.DashboardPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'servicios',
    loadComponent: () => import('./screens/servicios/servicios.page').then( m => m.ServiciosPage)
  },
];
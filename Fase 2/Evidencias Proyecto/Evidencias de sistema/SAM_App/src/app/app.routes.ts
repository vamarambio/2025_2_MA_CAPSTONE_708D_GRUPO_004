// frontend/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard'; // <-- 1. IMPORTA EL GUARDIA

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login', // <-- 2. LA APP AHORA EMPIEZA EN LOGIN
    pathMatch: 'full',
  },
  {
    path: 'login', // <-- 3. AÑADE LA RUTA DE LOGIN
    loadComponent: () =>
      import('./screens/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register', // <-- 4. AÑADE LA RUTA DE REGISTER
    loadComponent: () =>
      import('./screens/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./screens/home/home.page').then((m) => m.HomePage),
    canActivate: [AuthGuard] // <-- 5. PROTEGE LA RUTA /home
  },
  {
    path: 'qr-scan',
    loadComponent: () =>
      import('./screens/qr-scan/qr-scan.page').then((m) => m.QrScanPage),
    canActivate: [AuthGuard] // <-- 6. PROTEGE EL RESTO DE LA APP
  },
  {
    path: 'create-request',
    loadComponent: () =>
      import('./screens/create-request/create-request.page').then(
        (m) => m.CreateRequestPage
      ),
    canActivate: [AuthGuard] // <-- 6. PROTEGE EL RESTO DE LA APP
  },
  // ... (Protege el resto de tus rutas de la misma forma) ...
  {
    path: 'request-detail',
    loadComponent: () =>
      import('./screens/request-detail/request-detail.page').then(
        (m) => m.RequestDetailPage
      ),
    canActivate: [AuthGuard]
  },
  {
    path: 'classroom-history',
    loadComponent: () =>
      import('./screens/classroom-history/classroom-history.page').then(
        (m) => m.ClassroomHistoryPage
      ),
    canActivate: [AuthGuard]
  },
  {
    path: 'export-report',
    loadComponent: () =>
      import('./screens/export-report/export-report.page').then(
        (m) => m.ExportReportPage
      ),
    canActivate: [AuthGuard]
  },
];
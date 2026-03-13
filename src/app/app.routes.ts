import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

const authGuard = async () => {
  const auth = inject(AuthService);
  return (await auth.isLoggedIn()) ? true : { redirectTo: '/welcome' } as any;
};

const guestGuard = async () => {
  const auth = inject(AuthService);
  return (await auth.isLoggedIn()) ? { redirectTo: '/dashboard' } as any : true;
};

export const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  {
    path: 'welcome',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/welcome/welcome.page').then(m => m.WelcomePage)
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
  },
  {
    path: 'transaccion',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/transaccion/transaccion.page').then(m => m.TransaccionPage)
  },
  {
    path: 'presupuesto',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/presupuesto/presupuesto.page').then(m => m.PresupuestoPage)
  },
  {
    path: 'categoria',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/categoria/categoria.page').then(m => m.CategoriaPage)
  },
  {
    path: 'reporte',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/reporte/reporte.page').then(m => m.ReportePage)
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/perfil/perfil.page').then(m => m.PerfilPage)
  },
  {
    path: 'configuracion',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/configuracion/configuracion.page').then(m => m.ConfiguracionPage)
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage)
  },
  { path: '**', redirectTo: 'welcome' }
];

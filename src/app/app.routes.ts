import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage)
  },

  {
    path: 'categoria',
    loadComponent: () => import('./pages/categoria/categoria.page').then(m => m.CategoriaPage)
  },
  {
    path: 'presupuesto',
    loadComponent: () => import('./pages/presupuesto/presupuesto.page').then(m => m.PresupuestoPage)
  },
  {
    path: 'transaccion',
    loadComponent: () => import('./pages/transaccion/transaccion.page').then(m => m.TransaccionPage)
  },
  {
    path: 'usuario',
    loadComponent: () => import('./pages/usuario/usuario.page').then(m => m.UsuarioPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then(m => m.PerfilPage)
  },
  {
    path: 'reporte',
    loadComponent: () => import('./pages/reporte/reporte.page').then(m => m.ReportePage)
  },
];

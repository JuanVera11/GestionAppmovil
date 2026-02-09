import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule]
})
export class DashboardPage {
  saldoActual = '$1,250,000';
  gastosMes = '$850,000';
  ingresosMes = '$2,100,000';
  progresoPresupuesto = 72;

  cards = [
    { icon: 'trending-up', title: 'Ingresos', value: '$2,100,000', color: 'success' },
    { icon: 'trending-down', title: 'Gastos', value: '$850,000', color: 'danger' },
    { icon: 'wallet', title: 'Saldo', value: '$1,250,000', color: 'primary' },
    { icon: 'pie-chart', title: 'Presupuesto', value: '72%', color: 'warning' }
  ];

  rapidoAccess = [
    { icon: 'add-circle', title: 'Nueva Transacción', route: '/pages/transaccion' },
    { icon: 'stats-chart', title: 'Reportes', route: '/pages/reporte' },
    { icon: 'card', title: 'Presupuestos', route: '/pages/presupuesto' },
    { icon: 'grid', title: 'Categorías', route: '/pages/categoria' }
  ];
}

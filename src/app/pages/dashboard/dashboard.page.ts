import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DataService } from '../../services/data'; 

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule]
})
export class DashboardPage {
  private dataService = inject(DataService);

  get saldoActual() {
    return this.dataService.formatMoney(this.dataService.saldoActual);
  }

  get progresoPresupuesto() {
    return this.dataService.porcentajeProgreso;
  }

  get cards() {
    return [
      { 
        icon: 'trending-up', 
        title: 'Ingresos', 
        value: this.dataService.formatMoney(this.dataService.ingresosMes), 
        color: 'success' 
      },
      { 
        icon: 'trending-down', 
        title: 'Gastos', 
        value: this.dataService.formatMoney(this.dataService.totalGastado), 
        color: 'danger' 
      },
      { 
        icon: 'wallet', 
        title: 'Saldo', 
        value: this.saldoActual, 
        color: 'primary' 
      },
      { 
        icon: 'pie-chart', 
        title: 'Presupuesto', 
        value: this.progresoPresupuesto + '%', 
        color: 'warning' 
      }
    ];
  }

  rapidoAccess = [
    { icon: 'add-circle', title: 'Configuración', route: '/configuracion' },
    { icon: 'stats-chart', title: 'Reportes', route: '/reporte' },
    { icon: 'card', title: 'Presupuestos', route: '/presupuesto' },
    { icon: 'grid', title: 'Categorías', route: '/categoria' }
  ];
}
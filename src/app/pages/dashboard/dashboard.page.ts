import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Database, TransaccionRecord } from '../../services/database';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { receiptOutline, statsChartOutline, walletOutline, pricetagsOutline, trendingUpOutline, trendingDownOutline, arrowDownOutline, arrowUpOutline } from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule]
})
export class DashboardPage implements OnInit {

  nombreUsuario = '';
  ingresos = 0;
  gastos = 0;
  transaccionesRecientes: TransaccionRecord[] = [];
  private userId = 0;

  constructor(
    private db: Database,
    private authService: AuthService
  ) {
    addIcons({
      receiptOutline,
      statsChartOutline,
      walletOutline,
      pricetagsOutline,
      trendingUpOutline,
      trendingDownOutline,
      arrowDownOutline,
      arrowUpOutline
    });
  }

  async ngOnInit() {
    await this.db.waitForReady();
    await this.cargarDatos();
  }

  async ionViewWillEnter() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    const user = await this.authService.getCurrentUser();
    if (!user) return;
    this.userId = user.id!;
    this.nombreUsuario = user.nombre;

    const transacciones = this.db.query(
      'SELECT * FROM transacciones WHERE idUsuario = ? ORDER BY fecha DESC;',
      [this.userId]
    ) as TransaccionRecord[];

    this.ingresos = transacciones
      .filter(t => t.tipo === 'ingreso')
      .reduce((s, t) => s + t.monto, 0);

    this.gastos = transacciones
      .filter(t => t.tipo === 'gasto')
      .reduce((s, t) => s + t.monto, 0);

    this.transaccionesRecientes = transacciones.slice(0, 5);
  }

  get saldo() { return this.ingresos - this.gastos; }

  get progreso() {
    if (!this.ingresos) return 0;
    const p = this.gastos / this.ingresos;
    return p > 1 ? 1 : p;
  }

  get progresoPorc() { return Math.min(Math.round((this.gastos / (this.ingresos || 1)) * 100), 100); }

  formatMoney(value: number): string {
    if (value >= 1000000) return '$' + (value / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'k';
    return '$' + value.toString();
  }

  getHora(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  rapidoAccess = [
    { icon: 'receipt-outline', title: 'Transacciones', route: '/transaccion' },
    { icon: 'stats-chart-outline', title: 'Reportes', route: '/reporte' },
    { icon: 'wallet-outline', title: 'Presupuestos', route: '/presupuesto' },
    { icon: 'pricetags-outline', title: 'Categorías', route: '/categoria' }
  ];
}

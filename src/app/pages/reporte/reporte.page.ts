import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Database } from 'src/app/services/database';
import { AuthService } from 'src/app/services/auth.service';
import Chart from 'chart.js/auto';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.page.html',
  styleUrls: ['./reporte.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ReportePage implements OnInit {
  @ViewChild('barChart') barChart!: ElementRef;
  @ViewChild('doughnutChart') doughnutChart!: ElementRef;

  private bars: any;
  private doughnut: any;
  userId = 0;

  resumen = {
    totalAsignado: 0,
    totalGastado: 0,
    ahorroEstimado: 0
  };

  constructor(
    public router: Router,
    private db: Database,
    private auth: AuthService
  ) {
    addIcons({ arrowBackOutline });
  }

  async ngOnInit() {
    await this.db.waitForReady();
    const user = await this.auth.getCurrentUser();
    if (user?.id) this.userId = user.id;
  }

  async ionViewWillEnter() {
    await this.generarReportes();
  }

  async generarReportes() {
    const categorias = await this.db.getCategorias(this.userId);
    const presupuestos = await this.db.getPresupuestos(this.userId);

    // 1. Cálculos de Resumen
    const sumaCategorias = categorias.reduce((s, c) => s + c.valorAsignado, 0);
    const sumaGastoCat = categorias.reduce((s, c) => s + c.valorGasto, 0);
    const sumaPresupuestoGral = presupuestos.reduce((s, p) => s + p.monto, 0);

    this.resumen.totalAsignado = sumaCategorias + sumaPresupuestoGral;
    this.resumen.totalGastado = sumaGastoCat;
    this.resumen.ahorroEstimado = this.resumen.totalAsignado - this.resumen.totalGastado;

    // 2. Gráfico de Barras (Presupuesto vs Gasto por Categoría)
    this.initBarChart(categorias);

    // 3. Gráfico de Dona (Distribución del Gasto)
    this.initDoughnutChart(categorias);
  }

  initBarChart(cats: any[]) {
    if (this.bars) this.bars.destroy();

    const labels = cats.map(c => c.nombre);
    const dataAsignado = cats.map(c => c.valorAsignado);
    const dataGasto = cats.map(c => c.valorGasto);

    this.bars = new Chart(this.barChart.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          { label: 'Asignado', data: dataAsignado, backgroundColor: '#4f46e5', borderRadius: 5 },
          { label: 'Gastado', data: dataGasto, backgroundColor: '#fca5a5', borderRadius: 5 }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: 'top' } } }
    });
  }

  initDoughnutChart(cats: any[]) {
    if (this.doughnut) this.doughnut.destroy();

    const gastados = cats.filter(c => c.valorGasto > 0);

    this.doughnut = new Chart(this.doughnutChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: gastados.map(c => c.nombre),
        datasets: [{
          data: gastados.map(c => c.valorGasto),
          backgroundColor: ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b', '#10b981'],
          borderWidth: 0
        }]
      },
      options: { cutout: '70%', plugins: { legend: { position: 'bottom' } } }
    });
  }

  formatMoney(v: number) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
  }
}
import { Component, OnInit, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data';
import { 
  IonContent, IonIcon, IonSelect, IonSelectOption, IonItem 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pieChart, funnelOutline, chevronDownOutline, walletOutline, cashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.page.html',
  styleUrls: ['./reporte.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonSelect, IonSelectOption, IonItem]
})

 export class ReportePage implements OnInit {
  filtroSeleccionado: string = '7dias';
  presupuestoTotal: number = 5000000;

  categoriasGestionApp = ['Comida', 'Transporte', 'Educación', 'Ropa', 'Viajes', 'Gastos Hormiga'];

  datosActuales = [
    { valor: 850000 }, { valor: 320000 }, { valor: 1100000 }, 
    { valor: 450000 }, { valor: 200000 }, { valor: 150000 }
  ];

  constructor() {
    addIcons({ pieChart, funnelOutline, chevronDownOutline, walletOutline, cashOutline });
  }

  ngOnInit() {}

  //@returns La sumatoria total de los gastos presentes en `datosActuales`
  get totalGastado(): number {
    return this.datosActuales.reduce((acc, curr) => acc + curr.valor, 0);
  }

  get saldoRestante(): number {
    return this.presupuestoTotal - this.totalGastado;
  }

  // @returns El porcentaje de ejecución presupuestal redondeado
  get porcentajeGastoTotal(): number {
    return Math.round((this.totalGastado / this.presupuestoTotal) * 100);
  }

  //Si el gasto excede el 100%, el color cambia a rojo
  get donutStyle() {
    const pct = this.porcentajeGastoTotal > 100 ? 100 : this.porcentajeGastoTotal;
    const color = this.porcentajeGastoTotal > 100 ? '#ff4961' : '#6366f1';
    return {
      'background': `conic-gradient(${color} 0% ${pct}%, #f3f4f6 ${pct}% 100%)`
    };
  }

  calcularAlturaBarra(monto: number): number {
    const topeVisual = 1500000; 
    const calculo = (monto / topeVisual) * 100;
    return calculo > 100 ? 100 : calculo;
  }

  cambiarFiltro(tipo: string) {
  this.filtroSeleccionado = tipo;

  // Mes en reportes
  if (tipo === 'mes') {
    this.datosActuales = [
      { valor: 1200000 }, { valor: 500000 }, { valor: 900000 }, 
      { valor: 300000 }, { valor: 600000 }, { valor: 200000 }
    ];
    // Los ultimos 7 dias
  } else if (tipo === '7dias') {
    this.datosActuales = [
      { valor: 850000 }, { valor: 320000 }, { valor: 1100000 }, 
      { valor: 450000 }, { valor: 200000 }, { valor: 150000 }
    ];

    // datos personalizados, que hacen parte de esos reportes
    // Pero digamos que en un diferente contexto de tiempo
  } else if (tipo === 'personalizado') {
    this.datosActuales = [
      { valor: 500000 }, { valor: 300000 }, { valor: 400000 }, 
      { valor: 500000 }, { valor: 600000 }, { valor: 200000 }
    ];
  }
}
  

  onCategoriaChange(event: any) {
    console.log('Categoría:', event.detail.value);
  }
}
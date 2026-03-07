import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // valores base  para el presupuesto e ingresos
  presupuestoTotal = 5000000;
  ingresosMes = 5000000;

  // lista de objetos que representan los gastos actuales por categoría
  datosActuales = [
    { valor: 850000 }, { valor: 320000 }, { valor: 1100000 }, 
    { valor: 450000 }, { valor: 200000 }, { valor: 150000 }
  ];

  // calcula la suma total de todos los gastos en el arreglo
  get totalGastado(): number {
    return this.datosActuales.reduce((acc, curr) => acc + curr.valor, 0);
  }

  // calcula cuánto dinero queda disponible restando gastos de ingresos
  get saldoActual(): number {
    return this.ingresosMes - this.totalGastado;
  }

  // calcula qué porcentaje del presupuesto se ha consumido
  get porcentajeProgreso(): number {
    return Math.round((this.totalGastado / this.presupuestoTotal) * 100);
  }

  // transforma números simples en texto con formato de moneda colombiana
  formatMoney(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }
}
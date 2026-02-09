import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  restaurantOutline, carOutline, heartOutline, homeOutline, 
  schoolOutline, peopleOutline, bugOutline, briefcaseOutline,
  giftOutline, videocamOutline, add, chevronForwardOutline, trash 
} from 'ionicons/icons';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.page.html',
  styleUrls: ['./categoria.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CategoriaPage {
  categorias = [
    { id: 1, nombre: 'Comida', asignado: 500000, gastado: 350000, icono: 'restaurant-outline' },
    { id: 2, nombre: 'Transporte', asignado: 200000, gastado: 190000, icono: 'car-outline' },
    { id: 3, nombre: 'Salud', asignado: 150000, gastado: 80000, icono: 'heart-outline' },
    { id: 4, nombre: 'Vivienda', asignado: 1200000, gastado: 1050000, icono: 'home-outline' },
    { id: 5, nombre: 'Educación', asignado: 500000, gastado: 450000, icono: 'school-outline' },
    { id: 6, nombre: 'Hijos', asignado: 300000, gastado: 150000, icono: 'people-outline' },
    { id: 7, nombre: 'Gastos Hormiga', asignado: 50000, gastado: 65000, icono: 'bug-outline' },
    { id: 8, nombre: 'Trabajo', asignado: 12000000, gastado: 80000, icono: 'briefcase-outline' },
    { id: 9, nombre: 'Regalos', asignado: 80000, gastado: 0, icono: 'gift-outline' },
    { id: 10, nombre: 'Entretenimiento', asignado: 300000, gastado: 280000, icono: 'videocam-outline' }
  ];

  constructor(private alertCtrl: AlertController) {
    addIcons({ 
      restaurantOutline, carOutline, heartOutline, homeOutline, 
      schoolOutline, peopleOutline, bugOutline, briefcaseOutline,
      giftOutline, videocamOutline, add, chevronForwardOutline, trash 
    });
  }

  formatMoney(value: number): string {
    if (value >= 1000000) {
      // Por encima de un millon (1.000.000) va M de millon
      return (value / 1000000).toFixed(1).replace('.0', '') + 'M';
    } else if (value >= 1000) {
      // Para miles: de 100.000 a 999.000 va k
      return (value / 1000).toFixed(0) + 'k';
    }
    return value.toString();
  }

  getProgreso(cat: any) {
    const p = cat.gastado / cat.asignado;
    return p > 1 ? 1 : p;
  }

  getColor(cat: any) {
    return cat.gastado > cat.asignado ? 'danger' : 'custom-indigo';
  }

  async abrirFormulario(categoria?: any) {
    const alert = await this.alertCtrl.create({
      header: categoria ? 'Editar Categoría' : 'Nueva Categoría',
      inputs: [
        { name: 'nombre', type: 'text', placeholder: 'Nombre', value: categoria?.nombre },
        { name: 'asignado', type: 'number', placeholder: 'Presupuesto', value: categoria?.asignado },
        { name: 'gastado', type: 'number', placeholder: 'Gastado', value: categoria?.gastado || 0 }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (categoria) {
              categoria.nombre = data.nombre;
              categoria.asignado = Number(data.asignado);
              categoria.gastado = Number(data.gastado);
            } else {
              this.categorias.push({
                id: Date.now(),
                nombre: data.nombre,
                asignado: Number(data.asignado),
                gastado: Number(data.gastado),
                icono: 'add'
              });
            }
          }
        }
      ]
    });
    await alert.present();
  }

  eliminar(id: number) {
    this.categorias = this.categorias.filter(c => c.id !== id);
  }
}
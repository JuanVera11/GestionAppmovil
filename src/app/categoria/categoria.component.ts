import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, 
  IonLabel, IonIcon, IonProgressBar, IonButtons, IonButton, IonFab, 
  IonFabButton, AlertController 
} from '@ionic/angular/standalone';
import { 
  addOutline, add, restaurantOutline, busOutline, heartOutline, 
  homeOutline, briefcaseOutline, giftOutline, ticketOutline, helpCircleOutline 
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.page.html',
  styleUrls: ['./categoria.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, 
    IonLabel, IonIcon, IonProgressBar, IonButtons, IonButton, IonFab, 
    IonFabButton, CommonModule, FormsModule
  ]
})
export class CategoriaPage implements OnInit {
  
  categorias = [
    { nombre: 'Comida', asignado: 500000, gastado: 350000, icon: 'restaurant-outline' },
    { nombre: 'Transporte', asignado: 200000, gastado: 190000, icon: 'bus-outline' },
    { nombre: 'Salud', asignado: 150000, gastado: 80000, icon: 'heart-outline' },
    { nombre: 'Vivienda', asignado: 1200000, gastado: 1050000, icon: 'home-outline' },
    { nombre: 'Trabajo', asignado: 100000, gastado: 40000, icon: 'briefcase-outline' },
    { nombre: 'Regalos', asignado: 80000, gastado: 50000, icon: 'gift-outline' },
    { nombre: 'Entretenimiento', asignado: 300000, gastado: 280000, icon: 'ticket-outline' },
  ];

  constructor(private alertController: AlertController) {
    addIcons({ 
      'add-outline': addOutline, 'add': add, 'restaurant-outline': restaurantOutline,
      'bus-outline': busOutline, 'heart-outline': heartOutline, 'home-outline': homeOutline,
      'briefcase-outline': briefcaseOutline, 'gift-outline': giftOutline, 
      'ticket-outline': ticketOutline, 'help-circle-outline': helpCircleOutline
    });
  }

  ngOnInit() {}

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      const millions = value / 1000000;
      return millions % 1 === 0 ? millions.toFixed(0) + 'M' : millions.toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'k';
    }
    return value.toString();
  }

  getProgress(gastado: number, asignado: number): number {
    return Math.min(gastado / asignado, 1);
  }

  // Función para agregar nueva categoría
  async agregarCategoria() {
    const alert = await this.alertController.create({
      header: 'Nueva Categoría',
      inputs: [
        { name: 'nombre', type: 'text', placeholder: 'Nombre (ej: Ahorro)' },
        { name: 'asignado', type: 'number', placeholder: 'Presupuesto ($)' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.nombre && data.asignado) {
              this.categorias.push({
                nombre: data.nombre,
                asignado: parseFloat(data.asignado),
                gastado: 0,
                icon: 'help-circle-outline'
              });
            }
          }
        }
      ]
    });
    await alert.present();
  }
}
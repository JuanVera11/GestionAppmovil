import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, 
  IonCol, IonCard, IonCardContent, IonItem, IonIcon, IonLabel, 
  IonProgressBar, IonList, IonAvatar, IonNote, IonFab, IonFabButton,
  AlertController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  restaurantOutline, carOutline, bagHandleOutline, homeOutline, 
  checkmarkCircleOutline, alertCircleOutline, trendingUpOutline, 
  add, leafOutline, cashOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-presupuesto',
  templateUrl: './presupuesto.page.html',
  styleUrls: ['./presupuesto.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, 
    IonToolbar, IonGrid, IonRow, IonCol, IonCard, IonCardContent, 
    IonItem, IonIcon, IonLabel, IonProgressBar, IonList, IonAvatar, 
    IonNote, IonFab, IonFabButton
  ],
  providers: [CurrencyPipe] 
})
export class PresupuestoPage implements OnInit {

  
  presupuestos: Array<{nombre: string, gastado: number, total: number, icon: string}> = [
    { nombre: 'Arriendo', gastado: 1200000, total: 1200000, icon: 'home-outline' },
    { nombre: 'Mercado', gastado: 450000, total: 800000, icon: 'restaurant-outline' },
    { nombre: 'Moto', gastado: 150000, total: 200000, icon: 'car-outline' },
    { nombre: 'Inversión', gastado: 2500000, total: 5000000, icon: 'trending-up-outline' }
  ];

  transacciones = [
    { comercio: 'Éxito', categoria: 'Mercado', fecha: '08/02', monto: -120000, icon: 'restaurant-outline' },
    { comercio: 'Nómina Quincena', categoria: 'Ingresos', fecha: '30/01', monto: 1800000, icon: 'cash-outline' }
  ];

  constructor(private alertCtrl: AlertController) {
    addIcons({ 
      restaurantOutline, carOutline, bagHandleOutline, homeOutline, 
      checkmarkCircleOutline, alertCircleOutline, trendingUpOutline, 
      add, leafOutline, cashOutline
    });
  }

  ngOnInit() {}

  formatLabel(value: number): string {
    if (value >= 1000000) {
      const million = value / 1000000;
      // Si es entero (1M), si tiene decimal (1.2M)
      return (million % 1 === 0 ? million.toFixed(0) : million.toFixed(1)) + 'M';
    } else if (value >= 1000) {
      const k = value / 1000;
      return (k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)) + 'k';
    }
    return value.toString();
  }

  async crearPresupuesto() {
    const alert = await this.alertCtrl.create({
      header: 'Nuevo Presupuesto',
      subHeader: 'Ingresa valores en miles (ej: 500000)',
      inputs: [
        { name: 'nombre', type: 'text', placeholder: 'Nombre (ej. Salidas)' },
        { name: 'total', type: 'number', placeholder: 'Monto total en COP' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: (data) => {
            const monto = parseFloat(data.total);
            if (data.nombre && !isNaN(monto)) {
              this.presupuestos.push({
                nombre: data.nombre,
                gastado: 0,
                total: monto,
                icon: 'bag-handle-outline' 
              });
              return true;
            }
            return false;
          }
        }
      ]
    });
    await alert.present();
  }
}
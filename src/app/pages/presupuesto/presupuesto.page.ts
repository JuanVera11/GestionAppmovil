import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, 
  IonLabel, IonIcon, IonAvatar, IonFab, IonFabButton, IonButtons, 
  IonButton, AlertController, IonItemSliding, IonItemOptions, IonItemOption, IonNote,
  IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonProgressBar 
} from '@ionic/angular/standalone'; // Una sola importación limpia
import { addIcons } from 'ionicons';
import { 
  add, trashOutline, pencilOutline, cashOutline, 
  receiptOutline, walletOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-presupuesto',
  templateUrl: './presupuesto.page.html',
  styleUrls: ['./presupuesto.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, 
    IonLabel, IonIcon, IonAvatar, IonFab, IonFabButton, IonButtons, 
    IonButton, IonItemSliding, IonItemOptions, IonItemOption, IonNote,
    IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonProgressBar
  ],
  providers: [CurrencyPipe, DecimalPipe]
})
export class PresupuestoPage implements OnInit {

  presupuestos: any[] = [];
  transacciones: any[] = [];

  constructor(private alertCtrl: AlertController) {
    addIcons({ add, trashOutline, pencilOutline, cashOutline, receiptOutline, walletOutline });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    const p = localStorage.getItem('mis_presupuestos');
    const t = localStorage.getItem('mis_transacciones');
    this.presupuestos = p ? JSON.parse(p) : [];
    this.transacciones = t ? JSON.parse(t) : [];
  }

  guardar() {
    localStorage.setItem('mis_presupuestos', JSON.stringify(this.presupuestos));
    localStorage.setItem('mis_transacciones', JSON.stringify(this.transacciones));
  }

  async gestionarPresupuesto(item?: any, index?: number) {
    const alert = await this.alertCtrl.create({
      header: item ? 'Editar Presupuesto' : 'Nuevo Presupuesto',
      inputs: [
        { name: 'nombre', type: 'text', placeholder: 'Nombre', value: item?.nombre || '' },
        { name: 'total', type: 'number', placeholder: 'Monto Total', value: item?.total || '' },
        { name: 'gastado', type: 'number', placeholder: 'Monto Gastado', value: item?.gastado || 0 }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (!data.nombre || !data.total) return false;
            const nuevo = { 
              nombre: data.nombre, 
              total: parseFloat(data.total), 
              gastado: parseFloat(data.gastado) || 0 
            };
            if (index !== undefined) this.presupuestos[index] = nuevo;
            else this.presupuestos.push(nuevo);
            this.guardar();
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  eliminarPresupuesto(index: number) {
    this.presupuestos.splice(index, 1);
    this.guardar();
  }

  async gestionarTransaccion(item?: any, index?: number) {
    const alert = await this.alertCtrl.create({
      header: item ? 'Editar Transacción' : 'Nueva Transacción',
      inputs: [
        { name: 'comercio', type: 'text', placeholder: 'Comercio', value: item?.comercio || '' },
        { name: 'monto', type: 'number', placeholder: 'Monto (ej: -50000)', value: item?.monto || '' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            const monto = parseFloat(data.monto);
            if (!data.comercio || isNaN(monto)) return false;
            const nueva = {
              comercio: data.comercio,
              monto: monto,
              categoria: monto > 0 ? 'Ingreso' : 'Gasto',
              icon: monto > 0 ? 'cash-outline' : 'receipt-outline'
            };
            if (index !== undefined) this.transacciones[index] = nueva;
            else this.transacciones.unshift(nueva);
            this.guardar();
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  eliminarTransaccion(index: number) {
    this.transacciones.splice(index, 1);
    this.guardar();
  }
}
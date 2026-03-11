import { Component, OnInit, NgZone } from '@angular/core'; 
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, 
  IonLabel, IonIcon, IonAvatar, IonFab, IonFabButton, IonButtons, 
  IonButton, AlertController, ActionSheetController, IonNote,
  IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonProgressBar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  add, trashOutline, pencilOutline, cashOutline, 
  receiptOutline, walletOutline, alertCircleOutline, 
  trendingUpOutline, trendingDownOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-presupuesto',
  templateUrl: './presupuesto.page.html',
  styleUrls: ['./presupuesto.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, 
    IonList, IonItem, IonLabel, IonIcon, IonAvatar, IonFab, IonFabButton,
    IonButtons, IonButton, IonNote, IonGrid, IonRow, IonCol, IonCard, 
    IonCardContent, IonProgressBar
  ],
  providers: [CurrencyPipe, DecimalPipe]
})
export class PresupuestoPage implements OnInit {
  presupuestos: any[] = [];
  transacciones: any[] = [];

  constructor(
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private zone: NgZone // Inyectamos NgZone para actualización instantánea
  ) {
    addIcons({ 
      add, trashOutline, pencilOutline, cashOutline, 
      receiptOutline, walletOutline, alertCircleOutline,
      trendingUpOutline, trendingDownOutline
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  ionViewWillEnter() {
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
    
    // Forzamos a Angular a actualizar la vista dentro de su zona
    this.zone.run(() => {
      this.cargarDatos();
    });
  }

  // --- GESTIÓN DE PRESUPUESTOS ---
  async gestionarPresupuesto(item?: any, index?: number) {
    const alert = await this.alertCtrl.create({
      header: item ? 'Editar Presupuesto' : 'Nuevo Presupuesto',
      cssClass: 'custom-alert',
      inputs: [
        { name: 'nombre', type: 'text', placeholder: 'Nombre', value: item?.nombre || '' },
        { name: 'total', type: 'number', placeholder: 'Monto Total', value: item?.total || '' },
        { name: 'gastado', type: 'number', placeholder: 'Monto Gastado', value: item?.gastado || 0 }
      ],
      buttons: [
        {
          text: item ? 'BORRAR' : 'CANCELAR',
          role: item ? 'destructive' : 'cancel',
          cssClass: item ? 'alert-button-delete' : '',
          handler: () => { if (item && index !== undefined) this.eliminarPresupuesto(index); }
        },
        {
          text: 'GUARDAR',
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

  // --- FLUJO DE TRANSACCIONES (PREGUNTA PRIMERO) ---
  async seleccionarTipoTransaccion() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¿Qué tipo de transacción es?',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Gasto',
          icon: 'trending-down-outline',
          handler: () => { 
            setTimeout(() => this.abrirFormularioTransaccion('gasto'), 100); 
          }
        },
        {
          text: 'Ingreso',
          icon: 'trending-up-outline',
          handler: () => { 
            setTimeout(() => this.abrirFormularioTransaccion('ingreso'), 100); 
          }
        },
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async abrirFormularioTransaccion(tipo: 'gasto' | 'ingreso', item?: any, index?: number) {
    const alert = await this.alertCtrl.create({
      header: item ? `Editar ${item.categoria}` : `Nuevo ${tipo === 'gasto' ? 'Gasto' : 'Ingreso'}`,
      cssClass: 'custom-alert',
      inputs: [
        { name: 'comercio', type: 'text', placeholder: 'Descripción', value: item?.comercio || '' },
        { name: 'monto', type: 'number', placeholder: 'Monto', value: item ? Math.abs(item.monto) : '' }
      ],
      buttons: [
        {
          text: item ? 'BORRAR' : 'CANCELAR',
          role: item ? 'destructive' : 'cancel',
          cssClass: item ? 'alert-button-delete' : '',
          handler: () => { if (item && index !== undefined) this.eliminarTransaccion(index); }
        },
        {
          text: 'GUARDAR',
          handler: (data) => {
            const valorAbs = parseFloat(data.monto);
            if (!data.comercio || isNaN(valorAbs)) return false;

            const nueva = {
              comercio: data.comercio,
              monto: tipo === 'gasto' ? -valorAbs : valorAbs,
              categoria: tipo === 'ingreso' ? 'Ingreso' : 'Gasto',
              icon: tipo === 'ingreso' ? 'cash-outline' : 'receipt-outline'
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

  editarTransaccion(item: any, index: number) {
    const tipo = item.monto < 0 ? 'gasto' : 'ingreso';
    this.abrirFormularioTransaccion(tipo, item, index);
  }

  eliminarPresupuesto(index: number) { this.presupuestos.splice(index, 1); this.guardar(); }
  eliminarTransaccion(index: number) { this.transacciones.splice(index, 1); this.guardar(); }
}
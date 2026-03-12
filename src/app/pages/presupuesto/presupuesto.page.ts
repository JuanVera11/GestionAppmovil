import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonIcon, IonLabel, IonList, IonItemSliding, IonItem, IonItemOptions,
  IonItemOption, IonProgressBar, IonFab, IonFabButton, IonInput,
  IonSelect, IonSelectOption, IonModal, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, walletOutline, closeOutline, trashOutline,
  arrowBackOutline, createOutline, checkmarkOutline
} from 'ionicons/icons';
import { Database, CategoriaRecord } from 'src/app/services/database';
import { AuthService } from 'src/app/services/auth.service';

interface ItemPresupuesto {
  id: number;
  tipo: 'general' | 'categoria';
  nombre: string;
  monto: number;
  gastado: number;
  idCategoria?: number;
}

@Component({
  selector: 'app-presupuesto',
  templateUrl: './presupuesto.page.html',
  styleUrls: ['./presupuesto.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonIcon, IonLabel, IonList, IonItemSliding, IonItem, IonItemOptions,
    IonItemOption, IonProgressBar, IonFab, IonFabButton, IonInput,
    IonSelect, IonSelectOption, IonModal
  ]
})
export class PresupuestoPage implements OnInit {

  presupuestos: ItemPresupuesto[] = [];
  categorias: CategoriaRecord[] = [];
  userId = 0;
  mostrarModal = false;

  form: {
    tipo: 'general' | 'categoria';
    monto: number | null;
    categoriaId: number | null;
    mes: string;
  } = { tipo: 'general', monto: null, categoriaId: null, mes: '' };

  mesActual = new Date().toLocaleString('es-CO', { month: 'long', year: 'numeric' });

  constructor(
    private db: Database,
    private authService: AuthService,
    private toastCtrl: ToastController
  ) {
    addIcons({ addOutline, walletOutline, closeOutline, trashOutline, arrowBackOutline, createOutline, checkmarkOutline });
  }

  async ngOnInit() {
    await this.db.waitForReady();
    const user = await this.authService.getCurrentUser();
    if (user?.id) this.userId = user.id;
    await this.cargar();
  }

  async ionViewWillEnter() {
    await this.cargar();
  }

  async cargar() {
    if (!this.userId) return;
    this.categorias = await this.db.getCategorias(this.userId);
    const generals = await this.db.getPresupuestos(this.userId);

    const items: ItemPresupuesto[] = [];

    // Presupuestos generales
    for (const p of generals) {
      items.push({
        id: p.id,
        tipo: 'general',
        nombre: `General – ${p.mes} ${p.ano}`,
        monto: p.monto,
        gastado: p.gasto ?? 0
      });
    }

    // Presupuestos por categoría (solo los que tienen valorAsignado > 0)
    for (const c of this.categorias) {
      if (c.valorAsignado > 0) {
        items.push({
          id: c.id,
          tipo: 'categoria',
          nombre: c.nombre,
          monto: c.valorAsignado,
          gastado: c.valorGasto,
          idCategoria: c.id
        });
      }
    }

    this.presupuestos = items;
  }

  get totalPresupuesto() { return this.presupuestos.reduce((s, p) => s + p.monto, 0); }
  get totalGastado() { return this.presupuestos.reduce((s, p) => s + p.gastado, 0); }
  get disponible() { return this.totalPresupuesto - this.totalGastado; }

  porcentaje(p: ItemPresupuesto) {
    return p.monto ? Math.min(p.gastado / p.monto, 1) : 0;
  }

  formatMoney(v: number) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
  }

  abrirModal() {
    const now = new Date();
    this.form = {
      tipo: 'general',
      monto: null,
      categoriaId: null,
      mes: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    };
    this.mostrarModal = true;
  }

  cerrarModal() { this.mostrarModal = false; }

  async guardar() {
    if (!this.form.monto) return;

    if (this.form.tipo === 'general') {
      const [ano, mes] = this.form.mes.split('-');
      const nombreMes = new Date(+ano, +mes - 1).toLocaleString('es-CO', { month: 'long' });
      await this.db.createPresupuesto(this.form.monto, nombreMes, +ano, this.userId);
    } else {
      if (!this.form.categoriaId) return;
      await this.db.updateCategoriaAsignado(this.form.categoriaId, this.form.monto, this.userId);
    }

    await this.cargar();
    this.mostrarModal = false;
    this.toast('Presupuesto guardado');
  }

  async eliminar(item: ItemPresupuesto) {
    if (item.tipo === 'general') {
      await this.db.deletePresupuesto(item.id, this.userId);
    } else {
      await this.db.updateCategoriaAsignado(item.id, 0, this.userId);
    }
    await this.cargar();
    this.toast('Presupuesto eliminado');
  }

  async toast(msg: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color: 'success', position: 'bottom' });
    await t.present();
  }
}

import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Database, TransaccionRecord, CategoriaRecord } from 'src/app/services/database';
import { AuthService } from 'src/app/services/auth.service';
import { addIcons } from 'ionicons';
import { addCircleOutline, swapVerticalOutline, arrowDownOutline, arrowUpOutline, pricetagsOutline, trashOutline, createOutline, checkmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-transaccion',
  templateUrl: './transaccion.page.html',
  styleUrls: ['./transaccion.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TransaccionPage implements OnInit {

  transacciones: TransaccionRecord[] = [];
  categorias: CategoriaRecord[] = [];
  filtroTipo: 'todos' | 'ingreso' | 'gasto' = 'todos';

  mostrarForm = false;
  form = {
    monto: null as number | null,
    tipo: 'gasto' as 'ingreso' | 'gasto',
    categoria: '',
    fecha: new Date().toISOString().substring(0, 10),
    descripcion: ''
  };
  editandoId: number | null = null;
  private userId = 0;

  constructor(
    private db: Database,
    private auth: AuthService,
    private alertCtrl: AlertController
  ) {
    addIcons({
      addCircleOutline, swapVerticalOutline,
      arrowDownOutline, arrowUpOutline,
      pricetagsOutline, trashOutline,
      createOutline, checkmarkOutline
    });
  }

  async ngOnInit() {
    await this.db.waitForReady();
    const user = await this.auth.getCurrentUser();
    if (user) this.userId = user.id!;
    await this.cargarCategorias();
    await this.cargarTransacciones();
  }

  async ionViewWillEnter() {
    const user = await this.auth.getCurrentUser();
    if (user) this.userId = user.id!;
    await this.cargarCategorias();
    await this.cargarTransacciones();
  }

  async cargarCategorias() {
    this.categorias = await this.db.getCategorias(this.userId);
  }

  async cargarTransacciones() {
    const all = this.db.query(
      'SELECT * FROM transacciones WHERE idUsuario = ? ORDER BY fecha DESC;',
      [this.userId]
    ) as TransaccionRecord[];

    this.transacciones =
      this.filtroTipo === 'todos'
        ? all
        : all.filter(t => t.tipo === this.filtroTipo);
  }

  async cambiarFiltro(tipo: 'todos' | 'ingreso' | 'gasto') {
    this.filtroTipo = tipo;
    await this.cargarTransacciones();
  }

  formatMoney(value: number): string {
    if (value >= 1000000) return '$' + (value / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'k';
    return '$' + value.toString();
  }

  isIngreso(t: TransaccionRecord) { return t.tipo === 'ingreso'; }
  getIcon(t: TransaccionRecord) { return t.tipo === 'ingreso' ? 'arrow-down-outline' : 'arrow-up-outline'; }
  getSign(t: TransaccionRecord) { return t.tipo === 'ingreso' ? '+' : '-'; }
  
  get totalIngresos() {
    return this.transacciones
      .filter(t => t.tipo === 'ingreso')
      .reduce((s, t) => s + t.monto, 0);
  }

  get totalGastos() {
    return this.transacciones
      .filter(t => t.tipo === 'gasto')
      .reduce((s, t) => s + t.monto, 0);
  }

  nuevaTransaccion(tipo: 'ingreso' | 'gasto') {
    this.editandoId = null;
    this.form = {
      monto: null,
      tipo,
      categoria: '',
      fecha: new Date().toISOString().substring(0, 10),
      descripcion: ''
    };
    this.mostrarForm = true;
  }

  abrirFormulario(t?: TransaccionRecord) {
    if (!t) return;
    this.editandoId = t.id ?? null;
    this.form = {
      monto: t.monto,
      tipo: t.tipo,
      categoria: t.categoria,
      fecha: t.fecha,
      descripcion: t.descripcion
    };
    this.mostrarForm = true;
  }

  cerrarForm() {
    this.mostrarForm = false;
  }

  async guardar() {
    if (!this.form.monto || !this.form.categoria) return;

    if (this.editandoId) {
      await this.db.deleteTransaccion(this.editandoId);
    }

    await this.db.createTransaccion({
      monto: this.form.monto,
      tipo: this.form.tipo,
      categoria: this.form.categoria,
      fecha: this.form.fecha,
      descripcion: this.form.descripcion,
      idUsuario: this.userId
    });

    if (this.form.tipo === 'gasto') {
      const cat = this.categorias.find(c => c.nombre === this.form.categoria);
      if (cat) {
        cat.valorGasto += this.form.monto!;
        await this.db.updateCategoria(cat);
      }
    }

    this.mostrarForm = false;
    await this.cargarTransacciones();
  }

  async eliminar(t: TransaccionRecord) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar transacción',
      message: '¿Seguro que deseas eliminarla?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.db.deleteTransaccion(t.id!);
            await this.cargarTransacciones();
          }
        }
      ]
    });
    await alert.present();
  }
}

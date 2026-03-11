import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  restaurantOutline, carOutline, heartOutline, homeOutline,
  schoolOutline, peopleOutline, bugOutline, briefcaseOutline,
  giftOutline, videocamOutline, add, chevronForwardOutline, trash
} from 'ionicons/icons';
import { Database, CategoriaRecord } from 'src/app/services/database';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.page.html',
  styleUrls: ['./categoria.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CategoriaPage implements OnInit {

  categorias: CategoriaRecord[] = [];
  private userId: number = 0;

  constructor(
    private alertCtrl: AlertController,
    private db: Database,
    private authService: AuthService
  ) {
    addIcons({
      restaurantOutline, carOutline, heartOutline, homeOutline,
      schoolOutline, peopleOutline, bugOutline, briefcaseOutline,
      giftOutline, videocamOutline, add, chevronForwardOutline, trash
    });
  }

  async ngOnInit() {
    await this.db.waitForReady();
    const user = await this.authService.getCurrentUser();
    if (user) this.userId = user.id;
    await this.cargarCategorias();
  }

  async ionViewWillEnter() {
    const user = await this.authService.getCurrentUser();
    if (user) this.userId = user.id;
    await this.cargarCategorias();
  }

  async cargarCategorias() {
    this.categorias = await this.db.getCategorias(this.userId);
  }

  formatMoney(value: number): string {
    if (value >= 1000000) return (value / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
    return value.toString();
  }

  getProgreso(cat: CategoriaRecord) {
    if (!cat.valorAsignado) return 0;
    const p = cat.valorGasto / cat.valorAsignado;
    return p > 1 ? 1 : p;
  }

  getColor(cat: CategoriaRecord) {
    return cat.valorGasto > cat.valorAsignado ? 'danger' : 'custom-indigo';
  }

  async abrirFormulario(categoria?: CategoriaRecord) {
    const alert = await this.alertCtrl.create({
      header: categoria ? 'Editar Categoría' : 'Nueva Categoría',
      inputs: [
        { name: 'nombre', type: 'text', placeholder: 'Nombre', value: categoria?.nombre },
        { name: 'asignado', type: 'number', placeholder: 'Presupuesto', value: categoria?.valorAsignado ?? 0 },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            const nombre = (data.nombre || '').trim();
            if (!nombre) return;
            const valorAsignado = Number(data.asignado) || 0;

            if (categoria) {
              await this.db.updateCategoria({
                ...categoria,
                nombre,
                valorAsignado,
                idUsuario: this.userId
              });
            } else {
              this.db.run(
                'INSERT INTO categorias (nombre, valorAsignado, valorGasto, idUsuario) VALUES (?, ?, ?, ?);',
                [nombre, valorAsignado, 0, this.userId]
              );
            }
            await this.cargarCategorias();
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminar(id: number) {
    this.db.run('DELETE FROM categorias WHERE id = ? AND idUsuario = ?;', [id, this.userId]);
    await this.cargarCategorias();
  }
}

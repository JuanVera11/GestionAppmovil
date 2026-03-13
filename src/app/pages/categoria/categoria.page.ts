import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { restaurantOutline, carOutline, heartOutline, homeOutline, schoolOutline, peopleOutline, bugOutline, briefcaseOutline, giftOutline, videocamOutline, add, chevronForwardOutline, trash,arrowBackOutline, checkmarkOutline } from 'ionicons/icons';
import { Database, CategoriaRecord } from 'src/app/services/database';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.page.html',
  styleUrls: ['./categoria.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink]
})
export class CategoriaPage implements OnInit {

  categorias: CategoriaRecord[] = [];
  private userId: number = 0;

  constructor(
    public router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private db: Database,
    private authService: AuthService
  ) {
    addIcons({restaurantOutline, carOutline, heartOutline, homeOutline,schoolOutline, peopleOutline, bugOutline, briefcaseOutline,giftOutline, videocamOutline, add, chevronForwardOutline, trash,arrowBackOutline, checkmarkOutline});
  }

  async ngOnInit() {
    await this.db.waitForReady();
    await this.obtenerUsuario();
    await this.cargarCategorias();
  }

  async ionViewWillEnter() {
    await this.obtenerUsuario();
    await this.cargarCategorias();
  }

  async obtenerUsuario() {
    const user = await this.authService.getCurrentUser();
    if (user && user.id) {
      this.userId = user.id;
    }
  }

  async cargarCategorias() {
    if (this.userId > 0) {
      this.categorias = await this.db.getCategorias(this.userId);
    }
  }

  formatMoney(value: number): string {
    if (value >= 1000000) return (value / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
    return value.toString();
  }

  getProgreso(cat: CategoriaRecord) {
    if (!cat.valorAsignado || cat.valorAsignado === 0) return 0;
    const p = cat.valorGasto / cat.valorAsignado;
    return p > 1 ? 1 : p;
  }

  getColor(cat: CategoriaRecord) {
    return cat.valorGasto > cat.valorAsignado ? 'danger' : 'custom-indigo';
  }

  async abrirFormulario(categoria?: CategoriaRecord) {
    const botones: any[] = [
      { text: 'CANCELAR', role: 'cancel' }
    ];

    if (categoria) {
      botones.push({
        text: 'ELIMINAR',
        cssClass: 'alert-button-delete',
        handler: () => {
          this.eliminar(categoria.id);
        }
      });
    }

    botones.push({
      text: 'GUARDAR',
      handler: async (data: any) => {
        const nombre = (data.nombre || '').trim();
        const valorAsignado = data.asignado !== '' ? Number(data.asignado) : 0;
        const valorGasto = data.gasto !== '' ? Number(data.gasto) : 0;

        if (!nombre) {
          this.presentToast('El nombre es obligatorio', 'warning');
          return false;
        }

        if (this.userId <= 0) {
          this.presentToast('Error: Usuario no identificado', 'danger');
          return false;
        }

        try {
          if (categoria) {
            await this.db.updateCategoria({
              id: categoria.id,
              nombre: nombre,
              valorAsignado: valorAsignado,
              valorGasto: valorGasto,
              idUsuario: this.userId
            });
          } else {
            await this.db.run(
              'INSERT INTO categorias (nombre, valorAsignado, valorGasto, idUsuario) VALUES (?, ?, ?, ?);',
              [nombre, valorAsignado, valorGasto, this.userId]
            );
          }

          await this.cargarCategorias();
          this.presentToast('¡Datos guardados!');
          return true;
        } catch (error) {
          console.error('Error al guardar:', error);
          this.presentToast('Error al guardar en la base de datos', 'danger');
          return false;
        }
      }
    });

    const alert = await this.alertCtrl.create({
      header: categoria ? 'Editar Categoría' : 'Nueva Categoría',
      cssClass: 'custom-alert',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Categoría (Ej: Comida)',
          value: categoria?.nombre
        },
        {
          name: 'asignado',
          type: 'number',
          placeholder: 'Presupuesto mensual',
          value: categoria?.valorAsignado ?? ''
        },
        {
          name: 'gasto',
          type: 'number',
          placeholder: 'Valor gastado',
          value: categoria?.valorGasto ?? 0
        }
      ],
      buttons: botones
    });

    await alert.present();
  }

  async eliminar(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Estás seguro de eliminar esta categoría?',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Sí, eliminar',
          handler: async () => {
            try {
              await this.db.run('DELETE FROM categorias WHERE id = ? AND idUsuario = ?;', [id, this.userId]);
              await this.cargarCategorias();
              this.presentToast('Categoría eliminada');
            } catch (error) {
              this.presentToast('Error al eliminar', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
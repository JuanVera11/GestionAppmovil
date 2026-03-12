import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, 
  IonInput, 
  IonLabel, 
  IonButton, 
  IonIcon, 
  AlertController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { Database } from 'src/app/services/database';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonInput, IonLabel, IonButton, IonIcon]
})
export class ConfiguracionPage implements OnInit {
  // Variables de visualización
  userName: string = '';
  userEmail: string = '';
  profileImage: string = 'assets/default-avatar.png';

  // Variables de edición (NgModel)
  editNombre: string = '';
  editApellido: string = '';
  editCorreo: string = '';

  private userId: number = 0;

  constructor(
    private authService: AuthService,
    private database: Database,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({ cameraOutline });
  }

  async ngOnInit() {
    // Inicializa DB y carga datos al arrancar
    await this.database.initializeDatabase();
    await this.loadUserData();
  }

  async ionViewWillEnter() {
    // Refresca datos al volver a la vista
    await this.loadUserData();
  }

  async loadUserData() {
    const user = await this.authService.getCurrentUser();
    
    // Valida existencia del usuario e ID
    if (user && user.id) {
      this.userId = user.id;
      this.userName = `${user.nombre} ${user.apellido}`;
      this.userEmail = user.correo;
      this.profileImage = user.foto ?? 'assets/default-avatar.png';
      
      // Sincroniza inputs con datos actuales
      this.editNombre = user.nombre;
      this.editApellido = user.apellido;
      this.editCorreo = user.correo;
    }
  }

  async guardarCambios() {
    // Valida campos no vacíos
    if (!this.editNombre.trim() || !this.editApellido.trim()) {
      this.mostrarAlerta('Error', 'Nombre y apellido obligatorios.');
      return;
    }

    try {
      // Actualiza base de datos
      await this.database.run(
        'UPDATE usuarios SET nombre = ?, apellido = ?, correo = ? WHERE id = ?;',
        [this.editNombre.trim(), this.editApellido.trim(), this.editCorreo.trim(), this.userId]
      );

      // Actualiza almacenamiento local y UI
      localStorage.setItem('userName', `${this.editNombre.trim()} ${this.editApellido.trim()}`);
      await this.loadUserData();
      this.mostrarAlerta('Éxito', 'Datos actualizados.');

    } catch (error) {
      this.mostrarAlerta('Error', 'No se pudo guardar.');
    }
  }

  // Activa input de archivo oculto
  triggerFileInput() {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const base64 = e.target.result as string;
      this.profileImage = base64;
      
      // Guarda imagen en DB y localStorage
      await this.database.run('UPDATE usuarios SET foto = ? WHERE id = ?;', [base64, this.userId]);
      localStorage.setItem('userPhoto', base64);
    };
    reader.readAsDataURL(file);
  }

  // Cierra sesión con confirmación
  async logout() {
    const alert = await this.alertController.create({
      header: '¿Cerrar sesión?',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Sí',
          handler: async () => {
            await this.authService.logout();
            this.router.navigate(['/welcome']);
          }
        }
      ]
    });
    await alert.present();
  }

  // Helper para alertas rápidas
  private async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header, message, buttons: ['OK']
    });
    await alert.present();
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonInput, IonLabel, IonButton, IonIcon, AlertController
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
  // Parametros que reciben datos en configuración
  // Y son datos de usuario edtiables
  userName: string = '';
  userEmail: string = '';
  // Foto de usuario, editable
  profileImage: string = 'assets/default-avatar.png';

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
    await this.database.initializeDatabase();
    await this.loadUserData();
  }

  async ionViewWillEnter() {
    await this.loadUserData();
  }

  async loadUserData() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.userId = user.id;
      this.userName = `${user.nombre} ${user.apellido}`;
      this.userEmail = user.correo;
      this.profileImage = user.foto ?? 'assets/default-avatar.png';
      this.editNombre = user.nombre;
      this.editApellido = user.apellido;
      this.editCorreo = user.correo;
    }
  }

  async guardarCambios() {
    // Si esta vacio no va a recibir datos ni cambios
    // Debe tener caracteres
    if (!this.editNombre.trim()) {
      const alert = await this.alertController.create({
        header: 'Error', message: 'El nombre no puede estar vacío.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    this.database.run(
      'UPDATE usuarios SET nombre = ?, apellido = ?, correo = ? WHERE id = ?;',
      [this.editNombre.trim(), this.editApellido.trim(), this.editCorreo.trim(), this.userId]
    );
    localStorage.setItem('userName', `${this.editNombre.trim()} ${this.editApellido.trim()}`);
    await this.loadUserData();
    const alert = await this.alertController.create({
      header: 'Guardado', message: 'Datos actualizados correctamente.',
      buttons: ['OK']
    });
    await alert.present();
  }

  triggerFileInput() {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64 = e.target.result as string;
      this.profileImage = base64;
      this.database.run('UPDATE usuarios SET foto = ? WHERE id = ?;', [base64, this.userId]);
      localStorage.setItem('userPhoto', base64);
    };
    
    reader.readAsDataURL(file);
  }

  async logout() {
    const alert = await this.alertController.create({
      header: '¿Cerrar sesión?',
      message: '¿Estás seguro de que deseas salir?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar Sesión', role: 'destructive',
          handler: async () => {
            await this.authService.logout();
            this.router.navigate(['/welcome']);
          }
        }
      ]
    });
    await alert.present();
  }
}

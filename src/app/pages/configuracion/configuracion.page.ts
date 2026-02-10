import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, 
  IonIcon, IonLabel, IonAvatar, IonListHeader, IonToggle, AlertController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  createOutline, imageOutline, notificationsOutline, colorPaletteOutline,
  sunnyOutline, logOutOutline, cameraOutline, chevronForwardOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, 
    IonContent, IonList, IonItem, IonIcon, IonLabel, 
    IonAvatar, IonListHeader, IonToggle
  ]
})
export class ConfiguracionPage {
  userName: string = 'Usuario GestionApp';
  userEmail: string = 'usuario@GestionApp.com';
  profileImage: string = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&h=150&auto=format&fit=crop';
  isDark: boolean = false;

  constructor(private alertController: AlertController) {
    addIcons({ 
      createOutline, imageOutline, notificationsOutline, colorPaletteOutline,
      sunnyOutline, logOutOutline, cameraOutline, chevronForwardOutline 
    });
  }

  // EDITAR PERFIL  
  async editProfile() {
    const alert = await this.alertController.create({
      header: 'Editar Perfil',
      cssClass: 'dark-alert', 
      inputs: [
        { name: 'nuevoNombre', type: 'text', placeholder: 'Nombre', value: this.userName },
        { name: 'nuevoEmail', type: 'email', placeholder: 'Correo', value: this.userEmail }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Guardar', 
          handler: (data: { nuevoNombre: string, nuevoEmail: string }) => {
            if (data.nuevoNombre) this.userName = data.nuevoNombre;
            if (data.nuevoEmail) this.userEmail = data.nuevoEmail;
          } 
        }
      ]
    });
    await alert.present();
  }

  //  CERRAR SESIÓN  
  async logout() {
    const alert = await this.alertController.create({
      header: '¿Cerrar sesión?',
      message: '¿Estás seguro de que deseas salir?',
      cssClass: 'dark-alert',
      buttons: [
        { text: 'No, volver', role: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          role: 'destructive',
          handler: () => {
            console.log('Cerrando sesión...');
    
          }
        }
      ]
    });
    await alert.present();
  }

  // --- MODO COLOR (ESPECIAL) ---
  toggleTheme(event: any) {
    this.isDark = event.detail.checked;
    if (this.isDark) {
      document.body.classList.add('special-mode');
    } else {
      document.body.classList.remove('special-mode');
    }
  }

  // --- Imagen de Usuario ---
  triggerFileInput() {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => { 
        this.profileImage = e.target.result as string; 
      };
      reader.readAsDataURL(file);
    }
  }
}
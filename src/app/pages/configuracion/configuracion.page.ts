import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, 
  IonIcon, IonLabel, IonAvatar, IonListHeader, IonToggle, AlertController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  createOutline, imageOutline, notificationsOutline, 
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
  profileImage: string = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&h=150&auto=format&fit=crop';

  constructor(private alertController: AlertController) {
    addIcons({ 
      createOutline, imageOutline, notificationsOutline, 
      sunnyOutline, logOutOutline, cameraOutline, chevronForwardOutline 
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => { this.profileImage = e.target.result; };
      reader.readAsDataURL(file);
    }
  }

  async editarDatos() {
    const alert = await this.alertController.create({
      header: 'Editar Perfil',
      inputs: [
        { name: 'nombre', type: 'text', placeholder: 'Nombre de usuario' },
        { name: 'email', type: 'email', placeholder: 'Correo electrónico' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Guardar', handler: (data) => { console.log('Datos guardados:', data); } }
      ]
    });
    await alert.present();
  }

  toggleTheme(event: any) {
    document.body.classList.toggle('dark', event.detail.checked);
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro que deseas volver al menú principal?',
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Sí, Salir', handler: () => { console.log('Saliendo...'); } }
      ]
    });
    await alert.present();
  }
}
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class RegisterPage {
  fullName: string = '';
  email: string = '';
  pass: string = '';
  accountType: 'Personal' | 'Negocio' = 'Personal';
  termsAccepted: boolean = false;
  loading = false;
  errorMsg = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async register() {
    if (!this.fullName || !this.email || !this.pass || !this.termsAccepted) {
      this.errorMsg = 'Completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    try {
      const [nombre, apellido] = this.fullName.split(' ', 2);
      const userId = await this.authService.register(
        nombre || this.fullName,
        apellido || '',
        this.email,
        this.pass
      );

      if (userId > 0) {
        await this.showAlert('Éxito', 'Usuario creado. Inicia sesión.');
        this.router.navigate(['/pages/login']);
      }
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al registrar';
    } finally {
      this.loading = false;
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}

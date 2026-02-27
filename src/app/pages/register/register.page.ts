import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';
import { Database } from '../../services/database';

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
    private alertController: AlertController,
    private database: Database
  ) { }

  async register() {
    console.log('Register iniciado:', { fullName: this.fullName, email: this.email });

    if (!this.fullName || !this.email || !this.pass || !this.termsAccepted) {
      this.errorMsg = 'Completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    try {
      const [nombre, apellido] = this.fullName.trim().split(' ', 2);

      await this.database.waitForReady();
      console.log('Database lista');

      await this.authService.register(
        nombre || this.fullName,
        apellido || '',
        this.email,
        this.pass
      );

      await this.showAlert('Éxito', '¡Cuenta creada! Inicia sesión.');
      this.router.navigate(['/login']);
    }
    catch (error: any) {
      console.error('Error completo register:', error);
      if (error.message?.includes('UNIQUE constraint failed')) {
        this.errorMsg = 'Este correo ya está registrado';
      } else {
        this.errorMsg = error.message || 'Error al registrar';
      }
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

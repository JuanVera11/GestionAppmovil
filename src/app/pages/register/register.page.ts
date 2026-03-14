import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Database } from '../../services/database';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class RegisterPage {
  fullName: string = '';
  email: string = '';
  pass: string = '';
  accountType: 'Personal' | 'Negocio' = 'Personal';
  termsAccepted: boolean = false;
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private database: Database
  ) {}

  async register() {
    if (!this.fullName.trim() || !this.email.trim() || !this.pass.trim() || !this.termsAccepted) {
      this.errorMsg = 'Completa todos los campos y acepta los términos';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    try {
      const nameParts = this.fullName.trim().split(' ');
      const nombre = nameParts[0];
      const apellido = nameParts.slice(1).join(' ') || '';

      await this.database.waitForReady();

      const newId = await this.authService.register(nombre, apellido, this.email, this.pass);

      if (newId !== null && newId !== undefined) {
        await this.authService.loginByUserId(newId, nombre, apellido);
        this.successMsg = 'Usuario creado con éxito';
      }

    } catch (error: any) {
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

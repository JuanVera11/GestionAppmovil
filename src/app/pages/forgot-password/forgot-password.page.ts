import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.page.html',
    styleUrls: ['./forgot-password.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule],
})
export class ForgotPasswordPage {
    correo: string = '';
    nuevaContrasena: string = '';
    confirmarContrasena: string = '';
    loading = false;
    errorMsg = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private alertController: AlertController
    ) { }

    async resetPassword() {
        this.errorMsg = '';

        if (!this.correo || !this.nuevaContrasena || !this.confirmarContrasena) {
            this.errorMsg = 'Completa todos los campos';
            return;
        }

        if (this.nuevaContrasena !== this.confirmarContrasena) {
            this.errorMsg = 'Las contraseñas no coinciden';
            return;
        }

        if (this.nuevaContrasena.length < 6) {
            this.errorMsg = 'La contraseña debe tener mínimo 6 caracteres';
            return;
        }

        this.loading = true;
        try {
            const actualizado = await this.authService.resetPassword(
                this.correo,
                this.nuevaContrasena
            );

            if (!actualizado) {
                this.errorMsg = 'No existe una cuenta con ese correo';
                return;
            }

            await this.showAlert('Éxito', 'Contraseña actualizada correctamente');
            this.router.navigate(['/login']);
        } catch (error: any) {
            this.errorMsg = error.message || 'Error al actualizar contraseña';
        } finally {
            this.loading = false;
        }
    }

    private async showAlert(header: string, message: string) {
        const alert = await this.alertController.create({
            header,
            message,
            buttons: ['OK'],
        });
        await alert.present();
    }
    goToLogin() {
        this.router.navigate(['/login']);
    }

}

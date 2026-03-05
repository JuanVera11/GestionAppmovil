import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class LoginPage {
  email: string = '';
  password: string = '';
  loading = false;
  errorMsg = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async onLogin() {
    console.log('🔑 Login attempt:', { email: this.email, password: this.password });
    
    if (!this.email || !this.password) {
      this.errorMsg = 'Completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    try {
      const user = await this.authService.login(this.email, this.password);
      console.log('Login result:', user);
      
      if (user) {
        console.log('Redirect dashboard');
        this.router.navigate(['/dashboard']);
      } else {
        console.log('No user found');
        this.errorMsg = 'Credenciales incorrectas';
      }
    } catch (error) {
      console.error('Login ERROR:', error);
      this.errorMsg = 'Error de base de datos';
    } finally {
      this.loading = false;
    }
  }
  goToForgotPassword() {
  this.router.navigate(['/forgot-password']);
}

}

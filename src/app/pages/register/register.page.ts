import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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

  constructor() {}

  register() {
    if (this.fullName && this.email && this.pass && this.termsAccepted) {
      console.log('Register data:', {
        fullName: this.fullName,
        email: this.email,
        accountType: this.accountType
      });
    } else {
      console.log('Completa todos los campos');
    }
  }
}


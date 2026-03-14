import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { IonApp, IonIcon, IonRouterOutlet, Platform, AlertController } from '@ionic/angular/standalone';
import { NgIf, NgFor } from '@angular/common';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { Database } from './services/database';
import { addIcons } from 'ionicons';
import { pieChartOutline, cogOutline, newspaperOutline, gridOutline, swapVerticalOutline, pricetagsOutline, logOutOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { Page } from './models/page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [RouterModule, RouterLinkActive, NgIf, NgFor, IonApp, IonIcon, IonRouterOutlet]
})
export class AppComponent implements OnInit {

  sidebarExpanded = true;

  public appPages = [
    new Page('Dashboard', '/dashboard', 'grid-outline'),
    new Page('Categorías', '/categoria', 'pricetags-outline'),
    new Page('Configuraciones', '/configuracion', 'cog-outline'),
    new Page('Presupuesto', '/presupuesto', 'pie-chart-outline'),
    new Page('Reportes', '/reporte', 'newspaper-outline'),
  ];

  public isLoggedIn = false;
  public userName: string = 'Usuario';
  public userPhoto: string = 'assets/default-avatar.png';

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private database: Database,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({ pieChartOutline, cogOutline, newspaperOutline, gridOutline, swapVerticalOutline, pricetagsOutline, logOutOutline, chevronBackOutline, chevronForwardOutline });
  }

  async ngOnInit() {
    await this.platform.ready();
    await this.database.initializeDatabase();
    await this.loadUserData();
    await this.checkLoginStatus();

    this.router.events.subscribe(async () => {
      await this.loadUserData();
      this.checkLoginStatus();
    });
  }

  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  async loadUserData() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.userName = `${user.nombre} ${user.apellido}`;
      this.userPhoto = user.foto ?? 'assets/default-avatar.png';
    } else {
      this.userName = 'Usuario';
      this.userPhoto = 'assets/default-avatar.png';
    }
  }

  async checkLoginStatus(): Promise<void> {
    const userId = localStorage.getItem('userId');
    this.isLoggedIn = !!userId;
  }

  onNavClick() {
    if (window.innerWidth <= 768) {
      this.sidebarExpanded = false;
    }
  }

  async onLogout() {
    const alert = await this.alertController.create({
      header: '¿Cerrar sesión?',
      message: '¿Estás seguro de que deseas salir?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar Sesión',
          role: 'destructive',
          handler: async () => {
            await this.authService.logout();
            this.isLoggedIn = false;
            this.userName = 'Usuario';
            this.userPhoto = 'assets/default-avatar.png';
            this.router.navigate(['/welcome']);
          }
        }
      ]
    });
    await alert.present();
  }
}
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { 
  IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonMenuToggle, 
  IonItem, IonIcon, IonLabel, IonRouterOutlet, IonRouterLink, 
  IonAvatar, IonListHeader, IonNote, Platform, AlertController, IonButton 
} from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { Database } from './services/database';
import { addIcons } from 'ionicons';
import {
  pieChartOutline,
  cogOutline,
  newspaperOutline,
  gridOutline,
  pricetagsOutline,
  logOutOutline,
  menuOutline,
  chevronBackOutline
} from 'ionicons/icons';
import { Page } from './models/page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    RouterModule,
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonList,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterLink,
    IonRouterOutlet,
    IonAvatar,
    IonListHeader,
    IonNote,
    IonButton
  ],
})
export class AppComponent implements OnInit {
  public appPages = [
    new Page('Dashboard', '/dashboard', 'grid-outline'),
    new Page('Categorías', '/categoria', 'pricetags-outline'),
    new Page('Presupuesto', '/presupuesto', 'pie-chart-outline'),
    new Page('Reportes', '/reporte', 'newspaper-outline'),
    new Page('Configuración', '/configuracion', 'cog-outline'),
  ];

  public isLoggedIn = false;
  public isMenuVisible = true; // Variable para controlar la visibilidad de la barra
  public isWeb: boolean = false;
  public userName: string = 'Usuario';
  public userPhoto: string = 'assets/default-avatar.png';
  private sqlite = new SQLiteConnection(CapacitorSQLite);

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private database: Database,
    private router: Router,
    private alertController: AlertController
  ) {
    // Registro de todos los iconos necesarios
    addIcons({
      'grid-outline': gridOutline,
      'pricetags-outline': pricetagsOutline,
      'pie-chart-outline': pieChartOutline,
      'newspaper-outline': newspaperOutline,
      'cog-outline': cogOutline,
      'log-out-outline': logOutOutline,
      'menu-outline': menuOutline,
      'chevron-back-outline': chevronBackOutline
    });
  }

  async ngOnInit() {
    await this.platform.ready();
    await this.database.initializeDatabase();
    await this.loadUserData();
    await this.checkLoginStatus();

    this.router.events.subscribe(async() => {
      await this.loadUserData();
      this.checkLoginStatus();
    });
  }

  // Método para ocultar/mostrar la barra lateral
  toggleMenu() {
    this.isMenuVisible = !this.isMenuVisible;
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

  onPageClick(url: string) {
    this.router.navigateByUrl(url);
  }

  async onLogout() {
    const alert = await this.alertController.create({
      header: '¿Cerrar sesión?',
      message: '¿Estás seguro de que deseas salir?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
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
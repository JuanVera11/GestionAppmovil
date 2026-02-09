import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import {
  IonApp, IonSplitPane, IonMenu, IonContent, IonList,
  IonMenuToggle, IonItem, IonIcon, IonLabel,
  IonRouterOutlet, IonRouterLink, IonAvatar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  pieChartOutline,
  cogOutline,
  analyticsOutline,
  newspaperOutline,
  gridOutline,
  pricetagsOutline,
  logInOutline,
  personAddOutline
} from 'ionicons/icons';
import { Page } from './models/page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    RouterModule, RouterLink, RouterLinkActive, IonApp, IonSplitPane,
    IonMenu, IonContent, IonList, IonMenuToggle,
    IonItem, IonIcon, IonLabel, IonRouterLink,
    IonRouterOutlet, IonAvatar
  ],
})
export class AppComponent {
  public appPages = [
    new Page('Login','/login', 'log-in-outline'),
    new Page('Register','/register', 'person-add-outline'),
    new Page('Dashboard', '/dashboard', 'grid-outline'),
    new Page('Categorías', '/categoria', 'pricetags-outline'),
    new Page('Presupuesto', '/presupuesto', 'pie-chart-outline'),
    new Page('Reportes', '/reporte', 'newspaper-outline'),
    new Page('Configuracion', '/configuracion', 'cog-outline'),
  ];

  constructor() {
    addIcons({
      'log-in-outline': logInOutline,
      'person-add-outline': personAddOutline,
      'grid-outline': gridOutline,
      'pricetags-outline': pricetagsOutline,
      'pie-chart-outline': pieChartOutline,
      'newspaper-outline': newspaperOutline,
      'cog-outline': cogOutline,
      'analytics-outline': analyticsOutline,
    });
  }

  onPageClick(url: string) {
    window.location.href = url;
  }
}

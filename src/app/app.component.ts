import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { 
  IonApp, 
  IonSplitPane, 
  IonMenu, 
  IonContent, 
  IonList, 
  IonMenuToggle, 
  IonItem, 
  IonIcon, 
  IonLabel, 
  IonRouterOutlet, 
  IonRouterLink,
  IonAvatar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  pieChartOutline, 
  cogOutline, 
  analyticsOutline, 
  newspaperOutline, 
  gridOutline, 
  pricetagsOutline 
} from 'ionicons/icons';
import { Page } from './models/page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
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
    IonAvatar
  ],
})
export class AppComponent {
  public appPages = [
    new Page('Dashboard', 'dashboard', 'grid-outline'),
    new Page('Categorías', 'categoria', 'pricetags-outline'),
    new Page('Presupuesto', 'presupuesto', 'pie-chart-outline'),
    new Page('Reportes', 'reporte', 'newspaper-outline'),
    new Page('Ajustes', 'ajustes', 'cog-outline'),
  ];

  constructor() {
    addIcons({ 
      'grid-outline': gridOutline,
      'pricetags-outline': pricetagsOutline,
      'pie-chart-outline': pieChartOutline, 
      'newspaper-outline': newspaperOutline,
      'cog-outline': cogOutline, 
      'analytics-outline': analyticsOutline, 
     
    });
  }
}
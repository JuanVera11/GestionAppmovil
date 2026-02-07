import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonRouterLink } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, pieChartOutline, paperPlane, cogOutline, analyticsOutline, trash, newspaperOutline } from 'ionicons/icons';
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
    IonListHeader,
    IonNote,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterLink,
    IonRouterOutlet
  ],
})
export class AppComponent {
  public appPages = [
    new Page('Home', '/folder/home', 'home'),
    new Page('Presupuesto', '/folder/budget', 'pie-chart-outline'),
    new Page('Reportes', '/folder/news', 'newspaper-outline'),
    new Page('Ajustes', '/folder/settings', 'cog-outline'),
    new Page('Dashboard', '/folder/dashboard', 'analytics-outline'),

  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  
  constructor() {
    addIcons({ 
      'home': home, 
      'pie-chart-outline': pieChartOutline, 
      'newspaper-outline': newspaperOutline,
      'cog-outline': cogOutline, 
      'analytics-outline': analyticsOutline, 
    });
  }
}
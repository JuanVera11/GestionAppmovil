import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite } from '@capacitor-community/sqlite';
import { defineCustomElements as defineJeepSqliteCustomElements } from 'jeep-sqlite/loader';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

const initializeWebSQLite = async (): Promise<void> => {
  if (Capacitor.getPlatform() !== 'web') {
    return;
  }

  if (!customElements.get('jeep-sqlite')) {
    defineJeepSqliteCustomElements(window, {
      resourcesUrl: '/assets/jeep-sqlite/',
    });
  }

  let jeepSqliteElement = document.querySelector('jeep-sqlite') as (HTMLElement & {
    componentOnReady?: () => Promise<unknown>;
  }) | null;

  if (!jeepSqliteElement) {
    const element = document.createElement('jeep-sqlite');
    element.setAttribute('autoSave', 'true');
    element.setAttribute('wasmPath', '/assets');
    document.body.appendChild(element);
    jeepSqliteElement = document.querySelector('jeep-sqlite') as (HTMLElement & {
      componentOnReady?: () => Promise<unknown>;
    }) | null;
  } else {
    jeepSqliteElement.setAttribute('wasmPath', '/assets');
  }

  await customElements.whenDefined('jeep-sqlite');

  if (jeepSqliteElement?.componentOnReady) {
    await jeepSqliteElement.componentOnReady();
  }

  await CapacitorSQLite.initWebStore();
};

const bootstrap = async (): Promise<void> => {
  await initializeWebSQLite();

  await bootstrapApplication(AppComponent, {
    providers: [
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
      provideIonicAngular(),
      provideRouter(routes, withPreloading(PreloadAllModules)),
    ],
  });
};

bootstrap().catch((error: unknown) => {
  console.error('Error al inicializar la aplicación', error);
});
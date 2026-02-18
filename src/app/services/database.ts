import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import {
  // Objeto principal del plugin SQLite de Capacitor.
  CapacitorSQLite,
  // Clase que gestiona conexiones SQLite a nivel global.
  SQLiteConnection,
  // Tipo de una conexión concreta abierta hacia una base de datos.
  SQLiteDBConnection,
  // Tipo de retorno para operaciones que modifican datos (INSERT, UPDATE, DELETE).
  capSQLiteChanges,
  // Tipo de retorno para consultas que devuelven filas (SELECT).
  capSQLiteValues,
} from '@capacitor-community/sqlite';

// Define los tipos de valor permitidos al enviar parámetros SQL.
type SqlValue = string | number | null;

@Injectable({
  providedIn: 'root',
})
export class Database {
  
}

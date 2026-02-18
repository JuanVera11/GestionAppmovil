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

export interface CategoriaRecord{
  id: number;
  nombre:string;
  valorAsginrado:number;
  valorGasto:number;
}

export interface UsuarioRecord{
  id: number;
  nombre:string;
  apellido:string;
  contraseña:string
}

export interface TransaccionRecord{
  id:number;
  monto:number;
  tipo: 'ingreso'| 'gasto';
  categoria: string;
  fecha: string;
  descripcion:string;
  idUsuario:number;
}

export interface PresupuestoRecord{
  id:number;
  monto: number;
  ingreso: number;
  gasto: number;
  mes: string;
  ano: number;
  estado: string;
  idUsuarioFk: number;
}


  

@Injectable({
  providedIn: 'root',
})
export class Database {
  
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, firstValueFrom } from 'rxjs';

export interface UsuarioRecord {
  id?: number;
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
}

export interface CategoriaRecord {
  id: number;
  nombre: string;
  valorAsignado: number;
  valorGasto: number;
}

export interface TransaccionRecord {
  id?: number;
  monto: number;
  tipo: 'ingreso' | 'gasto';
  categoria: string;
  fecha: string;
  descripcion: string;
  idUsuario: number;
}

@Injectable({ providedIn: 'root' })
export class Database {
  private db: any = null;
  private SQL: any = null;
  private readonly dbKey = 'control_financiero_db';
  private readonly ready$ = new BehaviorSubject<boolean>(false);

  readonly defaultCategories: ReadonlyArray<string> = [
    'Ahorro', 'Gastos Hormiga', 'Alimentación', 'Transporte', 'Salud',
  ];

  async initializeDatabase(): Promise<void> {
    if (this.ready$.value) return;

    try {
      // Carga dinámica de la librería sql.js
      const mod = await import('sql.js');
      const initSqlJs = (mod as any).default ?? (mod as any);
      
      this.SQL = await initSqlJs({
        locateFile: (file: string) => `/assets/${file}`
      });

      // Recuperación de datos existentes en el almacenamiento local
      const saved = localStorage.getItem(this.dbKey);
      if (saved) {
        const binary = atob(saved);
        const buf = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          buf[i] = binary.charCodeAt(i);
        }
        this.db = new this.SQL.Database(buf);
      } else {
        this.db = new this.SQL.Database();
      }

      await this.createSchema();
      await this.seedBaseData();
      this.save();
      this.ready$.next(true);
    } catch (error) {
      console.error('Error DB Init:', error);
      throw error;
    }
  }

  // Serializa y persiste la base de datos en localStorage
  private save(): void {
    if (!this.db) return;
    try {
      const data = this.db.export();
      const binary = Array.from(data, (byte: any) => String.fromCharCode(byte)).join('');
      localStorage.setItem(this.dbKey, btoa(binary));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  isReady(): Observable<boolean> {
    return this.ready$.asObservable();
  }

  // Bloquea la ejecución hasta que la base de datos esté inicializada
  async waitForReady(): Promise<void> {
    if (this.ready$.value) return;
    await firstValueFrom(this.ready$.pipe(filter(r => r === true)));
  }

  // Ejecuta comandos de escritura y retorna el ID generado
  run(sql: string, values: any[] = []): any {
    try {
      const stmt = this.db.prepare(sql);
      stmt.run(values);
      stmt.free();
      this.save();
      const res = this.db.exec('SELECT last_insert_rowid();');
      return res[0].values[0][0];
    } catch (e) {
      console.error('Run error:', e);
      throw e;
    }
  }

  // Ejecuta consultas de lectura y formatea el resultado como array de objetos
  query(sql: string, values: any[] = []): any[] {
    try {
      const result = this.db.exec(sql, values);
      if (!result || result.length === 0) return [];
      const columns = result[0].columns;
      return result[0].values.map((row: any[]) => {
        const obj: any = {};
        columns.forEach((col: string, i: number) => obj[col] = row[i]);
        return obj;
      });
    } catch (e) {
      return [];
    }
  }

  async createUsuario(input: UsuarioRecord): Promise<number> {
    return this.run(
      'INSERT INTO usuarios (nombre, apellido, correo, contrasena) VALUES (?, ?, ?, ?);',
      [input.nombre.trim(), input.apellido.trim(), input.correo.trim(), input.contrasena.trim()]
    );
  }

  async loginUsuario(correo: string, contrasena: string): Promise<UsuarioRecord | null> {
    const result = this.query(
      'SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?;',
      [correo.trim(), contrasena.trim()]
    );
    return result.length > 0 ? result[0] as UsuarioRecord : null;
  }

  async getCategorias(): Promise<CategoriaRecord[]> {
    return this.query('SELECT * FROM categorias ORDER BY nombre ASC;');
  }

  async updateCategoria(input: CategoriaRecord): Promise<boolean> {
    this.run(
      'UPDATE categorias SET valorAsignado = ?, valorGasto = ? WHERE id = ?;',
      [input.valorAsignado, input.valorGasto, input.id]
    );
    return true;
  }

  async createTransaccion(input: TransaccionRecord): Promise<number> {
    return this.run(
      'INSERT INTO transacciones (monto, tipo, categoria, fecha, descripcion, idUsuario) VALUES (?, ?, ?, ?, ?, ?);',
      [input.monto, input.tipo, input.categoria, input.fecha, input.descripcion, input.idUsuario]
    );
  }

  async deleteTransaccion(id: number): Promise<boolean> {
    this.run('DELETE FROM transacciones WHERE id = ?;', [id]);
    return true;
  }

  // Definición de tablas iniciales
  private async createSchema(): Promise<void> {
    this.db.run('PRAGMA foreign_keys = ON;');
    this.db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        correo TEXT NOT NULL UNIQUE,
        contrasena TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        valorAsignado REAL DEFAULT 0,
        valorGasto REAL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS transacciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        monto REAL NOT NULL,
        tipo TEXT,
        categoria TEXT,
        fecha TEXT NOT NULL,
        descripcion TEXT,
        idUsuario INTEGER NOT NULL
      );
    `);
  }

  // Inserta categorías por defecto si la tabla está vacía
  private async seedBaseData(): Promise<void> {
    const res = this.query('SELECT COUNT(*) as total FROM categorias;');
    if (Number(res[0]?.total) > 0) return;

    for (const cat of this.defaultCategories) {
      this.run('INSERT INTO categorias (nombre, valorAsignado, valorGasto) VALUES (?, ?, ?);', [cat, 0, 0]);
    }
  }
}
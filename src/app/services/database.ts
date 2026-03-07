import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, firstValueFrom } from 'rxjs';

type SqlValue = string | number | null;

export interface UsuarioRecord {
  id: number;
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
  id: number;
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
      const mod = await import('sql.js');
      const initSqlJs = (mod as any).default ?? (mod as any);

      this.SQL = await initSqlJs({
        locateFile: () => '/assets/sql-wasm.wasm'
      });

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
      console.error('Error inicializando BD:', error);
      throw error;
    }
  }


  // Guarda la BD en localStorage
  private save(): void {
    if (!this.db) return;
    try {
      const data = this.db.export();
      let binary = '';
      for (let i = 0; i < data.length; i++) {
        binary += String.fromCharCode(data[i]);
      }
      const base64 = btoa(binary);
      localStorage.setItem(this.dbKey, base64);
    } catch (e) {
      console.warn('No se pudo guardar en localStorage:', e);
    }
  }


  isReady(): Observable<boolean> {
    return this.ready$.asObservable();
  }

  async waitForReady(): Promise<void> {
    if (this.ready$.value) return;
    await firstValueFrom(this.ready$.pipe(filter(r => r === true)));
  }

  // Ejecuta SQL sin retorno
  run(sql: string, values: any[] = []): any {
    const stmt = this.db.prepare(sql);
    stmt.bind(values);
    stmt.step();
    stmt.free();
    this.save();
    // Obtener el último id insertado
    const idResult = this.db.exec('SELECT last_insert_rowid() as id;');
    return idResult[0]?.values[0][0] ?? 0;
  }

  // Ejecuta SELECT y retorna filas como array de objetos
  query(sql: string, values: any[] = []): any[] {
    try {
      const result = this.db.exec(sql, values);
      if (!result || result.length === 0) return [];
      const columns = result[0].columns;
      return result[0].values.map((row: any[]) => {
        const obj: any = {};
        columns.forEach((col: string, i: number) => {
          obj[col] = row[i];
        });
        return obj;
      });
    } catch (e) {
      console.warn('Query error:', e);
      return [];
    }
  }


  // ─── USUARIOS ────────────────────────────────────────────

  async createUsuario(input: UsuarioRecord): Promise<number> {
    const nombre = (input.nombre ?? '').trim();
    const apellido = (input.apellido ?? '').trim();
    if (!nombre) throw new Error('El nombre es obligatorio');

    this.db.run(
      'INSERT INTO usuarios (nombre, apellido, correo, contrasena) VALUES (?, ?, ?, ?);',
      [nombre, apellido, input.correo.trim(), input.contrasena.trim()]
    );

    const result = this.query(
      'SELECT id FROM usuarios WHERE correo = ?;',
      [input.correo.trim()]
    );
    const id = result[0]?.id ?? 0;
    this.save();
    console.log('Usuario creado con id:', id);
    return Number(id);
  }

  async updateContrasena(correo: string, nuevaContrasena: string): Promise<boolean> {
    const result = this.query('SELECT id FROM usuarios WHERE correo = ?;', [correo.trim()]);
    if (result.length === 0) return false;
    this.db.run(
      'UPDATE usuarios SET contrasena = ? WHERE correo = ?;',
      [nuevaContrasena.trim(), correo.trim()]
    );
    this.save();
    return true;
  }




  async getUsuarios(): Promise<UsuarioRecord[]> {
    return this.query('SELECT * FROM usuarios ORDER BY nombre ASC;') as UsuarioRecord[];
  }

  async loginUsuario(correo: string, contrasena: string): Promise<UsuarioRecord | null> {
    const result = this.query(
      'SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?;',
      [correo.trim(), contrasena.trim()]
    );
    return result.length > 0 ? result[0] as UsuarioRecord : null;
  }

  // ─── CATEGORÍAS ──────────────────────────────────────────

  async getCategorias(): Promise<CategoriaRecord[]> {
    return this.query('SELECT * FROM categorias ORDER BY nombre ASC;') as CategoriaRecord[];
  }

  async updateCategoria(input: CategoriaRecord): Promise<boolean> {
    this.run(
      'UPDATE categorias SET valorAsignado = ?, valorGasto = ? WHERE id = ?;',
      [input.valorAsignado, input.valorGasto, input.id]
    );
    return true;
  }

  // ─── TRANSACCIONES ───────────────────────────────────────

  async createTransaccion(input: TransaccionRecord): Promise<number> {
    this.run(
      'INSERT INTO transacciones (monto, tipo, categoria, fecha, descripcion, idUsuario) VALUES (?, ?, ?, ?, ?, ?);',
      [input.monto, input.tipo, input.categoria, input.fecha, input.descripcion, input.idUsuario]
    );
    const result = this.query('SELECT last_insert_rowid() as id;');
    return Number(result[0]?.id ?? 0);
  }

  async deleteTransaccion(id: number): Promise<boolean> {
    this.run('DELETE FROM transacciones WHERE id = ?;', [id]);
    return true;
  }

  // ─── SCHEMA ──────────────────────────────────────────────

  private async createSchema(): Promise<void> {
    this.db.run('PRAGMA foreign_keys = ON;');

    this.db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      correo TEXT NOT NULL UNIQUE,
      contrasena TEXT NOT NULL,
      foto TEXT DEFAULT NULL
    );`);

    this.db.run(`CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      valorAsignado REAL DEFAULT 0,
      valorGasto REAL DEFAULT 0
    );`);

    this.db.run(`CREATE TABLE IF NOT EXISTS presupuestos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      monto REAL NOT NULL,
      ingreso REAL DEFAULT 0,
      gasto REAL DEFAULT 0,
      mes TEXT NOT NULL,
      ano INTEGER NOT NULL,
      estado TEXT,
      idUsuarioFk INTEGER NOT NULL
    );`);

    this.db.run(`CREATE TABLE IF NOT EXISTS transacciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      monto REAL NOT NULL,
      tipo TEXT,
      categoria TEXT,
      fecha TEXT NOT NULL,
      descripcion TEXT,
      idUsuario INTEGER NOT NULL
    );`);
    try {
      this.db.run('ALTER TABLE usuarios ADD COLUMN foto TEXT DEFAULT NULL;');
    } catch (e) { }
  }

  private async seedBaseData(): Promise<void> {
    const result = this.query('SELECT COUNT(*) as total FROM categorias;');
    if (Number(result[0]?.total) > 0) return;

    for (const cat of this.defaultCategories) {
      this.db.run(
        'INSERT INTO categorias (nombre, valorAsignado, valorGasto) VALUES (?, ?, ?);',
        [cat, 0, 0]
      );
    }
    console.log('✅ Categorías base creadas');
  }
}

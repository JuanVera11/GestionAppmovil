import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, firstValueFrom } from 'rxjs';

export interface UsuarioRecord {
  id?: number;
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  foto?: string;
}

export interface CategoriaRecord {
  id: number;
  nombre: string;
  valorAsignado: number;
  valorGasto: number;
  idUsuario?: number;
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

  readonly defaultCategories: ReadonlyArray<string> = [];

  async initializeDatabase(): Promise<void> {
    if (this.ready$.value) return;
    try {
      // @ts-ignore
      const initSqlJs = window.initSqlJs;
      if (!initSqlJs) {
        throw new Error('initSqlJs no está disponible globalmente. Falta sql-wasm.js en scripts.');
      }
      this.SQL = await initSqlJs({
        locateFile: () => 'assets/sql-wasm.wasm'
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
      console.log('Base de datos lista');
    } catch (error) {
      console.error('Error inicializando BD:', error);
      throw error;
    }
  }

  private save(): void {
    if (!this.db) return;
    try {
      const data = this.db.export();
      let binary = '';
      for (let i = 0; i < data.length; i++) binary += String.fromCharCode(data[i]);
      localStorage.setItem(this.dbKey, btoa(binary));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  isReady(): Observable<boolean> {
    return this.ready$.asObservable();
  }

  async waitForReady(): Promise<void> {
    if (this.ready$.value) return;
    await firstValueFrom(this.ready$.pipe(filter(r => r === true)));
  }

  run(sql: string, values: any[] = []): any {
    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(values);
      stmt.step();
      stmt.free();
      this.save();
      const res = this.db.exec('SELECT last_insert_rowid();');
      return res[0].values[0][0];
    } catch (e) {
      console.error('Run error:', e);
      throw e;
    }
  }

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

  async createUsuario(input: UsuarioRecord): Promise<number> {
    const nombre = (input.nombre ?? '').trim();
    const apellido = (input.apellido ?? '').trim();
    if (!nombre) throw new Error('El nombre es obligatorio');
    const newId = this.run(
      'INSERT INTO usuarios (nombre, apellido, correo, contrasena) VALUES (?, ?, ?, ?);',
      [nombre, apellido, input.correo.trim(), input.contrasena.trim()]
    );

    // Seed base categories for this new user
    const defaultCats = ['Comida', 'Transporte', 'Servicios', 'Recreación', 'Otros'];
    for (const cat of defaultCats) {
      this.run(
        'INSERT INTO categorias (nombre, valorAsignado, valorGasto, idUsuario) VALUES (?, 0, 0, ?);',
        [cat, newId]
      );
    }
    
    return newId;
  }

  async updateContrasena(correo: string, nuevaContrasena: string): Promise<boolean> {
    const result = this.query('SELECT id FROM usuarios WHERE correo = ?;', [correo.trim()]);
    if (result.length === 0) return false;
    this.run(
      'UPDATE usuarios SET contrasena = ? WHERE correo = ?;',
      [nuevaContrasena.trim(), correo.trim()]
    );
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

  async getCategorias(idUsuario: number): Promise<CategoriaRecord[]> {
  return this.query(
    'SELECT * FROM categorias WHERE idUsuario = ? ORDER BY nombre ASC;',
    [idUsuario]
  );
}

async updateCategoria(input: CategoriaRecord): Promise<boolean> {
  this.run(
    'UPDATE categorias SET valorAsignado = ?, valorGasto = ? WHERE id = ? AND idUsuario = ?;',
    [input.valorAsignado, input.valorGasto, input.id, input.idUsuario]
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

  async getPresupuestos(idUsuario: number): Promise<any[]> {
  return this.query(
    'SELECT * FROM presupuestos WHERE idUsuarioFk = ? ORDER BY ano DESC, mes DESC;',
    [idUsuario]
  );
}

async createPresupuesto(monto: number, mes: string, ano: number, idUsuario: number): Promise<number> {
  return this.run(
    'INSERT INTO presupuestos (monto, ingreso, gasto, mes, ano, estado, idUsuarioFk) VALUES (?, 0, 0, ?, ?, "activo", ?);',
    [monto, mes, ano, idUsuario]
  );
}

async deletePresupuesto(id: number, idUsuario: number): Promise<void> {
  this.run('DELETE FROM presupuestos WHERE id = ? AND idUsuarioFk = ?;', [id, idUsuario]);
}

async updateCategoriaAsignado(id: number, valorAsignado: number, idUsuario: number): Promise<void> {
  this.run(
    'UPDATE categorias SET valorAsignado = ? WHERE id = ? AND idUsuario = ?;',
    [valorAsignado, id, idUsuario]
  );
}


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
  nombre TEXT NOT NULL,
  valorAsignado REAL DEFAULT 0,
  valorGasto REAL DEFAULT 0,
  idUsuario INTEGER DEFAULT NULL
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
    try {
  this.db.run('ALTER TABLE categorias ADD COLUMN idUsuario INTEGER DEFAULT NULL;');
} catch (e) {}

  }
  

  private async seedBaseData(): Promise<void> {

  }

  async generarDatosPrueba(idUsuario: number): Promise<void> {
    const now = new Date();
    const nombreMes = now.toLocaleString('es-CO', { month: 'long' });
    const ano = now.getFullYear();

    // 1. Crear presupuesto de prueba si no existe
    const presupuestos = await this.getPresupuestos(idUsuario);
    if (presupuestos.length === 0) {
      await this.createPresupuesto(5000000, nombreMes, ano, idUsuario);
    }

    // 2. Crear categorías si no existen
    const catNombres = ['Comida', 'Transporte', 'Educación', 'Ropa', 'Viajes', 'Gastos Hormiga'];
    const categorias = await this.getCategorias(idUsuario);
    for (const cn of catNombres) {
      if (!categorias.find(c => c.nombre === cn)) {
        this.run(
          'INSERT INTO categorias (nombre, valorAsignado, valorGasto, idUsuario) VALUES (?, 0, 0, ?);',
          [cn, idUsuario]
        );
      }
    }

    // 3. Crear Ingreso inicial
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - 10);
    await this.createTransaccion({
      monto: 6000000,
      tipo: 'ingreso',
      categoria: 'Salario',
      fecha: pastDate.toISOString().substring(0, 10),
      descripcion: 'Pago quincena',
      idUsuario: idUsuario
    });

    // 4. Crear Gastos de prueba simulando actividad
    const gastosSimulados = [
      { monto: 850000, desc: 'Mercado mensual', cat: 'Comida', diasAtras: 5 },
      { monto: 320000, desc: 'Gasolina e indrive', cat: 'Transporte', diasAtras: 4 },
      { monto: 1100000, desc: 'Universidad', cat: 'Educación', diasAtras: 6 },
      { monto: 450000, desc: 'Zapatos nuevos', cat: 'Ropa', diasAtras: 2 },
      { monto: 200000, desc: 'Fin de semana', cat: 'Viajes', diasAtras: 8 },
      { monto: 150000, desc: 'Cafés y snacks', cat: 'Gastos Hormiga', diasAtras: 1 },
      { monto: 250000, desc: 'Cena con amigos', cat: 'Comida', diasAtras: 0 }
    ];

    for (const g of gastosSimulados) {
      const d = new Date();
      d.setDate(now.getDate() - g.diasAtras);
      await this.createTransaccion({
        monto: g.monto,
        tipo: 'gasto',
        categoria: g.cat,
        fecha: d.toISOString().substring(0, 10),
        descripcion: g.desc,
        idUsuario: idUsuario
      });
    }

    console.log('Datos de prueba generados para usuario:', idUsuario);
  }
}
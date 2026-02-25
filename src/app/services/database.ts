// Importa el decorador Injectable para registrar este servicio en el sistema de inyección de Angular.
import { Injectable } from '@angular/core';
// Importa BehaviorSubject para manejar estado reactivo y Observable para exponerlo de forma segura.
import { BehaviorSubject, Observable } from 'rxjs';
// Importa Capacitor para detectar en qué plataforma corre la app (web, android, ios).
import { Capacitor } from '@capacitor/core';
// Importa las clases y tipos necesarios del plugin SQLite para crear y operar la base de datos.
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

export interface UsuarioRecord {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
}

export interface PresupuestoRecord {
  id: number;
  monto: number;
  ingreso: number;
  gasto: number;
  mes: string;
  ano: number;
  estado: string;
  idUsuarioFk: number;
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

export interface CategoriaRecord {
  id: number;
  nombre: string;
  // Monto planeado para la categoría
  valorAsignado: number; 
   // Monto real ( dinero que se gasta en x cosa)
  valorGasto: number;   
}

export interface ReporteFinancieroRecord{
  // Representa el monto total planeado para el mes (ej. $2,000,000). 
  // Se obtiene del campo 'monto' de la tabla 'presupuestos'.
   presupuestoTotal:number;

  // Monto restante tras restar los gastos ejecutados al presupuesto total.
  // Es clave para que no exceda su capacidad financiera mensual
   totalDisponible:number;

  // Valor numérico que alimenta la gráfica circular de progreso (ej. 61% Reportes Actual).
  // Indica qué tan cerca está el usuario de consumir su presupuesto asignado
   porcentajeUso: number;

   gastosPorCategoria:{
  // Nombre de la categoría (ej. 'Gastos Hormiga', 'Comida', 'Transporte')
     categoria:string;

  // Sumatoria de todos los montos de transacciones tipo 'gasto' vinculadas a esta categoría.
     monto:number;
   }[]
}

// Declara este servicio como inyectable y disponible globalmente en toda la aplicación.
@Injectable({
  // Indica que Angular creará una sola instancia compartida del servicio.
  providedIn: 'root',
})
// Define la clase del servicio que centraliza el acceso a SQLite.
export class Database {
  // Nombre físico del archivo de base de datos.
  private readonly dbName = 'control_financiero_db';
  // Versión del esquema de base de datos.
  private readonly dbVersion = 1;
  // Instancia administradora de conexiones SQLite.
  private readonly sqlite = new SQLiteConnection(CapacitorSQLite);
  // Referencia a la conexión activa; empieza en null hasta inicializarse.
  private db: SQLiteDBConnection | null = null;
  // Promesa de inicialización en curso para evitar ejecuciones concurrentes.
  private initializingPromise: Promise<void> | null = null;
  // Estado reactivo de disponibilidad de la base de datos.
  private readonly ready$ = new BehaviorSubject<boolean>(false);

  // Lista base de categorías que se insertan automáticamente si la tabla está vacía.
  readonly defaultCategories: ReadonlyArray<string> = [
    'Ahorro',
    'Gastos Hormiga',
    'Alimentación',
    'Transporte',
    'Salud'
  ];

  // Inicializa la base de datos, abre conexión, crea esquema y siembra datos iniciales.
  async initializeDatabase(): Promise<void> {
    // Evita inicializar dos veces si ya está lista y existe conexión activa.
    if (this.ready$.value && this.db) {
      // Sale inmediatamente cuando ya existe una conexión funcional.
      return;
    }

    // Si ya hay una inicialización en curso, espera su resultado para evitar conflictos.
    if (this.initializingPromise) {
      // Reutiliza la misma promesa en lugar de abrir otra inicialización paralela.
      await this.initializingPromise;
      // Sale al completar la inicialización existente.
      return;
    }

    // Crea y registra la promesa de inicialización para serializar accesos concurrentes.
    this.initializingPromise = this.initializeDatabaseInternal();

    try {
      // Espera a que termine la inicialización real.
      await this.initializingPromise;
    } finally {
      // Limpia la referencia de bloqueo para permitir futuras inicializaciones si hicieran falta.
      this.initializingPromise = null;
    }
  }

  // Ejecuta el flujo real de inicialización de la base de datos.
  private async initializeDatabaseInternal(): Promise<void> {
    // Si durante la espera ya quedó lista, evita trabajo duplicado.
    if (this.ready$.value && this.db) {
      // Sale porque no es necesario repetir inicialización.
      return;
    }

    // En web asegura que el store de jeep-sqlite esté abierto antes de operar.
    if (Capacitor.getPlatform() === 'web') {
      await CapacitorSQLite.initWebStore();
    }

    // Verifica consistencia interna de conexiones administradas por el plugin.
    const consistency = await this.sqlite.checkConnectionsConsistency();
    // Comprueba si ya existe una conexión registrada con este nombre.
    const isConn = await this.sqlite.isConnection(this.dbName, false);

    // Si la conexión existe y está consistente, la recupera.
    if (consistency.result && isConn.result) {
      // Reutiliza conexión previamente creada para evitar duplicados.
      this.db = await this.sqlite.retrieveConnection(this.dbName, false);
    } else {
      // Si no existe, crea una conexión nueva con los parámetros definidos.
      this.db = await this.sqlite.createConnection(
        this.dbName,
        false,
        'no-encryption',
        this.dbVersion,
        false,
      );
    }

    // Abre la conexión a la base de datos.
    try {
      // Intenta abrir normalmente la base de datos.
      await this.db.open();
    } catch (error) {
      // En web, si la base local quedó inconsistente, intenta recuperar creando una base limpia.
      if (Capacitor.getPlatform() === 'web') {
        // Muestra información de diagnóstico en consola para facilitar soporte.
        console.warn('No se pudo abrir la base web; se intentará recrearla.', error);
        // Cierra la conexión actual si existe para liberar recursos antes de borrar.
        await this.sqlite.closeConnection(this.dbName, false).catch(() => undefined);
        // Borra la base local del store web para eliminar estado corrupto.
        await CapacitorSQLite.deleteDatabase({
          database: this.dbName,
          readonly: false,
        }).catch(() => undefined);
        // Crea una nueva conexión limpia con la misma configuración.
        this.db = await this.sqlite.createConnection(
          this.dbName,
          false,
          'no-encryption',
          this.dbVersion,
          false,
        );
        // Abre nuevamente la conexión ya recreada.
        await this.db.open();
      } else {
        // En plataformas nativas, propaga el error original para no ocultar fallos reales.
        throw error;
      }
    }
    // Crea las tablas y relaciones necesarias si aún no existen.
    await this.createSchema();
    // Inserta datos base si la base está vacía.
    await this.seedBaseData();

    // Si la app corre en navegador, persiste el estado en el almacenamiento web del plugin.
    // Persiste cambios en web de forma segura.
    await this.persistWebStore();

    // Marca el servicio como listo para usarse desde otras capas de la app.
    this.ready$.next(true);
  }

  // Expone un observable para que otros componentes sepan cuándo la base está lista.
  isReady(): Observable<boolean> {
    // Devuelve la versión observable del BehaviorSubject sin permitir mutaciones externas.
    return this.ready$.asObservable();
  }

  // Cierra la conexión activa y restablece el estado interno del servicio.
  async closeConnection(): Promise<void> {
    // Si no hay conexión activa, no hay nada por cerrar.
    if (!this.db) {
      // Sale sin hacer trabajo adicional.
      return;
    }

    // Cierra la conexión registrada por nombre.
    await this.sqlite.closeConnection(this.dbName, false);
    // Elimina la referencia local para evitar uso accidental.
    this.db = null;
    // Notifica que la base ya no está disponible.
    this.ready$.next(false);
  }

  // Ejecuta una sentencia SQL de escritura con parámetros opcionales.
  async run(sql: string, values: SqlValue[] = []): Promise<capSQLiteChanges> {
    // Garantiza obtener una conexión abierta antes de ejecutar.
    const database = await this.getOpenedConnection();
    // Ejecuta la sentencia SQL y captura el resultado de cambios.
    const result = await database.run(sql, values);

    // En web, sincroniza cambios al almacenamiento persistente.
    // Persiste cambios en web de forma segura.
    await this.persistWebStore();

    // Retorna el detalle de filas afectadas e id insertado.
    return result;
  }

  // Ejecuta una consulta SQL de lectura con parámetros opcionales.
  async query(sql: string, values: SqlValue[] = []): Promise<capSQLiteValues> {
    // Garantiza una conexión abierta antes de consultar.
    const database = await this.getOpenedConnection();
    // Devuelve el resultado de la consulta.
    return database.query(sql, values);
  }

  // --- MÉTODOS CRUD BASADOS EN LA LÓGICA DE RECETAS ---

  // Obtiene todos los usuarios ordenados alfabéticamente por nombre.
  async getUsuarios(): Promise<UsuarioRecord[]> {
    // Ejecuta SELECT de la tabla usuarios.
    const result = await this.query(
      'SELECT id, nombre, apellido, correo, contrasena FROM usuarios ORDER BY nombre ASC;',
    );
    // Retorna arreglo tipado de usuarios.
    return (result.values ?? []) as UsuarioRecord[];
  }

  // Crea un usuario nuevo en la base de datos y retorna su id generado.
  async createUsuario(input: UsuarioRecord): Promise<number> {
    // Normaliza el nombre y valida que exista contenido mínimo.
    const nombre = (input.nombre ?? '').trim();
    // Si el nombre es vacío, lanza error de validación.
    if (!nombre) {
      throw new Error('El nombre es obligatorio');
    }

    // Inserta el registro usando parámetros para evitar interpolación manual.
    const result = await this.run(
      'INSERT INTO usuarios (nombre, apellido, correo, contrasena) VALUES (?, ?, ?, ?);',
      [nombre, input.apellido.trim(), input.correo.trim(), input.contrasena.trim()],
    );

    // Obtiene el id insertado si existe, en otro caso retorna 0.
    return Number(result.changes?.lastId ?? 0);
  }

  // Obtiene todas las categorías ordenadas alfabéticamente.
  async getCategorias(): Promise<CategoriaRecord[]> {
    // Ejecuta SELECT de categorías solicitando columnas relevantes.
    const result = await this.query(
      'SELECT id, nombre, valorAsignado, valorGasto FROM categorias ORDER BY nombre ASC;',
    );
    // Retorna el arreglo de filas o un arreglo vacío si no hay resultados.
    return (result.values ?? []) as CategoriaRecord[];
  }

  // Actualiza una categoría existente en la base de datos y retorna true si hubo cambios.
  async updateCategoria(input: CategoriaRecord): Promise<boolean> {
    // Valida el id de categoría a modificar.
    if (!Number.isInteger(input.id) || input.id <= 0) {
      throw new Error('El id de la categoría es inválido');
    }

    // Ejecuta actualización parametrizada de los campos editables.
    const result = await this.run(
      'UPDATE categorias SET valorAsignado = ?, valorGasto = ? WHERE id = ?;',
      [input.valorAsignado, input.valorGasto, input.id],
    );

    // Retorna true cuando al menos una fila fue actualizada.
    return Number(result.changes?.changes ?? 0) > 0;
  }

  // Crea una transaccion nueva en la base de datos y retorna su id generado.
  async createTransaccion(input: TransaccionRecord): Promise<number> {
    // Ejecuta inserción parametrizada.
    const result = await this.run(
      'INSERT INTO transacciones (monto, tipo, categoria, fecha, descripcion, idUsuario) VALUES (?, ?, ?, ?, ?, ?);',
      [input.monto, input.tipo, input.categoria, input.fecha, input.descripcion, input.idUsuario],
    );

    // Retorna el id generado.
    return Number(result.changes?.lastId ?? 0);
  }

  // Elimina una transacción por id y retorna true si se eliminó al menos un registro.
  async deleteTransaccion(id: number): Promise<boolean> {
    // Valida el identificador recibido.
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('El id es inválido');
    }

    // Ejecuta eliminación parametrizada.
    const result = await this.run('DELETE FROM transacciones WHERE id = ?;', [id]);

    // Retorna true cuando se elimina al menos una fila.
    return Number(result.changes?.changes ?? 0) > 0;
  }

  // Devuelve una conexión abierta y válida, inicializando la base si es necesario.
  private async getOpenedConnection(): Promise<SQLiteDBConnection> {
    // Si no hay conexión, intenta inicializarla.
    if (!this.db) {
      // Llama al flujo de inicialización completo.
      await this.initializeDatabase();
    }

    // Si aún no existe conexión tras inicializar, lanza error controlado.
    if (!this.db) {
      // Error explícito para facilitar diagnóstico.
      throw new Error('No fue posible abrir la conexión SQLite');
    }

    // Verifica que la conexión realmente esté abierta antes de usarla.
    const isOpen = await this.db.isDBOpen().catch(() => ({ result: false }));

    // Si la conexión está cerrada, intenta reabrirla en caliente.
    if (!isOpen.result) {
      try {
        // Intenta abrir la conexión existente.
        await this.db.open();
      } catch (error) {
        // Si falla, reinicia estado y rehace inicialización completa.
        console.warn('La conexión SQLite estaba cerrada; se recreará.', error);
        this.db = null;
        this.ready$.next(false);
        await this.initializeDatabase();
      }
    }

    // Retorna la conexión abierta lista para uso.
    return this.db!;
  }

  // Persiste la base en web con tolerancia a fallos transitorios del store.
  private async persistWebStore(): Promise<void> {
    // Si no es web, no requiere persistencia explícita en store.
    if (Capacitor.getPlatform() !== 'web') {
      // Sale sin realizar acciones adicionales.
      return;
    }

    try {
      // Intenta guardar la base en IndexedDB.
      await this.sqlite.saveToStore(this.dbName);
    } catch (error) {
      // Registra advertencia y reintenta tras reabrir el store web.
      console.warn('saveToStore falló; se reintentará tras initWebStore.', error);
      // Reinicializa el store web por si perdió estado interno.
      await CapacitorSQLite.initWebStore().catch(() => undefined);

      // Segundo intento de persistencia.
      await this.sqlite.saveToStore(this.dbName).catch((retryError) => {
        // Si vuelve a fallar, se registra y se continúa para no romper el flujo UI.
        console.error('No se pudo persistir la base en web store.', retryError);
      });
    }
  }

  // Crea todas las tablas y relaciones necesarias del esquema de datos.
  private async createSchema(): Promise<void> {
    // Obtiene la conexión activa para ejecutar DDL.
    const database = await this.getOpenedConnection();
    // Define un listado de sentencias SQL de creación de esquema.
    const statements = [
      // Activa las restricciones de llaves foráneas en SQLite.
      'PRAGMA foreign_keys = ON;',
      // Sentencia para crear la tabla de usuarios
      `CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        correo TEXT NOT NULL UNIQUE,
        contrasena TEXT NOT NULL
      );`,

      // Sentencia para crear la tabla de categorias
      `CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        valorAsignado REAL DEFAULT 0,
        valorGasto REAL DEFAULT 0
      );`,

      // Sentencia para creat la tabla de presupuestos
      `CREATE TABLE IF NOT EXISTS presupuestos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        monto REAL NOT NULL,
        ingreso REAL DEFAULT 0,
        gasto REAL DEFAULT 0,
        mes TEXT NOT NULL,
        ano INTEGER NOT NULL,
        estado TEXT,
        idUsuarioFk INTEGER NOT NULL,
        FOREIGN KEY (idUsuarioFk) REFERENCES usuarios(id) ON DELETE CASCADE
      );`,
      
      // Sentencia para crear la tabla de transaccciones 
      `CREATE TABLE IF NOT EXISTS transacciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        monto REAL NOT NULL,
        tipo TEXT CHECK(tipo IN ('ingreso', 'gasto')),
        categoria TEXT,
        fecha TEXT NOT NULL,
        descripcion TEXT,
        idUsuario INTEGER NOT NULL,
        FOREIGN KEY (idUsuario) REFERENCES usuarios(id) ON DELETE CASCADE
      );`
    ];

    // Ejecuta todas las sentencias de esquema en una sola operación.
    await database.execute(statements.join('\n'));
  }

  // Inserta datos base iniciales para evitar tablas vacías en la primera ejecución.
  private async seedBaseData(): Promise<void> {
    // Consulta cuántas categorías existen actualmente.
    const countResult = await this.query('SELECT COUNT(*) as total FROM categorias;');
    // Convierte el resultado a número usando 0 como valor por defecto.
    const totalCategories = Number(countResult.values?.[0]?.total ?? 0);

    // Si ya hay categorías cargadas, no inserta datos duplicados.
    if (totalCategories > 0) {
      // Sale del método cuando no se requiere semilla inicial.
      return;
    }

    // Recorre el catálogo de categorías predefinidas.
    for (const categoryName of this.defaultCategories) {
      // Inserta cada categoría con valores por defecto.
      await this.run(
        // SQL de inserción parametrizada para prevenir errores de formato.
        'INSERT INTO categorias (nombre, valorAsignado, valorGasto) VALUES (?, ?, ?);',
        // Valores asociados a los placeholders de la sentencia.
        [categoryName, 0, 0],
      );
    }
  }
}
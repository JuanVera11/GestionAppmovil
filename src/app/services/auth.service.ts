import { Injectable } from '@angular/core';
import { Database } from './database';

export interface UsuarioRecord {
    id?: number; // El id es opcional porque no existe antes de insertar en la BD
    nombre: string;
    apellido: string;
    correo: string;
    contrasena: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(private db: Database) { }

    async login(correo: string, contrasena: string): Promise<any> {
        await this.db.waitForReady();
        const user = await this.db.loginUsuario(correo, contrasena);
        
        // Verificación segura de la existencia del usuario e id
        if (user && user.id !== undefined) {
            localStorage.setItem('userId', user.id.toString());
            localStorage.setItem('userName', `${user.nombre} ${user.apellido}`);
        }
        return user;
    }

    async register(nombre: string, apellido: string, correo: string, contrasena: string): Promise<number> {
        await this.db.waitForReady();
        // Se elimina 'id: 0', la BD se encarga del Autoincrement
        return await this.db.createUsuario({ nombre, apellido, correo, contrasena });
    }

    async getCurrentUser(): Promise<any> {
        const value = localStorage.getItem('userId');
        if (!value) return null;

        await this.db.waitForReady();
        const result = this.db.query(
            'SELECT * FROM usuarios WHERE id = ?;',
            [parseInt(value)]
        );
        
        return result.length > 0 ? result[0] : null;
    }

    async logout(): Promise<void> {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
    }

    async isLoggedIn(): Promise<boolean> {
        const user = await this.getCurrentUser();
        return !!user;
    }

    async resetPassword(correo: string, nuevaContrasena: string): Promise<boolean> {
        await this.db.waitForReady();
        return await this.db.updateContrasena(correo, nuevaContrasena);
    }
}
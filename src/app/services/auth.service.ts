import { Injectable } from '@angular/core';
import { Database, UsuarioRecord } from './database'; // Importamos la interfaz desde database

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(private db: Database) { }

    async login(correo: string, contrasena: string): Promise<UsuarioRecord | null> {
        await this.db.waitForReady();
        const user = await this.db.loginUsuario(correo, contrasena);
        
        if (user && user.id !== undefined) {
            localStorage.setItem('userId', user.id.toString());
            localStorage.setItem('userName', `${user.nombre} ${user.apellido}`);
        }
        return user;
    }

    async register(nombre: string, apellido: string, correo: string, contrasena: string): Promise<number> {
        await this.db.waitForReady();
        return await this.db.createUsuario({ nombre, apellido, correo, contrasena });
    }

    async getCurrentUser(): Promise<UsuarioRecord | null> {
        const value = localStorage.getItem('userId');
        if (!value) return null;

        await this.db.waitForReady();
        const result = await this.db.query(
            'SELECT * FROM usuarios WHERE id = ?;',
            [parseInt(value)]
        );
        return result && result.length > 0 ? (result[0] as UsuarioRecord) : null;
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
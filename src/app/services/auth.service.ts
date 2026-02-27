import { Injectable } from '@angular/core';
import { Database } from './database';

export interface UsuarioRecord {
    id: number;
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
        if (user) {
            localStorage.setItem('userId', user.id.toString());
            localStorage.setItem('userName', `${user.nombre} ${user.apellido}`);
        }
        return user;
    }

    async register(nombre: string, apellido: string, correo: string, contrasena: string): Promise<number> {
        await this.db.waitForReady();
        return await this.db.createUsuario({ id: 0, nombre, apellido, correo, contrasena });
    }



    async getCurrentUser(): Promise<any> {
        const value = localStorage.getItem('userId');
        if (!value) return null;

        // query() ya retorna array de objetos directamente
        const result = this.db.query(
            'SELECT * FROM usuarios WHERE id = ?;',
            [parseInt(value)]
        );
        return result[0] ?? null;
    }

    async logout(): Promise<void> {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
    }

    async isLoggedIn(): Promise<boolean> {
        const user = await this.getCurrentUser();
        return !!user;
    }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Database, UsuarioRecord } from './database';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private loggedIn$ = new BehaviorSubject<boolean>(!!localStorage.getItem('userId'));
    readonly isLoggedIn$ = this.loggedIn$.asObservable();

    constructor(private db: Database) { }

    async login(correo: string, contrasena: string): Promise<UsuarioRecord | null> {
        await this.db.waitForReady();
        const user = await this.db.loginUsuario(correo, contrasena);
        if (user && user.id !== undefined) {
            localStorage.setItem('userId', user.id.toString());
            localStorage.setItem('userName', `${user.nombre} ${user.apellido}`);
            this.loggedIn$.next(true);
        }
        return user;
    }

    async loginByUserId(id: number, nombre: string, apellido: string): Promise<void> {
        localStorage.setItem('userId', id.toString());
        localStorage.setItem('userName', `${nombre} ${apellido}`);
        this.loggedIn$.next(true);
    }

    async logout(): Promise<void> {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        this.loggedIn$.next(false);
    }

    async register(nombre: string, apellido: string, correo: string, contrasena: string): Promise<number> {
        await this.db.waitForReady();
        return await this.db.createUsuario({ nombre, apellido, correo, contrasena });
    }

    async getCurrentUser(): Promise<UsuarioRecord | null> {
        const value = localStorage.getItem('userId');
        if (!value) return null;
        await this.db.waitForReady();
        const result = await this.db.query('SELECT * FROM usuarios WHERE id = ?;', [parseInt(value)]);
        return result && result.length > 0 ? (result[0] as UsuarioRecord) : null;
    }

    async isLoggedIn(): Promise<boolean> {
        const user = await this.getCurrentUser();
        return !!user;
    }

    async resetPassword(correo: string, nuevaContrasena: string): Promise<any> {
        await this.db.waitForReady();
        return await this.db.updateContrasena(correo, nuevaContrasena);
    }
}

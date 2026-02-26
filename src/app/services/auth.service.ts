import { Injectable } from '@angular/core';
import { Database, UsuarioRecord } from './database';
import { Preferences } from '@capacitor/preferences';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(private db: Database) { }

    async register(nombre: string, apellido: string, correo: string, contrasena: string): Promise<number> {
        await this.db.initializeDatabase();

        const usuario: UsuarioRecord = {
            id: 0,
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            correo: correo.trim(),
            contrasena: contrasena.trim()
        };

        return await this.db.createUsuario(usuario);
    }

    async login(correo: string, contrasena: string): Promise<UsuarioRecord | null> {
        await this.db.initializeDatabase();

        const result = await this.db.query(
            'SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?',
            [correo.trim(), contrasena.trim()]
        );

        if (result.values && result.values.length > 0) {
            const user = result.values[0] as UsuarioRecord;
            await Preferences.set({ key: 'userId', value: user.id.toString() });
            await Preferences.set({ key: 'userName', value: `${user.nombre} ${user.apellido}` });
            return user;
        }
        return null;
    }
    

    async getCurrentUser(): Promise<UsuarioRecord | null> {
        const { value } = await Preferences.get({ key: 'userId' });
        if (value) {
            const result = await this.db.query('SELECT * FROM usuarios WHERE id = ?', [parseInt(value)]);
            return result.values?.[0] as UsuarioRecord || null;
        }
        return null;
    }

    async logout(): Promise<void> {
        await Preferences.remove({ key: 'userId' });
        await Preferences.remove({ key: 'userName' });
    }

    async isLoggedIn(): Promise<boolean> {
        const user = await this.getCurrentUser();
        return !!user;
    }
}

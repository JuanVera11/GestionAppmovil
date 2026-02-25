export class Configuracion {
    private nombreUsuario: string;
    private correoUsuario: string;
    private imagenPerfil: string;
    private esOscuro: boolean;

    constructor(
        nombreUsuario: string,
        correoUsuario: string,
        imagenPerfil: string,
        esOscuro: boolean
    ) {
        this.nombreUsuario = nombreUsuario;
        this.correoUsuario = correoUsuario;
        this.imagenPerfil = imagenPerfil;
        this.esOscuro = esOscuro;
    }

    get NombreUsuario(): string {
        return this.nombreUsuario;
    }

    set NombreUsuario(nombreUsuario: string) {
        this.nombreUsuario = nombreUsuario;
    }

    get CorreoUsuario(): string {
        return this.correoUsuario;
    }

    set CorreoUsuario(correoUsuario: string) {
        this.correoUsuario = correoUsuario;
    }

    get ImagenPerfil(): string {
        return this.imagenPerfil;
    }

    set ImagenPerfil(imagenPerfil: string) {
        this.imagenPerfil = imagenPerfil;
    }

    get EsOscuro(): boolean {
        return this.esOscuro;
    }

    set EsOscuro(esOscuro: boolean) {
        this.esOscuro = esOscuro;
    }
}
export class Usuario {

    private id?: number;
    private nombre: string;
    private apellido: string;
    private correo: string;
    private contrasena: string;

    constructor(
        nombre: string,
        apellido: string,
        correo: string,
        contrasena: string,
        id?: number
    ) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
        this.contrasena = contrasena;
    }

    get Id(): number | undefined {
        return this.id;
    }

    set Id(id: number | undefined) {
        this.id = id;
    }

    // Getter y Setter de nombre
    get Nombre(): string {
        return this.nombre;
    }

    set Nombre(nombre: string) {
        this.nombre = nombre;
    }

    get Apellido(): string {
        return this.apellido;
    }

    set Apellido(apellido: string) {
        this.apellido = apellido;
    }

    get Correo(): string {
        return this.correo;
    }

    set Correo(correo: string) {
        this.correo = correo;
    }

    get Contrasena(): string {
        return this.contrasena;
    }

    set Contrasena(contrasena: string) {
        this.contrasena = contrasena;
    }
}

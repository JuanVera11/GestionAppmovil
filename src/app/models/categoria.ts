export class Categoria {

    private id: number;
    private nombre: string;
    private descripcion: string;

    constructor(
        id: number,
        nombre: string,
        descripcion: string
    ) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
    }

    get Id(): number {
        return this.id;
    }

    set Id(id: number) {
        this.id = id;
    }

    get Nombre(): string {
        return this.nombre;
    }

    set Nombre(nombre: string) {
        this.nombre = nombre;
    }

    get Descripcion(): string {
        return this.descripcion;
    }

    set Descripcion(descripcion: string) {
        this.descripcion = descripcion;
    }
}

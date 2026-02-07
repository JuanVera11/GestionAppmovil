export class Transaccion {

    private monto: number;
    private ingreso: number;
    private gasto: number;
    private categoria: string;
    private fecha: Date;
    private descripcion: string;
    private idUsuario: number;

    constructor(
        monto: number,
        ingreso: number,
        gasto: number,
        categoria: string,
        fecha: Date,
        descripcion: string,
        idUsuario: number
    ) {
        this.monto = monto;
        this.ingreso = ingreso;
        this.gasto = gasto;
        this.categoria = categoria;
        this.fecha = fecha;
        this.descripcion = descripcion;
        this.idUsuario = idUsuario;
    }

    get Monto(): number {
        return this.monto;
    }

    set Monto(monto: number) {
        this.monto = monto;
    }

    get Ingreso(): number {
        return this.ingreso;
    }

    set Ingreso(ingreso: number) {
        this.ingreso = ingreso;
    }

    get Gasto(): number {
        return this.gasto;
    }

    set Gasto(gasto: number) {
        this.gasto = gasto;
    }

    get Categoria(): string {
        return this.categoria;
    }

    set Categoria(categoria: string) {
        this.categoria = categoria;
    }

    get Fecha(): Date {
        return this.fecha;
    }

    set Fecha(fecha: Date) {
        this.fecha = fecha;
    }

    get Descripcion(): string {
        return this.descripcion;
    }

    set Descripcion(descripcion: string) {
        this.descripcion = descripcion;
    }

    get IdUsuario(): number {
        return this.idUsuario;
    }

    set IdUsuario(idUsuario: number) {
        this.idUsuario = idUsuario;
    }
}

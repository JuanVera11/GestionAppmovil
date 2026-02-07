export class Presupuesto {

    private monto: number;
    private ingreso: number;
    private gasto: number;
    private mes: string;
    private ano: number;
    private estado: string;
    private idUsuarioFK: number;

    constructor(
        monto: number,
        ingreso: number,
        gasto: number,
        mes: string,
        ano: number,
        estado: string,
        idUsuarioFK: number
    ) {
        this.monto = monto;
        this.ingreso = ingreso;
        this.gasto = gasto;
        this.mes = mes;
        this.ano = ano;
        this.estado = estado;
        this.idUsuarioFK = idUsuarioFK;
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

    get Mes(): string {
        return this.mes;
    }

    set Mes(mes: string) {
        this.mes = mes;
    }

    get Ano(): number {
        return this.ano;
    }

    set Ano(ano: number) {
        this.ano = ano;
    }

    get Estado(): string {
        return this.estado;
    }

    set Estado(estado: string) {
        this.estado = estado;
    }

    get IdUsuarioFK(): number {
        return this.idUsuarioFK;
    }

    set IdUsuarioFK(idUsuarioFK: number) {
        this.idUsuarioFK = idUsuarioFK;
    }
}

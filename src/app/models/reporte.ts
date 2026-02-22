export class Reporte {
    private presupuestoTotal: number;
    private datosActuales: { valor: number }[];
    private filtroSeleccionado: string;

    constructor(
        presupuestoTotal: number,
        datosActuales: { valor: number }[],
        filtroSeleccionado: string = '7dias'
    ) {
        this.presupuestoTotal = presupuestoTotal;
        this.datosActuales = datosActuales;
        this.filtroSeleccionado = filtroSeleccionado;
    }

    get PresupuestoTotal(): number {
        return this.presupuestoTotal;
    }

    set PresupuestoTotal(valor: number) {
        this.presupuestoTotal = valor;
    }

    get DatosActuales(): { valor: number }[] {
        return this.datosActuales;
    }

    set DatosActuales(datos: { valor: number }[]) {
        this.datosActuales = datos;
    }

    get FiltroSeleccionado(): string {
        return this.filtroSeleccionado;
    }

    set FiltroSeleccionado(filtro: string) {
        this.filtroSeleccionado = filtro;
    }

    get TotalGastado(): number {
        return this.datosActuales.reduce((acumulador, actual) => acumulador + actual.valor, 0);
    }

    get SaldoRestante(): number {
        return this.presupuestoTotal - this.TotalGastado;
    }

    get PorcentajeGastoTotal(): number {
        if (this.presupuestoTotal === 0) return 0;
        return Math.round((this.TotalGastado / this.presupuestoTotal) * 100);
    }
}
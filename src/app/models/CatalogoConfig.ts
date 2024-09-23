//Se usa para indicar los métodos correspondientes a cada catálogo
export class CatalogoConfig {
  constructor(
    public nombre: string,
    public urlListar: string,
    public urlAgregar: string,
    public urlEditar: string,
    public urlEliminar: string,
    public urlEstatus?: string
  ) {}
}

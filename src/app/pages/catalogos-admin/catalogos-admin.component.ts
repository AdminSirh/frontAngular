import { Component, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudService } from 'src/services/crud.service';
import { LoginService } from 'src/services/login.service';
import { MessageService } from 'primeng/api';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { QueryParamsService } from 'src/services/query-params.service';
import { CatalogoConfig } from 'src/app/models/CatalogoConfig';

@Component({
  selector: 'app-catalogos-admin',
  standalone: true,
  imports: [ReactiveFormsModule, ToastModule, CommonModule],
  templateUrl: './catalogos-admin.component.html',
  styleUrls: ['./catalogos-admin.component.scss']
})
export class CatalogosAdminComponent implements AfterViewInit {
  //Modales
  @ViewChild('catalogoModal') catalogoModal!: TemplateRef<any>;
  @ViewChild('modalActivate') modalActivate!: TemplateRef<any>;
  @ViewChild('modaleDeactivate') modaleDeactivate!: TemplateRef<any>;
  //Formulario dinámico
  catalogoForm: FormGroup;
  //Variables
  catalogos: any[] = [];
  catalogoKeys: string[] = [];
  currentCatalog: any = null;
  catalogoConfig: CatalogoConfig;
  private modalRef?: NgbModalRef;
  private table: any;
  private estatusId: number | null = null;
  private estatusActivo: number | null = null;
  valorConsulta: any[] = [];

  constructor(
    private crudService: CrudService,
    private loginService: LoginService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private queryParamsService: QueryParamsService
  ) {
    this.catalogoForm = this.fb.group({});
    // Obtiene el nombre del catálogo desde los parámetros de la URL
    const tipoCatalogo = this.queryParamsService.getParam('catalogo') || 'default'; // Nombre del parámetro
    this.catalogoConfig = this.initializeCatalogoConfig(tipoCatalogo);
  }

  private initializeCatalogoConfig(tipoCatalogo: string): CatalogoConfig {
    this.obtenerValorConsulta();

    switch (tipoCatalogo) {
      case 'catalogo_si_no':
        return new CatalogoConfig(
          'Si No',
          'catalogos/listarDatosSi_No',
          'catalogos/guardarSiNo',
          'catalogos/actualizarSiNo',
          'urlElimina',
          'catalogos/estadoSiNo'
        );
      case 'catalogo_genero':
        return new CatalogoConfig(
          'Genero',
          'catalogos/listarDatosGenero',
          'catalogos/guardarGenero',
          'catalogos/editarGenero',
          'urlElimina',
          'catalogos/cambioEstatusGenero'
        );
      default:
        this.handleError('Error al encontrar el menú', 'error');
        throw new Error('Tipo de catálogo no reconocido');
    }
  }

  ngAfterViewInit(): void {
    this.loadCatalogos();
  }

  private loadCatalogos(): void {
    const catalogoUrl = this.catalogoConfig.urlListar;
    this.crudService.getGenerico(catalogoUrl).subscribe({
      next: (response) => {
        let datos: any;
        // Manejar las diferentes estructuras de la respuesta
        if (response.data && response.data.data) {
          datos = response.data.data;
        } else if (response.data) {
          datos = response.data;
        } else {
          datos = response;
        }
        // Verificar si 'error' existe y es igual a 0
        const errorExistente = response.error !== undefined ? response.error : 0;
        if (errorExistente === 0) {
          this.catalogos = datos;
          this.catalogoKeys = this.getCatalogoKeys();
          this.initializeForm(this.catalogos.length > 0 ? this.catalogos[0] : {}); // Inicializar el formulario
          this.initializeDataTable(this.catalogos); // Inicializar el DataTable
        } else {
          this.handleError('Ocurrió un error', 'Error');
        }
      },
      error: (error) => this.handleError('Error al cargar los datos', error)
    });
  }

  private initializeDataTable(data: any[]): void {
    const tableElement = document.querySelector('#tablaCatalogos') as HTMLTableElement;

    if (tableElement) {
      const dataTable = (window as any).$('#tablaCatalogos').DataTable();

      if (dataTable) {
        // Limpiar eventos anteriores
        (window as any).$('#tablaCatalogos').off('click', '.edit-btn');
        (window as any).$('#tablaCatalogos').off('click', '.estatus-btn');
        dataTable.destroy();
      }

      this.table = (window as any).$('#tablaCatalogos').DataTable({
        pagingType: 'full_numbers',
        pageLength: 10,
        processing: true,
        data: data,
        columns: [
          ...this.catalogoKeys.map((key) => ({
            data: key,
            title: this.capitalizeFirstLetter(key)
          })),
          {
            data: null,
            title: 'Acciones',
            render: (data: any) => `
              <button class="btn btn-outline-primary edit-btn" data-id="${this.findId(data)}">  
                <i class="fa fa-edit"></i> Editar
              </button>`
          },
          {
            data: null,
            title: 'Estatus',
            render: (data: any, type: any, row: any) => {
              const isActive = row.activo === 1 || row.estatus === 1 || row.status == 1;
              return isActive
                ? `<button class="btn btn-outline-danger estatus-btn" data-id="${this.findId(data)}" data-activo="${isActive ? 1 : 0}">
                    <span class="fa fa-minus-circle"></span> Desactivar
                  </button>`
                : `<button class="btn btn-outline-success estatus-btn" data-id="${this.findId(data)}"data-activo="${isActive ? 1 : 0}">
                    <span class="fa fa-plus-circle"></span> Activar
                  </button>`;
            }
          }
        ],
        language: {
          decimal: '',
          emptyTable: 'No hay información',
          info: 'Mostrando _START_ a _END_ de _TOTAL_ Entradas',
          infoEmpty: 'Mostrando 0 a 0 de 0 Entradas',
          infoFiltered: '(Filtrado de _MAX_ total entradas)',
          thousands: ',',
          lengthMenu: 'Mostrar _MENU_ Entradas',
          loadingRecords: 'Cargando...',
          processing: 'Procesando...',
          search: 'Buscar:',
          zeroRecords: 'Sin resultados encontrados',
          paginate: {
            first: 'Primero',
            last: 'Último',
            next: 'Siguiente',
            previous: 'Anterior'
          }
        }
      });

      // Manejo de clics en los botones
      (window as any).$('#tablaCatalogos').on('click', '.edit-btn', (event: any) => {
        const id = Number(event.currentTarget.getAttribute('data-id'));
        this.openModal(this.catalogos.find((c) => this.findId(c) === id));
      });

      //Click en el botón de estatus (Solo despliega los modales)
      (window as any).$('#tablaCatalogos').on('click', '.estatus-btn', (event: any) => {
        const id = Number(event.currentTarget.getAttribute('data-id'));
        const activo = Number(event.currentTarget.getAttribute('data-activo'));
        this.estatusId = id;
        this.estatusActivo = activo;
        if (activo === 1) {
          this.modalRef = this.modalService.open(this.modalActivate);
        } else {
          this.modalRef = this.modalService.open(this.modaleDeactivate);
        }
      });
    }
  }

  initializeForm(item: any): void {
    this.catalogoForm.reset(); // Reinicia el formulario
    for (const key in item) {
      if (item.hasOwnProperty(key) && !this.shouldExcludeKey(key)) {
        this.catalogoForm.addControl(key, this.fb.control(item[key], Validators.required)); // Agrega la validación solo a los campos necesarios
      }
    }
    this.catalogoKeys = this.getCatalogoKeys();
  }

  private shouldExcludeKey(key: string): boolean {
    // Verifica si la clave debe ser excluida
    return key.startsWith('id') || key === 'estatus' || key === 'status';
  }

  getCatalogoKeys(): string[] {
    return this.catalogos.length > 0
      ? Object.keys(this.catalogos[0]).filter((key) => !this.shouldExcludeKey(key)) // Filtra las claves a excluir
      : [];
  }

  openModal(item?: any): void {
    this.closeCurrentModal();
    this.currentCatalog = item || null;
    this.catalogoForm.reset(); // Limpia el formulario

    if (item) {
      this.catalogoForm.patchValue(item); // Rellena el formulario si es edición
    } else {
      this.initializeForm({}); // Inicializa el formulario si es agregar
    }
    this.modalRef = this.modalService.open(this.catalogoModal);
  }

  saveCatalogo(): void {
    const body = this.catalogoForm.value;
    if (this.catalogoForm.invalid) {
      this.catalogoForm.markAllAsTouched(); // Marca todos los campos como tocados para mostrar los errores
      return; // Detiene la ejecución si el formulario es inválido
    }
    if (this.currentCatalog) {
      const id = this.findId(this.currentCatalog);
      this.crudService
        .postGenerico(`${this.catalogoConfig.urlEditar}`, body, id)
        .subscribe(this.handleSaveSuccess.bind(this), this.handleError.bind(this, 'Ocurrió un error al actualizar el catálogo'));
    } else {
      this.crudService
        .postGenerico(`${this.catalogoConfig.urlAgregar}`, body)
        .subscribe(this.handleSaveSuccess.bind(this), this.handleError.bind(this, 'Ocurrió un error al agregar el catálogo'));
    }
  }

  changeStatus(activar: boolean): void {
    if (this.estatusId !== null) {
      const nuevoActivo = activar ? 1 : 0;
      this.crudService.getGenerico(`${this.catalogoConfig.urlEstatus}`, this.estatusId, [nuevoActivo.toString()]).subscribe({
        next: () => this.handleStatusSuccess(activar),
        error: (error) => this.handleError('Error al actualizar el estatus del submenu', error)
      });
    }
  }

  private handleSaveSuccess(): void {
    this.loadCatalogos();
    this.closeCurrentModal();
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: this.currentCatalog ? 'Catálogo actualizado correctamente' : 'Catálogo agregado correctamente'
    });
  }

  private handleStatusSuccess(activar: boolean): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `El submenu ha sido ${activar ? 'activado' : 'desactivado'} correctamente`
    });
    this.closeCurrentModal();
    this.loadCatalogos(); // Cargar de nuevo los catálogos después de actualizar el estatus
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: `${message}: ${error.message || error}`
    });
  }

  closeCurrentModal(): void {
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = undefined;
    }
  }

  // Función para capitalizar la primera letra
  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  private findId(item: any): number | undefined {
    return Object.keys(item).find((key) => key.startsWith('id')) ? item[Object.keys(item).find((key) => key.startsWith('id'))!] : undefined;
  }
  
  obtenerValorConsulta() {
    const user = this.loginService.getUser(); // Obtiene el valor directamente
    if (user) {
      this.valorConsulta = user.authorities; 
    } else {
      console.error('No se encontró ningún usuario almacenado.');
    }
  }

  tieneRol(rol: string): boolean {
    return this.valorConsulta.some(r => r.authority === rol);
  }
}

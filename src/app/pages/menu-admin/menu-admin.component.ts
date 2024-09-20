import { Component, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from 'src/services/crud.service';
import { MessageService } from 'primeng/api';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-menu-admin',
  standalone: true,
  templateUrl: './menu-admin.component.html',
  styleUrls: ['./menu-admin.component.scss'],
  imports: [ReactiveFormsModule, ToastModule]
})
export class MenuAdminComponent implements AfterViewInit {
  //Modales
  @ViewChild('modificarMenuModal') modificarMenuModal!: TemplateRef<any>;
  @ViewChild('agregarMenuModal') agregarMenuModal!: TemplateRef<any>;
  //Formularios
  menuForm: FormGroup;
  //Variables
  private table: any;
  private modalRef?: NgbModalRef;

  constructor(
    private crudService: CrudService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private router: Router
  ) {
    this.menuForm = this.fb.group({
      id: [''],
      menuNombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      orden: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
    });
  }

  ngAfterViewInit(): void {
    this.loadMenuData();
  }

  private loadMenuData(): void {
    this.crudService.getGenerico('menu/listarMenu').subscribe({
      next: (data) => this.initializeDataTable(data),
      error: (error) => this.handleError('Error al cargar los datos', error)
    });
  }

  private initializeDataTable(data: any[]): void {
    const tableElement = document.querySelector('#tablaMenu') as HTMLTableElement;

    if (tableElement) {
      const dataTable = (window as any).$('#tablaMenu').DataTable();

      if (dataTable) {
        // Limpiar eventos anteriores
        (window as any).$('#tablaMenu').off('click', '.edit-btn');
        (window as any).$('#tablaMenu').off('click', '.sub-btn');
        dataTable.destroy();
      }

      this.table = (window as any).$('#tablaMenu').DataTable({
        pagingType: 'full_numbers',
        pageLength: 10,
        processing: true,
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
        },
        data: data,
        columns: [
          { data: 'id', title: 'Id' },
          { data: 'menuNombre', title: 'Nombre del Menú' },
          { data: 'descripcion', title: 'Descripción' },
          { data: 'icono', title: 'Icono', render: (data: any) => `<i class="${data}"></i>` },
          { data: 'orden', title: 'Orden' },
          {
            data: null,
            title: 'Editar',
            render: (data: any) => `
              <button class="btn btn-outline-primary edit-btn" data-id="${data.id}">
                <i class="fa fa-edit"></i> Editar
              </button>`
          },
          {
            data: null,
            title: 'Sub Menú',
            render: (data: any) => `
              <button class="btn btn-outline-info sub-btn" data-id="${data.id}">
                <i class="fa fa-search"></i> Administrar
              </button>`
          }
        ]
      });
      //Click en el botón editar
      (window as any).$('#tablaMenu').on('click', '.edit-btn', (event: any) => {
        const id = Number(event.currentTarget.getAttribute('data-id'));
        this.openEditMenuModal(id);
      });
      //Click en el botón administrar submenú
      (window as any).$('#tablaMenu').on('click', '.sub-btn', (event: any) => {
        const id = Number(event.currentTarget.getAttribute('data-id'));
        this.verSubMenu(id);
      });
    }
  }

  openAddMenuModal(): void {
    this.modalRef = this.modalService.open(this.agregarMenuModal);
  }

  openEditMenuModal(id: number): void {
    // Cerrar el modal actual si está abierto y limpiar la referencia
    this.closeCurrentModal();
    this.crudService.getGenerico('menu/buscarMenu', id).subscribe({
      next: (data) => {
        this.menuForm.patchValue(data.data);
        this.modalRef = this.modalService.open(this.modificarMenuModal);
      },
      error: (error) => this.handleError('Error al cargar los datos del menú', error)
    });
  }

  saveMenu(): void {
    if (this.menuForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son obligatorios y deben ser válidos'
      });
      return;
    }

    const { menuNombre, descripcion, orden } = this.menuForm.value;
    const nuevoMenu = { menuNombre, descripcion, orden: Number(orden) };

    this.crudService.postGenerico('menu/guardarMenu', nuevoMenu).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Menú agregado correctamente'
        });
        this.loadMenuData();
        this.closeCurrentModal();
      },
      error: (error) => this.handleError('Error al agregar el menú', error)
    });
  }

  updateMenu(): void {
    if (this.menuForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son obligatorios y deben ser válidos'
      });
      return;
    }

    const { id, menuNombre, descripcion, orden } = this.menuForm.value;
    const menuActualizado = { id, menuNombre, descripcion, orden: Number(orden) };

    this.crudService.update('menu/actualizarMenu', id, menuActualizado).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Menú actualizado correctamente'
        });
        this.loadMenuData();
        this.closeCurrentModal();
      },
      error: (error) => this.handleError('Error al actualizar el menú', error)
    });
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: `${message}: ${error.message || error}`
    });
  }

  verSubMenu(id: number): void {
    this.router.navigate(['/subMenuAdmin'], { queryParams: { id_menu: id } });
  }

  private closeCurrentModal(): void {
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = undefined;
    }
  }
}

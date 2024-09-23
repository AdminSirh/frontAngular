import { Component, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { CrudService } from 'src/services/crud.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { QueryParamsService } from 'src/services/query-params.service';

@Component({
  selector: 'app-sub-menu-admin',
  standalone: true,
  imports: [ReactiveFormsModule, ToastModule, CommonModule],
  templateUrl: './sub-menu-admin.component.html',
  styleUrls: ['./sub-menu-admin.component.scss']
})
export class SubMenuAdminComponent implements AfterViewInit {
  //Modales
  @ViewChild('agregarSubMenuModal') agregarSubMenuModal!: TemplateRef<any>;
  @ViewChild('editarSubMenuModal') editarSubMenuModal!: TemplateRef<any>;
  @ViewChild('modalActivate') modalActivate!: TemplateRef<any>;
  @ViewChild('modaleDeactivate') modaleDeactivate!: TemplateRef<any>;
  @ViewChild('modalRol') modalRol!: TemplateRef<any>;
  //Formularios
  subMenuForm: FormGroup;
  //Variables
  private table: any;
  private modalRef?: NgbModalRef;
  private estatusId: number | null = null;
  private estatusActivo: number | null = null;
  roles: any[] = []; // Para almacenar los roles obtenidos
  submenuId: number = 0; // ID del submenu

  constructor(
    private crudService: CrudService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private queryParamsService: QueryParamsService
  ) {
    this.subMenuForm = this.fb.group({
      id: [''],
      submenuNombre: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    const id = this.queryParamsService.getParam('id_menu');
    if (id) {
      this.loadSubMenuData(id);
    }
  }

  private loadSubMenuData(id: number): void {
    this.crudService.getGenerico('submenu/listarSubMenuAll', id).subscribe({
      next: (data) => this.initializeDataTable(data),
      error: (error) => this.handleError('Error al cargar los datos', error)
    });
  }

  private initializeDataTable(data: any[]): void {
    const tableElement = document.querySelector('#tablaSubMenu') as HTMLTableElement;

    if (tableElement) {
      const dataTable = (window as any).$('#tablaSubMenu').DataTable();

      if (dataTable) {
        // Limpiar eventos anteriores
        (window as any).$('#tablaSubMenu').off('click', '.edit-btn');
        (window as any).$('#tablaSubMenu').off('click', '.estatus-btn');
        (window as any).$('#tablaSubMenu').off('click', '.role-btn');
        dataTable.destroy();
      }

      this.table = (window as any).$('#tablaSubMenu').DataTable({
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
          { data: 'id' },
          { data: 'submenuNombre' },
          { data: 'descripcion' },
          {
            data: '',
            title: 'Activo',
            width: 100,
            render: (data: any, type: any, row: any) => {
              return row.activo === 1
                ? `<button class="btn btn-outline-success estatus-btn" data-id="${row.id}" data-activo="${row.activo}">
                   <span class="fa fa-minus-circle"></span> Desactivar
                 </button>`
                : `<button class="btn btn-outline-danger estatus-btn" data-id="${row.id}" data-activo="${row.activo}">
                   <span class="fa fa-minus-circle"></span> Activar
                 </button>`;
            }
          },
          {
            data: null,
            title: 'Asignar Roles',
            render: (data: any) => `
              <button class="btn btn-outline-warning role-btn" data-id="${data.id}">
                <i class="fa fa-check-circle"></i> Asignar Roles
              </button>`
          },
          {
            data: null,
            title: 'Editar',
            render: (data: any) => `
              <button class="btn btn-outline-primary edit-btn" data-id="${data.id}">
                <i class="fa fa-edit"></i> Editar
              </button>`
          }
        ]
      });
    }

    //Click en el botón editar
    (window as any).$('#tablaSubMenu').on('click', '.edit-btn', (event: any) => {
      const id = Number(event.currentTarget.getAttribute('data-id'));
      this.openEditSubMenuModal(id);
    });
    //Click en el botón de estatus (Solo despliega los modales)
    (window as any).$('#tablaSubMenu').on('click', '.estatus-btn', (event: any) => {
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
    //Click en el botón asignar roles
    (window as any).$('#tablaSubMenu').on('click', '.role-btn', (event: any) => {
      const id = Number(event.currentTarget.getAttribute('data-id'));
      this.openroleModal(id);
    });
  }

  changeStatus(activar: boolean): void {
    if (this.estatusId !== null) {
      const nuevoActivo = activar ? 1 : 0;

      this.crudService.getGenerico('submenu/estatusSubmenu', this.estatusId, [nuevoActivo.toString()]).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `El submenu ha sido ${activar ? 'activado' : 'desactivado'} correctamente`
          });
          this.loadSubMenuData(this.queryParamsService.getParam('id_menu'));
          this.closeCurrentModal();
        },
        error: (error) => this.handleError('Error al actualizar el estatus del submenu', error)
      });
    }
  }

  openAddSubMenuModal(): void {
    this.modalRef = this.modalService.open(this.agregarSubMenuModal);
  }

  openEditSubMenuModal(id: number): void {
    // Cerrar el modal actual si está abierto y limpiar la referencia
    this.closeCurrentModal();
    this.crudService.getGenerico('submenu/buscarSubmenu', id).subscribe({
      next: (data) => {
        this.subMenuForm.patchValue(data);
        this.modalRef = this.modalService.open(this.editarSubMenuModal);
      },
      error: (error) => this.handleError('Error al cargar los datos del submenú', error)
    });
  }

  openroleModal(id: number): void {
    // Cerrar el modal actual si está abierto y limpiar la referencia
    this.closeCurrentModal();
    // Arreglo para guardar los nombres de los roles
    let roleNames: string[] = [];
    this.crudService.getGenerico('submenu/buscarSubmenuRol', id).subscribe({
      next: (response) => {
        // Validar que response.data esté definido y sea un array
        if (response && Array.isArray(response.data)) {
          this.modalRef = this.modalService.open(this.modalRol);
          // Recorre los datos recibidos y guarda los nombres de los roles en el arreglo
          response.data.forEach((element) => {
            if (element && element.rolNombre) {
              roleNames.push(element.rolNombre);
            }
          });
          // Llama a la función y pasa el id del submenu y el arreglo de roles
          this.funcionListarRoles(id, roleNames);
        } else {
          console.error('La respuesta no contiene un array válido en la propiedad "data".');
        }
      },
      error: (error) => this.handleError('Error al cargar los datos del rol', error)
    });
  }

  funcionListarRoles(submenuId: number, roles: string[]): void {
    this.submenuId = submenuId;
    this.crudService.getGenerico('rol/listarRoles').subscribe({
      next: (data) => {
        if (data && Array.isArray(data.data)) {
          this.roles = data.data.map((role) => ({
            ...role,
            isAssigned: roles.includes(role.rolNombre)
          }));
        } else {
          console.error('La respuesta no contiene un array válido en la propiedad "data".');
        }
      },
      error: (error) => console.error('Error al cargar los roles', error)
    });
  }

  desactivarRol(submenuId: number, rolId: number): void {
    // Llamada al nuevo método para eliminar el rol del submenu
    this.crudService.postGenerico('submenu/eliminarRol', {}, submenuId, rolId).subscribe({
      next: (data) => {
        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'warn',
          summary: 'Aviso',
          detail: 'El rol ha sido eliminado correctamente'
        });
        // Recargar los roles asignados al submenu
        this.reloadAssignedRoles(submenuId);
      },
      error: (error) => {
        // Manejar el error y mostrar un mensaje adecuado
        this.handleError('Error al eliminar el rol', error);
      }
    });
  }

  asignarRol(submenuId: number, rolId: number): void {
    const datos = {
      rol: { id: rolId },
      submenu: { id: submenuId }
    };

    this.crudService.postGenerico('submenu/guardarSubmenuRol', datos).subscribe({
      next: (data) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'El rol ha sido asignado correctamente'
        });
        // Recargar los roles asignados al submenu
        this.reloadAssignedRoles(submenuId);
      },
      error: (error) => {
        this.handleError('Error al asignar el rol', error);
      }
    });
  }

  private reloadAssignedRoles(submenuId: number): void {
    this.crudService.getGenerico('submenu/buscarSubmenuRol', submenuId).subscribe({
      next: (response) => {
        if (response && Array.isArray(response.data)) {
          const roleNames = response.data.map((element) => element.rolNombre);
          this.funcionListarRoles(submenuId, roleNames);
        } else {
          console.error('La respuesta no contiene un array válido en la propiedad "data".');
        }
      },
      error: (error) => this.handleError('Error al cargar los roles asignados', error)
    });
  }

  saveSubMenu(): void {
    let idMenu = this.queryParamsService.getParam('id_menu');
    if (this.subMenuForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son obligatorios y deben ser válidos'
      });
      return;
    }

    const { submenuNombre, descripcion } = this.subMenuForm.value;
    const nuevoSubMenu = {
      submenuNombre,
      descripcion,
      menu: { id: idMenu },
      activo: 1
    };

    this.crudService.postGenerico('submenu/guardaSubmenu', nuevoSubMenu).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'El submenu ha sido agregado correctamente'
        });
        this.loadSubMenuData(idMenu);
        this.closeCurrentModal();
      },
      error: (error) => this.handleError('Error al agregar el submenu', error)
    });
  }

  updateSubMenu(): void {
    let idMenu = this.queryParamsService.getParam('id_menu');
    if (this.subMenuForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son obligatorios y deben ser válidos'
      });
      return;
    }

    const { id, submenuNombre, descripcion } = this.subMenuForm.value;
    const subMenuActualizado = { id, submenuNombre, descripcion };

    this.crudService.postGenerico('submenu/actualizarSubmenu', subMenuActualizado, id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Sub-Menú actualizado correctamente'
        });
        this.loadSubMenuData(idMenu);
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

  private closeCurrentModal(): void {
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = undefined;
    }
  }
}

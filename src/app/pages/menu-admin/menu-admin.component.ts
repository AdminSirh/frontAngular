import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CrudService } from 'src/services/crud.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-menu-admin',
  standalone: true,
  templateUrl: './menu-admin.component.html',
  imports: [ToastModule],
  styleUrls: ['./menu-admin.component.scss']
})
export class MenuAdminComponent implements AfterViewInit {
  @ViewChild('idMenuInput') idMenuInput!: ElementRef<HTMLInputElement>;

  private table: any;

  constructor(
    private crudService: CrudService,
    private modalService: NgbModal,
    private messageService: MessageService
  ) {}

  ngAfterViewInit(): void {
    this.loadMenuData();
  }

  private loadMenuData(): void {
    this.crudService.getAll('menu/listarMenu').subscribe(
      (data) => {
        this.initializeDataTable(data);
      },
      (error) => {
        console.error('Error al cargar los datos', error);
      }
    );
  }

  private initializeDataTable(data: any[]): void {
    // Selecciona el elemento de la tabla
    const tableElement = document.querySelector('#tablaMenu') as HTMLTableElement;

    // Si la tabla ya está inicializada, destrúyela para evitar la re-inicialización
    if (tableElement && (window as any).$.fn.DataTable.isDataTable(tableElement)) {
      (window as any).$('#tablaMenu').DataTable().destroy();
    }

    // Inicializa DataTable con la configuración deseada y los datos
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
          render: (data: any) =>
            `<button class="btn btn-outline-primary edit-btn" data-id="${data.id}" data-bs-toggle="modal" data-bs-target="#modificarMenuModal">
              <i class="fa fa-edit"></i> Editar
            </button>`
        },
        {
          data: null,
          title: 'Sub Menú',
          render: (data) =>
            `<a href="#" class="btn btn-outline-info" onclick="verSubMenu(${data.id})">
               <i class="fa fa-search"></i> Administrar
             </a>`
        }
      ]
    });

    // Maneja el evento de clic en los botones "Editar"
    (window as any).$('#tablaMenu').on('click', '.edit-btn', (event: any) => {
      const id = event.currentTarget.getAttribute('data-id');
      this.openEditMenuModal(Number(id));
    });
  }
  //Abre el menú de editar
  openEditMenuModal(id: number): void {
    this.crudService.getById('menu/buscarMenu', id).subscribe(
      (data) => {
        // Rellenar el formulario del modal con los datos obtenidos
        (document.getElementById('menuNombre_edita') as HTMLInputElement).value = data.data.menuNombre;
        (document.getElementById('descripcion_edita') as HTMLInputElement).value = data.data.descripcion;
        (document.getElementById('orden_edita') as HTMLInputElement).value = data.data.orden;
        (document.getElementById('id_menu') as HTMLInputElement).value = data.data.id;
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los datos del menú' + error
        });
      }
    );
  }

  updateMenu(): void {
    // Asegúrate de que idMenuInput esté disponible en el componente
    const idString = this.idMenuInput.nativeElement.value;
    const id = Number(idString); // Convierte el valor a número

    // Verifica si la conversión a número fue exitosa
    if (isNaN(id)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'ID del menú no válido'
      });
      return;
    }

    // Obtén los valores de los campos del formulario de edición
    const menuNombre = (document.getElementById('menuNombre_edita') as HTMLInputElement).value;
    const descripcion = (document.getElementById('descripcion_edita') as HTMLInputElement).value;
    const orden = (document.getElementById('orden_edita') as HTMLInputElement).value;

    // Validar los campos (opcional)
    if (!menuNombre || !descripcion || !orden) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son obligatorios'
      });
      return;
    }

    // Crear un objeto con los datos del menú actualizado
    const menuActualizado = {
      id: id,
      menuNombre: menuNombre,
      descripcion: descripcion,
      orden: parseInt(orden, 10) // Convierte a número el campo 'orden'
    };

    // Enviar los datos al servicio para actualizar el menú en el backend
    this.crudService.update('menu/actualizarMenu', id, menuActualizado).subscribe(
      (response) => {
        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Menú actualizado correctamente'
        });

        // Recargar los datos de la tabla después de la actualización
        this.loadMenuData();

        // Cerrar el modal
        this.modalService.dismissAll();
      },
      (error) => {
        // Manejar errores y mostrar mensaje de error
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar el menú: ' + error.message
        });
      }
    );
  }
}

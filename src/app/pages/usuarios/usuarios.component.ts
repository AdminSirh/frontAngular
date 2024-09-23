import { Component, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { CrudService } from 'src/services/crud.service';
import { CommonModule } from '@angular/common';
import { NgIf, NgFor } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';  
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, ReactiveFormsModule], // Añade CommonModule, NgIf, y NgFor
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],// Asegúrate de usar 'styleUrls' en lugar de 'styleUrl'
  providers: [MessageService]
})
export class UsuariosComponent implements AfterViewInit {
  // MODALES UTILIZADOS CON EL NOMBRE DEL MODAL EN EL HTML
  @ViewChild('agregarUsuarioModal') agregarUsuarioModal!: TemplateRef<any>;
  @ViewChild('editarUsuarioModal') editarUsuarioModal!: TemplateRef<any>;
  @ViewChild('estatusModalActivo') estatusModalActivo!: TemplateRef<any>;
  @ViewChild('estatusModalInactivo') estatusModalInactivo!: TemplateRef<any>;
  @ViewChild('rolesModal') rolesModal!: TemplateRef<any>;
  @ViewChild('passwordModal') passwordModal!: TemplateRef<any>;

  // VARIABLES UTILIZADAS EN EL PROCESO
  errorMessage: string = '';
  datosUsuario: any[] = [];
  datosRoles: any[] = [];
  formUsuario: FormGroup;
  formRoles: FormGroup;
  formContrasena: FormGroup;
  rolesUsuario: string[] = [];
  rolesDisponibles: any[] = [];
  closeResult: string = '';
  private modalRef?: NgbModalRef;
  private table: any;
  idUsuarioSeleccionado: number | null = null;
  idUsuario!: number;

  constructor(
    private crudService: CrudService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private messageService: MessageService,
  ) {
    // FORMULARIO DONDE ALMACENAMOS LAS VARIABLES DEL HTML PARA UTILIZARLAS EN EL PROCESO
    this.formUsuario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
      ap_paterno: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
      ap_materno: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
      usuario: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],

      idUsuario: [''],
      nombre_edita: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(15)]],
      ap_paterno_edita: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(15)]],
      ap_materno_edita: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(15)]],
      usuario_edita: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(15)]]

    });
    
    this.formRoles = this.fb.group({
    });

    this.formContrasena = this.fb.group({
      password_update: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(40)]]
    });
    
  }
  // METODO PARA INICIALIZAR LAS FUNCIONES RECIEN SE CARGUE LA PAGINA
  ngAfterViewInit(): void {
    this.loadUsuariosData();
  }
  // TRAER LA LISTA DE USUARIOS E INICIALIZAR LA TABLA
  private loadUsuariosData(): void {
    this.crudService.getGenerico('usuarios/listarUsuarios').subscribe({
      next: (data) => this.initializeDataTable(data),
      error: (error) => this.handleError('Error al cargar los datos', error)
    })
  }

  // CREAR LA TABLA CON LOS DATOS DE USUARIOS CARGADOS PREVIAMENTE
  private initializeDataTable(data: any[]): void {
    const tableElement = document.querySelector('#usuariosTable') as HTMLTableElement;
    if (tableElement) {
      const dataTable = (window as any).$('#usuariosTable').DataTable();

      if (dataTable) {
        // Limpiar eventos anteriores
        (window as any).$('#usuariosTable').off('click', '.edit-btn');
        dataTable.destroy();
      }

      this.table = (window as any).$('#usuariosTable').DataTable({
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
          { data: 'nombre', title: 'Nombre' },
          { data: 'ap_paterno', title: 'Apellido Paterno' },
          { data: 'ap_materno', title: 'Apellido Materno' },
          { data: 'username', title: 'Usuario' },
          {
            data: null,
            title: 'Editar',
            render: (data: any) => `
              <button type="button" class="btn btn-outline-primary edit-btn" data-id="${data.id}"><span class="fa fa-edit"></span> Editar</button>`
          },
          {
            data: null,
            title: 'Cambiar Activo/Inactivo',
            width: 150,
            visible: true,
            render: (data: any) => {
              const buttonClass = data.activo === 1 ? 'btn-outline-success' : 'btn-outline-danger';
              const buttonText = data.activo === 1 ? 'Desactivar' : 'Activar';
              const action = data.activo === 1 ? 'openinhabilitar' : 'openhabilitar';
              
              return `
                <button type="button" class="btn ${buttonClass} btn-change-status" data-id="${data.id}" data-action="${action}">
                  <span class="fa fa-minus-circle"></span> ${buttonText}
                </button>
              `;
            }
          },
          {
            data: null,
            title: 'Asignar Roles',
            render: (data: any) => `
              <button type="button" class="btn btn-outline-warning roles-btn" data-id="${data.id}"><span class="fa fa-check-circle"> </span> Asignar Roles</button>`
          },
          {
            data: null,
            title: 'Modificar Password',
            render: (data: any) => `
              <button type="button" class="btn btn-outline-primary pass-btn" data-id="${data.id}"><span class="fa fa-lock"></span> Modificar Contraseña</button>`
          }
        ]
      });
      // SE INVOCAN LAS FUNCIONES CON EL NOMBRE DEL BOTON Y LOS PARAMETROS QUE RECIBE
      (window as any).$('#usuariosTable').on('click', '.edit-btn', (event: any) => {
        const id = Number(event.currentTarget.getAttribute('data-id'));
        this.openModalEditar(id);
      });
      (window as any).$('#usuariosTable').on('click', '.btn-change-status', (event: any) => {
        const id = Number(event.currentTarget.getAttribute('data-id'));
        const action = event.currentTarget.getAttribute('data-action');
      
        if (action === 'openinhabilitar') {
          this.openinhabilitar(id);  // Pasamos el 'id' al método
        } else if (action === 'openhabilitar') {
          this.openhabilitar(id);  // Pasamos el 'id' al método
        }
      });
      (window as any).$('#usuariosTable').on('click', '.roles-btn', (event: any) => {
        const id = Number(event.currentTarget.getAttribute('data-id'));
        this.openRoles(id);  // Abre el modal para asignar roles
      });
      (window as any).$('#usuariosTable').on('click', '.pass-btn', (event: any) => {
        const id = Number(event.currentTarget.getAttribute('data-id'));
        this.openModalPassword(id);  // Abre el modal para asignar cambio de contraseña
      });

    }
  }

  //ABRIR EL MODAL PARA AGREGAR USUARIO NUEVO
  openAgregarUsuarioModal(): void {
    this.modalRef = this.modalService.open(this.agregarUsuarioModal);
  }

  // GUARDAR USUARIO
  guardarUsuario(): void {
    if (this.formUsuario.get('nombre')?.valid && this.formUsuario.get('ap_paterno')?.valid && this.formUsuario.get('ap_materno')?.valid && this.formUsuario.get('password')?.valid && this.formUsuario.get('usuario')?.valid) {
      // Obtiene el valor del formulario
      const formValue = this.formUsuario.value;
      const password = formValue.password; // Asegúrate de tener un campo para la contraseña en el form
      const patron = /^(?=.*[A-Z])(?=.*[!@#$&%"'()*+-./_])(?=.*[0-9])(?=.*[a-z]).{8,}$/;
  
      // Transforma los datos para que coincidan con el formato esperado por el endpoint
      const datos = {
        nombre: formValue.nombre,
        ap_paterno: formValue.ap_paterno,
        ap_materno: formValue.ap_materno,
        username: formValue.usuario,
        password: formValue.password // Incluye la contraseña en los datos
      };

      // Llama al servicio para enviar los datos
      this.crudService.postGenerico('usuarios/guardarUsuario', datos).subscribe(
        (response) => {
          this.closeModal(); // Cierra el modal después de guardar
          this.loadUsuariosData();
        },
        (error) => {
          this.errorMessage = 'Error al guardar el usuario';
          console.error('Error al guardar usuario:', error);
        }
      );
    } else {
      this.formUsuario.markAllAsTouched(); // Marca todos los campos como tocados para mostrar errores de validación
    }
  }

  //ABRIR EL MODAL PARA EDITAR USUARIO
  openModalEditar(id: number): void {
    this.closeCurrentModal(); // Cierra cualquier modal abierto previamente.
    this.crudService.getGenerico('usuarios/buscarUsuario', id).subscribe({
    next: (data) => {
      this.formUsuario.patchValue({
        idUsuario: data.id,
        nombre_edita: data.nombre,
        ap_paterno_edita: data.ap_paterno,
        ap_materno_edita: data.ap_materno,
        usuario_edita: data.username
      });
      this.modalRef = this.modalService.open(this.editarUsuarioModal);
    },
    error: (error) => this.handleError('Error al cargar los datos del usuario', error)
    });
  }

  //EDITAR USUARIO
  editarUsuario(): void {
    if (this.formUsuario.get('nombre_edita')?.valid && this.formUsuario.get('ap_paterno_edita')?.valid && this.formUsuario.get('ap_materno_edita')?.valid && this.formUsuario.get('usuario_edita')?.valid) {
      // Obtiene el valor del formulario
      const formValue = this.formUsuario.value;
  
      // Transforma los datos para que coincidan con el formato esperado por el endpoint
      const datos = {
        nombre: formValue.nombre_edita,
        ap_paterno: formValue.ap_paterno_edita,
        ap_materno: formValue.ap_materno_edita,
        username: formValue.usuario_edita
      };
      // Llama al servicio para enviar los datos
      this.crudService.postGenerico('usuarios/actualizarUsuario/' + formValue.idUsuario, datos).subscribe(
        (response) => {
          this.closeModal();
          this.loadUsuariosData();
        },
        (error) => {
          this.errorMessage = 'Error al editar el usuario';
          console.error('Error al editar usuario:', error);
        }
      );
    } else {
      this.formUsuario.markAllAsTouched(); // Marca todos los campos como tocados para mostrar errores de validación
    }
  }

  

  //ABRIR EL MODAL PARA INHABILITAR EL ESTATUS
  openinhabilitar(id: number): void {
    this.closeCurrentModal();
    this.modalRef = this.modalService.open(this.estatusModalActivo);
    this.idUsuarioSeleccionado = id;
  }

  //CAMBIAR EL ESTATUS DEL USUARIO A 0 (INACTIVO)
  inhabilitar(): void {
    // El cuerpo del POST puede ser vacío, ya que solo necesitas cambiar el estado
    const body = {
      idUsuario: this.idUsuarioSeleccionado, // ID del usuario seleccionado
      estado: 0 // Estado que indica que el usuario está inhabilitado
    };
  
    // Llamas al servicio pasando el endpoint y los parámetros
    this.crudService.postGenerico('usuarios/estadoUsuario/' + this.idUsuarioSeleccionado + "/" + 0, body).subscribe(
      (response) => {
        // Acciones posteriores al éxito de la solicitud
        this.loadUsuariosData();
        this.closeModal();
      },
      error => {
        // Manejo de error
        this.errorMessage = 'Error al cambiar el estatus.';
        console.error(error);
      }
    );
  }
  //ABRIR EL MODAL PARA HABILITAR EL ESTATUS
  openhabilitar(id: number): void {
    this.closeCurrentModal();
    this.modalRef = this.modalService.open(this.estatusModalInactivo);
    this.idUsuarioSeleccionado = id;
  }

  //CAMBIAR EL ESTATUS DEL USUARIO A 1 (ACTIVO)
  habilitar(): void {
    // El cuerpo del POST puede ser vacío, ya que solo necesitas cambiar el estado
    const body = {
      idUsuario: this.idUsuarioSeleccionado, // ID del usuario seleccionado
      estado: 1 // Estado que indica que el usuario está inhabilitado
    };

    const formValue = this.formUsuario.value;
    this.crudService.postGenerico('usuarios/estadoUsuario/' + this.idUsuarioSeleccionado + "/" + 1, body).subscribe(
      (response) => {
        this.loadUsuariosData();
        this.closeModal();
      },
      error => {
        this.errorMessage = 'Error al cambiar el estatus.';
        console.error(error);
      }
    );
  }

  //ABRIR EL MODAL DE LOS ROLES QUE LISTA TODOS LOS ROLES DISPONIBLES Y CAMBIA EL BOTÓN DEPENDIENDO LOS ROLES DEL USUARIO SELECCIONADO
  openRoles(id: number): void {
    this.closeCurrentModal();
    this.modalRef = this.modalService.open(this.rolesModal);
    this.idUsuario = id;
    
    // Obtener roles asignados al usuario
    this.crudService.getGenerico(`usuarios/buscarUsuarioRol/${id}`).subscribe({
      next: (response: any) => {
        if (response.data && response.data.length > 0) {
          this.rolesUsuario = response.data.map((rol: any) => rol.rolNombre);
        }
      },
      error: (error) => {
        console.error('Error al buscar roles del usuario:', error);
        alert('Error al cargar los roles del usuario');
      }
    });
    this.crudService.getGenerico('rol/listarRoles').subscribe({
      next: (response: any) => {
        this.rolesDisponibles = response.data;
      },
      error: (error) => {
        console.error('Error al listar roles disponibles:', error);
        alert('Error al cargar los roles disponibles');
      }
    });
    this.rolesUsuario.length = 0;
  }

  //GUARDA UN NUEVO ROL POR USUARIO
  asignarRol(idUsuario: number, idRol: number): void {
    const datos = {
      usuario_id: idUsuario, rol_id: idRol
    };
    this.crudService.postGenerico('usuarios/guardarUsuarioRol', datos).subscribe(
      (response) => {
        this.openRoles(idUsuario);
      },
      (error) => {
        this.errorMessage = 'Error al guardar Rol';
        console.error('Error al guardar Rol:', error);
      }
    );
    
  }

  //ELIMINA UN NUEVO ROL POR USUARIO
  desactivarRol(idUsuario: number, idRol: number): void {

    const datos = {
      usuario_id: idUsuario, rol_id: idRol
    };
    this.crudService.postGenerico('usuarios/eliminarRol/' + idUsuario + '/' + idRol, datos).subscribe(
      (response) => {
        this.openRoles(idUsuario);
      },
      (error) => {
        this.errorMessage = 'Error al desactivar Rol';
        console.error('Error al desactivar Rol:', error);
      }
    );
  }

  //ABRIR EL MODAL PARA EDITAR LA CONTRASEÑA
  openModalPassword(id: number):void {
    this.closeCurrentModal();
    this.modalRef = this.modalService.open(this.passwordModal);
    this.idUsuario = id;
  }

  //OBTENER EL VALOR DEL INPUT Y CAMBIAR LA CONTRASEÑA
  cambiarPassword():void{
    if (this.formContrasena.valid) {
      const formValue = this.formContrasena.value;
      const newPassword = formValue.password_update;
      
      this.crudService.updateById('usuarios/actualizarPassword/' + this.idUsuario, newPassword).subscribe(
        (response) => {
          this.loadUsuariosData();
          this.closeModal();
        },
        (error) => {
          this.errorMessage = 'Error al cambiar la contraseña';
          console.error('Error al cambiar la contraseña:', error);
        }
      );
    } else {
      console.log('Formulario no es válido');
    }
  }

  //MOSTRARLE LOS ERRORES EN PANTALLA AL USUARIO
  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: `${message}: ${error.message || error}`
    });
  }

  //CERRAR UN MODAL PREVIAMENTE ABIERTO
  private closeCurrentModal(): void {
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = undefined;
    }
  }

  //CERRAR CUALQUIER MODAL
  closeModal(): void {
    this.modalService.dismissAll();
  }
}
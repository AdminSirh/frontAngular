import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { CrudService } from 'src/services/crud.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-log-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule, ToastModule, CommonModule, ProgressSpinnerModule],
  templateUrl: './log-usuarios.component.html',
  styleUrls: ['./log-usuarios.component.scss']
})
export class LogUsuariosComponent implements OnInit {
  filtradoForm: FormGroup;
  private table: any;
  loading: boolean = false; // Variable para controlar el estado del spinner

  constructor(
    private crudService: CrudService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.filtradoForm = this.fb.group({
      fechaDesde: ['', Validators.required],
      fechaHasta: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.initializeDataTable([]);
  }

  filtrar(): void {
    if (this.filtradoForm.valid) {
      const { fechaDesde, fechaHasta } = this.filtradoForm.value;
      this.loading = true; // Mostrar el spinner
      this.crudService.getMovimientos(fechaDesde, fechaHasta).subscribe({
        next: (data) => {
          this.initializeDataTable(data);
          this.loading = false; // Ocultar el spinner
        },
        error: (error) => {
          this.handleError('Error al cargar los datos', error);
          this.loading = false; // Ocultar el spinner en caso de error
        }
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Ambas fechas son requeridas.',
        life: 3000
      });
    }
  }

  private initializeDataTable(data: any[]): void {
    const tableElement = document.querySelector('#tabla_log') as HTMLTableElement;

    if (tableElement) {
      const dataTable = (window as any).$('#tabla_log').DataTable();

      if (dataTable) {
        dataTable.destroy();
      }

      this.table = (window as any).$('#tabla_log').DataTable({
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
          { data: 'user_id' },
          { data: 'user_name' },
          { data: 'log_id' },
          { data: 'type' },
          { data: 'operation' },
          { data: 'remote_addr' },
          { data: 'request_uri' },
          { data: 'method' },
          { data: 'params' },
          { data: 'createdAt' }
        ]
      });
    }
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: `${message}: ${error.message || error}`
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Importa el Router
import { CommonModule } from '@angular/common';
import { CrudService } from 'src/services/crud.service';

@Component({
  selector: 'app-lista-catalogos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-catalogos.component.html',
  styleUrls: ['./lista-catalogos.component.scss']
})
export class ListaCatalogosComponent implements OnInit {
  catalogos: string[] = []; // Cambiar el tipo a string[]

  constructor(
    private crudService: CrudService,
    private router: Router
  ) {} // Inyecta el Router

  ngOnInit(): void {
    this.obtenerCatalogos();
  }

  obtenerCatalogos(): void {
    this.crudService.getGenerico('informacionTablas/listarTablasCatalogos').subscribe(
      (data) => {
        this.catalogos = data; // Asigna la respuesta directamente
      },
      (error) => {
        console.error('Error al obtener los catálogos:', error);
      }
    );
  }

  formatearCatalogo(catalogo: string): string {
    // Convierte el nombre del catálogo a formato legible
    return catalogo
      .replace(/_/g, ' ') // Reemplaza guiones bajos por espacios
      .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitaliza cada palabra
  }

  redirigir(catalogo: string): void {
    this.router.navigate(['/administraCatalogo'], { queryParams: { catalogo } }); // Redirige con el nombre original
  }
}

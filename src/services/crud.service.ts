import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import baseUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  constructor(private http: HttpClient) {}

  // Método para obtener todos los registros
  getAll(endpoint: string): Observable<any> {
    return this.http.get(`${baseUrl}/${endpoint}`);
  }

  // Método para obtener un solo registro por ID
  getById(endpoint: string, id: number | string): Observable<any> {
    return this.http.get(`${baseUrl}/${endpoint}/${id}`);
  }

  // Método para crear un nuevo registro
  create(endpoint: string, data: any): Observable<any> {
    return this.http.post(`${baseUrl}/${endpoint}`, data);
  }

  // Método para actualizar un registro con parámetros adicionales en la URL
  update(
    endpoint: string,
    id: number | string,
    data?: any,
    esConParametros: boolean = false,
    params?: (string | number)[]
  ): Observable<any> {
    let url = `${baseUrl}/${endpoint}/${id}`;

    if (esConParametros && params && params.length > 0) {
      // Añadir múltiples parámetros adicionales a la URL
      url += `/${params.join('/')}`;
      return this.http.get(url);
    } else {
      // Si no hay parámetros adicionales, enviar datos en el cuerpo
      return this.http.post(url, data);
    }
  }

  // Método para eliminar un registro por ID
  delete(endpoint: string, id: number | string): Observable<any> {
    return this.http.delete(`${baseUrl}/${endpoint}/${id}`);
  }

  // Nuevo método para desactivar un rol con parámetros en la URL
  desactivarRol(submenuId: number, rolId: number, datos: any): Observable<any> {
    const url = `${baseUrl}/submenu/eliminarRol/${submenuId}/${rolId}`;
    return this.http.post(url, datos);
  }

  cambiarContrasena(passwordNuevo: string, datos: any): Observable<any> {
    const url = `${baseUrl}/usuarios/cambiaContrasena/${passwordNuevo}`;
    return this.http.post(url, datos, { headers: { 'Content-Type': 'application/json' } });
  }

  // Método para verificar la contraseña actual del usuario
  verificarPassword(password: string): Observable<any> {
    const url = `${baseUrl}/usuarios/verificarPassword/${password}`;
    return this.http.get(url);
  }

  // Método para recuperar movimientos por fechas
  getMovimientos(desde: string, hasta: string): Observable<any> {
    const url = `${baseUrl}/adminLog/listarMovimientos/${desde}/${hasta}`;
    return this.http.get<any>(url);
  }
}

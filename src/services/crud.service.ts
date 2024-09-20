import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import baseUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  constructor(private http: HttpClient) {}

  // Método genérico para realizar cualquier operación POST con múltiples parámetros o sin ellos
  postGenerico(endpoint: string, body: any = {}, ...params: any[]): Observable<any> {
    const url = params.length ? `${baseUrl}/${endpoint}/${params.join('/')}` : `${baseUrl}/${endpoint}`;
    return this.http.post<any>(url, body);
  }

  // Método genérico para recuperar datos con múltiples parámetroso sin ellos
  getGenerico(endpoint: string, ...params: any[]): Observable<any> {
    const url = params.length ? `${baseUrl}/${endpoint}/${params.join('/')}` : `${baseUrl}/${endpoint}`;
    return this.http.get<any>(url);
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

  cambiarContrasena(passwordNuevo: string, datos: any): Observable<any> {
    const url = `${baseUrl}/usuarios/cambiaContrasena/${passwordNuevo}`;
    return this.http.post(url, datos, { headers: { 'Content-Type': 'application/json' } });
  }
}

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

  // Método para actualizar un registro por ID
  update(endpoint: string, id: number | string, data: any): Observable<any> {
    return this.http.put(`${baseUrl}/${endpoint}/${id}`, data);
  }

  // Método para eliminar un registro por ID
  delete(endpoint: string, id: number | string): Observable<any> {
    return this.http.delete(`${baseUrl}/${endpoint}/${id}`);
  }
}

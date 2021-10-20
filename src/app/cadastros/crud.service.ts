import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor(private http: HttpClient) { }

  getItems(component): Observable<any> {
    return this.http.get(`${environment.apiUrl}/${component}`);
  }

  getItemById(component: string, id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/${component}/${id}/`);
  }

  deleteItem(component: string, id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/${component}/${id}/`);
  }

  createItem(component: string, item: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/${component}/`, item);
  }

  updateItem(component: string, item: any, id: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/${component}/${id}/`, item);
  }

}

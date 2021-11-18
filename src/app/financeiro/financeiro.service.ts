import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FinanceiroService {

  constructor(private http: HttpClient) { }

  // CRUD ====
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
  // ====

  getDateBeteween(component: string, item: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/${component}/`, item);
  }

  createVenda(item:any): Observable<any> {
    console.log(item)
    return this.http.post(`${environment.apiUrl}/saveBaglist/`, item);
  }

  // Situação para o contas a pagar e receber
  getSituation(): any[]{
    const situation = [
      {status: 'Cancelado'},
      {status: 'Pago'},
      {status: 'Pendente'},
      {status: 'Recebido'}
    ];
    return situation;
  }

  // Tipo para o contas a pagar e receber
  getType(): any[]{
    const type = [
      {status: 'A pagar'},
      {status: 'A receber'},
    ]
    return type;
  }
}

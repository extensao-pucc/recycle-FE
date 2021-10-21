import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FinanceiroService {

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

  // Situação para o contas a pagar e receber
  getSituation(): any[]{
    const situation = [
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
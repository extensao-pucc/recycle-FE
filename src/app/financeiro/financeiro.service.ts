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
}

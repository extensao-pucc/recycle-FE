import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SharedVariableService } from '../shared/shared-variable.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportManagementService {

  constructor(
    private http: HttpClient,
    private sharedVariableService: SharedVariableService
  ) { }

  getHistory(item: any): Observable<any> {
    return this.http.get(`${environment.apiUrl}/movimentacoes`);
  }

  getDateBeteween(component: string, item: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/${component}/`, item);
  }
}

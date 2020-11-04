import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PesquisaCepService {

  constructor(private http: HttpClient) { }

  pesquisarCep(cep: string): Observable<any> {
    return this.http.get(`https://api.postmon.com.br/v1/cep/${cep}`);
  }
}

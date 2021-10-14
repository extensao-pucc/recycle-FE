import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,
    private router: Router,
    ) { }

  onLogin(person: any): Observable<any>{
    return this.http.post(`${environment.apiUrl}/login/`, person);
  }

  onLogout(): any{
    localStorage.removeItem('token');
    localStorage.removeItem('person');
    window.location.reload();
  }
}

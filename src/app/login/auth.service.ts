import { Usuario } from './usuario';
import { Injectable, EventEmitter } from '@angular/core';
import { UserService } from '../shared/user.service';
import { Router } from '@angular/router';
import { ToastService } from '../shared/toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usuarioAutenticado : boolean = false;
  hiddenNavBar = new EventEmitter<boolean>();

  constructor(
    private toastService: ToastService,
    private UserService: UserService,
    private router: Router,
  ) { }

  Login(usuario: Usuario){
    this.UserService.onLogin(usuario).subscribe (response => {

      if (response.mssg === 'Usuario encontrado'){
        localStorage.setItem('person', JSON.stringify(response.person));
        localStorage['token'] = response.token;

        this.usuarioAutenticado = true;
        this.hiddenNavBar.emit(true);
        this.router.navigate(['home']);
      } else {
        this.toastService.addToast(response.mssg, 'darkred');
        this.usuarioAutenticado = false
        this.hiddenNavBar.emit(false);
      }
    }, err => {
      this.toastService.addToast('Usuario e/ou senha inválido', 'darkred');
      console.log('Deu erro nisso aqui: \n', err);
    });
  }
}

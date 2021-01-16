import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public user;
  public password;
  public person = { 
    matricula: '', 
    senha: '' 
 };

  constructor(
    private router: Router,
    private toastService: ToastService,
    private UserService: UserService,
    ) { }
 
  ngOnInit(): void {}

  LogIn(): void {
    this.person = {matricula: this.user, senha: this.password}

    this.UserService.onLogin(this.person).subscribe ( response => {
        if (response !== 'Usuário ou senha incorretos'){
          localStorage['token'] = 'xptoh26410x5=50';
          this.router.navigate(['home']);
        } else {
          this.toastService.addToast('Usuario ou senha incorretos', 'darkred');
        }
      }, err => {
        this.toastService.addToast('Usuario ou senha incorretos', 'darkred');
        console.log('Deu erro nisso aqui: \n', err);
      }
    );
  }
}

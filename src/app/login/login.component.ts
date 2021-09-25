import { Usuario } from './usuario';
import { AuthService } from './auth.service';
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
  public showPassWord = false;
  public  person: Usuario = new Usuario();

  constructor(private AuthService: AuthService) {}

  ngOnInit(): void {}

  LogIn(): void {
    this.AuthService.Login(this.person);
  }

  password(): void {
    this.showPassWord = !this.showPassWord;
}
}

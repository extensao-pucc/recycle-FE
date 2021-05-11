import { CanDeactivate } from '@angular/router';
import { Component } from '@angular/core';
import { AuthService } from './login/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public toastBg = '';

  viewNavBar: boolean = false;

  constructor(private AuthService: AuthService){}

  ngOnInit(){
    if (localStorage['token'] != null) {
      this.viewNavBar = true;
    }
  
    this.AuthService.hiddenNavBar.subscribe(
      mostrar => this.viewNavBar = mostrar
    );
  }
}

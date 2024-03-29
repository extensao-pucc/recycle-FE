import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  private storegePersonObject = JSON.parse(localStorage.getItem('person'));
  public person = { 
    nome: this.storegePersonObject['nome'],
    foto: (this.storegePersonObject.foto) ?`${environment.apiUrl}${this.storegePersonObject.foto}` : null, 
  };

  constructor(private UserService: UserService) {
    // console.log(this.storegePersonObject);
  }

  ngOnInit(): void {
  }

  logOut(): void{
    this.UserService.onLogout();
  }

  navbarOpen = false;

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  
}

import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  constructor(private UserService: UserService) {}
  private storegePersonObject = JSON.parse(localStorage.getItem('person'));
  public person = {
    nome: this.storegePersonObject['nome'],
    foto: (this.storegePersonObject.foto) ? `${environment.apiUrl}${this.storegePersonObject.foto}` : null,
  };

  navbarOpen = false;

  ngOnInit(): void {
  }

  logOut(): void{
    this.UserService.onLogout();
  }

  toggleNavbar(): any {
    this.navbarOpen = !this.navbarOpen;
  }
}

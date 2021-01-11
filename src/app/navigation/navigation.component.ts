import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  constructor(private UserService: UserService) { }

  ngOnInit(): void {
  }

  logOut(): void{
    this.UserService.onLogout();
  }
}

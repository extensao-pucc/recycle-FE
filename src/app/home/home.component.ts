import { Component, OnInit } from '@angular/core';
import { AuthGuard } from '../guards/auth.guard';
import {Router, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private authGuard: AuthGuard,
    private router:Router, 
    private route: ActivatedRoute
    ) { }

  ngOnInit(): void {
    // if (!this.authGuard.canActivate) {
    //   this.router.navigate(['']);
    // }
  }
}

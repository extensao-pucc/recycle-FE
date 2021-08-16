import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contas',
  templateUrl: './contas.component.html',
  styleUrls: ['./contas.component.css']
})
export class ContasComponent implements OnInit {

  constructor() { 
    // $(document).ready(function(){
    //   $('.datepicker').datepicker({
    //     prevText: '<i class="fa fa-fw fa-angle-left"></i>',
    //     nextText: '<i class="fa fa-fw fa-angle-right"></i>'
    //   });
    // });
  }

  ngOnInit(): void {
  }
}

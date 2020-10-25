import { Component, OnInit } from '@angular/core';
<<<<<<< HEAD
=======
import { CondicoesDePagamentoService } from './condicoes-de-pagamento.service';

>>>>>>> 810816b8e9a68586f3a93e19fb1184438fb363a4

@Component({
  selector: 'app-condicoes-de-pagamento',
  templateUrl: './condicoes-de-pagamento.component.html',
  styleUrls: ['./condicoes-de-pagamento.component.css']
})
export class CondicoesDePagamentoComponent implements OnInit {

<<<<<<< HEAD
  constructor() { }

  ngOnInit(): void {
=======
  constructor(private condicoesDePagamentoService: CondicoesDePagamentoService) { }

  public lista: any;

  ngOnInit(): void {
    this.condicoesDePagamentoService.lista().subscribe(response => {
      console.log(response)
    });
>>>>>>> 810816b8e9a68586f3a93e19fb1184438fb363a4
  }

}

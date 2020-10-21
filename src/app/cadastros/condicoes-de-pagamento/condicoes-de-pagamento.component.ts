import { Component, OnInit } from '@angular/core';
import { CondicoesDePagamentoService } from './condicoes-de-pagamento.service';


@Component({
  selector: 'app-condicoes-de-pagamento',
  templateUrl: './condicoes-de-pagamento.component.html',
  styleUrls: ['./condicoes-de-pagamento.component.css']
})
export class CondicoesDePagamentoComponent implements OnInit {

  constructor(private condicoesDePagamentoService: CondicoesDePagamentoService) { }

  public lista: any;

  ngOnInit(): void {
    this.condicoesDePagamentoService.lista().subscribe(response => {
      console.log(response)
    });
  }

}

import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CrudService } from '../../cadastros/crud.service';
import { SharedVariableService } from '../../shared/shared-variable.service';

@Component({
  selector: 'app-historico-de-produto',
  templateUrl: './historico-de-produto.component.html',
  styleUrls: ['./historico-de-produto.component.css']
})
export class HistoricoDeProdutoComponent implements OnInit {
  produtos: any;
  movimentacoes: any;

  constructor(
    private crudService: CrudService,
    private formBuilder: FormBuilder,
    private sharedVariableService: SharedVariableService,
  ) { }
  public headForm;
  public socios;

  ngOnInit(): void {
    this.getItems();
    this.loadForm();
  }

  getItems(): void {
    this.crudService.getItems('produtos').subscribe(response => { this.produtos = response; });
    this.crudService.getItems('movimentacoes').subscribe(response => { this.movimentacoes = response; });
  }

  loadForm(): void {
    this.headForm = this.formBuilder.group({
      product: [null],
      inicio: [null],
      fim: [null]
    })
  }

}

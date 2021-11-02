import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CrudService } from '../../cadastros/crud.service';
import { SharedVariableService } from '../../shared/shared-variable.service';
import * as _ from 'lodash-es';

@Component({
  selector: 'app-historico-de-produto',
  templateUrl: './historico-de-produto.component.html',
  styleUrls: ['./historico-de-produto.component.css']
})
export class HistoricoDeProdutoComponent implements OnInit {
  public produtos: any;
  public movimentacoes: any;
  public tempItemsList: any;

  public socios: any;
  public headForm: any;
  public showForm = false;

  constructor(
    private crudService: CrudService,
    private formBuilder: FormBuilder,
    private sharedVariableService: SharedVariableService,
  ) { }

  ngOnInit(): void {
    this.getItems();
    this.loadForm();
  }

  // =========== Busca personalizada ====================================================
  Search(campo: any, valor: any): any{
    this.tempItemsList = _.clone(this.tempItemsList);

    if (valor !== ''){
      this.tempItemsList = this.movimentacoes.filter(res => {
        return res[campo].id.toString().trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(
               valor.toString().trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''
              ));
      });
    } else if (valor === '') {
      this.ngOnInit();
    }
  }

  getItems(): void {
    this.crudService.getItems('precificacao').subscribe(response => { this.produtos = response; });
    this.crudService.getItems('movimentacoes').subscribe(response => {
      this.movimentacoes = response.sort((a, b) => (a.data > b.data) ? -1 : 1);
      this.tempItemsList = _.clone(this.movimentacoes);
    });
  }

  loadForm(): void {
    this.headForm = this.formBuilder.group({
      product: [null],
      inicio: [null],
      fim: [null]
    });
  }

}

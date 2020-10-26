import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CrudService } from '../crud.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-produtos',
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.css']
})
export class ProdutosComponent implements OnInit {
  public tempItemsList: any;
  public itemsList: any;
  public itemForm: any;
  public showForm = false;

  constructor(
    private crudService: CrudService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.getItems();
    this.loadForm();
  }

  loadForm(): void {
    this.itemForm = this.formBuilder.group({
      id: [null],
      codigo: ['', Validators.required],
      descricao: ['', Validators.required],
      familia: ['', Validators.required],
      fornecedor: ['', Validators.required],
      qualidade: ['', Validators.required],
      unidade_de_medida: [''],
      NCM: ['', Validators.required],
      CSTE: ['', Validators.required],
      CSTS: ['', Validators.required],
      CFOPE: ['', Validators.required],
      CFOPS: ['', Validators.required],
      preco_compra: ['', Validators.required],
      preco_venda: ['', Validators.required]
    });
  }

  getItems(): void {
    this.crudService.getItems('produtos').subscribe(response => {
      this.itemsList = response;
      this.tempItemsList = _.clone(this.itemsList);
    });
  }

  deleteItem(id): void {
    this.crudService.deleteItem('produtos', id).subscribe(response => {
      this.getItems();
    });
  }

  updateItem(item: any): void {
    this.showForm = true;

    this.itemForm.controls.id.setValue(item.id);
    this.itemForm.controls.descricao.setValue(item.codigo);
    this.itemForm.controls.descricao.setValue(item.descricao);
    this.itemForm.controls.descricao.setValue(item.familia);
    this.itemForm.controls.descricao.setValue(item.fornecedor);
    this.itemForm.controls.descricao.setValue(item.qualidade);
    this.itemForm.controls.descricao.setValue(item.unidade_de_medida);
    this.itemForm.controls.descricao.setValue(item.NCM);
    this.itemForm.controls.descricao.setValue(item.CSTE);
    this.itemForm.controls.descricao.setValue(item.CSTS);
    this.itemForm.controls.descricao.setValue(item.CFOPE);
    this.itemForm.controls.descricao.setValue(item.CFOPS);
    this.itemForm.controls.descricao.setValue(item.preco_compra);
    this.itemForm.controls.descricao.setValue(item.preco_venda);
  }

  createUpdateItem(): void {
    this.showForm = false;
    const formValues = this.itemForm.value;

    if (formValues.id) {
      this.crudService.updateItem('produtos', formValues, formValues.id).subscribe(response => {
        this.getItems();
      });
    } else {
      this.crudService.createItem('produtos', formValues).subscribe(response => {
        this.getItems();
      });
    }

    this.loadForm();
  }

}

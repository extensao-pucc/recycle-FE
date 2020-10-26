import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CrudService } from '../crud.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-transportadoras',
  templateUrl: './transportadoras.component.html',
  styleUrls: ['./transportadoras.component.css']
})
export class TransportadorasComponent implements OnInit {
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
      CNPJ_CPF: ['', Validators.required],
      razao_social_nome: ['', Validators.required],
      IE: ['', Validators.required],
      endereco: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      CEP: ['', Validators.required],
      UF: ['', Validators.required],
      cidade: ['', Validators.required],
      telefone: ['', Validators.required],
      email: ['', Validators.required]
    });
  }

  getItems(): void {
    this.crudService.getItems('transportadoras').subscribe(response => {
      this.itemsList = response;
      this.tempItemsList = _.clone(this.itemsList);
    });
  }

  deleteItem(id): void {
    this.crudService.deleteItem('transportadoras', id).subscribe(response => {
      this.getItems();
    });
  }

  updateItem(item: any): void {
    this.showForm = true;

    this.itemForm.controls.id.setValue(item.id);
    this.itemForm.controls.descricao.setValue(item.CNPJ_CPF);
    this.itemForm.controls.descricao.setValue(item.razao_social_nome);
    this.itemForm.controls.descricao.setValue(item.IE);
    this.itemForm.controls.descricao.setValue(item.endereco);
    this.itemForm.controls.descricao.setValue(item.numero);
    this.itemForm.controls.descricao.setValue(item.complemento);
    this.itemForm.controls.descricao.setValue(item.bairro);
    this.itemForm.controls.descricao.setValue(item.CEP);
    this.itemForm.controls.descricao.setValue(item.descricao);
    this.itemForm.controls.descricao.setValue(item.UF);
    this.itemForm.controls.descricao.setValue(item.cidade);
    this.itemForm.controls.descricao.setValue(item.telefone);
    this.itemForm.controls.descricao.setValue(item.email);
  }

  createUpdateItem(): void {
    this.showForm = false;
    const formValues = this.itemForm.value;

    if (formValues.id) {
      this.crudService.updateItem('transportadoras', formValues, formValues.id).subscribe(response => {
        this.getItems();
      });
    } else {
      this.crudService.createItem('transportadoras', formValues).subscribe(response => {
        this.getItems();
      });
    }

    this.loadForm();
  }


}

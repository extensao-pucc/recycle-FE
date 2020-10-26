import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CrudService } from '../crud.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-natureza-das-operacoes',
  templateUrl: './natureza-das-operacoes.component.html',
  styleUrls: ['./natureza-das-operacoes.component.css']
})
export class NaturezaDasOperacoesComponent implements OnInit {
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
      tipo: ['', Validators.required]
    });
  }

  getItems(): void {
    this.crudService.getItems('naturezaDasOperacoes').subscribe(response => {
      this.itemsList = response;
      this.tempItemsList = _.clone(this.itemsList);
    });
  }

  deleteItem(id): void {
    this.crudService.deleteItem('naturezaDasOperacoes', id).subscribe(response => {
      this.getItems();
    });
  }

  updateItem(item: any): void {
    this.showForm = true;

    this.itemForm.controls.id.setValue(item.id);
    this.itemForm.controls.descricao.setValue(item.codigo);
    this.itemForm.controls.descricao.setValue(item.descricao);
    this.itemForm.controls.descricao.setValue(item.tipo);
  }

  createUpdateItem(): void {
    this.showForm = false;
    const formValues = this.itemForm.value;

    if (formValues.id) {
      this.crudService.updateItem('naturezaDasOperacoes', formValues, formValues.id).subscribe(response => {
        this.getItems();
      });
    } else {
      this.crudService.createItem('naturezaDasOperacoes', formValues).subscribe(response => {
        this.getItems();
      });
    }

    this.loadForm();
  }

}

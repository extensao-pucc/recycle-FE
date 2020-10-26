import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CrudService } from '../crud.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-prensas',
  templateUrl: './prensas.component.html',
  styleUrls: ['./prensas.component.css']
})
export class PrensasComponent implements OnInit {
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
      numero: ['', Validators.required],
      descricao: ['', Validators.required],
      detalhes_tecnicos: ['', Validators.required]
    });
  }

  getItems(): void {
    this.crudService.getItems('prensas').subscribe(response => {
      this.itemsList = response;
      this.tempItemsList = _.clone(this.itemsList);
    });
  }

  deleteItem(id): void {
    this.crudService.deleteItem('prensas', id).subscribe(response => {
      this.getItems();
    });
  }

  updateItem(item: any): void {
    this.showForm = true;

    this.itemForm.controls.id.setValue(item.id);
    this.itemForm.controls.descricao.setValue(item.numero);
    this.itemForm.controls.descricao.setValue(item.descricao);
    this.itemForm.controls.descricao.setValue(item.detalhes_tecnicos);
  }

  createUpdateItem(): void {
    this.showForm = false;
    const formValues = this.itemForm.value;

    if (formValues.id) {
      this.crudService.updateItem('prensas', formValues, formValues.id).subscribe(response => {
        this.getItems();
      });
    } else {
      this.crudService.createItem('prensas', formValues).subscribe(response => {
        this.getItems();
      });
    }

    this.loadForm();
  }
}

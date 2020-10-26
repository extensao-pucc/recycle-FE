import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CrudService } from '../crud.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-qualidades',
  templateUrl: './qualidades.component.html',
  styleUrls: ['./qualidades.component.css']
})
export class QualidadesComponent implements OnInit {
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
      nome: ['', Validators.required]
    });
  }

  getItems(): void {
    this.crudService.getItems('qualidades').subscribe(response => {
      this.itemsList = response;
      this.tempItemsList = _.clone(this.itemsList);
    });
  }

  deleteItem(id): void {
    this.crudService.deleteItem('qualidades', id).subscribe(response => {
      this.getItems();
    });
  }

  updateItem(item: any): void {
    this.showForm = true;

    this.itemForm.controls.id.setValue(item.id);
    this.itemForm.controls.descricao.setValue(item.descricao);
  }

  createUpdateItem(): void {
    this.showForm = false;
    const formValues = this.itemForm.value;

    if (formValues.id) {
      this.crudService.updateItem('qualidades', formValues, formValues.id).subscribe(response => {
        this.getItems();
      });
    } else {
      this.crudService.createItem('qualidades', formValues).subscribe(response => {
        this.getItems();
      });
    }

    this.loadForm();
  }
}

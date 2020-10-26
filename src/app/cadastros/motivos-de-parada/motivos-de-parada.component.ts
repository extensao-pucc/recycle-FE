import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CrudService } from '../crud.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-motivos-de-parada',
  templateUrl: './motivos-de-parada.component.html',
  styleUrls: ['./motivos-de-parada.component.css']
})
export class MotivosDeParadaComponent implements OnInit {
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
      motivo: ['', Validators.required]
    });
  }

  getItems(): void {
    this.crudService.getItems('motivosDeParada').subscribe(response => {
      this.itemsList = response;
      this.tempItemsList = _.clone(this.itemsList);
    });
  }

  deleteItem(id): void {
    this.crudService.deleteItem('motivosDeParada', id).subscribe(response => {
      this.getItems();
    });
  }

  updateItem(item: any): void {
    this.showForm = true;

    this.itemForm.controls.id.setValue(item.id);
    this.itemForm.controls.descricao.setValue(item.motivo);
  }

  createUpdateItem(): void {
    this.showForm = false;
    const formValues = this.itemForm.value;

    if (formValues.id) {
      this.crudService.updateItem('motivosDeParada', formValues, formValues.id).subscribe(response => {
        this.getItems();
      });
    } else {
      this.crudService.createItem('motivosDeParada', formValues).subscribe(response => {
        this.getItems();
      });
    }

    this.loadForm();
  }
}

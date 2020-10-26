import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CrudService } from '../crud.service';
import * as _ from 'lodash';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
@Component({
  selector: 'app-condicoes-de-pagamento',
  templateUrl: './condicoes-de-pagamento.component.html',
  styleUrls: ['./condicoes-de-pagamento.component.css']
})
export class CondicoesDePagamentoComponent implements OnInit {
  public tempItemsList: any;
  public itemsList: any;
  public itemForm: any;
  public showForm = false;
  public yesNoMessage: YesNoMessage = new YesNoMessage();
  public showYesNoMessage: boolean;

  constructor(
    private crudService: CrudService,
    private toastService: ToastService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.getItems();
    this.loadForm();
  }

  loadForm(): void {
    this.itemForm = this.formBuilder.group({
      id: [null],
      descricao: ['', Validators.required]
    });
  }

  getItems(): void {
    this.crudService.getItems('condicoesDePagamento').subscribe(response => {
      this.itemsList = response;
      this.tempItemsList = _.clone(this.itemsList);
    });
  }

  deleteItem(id): void {
    this.crudService.deleteItem('condicoesDePagamento', id).subscribe(response => {
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
      this.crudService.updateItem('condicoesDePagamento', formValues, formValues.id).subscribe(response => {
        this.getItems();
      });
    } else {
      this.crudService.createItem('condicoesDePagamento', formValues).subscribe(response => {
        this.getItems();
      });
    }

    this.loadForm();
  }

  test(): void {
    this.yesNoMessage = {
      title: `teste titulo`,
      mainText: 'teste body',
      items: [`bla bla bla`],
      fontAwesomeClass: 'fa-ban',
      action: {
        onClickYes: () => {
          console.log('funfoooo')
        },
        onClickNo: () => {
          console.log('tchaaalll')
        }
      }
    };
    this.showYesNoMessage = true;
  }

  test2(): void {
    this.toastService.addToast("cadu monstrao", "darkred");
  }

}

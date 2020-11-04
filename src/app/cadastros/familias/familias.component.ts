import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CrudService } from '../crud.service';
import * as _ from 'lodash';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { FormValidatorService } from '../../shared/formValidator/form-validator.service';


@Component({
  selector: 'app-familias',
  templateUrl: './familias.component.html',
  styleUrls: ['./familias.component.css', '../../app.component.css']
})
export class FamiliasComponent implements OnInit {
  public tempItemsList: any;
  public itemsList: any;
  public itemForm: any;
  public showForm = false;
  public yesNoMessage: YesNoMessage = new YesNoMessage();
  public showYesNoMessage: boolean;

  constructor(
    private crudService: CrudService,
    private toastService: ToastService,
    private formBuilder: FormBuilder,
    private formValidatorService: FormValidatorService

  ) { }

  ngOnInit(): void {
    this.getItems();
    this.loadForm();
  }

  loadForm(): void {
    this.itemForm = this.formBuilder.group({
      id: [null],
      nome: ['', [this.formValidatorService.isEmpty]]
    });
  }

  getItems(): void {
    this.crudService.getItems('familias').subscribe(response => {
      this.itemsList = response;
      this.tempItemsList = _.clone(this.itemsList);
    });
  }

  deleteItem(id): void {
    this.crudService.deleteItem('familias', id).subscribe(response => {
      this.getItems();
      this.toastService.addToast('Deletado com sucesso');
    }, err => {
      this.toastService.addToast(err['message'], 'darkred');
    });

    this.showForm = false;
  }

  updateItem(item: any): void {
    this.showForm = true;

    this.itemForm.controls.id.setValue(item.id);
    this.itemForm.controls.nome.setValue(item.nome);
  }

  createUpdateItem(): void {
    const formValues = this.itemForm.value;

    if (this.itemForm.status === 'VALID'){
      if (formValues.id) {
        this.crudService.updateItem('familias', formValues, formValues.id).subscribe(response => {
          this.getItems();
          this.toastService.addToast('Atualizado com sucesso');
        }, err => {
          this.toastService.addToast(err['message'], 'darkred');
        });
      } else {
        this.crudService.createItem('familias', formValues).subscribe(response => {
          this.getItems();
          this.toastService.addToast('Cadastrado com sucesso');
          }, err => {
            this.toastService.addToast(err['message'], 'darkred');
          });
        }
      this.showForm = false;
      this.loadForm();
    } else {
      this.toastService.addToast('Corrija os erros para continuar', 'darkred');
    }

  }

  showModal(title: string, items: any): void {
    const formValues = this.itemForm.value;

    this.yesNoMessage = {
      title,
      mainText: 'Tem certeza que deseja ' + title.toLowerCase(),
      items: [title === 'Deletar' ? items.nome : formValues.nome],
      fontAwesomeClass: 'fa-ban',
      action: {
        onClickYes: () => {
          if (title === 'Salvar'){
            this.createUpdateItem();
          } else if (title === 'Deletar'){
            (items.id) ? this.deleteItem(items.id) : this.deleteItem(items);
          } else if (title === 'Cancelar edição') {
            this.showForm = false;
            this.loadForm();
          }
        },
        onClickNo: () => { }
      }
    };
    this.showYesNoMessage = true;
  }
}

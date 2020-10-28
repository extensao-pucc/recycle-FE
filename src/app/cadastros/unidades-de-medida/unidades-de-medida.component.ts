import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CrudService } from '../crud.service';
import * as _ from 'lodash';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { FormValidatorService } from '../../shared/formValidator/form-validator.service';

@Component({
  selector: 'app-unidades-de-medida',
  templateUrl: './unidades-de-medida.component.html',
  styleUrls: ['./unidades-de-medida.component.css']
})
export class UnidadesDeMedidaComponent implements OnInit {
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
      sigla: ['', [this.formValidatorService.isEmpty]],
      descricao: ['', [this.formValidatorService.isEmpty]],
    });
  }

  getItems(): void {
    this.crudService.getItems('unidadesDeMedida').subscribe(response => {
      this.itemsList = response;
      this.tempItemsList = _.clone(this.itemsList);
    });
  }

  deleteItem(id): void {
    this.crudService.deleteItem('unidadesDeMedida', id).subscribe(response => {
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
    this.itemForm.controls.sigla.setValue(item.sigla);
    this.itemForm.controls.descricao.setValue(item.descricao);
  }

  createUpdateItem(): void {
    const formValues = this.itemForm.value;

    if (this.itemForm.status === 'VALID'){
      if (formValues.id) {
        this.crudService.updateItem('unidadesDeMedida', formValues, formValues.id).subscribe(response => {
          this.getItems();
          this.toastService.addToast('Atualizado com sucesso');
        }, err => {
          this.toastService.addToast(err['message'], 'darkred');
        });
      } else {
        this.crudService.createItem('unidadesDeMedida', formValues).subscribe(response => {
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
      items: [title === 'Deletar' ? items.sigla : formValues.sigla],
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

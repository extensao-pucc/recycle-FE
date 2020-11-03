import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CrudService } from '../crud.service';
import * as _ from 'lodash';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { FormValidatorService } from '../../shared/formValidator/form-validator.service';
import { SharedVariableService } from '../../shared/shared-variable.service';

@Component({
  selector: 'app-fornecedores',
  templateUrl: './fornecedores.component.html',
  styleUrls: ['./fornecedores.component.css']
})
export class FornecedoresComponent implements OnInit {
  public tempItemsList: any;
  public itemsList: any;
  public itemForm: any;
  public showForm = false;
  public yesNoMessage: YesNoMessage = new YesNoMessage();
  public showYesNoMessage: boolean;

  public states: any;

  constructor(
    private crudService: CrudService,
    private toastService: ToastService,
    private formBuilder: FormBuilder,
    private formValidatorService: FormValidatorService,
    private sharedVariableService: SharedVariableService
  ) {
    this.states = this.sharedVariableService.getStates();
  }

  ngOnInit(): void {
    this.getItems();
    this.loadForm();
  }

  validateForm(): boolean {
    const formValues = this.itemForm.value;
    return true;
  }

  loadForm(): void {
    this.itemForm = this.formBuilder.group({
      id: [null],
      CNPJ_CPF: ['', [this.formValidatorService.isEmpty, this.formValidatorService.validCPF_CNPJ]],
      razao_social_nome: ['', [this.formValidatorService.isEmpty]],
      IE: ['', [this.formValidatorService.isEmpty, this.formValidatorService.isNumeric]],
      endereco: ['', [this.formValidatorService.isEmpty]],
      numero: ['', [this.formValidatorService.isEmpty, this.formValidatorService.isNumeric]],
      complemento: [''],
      bairro: ['', [this.formValidatorService.isEmpty]],
      CEP: ['', [this.formValidatorService.isEmpty, this.formValidatorService.validCEP]],
      UF: ['', [this.formValidatorService.isEmpty]],
      cidade: ['', [this.formValidatorService.isEmpty]],
      telefone: ['', [this.formValidatorService.isEmpty, this.formValidatorService.validTelefone]],
      email: ['', [this.formValidatorService.isEmpty, this.formValidatorService.validEmail]]
    });
  }

  getItems(): void {
    this.crudService.getItems('fornecedores').subscribe(response => {
      this.itemsList = response;
      this.tempItemsList = _.clone(this.itemsList);
    });
  }

  deleteItem(id): void {
    this.crudService.deleteItem('fornecedores', id).subscribe(response => {
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
    this.itemForm.controls.CNPJ_CPF.setValue(item.CNPJ_CPF);
    this.itemForm.controls.razao_social_nome.setValue(item.razao_social_nome);
    this.itemForm.controls.IE.setValue(item.IE);
    this.itemForm.controls.endereco.setValue(item.endereco);
    this.itemForm.controls.numero.setValue(item.numero);
    this.itemForm.controls.complemento.setValue(item.complemento);
    this.itemForm.controls.bairro.setValue(item.bairro);
    this.itemForm.controls.CEP.setValue(item.CEP);
    this.itemForm.controls.UF.setValue(item.UF);
    this.itemForm.controls.cidade.setValue(item.cidade);
    this.itemForm.controls.telefone.setValue(item.telefone);
    this.itemForm.controls.email.setValue(item.email);
  }

  createUpdateItem(): void {
    const formValues = this.itemForm.value;

    if (this.itemForm.status === 'VALID'){
      if (this.validateForm()){
        if (formValues.id) {
          this.crudService.updateItem('fornecedores', formValues, formValues.id).subscribe(response => {
            this.getItems();
            this.toastService.addToast('Atualizado com sucesso');
          }, err => {
            this.toastService.addToast(err['message'], 'darkred');
          });
        } else {
          this.crudService.createItem('fornecedores', formValues).subscribe(response => {
            this.getItems();
            this.toastService.addToast('Cadastrado com sucesso');
          }, err => {
              this.toastService.addToast(err['message'], 'darkred');
          });
        }
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
      items: [title === 'Deletar' ? items.razao_social_nome : formValues.razao_social_nome],
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

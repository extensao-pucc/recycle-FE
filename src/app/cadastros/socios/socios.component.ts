import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { CrudService } from '../crud.service';
import * as _ from 'lodash';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { FormValidatorService } from '../../shared/formValidator/form-validator.service';
import { SharedVariableService } from '../../shared/shared-variable.service';

@Component({
  selector: 'app-socios',
  templateUrl: './socios.component.html',
  styleUrls: ['./socios.component.css', '../../app.component.css']
})
export class SociosComponent implements OnInit {
  public tempItemsList: any;
  public itemsList: any;
  public itemForm: any;
  public showForm = false;
  public yesNoMessage: YesNoMessage = new YesNoMessage();
  public showYesNoMessage: boolean;

  public states: any;
  public profiles: any;
  public status: any;

  constructor(
    private crudService: CrudService,
    private toastService: ToastService,
    private formBuilder: FormBuilder,
    private formValidatorService: FormValidatorService,
    private sharedVariableService: SharedVariableService
  ) {
    this.states = this.sharedVariableService.getStates();
    this.profiles = this.sharedVariableService.getProfiles();
    this.status = this.sharedVariableService.getStatus();
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
      matricula: ['', [this.formValidatorService.isEmpty]],
      nome: ['', [this.formValidatorService.isEmpty]],
      data_de_nascimento: ['', [this.formValidatorService.isEmpty]],
      RG: ['', [this.formValidatorService.isEmpty, this.formValidatorService.validRG]],
      data_emissao: ['', [this.formValidatorService.isEmpty]],
      local_emissao: ['', [this.formValidatorService.isEmpty]],
      orgao_expedidor: ['', [this.formValidatorService.isEmpty]],
      CPF: ['', [this.formValidatorService.isEmpty, this.formValidatorService.validCPF_CNPJ]],
      titulo_de_Eleitor: ['', [this.formValidatorService.isEmpty]],
      PIS_PASEP: ['', [this.formValidatorService.isEmpty, this.formValidatorService.isNumeric]],
      NIT: ['', [this.formValidatorService.isEmpty, this.formValidatorService.isNumeric]],
      nome_da_Mae: ['', [this.formValidatorService.isEmpty]],
      nome_do_Pai: [''],
      endereco: ['', [this.formValidatorService.isEmpty]],
      numero: ['', [this.formValidatorService.isEmpty, this.formValidatorService.isNumeric]],
      complemento: [''],
      UF: ['', [this.formValidatorService.isEmpty]],
      cidade: ['', [this.formValidatorService.isEmpty]],
      telefone: ['', [this.formValidatorService.isEmpty, this.formValidatorService.validTelefone]],
      email: ['', [this.formValidatorService.isEmpty, this.formValidatorService.validEmail]],
      data_de_admissao: ['', [this.formValidatorService.isEmpty]],
      data_de_demissao: [''],
      situacao: ['', [this.formValidatorService.isEmpty]],
      foto: [''],
      perfil: ['', [this.formValidatorService.isEmpty]]
    });
  }

  getItems(): void {
    this.crudService.getItems('socios').subscribe(response => {
      this.itemsList = response;
      this.tempItemsList = _.clone(this.itemsList);
    });
  }

  deleteItem(id): void {
    this.crudService.deleteItem('socios', id).subscribe(response => {
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
    this.itemForm.controls.matricula.setValue(item.matricula);
    this.itemForm.controls.nome.setValue(item.nome);
    this.itemForm.controls.data_de_nascimento.setValue(item.data_de_nascimento);
    this.itemForm.controls.RG.setValue(item.RG);
    this.itemForm.controls.data_emissao.setValue(item.data_emissao);
    this.itemForm.controls.local_emissao.setValue(item.local_emissao);
    this.itemForm.controls.orgao_expedidor.setValue(item.orgao_expedidor);
    this.itemForm.controls.CPF.setValue(item.CPF);
    this.itemForm.controls.titulo_de_Eleitor.setValue(item.titulo_de_Eleitor);
    this.itemForm.controls.PIS_PASEP.setValue(item.PIS_PASEP);
    this.itemForm.controls.NIT.setValue(item.NIT);
    this.itemForm.controls.nome_da_Mae.setValue(item.nome_da_Mae);
    this.itemForm.controls.nome_do_Pai.setValue(item.nome_do_Pai);
    this.itemForm.controls.endereco.setValue(item.endereco);
    this.itemForm.controls.numero.setValue(item.numero);
    this.itemForm.controls.complemento.setValue(item.complemento);
    this.itemForm.controls.UF.setValue(item.UF);
    this.itemForm.controls.cidade.setValue(item.cidade);
    this.itemForm.controls.telefone.setValue(item.telefone);
    this.itemForm.controls.email.setValue(item.email);
    this.itemForm.controls.data_de_admissao.setValue(item.data_de_admissao);
    this.itemForm.controls.data_de_demissao.setValue(item.data_de_demissao);
    this.itemForm.controls.situacao.setValue(item.situacao);
    // this.itemForm.controls.foto.setValue(item.foto);
    this.itemForm.controls.perfil.setValue(item.perfil);
  }

  createUpdateItem(): void {
    const formValues = this.itemForm.value;

    if (this.itemForm.status === 'VALID'){
      if (formValues.id) {
        this.crudService.updateItem('socios', formValues, formValues.id).subscribe(response => {
          this.getItems();
          this.toastService.addToast('Atualizado com sucesso');

        }, err => {
          this.toastService.addToast(err['message'], 'darkred');
        });
      } else {
        this.crudService.createItem('socios', formValues).subscribe(response => {
          this.getItems();
          this.toastService.addToast('Cadastrado com sucesso');
        }, err => {
          console.log(err);
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

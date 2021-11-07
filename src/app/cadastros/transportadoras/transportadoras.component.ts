import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, NgForm, Validators } from '@angular/forms';
import { CrudService } from '../crud.service';
import * as _ from 'lodash-es';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { FormValidatorService } from '../../shared/formValidator/form-validator.service';
import { SharedVariableService } from '../../shared/shared-variable.service';
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';

@Component({
  selector: 'app-transportadoras',
  templateUrl: './transportadoras.component.html',
  styleUrls: ['./transportadoras.component.css', '../../app.component.css', '../table.css']
})
export class TransportadorasComponent implements OnInit, IFormCanDeactivate {
  @ViewChild('eventForm') public eventListingForm: NgForm;

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

  canDeactivate(): boolean {
    if (this.eventListingForm) {
      if (this.eventListingForm.dirty) {
        return confirm('Tem certeza que deseja sair ? Suas alterações serão perdidas');
      }
    }
    return true
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
      CEP: ['', [this.formValidatorService.validCEP]],
      UF: ['', [this.formValidatorService.isEmpty]],
      cidade: ['', [this.formValidatorService.isEmpty]],
      telefone: ['', [this.formValidatorService.isEmpty, this.formValidatorService.validTelefone]],
      email: ['', [this.formValidatorService.isEmpty, this.formValidatorService.validEmail]]
    });
  }

  getItems(): void {
    this.crudService.getItems('transportadoras').subscribe(response => {
      this.itemsList = response;
      this.tempItemsList = _.clone(this.itemsList);
    });
  }

   // =========== Busca personalizada ====================================================
   Search(campo: any, valor: any): any{
    this.tempItemsList = _.clone(this.tempItemsList);

    if (valor !== ''){
      this.tempItemsList = this.itemsList.filter(res => {
        return res[campo].toString().trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f-\.|\-\(\) '\/]/g, '').match(
               valor.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f-\.|\-\(\) '\/]/g, ''
              ));
      });
    } else if (valor === '') {
      this.ngOnInit();
    }
  }
  // ===================================================================================
  

  deleteItem(id): void {
    this.crudService.deleteItem('transportadoras', id).subscribe(response => {
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
      if (formValues.id) {
        this.crudService.updateItem('transportadoras', formValues, formValues.id).subscribe(response => {
          this.getItems();
          this.loadForm();

          this.showForm = false;
          this.toastService.addToast('Atualizado com sucesso!');
        }, err => {
          if (err.error.CNPJ_CPF){
            this.itemForm.controls.CNPJ_CPF.errors = {'msgErro': 'Transportadora com esse CNPJ ou CPF já existe'};
            this.toastService.addToast('Informações inválidas, verifique para continuar', 'darkred');
          }else {
            this.toastService.addToast(err['message'], 'darkred');
          }
        });
      } else {
        this.crudService.createItem('transportadoras', formValues).subscribe(response => {
          this.getItems();
          this.loadForm();

          this.showForm = false;
          this.toastService.addToast('Cadastrado com sucesso');
        }, err => {
          if (err.error.CNPJ_CPF){
            this.itemForm.controls.CNPJ_CPF.errors = {'msgErro': 'Transportadora com esse CNPJ ou CPF já existe'};
            this.toastService.addToast('Informações inválidas, verifique para continuar', 'darkred');
          }else {
            this.toastService.addToast(err['message'], 'darkred');
          }
        });
      }
    } else {
      this.toastService.addToast('Informações inválidas, verifique para continuar', 'darkred');
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

  populaDados(item: any): any {
    if (item.logradouro || item.bairro || item.estado){
      this.itemForm.controls.endereco.setValue(item.logradouro);
      this.itemForm.controls.bairro.setValue(item.bairro);
      this.itemForm.controls.cidade.setValue(item.cidade);
      this.itemForm.controls.UF.setValue(item.estado);
    }
    this.itemForm.controls.CEP.setValue(item.cep);
  }

  sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("myTable");
    switching = true;
    dir = "asc"; 

    while (switching) {
      switching = false;
      rows = table.rows;

      for (i = 2; i < (rows.length - 1); i++) {
        shouldSwitch = false;

        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];

        var cmpX = isNaN(parseInt(x.innerHTML)) ? x.innerHTML.toLowerCase() : parseInt(x.innerHTML);
        var cmpY = isNaN(parseInt(y.innerHTML)) ? y.innerHTML.toLowerCase() : parseInt(y.innerHTML);
        cmpX = (cmpX == '-') ? 0 : cmpX;
        cmpY = (cmpY == '-') ? 0 : cmpY;

        if (dir == "asc") {
            if (cmpX > cmpY) {
                shouldSwitch= true;
                break;
            }
        } else if (dir == "desc") {
            if (cmpX < cmpY) {
                shouldSwitch= true;
                break;
            }
        }
      }

      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount ++;      
      } else {
        if (switchcount == 0 && dir == "asc") {
            dir = "desc";
            switching = true;
        }
      }
    }
  }
}

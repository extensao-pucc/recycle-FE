import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, NgForm, Validators } from '@angular/forms';
import { CrudService } from '../crud.service';
import * as _ from 'lodash';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { FormValidatorService } from '../../shared/formValidator/form-validator.service';
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';


@Component({
  selector: 'app-produtos',
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.css', '../../app.component.css']
})
export class ProdutosComponent implements OnInit, IFormCanDeactivate {
  @ViewChild('eventForm') public eventListingForm: NgForm;

  public tempItemsList: any;
  public itemsList: any;
  public itemForm: any;
  public showForm = false;
  public yesNoMessage: YesNoMessage = new YesNoMessage();
  public showYesNoMessage: boolean;

  public familias: any;
  public naturezaDasOperacoes: any;

  constructor(
    private crudService: CrudService,
    private toastService: ToastService,
    private formBuilder: FormBuilder,
    private formValidatorService: FormValidatorService
  ) {
    this.getItems();
  }

  ngOnInit(): void {
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
      codigo: ['', [this.formValidatorService.isEmpty, this.formValidatorService.isNumeric]],
      descricao: ['', [this.formValidatorService.isEmpty]],
      familia: ['', [this.formValidatorService.isEmpty]],
      NCM: ['', [this.formValidatorService.isEmpty, this.formValidatorService.validNCM]],
      CSTE: ['', [this.formValidatorService.isEmpty, this.formValidatorService.isNumeric]],
      CSTS: ['', [this.formValidatorService.isEmpty, this.formValidatorService.isNumeric]],
      CFOPE: ['', [this.formValidatorService.isEmpty]],
      CFOPS: ['', [this.formValidatorService.isEmpty]]
    });
  }

  getItems(): void {
    this.crudService.getItems('familias').subscribe(response => { this.familias = response; });
    this.crudService.getItems('naturezaDasOperacoes').subscribe(response => { this.naturezaDasOperacoes = response; });

    this.crudService.getItems('produtos').subscribe(response => {
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
    this.crudService.deleteItem('produtos', id).subscribe(response => {
      this.getItems();
      this.toastService.addToast('Deletado com sucesso');
    }, err => {
      this.toastService.addToast(err['message'], 'darkred');
    });

    this.showForm = false;
  }

  updateCloneItem(item: any, title: any): void {
    if (title === 'update'){
      this.itemForm.controls.id.setValue(item.id);
    }
    this.itemForm.controls.codigo.setValue(item.codigo);
    this.itemForm.controls.descricao.setValue(item.descricao);
    this.itemForm.controls.familia.setValue(item.familia.id);
    this.itemForm.controls.NCM.setValue(item.NCM);
    this.itemForm.controls.CSTE.setValue(item.CSTE);
    this.itemForm.controls.CSTS.setValue(item.CSTS);
    this.itemForm.controls.CFOPE.setValue(item.CFOPE.id);
    this.itemForm.controls.CFOPS.setValue(item.CFOPS.id);
    this.showForm = true;
  }

  createUpdateItem(): void {
    const formValues = this.itemForm.value;

    if (this.itemForm.status === 'VALID'){
      if (formValues.id) {
        this.crudService.updateItem('produtos', formValues, formValues.id).subscribe(response => {
          this.getItems();
          this.loadForm();

          this.showForm = false;
          this.toastService.addToast('Atualizado com sucesso!');
        }, err => {
          if (err.error.codigo){
            this.itemForm.controls.codigo.errors = {'msgErro': 'Produto com esse código já existe'};
            this.toastService.addToast('Informações inválidas, verifique para continuar', 'darkred');
          }else {
            this.toastService.addToast(err['message'], 'darkred');
          }
        });
      } else {
        this.crudService.createItem('produtos', formValues).subscribe(response => {
          this.getItems();
          this.loadForm();

          this.showForm = false;
          this.toastService.addToast('Cadastrado com sucesso');
        }, err => {
          if (err.error.codigo){
            this.itemForm.controls.codigo.errors = {'msgErro': 'Produto com esse código já existe'};
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
      items: [title === 'Deletar' ? items.descricao + ' - ' + items.qualidade.nome : formValues.descricao],
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

import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, NgForm, Validators } from '@angular/forms';
import { CrudService } from '../crud.service';
import * as _ from 'lodash';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { FormValidatorService } from '../../shared/formValidator/form-validator.service';
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';

@Component({
  selector: 'app-precificacao',
  templateUrl: './precificacao.component.html',
  styleUrls: ['./precificacao.component.css']
})
export class PrecificacaoComponent implements OnInit, IFormCanDeactivate {
  @ViewChild('eventForm') public eventListingForm: NgForm;

  public tempItemsList: any;
  public itemsList: any;
  public itemForm: any;
  public showForm = false;
  public yesNoMessage: YesNoMessage = new YesNoMessage();
  public showYesNoMessage: boolean;

  // trocar
  public produtos: any;
  public fornecedores: any;
  public qualidades: any;

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
      produto: ['', [this.formValidatorService.isEmpty]], // trocar
      fornecedor: ['', [this.formValidatorService.isEmpty]],
      qualidade: ['', [this.formValidatorService.isEmpty]],
      preco_compra: ['', [this.formValidatorService.isEmpty]],
      preco_venda: ['', [this.formValidatorService.isEmpty]]
    });
  }

  getItems(): void {
    // trocar
    this.crudService.getItems('produtos').subscribe(response => { this.produtos = response; });
    this.crudService.getItems('fornecedores').subscribe(response => { this.fornecedores = response; });
    this.crudService.getItems('qualidades').subscribe(response => { this.qualidades = response; });
    this.crudService.getItems('precificacao').subscribe(response => {
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
    this.crudService.deleteItem('precificacao', id).subscribe(response => {
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
    // trocar
    this.itemForm.controls.produto.setValue(item.produto.id);
    this.itemForm.controls.fornecedor.setValue(item.fornecedor.id);
    this.itemForm.controls.qualidade.setValue(item.qualidade.id);
    this.itemForm.controls.preco_compra.setValue(item.preco_compra);
    this.itemForm.controls.preco_venda.setValue(item.preco_venda);
    this.showForm = true;
  }

  createUpdateItem(): void {
    const formValues = this.itemForm.value;

    if (this.itemForm.status === 'VALID'){
      if (formValues.id) {
        this.crudService.updateItem('precificacao', formValues, formValues.id).subscribe(response => {
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
        this.crudService.createItem('precificacao', formValues).subscribe(response => {
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

        console.log(cmpX)
        console.log(cmpY)

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

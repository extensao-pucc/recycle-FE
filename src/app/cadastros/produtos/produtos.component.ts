import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CrudService } from '../crud.service';
import * as _ from 'lodash';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { FormValidatorService } from '../../shared/formValidator/form-validator.service';


@Component({
  selector: 'app-produtos',
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.css']
})
export class ProdutosComponent implements OnInit {
  public tempItemsList: any;
  public itemsList: any;
  public itemForm: any;
  public showForm = false;
  public yesNoMessage: YesNoMessage = new YesNoMessage();
  public showYesNoMessage: boolean;

  public familias: any;
  public fornecedores: any;
  public qualidades: any;
  public unidadesDeMedida: any;
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

  loadForm(): void {
    this.itemForm = this.formBuilder.group({
      id: [null],
      codigo: ['', [this.formValidatorService.isEmpty]],
      descricao: ['', [this.formValidatorService.isEmpty]],
      familia: ['', [this.formValidatorService.isEmpty]],
      fornecedor: ['', [this.formValidatorService.isEmpty]],
      qualidade: ['', [this.formValidatorService.isEmpty]],
      unidade_de_medida: ['', [this.formValidatorService.isEmpty]],
      NCM: ['', [this.formValidatorService.isEmpty]],
      CSTE: ['', [this.formValidatorService.isEmpty]],
      CSTS: ['', [this.formValidatorService.isEmpty]],
      CFOPE: ['', [this.formValidatorService.isEmpty]],
      CFOPS: ['', [this.formValidatorService.isEmpty]],
      preco_compra: ['', [this.formValidatorService.isEmpty]],
      preco_venda: ['', [this.formValidatorService.isEmpty]]
    });
  }

  getItems(): void {
    this.crudService.getItems('familias').subscribe(response => { this.familias = response; });
    this.crudService.getItems('fornecedores').subscribe(response => { this.fornecedores = response; });
    this.crudService.getItems('qualidades').subscribe(response => { this.qualidades = response; });
    this.crudService.getItems('unidadesDeMedida').subscribe(response => { this.unidadesDeMedida = response; });
    this.crudService.getItems('naturezaDasOperacoes').subscribe(response => { this.naturezaDasOperacoes = response; });

    this.crudService.getItems('produtos').subscribe(response => {
      this.itemsList = response;
      this.tempItemsList = _.clone(this.itemsList);
    });
  }

  deleteItem(id): void {
    this.crudService.deleteItem('produtos', id).subscribe(response => {
      this.getItems();
      this.toastService.addToast('Deletado com sucesso');
    }, err => {
      this.toastService.addToast(err['message'], 'darkred');
    });

    this.showForm = false;
  }

  updateItem(item: any): void {
    this.itemForm.controls.id.setValue(item.id);
    this.itemForm.controls.codigo.setValue(item.codigo);
    this.itemForm.controls.descricao.setValue(item.descricao);
    this.itemForm.controls.familia.setValue(item.familia.id);
    this.itemForm.controls.fornecedor.setValue(item.fornecedor.id);
    this.itemForm.controls.qualidade.setValue(item.qualidade.id);
    this.itemForm.controls.unidade_de_medida.setValue(item.unidade_de_medida.id);
    this.itemForm.controls.NCM.setValue(item.NCM);
    this.itemForm.controls.CSTE.setValue(item.CSTE);
    this.itemForm.controls.CSTS.setValue(item.CSTS);
    this.itemForm.controls.CFOPE.setValue(item.CFOPE.id);
    this.itemForm.controls.CFOPS.setValue(item.CFOPS.id);
    this.itemForm.controls.preco_compra.setValue(item.preco_compra);
    this.itemForm.controls.preco_venda.setValue(item.preco_venda);
    this.showForm = true;
  }

  createUpdateItem(): void {
    const formValues = this.itemForm.value;

    if (this.itemForm.status === 'VALID'){
      if (formValues.id) {
        this.crudService.updateItem('produtos', formValues, formValues.id).subscribe(response => {
          this.getItems();
          this.toastService.addToast('Atualizado com sucesso');
        }, err => {
          this.toastService.addToast(err['message'], 'darkred');
        });
      } else {
        this.crudService.createItem('produtos', formValues).subscribe(response => {
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
      items: [title === 'Deletar' ? items.descricao : formValues.descricao],
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

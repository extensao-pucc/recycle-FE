import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CrudService } from '../crud.service';
import * as _ from 'lodash';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ToastService } from 'src/app/shared/toast/toast.service';


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

  public selectedQualidade: any;
  public qualidades: any;

  constructor(
    private crudService: CrudService,
    private toastService: ToastService,
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.getItems();
    this.loadForm();
  }

  loadForm(): void {
    this.itemForm = this.formBuilder.group({
      id: [null],
      codigo: ['', Validators.required],
      descricao: ['', Validators.required],
      familia: ['', Validators.required],
      fornecedor: ['', Validators.required],
      qualidade: ['', Validators.required],
      unidade_de_medida: [''],
      NCM: ['', Validators.required],
      CSTE: ['', Validators.required],
      CSTS: ['', Validators.required],
      CFOPE: ['', Validators.required],
      CFOPS: ['', Validators.required],
      preco_compra: ['', Validators.required],
      preco_venda: ['', Validators.required]
    });
  }

  getItems(): void {
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
    this.showForm = true;

    this.itemForm.controls.id.setValue(item.id);
    this.itemForm.controls.codigo.setValue(item.codigo);
    this.itemForm.controls.descricao.setValue(item.descricao);
    this.itemForm.controls.familia.setValue(item.familia);
    this.itemForm.controls.fornecedor.setValue(item.fornecedor);
    this.itemForm.controls.qualidade.setValue(item.qualidade);
    this.itemForm.controls.unidade_de_medida.setValue(item.unidade_de_medida);
    this.itemForm.controls.NCM.setValue(item.NCM);
    this.itemForm.controls.CSTE.setValue(item.CSTE);
    this.itemForm.controls.CSTS.setValue(item.CSTS);
    this.itemForm.controls.CFOPE.setValue(item.CFOPE);
    this.itemForm.controls.CFOPS.setValue(item.CFOPS);
    this.itemForm.controls.preco_compra.setValue(item.preco_compra);
    this.itemForm.controls.preco_venda.setValue(item.preco_venda);
  }

  createUpdateItem(): void {
    this.showForm = false;
    const formValues = this.itemForm.value;

    if (formValues.id) {
      this.crudService.updateItem('produtos', formValues, formValues.id).subscribe(response => {
        this.getItems();
        this.toastService.addToast('Atualizado com sucesso');
      }, err => {
        this.toastService.addToast(err['message'], 'darkred');
      });
    } else {
      console.log( )
      this.crudService.createItem('produtos', formValues).subscribe(response => {
        this.toastService.addToast('Cadastrado com sucesso');
      }, err => {
        console.log(err);
        this.toastService.addToast(err['message'], 'darkred');
      });
    }

    this.loadForm();
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

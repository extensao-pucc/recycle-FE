import { ContasComponent } from './../contas.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Component, Input, ElementRef, ViewChild, OnChanges, OnInit } from '@angular/core';
import { FinanceiroService } from '../../financeiro.service';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { FormValidatorService } from '../../../shared/formValidator/form-validator.service';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-modal-contas',
  templateUrl: './modal-contas.component.html',
  styleUrls: ['./modal-contas.component.css']
})

export class ModalContasComponent implements OnChanges, OnInit {
  @Input() modalContas: any;
  @ViewChild('defaulModalConta', { static: true }) defaultModalConta: ElementRef;
  public modalRef: any;

  public itemForm: any;
  public situations: any;
  public types: any;

  constructor(
    private contasComponent: ContasComponent,
    private financeiroService: FinanceiroService,
    private formBuilder: FormBuilder,
    private formValidatorService: FormValidatorService,
    private modalService: BsModalService,
    private toastService: ToastService,
  ) {
    this.situations = this.financeiroService.getSituation();
    this.types = this.financeiroService.getType();
  }

  ngOnChanges(): void {
    setTimeout(() => this.modalRef = this.modalService.show(this.defaultModalConta));
    this.loadForm();

    // Verifica se esta sendo passado um item, se sim aciona o metodo para
    // preencher as informações
    if (this.modalContas.items[0] !== 'item'){
      this.updateItem(this.modalContas.items[0]);
    }
  }

  ngOnInit(): void {}

  loadForm(): void {
    this.itemForm = this.formBuilder.group({
      id: [null],
      descricao: ['', [this.formValidatorService.isEmpty]],
      data: ['', [this.formValidatorService.isEmpty]],
      tipo: [null, [this.formValidatorService.isEmpty]],
      valor: ['', [this.formValidatorService.isEmpty]],
      situacao: [null, [this.formValidatorService.isEmpty]],
    });
  }

  createUpdateItem(): any{
    const formValues = this.itemForm.value;
    if (this.itemForm.status === 'VALID'){
      // Caso contrario, cadastra um novo item
      this.financeiroService.createItem('contas', formValues).subscribe(response => {
        this.contasComponent.getItems();
        this.loadForm();
        this.yesNo(true);
        this.toastService.addToast('Cadastrado com sucesso');
      }, err => {
        this.toastService.addToast(err['message'], 'darkred');
      });
    } else {
      this.toastService.addToast('Informações inválidas, verifique para continuar', 'darkred');
    }
  }

  updateItem(item: any): void {
    this.itemForm.controls.id.setValue(item.id);
    this.itemForm.controls.descricao.setValue(item.descricao);
    this.itemForm.controls.data.setValue(item.data);
    this.itemForm.controls.tipo.setValue(item.tipo);
    this.itemForm.controls.valor.setValue(item.valor);
    this.itemForm.controls.situacao.setValue(item.situacao);
  }

  yesNo(yesNo: boolean): void {
    this.modalRef.hide();

    if (yesNo) {
      this.modalContas.action.onClickYes();
    } else {
      this.modalContas.action.onClickNo();
    }
  }
}

export class ModalContas {
  items: string[];
  fontAwesomeClass?: string;
  action: {
    onClickYes: any,
    onClickNo: any
  };
}

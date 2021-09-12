import { Component, Input, ElementRef, ViewChild, OnChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-modal-contas',
  templateUrl: './modal-contas.component.html',
  styleUrls: ['./modal-contas.component.css']
})

export class ModalContasComponent implements OnChanges {

  @Input() modalContas: any;
  @ViewChild('defaulModalConta', { static: true }) defaultModalConta: ElementRef;
  public modalRef: any;

  public itemForm: any;

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.itemForm = this.formBuilder.group({
      descricao:  '',
      data:  '',
      valor:  '',
      situacao:  '',
      tipo:  '',
    });
  }

  ngOnChanges(): void {
    setTimeout(() => this.modalRef = this.modalService.show(this.defaultModalConta));
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
  title: string;
  mainText: string;
  items: string[];
  fontAwesomeClass?: string;
  action: {
    onClickYes: any,
    onClickNo: any
  };
}

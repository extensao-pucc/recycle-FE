import { Component, OnInit } from '@angular/core';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { FormValidatorService } from '../../shared/formValidator/form-validator.service';
import { CrudService } from '../../cadastros/crud.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-triagem',
  templateUrl: './triagem.component.html',
  styleUrls: ['./triagem.component.css']
})
export class TriagemComponent implements OnInit {
  public yesNoMessage: YesNoMessage = new YesNoMessage();
  public showYesNoMessage: boolean;
  public selectedSocio: any;
  public socios: any;
  public fornecedores: any;
  public headForm: any;

  constructor(
    private toastService: ToastService,
    private crudService: CrudService,
    private formBuilder: FormBuilder
  ) {  }

  ngOnInit(): void {
    this.getItems();
    this.loadForm();
  }

  loadForm(): void {
    this.headForm = this.formBuilder.group({
      lote: [null],
      data: [null],
      inicio: [null],
      termino: [null],
      socio: [null],
      fornecedor: [null],
      situacao: [null],
    });
  }

  getItems(): void {
    this.crudService.getItems('socios').subscribe(response => this.socios = response);
    this.crudService.getItems('fornecedores').subscribe(response => this.fornecedores = response);
  }

  startProduction(): void {
    if (this.headForm.get('socio').value && this.headForm.get('fornecedor').value) {
      this.headForm.controls.lote.setValue('001');
      this.headForm.controls.data.setValue(this.currentDate());
      this.headForm.controls.inicio.setValue(this.currentTime());
      this.headForm.controls.situacao.setValue('Iniciada');
    } else {
      this.toastService.addToast('Selecione um sócio responsável e um fornecedor para iniciar', 'darkred');
    }
  }

  stopProduction(): void {

  }

  showModal(title: string): void {
    this.yesNoMessage = {
      title,
      mainText: 'Tem certeza que deseja ' + title.toLowerCase() + ' a prdução?',
      items: ['Deletar' ],
      fontAwesomeClass: 'fa-ban',
      action: {
        onClickYes: () => {
          if (title === 'Iniciar') {
            this.startProduction();
          } else if (title === 'Pausar') {
            this.toastService.addToast('Desculpa, ainda não temos essa funcionalidade', 'darkred');
          } else if (title === 'Finalizar') {
            this.toastService.addToast('Desculpa, ainda não temos essa funcionalidade', 'darkred');
          } else {
            this.toastService.addToast('Desculpa, ainda não temos essa funcionalidade', 'darkred');
          }
        },
        onClickNo: () => { }
      }
    };
    this.showYesNoMessage = true;
  }

  currentDate(): string {
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    return month + '/' + day + '/' + year;
  }

  currentTime(): string {
    const currentDate = new Date();
    const hour = '' + currentDate.getHours();
    const minute = '' + currentDate.getMinutes();
    const second = '' + currentDate.getSeconds();
    return (hour.length === 1 ? '0' + hour : hour) +
    ':' + (minute.length === 1 ? '0' + minute : minute) +
    ':' + (second.length === 1 ? '0' + second : second);
  }
}

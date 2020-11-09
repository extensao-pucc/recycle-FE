import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { CrudService } from '../../cadastros/crud.service';
import { SharedVariableService } from '../../shared/shared-variable.service';
import { FormBuilder } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { from } from 'rxjs';

@Component({
  selector: 'app-triagem',
  templateUrl: './triagem.component.html',
  styleUrls: ['./triagem.component.css']
})
export class TriagemComponent implements OnInit {
  @ViewChild('pauseScreen', { static: true }) pauseScreen: ElementRef;

  public yesNoMessage: YesNoMessage = new YesNoMessage();
  public showYesNoMessage: boolean;
  public modalRef: any;

  public socios: any;
  public fornecedores: any;
  public motivosDeParada: any;

  public headForm: any;
  public selectedSocio: any;
  public selectedMotivo: any;
  public lastTriagem: number;
  public statusProd = '';
  public lotItems: any;

  constructor(
    private toastService: ToastService,
    private crudService: CrudService,
    private sharedVariableService: SharedVariableService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService
  ) {  }

  ngOnInit(): void {
    const prodInfo = JSON.parse(localStorage.getItem('prodInfo'));
    this.getItems();
    if (prodInfo) {
      this.loadForm();
      this.headForm.controls.lote.setValue(prodInfo['currentLote']);
      this.headForm.controls.data.setValue(prodInfo['startDate']);
      this.headForm.controls.inicio.setValue(prodInfo['startTime']);
      this.headForm.controls.situacao.setValue(prodInfo['status']);
      this.statusProd = prodInfo['status'];
      // this.headForm.controls.socio.setValue(prodInfo['socio']);
      // this.headForm.controls.fornecedor.setValue(prodInfo['fornecedor']);
    } else {
      this.loadForm();
      this.crudService.getItems('parametros').subscribe(response => {
        this.lastTriagem =  Number(response[0].triagem);
      });
    }
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
    this.crudService.getItems('motivosDeParada').subscribe(response => this.motivosDeParada = response);
  }

  startProduction(): void {
    if (this.headForm.get('socio').value && this.headForm.get('fornecedor').value) {
      if (this.statusProd === '') {
        this.headForm.controls.lote.setValue(this.lastTriagem + 1);
        this.headForm.controls.data.setValue(this.sharedVariableService.currentDate());
        this.headForm.controls.inicio.setValue(this.sharedVariableService.currentTime());
        this.headForm.controls.situacao.setValue('Iniciada');
        const prodInfo = {
          currentLote: this.lastTriagem + 1,
          startDate: this.sharedVariableService.currentDate(),
          startTime: this.sharedVariableService.currentTime(),
          status: 'Iniciada',
          socio: this.headForm.get('socio').value,
          fornecedor: this.headForm.get('fornecedor').value
        };
        localStorage.setItem('prodInfo', JSON.stringify(prodInfo));
        this.statusProd = 'Iniciada';
      }
    } else {
      this.toastService.addToast('Selecione um sócio responsável e um fornecedor para iniciar', 'darkred');
    }
  }

  pauseProduction(): void {
    console.log('pausou')
    console.log(this.selectedMotivo)
  }

  showModal(title: string): void {
    this.yesNoMessage = {
      title,
      mainText: 'Tem certeza que deseja ' + title.toLowerCase() + ' a prdução?',
      items: ['Após a confirmação a produção vai ser ' + title.toLowerCase() ],
      fontAwesomeClass: 'fa-ban',
      action: {
        onClickYes: () => {
          if (title === 'Iniciar') {
            this.startProduction();
          } else if (title === 'Pausar') {
            this.modalRef = this.modalService.show(this.pauseScreen);
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
}

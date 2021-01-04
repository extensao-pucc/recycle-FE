import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ViewImage } from 'src/app/shared/view-image/view-image.component';
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
  @ViewChild('loteItemScreen', { static: true }) loteItemScreen: ElementRef;

  // screen
  public yesNoMessage: YesNoMessage = new YesNoMessage();
  public showYesNoMessage: boolean;
  public modalRef: any;
  public viewImage: ViewImage = new ViewImage();
  public showModalImage: boolean;

  // selects
  public socios: any;
  public fornecedores: any;
  public motivosDeParada: any;
  public materiasPrimas: any;
  public produtos: any;

  // forms
  public headForm: any;
  public loteItemForm: any;

  public selectedSocio: any;
  public selectedMotivo: any;
  public lastTriagem: number;
  public statusProd = '';
  public lotItems = [];
  public lotStops = [];

  constructor(
    private toastService: ToastService,
    private crudService: CrudService,
    private sharedVariableService: SharedVariableService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    const prodInfoHead = JSON.parse(localStorage.getItem('prodInfoHead'));
    this.getItems();
    if (prodInfoHead) {
      this.loadHeadForm();
      this.headForm.controls.lote.setValue(prodInfoHead['currentLote']);
      this.headForm.controls.data.setValue(prodInfoHead['startDate']);
      this.headForm.controls.inicio.setValue(prodInfoHead['startTime']);
      this.headForm.controls.situacao.setValue(prodInfoHead['status']);
      this.statusProd = prodInfoHead['status'];
      this.headForm.controls.socio.setValue(prodInfoHead.socio.nome);
      this.headForm.get('socio').disable();
      this.headForm.controls.fornecedor.setValue(prodInfoHead.fornecedor.razao_social_nome);
      this.headForm.get('fornecedor').disable();
      this.headForm.controls.materia_prima.setValue(prodInfoHead.materia.nome);
      this.headForm.get('materia_prima').disable();
    } else {
      this.loadHeadForm();
      this.crudService.getItems('parametros').subscribe(response => {
        this.lastTriagem =  Number(response[0].triagem);
      });
    }
    this.loadLoteItemForm();
  }

  loadHeadForm(): void {
    this.headForm = this.formBuilder.group({
      lote: [null],
      data: [null],
      inicio: [null],
      termino: [null],
      socio: [null],
      fornecedor: [null],
      materia_prima: [null],
      situacao: [null],
    });
  }

  loadLoteItemForm(): void {
    this.loteItemForm = this.formBuilder.group({
      numBag: [null],
      product: [null],
      qtn: [null],
      socio: [null],
      tempo: [null],
      startTime: [null],
      endTime: [null],
      edit: true
    });
  }

  getItems(): void {
    this.crudService.getItems('socios').subscribe(response => this.socios = response);
    this.crudService.getItems('fornecedores').subscribe(response => this.fornecedores = response);
    this.crudService.getItems('motivosDeParada').subscribe(response => this.motivosDeParada = response);
    this.crudService.getItems('materiasPrimas').subscribe(response => this.materiasPrimas = response);
    this.crudService.getItems('produtos').subscribe(response => this.produtos = response);
  }

  startProduction(): void {
    if (this.headForm.get('socio').value && this.headForm.get('fornecedor').value) {
      if (this.statusProd === '') {
        this.headForm.controls.lote.setValue(this.lastTriagem + 1);
        this.headForm.controls.data.setValue(this.sharedVariableService.currentDate());
        this.headForm.controls.inicio.setValue(this.sharedVariableService.currentTime());
        this.headForm.controls.situacao.setValue('Iniciada');
        
        const prodInfoHead = {
          currentLote: this.lastTriagem + 1,
          startDate: this.sharedVariableService.currentDate(),
          startTime: this.sharedVariableService.currentTime(),
          status: 'Iniciada',
          socio: this.headForm.get('socio').value,
          fornecedor: this.headForm.get('fornecedor').value,
          materia: this.headForm.get('materia_prima').value
        };
        localStorage.setItem('prodInfoHead', JSON.stringify(prodInfoHead));
        this.statusProd = 'Iniciada';
      }
    } else {
      this.toastService.addToast('Selecione um SÓCIO responsável e/ou um FORNECEDOR para iniciar', 'darkred');
    }
  }

  pauseProduction(): void {
    console.log('pausou')
    console.log(this.selectedMotivo)
  }

  addLoteItem(): void {
    this.lotItems.push({
      numBag: 3,
      product: this.loteItemForm.get('product').value,
      qtn: 0,
      socio: this.loteItemForm.get('socio').value,
      startTime: this.sharedVariableService.currentTime(),
      endTime: '',
      edit: true
    });
    localStorage.setItem('prodInfoItems', JSON.stringify(this.lotItems));
    this.loadLoteItemForm();
    this.modalRef.hide();
  }

  saveLoteItem(idx): void {
    this.lotItems[idx].edit = false;
    this.lotItems[idx].endTime = this.sharedVariableService.currentTime();
    localStorage.setItem('prodInfoItems', JSON.stringify(this.lotItems));
  }

  showLoteItemModal(): void {
    this.loadLoteItemForm();
    this.modalRef = this.modalService.show(this.loteItemScreen);
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

  showImage(image: any): void{
    this.showModalImage = true;

    this.viewImage = {
      image,
      action: {
        onClickYes: () => {
          this.showYesNoMessage = true;
        },
        onClickNo: () => { }
      }
    };
  }
}

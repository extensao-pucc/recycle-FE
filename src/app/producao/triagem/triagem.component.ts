import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ViewImage } from 'src/app/shared/view-image/view-image.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { CrudService } from '../../cadastros/crud.service';
import { SharedVariableService } from '../../shared/shared-variable.service';
import { FormBuilder } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { from, interval, Subject } from 'rxjs';

export interface Entry {
  created: Date;
  id: string;
}

export interface TimeSpan {
  hours: number;
  minutes: number;
  seconds: number;
}
@Component({
  selector: 'app-triagem',
  templateUrl: './triagem.component.html',
  styleUrls: ['./triagem.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TriagemComponent implements OnInit {
  @ViewChild ('pauseScreen', { static: true }) pauseScreen: ElementRef;
  @ViewChild('loteItemScreen', { static: true }) loteItemScreen: ElementRef;
  @ViewChild('startBtn', { static: true }) startBtn: ElementRef;
  @ViewChild('pausetBtn', { static: true }) pausetBtn: ElementRef;
  @ViewChild('stopBtn', { static: true }) stopBtn: ElementRef;
  @ViewChild('printBtn', { static: true }) printBtn: ElementRef;
  @ViewChild('itemsLoteTable', { static: true }) itemsLoteTable: ElementRef;

  // screen
  public modalRef: any;
  public showYesNoMessage: boolean;
  public showModalImage: boolean;
  public viewImage: ViewImage = new ViewImage();
  public yesNoMessage: YesNoMessage = new YesNoMessage();

  // selects
  public fornecedores: any;
  public motivosDeParada: any;
  public materiasPrimas: any;
  public produtos: any;
  public socios: any;

  // forms
  public headForm: any;
  public loteItemForm: any;

  public lastTriagem: number;
  public lotItems = [];
  public lotBreaks = [];
  public statusProd = '';
  public selectedSocio: any;
  public selectedMotivo: any;
  public totBag: any;
  public totProduct: any;
  public totQtn: any;
  public totTime: any;

  public elapsedTime: any;
  public hour: any;
  public minute: string;
  public second: string;
  
  constructor(
    private toastService: ToastService,
    private crudService: CrudService,
    private sharedVariableService: SharedVariableService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private changeDetector: ChangeDetectorRef
  ) {}

  entries: Entry[] = [];
  newId: string;

  private destroyed$ = new Subject();

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
      this.changeProductionStatus();
      this.headForm.controls.socio.setValue(prodInfoHead.socio.nome);
      this.headForm.controls.fornecedor.setValue(prodInfoHead.fornecedor.razao_social_nome);
      this.headForm.controls.materia_prima.setValue(prodInfoHead.materia.nome);
      
      const prodInfoItems = JSON.parse(localStorage.getItem('prodInfoItems'));
      if(prodInfoItems) {
        this.lotItems = prodInfoItems;
      }
      const productionBreaks = JSON.parse(localStorage.getItem('productionBreaks'));
      if(productionBreaks) {
        this.lotBreaks = productionBreaks;
      }
      this.updateProductionSummary();
    } else {
      this.loadHeadForm();
      this.changeProductionStatus();
      this.crudService.getItems('parametros').subscribe(response => {
        this.lastTriagem =  Number(response[0].triagem);
      });
    }
    this.loadLoteItemForm();

    // Calculo de tempo do intem do lote
    setInterval(() => {
      const date = new Date();
      this.updateDate(date);
    }, 1000);
    
    // Calculo de tempo do TOTAL da triagem
    interval(1000).subscribe(() => {
      if (!this.changeDetector['destroyed']) {
        this.changeDetector.detectChanges();
      }
    });

    this.changeDetector.detectChanges();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  
  addEntry() {
    this.entries.push({
      created: new Date(),
      id: this.newId
    });
    this.newId = '';
  }

  // Calculo de tempo do TOTAL da triagem
  getElapsedTime(): TimeSpan {
    if (localStorage.prodInfoHead){
      let timerArr = JSON.parse(localStorage.prodInfoHead)
      let timer = new Date(timerArr.entry[0].created)
      let totalSeconds = Math.floor((new Date().getTime() - timer.getTime()) / 1000);
      
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    
    if (totalSeconds >= 3600) {
      hours = Math.floor(totalSeconds / 3600);      
      totalSeconds -= 3600 * hours;      
    }
    
    if (totalSeconds >= 60) {
      minutes = Math.floor(totalSeconds / 60);
      totalSeconds -= 60 * minutes;
    }

    seconds = totalSeconds;
    
    return {
      hours: hours,
      minutes: minutes,
      seconds: seconds
    }};
  }

  //contador de tempo corrente de item do lote
  updateDate (date: Date): any{
    const hours = date.getHours();
    
    this.hour = hours % 12;
    this.hour = this.hour ? this.hour : 12
    this.hour = this.hour < 10 ? '0' + this.hour : this.hour;

    const minutes = date.getMinutes();
    this.minute = minutes < 10 ? '0' + minutes : minutes.toString();

    const seconds = date.getSeconds();
    this.second = seconds < 10 ? '0' + seconds : seconds.toString();

    this.elapsedTime = this.hour + ':' + this.minute + ':' + this.second;
  }

  // Build do form cabeçalho (Informações do lote)
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

  // Build do form itens (Itens do lote)
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

  // Chama as API para obter as informações necessária para a triagem
  getItems(): void {
    this.crudService.getItems('socios').subscribe(response => this.socios = response);
    this.crudService.getItems('fornecedores').subscribe(response => this.fornecedores = response);
    this.crudService.getItems('motivosDeParada').subscribe(response => this.motivosDeParada = response);
    this.crudService.getItems('materiasPrimas').subscribe(response => this.materiasPrimas = response);
    this.crudService.getItems('produtos').subscribe(response => this.produtos = response);
  }

  // Inicia a Produção
  startProduction(): void {
    if (this.headForm.get('socio').value && this.headForm.get('fornecedor').value && this.headForm.get('materia_prima').value) {
      if (this.statusProd === '') {
        this.headForm.controls.lote.setValue(this.lastTriagem + 1);
        this.headForm.controls.data.setValue(this.sharedVariableService.currentDate());
        this.headForm.controls.inicio.setValue(this.sharedVariableService.currentTime());
        this.headForm.controls.situacao.setValue('Iniciada');
        
        this.addEntry()
        const prodInfoHead = {
          currentLote: this.lastTriagem + 1,
          fornecedor: this.headForm.get('fornecedor').value,
          materia: this.headForm.get('materia_prima').value,
          entry: this.entries,
          startDate: this.sharedVariableService.currentDate(),
          startTime: this.sharedVariableService.currentTime(),
          status: 'Iniciada',
          socio: this.headForm.get('socio').value,
        };
        localStorage.setItem('prodInfoHead', JSON.stringify(prodInfoHead));
        this.statusProd = 'Iniciada';
        this.changeProductionStatus();
      }
    } else {
      this.toastService.addToast('Selecione um SÓCIO / FORNECEDOR / MATÉRIA PRIMA para iniciar', 'darkred');
    }
  }

  // muda status da produção baseado no parametro
  changeProductionStatus(): void {
    if (this.statusProd === '') {
      this.startBtn.nativeElement.disabled = false;
      this.pausetBtn.nativeElement.disabled = true;
      this.stopBtn.nativeElement.disabled = true;
      this.printBtn.nativeElement.disabled = true;
    }else if (this.statusProd === 'Iniciada') {
      this.startBtn.nativeElement.disabled = true;
      this.pausetBtn.nativeElement.disabled = false;
      this.stopBtn.nativeElement.disabled = false;
      this.printBtn.nativeElement.disabled = true;
      this.headForm.controls.situacao.setValue('Iniciada');
      this.headForm.get('socio').disable();
      this.headForm.get('fornecedor').disable();
      this.headForm.get('materia_prima').disable();
      this.pausetBtn.nativeElement.innerHTML = '<i class="fa fa-pause-circle"></i> Pausar Produção'
    } else if (this.statusProd === 'Pausada') {
      this.itemsLoteTable.nativeElement.disabled = true; //testre
      this.headForm.controls.situacao.setValue('Pausada');
      this.startBtn.nativeElement.disabled = true;
      this.pausetBtn.nativeElement.disabled = false; 
      this.stopBtn.nativeElement.disabled = true;
      this.printBtn.nativeElement.disabled = true;
      this.headForm.get('socio').disable();
      this.headForm.get('fornecedor').disable();
      this.headForm.get('materia_prima').disable();
      this.pausetBtn.nativeElement.innerHTML = '<i class="fa fa-play-circle"></i> Continuar Produção'
    }
  }

  // Pausa a Prudução
  pauseProduction(): void {
    const productionBreaks = JSON.parse(localStorage.getItem('productionBreaks'));
    let auxSequence = [];

    if (productionBreaks) {
      this.lotBreaks = productionBreaks;
      this.lotBreaks.forEach(item => {
        auxSequence.push(item.sequence)
      })
    }

    this.lotBreaks.push({
      motivo: this.selectedMotivo,
      sequence: this.lotBreaks.length > 0 ? Math.max(...auxSequence) + 1 : 1,
      startTime: this.sharedVariableService.currentTime(),
      endTime: null,
      total: null,
    });

    localStorage.setItem('productionBreaks', JSON.stringify(this.lotBreaks));
    this.modalRef.hide();
    this.selectedMotivo = null;
    this.statusProd = 'Pausada'

    let prodInfoHead = JSON.parse(localStorage.getItem('prodInfoHead'));
    prodInfoHead.status = 'Pausada';
    localStorage.setItem('prodInfoHead', JSON.stringify(prodInfoHead));

    this.changeProductionStatus();
  }

  continueProduction(): void {
    this.lotBreaks = JSON.parse(localStorage.getItem('productionBreaks'));
    this.lotBreaks[this.lotBreaks.length - 1].endTime = this.sharedVariableService.currentTime();
    localStorage.setItem('productionBreaks', JSON.stringify(this.lotBreaks));

    this.statusProd = 'Iniciada'

    let prodInfoHead = JSON.parse(localStorage.getItem('prodInfoHead'));
    prodInfoHead.status = 'Iniciada';
    localStorage.setItem('prodInfoHead', JSON.stringify(prodInfoHead));

    this.changeProductionStatus();
  }

  // Adiciona item no lote (Item escolhido no LoteItemModal)
  addLoteItem(): void {
    let auxBag = [];
    this.lotItems.forEach(item => {
      auxBag.push(item.numBag)
    })

    this.lotItems.push({
      numBag: this.lotItems.length > 0 ? Math.max(...auxBag) + 1 : 1,
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
    this.updateProductionSummary();
  }

  // Salva Item do lote
  saveLoteItem(idx): void {
    this.lotItems[idx].edit = false;
    this.lotItems[idx].endTime = this.sharedVariableService.currentTime();
    localStorage.setItem('prodInfoItems', JSON.stringify(this.lotItems));
  }

  removeLoteItem(numBag): void {
    this.lotItems = this.lotItems.filter(obj => obj.numBag !== numBag)
    localStorage.setItem('prodInfoItems', JSON.stringify(this.lotItems));
  }

  // atualiza a quantidade do item do lote
  updateQtn(idx, value) {
    this.lotItems[idx].qtn = value;
    localStorage.setItem('prodInfoItems', JSON.stringify(this.lotItems));
    this.updateProductionSummary();
    this.sharedVariableService.calculateTime("01:00:00", "03:00:00", "+");
  }

  // atualiza o resumo da produção
  updateProductionSummary(): void {
    this.totQtn = 0
    this.totBag = this.lotItems.map(item => item.numBag).length;
    this.lotItems.map(item => {
      this.totQtn += Number(item.qtn)
    })
  }

  //Calculo de tempo da Triagem
  getDataDiff (startDate, endDate): any {
    var diff = endDate.getTime() - startDate.getTime();
    var days = Math.floor(diff / (60 * 60 * 24 * 1000));
    var hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
    var minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
    var seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));
    
    return { day: days, hour: hours, minute: minutes, second: seconds };
  }

  // Mostra modal para adicionar novo item no lote
  showLoteItemModal(): void {
    this.loadLoteItemForm();
    this.modalRef = this.modalService.show(this.loteItemScreen);
  }

  // Mostra uma modal diferente dependendo de qual das 4 ações selecionar
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
            this.statusProd === 'Pausada' ? this.continueProduction() : this.modalRef = this.modalService.show(this.pauseScreen);
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
  // Expande imagem de cada socio na lista de itens do lote
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

import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ViewImage } from 'src/app/shared/view-image/view-image.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { ProductionService } from '../production.service';
import { CrudService } from '../../cadastros/crud.service';
import { SharedVariableService } from '../../shared/shared-variable.service';
import { FormBuilder } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { from, interval, Subject } from 'rxjs';

@Component({
  selector: 'app-prensa',
  templateUrl: './prensa.component.html',
  styleUrls: ['./prensa.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrensaComponent implements OnInit {
  @ViewChild('pauseScreen', { static: true }) pauseScreen: ElementRef;
  @ViewChild('loteItemScreen', { static: true }) loteItemScreen: ElementRef;
  @ViewChild('startBtn', { static: true }) startBtn: ElementRef;
  @ViewChild('pausetBtn', { static: true }) pausetBtn: ElementRef;
  @ViewChild('stopBtn', { static: true }) stopBtn: ElementRef;
  @ViewChild('printBtn', { static: true }) printBtn: ElementRef;
  @ViewChild('itemsLoteTable', { static: true }) itemsLoteTable: ElementRef;

  // screen
  public modalRef: any;
  public yesNoMessage: YesNoMessage = new YesNoMessage();
  public viewImage: ViewImage = new ViewImage();
  public showYesNoMessage: boolean;
  public showModalImage: boolean;

  // selects
  public motivosDeParada: any;
  public produtos: any;
  public socios: any;

  //forms
  public headForm: any;
  public loteItemForm: any;

  public lotItems = [];
  public lotBreaks = [];
  public statusProd = '';
  public observation = '';
  public selectedMotivo: any;
  public totQtn: any;
  public lastPrensa: number;

  public totalTimeProduction: any;
  public totalTimeBreak: any
  public currentTime: any

  constructor(
    private toastService: ToastService,
    private crudService: CrudService,
    private ProductionService: ProductionService,
    private sharedVariableService: SharedVariableService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private changeDetector: ChangeDetectorRef
  ) {
    interval(1000).subscribe(() => {
      if (!this.changeDetector['destroyed']) {
        this.changeDetector.detectChanges();
      }
    });
  }

  private destroyed$ = new Subject();

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    const prensaInfoHead = JSON.parse(localStorage.getItem('prensaInfoHead'));
    this.getItems();
    if (prensaInfoHead) {
      this.loadHeadForm();
      if(prensaInfoHead['status']){
        this.headForm.controls.lote.setValue(prensaInfoHead['currentLote']);
        this.headForm.controls.data.setValue(this.sharedVariableService.currentDate(prensaInfoHead['start']));
        this.headForm.controls.inicio.setValue(this.sharedVariableService.currentTime(prensaInfoHead['start']));
        this.headForm.controls.situacao.setValue(prensaInfoHead['status']);
        this.headForm.controls.socio.setValue(prensaInfoHead.socio.nome);
        this.statusProd = prensaInfoHead['status'];
        this.totalTimeBreak = prensaInfoHead['totalTimeBreak'];
        
        setInterval(() => {
          this.getElapsedTime();
          this.currentTime = new Date();
        }, 1000);
      }

      this.totalTimeBreak = prensaInfoHead['totalTimeBreak'];
      this.observation = prensaInfoHead['observacao'];
      this.changeProductionStatus();

    } else {
      this.loadHeadForm();
      this.changeProductionStatus();
      this.crudService.getItems('parametros').subscribe(response => {
        if (!isNaN(response[0].presa)){
          this.lastPrensa =  Number(response[0].presa);
        } else {
          this.lastPrensa = 0;
        }
      });
    }

    const prensaInfoItems = JSON.parse(localStorage.getItem('prensaInfoItems'));
    if(prensaInfoItems) {
      this.lotItems = prensaInfoItems;
    }

    const productionBreaks = JSON.parse(localStorage.getItem('productionBreaks'));
    if(productionBreaks) {
      this.lotBreaks = productionBreaks;
    }
    this.updateProductionSummary();

    this.loadLoteItemForm();
    this.changeDetector.detectChanges();

  }

  updateObs(): void {
    let prensaInfoHead = JSON.parse(localStorage.getItem('prensaInfoHead'));
    prensaInfoHead.observacao = this.observation;
    localStorage.setItem('prensaInfoHead', JSON.stringify(prensaInfoHead));
  }

   // Mostra modal para adicionar novo item no lote
   showLoteItemModal(): void {
    this.loadLoteItemForm();
    this.modalRef = this.modalService.show(this.loteItemScreen);
  }

  // Atualiza o resumo da produção
  updateProductionSummary(): void {
    this.totQtn = 0
    this.lotItems.map(item => {
      this.totQtn += Number(item.qtn)
    })
  }

   // Atualiza a quantidade do item do lote
   updateQtn(idx, value): void {
    this.lotItems[idx].qtn = value;
    localStorage.setItem('prensaInfoItems', JSON.stringify(this.lotItems));
    this.updateProductionSummary();
  }

  // Calculo de tempo do TOTAL
  getElapsedTime(): void {
    const prodInfo = JSON.parse(localStorage.prensaInfoHead)
    const start = new Date(prodInfo.start)
    let totalSeconds = this.sharedVariableService.difTime(start, new Date());
    this.totalTimeProduction = (this.sharedVariableService.secondsToArryTime(totalSeconds));
  }

  getItems(): void{
    this.crudService.getItems('socios').subscribe(response => this.socios = response);
    this.crudService.getItems('motivosDeParada').subscribe(response => this.motivosDeParada = response);
    this.crudService.getItems('produtos').subscribe(response => this.produtos = response);
  }

  loadHeadForm(): void {
    this.headForm = this.formBuilder.group({
      lote: [null],
      data: [null],
      inicio: [null],
      termino: [null],
      socio: [null],
      situacao: [null],
    });
  }

  loadLoteItemForm(): void {
    this.loteItemForm = this.formBuilder.group({
      numBag: [null],
      product: [null],
      qtn: [null],
    });
   }

  changeProductionStatus(): void {
    if (this.statusProd === '') {
      // this.itemsLoteTable.nativeElement.disabled = false;
      this.startBtn.nativeElement.disabled = false;
      this.pausetBtn.nativeElement.disabled = true;
      this.stopBtn.nativeElement.disabled = true;
      this.printBtn.nativeElement.disabled = true;

    }else if (this.statusProd === 'Iniciada') {
      // this.itemsLoteTable.nativeElement.disabled = false;
      this.startBtn.nativeElement.disabled = true;
      this.pausetBtn.nativeElement.disabled = false;
      this.stopBtn.nativeElement.disabled = false;
      this.printBtn.nativeElement.disabled = true;
      this.headForm.controls.situacao.setValue('Iniciada');
      this.headForm.get('socio').disable();
      this.pausetBtn.nativeElement.innerHTML = '<i class="fa fa-pause-circle"></i> Pausar Produção'
    
    } else if (this.statusProd === 'Pausada') {
      // this.itemsLoteTable.nativeElement.disabled = true;
      this.headForm.controls.situacao.setValue('Pausada');
      this.startBtn.nativeElement.disabled = true;
      this.pausetBtn.nativeElement.disabled = false; 
      this.stopBtn.nativeElement.disabled = true;
      this.printBtn.nativeElement.disabled = true;
      this.headForm.get('socio').disable();
      this.pausetBtn.nativeElement.innerHTML = '<i class="fa fa-play-circle"></i> Continuar Produção'
    }
    console.log('Não cai nos if')
  }

  // Inicia a Produção
  startProduction(): void {
    if (this.headForm.get('socio').value) {
      if (this.statusProd === '') {
        const nextPrensa = this.lastPrensa + 1;
        const numLote = new FormData();
        numLote.append('numero_proxima_NFE', this.motivosDeParada.numero_proxima_NFE);
        numLote.append('numero_proxima_NFS', this.motivosDeParada.numero_proxima_NFS);
        numLote.append('prensa', nextPrensa.toString());
        numLote.append('remanufatura', this.motivosDeParada.remanufatura);
        numLote.append('triagem', this.motivosDeParada.triagem);
        this.crudService.updateItem('parametros', numLote, '1').subscribe(response => {}, err => {});

        this.headForm.controls.lote.setValue(this.lastPrensa + 1);
        this.headForm.controls.data.setValue(this.sharedVariableService.currentDate(new Date()));
        this.headForm.controls.inicio.setValue(this.sharedVariableService.currentTime(new Date()));
        this.headForm.controls.situacao.setValue('Iniciada');
        
        const prensaInfoHead = {
          currentLote: this.lastPrensa + 1,
          start: new Date(),
          end: null,
          totalTimeBreak: null,
          status: 'Iniciada',
          socio: this.headForm.get('socio').value,
          observacao: this.observation
        };

        localStorage.setItem('prensaInfoHead', JSON.stringify(prensaInfoHead));
        this.statusProd = 'Iniciada';
        this.changeProductionStatus();

        this.ngOnInit();
      } else {
        this.toastService.addToast('Adicione pelo menos um item na produção para inicia-la', 'darkred');
      }
    } else {
      this.toastService.addToast('Selecione um SÓCIO para iniciar', 'darkred');
    }
  }

  // Pausa a Prudução
  pauseProduction(): void {
    if (this.selectedMotivo) {
      const prensaBreaks = JSON.parse(localStorage.getItem('prensaBreaks'));
      let auxSequence = [];

      if (prensaBreaks) {
        this.lotBreaks = prensaBreaks;
        this.lotBreaks.forEach(item => {
          auxSequence.push(item.sequence)
        })
      }

      this.lotBreaks.push({
        motivo: this.selectedMotivo,
        sequence: this.lotBreaks.length > 0 ? Math.max(...auxSequence) + 1 : 1,
        startTime: new Date(),
        endTime: null,
        total: null,
      });

      localStorage.setItem('prensaBreaks', JSON.stringify(this.lotBreaks));
      this.modalRef.hide();
      this.selectedMotivo = null;
      this.statusProd = 'Pausada'

      let prensaInfoHead = JSON.parse(localStorage.getItem('prensaInfoHead'));
      prensaInfoHead.status = 'Pausada';
      localStorage.setItem('prensaInfoHead', JSON.stringify(prensaInfoHead));

      this.changeProductionStatus();
    }
  }
  
  continueProduction(): void {
    this.lotBreaks = JSON.parse(localStorage.getItem('prensaBreaks'));
    this.lotBreaks[this.lotBreaks.length - 1].endTime = new Date();
    this.lotBreaks[this.lotBreaks.length - 1].total = this.sharedVariableService.difTime(
      this.lotBreaks[this.lotBreaks.length - 1].startTime,
      this.lotBreaks[this.lotBreaks.length - 1].endTime
    )
    localStorage.setItem('prensaBreaks', JSON.stringify(this.lotBreaks));

    this.statusProd = 'Iniciada'

    
    let totalSec = 0;
    this.lotBreaks.forEach(item => {
      totalSec += item.total;
    });
    this.totalTimeBreak = this.sharedVariableService.secondsToArryTime(totalSec);
    
    let prensaInfoHead = JSON.parse(localStorage.getItem('prensaInfoHead'));
    prensaInfoHead.status = 'Iniciada';
    prensaInfoHead.totalTimeBreak = this.totalTimeBreak;
    localStorage.setItem('prensaInfoHead', JSON.stringify(prensaInfoHead));
    
    this.changeProductionStatus();
  }

  stopProduction(): void {

  }

  // Adiciona item no lote (Item escolhido no LoteItemModal)
  addLoteItem(): void {
    let prensaInfoHead = JSON.parse(localStorage.getItem('prensaInfoHead'));
    if (!prensaInfoHead){
      const produto = this.loteItemForm.get('product').value
      localStorage.setItem('prensaInfoHead', JSON.stringify(prensaInfoHead));
    }

    if (this.loteItemForm.get('product').value) {
      let auxBag = [];
      this.lotItems.forEach(item => {
        auxBag.push(item.numBag)
      })

      this.lotItems.push({
        numBag: this.lotItems.length > 0 ? Math.max(...auxBag) + 1 : 1,
        product: this.loteItemForm.get('product').value,
        qtn: 0,
      });

      localStorage.setItem('prensaInfoItems', JSON.stringify(this.lotItems));
      this.loadLoteItemForm();
      this.modalRef.hide();
      this.updateProductionSummary();
    } else {
      this.toastService.addToast('Selecione o produto para continuar', 'darkred');
    }
  }

  removeLoteItem(numBag): void {
    
    this.lotItems = this.lotItems.filter(obj => obj.numBag !== numBag)
    localStorage.setItem('prensaInfoItems', JSON.stringify(this.lotItems));
    this.updateProductionSummary();

    let prensaInfoItems = JSON.parse(localStorage.getItem('prensaInfoItems'));
    if (!prensaInfoItems['status']){
      if(this.lotItems.length == 0){
        localStorage.removeItem('prensaInfoItems')
      }
    }
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
            this.stopProduction();
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

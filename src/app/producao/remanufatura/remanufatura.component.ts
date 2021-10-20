import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { ProductionService } from '../production.service';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ViewImage } from 'src/app/shared/view-image/view-image.component';
import { SharedVariableService } from '../../shared/shared-variable.service';
import { CrudService } from '../../cadastros/crud.service';
import { FormBuilder } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { from, interval, Subject } from 'rxjs';


@Component({
  selector: 'app-remanufatura',
  templateUrl: './remanufatura.component.html',
  styleUrls: ['./remanufatura.component.css']
})
export class RemanufaturaComponent implements OnInit {
  @ViewChild ('pauseScreen', { static: true }) pauseScreen: ElementRef;
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
  public fornecedores: any;
  public motivosDeParada: any;
  public materiasPrimas: any;
  public produtos: any;
  public socios: any;

  // forms
  public headForm: any;
  public loteItemForm: any;

  public lastRemanufatura: number;
  public lotItems = [];
  public lotBreaks = [];
  public statusProd = '';
  public selectedMotivo: any;
  public selectedFornecedor: any;
  public totBag: any;
  public totProduct: any;
  public totQtn: any;
  public totTime: any;
  public finaltime: any;
  public observation = '';

  public totalTimeProduction: any;
  public totalTimeBreak: any
  public currentTime: any

  public disableAddButton: false;

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

  ngOnInit(): void {
    const remanufaturaInfoHead = JSON.parse(localStorage.getItem('remanufaturaInfoHead'));
    this.getItems();
    if (remanufaturaInfoHead) {
      this.loadHeadForm();
      if(remanufaturaInfoHead['status']){
        this.headForm.controls.lote.setValue(remanufaturaInfoHead['currentLote']);
        this.headForm.controls.data.setValue(this.sharedVariableService.currentDate(remanufaturaInfoHead['start']));
        this.headForm.controls.inicio.setValue(this.sharedVariableService.currentTime(remanufaturaInfoHead['start']));
        this.headForm.controls.termino.setValue(this.sharedVariableService.currentTime(remanufaturaInfoHead['end']));
        this.headForm.controls.situacao.setValue(remanufaturaInfoHead['status']);
        this.headForm.controls.socio.setValue(remanufaturaInfoHead.socio.nome);
        this.statusProd = remanufaturaInfoHead['status'];
        this.totalTimeBreak = remanufaturaInfoHead['totalTimeBreak'];
        
        setInterval(() => {
          this.getElapsedTime();
          this.currentTime = new Date();
        }, 1000);
      }

      this.totalTimeBreak = remanufaturaInfoHead['totalTimeBreak'];
      this.observation = remanufaturaInfoHead['observacao'];
      this.changeProductionStatus();

    } else {
      this.loadHeadForm();
      this.changeProductionStatus();
      this.crudService.getItems('parametros').subscribe(response => {
        this.lastRemanufatura =  Number(response[0].remanufatura);
      });
    }

    const remanufaturaInfoItems = JSON.parse(localStorage.getItem('remanufaturaInfoItems'));
    if(remanufaturaInfoItems) {
      this.lotItems = remanufaturaInfoItems;
    }
    const remanufaturaBreaks = JSON.parse(localStorage.getItem('remanufaturaBreaks'));
    if(remanufaturaBreaks) {
      this.lotBreaks = remanufaturaBreaks;
    }
    this.updateProductionSummary();

    this.loadLoteItemForm();
    this.changeDetector.detectChanges();
  }

  
  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  // Calculo de tempo do TOTAL da Remanufatura
  getElapsedTime(): void {
    const prodInfo = JSON.parse(localStorage.remanufaturaInfoHead)
    const start = new Date(prodInfo.start)
    let totalSeconds = this.sharedVariableService.difTime(start, new Date());
    this.totalTimeProduction = (this.sharedVariableService.secondsToArryTime(totalSeconds));
  }

  // Build do form cabeçalho (Informações do lote)
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

  // Build do form itens (Itens do lote)
  loadLoteItemForm(): void {
    this.loteItemForm = this.formBuilder.group({
      numBag: [null],
      product: [null],
      qtn: [null],
      socio: [null],
      tempo: [null],
      start: [null],
      end: [null],
      edit: true
    });
  }

  // Chama as API para obter as informações necessária para a Remanufatura
  getItems(): void {
    let temp = null //gambiarra
    this.crudService.getItems('socios').subscribe(response => this.socios = response);
    this.crudService.getItems('fornecedores').subscribe(response => this.fornecedores = response);
    this.crudService.getItems('motivosDeParada').subscribe(response => this.motivosDeParada = response);
    this.crudService.getItems('materiasPrimas').subscribe(response => this.materiasPrimas = response);
    this.crudService.getItems('produtos').subscribe(response => this.produtos = response);

    this.crudService.getItems('precificacao').subscribe(response => {
      // console.log(this.selectedFornecedor)
      this.produtos = response.filter(resp => resp['fornecedor']['id'] == this.selectedFornecedor.id)
      this.produtos = this.produtos.map(item => {
        item.produto
        console.log(item)
      });
      console.log(this.produtos)
    });
  }

  // Inicia a Produção
  startProduction(): void {
    if (this.headForm.get('socio').value) {
      if (this.statusProd === '') {
        const nextRemanufatura = this.lastRemanufatura + 1;
        const numLote = new FormData();
        numLote.append('numero_proxima_NFE', this.motivosDeParada.numero_proxima_NFE);
        numLote.append('numero_proxima_NFS', this.motivosDeParada.numero_proxima_NFS);
        numLote.append('prensa', this.motivosDeParada.prensa);
        numLote.append('remanufatura', nextRemanufatura.toString());
        numLote.append('triagem', this.motivosDeParada.triagem);
        this.crudService.updateItem('parametros', numLote, '1').subscribe(response => {}, err => {});

        this.headForm.controls.lote.setValue(this.lastRemanufatura + 1);
        this.headForm.controls.data.setValue(this.sharedVariableService.currentDate(new Date()));
        this.headForm.controls.inicio.setValue(this.sharedVariableService.currentTime(new Date()));
        this.headForm.controls.situacao.setValue('Iniciada');
        
        const remanufaturaInfoHead = {
          currentLote: this.lastRemanufatura + 1,
          start: new Date(),
          end: null,
          totalTimeBreak: null,
          status: 'Iniciada',
          socio: this.headForm.get('socio').value,
          observacao: this.observation
        };

        let remanufaturaInfoItems = JSON.parse(localStorage.getItem('remanufaturaInfoItems'));
        if (remanufaturaInfoItems){
          remanufaturaInfoItems.forEach(element => {
            element.start = new Date();
          });
        }

        localStorage.setItem('remanufaturaInfoHead', JSON.stringify(remanufaturaInfoHead));
        localStorage.setItem('remanufaturaInfoItems', JSON.stringify(remanufaturaInfoItems));
        this.statusProd = 'Iniciada';
        this.changeProductionStatus();

        this.ngOnInit();
      } else {
        this.toastService.addToast('Adicione pelo menos um item na produção para inicia-la', 'darkred');
      }
    } else {
      this.toastService.addToast('Selecione um SÓCIO / FORNECEDOR / MATÉRIA PRIMA para iniciar', 'darkred');
    }
  }

  // muda status da produção baseado no parametro
  changeProductionStatus(): void {
    if (this.statusProd === '') {
      this.itemsLoteTable.nativeElement.disabled = false;
      this.startBtn.nativeElement.disabled = false;
      this.pausetBtn.nativeElement.disabled = true;
      this.stopBtn.nativeElement.disabled = true;
      this.printBtn.nativeElement.disabled = true;
    }else if (this.statusProd === 'Iniciada') {
      this.itemsLoteTable.nativeElement.disabled = false;
      this.startBtn.nativeElement.disabled = true;
      this.pausetBtn.nativeElement.disabled = false;
      this.stopBtn.nativeElement.disabled = false;
      this.printBtn.nativeElement.disabled = true;
      this.headForm.controls.situacao.setValue('Iniciada');
      this.headForm.get('socio').disable();
      this.pausetBtn.nativeElement.innerHTML = '<i class="fa fa-pause-circle"></i> Pausar Produção'
    } else if (this.statusProd === 'Pausada') {
      this.itemsLoteTable.nativeElement.disabled = true;
      this.headForm.controls.situacao.setValue('Pausada');
      this.startBtn.nativeElement.disabled = true;
      this.pausetBtn.nativeElement.disabled = false; 
      this.stopBtn.nativeElement.disabled = true;
      this.printBtn.nativeElement.disabled = true;
      this.headForm.get('socio').disable();
      this.pausetBtn.nativeElement.innerHTML = '<i class="fa fa-play-circle"></i> Continuar Produção'
    }
  }

  // Pausa a Prudução
  pauseProduction(): void {
    if (this.selectedMotivo) {
      const remanufaturaBreaks = JSON.parse(localStorage.getItem('remanufaturaBreaks'));
      let auxSequence = [];

      if (remanufaturaBreaks) {
        this.lotBreaks = remanufaturaBreaks;
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

      localStorage.setItem('remanufaturaBreaks', JSON.stringify(this.lotBreaks));
      this.modalRef.hide();
      this.selectedMotivo = null;
      this.statusProd = 'Pausada'

      let remanufaturaInfoHead = JSON.parse(localStorage.getItem('remanufaturaInfoHead'));
      remanufaturaInfoHead.status = 'Pausada';
      localStorage.setItem('remanufaturaInfoHead', JSON.stringify(remanufaturaInfoHead));

      this.changeProductionStatus();
    } else {
      this.toastService.addToast('Selecione o motivo para continuar', 'darkred');
    }
  }

  // Continua a Produção (sai do status de pausa)
  continueProduction(): void {
    this.lotBreaks = JSON.parse(localStorage.getItem('remanufaturaBreaks'));
    this.lotBreaks[this.lotBreaks.length - 1].endTime = new Date();
    this.lotBreaks[this.lotBreaks.length - 1].total = this.sharedVariableService.difTime(
      this.lotBreaks[this.lotBreaks.length - 1].startTime,
      this.lotBreaks[this.lotBreaks.length - 1].endTime
    )
    localStorage.setItem('remanufaturaBreaks', JSON.stringify(this.lotBreaks));

    this.statusProd = 'Iniciada'

    
    let totalSec = 0;
    this.lotBreaks.forEach(item => {
      totalSec += item.total;
    });
    this.totalTimeBreak = this.sharedVariableService.secondsToArryTime(totalSec);
    
    let remanufaturaInfoHead = JSON.parse(localStorage.getItem('remanufaturaInfoHead'));
    remanufaturaInfoHead.status = 'Iniciada';
    remanufaturaInfoHead.totalTimeBreak = this.totalTimeBreak;
    localStorage.setItem('remanufaturaInfoHead', JSON.stringify(remanufaturaInfoHead));
    
    this.changeProductionStatus();
  }

  // Finaliza produção
  stopProduction(): void {
    let remanufaturaInfoHead = JSON.parse(localStorage.getItem('remanufaturaInfoHead')); 
    let remanufaturaInfoItems = JSON.parse(localStorage.getItem('remanufaturaInfoItems'));
    let remanufaturaBreaks = JSON.parse(localStorage.getItem('remanufaturaBreaks'));

    remanufaturaInfoHead.totalTimeProduction = this.sharedVariableService.difTime(remanufaturaInfoHead.start, new Date());
    remanufaturaInfoHead.end = new Date().toISOString();

    if (remanufaturaInfoItems) { // Verifica se existe itens na produção
      if (remanufaturaInfoItems.filter(item => item.edit === true).length == 0) { // Verifica se nenhum item ainda não foi fechado  
        // this.ProductionService.createRemanufatura(remanufaturaInfoHead, remanufaturaInfoItems, remanufaturaBreaks);        
        
        let arrayUniqueByKey = [...new Map(remanufaturaInfoItems.map(item => [item.product.id, item.product])).values()];
        arrayUniqueByKey.forEach(item => {
          Number(item['quantidade'])
          remanufaturaInfoItems.forEach(element => {
            if (element.product.id === item['id']) {
              // console.log(item['quantidade'])
              item['quantidade'] += Number(element.qtn)
              // console.log(element.product)
            }
          });
          
        });
        console.log(arrayUniqueByKey)
      } else {
        this.toastService.addToast('Feche todos os Tambores/Bags para Finalizar', 'darkred');
      }
    } else {
      this.toastService.addToast('Esta produção ainda não possui itens', 'darkred')
    }
  }

  // Adiciona item no lote (Item escolhido no LoteItemModal)
  addLoteItem(): void {
    let remanufaturaInfoHead = JSON.parse(localStorage.getItem('remanufaturaInfoHead'));
    if (!remanufaturaInfoHead){
      const produto = this.loteItemForm.get('product').value
      this.selectedFornecedor = produto.fornecedor

      remanufaturaInfoHead = {
        fornecedor: this.headForm.get('fornecedor').value,
      }
      localStorage.setItem('remanufaturaInfoHead', JSON.stringify(remanufaturaInfoHead));
    }

    if (this.loteItemForm.get('product').value && this.loteItemForm.get('socio').value) {
      let auxBag = [];
      this.lotItems.forEach(item => {
        auxBag.push(item.numBag)
      })
     
      this.lotItems.push({
        numBag: this.lotItems.length > 0 ? Math.max(...auxBag) + 1 : 1,
        product: this.loteItemForm.get('product').value,
        qtn: 0,
        socio: this.loteItemForm.get('socio').value,
        start: this.statusProd === '' ? null : new Date(),
        end: null,
        edit: true
      });

      localStorage.setItem('remanufaturaInfoItems', JSON.stringify(this.lotItems));
      this.loadLoteItemForm();
      this.modalRef.hide();
      this.updateProductionSummary();
    } else {
      this.toastService.addToast('Selecione sócio e/ou produto para continuar', 'darkred');
    }
  }

  // Salva Item do lote
  saveLoteItem(idx): void {
    this.lotItems[idx].edit = false;
    this.lotItems[idx].end = new Date();
    localStorage.setItem('remanufaturaInfoItems', JSON.stringify(this.lotItems));
  }

  removeLoteItem(numBag): void {
    
    this.lotItems = this.lotItems.filter(obj => obj.numBag !== numBag)
    localStorage.setItem('remanufaturaInfoItems', JSON.stringify(this.lotItems));
    this.updateProductionSummary();

    let remanufaturaInfoHead = JSON.parse(localStorage.getItem('remanufaturaInfoHead'));
    if (!remanufaturaInfoHead['status'] && remanufaturaInfoHead['fornecedor']){
      if(this.lotItems.length == 0){
        this.selectedFornecedor = '';
        localStorage.removeItem('remanufaturaInfoHead')
      }
    }
  }

  // Atualiza a quantidade do item do lote
  updateQtn(idx, value): void {
    this.lotItems[idx].qtn = value;
    localStorage.setItem('remanufaturaInfoItems', JSON.stringify(this.lotItems));
    this.updateProductionSummary();
  }

  updateObs(): void {
    let remanufaturaInfoHead = JSON.parse(localStorage.getItem('remanufaturaInfoHead'));
    remanufaturaInfoHead.observacao = this.observation;
    localStorage.setItem('remanufaturaInfoHead', JSON.stringify(remanufaturaInfoHead));
  }

  // Atualiza o resumo da produção
  updateProductionSummary(): void {
    this.totQtn = 0
    this.totBag = this.lotItems.map(item => item.numBag).length;
    this.lotItems.map(item => {
      this.totQtn += Number(item.qtn)
    })
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

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

  public lastTriagem: number;
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

  ngOnInit(): void {
    const prodInfoHead = JSON.parse(localStorage.getItem('prodInfoHead'));
    this.getItems();
    if (prodInfoHead) {
      this.loadHeadForm();
      this.headForm.controls.lote.setValue(prodInfoHead['currentLote']);
      this.headForm.controls.data.setValue(this.sharedVariableService.currentDate(prodInfoHead['start']));
      this.headForm.controls.inicio.setValue(this.sharedVariableService.currentTime(prodInfoHead['start']));
      this.headForm.controls.situacao.setValue(prodInfoHead['status']);
      this.headForm.controls.socio.setValue(prodInfoHead.socio.nome);
      this.headForm.controls.fornecedor.setValue(prodInfoHead.fornecedor.razao_social_nome);
      this.headForm.controls.materia_prima.setValue(prodInfoHead.materia.nome);
      this.statusProd = prodInfoHead['status'];
      this.selectedFornecedor = prodInfoHead['fornecedor']
      this.totalTimeBreak = prodInfoHead['totalTimeBreak'];
      this.changeProductionStatus();
      
      const prodInfoItems = JSON.parse(localStorage.getItem('prodInfoItems'));
      if(prodInfoItems) {
        this.lotItems = prodInfoItems;
      }
      const productionBreaks = JSON.parse(localStorage.getItem('productionBreaks'));
      if(productionBreaks) {
        this.lotBreaks = productionBreaks;
      }
      this.updateProductionSummary();

      setInterval(() => {
        this.getElapsedTime();
        this.currentTime = new Date();
      }, 1000);
    } else {
      this.loadHeadForm();
      this.changeProductionStatus();
      this.crudService.getItems('parametros').subscribe(response => {
        this.lastTriagem =  Number(response[0].triagem);
      });
    }

    this.loadLoteItemForm();
    this.changeDetector.detectChanges();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  // Calculo de tempo do TOTAL da triagem
  getElapsedTime(): void {
    const prodInfo = JSON.parse(localStorage.prodInfoHead)
    const start = new Date(prodInfo.start)
    let totalSeconds = this.sharedVariableService.difTime(start, new Date());
    this.totalTimeProduction = (this.sharedVariableService.secondsToDate(totalSeconds));
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
      start: [null],
      end: [null],
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
        this.headForm.controls.data.setValue(this.sharedVariableService.currentDate(new Date()));
        this.headForm.controls.inicio.setValue(this.sharedVariableService.currentTime(new Date()));
        this.headForm.controls.situacao.setValue('Iniciada');
        
        const prodInfoHead = {
          currentLote: this.lastTriagem + 1,
          fornecedor: this.headForm.get('fornecedor').value,
          materia: this.headForm.get('materia_prima').value,
          start: new Date(),
          end: null,
          totalTimeBreak: null,
          status: 'Iniciada',
          socio: this.headForm.get('socio').value,
        };
        localStorage.setItem('prodInfoHead', JSON.stringify(prodInfoHead));
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
      startTime: new Date(),
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

  // Continua a Produção (sai do status de pausa)
  continueProduction(): void {
    this.lotBreaks = JSON.parse(localStorage.getItem('productionBreaks'));
    this.lotBreaks[this.lotBreaks.length - 1].endTime = new Date();
    this.lotBreaks[this.lotBreaks.length - 1].total = this.sharedVariableService.difTime(
      this.lotBreaks[this.lotBreaks.length - 1].startTime,
      this.lotBreaks[this.lotBreaks.length - 1].endTime
    )
    localStorage.setItem('productionBreaks', JSON.stringify(this.lotBreaks));

    this.statusProd = 'Iniciada'

    
    let totalSec = 0;
    this.lotBreaks.forEach(item => {
      totalSec += item.total;
    });
    this.totalTimeBreak = this.sharedVariableService.secondsToDate(totalSec);
    
    let prodInfoHead = JSON.parse(localStorage.getItem('prodInfoHead'));
    prodInfoHead.status = 'Iniciada';
    prodInfoHead.totalTimeBreak = this.totalTimeBreak;
    localStorage.setItem('prodInfoHead', JSON.stringify(prodInfoHead));
    
    this.changeProductionStatus();
  }

  // Finaliza produção
  stopProduction(): void {
    let prodInfoItems = JSON.parse(localStorage.getItem('prodInfoItems'));
    
    if (prodInfoItems) { // Verifica se existe itens na produção
      if (prodInfoItems.filter(item => item.edit === true).length == 0) { // Verifica se nenhum item ainda não foi fechado
        let headSucess = false;
        let ItemsSucess = false;
        let BreaksSucess = false;
        
        // // Converte prodInfoHead do local storage e insere no banco
        let prodInfoHead = JSON.parse(localStorage.getItem('prodInfoHead')); 
        prodInfoHead.end = new Date().toISOString();
        this.totalTimeProduction = this.sharedVariableService.difTime(prodInfoHead.start, new Date());
  
        const loteData = new FormData();
        loteData.append('num_lote', prodInfoHead.currentLote);
        loteData.append('finalizado', prodInfoHead.end);
        loteData.append('fornecedor', prodInfoHead.fornecedor.id);
        loteData.append('iniciado', prodInfoHead.start);
        loteData.append('socio', prodInfoHead.socio.id);
        loteData.append('tempo_total', this.totalTimeProduction);
        loteData.append('observacao', 'bla bla bla');
  
        this.ProductionService.createProduction('lote', loteData).subscribe(response => { headSucess = true}, err => {});
  
        // Converte prodLoteItems do local storage e insere no banco        
        const loteItemsData = new FormData();
        prodInfoItems.forEach(item => {
          let totalTimeItem = this.sharedVariableService.difTime(item.start, item.end);
          loteItemsData.append('finalizado', item.end);
          loteItemsData.append('iniciado', item.start);
          loteItemsData.append('num_lote', prodInfoHead.currentLote);
          loteItemsData.append('num_recipiente', item.numBag);
          loteItemsData.append('produto', item.product.id);
          loteItemsData.append('quantidade', item.qtn);
          loteItemsData.append('socio', item.socio.id);
          loteItemsData.append('tempo_total', totalTimeItem.toString());
  
          this.ProductionService.createProduction('loteItens', loteItemsData).subscribe(response => { ItemsSucess = true }, err => {});
        });
        
        // Converte productionBreaks do local storage e insere no banco
        let productionBreaks = JSON.parse(localStorage.getItem('productionBreaks'));
        const loteBreaksData = new FormData();
        productionBreaks.forEach(item => {
          loteBreaksData.append('finalizado', item.endTime);
          loteBreaksData.append('iniciado', item.startTime);
          loteBreaksData.append('motivo', item.motivo);
          loteBreaksData.append('num_lote', prodInfoHead.currentLote);
          loteBreaksData.append('sequencia', item.sequence);
          loteBreaksData.append('tempo_total', item.total);
          
          this.ProductionService.createProduction('loteParadas', loteBreaksData).subscribe(response => { BreaksSucess = true }, err => {});
        });
  
        
        if (BreaksSucess && headSucess && ItemsSucess){
          this.headForm.controls.termino.setValue(this.sharedVariableService.currentTime(prodInfoHead['end']));
          prodInfoHead.status = 'Finalizada';
          this.toastService.addToast('Produção salva com sucesso');
        } else {
          this.toastService.addToast('Não foi possivel salvar a produção', 'darkred');
        }
      } else {
        this.toastService.addToast('Feche todos os Tambores/Bags para Finalizar', 'darkred');
      }
    } else {
      this.toastService.addToast('Estaprodução ainda não possui itens', 'darkred')
    }
  }

  // Adiciona item no lote (Item escolhido no LoteItemModal)
  addLoteItem(): void {
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
        start: new Date(),
        end: null,
        edit: true
      });
      localStorage.setItem('prodInfoItems', JSON.stringify(this.lotItems));
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
    localStorage.setItem('prodInfoItems', JSON.stringify(this.lotItems));
  }

  removeLoteItem(numBag): void {
    this.lotItems = this.lotItems.filter(obj => obj.numBag !== numBag)
    localStorage.setItem('prodInfoItems', JSON.stringify(this.lotItems));
    this.updateProductionSummary();
  }

  // atualiza a quantidade do item do lote
  updateQtn(idx, value) {
    this.lotItems[idx].qtn = value;
    localStorage.setItem('prodInfoItems', JSON.stringify(this.lotItems));
    this.updateProductionSummary();
  }

  // atualiza o resumo da produção
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

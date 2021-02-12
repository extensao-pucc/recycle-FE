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
    const prodInfoHead = JSON.parse(localStorage.getItem('prodInfoHead'));
    this.getItems();
    if (prodInfoHead) {
      this.loadHeadForm();
      if(prodInfoHead['status']){
        this.headForm.controls.lote.setValue(prodInfoHead['currentLote']);
        this.headForm.controls.data.setValue(this.sharedVariableService.currentDate(prodInfoHead['start']));
        this.headForm.controls.inicio.setValue(this.sharedVariableService.currentTime(prodInfoHead['start']));
        this.headForm.controls.termino.setValue(this.sharedVariableService.currentTime(prodInfoHead['end']));
        this.headForm.controls.situacao.setValue(prodInfoHead['status']);
        this.headForm.controls.socio.setValue(prodInfoHead.socio.nome);
        this.headForm.controls.fornecedor.setValue(prodInfoHead.fornecedor.razao_social_nome);
        this.headForm.controls.materia_prima.setValue(prodInfoHead.materia.nome);
        this.statusProd = prodInfoHead['status'];
        this.totalTimeBreak = prodInfoHead['totalTimeBreak'];

        setInterval(() => {
          this.getElapsedTime();
          this.currentTime = new Date();
        }, 1000);
      }
      this.selectedFornecedor = prodInfoHead['fornecedor']
      this.changeProductionStatus();

    } else {
      this.loadHeadForm();
      this.changeProductionStatus();
      this.crudService.getItems('parametros').subscribe(response => {
        this.lastTriagem =  Number(response[0].triagem);
      });
    }

    const prodInfoItems = JSON.parse(localStorage.getItem('prodInfoItems'));
    if(prodInfoItems) {
      this.lotItems = prodInfoItems;
    }
    const productionBreaks = JSON.parse(localStorage.getItem('productionBreaks'));
    if(productionBreaks) {
      this.lotBreaks = productionBreaks;
    }
    this.updateProductionSummary();

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
        const nextTriagem = this.lastTriagem + 1;
        const numLote = new FormData();
        numLote.append('numero_proxima_NFE', this.motivosDeParada.numero_proxima_NFE);
        numLote.append('numero_proxima_NFS', this.motivosDeParada.numero_proxima_NFS);
        numLote.append('prensa', this.motivosDeParada.prensa);
        numLote.append('remanufatura', this.motivosDeParada.remanufatura);
        numLote.append('triagem', nextTriagem.toString());
        this.crudService.updateItem('parametros', numLote, '1').subscribe(response => {}, err => {});

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

        let prodInfoItems = JSON.parse(localStorage.getItem('prodInfoItems'));
        if (prodInfoItems){
          prodInfoItems.forEach(element => {
            element.start = new Date();
          });
        }

        localStorage.setItem('prodInfoHead', JSON.stringify(prodInfoHead));
        localStorage.setItem('prodInfoItems', JSON.stringify(prodInfoItems));
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
      this.headForm.get('fornecedor').disable();
      this.headForm.get('materia_prima').disable();
      this.pausetBtn.nativeElement.innerHTML = '<i class="fa fa-pause-circle"></i> Pausar Produção'
    } else if (this.statusProd === 'Pausada') {
      this.itemsLoteTable.nativeElement.disabled = true;
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
    if (this.selectedMotivo) {
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
    } else {
      this.toastService.addToast('Selecione o motivo para continuar', 'darkred');
    }
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
    this.totalTimeBreak = this.sharedVariableService.secondsToArryTime(totalSec);
    
    let prodInfoHead = JSON.parse(localStorage.getItem('prodInfoHead'));
    prodInfoHead.status = 'Iniciada';
    prodInfoHead.totalTimeBreak = this.totalTimeBreak;
    localStorage.setItem('prodInfoHead', JSON.stringify(prodInfoHead));
    
    this.changeProductionStatus();
  }

  // Finaliza produção
  stopProduction(): void {
    let prodInfoHead = JSON.parse(localStorage.getItem('prodInfoHead')); 
    let prodInfoItems = JSON.parse(localStorage.getItem('prodInfoItems'));
    let productionBreaks = JSON.parse(localStorage.getItem('productionBreaks'));

    prodInfoHead.totalTimeProduction = this.sharedVariableService.difTime(prodInfoHead.start, new Date());
    prodInfoHead.end = new Date().toISOString();

    if (prodInfoItems) { // Verifica se existe itens na produção
      if (prodInfoItems.filter(item => item.edit === true).length == 0) { // Verifica se nenhum item ainda não foi fechado  
           
        this.ProductionService.createTriagem(prodInfoHead, prodInfoItems, productionBreaks);        
        this.headForm.controls.termino.setValue(this.sharedVariableService.currentTime(prodInfoHead.end));
        prodInfoHead.status = 'Finalizada';
        localStorage.setItem('prodInfoHead', JSON.stringify(prodInfoHead));
        
      } else {
        this.toastService.addToast('Feche todos os Tambores/Bags para Finalizar', 'darkred');
      }
    } else {
      this.toastService.addToast('Esta produção ainda não possui itens', 'darkred')
    }
  }

  // Adiciona item no lote (Item escolhido no LoteItemModal)
  addLoteItem(): void {
    let prodInfoHead = JSON.parse(localStorage.getItem('prodInfoHead'));
    if (!prodInfoHead){
      const produto = this.loteItemForm.get('product').value
      this.selectedFornecedor = produto.fornecedor
      this.headForm.controls.fornecedor.setValue(this.selectedFornecedor.razao_social_nome);
      // this.headForm.controls.fornecedor.setText(this.selectedFornecedor.razao_social_nome);

      prodInfoHead = {
        fornecedor: this.headForm.get('fornecedor').value,
      }
      localStorage.setItem('prodInfoHead', JSON.stringify(prodInfoHead));
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

  // Atualiza a quantidade do item do lote
  updateQtn(idx, value) {
    this.lotItems[idx].qtn = value;
    localStorage.setItem('prodInfoItems', JSON.stringify(this.lotItems));
    this.updateProductionSummary();
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

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
  selector: 'app-remanufatura',
  templateUrl: './remanufatura.component.html',
  styleUrls: ['./remanufatura.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
  public produtos: any;
  public socios: any;

  // forms
  public headForm: any;
  public loteItemForm: any;

  public lastRemanufatura: number;
  public lotItemsInicial = [];
  public lotItemsFinal = [];
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
  public totalTimeBreak: any;
  public currentTime: any;
  public loteItemScreenTo: string;

  public disableAddButton: false;

  constructor(
    private toastService: ToastService,
    private crudService: CrudService,
    private productionService: ProductionService,
    private sharedVariableService: SharedVariableService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.goTo('remanufatura'); // Caso recarregue a pagina, mensagem de sucesso é removida

    interval(1000).subscribe(() => {
      if (!this.changeDetector['destroyed']) {
        this.changeDetector.detectChanges();
      }
    });
  }

  private destroyed$ = new Subject();

  ngOnInit(): void {
    const remanufaturaInfoHead = JSON.parse(localStorage.getItem('remanufaturaInfoHead'));
    if (remanufaturaInfoHead) {
      this.loadHeadForm();
      if(remanufaturaInfoHead['status']) {
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

      this.headForm.controls.fornecedor.setValue(remanufaturaInfoHead.fornecedor);
      this.selectedFornecedor = remanufaturaInfoHead['fornecedor'];
      this.totalTimeBreak = remanufaturaInfoHead['totalTimeBreak'];
      this.observation = remanufaturaInfoHead['observacao'];
      this.changeProductionStatus();

    } else {
      this.loadHeadForm();
      this.changeProductionStatus();
      this.crudService.getItems('parametros').subscribe(response =>
        response.remanufatura !== undefined ? this.lastRemanufatura = Number(response[0].remanufatura) : this.lastRemanufatura = 0
      );
    }
    this.getItems();

    const remanufaturaInfoItemsInicial = JSON.parse(localStorage.getItem('remanufaturaInfoItemsInicial'));
    if (remanufaturaInfoItemsInicial) {
      this.lotItemsInicial = remanufaturaInfoItemsInicial;
    }
    const remanufaturaInfoItemsFinal = JSON.parse(localStorage.getItem('remanufaturaInfoItemsFinal'));
    if (remanufaturaInfoItemsFinal) {
      this.lotItemsFinal = remanufaturaInfoItemsFinal;
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

  // Funciona como um navegador por ancora para o Angular
  goTo(location: string): void {
    if (location === 'success'){
      window.location.hash = '';
      window.location.hash = location;

      setTimeout(() => {
        window.location.hash = '';
      }, 3000);

    } else if (location === 'remanufatura'){
      window.location.hash = '';
    }
  }
  //WTF ver com bruno
  preChangeFornecedor(event: any): any {
    const remanufaturaInfoItemsInicial = JSON.parse(localStorage.getItem('remanufaturaInfoItemsInicial'));
    if (remanufaturaInfoItemsInicial.length >= 1){
      const alterCheck: boolean = this.showModal('Fornecedor');
      if (alterCheck){
        this.changeFornecedor(event);
      }
    }
  }
  // Ao alterar o fornecedor da remanufatura, ele varre a lista e elimina os produtos não pertencentes a este fornecedor
  changeFornecedor(val: any): any {
    const remanufaturaInfoItemsInicial = JSON.parse(localStorage.getItem('remanufaturaInfoItemsInicial'));
    const remanufaturaInfoItemsFinal = JSON.parse(localStorage.getItem('remanufaturaInfoItemsFinal'));
    const remanufaturaInfoHead = JSON.parse(localStorage.getItem('remanufaturaInfoHead'));
    let count = 0;
    if (remanufaturaInfoItemsInicial && !remanufaturaInfoHead) {
      this.lotItemsInicial = [];
      this.crudService.getItems('precificacao').subscribe(response => {
        remanufaturaInfoItemsInicial.forEach((itemRemanufatura, index) => {
          response.forEach(elementPrecificacao => {
            if ((val.id === elementPrecificacao.fornecedor.id) &&
                (itemRemanufatura.product.prod_id === elementPrecificacao.produto.id) &&
                (itemRemanufatura.product.qual_id === elementPrecificacao.qualidade.id)){
                  itemRemanufatura.product.precificacao_id = elementPrecificacao.id;
                  this.lotItemsInicial.push(itemRemanufatura);
                  return count++;
            }
          });
          if (count === 0){
            remanufaturaInfoItemsInicial.splice(index, 1);
          }
          count = 0;
        });
        this.lotItemsInicial = remanufaturaInfoItemsInicial;
        localStorage.setItem('remanufaturaInfoItemsInicial', JSON.stringify(remanufaturaInfoItemsInicial));
      });
    }
    if (remanufaturaInfoItemsFinal && !remanufaturaInfoHead) {
      this.lotItemsFinal = [];
      this.crudService.getItems('precificacao').subscribe(response => {
        remanufaturaInfoItemsFinal.forEach((itemRemanufatura, index) => {
          response.forEach(elementPrecificacao => {
            if ((val.id === elementPrecificacao.fornecedor.id) &&
                (itemRemanufatura.product.prod_id === elementPrecificacao.produto.id) &&
                (itemRemanufatura.product.qual_id === elementPrecificacao.qualidade.id)){
                  itemRemanufatura.product.precificacao_id = elementPrecificacao.id;
                  this.lotItemsFinal.push(itemRemanufatura);
                  return count++;
            }
          });
          if (count === 0){
            remanufaturaInfoItemsFinal.splice(index, 1);
          }
          count = 0;
        });
        this.lotItemsFinal = remanufaturaInfoItemsFinal;
        localStorage.setItem('remanufaturaInfoItemsFinal', JSON.stringify(remanufaturaInfoItemsFinal));
      });
    }
  }

  // Calculo de tempo do TOTAL da remanufatura
  getElapsedTime(): void {
    try {
      const prodInfo = JSON.parse(localStorage.remanufaturaInfoHead);
      if (prodInfo) {
        const start = new Date(prodInfo.start);
        let totalSeconds = this.sharedVariableService.difTime(start, new Date());
        this.totalTimeProduction = (this.sharedVariableService.secondsToArryTime(totalSeconds));
      }
    } catch {}
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

  // Chama as API para obter as informações necessária para a remanufatura
  getItems(): void {
    this.crudService.getItems('socios').subscribe(response => this.socios = response);
    this.crudService.getItems('fornecedores').subscribe(response => this.fornecedores = response);
    this.crudService.getItems('motivosDeParada').subscribe(response => this.motivosDeParada = response);

    if (this.selectedFornecedor) {
      this.productionService.getProdByFornecedor(String(this.selectedFornecedor['id'])).subscribe(response => this.produtos = response );
    }
  }

  // Inicia a Produção
  startProduction(): void {
    if (this.headForm.get('socio').value && this.headForm.get('fornecedor').value) {
      if (this.statusProd === '') {

        // Reserva o proximo numero da remanufatura na tabela de parametros
        const nextRemanufatura = this.lastRemanufatura + 1;
        const parametros = new FormData();
        parametros.append('remanufatura', nextRemanufatura.toString());
        this.crudService.updateItem('parametros', parametros, '1').subscribe(response => {}, err => {});

        // Defini os valores para o head
        this.headForm.controls.lote.setValue(this.lastRemanufatura + 1);
        this.headForm.controls.data.setValue(this.sharedVariableService.currentDate(new Date()));
        this.headForm.controls.inicio.setValue(this.sharedVariableService.currentTime(new Date()));
        this.headForm.controls.situacao.setValue('Iniciada');

        const remanufaturaInfoHead = {
          currentLote: this.lastRemanufatura + 1,
          fornecedor: this.headForm.get('fornecedor').value,
          start: new Date(),
          end: null,
          totalTimeBreak: null,
          status: 'Iniciada',
          socio: this.headForm.get('socio').value,
          observacao: this.observation
        };

        let remanufaturaInfoItemsInicial = JSON.parse(localStorage.getItem('remanufaturaInfoItemsInicial'));
        if (remanufaturaInfoItemsInicial){
          remanufaturaInfoItemsInicial.forEach(element => {
            element.start = new Date();
          });
        }

        let remanufaturaInfoItemsFinal = JSON.parse(localStorage.getItem('remanufaturaInfoItemsFinal'));
        if (remanufaturaInfoItemsFinal){
          remanufaturaInfoItemsFinal.forEach(element => {
            element.start = new Date();
          });
        }

        localStorage.setItem('remanufaturaInfoHead', JSON.stringify(remanufaturaInfoHead));
        localStorage.setItem('remanufaturaInfoItemsInicial', JSON.stringify(remanufaturaInfoItemsInicial));
        localStorage.setItem('remanufaturaInfoItemsFinal', JSON.stringify(remanufaturaInfoItemsFinal));
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
      this.pausetBtn.nativeElement.innerHTML = '<i class="fa fa-pause-circle"></i> Pausar Produção';
    } else if (this.statusProd === 'Pausada') {
      this.itemsLoteTable.nativeElement.disabled = true;
      this.headForm.controls.situacao.setValue('Pausada');
      this.startBtn.nativeElement.disabled = true;
      this.pausetBtn.nativeElement.disabled = false;
      this.stopBtn.nativeElement.disabled = true;
      this.printBtn.nativeElement.disabled = true;
      this.headForm.get('socio').disable();
      this.headForm.get('fornecedor').disable();
      this.pausetBtn.nativeElement.innerHTML = '<i class="fa fa-play-circle"></i> Continuar Produção';
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
          auxSequence.push(item.sequence);
        });
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
      this.statusProd = 'Pausada';

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
    );
    localStorage.setItem('remanufaturaBreaks', JSON.stringify(this.lotBreaks));

    this.statusProd = 'Iniciada';

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

  // Finaliza produção WTF
  stopProduction(): void {
    let remanufaturaInfoHead = JSON.parse(localStorage.getItem('remanufaturaInfoHead')); // Recupera as informações da remanufatura
    let remanufaturaInfoItemsInicial = JSON.parse(localStorage.getItem('remanufaturaInfoItemsInicial')); // Recupera os itens da remanufatura
    let remanufaturaInfoItemsFinal = JSON.parse(localStorage.getItem('remanufaturaInfoItemsFinal')); // Recupera os itens da remanufatura
    let remanufaturaBreaks = JSON.parse(localStorage.getItem('remanufaturaBreaks')); // Recupera as paradas da remanufatura

    remanufaturaInfoHead.totalTimeProduction = this.sharedVariableService.difTime(remanufaturaInfoHead.start, new Date());
    remanufaturaInfoHead.end = new Date().toISOString();

    if (remanufaturaInfoItemsInicial && remanufaturaInfoItemsFinal) { // Verifica se existe itens na produção
      if ((remanufaturaInfoItemsInicial.filter(item => item.edit === true).length === 0) && (remanufaturaInfoItemsFinal.filter(item => item.edit === true).length === 0)) { // Verifica se algum item ainda não foi fechado

        let arrayUniqueByKeyInicial = [...new Map(remanufaturaInfoItemsInicial.map(item => [item.product.precificacao_id, item.product])).values()];
        arrayUniqueByKeyInicial.forEach(item => {
          item['quantidade'] = 0;
          remanufaturaInfoItemsInicial.forEach(element => {
            if (element.product.precificacao_id === item['precificacao_id']) {
              item['quantidade'] += Number(element.qtn);
              item['fornecedor_id'] = remanufaturaInfoHead.fornecedor.id;
            }
          });
        });

        let arrayUniqueByKeyFinal = [...new Map(remanufaturaInfoItemsFinal.map(item => [item.product.precificacao_id, item.product])).values()];
        arrayUniqueByKeyFinal.forEach(item => {
          item['quantidade'] = 0;
          remanufaturaInfoItemsFinal.forEach(element => {
            if (element.product.precificacao_id === item['precificacao_id']) {
              item['quantidade'] += Number(element.qtn);
              item['fornecedor_id'] = remanufaturaInfoHead.fornecedor.id;
            }
          });
        });

        // Faz a submissão da remanufatura no fomato da procedure
        const remanufatura = this.productionService.stopRemanufatura(remanufaturaInfoHead, remanufaturaInfoItemsInicial, remanufaturaInfoItemsFinal, remanufaturaBreaks, arrayUniqueByKeyInicial, arrayUniqueByKeyFinal);
        console.log(remanufatura)
        this.productionService.createProduction('saveRemanufatura', remanufatura).subscribe(response => {
          this.goTo('success'); 
          this.clearProduction(); 
        }, err => {
          this.toastService.addToast('Algo inesperado aconteceu, verifique sua conexão com a rede e tente novamente!', 'darkred');
        });

      } else { // Caso ainda exista tambores com o valor em aberto, o usuario é notificado para que feche-os antes de dar andamento
        this.toastService.addToast('Feche todos os Tambores/Bags para Finalizar', 'darkred');
      }
    } else { // Notifica o usuario caso tente finalizar uma remanufatura sem itens
      this.toastService.addToast('Esta produção ainda não possui itens', 'darkred');
    }
  }

  clearProduction(): void {
    this.lotItemsInicial = [];
    let remanufaturaInfoItemsInicial = JSON.parse(localStorage.getItem('remanufaturaInfoItemsInicial'));
    remanufaturaInfoItemsInicial.forEach(remanufaturaElement => {
        remanufaturaElement.end = null;
        remanufaturaElement.start = null;
        remanufaturaElement.edit = true;
        remanufaturaElement.qtn = 0;

        this.lotItemsInicial.push(remanufaturaElement);
    });

    this.lotItemsFinal = [];
    let remanufaturaInfoItemsFinal = JSON.parse(localStorage.getItem('remanufaturaInfoItemsFinal'));
    remanufaturaInfoItemsFinal.forEach(remanufaturaElement => {
        remanufaturaElement.end = null;
        remanufaturaElement.start = null;
        remanufaturaElement.edit = true;
        remanufaturaElement.qtn = 0;

        this.lotItemsFinal.push(remanufaturaElement);
    });
    
    localStorage.setItem('remanufaturaInfoItemsInicial', JSON.stringify(this.lotItemsInicial));
    localStorage.setItem('remanufaturaInfoItemsFinal', JSON.stringify(this.lotItemsFinal));

    localStorage.removeItem('remanufaturaInfoHead');
    localStorage.removeItem('remanufaturaBreaks');

    // Habilita novamente os botões
    this.statusProd = '';
    this.changeProductionStatus();
    this.headForm.get('socio').enable();
    this.headForm.get('fornecedor').enable();

    this.selectedFornecedor = false;
    this.statusProd = '';
    this.lotBreaks = [];
    this.totalTimeProduction = '';

    this.ngOnInit();
  }

  // Adiciona item no lote (Item escolhido no LoteItemModal) 
  addLoteItem(): void {
    let remanufaturaInfoHead = JSON.parse(localStorage.getItem('remanufaturaInfoHead'));
    if (!remanufaturaInfoHead){
      const produto = this.loteItemForm.get('product').value;
      this.selectedFornecedor = produto.fornecedor;
      this.headForm.controls.fornecedor.setValue(this.selectedFornecedor);
      this.headForm.controls.fornecedor.setText(this.selectedFornecedor.razao_social_nome);

      remanufaturaInfoHead = {
        fornecedor: this.headForm.get('fornecedor').value,
      };
      localStorage.setItem('remanufaturaInfoHead', JSON.stringify(remanufaturaInfoHead));
    }

    if (this.loteItemForm.get('product').value && this.loteItemForm.get('socio').value) {
      let auxBag = [];
      if (this.loteItemScreenTo === 'inicial') {
        this.lotItemsInicial.forEach(item => {
          auxBag.push(item.numBag);
        });
  
        this.lotItemsInicial.push({
          numBag: this.lotItemsInicial.length > 0 ? Math.max(...auxBag) + 1 : 1,
          product: this.loteItemForm.get('product').value,
          qtn: 0,
          socio: this.loteItemForm.get('socio').value,
          start: this.statusProd === '' ? null : new Date(),
          end: null,
          edit: true
        });
        localStorage.setItem('remanufaturaInfoItemsInicial', JSON.stringify(this.lotItemsInicial));
      } else {
        this.lotItemsFinal.forEach(item => {
          auxBag.push(item.numBag);
        });
  
        this.lotItemsFinal.push({
          numBag: this.lotItemsFinal.length > 0 ? Math.max(...auxBag) + 1 : 1,
          product: this.loteItemForm.get('product').value,
          qtn: 0,
          socio: this.loteItemForm.get('socio').value,
          start: this.statusProd === '' ? null : new Date(),
          end: null,
          edit: true
        });
        localStorage.setItem('remanufaturaInfoItemsFinal', JSON.stringify(this.lotItemsFinal));
      }

      this.loadLoteItemForm();
      this.modalRef.hide();
      this.updateProductionSummary();
    } else {
      this.toastService.addToast('Selecione sócio e/ou produto para continuar', 'darkred');
    }
  }

  // Salva Item do lote
  saveLoteItem(changeItem, idx): void {
    if (changeItem === 'inicial') {
      this.lotItemsInicial[idx].edit = false;
      this.lotItemsInicial[idx].end = new Date();
      localStorage.setItem('remanufaturaInfoItemsInicial', JSON.stringify(this.lotItemsInicial));
    } else {
      this.lotItemsFinal[idx].edit = false;
      this.lotItemsFinal[idx].end = new Date();
      localStorage.setItem('remanufaturaInfoItemsFinal', JSON.stringify(this.lotItemsFinal));
    }
  }

  removeLoteItem(changeItem, numBag): void {
    if (changeItem === 'inicial') {
      this.lotItemsInicial = this.lotItemsInicial.filter(obj => obj.numBag !== numBag);
      localStorage.setItem('remanufaturaInfoItemsInicial', JSON.stringify(this.lotItemsInicial));
      this.updateProductionSummary();
  
      let remanufaturaInfoHead = JSON.parse(localStorage.getItem('remanufaturaInfoHead'));
      if (!remanufaturaInfoHead['status'] && remanufaturaInfoHead['fornecedor']){
        if(this.lotItemsInicial.length == 0){
          this.selectedFornecedor = '';
          localStorage.removeItem('remanufaturaInfoHead')
        }
      }
    } else {
      this.lotItemsFinal = this.lotItemsFinal.filter(obj => obj.numBag !== numBag);
      localStorage.setItem('remanufaturaInfoItemsFinal', JSON.stringify(this.lotItemsFinal));
      this.updateProductionSummary();

      let remanufaturaInfoHead = JSON.parse(localStorage.getItem('remanufaturaInfoHead'));
      if (!remanufaturaInfoHead['status'] && remanufaturaInfoHead['fornecedor']){
        if(this.lotItemsFinal.length == 0){
          this.selectedFornecedor = '';
          localStorage.removeItem('remanufaturaInfoHead')
        }
      }
    }
  }

  // Atualiza a quantidade do item do lote
  updateQtn(changeItem, idx, value): void {
    if (changeItem === 'inicial') {
      this.lotItemsInicial[idx].qtn = value;
      localStorage.setItem('remanufaturaInfoItemsInicial', JSON.stringify(this.lotItemsInicial));
    } else {
      this.lotItemsFinal[idx].qtn = value;
      localStorage.setItem('remanufaturaInfoItemsFinal', JSON.stringify(this.lotItemsFinal));
    }
    this.updateProductionSummary();
  }

  updateObs(): void {
    let remanufaturaInfoHead = JSON.parse(localStorage.getItem('remanufaturaInfoHead'));
    remanufaturaInfoHead.observacao = this.observation;
    localStorage.setItem('remanufaturaInfoHead', JSON.stringify(remanufaturaInfoHead));
  }

  // Atualiza o resumo da produção WTF (como deve ser o resumo dessa producao?)
  updateProductionSummary(): void {
    this.totQtn = 0;
    this.totBag = this.lotItemsInicial.map(item => item.numBag).length;
    this.lotItemsInicial.map(item => {
      this.totQtn += Number(item.qtn);
    });
  }

  // Mostra modal para adicionar novo item no lote
  showLoteItemModal(loteItemScreenTo): void {
    loteItemScreenTo === 'inicial' ? this.loteItemScreenTo = 'inicial' : this.loteItemScreenTo = 'final';
    this.loadLoteItemForm();
    this.modalRef = this.modalService.show(this.loteItemScreen);
  }

  // Mostra uma modal diferente dependendo de qual das 4 ações selecionar
  showModal(title: any): any {
    this.yesNoMessage = {
      title,
      mainText: (title === 'Iniciar') ? ('Tem certeza que deseja ' + title.toUpperCase() + ' a produção? ESTA AÇÃO É IRREVERSÍVEL')
                                      : (title === 'Fornecedor') ? ('Tem certeza que deseja alterar o ' + title.toLowerCase() + ' desta prdução?')
                                                                 : ('Tem certeza que deseja ' + title.toLowerCase() + ' a prdução?'),
      items: (title === 'Fornecedor') ? ['Após a confirmação, a lista de produtos será atualizada mantendo apenas aqueles pertencentes ao '
                                          + title.toLowerCase() + ' selecionado.']
                                      : ['Após a confirmação a produção vai ser ' + title.toLowerCase()],
      fontAwesomeClass: 'fa-ban',
      action: {
        onClickYes: () => {
          if (title === 'Iniciar') {
            this.startProduction();
          } else if (title === 'Pausar') {
            this.statusProd === 'Pausada' ? this.continueProduction() : this.modalRef = this.modalService.show(this.pauseScreen);
          } else if (title === 'Finalizar') {
            this.stopProduction();
          } else if (title === 'Etiquetas'){
            this.toastService.addToast('Desculpa, ainda não temos essa funcionalidade', 'darkred');
          } else {
            return true;
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

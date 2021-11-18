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
  @ViewChild('loteProduzidoScreen', { static: true }) loteProduzidoScreen: ElementRef;
  @ViewChild('socioProduzidoScreen', { static: true }) socioProduzidoScreen: ElementRef;
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
  public fornecedores: any;
  public socios: any;
  public qualidades: any;
  public prensas: any;

  //forms
  public headForm: any;
  public loteItemForm: any;
  public loteProduzido: any;
  public socioProduzido: any;

  public lotItems = [];
  public lotBreaks = [];
  public lotHead = [];
  public statusProd = '';
  public observation = '';
  public selectedMotivo: any;
  public selectedFornecedor: any;
  public totQtn: any;
  public lastPrensa: number;

  public totalTimeProduction: any;
  public totalTimeBreak: any
  public currentTime: any
  public totalWeightProduction: number = 0;
  public unprocessed: number = 0;
  public verificaProdutoProduzido: boolean = false;
  public verificaSocioProduzido: boolean = false;
  public produtoProduzidoPrensa: any;
  public socioProduzidoPrensa: any = null;

  constructor(
    private toastService: ToastService,
    private crudService: CrudService,
    private productionService: ProductionService,
    private sharedVariableService: SharedVariableService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.goTo('triagem'); // Caso recarregue a pagina, mensagem de sucesso é removida

    interval(1000).subscribe(() => {
      if (!this.changeDetector['destroyed']) {
        this.changeDetector.detectChanges();
      }
    });

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

   // Funciona como um navegador por ancora para o Angular
   goTo(location: string): void {
    if (location === 'success'){
      window.location.hash = '';
      window.location.hash = location;

      setTimeout(() => {
        window.location.hash = '';
      }, 3000);

    } else if (location === 'triagem'){
      window.location.hash = '';
    }
  }

  ngOnInit(): void {
    const prensaInfoHead = JSON.parse(localStorage.getItem('prensaInfoHead'));

    this.getItems();
    if (prensaInfoHead) {
      this.lotHead = prensaInfoHead;
      this.loadHeadForm();

      if (prensaInfoHead['produtoProduzido'] !== ''){
        this.verificaProdutoProduzido = true;
        this.produtoProduzidoPrensa = prensaInfoHead['produtoProduzido'];
      }

      if ((prensaInfoHead['socioProduzido']) && (prensaInfoHead['socioProduzido'] !== '')){
        this.verificaSocioProduzido = true;
        this.socioProduzidoPrensa = prensaInfoHead.socioProduzido;
      }

      if (prensaInfoHead['status']){
        this.headForm.controls.lote.setValue(prensaInfoHead['currentLote']);
        this.headForm.controls.data.setValue(this.sharedVariableService.currentDate(prensaInfoHead['start']));
        this.headForm.controls.inicio.setValue(this.sharedVariableService.currentTime(prensaInfoHead['start']));
        this.headForm.controls.situacao.setValue(prensaInfoHead['status']);
        this.headForm.controls.socio.setValue(prensaInfoHead.socio.nome);
        this.headForm.controls.prensa.setValue(prensaInfoHead.numeroPrensa.numero + ' - ' + prensaInfoHead.numeroPrensa.descricao);
        this.statusProd = prensaInfoHead['status'];
        this.totalTimeBreak = prensaInfoHead['totalTimeBreak'];
        this.totalWeightProduction = prensaInfoHead['pesoProduzido'];
        this.unprocessed = prensaInfoHead['naoProcessado'];

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

      this.crudService.getItems('lote').subscribe(response =>
        // Checa na tabela de lote e recupera o valor para prensa no banco, caso não exista seta como ZERO
        response.at(-1).num_lote !== undefined ? this.lastPrensa = Number(response.at(-1).num_lote) : this.lastPrensa = 0
        // console.log(response)
      );
    }

    const prensaInfoItems = JSON.parse(localStorage.getItem('prensaInfoItems'));
    if(prensaInfoItems) {
      this.lotItems = prensaInfoItems;
    }

    const prensaBreaks = JSON.parse(localStorage.getItem('prensaBreaks'));
    if(prensaBreaks) {
      this.lotBreaks = prensaBreaks;
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

  showLoteProduzidoModal(): void {
    this.loadLoteProduzido();
    this.modalRef = this.modalService.show(this.loteProduzidoScreen);
  }

  showSocioProduzidModal(): void {
    this.loadSocioProduzido();
    this.modalRef = this.modalService.show(this.socioProduzidoScreen);
  }

  // Atualiza o resumo da produção
  updateProductionSummary(): void {
      this.totQtn = 0;
      this.lotItems.map(item => {
      this.totQtn += Number(item.qtn);
    });
  }

   // Atualiza a quantidade do item do lote
   updateQtn(idx, value): void {
    this.lotItems[idx].qtn = value;
    localStorage.setItem('prensaInfoItems', JSON.stringify(this.lotItems));
    this.totalWeight('soma');
    this.updateProductionSummary();
  }

  updateQtnUnprocessed(value): void {
    if (value == '' || value == null){
      value = 0;
    }

    this.unprocessed = value;
    this.totalWeight('subtrai');

    let prensaInfoHead = JSON.parse(localStorage.getItem('prensaInfoHead'));
    prensaInfoHead.naoProcessado = Number(this.unprocessed);
    localStorage.setItem('prensaInfoHead', JSON.stringify(prensaInfoHead));
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
    this.crudService.getItems('precificacao').subscribe(response => this.produtos = response);
    this.crudService.getItems('fornecedores').subscribe(response => this.fornecedores = response);
    this.crudService.getItems('qualidades').subscribe(response => this.qualidades = response);
    this.crudService.getItems('prensas').subscribe(response => this.prensas = response);
  }

  // Salva Item do lote
  saveLoteItem(idx): void {
    this.lotItems[idx].edit = false;
    this.lotItems[idx].end = new Date();
    localStorage.setItem('prensaInfoItems', JSON.stringify(this.lotItems));
  }

  loadHeadForm(): void {
    this.headForm = this.formBuilder.group({
      lote: [null],
      data: [null],
      inicio: [null],
      prensa: [null],
      socio: [null],
      situacao: [null],
      socioProduzido: [null]
    });
  }

  loadLoteItemForm(): void {
    this.loteItemForm = this.formBuilder.group({
      numBag: [null],
      product: [null],
      fornecedor: [null],
      qualidade: [null],
      qtn: [null],
    });
   }

   loadLoteProduzido(): void{
    this.loteProduzido = this.formBuilder.group({
      numBag: [null],
      product: [null],
      fornecedor: [null],
      qualidade: [null],
      qtn: [null],
    });
   }

   loadSocioProduzido(): void{
    this.socioProduzido = this.formBuilder.group({
      socio: [null],
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
      this.headForm.get('prensa').disable();
      this.pausetBtn.nativeElement.innerHTML = '<i class="fa fa-pause-circle"></i> Pausar Produção'

    } else if (this.statusProd === 'Pausada') {
      // this.itemsLoteTable.nativeElement.disabled = true;
      this.headForm.controls.situacao.setValue('Pausada');
      this.startBtn.nativeElement.disabled = true;
      this.pausetBtn.nativeElement.disabled = false; 
      this.stopBtn.nativeElement.disabled = true;
      this.printBtn.nativeElement.disabled = true;
      this.headForm.get('socio').disable();
      this.headForm.get('prensa').disable();
      this.pausetBtn.nativeElement.innerHTML = '<i class="fa fa-play-circle"></i> Continuar Produção'
    }
  }

  // Inicia a Produção
  startProduction(): void {
    if (this.headForm.get('socio').value && this.headForm.get('prensa').value) {
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

        console.log(this.headForm.get('prensa').value)

        const prensaInfoHead = {
          currentLote: this.lastPrensa + 1,
          start: new Date(),
          end: null,
          totalTimeBreak: null,
          status: 'Iniciada',
          socio: this.headForm.get('socio').value,
          numeroPrensa: this.headForm.get('prensa').value,
          observacao: this.observation,
          pesoProduzido: 0,
          produtoProduzido: '',
          editProdutoProduzido: true,
          naoProcessado: 0
        };

        localStorage.setItem('prensaInfoHead', JSON.stringify(prensaInfoHead));
        this.statusProd = 'Iniciada';
        this.changeProductionStatus();

        this.ngOnInit();
      } else {
        this.toastService.addToast('Adicione pelo menos um item na produção para inicia-la', 'darkred');
      }
    } else {
      this.toastService.addToast('Selecione um SÓCIO ou PRENSA para iniciar', 'darkred');
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

      localStorage.setItem('prensaBreaks', JSON.stringify(this.lotBreaks));
      this.modalRef.hide();
      this.selectedMotivo = null;
      this.statusProd = 'Pausada';

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
    );
    localStorage.setItem('prensaBreaks', JSON.stringify(this.lotBreaks));

    this.statusProd = 'Iniciada';

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
    let prensaInfoHead = JSON.parse(localStorage.getItem('prensaInfoHead')); // Recupera as informações da triagem
    let prensaInfoItems = JSON.parse(localStorage.getItem('prensaInfoItems')); // Recupera os itens da triagem
    let prensaBreaks = JSON.parse(localStorage.getItem('prensaBreaks')); // Recupera as paradas da triagem

    prensaInfoHead.totalTimeProduction = this.sharedVariableService.difTime(prensaInfoHead.start, new Date());
    prensaInfoHead.produtoProduzido.quantidade = this.totalWeightProduction;
    prensaInfoHead.end = new Date().toISOString();

    if (prensaInfoItems) { // Verifica se existe itens na produção
      if (prensaInfoItems.filter(item => item.edit === true).length === 0) { // Verifica se algum item ainda não foi fechado

        if (prensaInfoHead.socioProduzido && prensaInfoHead.produtoProduzido) {

          let arrayUniqueByKey = [...new Map(prensaInfoItems.map(item => [item.product.id, item.product])).values()];
          arrayUniqueByKey.forEach(item => {
            item['quantidade'] = 0;
            prensaInfoItems.forEach(element => {
              if ((element.product.produto.id === item['produto'].id) &&
                  (element.product.fornecedor.id === item['fornecedor'].id) &&
                  (element.product.qualidade.id === item['qualidade'].id)) {
                item['quantidade'] += Number(element.qtn);
                item['fornecedor_id'] = element.product.fornecedor.id;
              }
            });
          });

          // Faz a submissão da triagem no fomato da procedure
          const prensa = this.productionService.stopPrensa(prensaInfoHead, prensaInfoItems, prensaBreaks, arrayUniqueByKey);
          this.productionService.createTriagem(prensa).subscribe(response => {
            this.goTo('success');
            this.clearProduction();
          }, err => {
            this.toastService.addToast('Algo inesperado aconteceu, verifique sua conexão com a rede e tente novamente!', 'darkred');
            console.log(err['message']);
          });
        } else {
          this.toastService.addToast('Verifique se o PRODUTO produzido e/ou SÓCIO foram preenchidos para Finalizar', 'darkred');
        }
      } else { // Caso ainda exista tambores com o valor em aberto, o usuario é notificado para que feche-os antes de dar andamento
        this.toastService.addToast('Feche todos os Tambores/Bags para Finalizar', 'darkred');
      }
    } else { // Notifica o usuario caso tente finalizar uma triagem sem itens
      this.toastService.addToast('Esta produção ainda não possui itens', 'darkred');
    }
  }

  clearProduction(): void {
    this.lotItems = [];
    localStorage.removeItem('prensaInfoHead');
    localStorage.removeItem('prensaInfoItems');
    localStorage.removeItem('prensaBreaks');

    this.selectedFornecedor = false;
    this.statusProd = '';
    this.lotBreaks = [];
    this.totalTimeProduction = '';
    this.verificaSocioProduzido = false;
    this.socioProduzidoPrensa = '';

    this.totalWeightProduction  = 0;
    this.unprocessed = 0;
    this.verificaProdutoProduzido = false;
    this.produtoProduzidoPrensa = '';

    this.ngOnInit();
  }

  // Adiciona item no lote (Item escolhido no LoteItemModal)
  addLoteItem(): void {
    let prensaInfoHead = JSON.parse(localStorage.getItem('prensaInfoHead'));
    if (!prensaInfoHead){
      const produto = this.loteItemForm.get('product').value;
      localStorage.setItem('prensaInfoHead', JSON.stringify(prensaInfoHead));
    }

    if (this.loteItemForm.get('product').value) {
      let auxBag = [];
      this.lotItems.forEach(item => {
        auxBag.push(item.numBag);
      });

      this.lotItems.push({
        numBag: this.headForm.get('prensa').value,
        product: this.loteItemForm.get('product').value,
        qtn: 0,
        edit: true
      });

      localStorage.setItem('prensaInfoItems', JSON.stringify(this.lotItems));
      this.loadLoteItemForm();
      this.modalRef.hide();
      this.updateProductionSummary();
    } else {
      this.toastService.addToast('Selecione o produto para continuar', 'darkred');
    }
  }

  addProdutoProduzido(): void{
    let prensaInfoHead = JSON.parse(localStorage.getItem('prensaInfoHead'));
    let prensaInfoItems = JSON.parse(localStorage.getItem('prensaInfoItems'));

    if (this.loteProduzido.get('product').value) {
      const compara = prensaInfoItems.filter(resp => resp.product.id === this.loteProduzido.get('product').value.id)[0];
      if (compara === undefined){
        prensaInfoHead['produtoProduzido'] = this.loteProduzido.get('product').value;
        this.produtoProduzidoPrensa = this.loteProduzido.get('product').value;

        this.verificaProdutoProduzido = true;
        this.produtoProduzidoPrensa = prensaInfoHead['produtoProduzido'];

        this.loadLoteProduzido();
        this.modalRef.hide();
      } else {
        this.toastService.addToast('Este produto já esta na lista de materias primas', 'darkred');
      }
    } else {
      this.toastService.addToast('Selecione o produto para continuar', 'darkred');
    }

    localStorage.setItem('prensaInfoHead', JSON.stringify(prensaInfoHead));
  }
  
  addSocioProduzido(): void{
    let prensaInfoHead = JSON.parse(localStorage.getItem('prensaInfoHead'));

    if (this.socioProduzido.get('socio').value) {
      prensaInfoHead['socioProduzido'] = this.socioProduzido.get('socio').value;

      this.verificaSocioProduzido = true;
      this.socioProduzidoPrensa = prensaInfoHead.socioProduzido;

      this.loadSocioProduzido();
      this.modalRef.hide();
    } else {
      this.toastService.addToast('Selecione o sócio para continuar', 'darkred');
    }

    localStorage.setItem('prensaInfoHead', JSON.stringify(prensaInfoHead));
  }

  removeLoteItem(numBag): void { 
    this.lotItems = this.lotItems.filter(obj => obj.numBag !== numBag)
    localStorage.setItem('prensaInfoItems', JSON.stringify(this.lotItems));
    this.totalWeight("soma");
    this.totalWeight("subtrai");
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

  totalWeight(operacao: string){
    if (localStorage['prensaInfoItems'] != null){
      let prensaInfoItems = JSON.parse(localStorage.getItem('prensaInfoItems'));
      let prensaInfoHead = JSON.parse(localStorage.getItem('prensaInfoHead'));

      this.totalWeightProduction = 0;
      prensaInfoItems.forEach(item => {
        if (item.qtn == "" || item.qtn == null){
          item.qtn = 0;
        }
        this.totalWeightProduction += parseFloat(item.qtn);
      });

      if (operacao == 'subtrai'){
        this.totalWeightProduction -= this.unprocessed;
      }

      prensaInfoHead.pesoProduzido = this.totalWeightProduction;
      localStorage.setItem('prensaInfoHead', JSON.stringify(prensaInfoHead));
    }
  }

}

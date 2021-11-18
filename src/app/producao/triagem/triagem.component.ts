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
import { resourceUsage } from 'process';

@Component({
  selector: 'app-triagem',
  templateUrl: './triagem.component.html',
  styleUrls: ['./triagem.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TriagemComponent implements OnInit {
  @ViewChild('pauseScreen', { static: true }) pauseScreen: ElementRef;
  @ViewChild('loteItemScreen', { static: true }) loteItemScreen: ElementRef;
  @ViewChild('startBtn', { static: true }) startBtn: ElementRef;
  @ViewChild('pausetBtn', { static: true }) pausetBtn: ElementRef;
  @ViewChild('stopBtn', { static: true }) stopBtn: ElementRef;
  @ViewChild('printBtn', { static: true }) printBtn: ElementRef;
  @ViewChild('itemsLoteTable', { static: true }) itemsLoteTable: ElementRef;

  // screen ===============================================
    public modalRef: any;
    public yesNoMessage: YesNoMessage = new YesNoMessage(); // Modal confimração
    public showYesNoMessage: boolean;
    public viewImage: ViewImage = new ViewImage(); // Modal de imagem
    public showModalImage: boolean;
  // =======================================================

  // selects através do getItems() =========================
    public fornecedores: any;
    public motivosDeParada: any;
    public materiasPrimas: any;
    public produtos: any;
    public socios: any;
  // =======================================================

  // forms =================================================
    // Head
    public headForm: any; // Formulario do cabeçalho da triagem
    public lastTriagem: number; // Numero da ultima triagem
    public selectedFornecedor: any; // Fornacedor da triagem
    public statusProd = ''; // Status da triagem

    // Items
    public lotItems = []; // Lista de itens da triagem
    public loteItemForm: any; // Formulario dos itens da triagem

    // Braks
    public lotBreaks = []; // Lista de paradas da triagem
    public selectedMotivo: any; // Motivo da pausa

    // Footer
    public currentTime: any; // Reposanvel por contas os segundos corridos
    public observation = ''; // Observações da triagem
    public totBag: any; // Numero total de Bags abertos na triagem
    public totQtn: any; // Pesa(quantidade) total dos itens
    public totalTimeBreak: any; // Tempo total de que as paradas durou
    public totalTimeProduction: any; // Tempo total que a produção durou da triagem
  // =======================================================

  public alterCheck;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private crudService: CrudService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private productionService: ProductionService,
    private toastService: ToastService,
    private sharedVariableService: SharedVariableService,
    ) {
    // Quando a pagina sofre um reload, a mensagem de sucesso ao salvar deve ser removida
    this.goTo('triagem');

    // Atualiza o valor para tempo decorrido a cada 1 segundo
    interval(1000).subscribe(() => {
      if (!this.changeDetector['destroyed']) {
        this.changeDetector.detectChanges();
      }
    });
  }

  private destroyed$ = new Subject();

  ngOnInit(): void {
    const triagemInfoHead = JSON.parse(localStorage.getItem('triagemInfoHead'));
    // Caso exista valor para triagemInfoHead, seta os valores do head com os respectivos valores
    if (triagemInfoHead) {
      this.loadHeadForm();
      if (triagemInfoHead['status']) {
        this.headForm.controls.lote.setValue(triagemInfoHead['currentLote']);
        this.headForm.controls.data.setValue(this.sharedVariableService.currentDate(triagemInfoHead['start']));
        this.headForm.controls.inicio.setValue(this.sharedVariableService.currentTime(triagemInfoHead['start']));
        this.headForm.controls.termino.setValue(this.sharedVariableService.currentTime(triagemInfoHead['end']));
        this.headForm.controls.situacao.setValue(triagemInfoHead['status']);
        this.headForm.controls.socio.setValue(triagemInfoHead.socio.nome);
        this.headForm.controls.materia_prima.setValue(triagemInfoHead.materia.nome);
        this.statusProd = triagemInfoHead['status'];
        this.totalTimeBreak = triagemInfoHead['totalTimeBreak'];

        // starta o contador
        setInterval(() => {
          this.getElapsedTime();
          this.currentTime = new Date();
        }, 1000);
      }

      this.headForm.controls.fornecedor.setValue(triagemInfoHead.fornecedor);
      this.selectedFornecedor = triagemInfoHead['fornecedor'];
      this.totalTimeBreak = triagemInfoHead['totalTimeBreak'];
      this.observation = triagemInfoHead['observacao'];
      this.changeProductionStatus();

    } else {
      this.loadHeadForm();
      this.changeProductionStatus();
      this.crudService.getItems('lote').subscribe(response =>
        // Checa na tabela Parametros e recupera o valor da triagem no banco, caso não exista seta como ZERO
        response.at(-1).num_lote !== undefined ? this.lastTriagem = Number(response.at(-1).num_lote) : this.lastTriagem = 0
        // console.log(response)
      );
    }
    this.getItems();

    const triagemInfoItems = JSON.parse(localStorage.getItem('triagemInfoItems'));
    // Caso exista valor para triagemInfoItems, seta os itens da triagem
    if (triagemInfoItems) {
      this.lotItems = triagemInfoItems;
    }

    const triagemBreaks = JSON.parse(localStorage.getItem('triagemBreaks'));
    // Caso exista valor para triagemBreaks, seta as paradas da triagem
    if (triagemBreaks) {
      this.lotBreaks = triagemBreaks;
    }

    this.updateProductionSummary();
    this.loadLoteItemForm();
    this.changeDetector.detectChanges();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  // Funciona como um navegador por Ancora(tag "<a></a>" no html) para o Angular
  goTo(location: string): void {
    if (location === 'success'){
      // Caso success, seta o hash como vazio e depois redireciona para a ancora passada como parametro
      window.location.hash = '';
      window.location.hash = location;

      setTimeout(() => { // Define a duração de 3 segundos para a mensagem de sucesso
        window.location.hash = '';
      }, 3000);

    } else if (location === 'triagem'){
      // Caso triagem, seta o hash como vazio para que a pagina limpe o qualquer hash
      window.location.hash = '';
    }
  }

  // Alterar Fornecedor da Triagem ===============================================
    /* Varre a lista e elimina os produtos não pertencentes ao novo fornecedor selecionado */
    changeFornecedor(val: any): any {
      const triagemInfoItems = JSON.parse(localStorage.getItem('triagemInfoItems'));
      const triagemInfoHead = JSON.parse(localStorage.getItem('triagemInfoHead'));
      let count = 0;

      if (triagemInfoItems && !triagemInfoHead) {
        this.lotItems = [];
        this.crudService.getItems('precificacao').subscribe(response => {
          triagemInfoItems.forEach((itemTriagem, index) => {
            response.forEach(elementPrecificacao => {
              // Após recuperar do banco as precificações, varre a lista de produtos batendo
              // os valores e garantindo que o novo Fornecedor, Produto e Qualidade são iguais
              if ((val.id === elementPrecificacao.fornecedor.id) &&
                  (itemTriagem.product.prod_id === elementPrecificacao.produto.id) &&
                  (itemTriagem.product.qual_id === elementPrecificacao.qualidade.id)){
                    itemTriagem.product.precificacao_id = elementPrecificacao.id;
                    this.lotItems.push(itemTriagem);
                    // Caso encontre o valor equivalente, interrompe esse looping mais interno pois não
                    // existe necessidade de continuar varrendo a lista
                    return count++;
              }
            });
            if (count === 0){
              // Atualiza o item da triagem, fazendo um update no Fornecedor
              // e apontando para o novo id na precificação
              triagemInfoItems.splice(index, 1);
            }
            count = 0;
          });
          this.lotItems = triagemInfoItems;
          localStorage.setItem('triagemInfoItems', JSON.stringify(triagemInfoItems));
        });
      }
    }

    /* Chama metodo de Modal para confirmar a ação e em caso de positivo
    chama o metodo responsavel por atualizar o Fornecedor */
    // preChangeFornecedor(event: any): any {
    //   const triagemInfoItems = JSON.parse(localStorage.getItem('triagemInfoItems'));
    //   if (triagemInfoItems){
    //     if (triagemInfoItems.length >= 1){
    //       this.showModal('Fornecedor').then(() => this.changeFornecedor(event));
    //     }
    //   }
    // }
  // ============================================================================

  // Objetos Form ===============================================================
    /* Build do form cabeçalho (Informações do lote) */
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

    /* Build do form itens (Itens do lote) */
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
  // ============================================================================

  // Fases da Triagem ===========================================================
    /* Continua a Produção (sai do status de pausa) */
    continueProduction(): void {
      this.lotBreaks = JSON.parse(localStorage.getItem('triagemBreaks'));
      this.lotBreaks[this.lotBreaks.length - 1].endTime = new Date();
      this.lotBreaks[this.lotBreaks.length - 1].total = this.sharedVariableService.difTime(
        this.lotBreaks[this.lotBreaks.length - 1].startTime,
        this.lotBreaks[this.lotBreaks.length - 1].endTime
      );
      localStorage.setItem('triagemBreaks', JSON.stringify(this.lotBreaks));

      this.statusProd = 'Iniciada';

      let totalSec = 0;
      this.lotBreaks.forEach(item => {
        totalSec += item.total;
      });
      this.totalTimeBreak = this.sharedVariableService.secondsToArryTime(totalSec);

      const triagemInfoHead = JSON.parse(localStorage.getItem('triagemInfoHead'));
      triagemInfoHead.status = 'Iniciada';
      triagemInfoHead.totalTimeBreak = this.totalTimeBreak;
      localStorage.setItem('triagemInfoHead', JSON.stringify(triagemInfoHead));

      this.changeProductionStatus();
    }

    /* Pausar a Prudução */
    pauseProduction(): void {
      if (this.selectedMotivo) { // Garante que o usuario selecionou o motivo
        const triagemBreaks = JSON.parse(localStorage.getItem('triagemBreaks'));
        const auxSequence = [];

        if (triagemBreaks) {
          this.lotBreaks = triagemBreaks;
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

        localStorage.setItem('triagemBreaks', JSON.stringify(this.lotBreaks));
        this.modalRef.hide();
        this.selectedMotivo = null;
        this.statusProd = 'Pausada';

        let triagemInfoHead = JSON.parse(localStorage.getItem('triagemInfoHead'));
        triagemInfoHead.status = 'Pausada';
        localStorage.setItem('triagemInfoHead', JSON.stringify(triagemInfoHead));

        this.changeProductionStatus();
      } else {
        this.toastService.addToast('Selecione o motivo para continuar', 'darkred');
      }
    }

    /* Inicia a Produção */
    startProduction(): void {
      // Garante que o usuario selecionou Sócio, Fornecedor e Matéria prima antes de iniciar
      if (this.headForm.get('socio').value && this.headForm.get('fornecedor').value && this.headForm.get('materia_prima').value) {
        if (this.statusProd === '') {

          // Reserva o proximo numero da triagem e faz um update na tabela de parametros
          // Isso é feito para evitar que usuarios em outras maquinas peguem o mesmo numero de triagem
          const nextTriagem = this.lastTriagem + 1;
          const parametros = new FormData();
          parametros.append('triagem', nextTriagem.toString());
          this.crudService.updateItem('parametros', parametros, '1').subscribe(response => {}, err => {});

          // Defini os valores para o head
          this.headForm.controls.lote.setValue(this.lastTriagem + 1);
          this.headForm.controls.data.setValue(this.sharedVariableService.currentDate(new Date()));
          this.headForm.controls.inicio.setValue(this.sharedVariableService.currentTime(new Date()));
          this.headForm.controls.situacao.setValue('Iniciada');

          const triagemInfoHead = { // prepara a triagemInfoHead para setar no localstorage
            currentLote: this.lastTriagem + 1,
            fornecedor: this.headForm.get('fornecedor').value,
            materia: this.headForm.get('materia_prima').value,
            start: new Date(),
            end: null,
            totalTimeBreak: null,
            status: 'Iniciada',
            socio: this.headForm.get('socio').value,
            observacao: this.observation
          };

          const triagemInfoItems = JSON.parse(localStorage.getItem('triagemInfoItems'));
          if (triagemInfoItems){
            triagemInfoItems.forEach(element => {
              element.start = new Date();
            });
          }

          localStorage.setItem('triagemInfoHead', JSON.stringify(triagemInfoHead));
          localStorage.setItem('triagemInfoItems', JSON.stringify(triagemInfoItems));
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

    /* Finaliza produção */
    stopProduction(): void {
      const triagemInfoHead = JSON.parse(localStorage.getItem('triagemInfoHead'));
      const triagemInfoItems = JSON.parse(localStorage.getItem('triagemInfoItems'));
      const triagemBreaks = JSON.parse(localStorage.getItem('triagemBreaks'));

      triagemInfoHead.totalTimeProduction = this.sharedVariableService.difTime(triagemInfoHead.start, new Date());
      triagemInfoHead.end = new Date().toISOString();

      if (triagemInfoItems) {// Verifica se existe itens na produção
        if (triagemInfoItems.filter(item => item.edit === true).length === 0) {// Verifica se algum item ainda não foi fechado

          // Cria uma lista auxiliar agrupando os produtos repetidos
          let arrayUniqueByKey = [...new Map(triagemInfoItems.map(item => [item.product.precificacao_id, item.product])).values()];
          arrayUniqueByKey.forEach(item => {
            item['quantidade'] = 0;
            triagemInfoItems.forEach(element => {
              if (element.product.precificacao_id === item['precificacao_id']) {

                item['quantidade'] += Number(element.qtn);
                item['fornecedor_id'] = triagemInfoHead.fornecedor.id;
              }
            });
          });

          // Faz a submissão da triagem
          const triagem = this.productionService.stopTriagem(triagemInfoHead, triagemInfoItems, triagemBreaks, arrayUniqueByKey);
          this.productionService.createTriagem(triagem).subscribe(response => {
            this.goTo('success'); // Chama a transição de sucesso
            this.clearProduction(); // Limpa a tela de produção para o usuario
          }, err => {
            this.toastService.addToast('Algo inesperado aconteceu, verifique sua conexão com a rede e tente novamente!', 'darkred');
            console.log(err['message']);
          });

        } else { // Caso ainda exista tambores com o valor em aberto, o usuario é notificado para que feche-os antes de dar andamento
          this.toastService.addToast('Feche todos os Tambores/Bags para Finalizar', 'darkred');
        }
      } else { // Notifica o usuario caso tente finalizar uma triagem sem itens
        this.toastService.addToast('Esta produção ainda não possui itens', 'darkred');
      }
    }
  // ============================================================================

  // Manipula itens da Triagem ==================================================
    /* Adiciona item no lote (Item escolhido no LoteItemModal) */
    addLoteItem(): void {
      let triagemInfoHead = JSON.parse(localStorage.getItem('triagemInfoHead'));
      if (!triagemInfoHead){
        const produto = this.loteItemForm.get('product').value;
        this.selectedFornecedor = produto.fornecedor;
        this.headForm.controls.fornecedor.setValue(this.selectedFornecedor);
        this.headForm.controls.fornecedor.setText(this.selectedFornecedor.razao_social_nome);

        triagemInfoHead = {
          fornecedor: this.headForm.get('fornecedor').value,
        };
        localStorage.setItem('triagemInfoHead', JSON.stringify(triagemInfoHead));
      }

      if (this.loteItemForm.get('product').value && this.loteItemForm.get('socio').value) {
        const auxBag = [];
        this.lotItems.forEach(item => {
          auxBag.push(item.numBag);
        });

        this.lotItems.push({
          numBag: this.lotItems.length > 0 ? Math.max(...auxBag) + 1 : 1,
          product: this.loteItemForm.get('product').value,
          qtn: 0,
          socio: this.loteItemForm.get('socio').value,
          start: this.statusProd === '' ? null : new Date(),
          end: null,
          edit: true
        });

        localStorage.setItem('triagemInfoItems', JSON.stringify(this.lotItems));
        this.loadLoteItemForm();
        this.modalRef.hide();
        this.updateProductionSummary();
      } else {
        this.toastService.addToast('Selecione sócio e/ou produto para continuar', 'darkred');
      }
    }

    /* Remove item do lote*/
    removeLoteItem(numBag): void {
      this.lotItems = this.lotItems.filter(obj => obj.numBag !== numBag);
      localStorage.setItem('triagemInfoItems', JSON.stringify(this.lotItems));
      this.updateProductionSummary();

      const triagemInfoHead = JSON.parse(localStorage.getItem('triagemInfoHead'));
      if (!triagemInfoHead['status'] && triagemInfoHead['fornecedor']){
        if(this.lotItems.length == 0){
          this.selectedFornecedor = '';
          localStorage.removeItem('triagemInfoHead')
        }
      }
    }

    /* Salva item do lote */
    saveLoteItem(idx): void {
      this.lotItems[idx].edit = false;
      this.lotItems[idx].end = new Date();
      localStorage.setItem('triagemInfoItems', JSON.stringify(this.lotItems));
    }

    /* Atualiza a quantidade do item do lote */
    updateQtn(idx, value): void {
      this.lotItems[idx].qtn = value;
      localStorage.setItem('triagemInfoItems', JSON.stringify(this.lotItems));
      this.updateProductionSummary();
    }
  // ============================================================================

  // Modais =====================================================================
    /* Expande imagem de cada socio na lista de itens do lote */
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

    /* Mostra modal para adicionar novo item no lote */
    showLoteItemModal(): void {
      this.loadLoteItemForm();
      this.modalRef = this.modalService.show(this.loteItemScreen);
    }

    /* Mostra uma modal diferente dependendo de qual das 4 ações selecionar */
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
            } else if (title === 'Fornecedor') {
              this.alterCheck = true;
              return;
            }
          },
          onClickNo: () => { }
        }
      };
      this.showYesNoMessage = true;
    }
  // ============================================================================


  // Uteis ======================================================================
    /* muda status da produção baseado no parametro */
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
        this.headForm.get('materia_prima').disable();
        this.pausetBtn.nativeElement.innerHTML = '<i class="fa fa-play-circle"></i> Continuar Produção';
      }
    }

    /* Volta a triagem para o status inicial */
    clearProduction(): void {
    this.lotItems = [];
    const triagemInfoItems = JSON.parse(localStorage.getItem('triagemInfoItems'));
    triagemInfoItems.forEach(triagemElement => {
        triagemElement.end = null;
        triagemElement.start = null;
        triagemElement.edit = true;
        triagemElement.qtn = 0;

        this.lotItems.push(triagemElement);
    });
    localStorage.setItem('triagemInfoItems', JSON.stringify(this.lotItems));

    localStorage.removeItem('triagemInfoHead');
    localStorage.removeItem('triagemBreaks');

    // Habilita novamente os botões
    this.statusProd = '';
    this.changeProductionStatus();
    this.headForm.get('socio').enable();
    this.headForm.get('fornecedor').enable();
    this.headForm.get('materia_prima').enable();


    this.selectedFornecedor = false;
    this.statusProd = '';
    this.lotBreaks = [];
    this.totalTimeProduction = '';

    this.ngOnInit();
    }

    /* Calculo de tempo do TOTAL da triagem */
    getElapsedTime(): void {
      try {
        const prodInfo = JSON.parse(localStorage.triagemInfoHead);
        if (prodInfo) {
          const start = new Date(prodInfo.start);
          const totalSeconds = this.sharedVariableService.difTime(start, new Date());
          this.totalTimeProduction = (this.sharedVariableService.secondsToArryTime(totalSeconds));
        }
      } catch {}
    }

    /* Chama as API para obter as informações necessária para a triagem */
    getItems(): void {
      this.crudService.getItems('socios').subscribe(response => this.socios = response);
      this.crudService.getItems('fornecedores').subscribe(response => this.fornecedores = response);
      this.crudService.getItems('motivosDeParada').subscribe(response => this.motivosDeParada = response);
      this.crudService.getItems('materiasPrimas').subscribe(response => this.materiasPrimas = response);

      if (this.selectedFornecedor) {
        this.productionService.getProdByFornecedor(String(this.selectedFornecedor['id'])).subscribe(response => this.produtos = response );
      }
    }

    /* Atualiza o resumo da produção */
    updateProductionSummary(): void {
      this.totQtn = 0;
      this.totBag = this.lotItems.map(item => item.numBag).length;
      this.lotItems.map(item => {
        this.totQtn += Number(item.qtn);
      });
    }

    /* Atualiza as observações */
    updateObs(): void {
      const triagemInfoHead = JSON.parse(localStorage.getItem('triagemInfoHead'));
      triagemInfoHead.observacao = this.observation;
      localStorage.setItem('triagemInfoHead', JSON.stringify(triagemInfoHead));
    }
  // ============================================================================
}

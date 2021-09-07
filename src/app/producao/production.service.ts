import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SharedVariableService } from '../shared/shared-variable.service';
import { CrudService } from '../cadastros/crud.service'
import { ToastService } from 'src/app/shared/toast/toast.service';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductionService {
  precificacoes: any;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private sharedVariableService: SharedVariableService,
    private crudService: CrudService
  ){
    this.getPrecificacao();
  }

  createProduction(component: string, item: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/${component}/`, item);
  }

  // Aciona a URL para navegação
  createTriagem(item: any): Observable<any>{
    return this.http.post(`${environment.apiUrl}/procedure/`, item);
  }

  // Encerra a produção chamando a procedure para fazer os inserts no banco de dados
  stopTriagem(prodInfoHead, prodInfoItems, productionBreaks, arrayUniqueByKey) {
    const triagem = {
      'lote': this.prodInfoHeadToJson(prodInfoHead),
      'lote_parada': this.productionBreaksToJson(productionBreaks, prodInfoHead.currentLote),
      'lote_itens': this.prodInfoItemsToJson(prodInfoItems, prodInfoHead.currentLote),
      'movimentacoes': this.movimentacoesToJson(prodInfoItems, prodInfoHead.currentLote),
    };

    this.createTriagem(triagem).subscribe(response => {
      this.toastService.addToast('Triagem salva com sucesso');
    }, err => {
      this.toastService.addToast('Algo inesperado aconteceu, verifique sua conexão com a rede e tente novamente!', 'darkred');
      console.log(err['message'])
    });
  }

  // Cabeçalho da triagem para insert no banco
  prodInfoHeadToJson(prodInfoHead): any {
    const lote = {
      'num_lote': prodInfoHead.currentLote,
      'iniciado': prodInfoHead.start,
      'finalizado': prodInfoHead.end,
      'tempo_total': prodInfoHead.totalTimeProduction,
      'socio': prodInfoHead.socio.id,
      'fornecedor': prodInfoHead.fornecedor.id,
      'observacao': prodInfoHead.observacao ? prodInfoHead.observacao : 'Sem observações'
    };
    return lote;
  }

  // Paradas da triagem para insert no banco
  productionBreaksToJson(productionBreaks, currentLote): any {
    let lote_parada = [];
    if (productionBreaks){
      productionBreaks.forEach(item => {
        let paradas = {
          'id': '',
          'num_lote': currentLote,
          'motivo': item.motivo,
          'sequencia': item.sequence,
          'iniciado': item.startTime,
          'finalizado': item.endTime,
          'tempo_total': item.total,
        }

        lote_parada.push(paradas);
      });
    }
    return lote_parada.length > 0 ? lote_parada : 'vazio';
  }

  // Itens da triagem para insert no banco
  prodInfoItemsToJson(prodInfoItems, currentLote): any {
    let lote_itens = [];
    prodInfoItems.forEach(item => {
      const totalTimeItem = this.sharedVariableService.difTime(item.start, item.end);
      const paradas = {
        'id': '',
        'num_lote': currentLote,
        'num_recipiente': item.numBag,
        'produto': item.product.precificacao_id,
        'quantidade': item.qtn,
        'socio': item.socio.id,
        'iniciado': item.start,
        'finalizado': item.end,
        'tempo_total': totalTimeItem.toString(),
      }

      lote_itens.push(paradas);
    });
    return lote_itens;
  }

  // Atualiza as movimentações do Item
  movimentacoesToJson(prodInfoItems, currentLote): any{
    let movimentacoes = [];

    prodInfoItems.forEach(item => {
      const precificacao = this.precificacoes.filter(resp => resp['id'] == item.product.precificacao_id)[0];
      let saldoAtual = String(Number(precificacao.quantidade) + Number(item.qtn));
      saldoAtual = saldoAtual.includes('.') ? saldoAtual : saldoAtual + '.00';
      item.qtn = saldoAtual.includes('.') ? saldoAtual : saldoAtual + '.00';

      const monvimento = {
        'id': '',
        'data': new Date().toISOString(),
        'entrada_saida': 'E',
        'tipo': 'Triagem',
        'numero_tipo': currentLote,
        'cod_produto': item.product.precificacao_id,
        'saldo_anterior': Number(precificacao.quantidade),
        'saldo_atual': Number(saldoAtual),
        'dif': Number(item.qtn)
      };

      movimentacoes.push(monvimento);
    });
    return movimentacoes;
  }

  updatePrecificacao(): Promise<string> {
    return new Promise((resolve, reject) => {
      let isDeleteed = true;
      if(isDeleteed) {
        resolve('updatePrecificacao');
      } else {
        reject('Not updatePrecificacao');
      }
    });
  }

  // Metodos auxiliares =====================================================================================

  getPrecificacao(): any{
    this.crudService.getItems('precificacao').subscribe(response => {this.precificacoes = response; });
  }

  getProdByFornecedor(fornecedor: string): Observable<any> {
    const obj = {"fornecedor": fornecedor};
    return this.http.post(`${environment.apiUrl}/fornproddetails/`, obj);
  }

  errorMessage(msg: any): void {
    this.toastService.addToast(msg);
  }

  // caso querira chamar todas as promises ao mesmo tempo
  // Promise.all([saveLote(), saveLoteItems(), saveLoteBreaks()]).then().catch(); --- espera todas retornar
  // Promise.race([saveLote(), saveLoteItems(), saveLoteBreaks()]).then().catch(); --- espera uma delas retornar
}

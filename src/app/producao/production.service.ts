import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SharedVariableService } from '../shared/shared-variable.service';
import { CrudService } from '../cadastros/crud.service';
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

  // =========== Metodos auxiliares para finalizar triagem ==================================================
  // Encerra a produção chamando a procedure para fazer os inserts no banco de dados
  stopTriagem(prodInfoHead, prodInfoItems, productionBreaks, arrayUniqueByKey) {
    const triagem = {
      'lote': this.prodInfoHeadToJson(prodInfoHead),
      'lote_parada': this.productionBreaksToJson(productionBreaks, prodInfoHead.currentLote),
      'lote_itens': this.prodInfoItemsToJson(prodInfoItems, prodInfoHead.currentLote),
      'movimentacoes': this.movimentacoesToJson(arrayUniqueByKey, prodInfoHead.currentLote),
      'precificacao': this.precificacaoToJson(arrayUniqueByKey)
    };
    return triagem;
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
  movimentacoesToJson(arrayUniqueByKey, currentLote): any{
    let movimentacoes = [];
    this.getPrecificacao();

    arrayUniqueByKey.forEach(item => {
      const precificacao = this.precificacoes.filter(resp => resp['id'] === item.precificacao_id)[0];
      const saldoAtual = String(Number(precificacao.quantidade) + Number(item.quantidade));
      const diferenca =  String(Number(saldoAtual) - Number(precificacao.quantidade));

      const monvimento = {
        'id': '',
        'data': new Date().toISOString(),
        'entrada_saida': 'E',
        'tipo': 'Triagem',
        'numero_tipo': currentLote,
        'cod_produto': item.precificacao_id,
        'saldo_anterior': Number(precificacao.quantidade),
        'saldo_atual': Number(saldoAtual),
        'dif': Number(diferenca)
      };

      movimentacoes.push(monvimento);
    });
    return movimentacoes;
  }

  // Recupera os dados para atualizar a tabela de precificação
  precificacaoToJson(produtos): any {
    let precificacao = [];

    produtos.forEach((item, index) => {
      const produto = {
        'produto_id': produtos[index].prod_id,
        'qualidade_id': produtos[index].qual_id,
        'fornecedor_id': produtos[index].fornecedor_id,
        'quantidade': produtos[index].quantidade
      };

      precificacao.push(produto);
    });
    return precificacao;
  }
  // ========================================================================================================


  // =========== Metodos auxiliares para finalizar prensa ===================================================,
  // Encerra a produção chamando a procedure para fazer os inserts no banco de dados
  stopPrensa(prodInfoHead, prodInfoItems, productionBreaks, arrayUniqueByKey) {
    const prensa = {
      'lote': this.prodInfoHeadToJson(prodInfoHead),
      'lote_parada': this.productionBreaksToJson(productionBreaks, prodInfoHead.currentLote),
      'lote_itens': this.prensaInfoItemsToJson(prodInfoItems, prodInfoHead),
      'movimentacoes': this.prensaMovimentacoesToJson(arrayUniqueByKey, prodInfoHead),
      'precificacao': this.prensaPrecificacaoToJson(arrayUniqueByKey, prodInfoHead)
    };
    return prensa;
  }

  // Itens da triagem para insert no banco
  prensaInfoItemsToJson(prodInfoItems, prodInfoHead): any {
    let lote_itens = [];
    prodInfoItems.forEach(item => {
      const totalTimeItem = this.sharedVariableService.difTime(item.start, item.end);
      const items = {
        'id': '',
        'num_lote': prodInfoHead.currentLote,
        'num_recipiente': prodInfoHead.numeroPrensa.id,
        'produto': item.product.id,
        'quantidade': item.qtn,
        'socio': prodInfoHead.socioProduzido.id,
        'iniciado': prodInfoHead.start,
        'finalizado': prodInfoHead.end,
        'tempo_total': prodInfoHead.totalTimeProduction,
      };

      lote_itens.push(items);
    });

    const items = {
      'id': '',
      'num_lote': prodInfoHead.currentLote,
      'num_recipiente': prodInfoHead.numeroPrensa.id,
      'produto': prodInfoHead.produtoProduzido.produto.id,
      'quantidade': prodInfoHead.produtoProduzido.quantidade,
      'socio': prodInfoHead.socioProduzido.id,
      'iniciado': prodInfoHead.start,
      'finalizado': prodInfoHead.end,
      'tempo_total': prodInfoHead.totalTimeProduction,
    };

    lote_itens.push(items);
    return lote_itens;
  }

  prensaMovimentacoesToJson(arrayUniqueByKey, prodInfoHead): any{
    let movimentacoes = [];
    this.getPrecificacao();

    arrayUniqueByKey.forEach(item => {
      const precificacao = this.precificacoes.filter(resp => resp['id'] === item.id)[0];
      const saldoAtual = String(Number(precificacao.quantidade) - Number(item.quantidade));
      const diferenca =  String(Number(precificacao.quantidade) - Number(saldoAtual));

      const monvimento = {
        'id': '',
        'data': new Date().toISOString(),
        'entrada_saida': 'S',
        'tipo': 'Prensa',
        'numero_tipo': prodInfoHead.currentLote,
        'cod_produto': item.id,
        'saldo_anterior': Number(precificacao.quantidade),
        'saldo_atual': Number(saldoAtual),
        'dif': Number(diferenca)
      };
      movimentacoes.push(monvimento);
    });

    const precificacaoEntrada = this.precificacoes.filter(resp => resp['id'] === prodInfoHead.produtoProduzido.id)[0];
    let saldoAtual = String(Number(precificacaoEntrada.quantidade) + Number(prodInfoHead.produtoProduzido.quantidade));
    let diferenca =  String(Number(saldoAtual) - Number(precificacaoEntrada.quantidade));

    const monvimento = {
      'id': '',
      'data': new Date().toISOString(),
      'entrada_saida': 'E',
      'tipo': 'Prensa',
      'numero_tipo': prodInfoHead.currentLote,
      'cod_produto': prodInfoHead.produtoProduzido.id,
      'saldo_anterior': Number(precificacaoEntrada.quantidade),
      'saldo_atual': Number(saldoAtual),
      'dif': Number(diferenca)
    };
    movimentacoes.push(monvimento);
    console.log(monvimento)
    return movimentacoes;
  }

  // Recupera os dados para atualizar a tabela de precificação
  prensaPrecificacaoToJson(produtos, prodInfoHead): any {
    let precificacao = [];

    produtos.forEach((item, index) => {
      const produto = {
        'produto_id': produtos[index].produto.id,
        'qualidade_id': produtos[index].qualidade.id,
        'fornecedor_id': produtos[index].fornecedor_id,
        'quantidade': produtos[index].quantidade
      };

      precificacao.push(produto);
    });

    const produto = {
      'produto_id': prodInfoHead.produtoProduzido.produto.id,
      'qualidade_id': prodInfoHead.produtoProduzido.qualidade.id,
      'fornecedor_id':prodInfoHead.produtoProduzido.fornecedor.id,
      'quantidade': prodInfoHead.produtoProduzido.quantidade
    };

    precificacao.push(produto);

    return precificacao;
  }

  // =========== Metodos auxiliares para finalizar remanufatura ===================================================,
  // Encerra a produção chamando a procedure para fazer os inserts no banco de dados
  stopRemanufatura(prodInfoHead, prodInfoItemsInicial, prodInfoItemsFinal, productionBreaks, arrayUniqueByKeyInicial, arrayUniqueByKeyFinal) {
    const triagem = {
      'lote': this.prodInfoHeadToJson(prodInfoHead),
      'lote_parada': this.productionBreaksToJson(productionBreaks, prodInfoHead.currentLote),
      'lote_itens_inicial': this.prodInfoItemsToJson(prodInfoItemsInicial, prodInfoHead.currentLote),
      'lote_itens_final': this.prodInfoItemsToJson(prodInfoItemsFinal, prodInfoHead.currentLote),
      'movimentacoes_inicial': this.remanufaturaMovimentacoesToJson(arrayUniqueByKeyInicial, prodInfoHead.currentLote, 'inicial'),
      'movimentacoes_final': this.remanufaturaMovimentacoesToJson(arrayUniqueByKeyFinal, prodInfoHead.currentLote, 'final'),
      'precificacao_inicial': this.precificacaoToJson(arrayUniqueByKeyInicial),
      'precificacao_final': this.precificacaoToJson(arrayUniqueByKeyFinal)
    };

    return triagem;
  }

  // Itens da triagem para insert no banco
  remanufaturaInfoItemsToJson(prodInfoItems, currentLote): any {
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

  remanufaturaMovimentacoesToJson(arrayUniqueByKey, currentLote, type): any{
    let movimentacoes = [];

    arrayUniqueByKey.forEach(item => {
      const precificacao = this.precificacoes.filter(resp => resp['id'] == item.prod_id)[0];
      let saldoAtual = type === 'inicial' ? String(Number(precificacao.quantidade) - Number(item.quantidade)) : String(Number(precificacao.quantidade) + Number(item.quantidade));
      saldoAtual = saldoAtual.includes('.') ? saldoAtual : saldoAtual + '.00';
      item.quantidade = saldoAtual;
      let diferenca = String(Number(saldoAtual) - Number(precificacao.quantidade));
      diferenca =  diferenca.includes('.') ? diferenca : diferenca + '.00';

      const monvimento = {
        'id': '',
        'data': new Date().toISOString(),
        'entrada_saida': type === 'inicial' ? 'S' : 'E', 
        'tipo': 'Remanufatura',
        'numero_tipo': currentLote,
        'cod_produto': item.prod_id,
        'saldo_anterior': Number(precificacao.quantidade),
        'saldo_atual': Number(saldoAtual),
        'dif': Number(diferenca)
      };

      movimentacoes.push(monvimento);
    });
    return movimentacoes;
  }

  // Recupera os dados para atualizar a tabela de precificação
  remanufaturaPrecificacaoToJson(produtos, prodInfoHead): any {
    let precificacao = [];

    produtos.forEach((item, index) => {
      const produto = {
        'produto_id': produtos[index].produto.id,
        'qualidade_id': produtos[index].qualidade.id,
        'fornecedor_id': produtos[index].fornecedor_id,
        'quantidade': produtos[index].quantidade
      };

      precificacao.push(produto);
    });

    const produto = {
      'produto_id': prodInfoHead.produtoProduzido.produto.id,
      'qualidade_id': prodInfoHead.produtoProduzido.qualidade.id,
      'fornecedor_id':prodInfoHead.produtoProduzido.fornecedor.id,
      'quantidade': prodInfoHead.produtoProduzido.quantidade
    };

    precificacao.push(produto);

    return precificacao;
  }

  createRemanufatura(remanufatura) {
    return null;
  }
  // ========================================================================================================


  // Metodos auxiliares =====================================================================================
  // Cabeçalho da triagem para insert no banco
  prodInfoHeadToJson(prodInfoHead): any {
    const lote = {
      'num_lote': prodInfoHead.currentLote,
      'iniciado': prodInfoHead.start,
      'finalizado': prodInfoHead.end,
      'tempo_total': prodInfoHead.totalTimeProduction,
      'socio': prodInfoHead.socio.id,
      'fornecedor': (prodInfoHead.fornecedor) ? prodInfoHead.fornecedor.id : null,
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

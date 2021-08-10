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
  ){}

  createProduction(component: string, item: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/${component}/`, item);
  }

  createTriagem (prodInfoHead, prodInfoItems, productionBreaks){
    // Converte prodInfoHead do local storage e insere no banco
    const loteData = new FormData();
    loteData.append('num_lote', prodInfoHead.currentLote);
    loteData.append('finalizado', prodInfoHead.end);
    loteData.append('fornecedor', prodInfoHead.fornecedor.id);
    loteData.append('iniciado', prodInfoHead.start);
    loteData.append('socio', prodInfoHead.socio.id);
    loteData.append('tempo_total', prodInfoHead.totalTimeProduction);
    loteData.append('observacao', prodInfoHead.observacao);

    this.createProduction('lote', loteData).subscribe(response => {
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
  
          this.createProduction('loteItens', loteItemsData).subscribe(response => {
          }, err => {});
        });
  
        // Converte productionBreaks do local storage e insere no banco
        const loteBreaksData = new FormData();
        productionBreaks.forEach(item => {
          loteBreaksData.append('finalizado', item.endTime);
          loteBreaksData.append('iniciado', item.startTime);
          loteBreaksData.append('motivo', item.motivo);
          loteBreaksData.append('num_lote', prodInfoHead.currentLote);
          loteBreaksData.append('sequencia', item.sequence);
          loteBreaksData.append('tempo_total', item.total);
          
          this.createProduction('loteParadas', loteBreaksData).subscribe(response => {
          }, err => {});
        });
    
    }, err => {
      this.toastService.addToast('Não foi possivel salvar a produção', 'darkred');
    });
    this.toastService.addToast('Produção salva com sucesso');
  }

  // encerra a produção
  stopTriagem(prodInfoHead, prodInfoItems, productionBreaks, arrayUniqueByKey) {
    this.saveLote(prodInfoHead)
      .then(() => this.saveLoteItems(prodInfoItems, prodInfoHead.currentLote)
        .then(() => this.saveLoteBreaks(productionBreaks, prodInfoHead.currentLote)
          .then(() => this.saveMovimentacao(prodInfoHead.currentLote, prodInfoItems)
            .then(() => this.updatePrecificacao()
              .then(() => this.errorMessage('Produção Finalizada!!!'))
              .catch((fromRejected) => this.errorMessage(fromRejected)))
            .catch((fromRejected) => this.errorMessage(fromRejected)))
          .catch((fromRejected) => this.errorMessage(fromRejected)))
        .catch((fromRejected) => this.errorMessage(fromRejected)))
      .catch((fromRejected) => this.errorMessage(fromRejected));
  }

  saveLote(prodInfoHead): Promise<string> {
    return new Promise((resolve, reject) => {
      const loteData = new FormData();
      loteData.append('num_lote', prodInfoHead.currentLote);
      loteData.append('iniciado', prodInfoHead.start);
      loteData.append('finalizado', prodInfoHead.end);
      loteData.append('tempo_total', prodInfoHead.totalTimeProduction);
      loteData.append('socio', prodInfoHead.socio.id);
      loteData.append('fornecedor', prodInfoHead.fornecedor.id);
      loteData.append('observacao', prodInfoHead.observacao ? prodInfoHead.observacao : "Sem observações");
  
      this.createProduction('lote', loteData).subscribe(response => {
        resolve('Lote saved successfully');
      }, err => {
        reject('failed to save Lote');
      })
    });
  }

  saveLoteItems(prodInfoItems, currentLote): Promise<string> {
    return new Promise((resolve, reject) => {

      // Converte prodLoteItems do local storage e insere no banco        
      const loteItemsData = new FormData();
      prodInfoItems.forEach(item => {
        let totalTimeItem = this.sharedVariableService.difTime(item.start, item.end);
        loteItemsData.append('num_lote', currentLote);
        loteItemsData.append('num_recipiente', item.numBag);
        loteItemsData.append('produto', item.product.precificacao_id);
        loteItemsData.append('quantidade', item.qtn);
        loteItemsData.append('socio', item.socio.id);
        loteItemsData.append('iniciado', item.start);
        loteItemsData.append('finalizado', item.end);
        loteItemsData.append('tempo_total', totalTimeItem.toString());

        this.createProduction('loteItens', loteItemsData).subscribe(response => {
          resolve('Lote saved successfully');
        }, err => {
          reject('failed to save Lote');
        });
      });    
    });
  }

  saveLoteBreaks(productionBreaks, currentLote): Promise<string> {
    return new Promise((resolve, reject) => {
      const loteBreaksData = new FormData();
      if (productionBreaks) {
        productionBreaks.forEach(item => {
          loteBreaksData.append('num_lote', currentLote);
          loteBreaksData.append('motivo', item.motivo);
          loteBreaksData.append('sequencia', item.sequence);
          loteBreaksData.append('iniciado', item.startTime);
          loteBreaksData.append('finalizado', item.endTime);
          loteBreaksData.append('tempo_total', item.total);
          
          this.createProduction('loteParadas', loteBreaksData).subscribe(response => {
            resolve('Lote saved successfully');
          }, err => {
            reject('Not saveLoteBreaks');
          }); 
        });
      }
      resolve('No productions breaks to save');
    });
  }

  saveMovimentacao(currentLote, prodInfoItems): Promise<string> {
    return new Promise((resolve, reject) => {
      // Converte prodLoteItems do local storage e insere no banco        
      const loteItemsData = new FormData();
      let today = new Date();

      this.getPrecificacao().then(() => {
        let precificacao = null;
        let saldoAtual = null;

        prodInfoItems.forEach(item => {
          precificacao = this.precificacoes.filter(resp => resp['id'] == item.product.precificacao_id)[0]
          
          loteItemsData.append('data', new Date().toISOString());
          loteItemsData.append('entrada_saida', 'E');
          loteItemsData.append('tipo', 'triagem');
          loteItemsData.append('numero_tipo', currentLote);
          loteItemsData.append('cod_produto', item.product.precificacao_id);
          loteItemsData.append('saldo_anterior', precificacao.quantidade);
          saldoAtual = String(Number(precificacao.quantidade) + Number(item.qtn))
          saldoAtual = saldoAtual.includes('.') ? saldoAtual : saldoAtual + '.00';
          loteItemsData.append('saldo_atual', saldoAtual);
          item.qtn = saldoAtual.includes('.') ? saldoAtual : saldoAtual + '.00';
          loteItemsData.append('dif', item.qtn);
  
          this.createProduction('movimentacoes', loteItemsData).subscribe(response => {
            resolve('Lote saved successfully');
          }, err => {
            reject('failed to save Lote');
          });
        });    
      }).catch((fromRejected) => this.errorMessage(fromRejected));

    });
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
  
  getPrecificacao(): Promise<string> {
    return new Promise((resolve, reject) => {
      //gambiarra
      this.crudService.getItems('precificacao').subscribe(response => {
        this.precificacoes = response;
        if(response) {
          resolve('updatePrecificacao');
        } else {
          reject('Not updatePrecificacao');
        }
      });
    });
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

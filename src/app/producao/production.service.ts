import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SharedVariableService } from '../shared/shared-variable.service';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductionService {

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private sharedVariableService: SharedVariableService
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
      // setTimeout(() => {    
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
    
      // }, 1000);
    }, err => {
      this.toastService.addToast('Não foi possivel salvar a produção', 'darkred');
    });
    this.toastService.addToast('Produção salva com sucesso');
  }
}

import { ReportManagementService } from './../report-management.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { FormBuilder } from '@angular/forms';
import { CrudService } from '../../cadastros/crud.service';
import { SharedVariableService } from '../../shared/shared-variable.service';
import * as _ from 'lodash-es';

@Component({
  selector: 'app-historico-de-producoes',
  templateUrl: './historico-de-producoes.component.html',
  styleUrls: ['./historico-de-producoes.component.css']
})
export class HistoricoDeProducoesComponent implements OnInit {
    public produtos: any;
    public movimentacoes: any;
    public tempItemsList: any;
  
    public socios: any;
    public headForm: any;
    public showForm = false;
    public showTable = false;
  
    public selectedProduct: any;
  
    constructor(
      private crudService: CrudService,
      private formBuilder: FormBuilder,
      private sharedVariableService: SharedVariableService,
      private toastService: ToastService,
      private reportManagementService: ReportManagementService,
    ) { }
  
    ngOnInit(): void {
      this.getItems();
      this.loadForm();
    }
  
    exportReport(): any {
      if (this.showTable){
        const sTable = document.getElementById('tabHistoryProduct').innerHTML;
  
        let style = '<style>';
        style = style + 'table { width: 100%; }';
        style = style + 'table, th, td { border: solid 1px #DDD; border-collapse: collapse;';
        style = style + 'padding: 2px 3px;text-align: center; }';
        style = style + '</style>';
  
        // Criando a nova janela
        const win = window.open('', '', 'height=700,width=700');
  
        win.document.write('<html><head>');
        win.document.write('<title> Historico de movimentações - ' +
                            this.headForm.value.product.produto.descricao +
                            '(' + this.headForm.value.product.qualidade.nome + ') </title>'); // <title> para o cabeçalho do pdf.
        win.document.write(style);
        win.document.write('</head>');
        win.document.write('<body>');
        win.document.write(sTable);
        win.document.write('</body></html>');
        win.document.close();
        win.print();
      } else {
        this.toastService.addToast('Primeiro gere o relatório antes de exporta-lo', 'darkred');
      }
    }
  
    generateReport(): any{
      const formValues = this.headForm.value;
      if (formValues.inicio && !formValues.fim){
        formValues.fim = new Date();
      } else if (!formValues.inicio && !formValues.fim){
        formValues.inicio = '';
        formValues.fim = '';
      }
  
      if (formValues.producao){
        this.reportManagementService.getDateBeteween('productionHistory', formValues).subscribe(response => {
          this.movimentacoes = response.sort((a, b) => (a.iniciado > b.iniciado) ? -1 : 1);
          this.tempItemsList = _.clone(this.movimentacoes);
          this.showTable = true;
        });
      } else {
        this.toastService.addToast('Selecione a produção para gerar o relatório', 'darkred');
      }
    }
  
    getItems(): void {
      this.crudService.getItems('movimentacoes').subscribe(response => {
        this.movimentacoes = response.sort((a, b) => (a.data > b.data) ? -1 : 1);
        this.tempItemsList = _.clone(this.movimentacoes);
      });
    }
  
    loadForm(): void {
      this.headForm = this.formBuilder.group({
        producao: [null],
        inicio: [null],
        fim: [null]
      });
    }
  }
  


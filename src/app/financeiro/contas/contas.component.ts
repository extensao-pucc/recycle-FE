import { Component, OnInit } from '@angular/core';
import { FinanceiroService } from '../financeiro.service';
import { ModalContas } from '../contas/modal-contas/modal-contas.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';

import { Moment } from 'moment';
import * as moment from 'moment';
import * as _ from 'lodash-es';

import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';

@Component({
  selector: 'app-contas',
  templateUrl: './contas.component.html',
  styleUrls: ['./contas.component.css']
})
export class ContasComponent implements OnInit {
  public modalContas: ModalContas = new ModalContas();
  public showModalContas: boolean;

  public yesNoMessage: YesNoMessage = new YesNoMessage();
  public showYesNoMessage: boolean;
  public showForm = false;

  public contas: any;
  public tempItemsList: any;

  public situations: any;
  public types: any;

  public valuesVector: any = [];
  public maxValue: any;

  // Date ranger variables ==================================================================
  public selected: {
    startDate: Moment,
    endDate: Moment
  };

  ranges: any = {
    'Hoje': [moment(), moment()],
    'Ultimos 7 dias': [moment().subtract(6, 'days'), moment()],
    'Ultimos 30 dias': [moment().subtract(29, 'days'), moment()],
    'Este mês': [moment().startOf('month'), moment().endOf('month')],
    'Mês anterior': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    'Este ano': [moment().startOf('year'), moment().endOf('year')]
  };
  // ========================================================================================

  // Chart variables ==================================================================
  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };

  public barChartLabels: Label[] = [
    'Jnaeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  public barChartType: ChartType = 'bar';
  public barChartLegend = true;

  public barChartData: ChartDataSets[] = [
    { data: [650, 590, 800, 810, 560, 550, 400, 1000, 720, 50, 350, 478], label: 'A pagar' },
    { data: [280, 480, 400, 190, 860, 270, 900, 1200, 810, 610, 350, 520], label: 'A receber' }
  ];

  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public randomize(): void {
    this.barChartType = this.barChartType === 'bar' ? 'line' : 'bar';
  }
  // ========================================================================================

  constructor(
    private financeiroService: FinanceiroService,
    private toastService: ToastService,
  ) {
    this.situations = this.financeiroService.getSituation();
    this.types = this.financeiroService.getType();
  }

  convertMomentToDate(fullDate: any): any{
    if (fullDate.start && fullDate.end){
      console.log(fullDate.start.format('YYYY-MM-DD'));
      console.log(fullDate.end.format('YYYY-MM-DD'));
    }
  }

  ngOnInit(): void {
    this.getItems();
  }

  getItems(): any{
    this.financeiroService.getItems('contas').subscribe(response => {
      this.contas = response;
      this.tempItemsList = _.clone(this.contas);

      // Monta um vetor com os valores contidos no response
      this.contas.forEach(element => {
        this.valuesVector.push(parseFloat(element.valor));
      });

      // Verifica qual p maior valor no vetor
      this.maxValue = this.valuesVector.reduce((a: number, b: number) => Math.max(a, b));
    });
  }

  // Apaga contas do banco
  deleteItem(id): void {
    this.financeiroService.deleteItem('contas', id).subscribe(response => {
      this.getItems();
      this.toastService.addToast('Deletado com sucesso');
    }, err => {
      this.toastService.addToast(err['message'], 'darkred');
    });

    this.showForm = false;
  }

  // Inverte data no padrão americano para o brasileiro
  reverseStringDate(str): any{
    if (str){
      return str.split('-').reverse().join('-'); // reverse yyyy/mm/dd to dd/mm/yyyy
    }
  }

  // =========== Busca personalizada ====================================================
  Search(campo: any, valor: any): any{
    this.tempItemsList = _.clone(this.tempItemsList);

    console.log(valor)
    if (campo === 'valor'){
      valor = valor.replace('R$', '');
    }

    if (valor !== ''){
      this.tempItemsList = this.contas.filter(res => {
        return res[campo].toString().trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(
                valor.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''
              ));
      });
    } else if (valor === '') {
      this.ngOnInit();
    }
  }

  // Adicionar uma nova conta
  showModal(items: any): void {
    this.modalContas = {
      items: [items],
      fontAwesomeClass: 'fa-ban',
      action: {
        onClickYes: () => {
          console.log('Cliquei no sim');
        },
        onClickNo: () => { }
      }
    };
    this.showModalContas = true;
  }

  // Confirmação
  showModalYesNo(title: string, items: any): void {
    this.yesNoMessage = {
      title,
      mainText: 'Tem certeza que deseja ' + title.toLowerCase(),
      items: [items.descricao],
      fontAwesomeClass: 'fa-ban',
      action: {
        onClickYes: () => {
          if (title === 'Deletar') {
            this.deleteItem(items.id);
          } else if (title === 'Pagar') {
            console.log('Cliquei no Pagar');
          }
        },
        onClickNo: () => { }
      }
    };
    this.showYesNoMessage = true;
  }

  // Metodo utilizado para ordenar a tabela ao clicar no titulo da coluna
  sortTable(n: any, idTable: any): any {
    let table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById(idTable); // Recupera a tabela no html
    switching = true;
    dir = 'asc';

    while (switching) {
      switching = false;
      rows = table.rows; // recupera as linhas

      for (i = 2; i < (rows.length - 1); i++) {
        shouldSwitch = false;

        x = rows[i].getElementsByTagName('TD')[n];
        y = rows[i + 1].getElementsByTagName('TD')[n];

        // se conseguir converter para numero, o comparativo é feito numericamente, caso contrario apenas deixa as letras minusculas
        let cmpX = isNaN(parseFloat(x.innerHTML)) ? x.innerHTML.toLowerCase() : parseFloat(x.innerHTML);
        let cmpY = isNaN(parseFloat(y.innerHTML)) ? y.innerHTML.toLowerCase() : parseFloat(y.innerHTML);
        cmpX = (cmpX === '-') ? 0 : cmpX;
        cmpY = (cmpY === '-') ? 0 : cmpY;

        if (dir === 'asc') {
            if (cmpX > cmpY) {
                shouldSwitch = true;
                break;
            }
        } else if (dir === 'desc') {
            if (cmpX < cmpY) {
                shouldSwitch = true;
                break;
            }
        }
      }

      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount ++;
      } else {
        if (switchcount === 0 && dir === 'asc') {
            dir = 'desc';
            switching = true;
        }
      }
    }
  }

}

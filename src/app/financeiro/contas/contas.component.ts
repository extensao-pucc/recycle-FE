import { Component, OnInit } from '@angular/core';
import { FinanceiroService } from '../financeiro.service';
import { ModalContas } from '../contas/modal-contas/modal-contas.component';
import { Moment } from 'moment';
import * as moment from 'moment';
import * as _ from 'lodash';

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

  public contas: any;
  public tempItemsList: any;

  // Data ranger variables ==================================================================
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
  // Bar
  public barChartOptions: ChartOptions = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };

  public barChartLabels: Label[] = ['Jnaeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  // public barChartPlugins = [pluginDataLabels];

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
  ) { }

  ngOnInit(): void {
    this.getItems();
  }

  getItems(): any{
    this.financeiroService.getItems('contas').subscribe(response => {
      this.contas = response;
      this.tempItemsList = _.clone(this.contas);
    });
  }

  // Inverte data no padrão americano para o brasileiro
  reverseStringDate(str): any{
    if (str){
      return str.split('-').reverse().join('-'); // reverse yyyy/mm/dd to dd/mm/yyyy
    }
  }

  // MEtodo utilizado para ordenar a tabela ao clicar no titulo da coluna
  sortTable(n: any): any { 
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById('myTable'); // Cria uma variavel para a tabela
    switching = true;
    dir = 'asc'; // Define o tipo de ordenação

    while (switching) {
      switching = false;
      rows = table.rows;

      for (i = 2; i < (rows.length - 1); i++) {
        shouldSwitch = false;

        x = rows[i].getElementsByTagName('TD')[n];
        y = rows[i + 1].getElementsByTagName('TD')[n];

        // tslint:disable-next-line: radix
        let cmpX = isNaN(parseInt(x.innerHTML)) ? x.innerHTML.toLowerCase() : parseInt(x.innerHTML);
        // tslint:disable-next-line: radix
        let cmpY = isNaN(parseInt(y.innerHTML)) ? y.innerHTML.toLowerCase() : parseInt(y.innerHTML);
        cmpX = (cmpX == '-') ? 0 : cmpX;
        cmpY = (cmpY == '-') ? 0 : cmpY;

        if (dir == 'asc') {
            if (cmpX > cmpY) {
                shouldSwitch = true;
                break;
            }
        } else if (dir == 'desc') {
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
        if (switchcount == 0 && dir == 'asc') {
            dir = 'desc';
            switching = true;
        }
      }
    }
  }

  showModal(title: string, items: any): void {
    this.modalContas = {
      title,
      mainText: 'Tem certeza que deseja ' + title.toLowerCase(),
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
}

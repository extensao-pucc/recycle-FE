import { Component, OnInit } from '@angular/core';
import { CrudService } from '../cadastros/crud.service';
import * as _ from 'lodash-es';

@Component({
  selector: 'app-estoque',
  templateUrl: './estoque.component.html',
  styleUrls: ['./estoque.component.css']
})
export class EstoqueComponent implements OnInit {
    public estoque: any;
    public todoEstoque: any;
    public filterCod: any;

  constructor(private crudService: CrudService) {}

  ngOnInit(): void {
    this.getItems();
  }

  getItems(): void {
    this.crudService.getItems('precificacao').subscribe(response => {
      this.estoque = response.sort((a, b) => (a.produto.codigo > b.produto.codigo) ? 1  : -1);
      this.todoEstoque = _.clone(this.estoque);
    });
  }

  filterCode(event): any{
    this.filterCod = event;
  }
   // =========== Busca personalizada ====================================================
   Search(): any{
    if (this.filterCod !== ''){
      this.estoque = this.todoEstoque.filter(res => {
        return res['produto']['codigo'].toString().trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(
              this.filterCod.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''
              ));
      });
    } else if (this.filterCod === '') {
      this.ngOnInit();
    }
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

      for (i = 1; i < (rows.length - 1); i++) {
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

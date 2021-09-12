import { Component, OnInit } from '@angular/core';
import { ModalContas } from '../contas/modal-contas/modal-contas.component';
// import { DateRange } from 'igniteui-angular';

@Component({
  selector: 'app-contas',
  templateUrl: './contas.component.html',
  styleUrls: ['./contas.component.css']
})
export class ContasComponent implements OnInit {
  public modalContas: ModalContas = new ModalContas();
  public showModalContas: boolean;

  constructor() { }

  ngOnInit(): void {
  }

  sortTable(n: any): any {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById('myTable');
    switching = true;
    dir = 'asc'; 

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

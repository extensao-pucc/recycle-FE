import { Component, OnInit } from '@angular/core';
import { ModalContas } from '../contas/modal-contas/modal-contas.component';

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

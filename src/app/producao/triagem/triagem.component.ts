import { Component, OnInit } from '@angular/core';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-triagem',
  templateUrl: './triagem.component.html',
  styleUrls: ['./triagem.component.css']
})
export class TriagemComponent implements OnInit {
  public yesNoMessage: YesNoMessage = new YesNoMessage();
  public showYesNoMessage: boolean;

  constructor(private toastService: ToastService) { }

  ngOnInit(): void {
  }

  showModal(title: string, items: any): void {
    this.yesNoMessage = {
      title,
      mainText: 'Tem certeza que deseja ' + title.toLowerCase(),
      items: ['Deletar' ],
      fontAwesomeClass: 'fa-ban',
      action: {
        onClickYes: () => {
          
        },
        onClickNo: () => { }
      }
    };
    this.showYesNoMessage;
  }
}

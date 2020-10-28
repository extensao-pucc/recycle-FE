import { Component, OnInit } from '@angular/core';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { CrudService } from '../../cadastros/crud.service';

@Component({
  selector: 'app-triagem',
  templateUrl: './triagem.component.html',
  styleUrls: ['./triagem.component.css']
})
export class TriagemComponent implements OnInit {
  public yesNoMessage: YesNoMessage = new YesNoMessage();
  public showYesNoMessage: boolean;
  public selectedSocio: any;
  public socios: any;

  constructor(
    private toastService: ToastService,
    private crudService: CrudService
  ) {
    this.crudService.getItems('socios').subscribe(response => {
      this.socios = response;
    });
  }

  ngOnInit(): void {
  }

  startProduction(): void {
    
    const currentDate = new Date();
    console.log(currentDate)
    console.log('mes', currentDate.getMonth()) //+ 1
    console.log('date', currentDate.getDate())
    console.log('fullYear', currentDate.getFullYear())
    console.log('hours', currentDate.getHours())
    console.log('minutes', currentDate.getMinutes())
    console.log('seconds', currentDate.getSeconds())
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

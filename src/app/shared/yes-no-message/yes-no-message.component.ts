import { Component, Input, ElementRef, ViewChild, OnChanges } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-yes-no-message',
  templateUrl: './yes-no-message.component.html',
  styleUrls: ['./yes-no-message.component.css']
})
export class YesNoMessageComponent implements OnChanges {

  @Input() yesNoMessage: any;
  @ViewChild('defaultYesNo', { static: true }) defaultYesNo: ElementRef;

  public modalRef: any;

  constructor(
    private modalService: BsModalService
  ) { }

  ngOnChanges(): void {
    setTimeout(() => this.modalRef = this.modalService.show(this.defaultYesNo));
  }

  yesNo(yesNo: boolean): void {
    this.modalRef.hide();

    if (yesNo) {
      this.yesNoMessage.action.onClickYes();
    } else {
      this.yesNoMessage.action.onClickNo();
    }
  }
}

export class YesNoMessage {
  title: string;
  mainText: string;
  items: string[];
  fontAwesomeClass?: string;
  action: {
    onClickYes: any,
    onClickNo: any
  };
}

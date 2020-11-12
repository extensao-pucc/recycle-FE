import { Component, Input, ElementRef, ViewChild, OnChanges } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-view-image',
  templateUrl: './view-image.component.html',
  styleUrls: ['./view-image.component.css']
})
export class ViewImageComponent implements OnChanges {

  @Input() viewImage: any;
  @ViewChild('defaultViewImage', { static: true }) defaultViewImage: ElementRef;

  public modalRef: any;

  constructor(
    private modalService: BsModalService
  ) { }

  ngOnChanges(): void {
    setTimeout(() => this.modalRef = this.modalService.show(this.defaultViewImage));
  }

  yesNo(yesNo: boolean): void {
    this.modalRef.hide();

    if (yesNo) {
      this.viewImage.action.onClickYes();
    } else {
      this.viewImage.action.onClickNo();
    }
  }
}

export class ViewImage {
  image: any;
  action: {
    onClickYes: any,
    onClickNo: any
  };
}

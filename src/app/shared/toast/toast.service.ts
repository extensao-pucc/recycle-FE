import { Injectable } from '@angular/core';
import { SnackbarService } from 'ngx-snackbar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    private snackbarService: SnackbarService
  ) { }

  addToast(message?: string, toastBg?: string, onClickCallback?: Function): void {
    const _this = this;
    const background = toastBg || '#009933';
    this.snackbarService.add({
      msg: message || 'Erro na operação',
      timeout: 5000,
      background: background,
      action: {
        text: "X",
        onClick: (snack) => {
          if (onClickCallback) {
            onClickCallback();
          }
          _this.snackbarService.clear();
        },
      },
    });
  }
}
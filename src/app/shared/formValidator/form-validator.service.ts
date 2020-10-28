import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormValidatorService {

  constructor() { }

  emailDomainValidator(control: FormControl) {
    const msgErro = 'Este campo ontem A';
    let str = control.value;
    if (str && str.includes('a')) {
      return {msgErro};
    }
    return null;
  }
}

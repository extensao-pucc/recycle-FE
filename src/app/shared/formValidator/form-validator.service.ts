import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CrudService } from '../../cadastros/crud.service';

@Injectable({
  providedIn: 'root'
})
export class FormValidatorService {

  constructor(
    private crudService: CrudService,
  ) { }

  isNumeric(control: FormControl): any {
    const msgErro = 'Apenas numeros aqui';
    let field = control.value;
    if (field && isNaN(field)) {
      return {msgErro};
    }
    return null;
  }

  isEmpty(control: FormControl): any {
    const msgErro = 'Obrigatório';
    let field = control.value;

    if (!field) {
      return {msgErro};
    }
    return null;
  }
  
  validNCM(control: FormControl): any {
    const msgErro = 'NCM inválido';
    let field = control.value;

    let er = new RegExp(/^[0-9]{8}$/);

    if (field &&  !er.test(field) ) {
      return {msgErro};
    }
    return null;
  }


  validTelefone(control: FormControl): any {
    const msgErro = 'Telefone inválido';
    let field = control.value;

    let er = new RegExp(/^[0-9]{10,11}$/);

    if (field &&  !er.test(field) ) {
      return {msgErro};
    }
    return null;
  }

  validCEP(control: FormControl): any{
    const msgErro = 'CEP deve conter 8 numeros';
    let field = control.value;

    let er = new RegExp(/^[0-9]{8}$/);

    if (field &&  !er.test(field) ) {
      return {msgErro};
    }
    return null;
  }

  validEmail(control: FormControl): any{
    const msgErro = 'Email inválido';
    let field = control.value;

    let er = new RegExp(/^[A-Za-z0-9_\-\.]+@[A-Za-z0-9_\-\.]{2,}\.[A-Za-z0-9]{2,}(\.[A-Za-z0-9])?/);

    if (field &&  !er.test(field) ) {
      return {msgErro};
    }
    return null;
  }

  validRG(control: FormControl): any{
    const msgErro = 'RG inválido';
    let field = control.value;

    let er = new RegExp(/^[0-9]{9}$/);

    if (field &&  !er.test(field) ) {
      return {msgErro};
    }
    return null;
  }

  validPIS_PASEP(control: FormControl): any{
    const msgErro = 'Valor inválido';
    let field = control.value;

    let er = new RegExp(/^[0-9]{11}$/);

    if (field &&  !er.test(field) ) {
      return {msgErro};
    }
    return null;
  }

  validCPF_CNPJ(control: FormControl): any{
    let numeros, digitos, soma, i, resultado, digitos_iguais;
    let field = control.value;

    /* ========== CPFs válidos ============
    -> 052.922.300-73
    -> 262.496.500-91
    -> 132.943.360-20
    -> 00417720084
    -> 75523042005
    -> 48405867058
    ======================================*/

    /*========== CNPJs válidos ============
    -> 87.513.771/0001-60
    -> 58.921.440/0001-61
    -> 72.901.073/0001-65
    -> 19556729000177
    -> 49510856000104
    ======================================*/


    // validação CPF
    if (field && field.length <= 11){
      const msgErro = 'CPF inválido';

      digitos_iguais = 1;
      if (field.length < 11) {
        return {msgErro};
      }

      for (i = 0; i < field.length - 1; i++) {
        if (field.charAt(i) != field.charAt(i + 1)){
          digitos_iguais = 0;
          break;
        }
      }

      if (!digitos_iguais){
        numeros = field.substring(0, 9);
        digitos = field.substring(9);
        soma = 0;

        for (i = 10; i > 1; i--) {
              soma += numeros.charAt(10 - i) * i;
        }

        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0)) {
          return {msgErro};
        }

        numeros = field.substring(0, 10);
        soma = 0;
        for (i = 11; i > 1; i--) {
              soma += numeros.charAt(11 - i) * i;
        }

        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(1)) {
          return {msgErro};
        }
        return null;
      } else {
        return {msgErro};
      }

    }
    // validação CNPJ
    else if (field && field.length <= 14) {
      const msgErro = 'CNPJ inválido';

      if (field.length != 14) {
        return {msgErro};
      }

      if (field == '00000000000000' ||
      field == '11111111111111' ||
      field == '22222222222222' ||
      field == '33333333333333' ||
      field == '44444444444444' ||
      field == '55555555555555' ||
      field == '66666666666666' ||
      field == '77777777777777' ||
      field == '88888888888888' ||
      field == '99999999999999'){
        return {msgErro};
  }

      let tamanho = field.length - 2;
      numeros = field.substring(0, tamanho);
      digitos = field.substring(tamanho);
      soma = 0;
      let pos = tamanho - 7;
      for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) {
          pos = 9;
        }
      }
      resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
      if (resultado != digitos.charAt(0)) {
        return {msgErro};
      }

      tamanho = tamanho + 1;
      numeros = field.substring(0, tamanho);
      soma = 0;
      pos = tamanho - 7;
      for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) {
          pos = 9;
        }
      }
      resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
      if (resultado != digitos.charAt(1)) {
        return {msgErro};
      }

      return null;
    }
  }


}

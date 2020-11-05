import { state } from '@angular/animations';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedVariableService {

  constructor() { }

  getStates(): any[]{
    const states = [
      {uf: 'AC', state: 'Acre'},
      {uf: 'AL', state: 'Alagoas'},
      {uf: 'AP', state: 'Amapá'},
      {uf: 'AM', state: 'Amazonas'},
      {uf: 'BA', state: 'Bahia'},
      {uf: 'CE', state: 'Ceará'},
      {uf: 'DF', state: 'Distrito Federal'},
      {uf: 'ES', state: 'Espírito Santo'},
      {uf: 'GO', state: 'Goiás'},
      {uf: 'MA', state: 'Maranhão'},
      {uf: 'MT', state: 'Mato Grosso'},
      {uf: 'MS', state: 'Mato Grosso do Sul'},
      {uf: 'MG', state: 'Minas Gerais'},
      {uf: 'PA', state: 'Pará'},
      {uf: 'PB', state: 'Paraíba'},
      {uf: 'PR', state: 'Paraná'},
      {uf: 'PE', state: 'Pernambuco'},
      {uf: 'PI', state: 'Piauí'},
      {uf: 'RJ', state: 'Rio de Janeiro'},
      {uf: 'RN', state: 'Rio Grande do Norte'},
      {uf: 'RS', state: 'Rio Grande do Sul'},
      {uf: 'RO', state: 'Rondônia'},
      {uf: 'RR', state: 'Roraima'},
      {uf: 'SC', state: 'Santa Catarina'},
      {uf: 'SP', state: 'São Paulo'},
      {uf: 'SE', state: 'Sergipe'},
      {uf: 'TO', state: 'Tocantins'}
    ];
    return states;
  }

  getStatus(): any[]{
    const status = [
      {status: 'Ativo'},
      {status: 'Inativo'}
    ];
    return status;
  }

  getTypes(): any[]{
    const types = [
      {type: 'Entrada'},
      {type: 'Saída'}
    ];
    return types;
  }

  getProfiles(): any[]{
    const profile = [
      {profile: 'Admin'},
      {profile: 'User'}
    ];
    return profile;
  }

  // getRandomColor(): any {
  //   let colours = ['#00c0f1', '#add036', '#ec2426', '#ffc116'];
  //   return colours[Math.floor(Math.random() * 4)];
  // }
}

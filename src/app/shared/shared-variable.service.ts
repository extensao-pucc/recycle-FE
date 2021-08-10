import { state } from '@angular/animations';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedVariableService {

  constructor() { }

  currentDate(date): string {
    const currentDate = new Date(date);
    const day = '' + currentDate.getDate();
    const month = '' + (currentDate.getMonth() + 1);
    const year = '' + currentDate.getFullYear();
    return (day.length === 1 ? '0' + day : day) +
    '/' + (month.length === 1 ? '0' + month : month) +
    '/' + (year.length === 1 ? '0' + year : year);
  }

  currentTime(date): string {
    const currentDate = new Date(date);
    const hour = '' + currentDate.getHours();
    const minute = '' + currentDate.getMinutes();
    const second = '' + currentDate.getSeconds();
    return (hour.length === 1 ? '0' + hour : hour) +
    ':' + (minute.length === 1 ? '0' + minute : minute) +
    ':' + (second.length === 1 ? '0' + second : second);
  }

  difTime(first, second): number {
    const dif = Math.floor((new Date(second).getTime() - new Date(first).getTime()) / 1000);
    return dif
  }

  //Orgãos expeditores
  getOrgans(): any[]{
    const organs = [
      {uf: 'AC', organ: 'SSP-AC'},
      {uf: 'AL', organ: 'SSP/AL'},
      {uf: 'AP', organ: 'SSP/AP'},
      {uf: 'AM', organ: 'SSP/AM'},
      {uf: 'BA', organ: 'SSP/BA'},
      {uf: 'CE', organ: 'SSPDS/CE'},
      {uf: 'DF', organ: 'SSP/DF'},
      {uf: 'ES', organ: 'SESP/ES'},
      {uf: 'GO', organ: 'SSP/GO'},
      {uf: 'MA', organ: 'SSP/MA'},
      {uf: 'MT', organ: 'SSP-MT'},
      {uf: 'MS', organ: 'SSP/MS'},
      {uf: 'MG', organ: 'SSP/MG'},
      {uf: 'PA', organ: 'SSP/PA'},
      {uf: 'PB', organ: 'SSP/PB'},
      {uf: 'PR', organ: 'SSP/PR'},
      {uf: 'PE', organ: 'SSP/PE'},
      {uf: 'PI', organ: 'SSP/PI'},
      {uf: 'RJ', organ: 'SSP/RJ'},
      {uf: 'RN', organ: 'SESED/RN'},
      {uf: 'RS', organ: 'SSP/RS'},
      {uf: 'RO', organ: 'SESDEC/RO'},
      {uf: 'RR', organ: 'SESP/RR'},
      {uf: 'SC', organ: 'SSP/SC'},
      {uf: 'SP', organ: 'SSP/SP'},
      {uf: 'SE', organ: 'SSP/SE'},
      {uf: 'TO', organ: 'SSP/TO'}
    ];
    return organs;
  } 

  // Estados do Brasil
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

  // Status para o Socio 
  getStatus(): any[]{
    const status = [
      {status: 'Ativo'},
      {status: 'Inativo'}
    ];
    return status;
  }

  // Tipo de natureza da operação
  getTypes(): any[]{
    const types = [
      {type: 'Entrada'},
      {type: 'Saida'}
    ];
    return types;
  }

  // Perfil do Socio
  getProfiles(): any[]{
    const profile = [
      {profile: 'Sem acesso'},
      {profile: 'Usuário'},
      {profile: 'Administrador'},
    ];
    return profile;
  }

  strToSeconds(time: string): number {
    const timeArr = time.split(":").map(x=>+x);
    return (timeArr[0] * 3600) + (timeArr[1] * 60) + timeArr[2];
  }

  secondsToArryTime(time): any {
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (time >= 3600) {​​​​​​​​
      hours = Math.floor(time / 3600);    
      time -= 3600 * hours;
    }​​​​​​​​
    
    if (time >= 60) {​​​​​​​​
      minutes = Math.floor(time / 60);
      time -= 60 * minutes;
    }​​​​​​​​

    seconds = time;

    let TotTime = { 'hours': hours, 'minutes': minutes, 'seconds': seconds}
    // let date = new Date();
    // date.setHours(hours);
    // date.setMinutes(minutes);
    // date.setSeconds(seconds);
    
    return TotTime;
  }
}

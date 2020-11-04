import { Component, OnInit,  Output, EventEmitter } from '@angular/core';
import { PesquisaCepService } from './pesquisa-cep.service';

@Component({
  selector: 'app-pesquisa-cep',
  templateUrl: './pesquisa-cep.component.html',
  styleUrls: ['./pesquisa-cep.component.css']
})
export class PesquisaCepComponent implements OnInit {

  @Output('retornaPesquisaCep') retornaPesquisaCep = new EventEmitter<any>();

  public cep: string;
  public naoEncontrado = false;

  constructor(
    private pesquisaCepService: PesquisaCepService
  ) { }

  ngOnInit(): void {
  }

  consultarEndereco(): any {
    this.pesquisaCepService.pesquisarCep(this.cep).subscribe(response => {
      this.retornaPesquisaCep.emit(response);
    }, error => {
      this.naoEncontrado = true;
      this.retornaPesquisaCep.emit(this.cep);
    });
  }

  onCepChange(): any {
    this.naoEncontrado = false;
  }

}

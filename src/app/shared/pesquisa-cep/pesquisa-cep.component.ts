import { Component, OnInit,  Output, EventEmitter, Input } from '@angular/core';
import { PesquisaCepService } from './pesquisa-cep.service';

@Component({
  selector: 'app-pesquisa-cep',
  templateUrl: './pesquisa-cep.component.html',
  styleUrls: ['./pesquisa-cep.component.css']
})
export class PesquisaCepComponent implements OnInit {

  @Input() valor: string;
  @Output('retornaPesquisaCep') retornaPesquisaCep = new EventEmitter<any>();

  public cep: string;
  public naoEncontrado = false;

  constructor(
    private pesquisaCepService: PesquisaCepService,
  ) { }

  ngOnInit(): void {
    this.cep = this.valor;
  }

  consultarEndereco(): any {
    
    if (this.cep.length == 8){
      this.pesquisaCepService.pesquisarCep(this.cep).subscribe(response => {
        this.retornaPesquisaCep.emit(response);
      }, error => {
        this.naoEncontrado = true;
        error = {'cep': this.cep};
        this.retornaPesquisaCep.emit(error);
      });
    } else {
      this.retornaPesquisaCep.emit({'cep': this.cep})
    }
  }

  onCepChange(): any {
    this.naoEncontrado = false;
    this.consultarEndereco();
  }

}

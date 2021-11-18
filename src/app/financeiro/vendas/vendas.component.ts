import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, NgForm, Validators } from '@angular/forms';
import { CrudService } from '../../cadastros/crud.service';
import * as _ from 'lodash-es';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ViewImage } from 'src/app/shared/view-image/view-image.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { FormValidatorService } from '../../shared/formValidator/form-validator.service';
import { SharedVariableService } from '../../shared/shared-variable.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FinanceiroService } from '../financeiro.service';

@Component({
  selector: 'app-vendas',
  templateUrl: './vendas.component.html',
  styleUrls: ['./vendas.component.css', '../../app.component.css', '../../cadastros/table.css']
})
export class VendasComponent implements OnInit {
  @ViewChild('eventForm') public eventListingForm: NgForm;
  @ViewChild('produtoScreen', { static: true }) produtoScreen: ElementRef;

  public tempVendas: any;
  public vendas: any;
  public vendaItens = [];
  public itemForm: any;
  public showForm = false;
  public yesNoMessage: YesNoMessage = new YesNoMessage();
  public showYesNoMessage: boolean;
  public activeItem = null;
  public modalRef: any;
  public selectedProduto: any;
  public selectedVendedor: any;
  public selectedCliente: any;
  public selectedFormaDePagamento: any;

  public states: any;
  public profiles: any;
  public status: any;
  public organs: any;
  public produtos: any;
  public vendedores: any;
  public clientes: any;
  public condicoesDePagamento: any;
  public vendaTotal: 0;

  public selectedFile: File;
  public imageInput: any = undefined;
  public imageInputView: any;

  public viewImage: ViewImage = new ViewImage();
  public showModalImage: boolean;

  constructor(
    private crudService: CrudService,
    private financeiroService: FinanceiroService,
    private toastService: ToastService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private formValidatorService: FormValidatorService,
    private sharedVariableService: SharedVariableService
  ) {
    this.states = this.sharedVariableService.getStates();
    this.profiles = this.sharedVariableService.getProfiles();
    this.status = this.sharedVariableService.getStatus();
    this.organs = this.sharedVariableService.getOrgans();
  }

  ngOnInit(): void {
    this.getItems();
  }

  // formata a data
  reverseStringDate(str) {
    if (str){
      return str.split('-').reverse().join('-'); // reverse yyyy/mm/dd to dd/mm/yyyy 
    }
  }

  // carrega os dados para popular a tela
  getItems(): void {
    this.crudService.getItems('socios').subscribe(response => this.vendedores = response);
    this.crudService.getItems('clientes').subscribe(response => this.clientes = response);
    this.crudService.getItems('condicoesDePagamento').subscribe(response => this.condicoesDePagamento = response);
    this.crudService.getItems('precificacao').subscribe(response => {
      this.produtos = response;
      this.produtos.map((i) => { i.produtoName = i.produto.descricao + ' - ' + i.qualidade.nome + ' - ' + i.fornecedor.razao_social_nome; return i; });
    });
    //recebe vendas e produtos da venda
    this.crudService.getItems('baglist').subscribe(response => {
      this.vendas = response;
      this.tempVendas = _.clone(this.vendas);
    });
  }

  /* Atualiza a quantidade do item do lote */
  updateQtn(idx, value): void {
    this.vendaItens[idx].quantidade_da_venda = value;
    this.calculateTotalVenda();
  }

  deleteItem(idx, value): void {
    console.log(this.produtos)
    // this.vendaItens.slice(idx, 1);
    // console.log(this.vendaItens)

    // this.calculateTotalVenda();
  }

  // abre modal com produtos da venda
  viewProducts(item: any): void {
    if (item == null) {
      this.showForm = true;
      this.selectedVendedor = null;
      this.selectedCliente = null;
      this.selectedFormaDePagamento = null;
      this.activeItem = false;
      this.vendaItens = [];
      this.vendaTotal = 0;
    } else {
      this.crudService.getItemById('vendas', item.id).subscribe(response => {
        this.selectedVendedor = response.vendedor.id;
        this.selectedCliente = response.cliente.id;
        this.selectedFormaDePagamento = response.forma_de_pagamento.id;
      });

      this.showForm = true;
      this.activeItem = item;
      this.vendaItens = this.activeItem.itens;
      this.calculateTotalVenda();
    }
  }

  ShowModalProd(): void {
    this.modalRef = this.modalService.show(this.produtoScreen)
  }

  addItemVenda(): void {
    this.crudService.getItemById('precificacao', this.selectedProduto).subscribe(response => {
      this.vendaItens.push({
        fornecedor: response.fornecedor.CNPJ_CPF,
        id: response.id,
        preco_compra: response.preco_compra,
        preco_venda: response.preco_venda,
        produto: response.produto.descricao,
        qualidade: response.qualidade.nome,
        quantidade_da_venda: 0,
        quantidade_estoque: response.quantidade
      });
    });
  }

  calculateTotalVenda(): any {
    this.vendaTotal = 0;
    this.vendaItens.forEach(element => {
      this.vendaTotal += element['quantidade_da_venda'] * element['preco_venda'];
    });
  }

  createVenda() {
      const request = {
        'cliente': this.selectedCliente,
        'data': new Date(),
        'forma_de_pagamento': this.selectedFormaDePagamento,
        'valor': this.vendaTotal,
        'vendedor': this.selectedVendedor,
        'itens': this.vendaItens
      }

      // this.financeiroService.createVenda(request);
      this.financeiroService.createVenda(request).subscribe(response => {
        this.getItems();
        this.showForm = false;
        this.toastService.addToast('Cadastrado com sucesso');
      }, err => {
        console.log(err);
      });
  
  }

  showModal(title: string, items: any): void {
    this.yesNoMessage = {
      title,
      mainText: 'Tem certeza que deseja ' + title.toLowerCase(),
      items: [title = ''],
      fontAwesomeClass: 'fa-ban',
      action: {
        onClickYes: () => {
          if (title === 'Salvar'){
            this.createVenda();
          } else if (title === 'Cancelar edição') {
            this.showForm = false;
            // this.loadForm();
          }
        },
        onClickNo: () => { }
      }
    };
    this.showYesNoMessage = true;
  }

  populaDados(item: any): any {
    if (item.logradouro ||  item.estado){
      this.itemForm.controls.endereco.setValue(item.logradouro);
      this.itemForm.controls.cidade.setValue(item.cidade);
      this.itemForm.controls.UF.setValue(item.estado);
    }
    this.itemForm.controls.CEP.setValue(item.cep);
  }

  sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("myTable");
    switching = true;
    dir = "asc"; 

    while (switching) {
      switching = false;
      rows = table.rows;

      for (i = 2; i < (rows.length - 1); i++) {
        shouldSwitch = false;

        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];

        var cmpX = isNaN(parseInt(x.innerHTML)) ? x.innerHTML.toLowerCase() : parseInt(x.innerHTML);
        var cmpY = isNaN(parseInt(y.innerHTML)) ? y.innerHTML.toLowerCase() : parseInt(y.innerHTML);
        cmpX = (cmpX == '-') ? 0 : cmpX;
        cmpY = (cmpY == '-') ? 0 : cmpY;

        if (dir == "asc") {
            if (cmpX > cmpY) {
                shouldSwitch= true;
                break;
            }
        } else if (dir == "desc") {
            if (cmpX < cmpY) {
                shouldSwitch= true;
                break;
            }
        }
      }

      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount ++;      
      } else {
        if (switchcount == 0 && dir == "asc") {
            dir = "desc";
            switching = true;
        }
      }
    }
  }

  // Busca personalizada
  Search(campo: any, valor: any): any{
    this.tempVendas = _.clone(this.tempVendas);

    if (valor !== ''){
      this.tempVendas = this.vendas.filter(res => {
        return res[campo].toString().trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f-\.|\-\(\) '\/]/g, '').match(
               valor.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f-\.|\-\(\) '\/]/g, ''
              ));
      });
    } else if (valor === '') {
      this.ngOnInit();
    }
  }
  
}

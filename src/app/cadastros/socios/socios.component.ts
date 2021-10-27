import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, NgForm, Validators } from '@angular/forms';
import { CrudService } from '../crud.service';
import * as _ from 'lodash-es';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ViewImage } from 'src/app/shared/view-image/view-image.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { FormValidatorService } from '../../shared/formValidator/form-validator.service';
import { SharedVariableService } from '../../shared/shared-variable.service';
import { PesquisaCepService } from '../../shared/pesquisa-cep/pesquisa-cep.service';
import { environment } from '../../../environments/environment';
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';

@Component({
  selector: 'app-socios',
  templateUrl: './socios.component.html',
  styleUrls: ['./socios.component.css', '../../app.component.css', '../table.css']
})
export class SociosComponent implements OnInit, IFormCanDeactivate {
  @ViewChild('eventForm') public eventListingForm: NgForm;

  public tempItemsList: any;
  public itemsList: any;
  public itemForm: any;
  public showForm = false;
  public yesNoMessage: YesNoMessage = new YesNoMessage();
  public showYesNoMessage: boolean;

  public states: any;
  public profiles: any;
  public status: any;
  public organs: any;

  public selectedFile: File;
  public imageInput: any = undefined;
  public imageInputView: any;

  public viewImage: ViewImage = new ViewImage();
  public showModalImage: boolean;

  constructor(
    private crudService: CrudService,
    private toastService: ToastService,
    private formBuilder: FormBuilder,
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
    this.loadForm();
  }

  canDeactivate(): boolean {
    if (this.eventListingForm) {
      if (this.eventListingForm.dirty) {
        return confirm('Tem certeza que deseja sair ? Suas alterações serão perdidas');
      }
    }
    return true
  }

  reverseStringDate(str){
    if (str){
      return str.split('-').reverse().join('-'); // reverse yyyy/mm/dd to dd/mm/yyyy 
    }
  }

  loadForm(): void {
    this.itemForm = this.formBuilder.group({
      id: [null],
      matricula: ['', [this.formValidatorService.isEmpty]],
      nome: ['', [this.formValidatorService.isEmpty]],
      data_de_nascimento: ['', [this.formValidatorService.isEmpty]],
      RG: ['', [this.formValidatorService.isEmpty, this.formValidatorService.validRG]],
      data_emissao: ['', [this.formValidatorService.isEmpty]],
      local_emissao: ['', [this.formValidatorService.isEmpty]],
      orgao_expedidor: ['', [this.formValidatorService.isEmpty]],
      CPF: ['', [this.formValidatorService.isEmpty, this.formValidatorService.validCPF_CNPJ]],
      titulo_de_Eleitor: ['', [this.formValidatorService.isEmpty]],
      PIS_PASEP: ['', [this.formValidatorService.isEmpty, this.formValidatorService.validPIS_PASEP]],
      NIT: ['', [this.formValidatorService.isEmpty, this.formValidatorService.isNumeric]],
      nome_da_Mae: ['', [this.formValidatorService.isEmpty]],
      nome_do_Pai: [''],
      endereco: ['', [this.formValidatorService.isEmpty]],
      numero: ['', [this.formValidatorService.isEmpty, this.formValidatorService.isNumeric]],
      complemento: [''],
      CEP: ['', [this.formValidatorService.validCEP]],
      UF: ['', [this.formValidatorService.isEmpty]],
      cidade: ['', [this.formValidatorService.isEmpty]],
      telefone: ['', [this.formValidatorService.isEmpty, this.formValidatorService.validTelefone]],
      email: ['', [this.formValidatorService.isEmpty, this.formValidatorService.validEmail]],
      data_de_admissao: ['', [this.formValidatorService.isEmpty]],
      data_de_demissao: [''],
      situacao: ['', [this.formValidatorService.isEmpty]],
      foto: [''],
      perfil: ['', [this.formValidatorService.isEmpty]],
    });
    this.imageInputView = '';
  }

  getItems(): void {
    this.crudService.getItems('socios').subscribe(response => {
      this.itemsList = response;
      this.tempItemsList = _.clone(this.itemsList);
    });
  }

   // =========== Busca personalizada ====================================================
   Search(campo: any, valor: any): any{
    this.tempItemsList = _.clone(this.tempItemsList);

    if (valor !== ''){
      this.tempItemsList = this.itemsList.filter(res => {
        return res[campo].toString().trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f-\.|\-\(\) '\/]/g, '').match(
               valor.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f-\.|\-\(\) '\/]/g, ''
              ));
      });
    } else if (valor === '') {
      this.ngOnInit();
    }
  }
  // ===================================================================================

  
  deleteItem(id): void {
    this.crudService.deleteItem('socios', id).subscribe(response => {
      this.getItems();
      this.toastService.addToast('Deletado com sucesso');
    }, err => {
      this.toastService.addToast(err['message'], 'darkred');
    });

    this.showForm = false;
  }

  updateItem(item: any): void {
    this.showForm = true;

    this.itemForm.controls.id.setValue(item.id);
    this.itemForm.controls.matricula.setValue(item.matricula);
    this.itemForm.controls.nome.setValue(item.nome);
    this.itemForm.controls.data_de_nascimento.setValue(item.data_de_nascimento);
    this.itemForm.controls.RG.setValue(item.RG);
    this.itemForm.controls.data_emissao.setValue(item.data_emissao);
    this.itemForm.controls.local_emissao.setValue(item.local_emissao);
    this.itemForm.controls.orgao_expedidor.setValue(item.orgao_expedidor);
    this.itemForm.controls.CPF.setValue(item.CPF);
    this.itemForm.controls.titulo_de_Eleitor.setValue(item.titulo_de_Eleitor);
    this.itemForm.controls.PIS_PASEP.setValue(item.PIS_PASEP);
    this.itemForm.controls.NIT.setValue(item.NIT);
    this.itemForm.controls.nome_da_Mae.setValue(item.nome_da_Mae);
    this.itemForm.controls.nome_do_Pai.setValue(item.nome_do_Pai);
    this.itemForm.controls.endereco.setValue(item.endereco);
    this.itemForm.controls.numero.setValue(item.numero);
    this.itemForm.controls.complemento.setValue(item.complemento);
    this.itemForm.controls.CEP.setValue(item.CEP);
    this.itemForm.controls.UF.setValue(item.UF);
    this.itemForm.controls.cidade.setValue(item.cidade);
    this.itemForm.controls.telefone.setValue(item.telefone);
    this.itemForm.controls.email.setValue(item.email);
    this.itemForm.controls.data_de_admissao.setValue(item.data_de_admissao);
    if (item.data_de_demissao != null){
      this.itemForm.controls.data_de_demissao.setValue(item.data_de_demissao);
    }
    this.itemForm.controls.situacao.setValue(item.situacao);
    this.itemForm.controls.perfil.setValue(item.perfil);

    this.imageInputView = item.foto;    
  }

  onChange(fileInput): void {
    this.imageInput = fileInput.target.files[0];
    const reader = new FileReader();

    // Transforma em file
    reader.onload = (e: any) => {
      this.imageInput = e.target.result;
    };
    
    // Exibe imagem na tela dando um preview para o usuario
    this.imageInputView = fileInput.target.files[0];
    const readerImage = new FileReader();

    readerImage.readAsDataURL(fileInput.target.files[0]);

    readerImage.onload = (e: any) => {
      this.imageInputView = e.target.result;
    };
  }

  async createUpdateItem() {
    const formValues = this.itemForm.value;

    if (this.itemForm.status === 'VALID'){
      const formData = new FormData();
      formData.append('id', this.itemForm.get('id').value);
      formData.append('matricula', this.itemForm.get('matricula').value);
      formData.append('local_emissao', this.itemForm.get('local_emissao').value);
      formData.append('nome', this.itemForm.get('nome').value);
      formData.append('data_de_nascimento', this.itemForm.get('data_de_nascimento').value);
      formData.append('RG', this.itemForm.get('RG').value);
      formData.append('data_emissao', this.itemForm.get('data_emissao').value);
      formData.append('local_emissao', this.itemForm.get('local_emissao').value);
      formData.append('orgao_expedidor', this.itemForm.get('orgao_expedidor').value);
      formData.append('CPF', this.itemForm.get('CPF').value);
      formData.append('titulo_de_Eleitor', this.itemForm.get('titulo_de_Eleitor').value);
      formData.append('PIS_PASEP', this.itemForm.get('PIS_PASEP').value);
      formData.append('NIT', this.itemForm.get('NIT').value);
      formData.append('nome_da_Mae', this.itemForm.get('nome_da_Mae').value);
      formData.append('nome_do_Pai', this.itemForm.get('nome_do_Pai').value);
      formData.append('endereco', this.itemForm.get('endereco').value);
      formData.append('numero', this.itemForm.get('numero').value);
      formData.append('complemento', this.itemForm.get('complemento').value);
      formData.append('CEP', this.itemForm.controls.CEP.value);
      formData.append('UF', this.itemForm.get('UF').value);
      formData.append('cidade', this.itemForm.get('cidade').value);
      formData.append('telefone', this.itemForm.get('telefone').value);
      formData.append('email', this.itemForm.get('email').value);
      formData.append('data_de_admissao', this.itemForm.get('data_de_admissao').value);
      formData.append('data_de_demissao', this.itemForm.get('data_de_demissao').value);
      formData.append('situacao', this.itemForm.get('situacao').value);
      if (this.imageInput != undefined){
        formData.append('foto', this.imageInput);
        this.imageInput = undefined;
      } else {
        if (this.imageInputView !== null && this.imageInputView !== ""){
          var b: any = await fetch(this.imageInputView).then(r => r.blob());
          var file = new File([b], this.itemForm.get('matricula').value + ".jpeg", {type: "image/jpeg", lastModified: Date.now()});

          formData.append('foto', file);
        } else {
          formData.append('foto', '');
        }
      }
      formData.append('perfil', this.itemForm.get('perfil').value);

      if (formValues.id) {
        this.crudService.updateItem('socios', formData, formValues.id).subscribe(response => {
          this.getItems();
          this.loadForm();

          this.showForm = false;
          this.toastService.addToast('Atualizado com sucesso!');
        }, err => {
          if (err.error.matricula){
            this.itemForm.controls.matricula.errors = {'msgErro': 'Sócio com essa matrícula já existe'};
            this.toastService.addToast('Informações inválidas, verifique para continuar', 'darkred');
          }else {
            this.toastService.addToast(err['message'], 'darkred');
          }
        });
      } else {
        formData.append('senha', this.itemForm.get('matricula').value.split('').reverse().join(''));
        this.crudService.createItem('socios', formData).subscribe(response => {
          this.getItems();
          this.loadForm();

          this.showForm = false;
          this.toastService.addToast('Cadastrado com sucesso');
        }, err => {
          if (err.error.matricula){
            this.itemForm.controls.matricula.errors = {'msgErro': 'Sócio com essa matrícula já existe'};
            this.toastService.addToast('Informações inválidas, verifique para continuar', 'darkred');
          }else {
            this.toastService.addToast(err['message'], 'darkred');
          }
        });
      }
    } else {
      this.toastService.addToast('Informações inválidas, verifique para continuar', 'darkred');
    }
  }

  showModal(title: string, items: any): void {
    const formValues = this.itemForm.value;

    this.yesNoMessage = {
      title,
      mainText: 'Tem certeza que deseja ' + title.toLowerCase(),
      items: [title === 'Deletar' ? items.nome : formValues.nome],
      fontAwesomeClass: 'fa-ban',
      action: {
        onClickYes: () => {
          if (title === 'Salvar'){
            this.createUpdateItem();
          } else if (title === 'Deletar'){
            (items.id) ? this.deleteItem(items.id) : this.deleteItem(items);
          } else if (title === 'Cancelar edição') {
            this.showForm = false;
            this.loadForm();
          }
        },
        onClickNo: () => { }
      }
    };
    this.showYesNoMessage = true;
  }

  showImage(image: any): void{
    this.showModalImage = true;

    this.viewImage = {
      image,
      action: {
        onClickYes: () => {
          this.showYesNoMessage = true;
        },
        onClickNo: () => { }
      }
    };
  }

    populaDados(item: any): any {
    if (item.logradouro ||  item.estado){
      this.itemForm.controls.endereco.setValue(item.logradouro);
      this.itemForm.controls.cidade.setValue(item.cidade);
      this.itemForm.controls.UF.setValue(item.estado);
    }
    this.itemForm.controls.CEP.setValue(item.cep);
  }

  sortTable(n): any {
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
}

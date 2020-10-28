import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { CrudService } from '../crud.service';
import * as _ from 'lodash';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-socios',
  templateUrl: './socios.component.html',
  styleUrls: ['./socios.component.css']
})
export class SociosComponent implements OnInit {
  public tempItemsList: any;
  public itemsList: any;
  public itemForm: any;
  public showForm = false;
  public yesNoMessage: YesNoMessage = new YesNoMessage();
  public showYesNoMessage: boolean;

  constructor(
    private crudService: CrudService,
    private toastService: ToastService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.getItems();
    this.loadForm();
  }

  validateForm(): boolean {
    const formValues = this.itemForm.value;
    return true;
  }

  loadForm(): void {
    this.itemForm = this.formBuilder.group({
      id: [null],
      matricula: ['', Validators.required],
      nome: ['', Validators.required],
      data_de_nascimento: ['', Validators.required],
      RG: ['', Validators.required],
      data_emissao: ['', Validators.required],
      local_emissao: ['', Validators.required],
      orgao_expedidor: ['', Validators.required],
      CPF: ['', Validators.required],
      titulo_de_Eleitor: ['', Validators.required],
      PIS_PASEP: ['', Validators.required],
      NIT: ['', Validators.required],
      nome_da_Mae: ['', Validators.required],
      nome_do_Pai: [''],
      endereco: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      UF: ['', Validators.required],
      cidade: ['', Validators.required],
      telefone: ['', Validators.required],
      email: ['', Validators.required],
      data_de_admissao: ['', Validators.required],
      data_de_demissao: ['', Validators.required],
      situacao: ['', Validators.required],
      foto: [''],
      perfil: ['', Validators.required]
    });
  }

  getItems(): void {
    this.crudService.getItems('socios').subscribe(response => {
      this.itemsList = response;
      this.tempItemsList = _.clone(this.itemsList);
    });
  }

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
    this.itemForm.controls.UF.setValue(item.UF);
    this.itemForm.controls.cidade.setValue(item.cidade);
    this.itemForm.controls.telefone.setValue(item.telefone);
    this.itemForm.controls.email.setValue(item.email);
    this.itemForm.controls.data_de_admissao.setValue(item.data_de_admissao);
    this.itemForm.controls.data_de_demissao.setValue(item.data_de_demissao);
    this.itemForm.controls.situacao.setValue(item.situacao);
    // this.itemForm.controls.foto.setValue(item.foto);
    this.itemForm.controls.perfil.setValue(item.perfil);
  }

  createUpdateItem(): void {
    this.showForm = false;
    const formValues = this.itemForm.value;

    if(this.validateForm()){
      if (formValues.id) {
        this.crudService.updateItem('socios', formValues, formValues.id).subscribe(response => {
          this.getItems();
          this.toastService.addToast('Atualizado com sucesso');

        }, err => {
          this.toastService.addToast(err['message'], 'darkred');
        });
      } else {
        this.crudService.createItem('socios', formValues).subscribe(response => {
          this.getItems();
          this.toastService.addToast('Cadastrado com sucesso');
        }, err => {
          console.log(err);
          this.toastService.addToast(err['message'], 'darkred');
        });
      }
    }

    this.loadForm();
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
}

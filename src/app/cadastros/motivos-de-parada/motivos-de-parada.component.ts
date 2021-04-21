import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CrudService } from '../crud.service';
import * as _ from 'lodash';
import { YesNoMessage } from 'src/app/shared/yes-no-message/yes-no-message.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { FormValidatorService } from '../../shared/formValidator/form-validator.service';


@Component({
  selector: 'app-motivos-de-parada',
  templateUrl: './motivos-de-parada.component.html',
  styleUrls: ['./motivos-de-parada.component.css', '../../app.component.css']
})
export class MotivosDeParadaComponent implements OnInit {
  public tempItemsList: any;
  public itemsList: any;
  public itemForm: any;
  public showForm = false;
  public yesNoMessage: YesNoMessage = new YesNoMessage();
  public showYesNoMessage: boolean;

  constructor(
    private crudService: CrudService,
    private toastService: ToastService,
    private formBuilder: FormBuilder,
    private formValidatorService: FormValidatorService
  ) { }

  ngOnInit(): void {
    this.getItems();
    this.loadForm();
  }

  loadForm(): void {
    this.itemForm = this.formBuilder.group({
      id: [null],
      motivo: ['', [this.formValidatorService.isEmpty]]
    });
  }

  getItems(): void {
    this.crudService.getItems('motivosDeParada').subscribe(response => {
      this.itemsList = response;
      this.tempItemsList = _.clone(this.itemsList);
    });
  }

 // =========== Busca personalizada ====================================================
 Search(campo: any, valor: any): any{
  this.tempItemsList = _.clone(this.tempItemsList);

  if (valor !== ''){
    this.tempItemsList = this.itemsList.filter(res => {
      return res[campo].toString().trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(
             valor.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''
            ));
    });
  } else if (valor === '') {
    this.ngOnInit();
  }
}
// ===================================================================================


  deleteItem(id): void {
    this.crudService.deleteItem('motivosDeParada', id).subscribe(response => {
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
    this.itemForm.controls.motivo.setValue(item.motivo);
  }

  createUpdateItem(): void {
    const formValues = this.itemForm.value;

    if (this.itemForm.status === 'VALID'){
      if (formValues.id) {
        this.crudService.updateItem('motivosDeParada', formValues, formValues.id).subscribe(response => {
          this.getItems();
          this.loadForm();

          this.showForm = false;
          this.toastService.addToast('Atualizado com sucesso!');
        }, err => {
          if (err.error.motivo){
            this.itemForm.controls.motivo.errors = {'msgErro': 'Motivo de parada com esse motivo já existe'};
            this.toastService.addToast('Informações inválidas, verifique para continuar', 'darkred');
          }else {
            this.toastService.addToast(err['message'], 'darkred');
          }
        });
      } else {
        this.crudService.createItem('motivosDeParada', formValues).subscribe(response => {
          this.getItems();
          this.loadForm();

          this.showForm = false;
          this.toastService.addToast('Cadastrado com sucesso');
        }, err => {
          if (err.error.motivo){
            this.itemForm.controls.motivo.errors = {'msgErro': 'Motivo de parada com esse motivo já existe'};
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
      items: [title === 'Deletar' ? items.motivo : formValues.motivo],
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

        if (dir == "asc") {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            //if so, mark as a switch and break the loop:
            shouldSwitch= true;
            break;
          }
        } else if (dir == "desc") {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            //if so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        /*If a switch has been marked, make the switch
        and mark that a switch has been done:*/
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        //Each time a switch is done, increase this count by 1:
        switchcount ++;      
      } else {
        /*If no switching has been done AND the direction is "asc",
        set the direction to "desc" and run the while loop again.*/
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
  }
}

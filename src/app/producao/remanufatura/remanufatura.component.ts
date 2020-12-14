import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { CrudService } from '../../cadastros/crud.service';
import { SharedVariableService } from '../../shared/shared-variable.service';
import { FormBuilder } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { from } from 'rxjs';

@Component({
  selector: 'app-remanufatura',
  templateUrl: './remanufatura.component.html',
  styleUrls: ['./remanufatura.component.css']
})
export class RemanufaturaComponent implements OnInit {
  public socios: any;
  public headForm: any;

  constructor(
    private toastService: ToastService,
    private crudService: CrudService,
    private sharedVariableService: SharedVariableService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.getItems();
    this.loadForm();
  }

  getItems(): void{
    this.crudService.getItems('socios').subscribe(response => this.socios = response);
  }

  loadForm(): void {
    this.headForm = this.formBuilder.group({
      prensa: [null],
      lote: [null],
      data: [null],
      inicio: [null],
      termino: [null],
      socio: [null],
      situacao: [null],
    });
  }
}

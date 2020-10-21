import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { CondicoesDePagamentoComponent } from './cadastros/condicoes-de-pagamento/condicoes-de-pagamento.component';

@NgModule({
  declarations: [
    AppComponent,
    CondicoesDePagamentoComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

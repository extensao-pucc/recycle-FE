import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// uteis
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

// components
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationComponent } from './navigation/navigation.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { CondicoesDePagamentoComponent } from './cadastros/condicoes-de-pagamento/condicoes-de-pagamento.component';
import { FamiliasComponent } from './cadastros/familias/familias.component';
import { FornecedoresComponent } from './cadastros/fornecedores/fornecedores.component';
import { MotivosDeParadaComponent } from './cadastros/motivos-de-parada/motivos-de-parada.component';
import { NaturezaDasOperacoesComponent } from './cadastros/natureza-das-operacoes/natureza-das-operacoes.component';
import { PrensasComponent } from './cadastros/prensas/prensas.component';
import { ProdutosComponent } from './cadastros/produtos/produtos.component';
import { QualidadesComponent } from './cadastros/qualidades/qualidades.component';
import { SociosComponent } from './cadastros/socios/socios.component';
import { TransportadorasComponent } from './cadastros/transportadoras/transportadoras.component';
import { UnidadesDeMedidaComponent } from './cadastros/unidades-de-medida/unidades-de-medida.component';

// providers
import { AuthGuard } from './guards/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    LoginComponent,
    HomeComponent,
    CondicoesDePagamentoComponent,
    FamiliasComponent,
    FornecedoresComponent,
    MotivosDeParadaComponent,
    NaturezaDasOperacoesComponent,
    PrensasComponent,
    ProdutosComponent,
    QualidadesComponent,
    SociosComponent,
    TransportadorasComponent,
    UnidadesDeMedidaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    TooltipModule.forRoot(),
    BsDropdownModule.forRoot()
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }

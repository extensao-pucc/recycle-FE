import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// uteis
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SnackbarModule } from 'ngx-snackbar';
import { NgxMaskModule } from 'ngx-mask';
import { NgSelectModule } from '@ng-select/ng-select';
import { AvatarModule } from 'ngx-avatar';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { ChartsModule } from 'ng2-charts';

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
import { PrecificacaoComponent } from './cadastros/precificacao/precificacao.component';
import { PrensasComponent } from './cadastros/prensas/prensas.component';
import { ProdutosComponent } from './cadastros/produtos/produtos.component';
import { QualidadesComponent } from './cadastros/qualidades/qualidades.component';
import { SociosComponent } from './cadastros/socios/socios.component';
import { TransportadorasComponent } from './cadastros/transportadoras/transportadoras.component';
import { YesNoMessageComponent } from './shared/yes-no-message/yes-no-message.component';
import { TriagemComponent } from './producao/triagem/triagem.component';

// providers
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './login/auth.service';
import { PesquisaCepComponent } from './shared/pesquisa-cep/pesquisa-cep.component';
import { ViewImageComponent } from './shared/view-image/view-image.component';
import { PrensaComponent } from './producao/prensa/prensa.component';
import { RemanufaturaComponent } from './producao/remanufatura/remanufatura.component';
import { MateriasPrimasComponent } from './cadastros/materias-primas/materias-primas.component';
import { HistoricoDeProdutoComponent } from './relatorios/historico-de-produto/historico-de-produto.component';
import { crudDeactivateGuard } from './guards/crud.deactivate.guard';
import { ConfigScreenComponent } from './config-screen/config-screen.component';
import { ClientesComponent } from './cadastros/clientes/clientes.component';
import { VendasComponent } from './financeiro/vendas/vendas.component';
import { ContasComponent } from './financeiro/contas/contas.component';
import { ModalContasComponent } from './financeiro/contas/modal-contas/modal-contas.component';
import { EstoqueComponent } from './estoque/estoque.component';
import { HistoricoDeProducoesComponent } from './relatorios/historico-de-producoes/historico-de-producoes.component';

const avatarColors = ['#FFB6C1', '#2c3e50', '#95a5a6', '#f39c12', '#1abc9c'];
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
    PrecificacaoComponent,
    PrensasComponent,
    ProdutosComponent,
    QualidadesComponent,
    SociosComponent,
    TransportadorasComponent,
    YesNoMessageComponent,
    TriagemComponent,
    PesquisaCepComponent,
    ViewImageComponent,
    PrensaComponent,
    RemanufaturaComponent,
    MateriasPrimasComponent,
    HistoricoDeProdutoComponent,
    ConfigScreenComponent,
    ClientesComponent,
    VendasComponent,
    ContasComponent,
    ModalContasComponent,
    EstoqueComponent,
    HistoricoDeProducoesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TooltipModule.forRoot(),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    SnackbarModule.forRoot(),
    NgxMaskModule.forRoot(),
    FormsModule,
    NgxDaterangepickerMd.forRoot(),
    ReactiveFormsModule,
    NgSelectModule,
    ChartsModule,
    AvatarModule.forRoot({
      colors: avatarColors
    }),
  ],
  providers: [AuthGuard, AuthService, crudDeactivateGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }

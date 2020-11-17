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
import { YesNoMessageComponent } from './shared/yes-no-message/yes-no-message.component';
import { TriagemComponent } from './producao/triagem/triagem.component';

// providers
import { AuthGuard } from './guards/auth.guard';
import { PesquisaCepComponent } from './shared/pesquisa-cep/pesquisa-cep.component';
import { ViewImageComponent } from './shared/view-image/view-image.component';
import { PrensaComponent } from './producao/prensa/prensa.component';

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
    PrensasComponent,
    ProdutosComponent,
    QualidadesComponent,
    SociosComponent,
    TransportadorasComponent,
    UnidadesDeMedidaComponent,
    YesNoMessageComponent,
    TriagemComponent,
    PesquisaCepComponent,
    ViewImageComponent,
    PrensaComponent
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
    ReactiveFormsModule,
    NgSelectModule,
    AvatarModule.forRoot({
      colors: avatarColors
    })
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }

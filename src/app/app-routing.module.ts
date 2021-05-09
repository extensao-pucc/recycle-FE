import { HistoricoDeProdutoComponent } from './relatorios/historico-de-produto/historico-de-produto.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { CondicoesDePagamentoComponent } from './cadastros/condicoes-de-pagamento/condicoes-de-pagamento.component';
import { FamiliasComponent } from './cadastros/familias/familias.component';
import { FornecedoresComponent } from './cadastros/fornecedores/fornecedores.component';
import { MateriasPrimasComponent } from './cadastros/materias-primas/materias-primas.component';
import { MotivosDeParadaComponent } from './cadastros/motivos-de-parada/motivos-de-parada.component';
import { NaturezaDasOperacoesComponent } from './cadastros/natureza-das-operacoes/natureza-das-operacoes.component';
import { PrensasComponent } from './cadastros/prensas/prensas.component';
import { ProdutosComponent } from './cadastros/produtos/produtos.component';
import { QualidadesComponent } from './cadastros/qualidades/qualidades.component';
import { SociosComponent } from './cadastros/socios/socios.component';
import { TransportadorasComponent } from './cadastros/transportadoras/transportadoras.component';
import { UnidadesDeMedidaComponent } from './cadastros/unidades-de-medida/unidades-de-medida.component';
import { TriagemComponent } from './producao/triagem/triagem.component';
import { PrensaComponent } from './producao/prensa/prensa.component';
import { RemanufaturaComponent } from './producao/remanufatura/remanufatura.component';
import { RelatoriosComponent } from './relatorios/relatorios.component';
import { from } from 'rxjs';


const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'condicoesDePagamento', component: CondicoesDePagamentoComponent, canActivate: [AuthGuard] },
  { path: 'familias', component: FamiliasComponent, canActivate: [AuthGuard] },
  { path: 'fornecedores', component: FornecedoresComponent, canActivate: [AuthGuard] },
  { path: 'materiasPrimas', component: MateriasPrimasComponent, canActivate: [AuthGuard] },
  { path: 'motivosDeParada', component: MotivosDeParadaComponent, canActivate: [AuthGuard] },
  { path: 'naturezaDasOperacoes', component: NaturezaDasOperacoesComponent, canActivate: [AuthGuard] },
  { path: 'prensas', component: PrensasComponent, canActivate: [AuthGuard] },
  { path: 'produtos', component: ProdutosComponent, canActivate: [AuthGuard] },
  { path: 'qualidades', component: QualidadesComponent, canActivate: [AuthGuard] },
  { path: 'socios', component: SociosComponent, canActivate: [AuthGuard] },
  { path: 'transportadoras', component: TransportadorasComponent, canActivate: [AuthGuard] },
  { path: 'unidadesDeMedida', component: UnidadesDeMedidaComponent, canActivate: [AuthGuard] },
  { path: 'triagem', component: TriagemComponent, canActivate: [AuthGuard] },
  { path: 'prensa', component: PrensaComponent, canActivate: [AuthGuard] },
  { path: 'remanufatura', component: RemanufaturaComponent, canActivate: [AuthGuard] },
  { path: 'relatorios', component: RelatoriosComponent, canActivate: [AuthGuard] },
  { path: 'historicoDeProduto', component: HistoricoDeProdutoComponent, canActivate: [AuthGuard] }, 
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

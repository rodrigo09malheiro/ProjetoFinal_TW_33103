/**
 * app.routes.ts
 * --------------------------------------------------------------------------
 * Definição de todas as rotas da aplicação (navegação entre páginas).
 * Liga cada caminho (path) ao componente correspondente, dentro da
 * estrutura de pastas exigida pelo professor (features/ e shared/).
 * Aplica o authGuard nas rotas privadas (games, games/:id, profile) e
 * define a rota wildcard "**" para a página de erro 404 (not-found).
 * --------------------------------------------------------------------------
 */
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { GameListComponent } from './features/game-list/game-list.component';
import { GameDetailComponent } from './features/game-detail/game-detail.component';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { ProfileComponent } from './features/profile/profile.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';

export const routes: Routes = [
  // Rota inicial redireciona para a página de login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Rotas públicas (não exigem autenticação)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Rotas privadas — só acessíveis se o authGuard deixar passar (utilizador logado)
  { path: 'games', component: GameListComponent, canActivate: [authGuard] },
  { path: 'games/:id', component: GameDetailComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },

  // Qualquer caminho não reconhecido cai aqui (página 404)
  { path: '**', component: NotFoundComponent },
];
/**
 * guards/auth.guard.ts
 * --------------------------------------------------------------------------
 * Route guard funcional que protege as rotas privadas da aplicação
 * (games, games/:id, profile — ver app.routes.ts). Antes de o Angular
 * Router ativar a rota, verifica se o utilizador tem sessão iniciada
 * (token guardado); caso não tenha, bloqueia o acesso e redireciona
 * automaticamente para a página de login.
 * --------------------------------------------------------------------------
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se o utilizador estiver autenticado, deixa avançar para a rota pedida
  if (authService.isLoggedIn()) {
    return true;
  }

  // Caso contrário, bloqueia a navegação e manda para o login
  router.navigate(['/login']);
  return false;
};
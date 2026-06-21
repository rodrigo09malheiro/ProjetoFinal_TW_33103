/**
 * shared/not-found/not-found.component.ts
 * --------------------------------------------------------------------------
 * Componente de página 404 (rota não encontrada). É associado à rota
 * wildcard "**" em app.routes.ts, pelo que é mostrado sempre que o
 * utilizador navega para um caminho que não corresponde a nenhuma rota
 * definida na aplicação. O botão de "voltar" decide de forma inteligente
 * para onde enviar o utilizador, dependendo se tem sessão iniciada ou não.
 * --------------------------------------------------------------------------
 */
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  // Se estiver logado manda para a listagem de jogos, senão manda para o login
  goHome(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/games']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
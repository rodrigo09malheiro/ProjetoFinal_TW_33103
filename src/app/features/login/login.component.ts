/**
 * features/login/login.component.ts
 * --------------------------------------------------------------------------
 * Componente da página de login. Apresenta o formulário de email/password,
 * valida os campos antes de submeter, chama o AuthService para autenticar
 * o utilizador e, em caso de sucesso, redireciona para a listagem de
 * jogos. Em caso de erro, mostra a mensagem devolvida pelo backend.
 * --------------------------------------------------------------------------
 */
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  // Valida os campos, chama o AuthService.login e trata sucesso/erro
  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Preenche todos os campos.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/games']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || err.error?.error || 'Erro ao fazer login.';
        this.isLoading = false;
      }
    });
  }

  // Navega para a página de registo
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
/**
 * features/register/register.component.ts
 * --------------------------------------------------------------------------
 * Componente da página de registo. Apresenta o formulário de criação de
 * conta (username, email, password, confirmação), valida os campos
 * (incluindo confirmação de password) e, após registo bem-sucedido,
 * redireciona para a página de login.
 * --------------------------------------------------------------------------
 */
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  isLoading = false;

  // Valida os campos (incluindo password === confirmPassword) e regista o utilizador
  onRegister(): void {
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Preenche todos os campos.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'As passwords não coincidem.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.username, this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || err.error?.error || 'Erro ao registar.';
        this.isLoading = false;
      }
    });
  }

  // Navega para a página de login
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
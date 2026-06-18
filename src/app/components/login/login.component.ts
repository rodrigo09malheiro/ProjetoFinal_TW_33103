import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
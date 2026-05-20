import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private router = inject(Router);

  email = '';
  password = '';
  errorMessage = '';

  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Preenche todos os campos.';
      return;
    }
    // Ligação ao backend será feita na Sprint 2
    console.log('Login com:', this.email, this.password);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
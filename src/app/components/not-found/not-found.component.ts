import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  goHome(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/games']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
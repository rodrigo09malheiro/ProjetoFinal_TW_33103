import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  isLoggedIn = false;
  username: string | null = null;
  isDarkMode = false;

  ngOnInit(): void {
    this.authService.username$.subscribe(username => {
      this.isLoggedIn = !!username;
      this.username = username;
    });

    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
      this.isDarkMode = true;
      document.body.classList.add('dark');
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
    localStorage.setItem('darkMode', String(this.isDarkMode));
  }

  goTo(path: string): void {
    this.router.navigate([`/${path}`]);
  }
}
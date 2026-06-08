import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

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
  avatarUrl: string | null = null;
  isDarkMode = false;
  showNavbar = false;

  private readonly authRoutes = ['/login', '/register'];

  ngOnInit(): void {
    this.authService.username$.subscribe(username => {
      this.isLoggedIn = !!username;
      this.username = username;
      this.updateNavbarVisibility(this.router.url);
    });

    this.authService.avatar$.subscribe(avatar => {
      this.avatarUrl = avatar;
    });

    // Atualiza a visibilidade da navbar em cada mudança de rota
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateNavbarVisibility(event.urlAfterRedirects);
    });

    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
      this.isDarkMode = true;
      document.body.classList.add('dark');
    }
  }

  private updateNavbarVisibility(url: string): void {
    const isAuthPage = this.authRoutes.some(route => url.startsWith(route));
    this.showNavbar = this.isLoggedIn && !isAuthPage;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
    localStorage.setItem('darkMode', String(this.isDarkMode));
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goTo(path: string): void {
    this.router.navigate([`/${path}`]);
  }
}
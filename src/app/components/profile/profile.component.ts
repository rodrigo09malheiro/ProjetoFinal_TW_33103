import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserDataService } from '../../services/user-data.service';

interface Game {
  game_id: number;
  game_name: string;
  game_image: string;
  game_rating: number;
}

interface Review {
  game_id: number;
  game_name: string;
  rating: number;
  comment: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private userDataService = inject(UserDataService);

  username = this.authService.getUsername();
  isLoading = true;

  favorites: Game[] = [];
  wishlist: Game[] = [];
  reviews: Review[] = [];

  ngOnInit(): void {
    let loaded = 0;
    const done = () => { if (++loaded === 3) this.isLoading = false; };

    this.userDataService.getFavorites().subscribe({
      next: (data) => { this.favorites = data; done(); },
      error: () => done()
    });
    this.userDataService.getWishlist().subscribe({
      next: (data) => { this.wishlist = data; done(); },
      error: () => done()
    });
    this.userDataService.getReviews().subscribe({
      next: (data) => { this.reviews = data; done(); },
      error: () => done()
    });
  }

  goToGame(gameId: number): void {
    this.router.navigate(['/games', gameId]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToGames(): void {
    this.router.navigate(['/games']);
  }
}
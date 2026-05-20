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
  activeTab: 'favorites' | 'wishlist' | 'reviews' = 'favorites';

  favorites: Game[] = [];
  wishlist: Game[] = [];
  reviews: Review[] = [];

  ngOnInit(): void {
    this.loadFavorites();
    this.loadWishlist();
    this.loadReviews();
  }

  loadFavorites(): void {
    this.userDataService.getFavorites().subscribe({
      next: (data) => { this.favorites = data; }
    });
  }

  loadWishlist(): void {
    this.userDataService.getWishlist().subscribe({
      next: (data) => { this.wishlist = data; }
    });
  }

  loadReviews(): void {
    this.userDataService.getReviews().subscribe({
      next: (data) => { this.reviews = data; }
    });
  }

  removeFavorite(gameId: number): void {
    this.userDataService.removeFavorite(gameId).subscribe({
      next: () => { this.favorites = this.favorites.filter(f => f.game_id !== gameId); }
    });
  }

  removeFromWishlist(gameId: number): void {
    this.userDataService.removeFromWishlist(gameId).subscribe({
      next: () => { this.wishlist = this.wishlist.filter(w => w.game_id !== gameId); }
    });
  }

  removeReview(gameId: number): void {
    this.userDataService.removeReview(gameId).subscribe({
      next: () => { this.reviews = this.reviews.filter(r => r.game_id !== gameId); }
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
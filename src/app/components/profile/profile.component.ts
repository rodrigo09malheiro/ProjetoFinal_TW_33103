import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserDataService } from '../../services/user-data.service';

// Tipagem correta para os teus jogos guardados
interface SavedGame {
  game_id: number;
  game_name: string;
  game_image: string;
  game_rating: number;
}

// Tipagem correta para as reviews
interface UserReview {
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

  username: string | null = null;
  favorites: SavedGame[] = [];
  wishlist: SavedGame[] = [];
  reviews: UserReview[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.authService.username$.subscribe(user => {
      this.username = user;
    });

    this.loadProfileData();
  }

  loadProfileData(): void {
    this.isLoading = true;

    this.userDataService.getFavorites().subscribe({
      next: (favs) => {
        this.favorites = favs as SavedGame[];
        this.checkLoadingComplete();
      },
      error: () => this.checkLoadingComplete()
    });

    this.userDataService.getWishlist().subscribe({
      next: (wish) => {
        this.wishlist = wish as SavedGame[];
        this.checkLoadingComplete();
      },
      error: () => this.checkLoadingComplete()
    });

    // Verificação defensiva tipada de forma segura para evitar o uso de 'any'
    const dynamicService = this.userDataService as unknown as { 
      getReviews?: () => { subscribe: (callbacks: { next: (revs: UserReview[]) => void }) => void } 
    };

    if (typeof dynamicService.getReviews === 'function') {
      dynamicService.getReviews().subscribe({
        next: (revs) => {
          this.reviews = revs;
        }
      });
    }
  }

  private checkLoadingComplete(): void {
    this.isLoading = false;
  }

  goToGame(id: number): void {
    this.router.navigate(['/games', id]);
  }
}
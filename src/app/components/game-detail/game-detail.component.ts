import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RawgService } from '../../services/rawg.service';
import { UserDataService } from '../../services/user-data.service';

interface GameDetail {
  id: number;
  name: string;
  background_image: string;
  rating: number;
  released: string;
  description_raw: string;
  genres: { name: string }[];
  platforms: { platform: { name: string } }[];
}

interface Screenshot {
  id: number;
  image: string;
}

interface SimilarGame {
  id: number;
  name: string;
  background_image: string;
  rating: number;
}

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-detail.component.html',
  styleUrl: './game-detail.component.css'
})
export class GameDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private rawgService = inject(RawgService);
  private userDataService = inject(UserDataService);

  game: GameDetail | null = null;
  isLoading = false;
  isFavorite = false;
  isInWishlist = false;
  reviewRating = 0;
  reviewComment = '';
  showReviewForm = false;
  successMessage = '';

  screenshots: Screenshot[] = [];
  similarGames: SimilarGame[] = [];
  selectedScreenshot: string | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.isLoading = true;
    this.rawgService.getGameById(id).subscribe({
      next: (data: unknown) => {
        this.game = data as GameDetail;
        this.isLoading = false;
        this.checkUserData();
        this.loadScreenshots(id);
        this.loadSimilarGames(id);
      },
      error: () => { this.isLoading = false; }
    });
  }

  loadScreenshots(id: number): void {
    this.rawgService.getGameScreenshots(id).subscribe({
      next: (data: unknown) => {
        const response = data as { results: Screenshot[] };
        this.screenshots = response.results.slice(0, 6);
      }
    });
  }

  loadSimilarGames(id: number): void {
    this.rawgService.getSimilarGames(id).subscribe({
      next: (data: unknown) => {
        const response = data as { results: SimilarGame[] };
        this.similarGames = response.results.slice(0, 6);
      }
    });
  }

  checkUserData(): void {
    this.userDataService.getFavorites().subscribe({
      next: (favorites) => {
        // CORREÇÃO: Usar gameId (camelCase)
        this.isFavorite = favorites.some(f => f.gameId === this.game?.id);
      }
    });
    this.userDataService.getWishlist().subscribe({
      next: (wishlist) => {
        // CORREÇÃO: Usar gameId (camelCase)
        this.isInWishlist = wishlist.some(w => w.gameId === this.game?.id);
      }
    });
  }

  toggleFavorite(): void {
    if (!this.game) return;
    if (this.isFavorite) {
      this.userDataService.removeFavorite(this.game.id).subscribe({
        next: () => { this.isFavorite = false; }
      });
    } else {
      // CORREÇÃO: Enviar propriedades em camelCase!
      this.userDataService.addFavorite({
        gameId: this.game.id,
        gameName: this.game.name,
        gameImage: this.game.background_image,
        gameRating: this.game.rating
      }).subscribe({
        next: () => { this.isFavorite = true; }
      });
    }
  }

  toggleWishlist(): void {
    if (!this.game) return;
    if (this.isInWishlist) {
      this.userDataService.removeFromWishlist(this.game.id).subscribe({
        next: () => { this.isInWishlist = false; }
      });
    } else {
      // CORREÇÃO: Enviar propriedades em camelCase!
      this.userDataService.addToWishlist({
        gameId: this.game.id,
        gameName: this.game.name,
        gameImage: this.game.background_image,
        gameRating: this.game.rating
      }).subscribe({
        next: () => { this.isInWishlist = true; }
      });
    }
  }

  submitReview(): void {
  if (!this.game || !this.reviewRating) return;
  this.userDataService.addReview({
    gameId: this.game.id,
    gameName: this.game.name,
    rating: this.reviewRating,
    comment: this.reviewComment
  }).subscribe({
    next: () => {
      this.successMessage = 'Review guardada!';
      this.showReviewForm = false;
      this.reviewRating = 0;
      this.reviewComment = '';
    },
    error: (err) => {
      this.successMessage = '';
      console.error('Erro ao guardar review:', err);
    }
  });
}

  openScreenshot(image: string): void {
    this.selectedScreenshot = image;
  }

  closeScreenshot(): void {
    this.selectedScreenshot = null;
  }

  goToGame(id: number): void {
    this.router.navigate(['/games', id]);
  }

  goBack(): void {
    this.router.navigate(['/games']);
  }
}
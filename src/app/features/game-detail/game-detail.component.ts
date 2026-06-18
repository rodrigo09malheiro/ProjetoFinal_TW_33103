import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RawgService } from '../../core/services/rawg.service';
import { UserDataService, Review } from '../../core/services/user-data.service';
import { AuthService } from '../../core/services/auth.service';
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
  private authService = inject(AuthService);

  game: GameDetail | null = null;
  isLoading = false;
  isFavorite = false;
  isInWishlist = false;
  reviewRating = 0;
  reviewComment = '';
  showReviewForm = false;
  successMessage = '';
  errorMessage = '';
  gameReviews: Review[] = [];

  screenshots: Screenshot[] = [];
  similarGames: SimilarGame[] = [];
  selectedScreenshot: string | null = null;

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.isLoading = true;
    this.rawgService.getGameById(id).subscribe({
      next: (data: unknown) => {
        this.game = data as GameDetail;
        this.isLoading = false;
        if (this.isLoggedIn) {
          this.checkUserData();
        }
        this.loadScreenshots(id);
        this.loadSimilarGames(id);
        this.loadGameReviews(id);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Erro ao carregar o jogo. Tenta novamente.';
      }
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

  loadGameReviews(id: number): void {
    this.userDataService.getGameReviews(id).subscribe({
      next: (reviews) => {
        this.gameReviews = reviews;
      },
      error: () => {
        // Reviews são opcionais, não mostrar erro crítico
        this.gameReviews = [];
      }
    });
  }

  checkUserData(): void {
    this.userDataService.getFavorites().subscribe({
      next: (favorites) => {
        this.isFavorite = favorites.some(f => f.gameId === this.game?.id);
      }
    });
    this.userDataService.getWishlist().subscribe({
      next: (wishlist) => {
        this.isInWishlist = wishlist.some(w => w.gameId === this.game?.id);
      }
    });
  }

  toggleFavorite(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    if (!this.game) return;
    this.errorMessage = '';

    if (this.isFavorite) {
      this.userDataService.removeFavorite(this.game.id).subscribe({
        next: () => { this.isFavorite = false; },
        error: () => { this.errorMessage = 'Erro ao remover dos favoritos.'; }
      });
    } else {
      this.userDataService.addFavorite({
        gameId: this.game.id,
        gameName: this.game.name,
        gameImage: this.game.background_image,
        gameRating: this.game.rating
      }).subscribe({
        next: () => { this.isFavorite = true; },
        error: () => { this.errorMessage = 'Erro ao adicionar aos favoritos.'; }
      });
    }
  }

  toggleWishlist(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    if (!this.game) return;
    this.errorMessage = '';

    if (this.isInWishlist) {
      this.userDataService.removeFromWishlist(this.game.id).subscribe({
        next: () => { this.isInWishlist = false; },
        error: () => { this.errorMessage = 'Erro ao remover da wishlist.'; }
      });
    } else {
      this.userDataService.addToWishlist({
        gameId: this.game.id,
        gameName: this.game.name,
        gameImage: this.game.background_image,
        gameRating: this.game.rating
      }).subscribe({
        next: () => { this.isInWishlist = true; },
        error: () => { this.errorMessage = 'Erro ao adicionar à wishlist.'; }
      });
    }
  }

  submitReview(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    if (!this.game || !this.reviewRating) return;
    this.errorMessage = '';

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
        // Recarrega reviews para mostrar a nova
        this.loadGameReviews(this.game!.id);
        // Limpa a mensagem após 3 segundos
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: () => {
        this.errorMessage = 'Erro ao guardar a review. Tenta novamente.';
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
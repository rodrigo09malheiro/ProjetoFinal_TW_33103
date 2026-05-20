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

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.isLoading = true;
    this.rawgService.getGameById(id).subscribe({
      next: (data: unknown) => {
        this.game = data as GameDetail;
        this.isLoading = false;
        this.checkUserData();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  checkUserData(): void {
    this.userDataService.getFavorites().subscribe({
      next: (favorites) => {
        this.isFavorite = favorites.some(f => f.game_id === this.game?.id);
      }
    });
    this.userDataService.getWishlist().subscribe({
      next: (wishlist) => {
        this.isInWishlist = wishlist.some(w => w.game_id === this.game?.id);
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
      this.userDataService.addFavorite({
        game_id: this.game.id,
        game_name: this.game.name,
        game_image: this.game.background_image,
        game_rating: this.game.rating
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
      this.userDataService.addToWishlist({
        game_id: this.game.id,
        game_name: this.game.name,
        game_image: this.game.background_image,
        game_rating: this.game.rating
      }).subscribe({
        next: () => { this.isInWishlist = true; }
      });
    }
  }

  submitReview(): void {
    if (!this.game || !this.reviewRating) return;
    this.userDataService.addReview({
      game_id: this.game.id,
      game_name: this.game.name,
      rating: this.reviewRating,
      comment: this.reviewComment
    }).subscribe({
      next: () => {
        this.successMessage = 'Review guardada!';
        this.showReviewForm = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/games']);
  }
}
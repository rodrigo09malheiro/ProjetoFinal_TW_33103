import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserDataService } from '../../services/user-data.service';

interface SavedGame {
  game_id: number;
  game_name: string;
  game_image: string;
  game_rating: number;
}

interface UserReview {
  game_id: number;
  game_name: string;
  rating: number;
  comment: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private userDataService = inject(UserDataService);

  username: string | null = null;
  avatarUrl: string | null = null;
  favorites: SavedGame[] = [];
  wishlist: SavedGame[] = [];
  reviews: UserReview[] = [];
  isLoading = true;

  isEditing = false;
  editUsername = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  messageSuccess = '';
  messageError = '';

  baseUrl = 'http://localhost:3000';

  ngOnInit(): void {
    this.authService.username$.subscribe(user => {
      this.username = user;
      this.editUsername = user ?? '';
    });

    this.authService.avatar$.subscribe(avatar => {
      this.avatarUrl = avatar;
    });

    this.loadProfileData();
  }

  loadProfileData(): void {
    this.isLoading = true;

    this.userDataService.getFavorites().subscribe({
      next: (favs) => { this.favorites = favs as SavedGame[]; }
    });

    this.userDataService.getWishlist().subscribe({
      next: (wish) => { this.wishlist = wish as SavedGame[]; }
    });

    this.userDataService.getReviews().subscribe({
      next: (revs) => { this.reviews = revs as UserReview[]; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.messageSuccess = '';
    this.messageError = '';
    this.selectedFile = null;
    this.previewUrl = null;
    this.editUsername = this.username ?? '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  saveProfile(): void {
    this.messageSuccess = '';
    this.messageError = '';

    if (this.selectedFile) {
      this.authService.uploadAvatar(this.selectedFile).subscribe({
        next: (res) => {
          this.avatarUrl = res.avatarUrl;
          this.selectedFile = null;
          this.previewUrl = null;
          this.updateUsername();
        },
        error: (err) => {
          this.messageError = err.error?.error || 'Erro ao carregar a imagem.';
        }
      });
    } else {
      this.updateUsername();
    }
  }

  private updateUsername(): void {
    this.authService.updateProfile({ username: this.editUsername }).subscribe({
      next: (res) => {
        this.messageSuccess = 'Perfil atualizado!';
        this.username = res.username;
        this.isEditing = false;
      },
      error: (err) => {
        this.messageError = err.error?.error || 'Erro ao atualizar o perfil.';
      }
    });
  }

  goToGame(id: number): void {
    this.router.navigate(['/games', id]);
  }
}
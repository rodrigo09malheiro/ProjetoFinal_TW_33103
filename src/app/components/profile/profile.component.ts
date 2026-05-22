import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importante para os inputs
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

  // Dados de exibição
  username: string | null = null;
  email: string = '';
  avatarUrl: string | null = null;
  favorites: SavedGame[] = [];
  wishlist: SavedGame[] = [];
  reviews: UserReview[] = [];
  isLoading = true;

  // Estado e Formulário de Edição
  isEditing = false;
  editUsername = '';
  editEmail = '';
  editPassword = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  
  messageSuccess = '';
  messageError = '';

  baseUrl = 'http://localhost:3000'; // URL do teu backend para carregar as imagens

  ngOnInit(): void {
    this.authService.username$.subscribe(user => {
      this.username = user;
    });

    this.authService.avatar$.subscribe(avatar => {
      this.avatarUrl = avatar;
    });

    this.loadProfileData();
  }

  loadProfileData(): void {
    this.isLoading = true;

    // Carrega os dados detalhados do perfil (incluindo email e avatar do banco)
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.email = profile.email;
        this.editUsername = profile.username;
        this.editEmail = profile.email;
        if (profile.avatar) {
          this.avatarUrl = profile.avatar;
        }
        this.checkLoadingComplete();
      },
      error: () => this.checkLoadingComplete()
    });

    // Carrega favoritos
    this.userDataService.getFavorites().subscribe({
      next: (favs) => {
        this.favorites = favs as SavedGame[];
      }
    });

    // Carrega wishlist
    this.userDataService.getWishlist().subscribe({
      next: (wish) => {
        this.wishlist = wish as SavedGame[];
      }
    });
  }

  private checkLoadingComplete(): void {
    this.isLoading = false;
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.messageSuccess = '';
    this.messageError = '';
    this.selectedFile = null;
    this.previewUrl = null;
    this.editPassword = ''; // Limpa o campo de password por segurança
  }

  // Captura o upload do ficheiro de imagem
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Cria um preview local da imagem antes de enviar para o backend
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // Submete todas as alterações do perfil
  saveProfile(): void {
    this.messageSuccess = '';
    this.messageError = '';

    // 1. Se houver um novo ficheiro de imagem selecionado, faz upload primeiro
    if (this.selectedFile) {
      this.authService.uploadAvatar(this.selectedFile).subscribe({
        next: (res) => {
          this.avatarUrl = res.avatarUrl;
          this.selectedFile = null;
          this.previewUrl = null;
          this.updateTextData(); // Depois atualiza os dados textuais
        },
        error: (err) => {
          this.messageError = err.error?.error || 'Erro ao carregar a imagem de perfil.';
        }
      });
    } else {
      this.updateTextData();
    }
  }

  private updateTextData(): void {
    const updateData: { username?: string; email?: string; password?: string } = {
      username: this.editUsername,
      email: this.editEmail
    };

    if (this.editPassword.trim()) {
      updateData.password = this.editPassword;
    }

    this.authService.updateProfile(updateData).subscribe({
      next: (res) => {
        this.messageSuccess = 'Perfil atualizado com sucesso!';
        this.username = res.username;
        this.email = this.editUsername;
        this.isEditing = false;
        this.editPassword = '';
      },
      error: (err) => {
        this.messageError = err.error?.error || 'Erro ao atualizar os dados do perfil.';
      }
    });
  }

  goToGame(id: number): void {
    this.router.navigate(['/games', id]);
  }
}
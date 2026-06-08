import { Component, inject, OnInit, ElementRef, ViewChild } from '@angular/core';
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
  @ViewChild('cropCanvas') cropCanvasRef!: ElementRef<HTMLCanvasElement>;

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

  // Modal de crop
  showCropModal = false;
  cropImageSrc = '';
  cropScale = 1;
  cropOffsetX = 0;
  cropOffsetY = 0;
  isDragging = false;
  dragStartX = 0;
  dragStartY = 0;
  dragStartOffsetX = 0;
  dragStartOffsetY = 0;
  private originalFile: File | null = null;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  toastVisible = false;

  starsArray = [1, 2, 3, 4, 5];

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
    this.userDataService.getFavorites().subscribe({ next: (favs) => { this.favorites = favs as SavedGame[]; } });
    this.userDataService.getWishlist().subscribe({ next: (wish) => { this.wishlist = wish as SavedGame[]; } });
    this.userDataService.getReviews().subscribe({
      next: (revs) => { this.reviews = revs as UserReview[]; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.editUsername = this.username ?? '';
  }

  // Abrir modal de crop ao selecionar ficheiro
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.originalFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.cropImageSrc = reader.result as string;
        this.cropScale = 1;
        this.cropOffsetX = 0;
        this.cropOffsetY = 0;
        this.showCropModal = true;
      };
      reader.readAsDataURL(this.originalFile);
    }
  }

  // Drag dentro do modal
  onCropDragStart(event: MouseEvent): void {
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragStartOffsetX = this.cropOffsetX;
    this.dragStartOffsetY = this.cropOffsetY;
    event.preventDefault();
  }

  onCropDragMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.cropOffsetX = this.dragStartOffsetX + (event.clientX - this.dragStartX);
    this.cropOffsetY = this.dragStartOffsetY + (event.clientY - this.dragStartY);
  }

  onCropDragEnd(): void {
    this.isDragging = false;
  }

  closeCropModal(): void {
    this.showCropModal = false;
    this.originalFile = null;
    this.cropImageSrc = '';
  }

  // Confirmar crop e fazer upload
  confirmCrop(): void {
    const canvas = document.createElement('canvas');
    const outputSize = 300;
    const viewportSize = 220; // tamanho do viewport no CSS

    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.clip();

      // A imagem no viewport é renderizada com object-fit: cover a 220px
      // Calculamos a escala base para cobrir o viewport
      const scaleToFit = Math.max(viewportSize / img.width, viewportSize / img.height);
      const baseW = img.width * scaleToFit;
      const baseH = img.height * scaleToFit;

      // Aplicar o zoom do utilizador
      const scaledW = baseW * this.cropScale;
      const scaledH = baseH * this.cropScale;

      // Offset base para centrar + offset do drag, escalado para o canvas de output
      const ratio = outputSize / viewportSize;
      const centerX = (outputSize - scaledW * ratio) / 2 + this.cropOffsetX * ratio;
      const centerY = (outputSize - scaledH * ratio) / 2 + this.cropOffsetY * ratio;

      ctx.drawImage(img, centerX, centerY, scaledW * ratio, scaledH * ratio);
      ctx.restore();

      canvas.toBlob((blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        this.showCropModal = false;
        this.uploadAvatar(croppedFile);
      }, 'image/jpeg', 0.92);
    };
    img.src = this.cropImageSrc;
  }

  private uploadAvatar(file: File): void {
    this.authService.uploadAvatar(file).subscribe({
      next: () => {
        this.showToast('Foto atualizada com sucesso!', 'success');
      },
      error: (err) => {
        this.showToast(err.error?.error || 'Erro ao carregar a imagem.', 'error');
      }
    });
  }

  saveProfile(): void {
    this.saveUsername();
  }

  private saveUsername(): void {
    this.authService.updateProfile({ username: this.editUsername }).subscribe({
      next: (res) => {
        this.username = res.username;
        this.isEditing = false;
        this.showToast('Perfil atualizado com sucesso!', 'success');
      },
      error: (err) => {
        this.showToast(err.error?.error || 'Erro ao atualizar o perfil.', 'error');
      }
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    setTimeout(() => { this.toastVisible = false; }, 5000);
  }

  goToGame(id: number): void {
    this.router.navigate(['/games', id]);
  }
}
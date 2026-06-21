/**
 * features/profile/profile.component.ts
 * --------------------------------------------------------------------------
 * Componente da página de perfil do utilizador. Mostra os dados da conta
 * (username, avatar), os favoritos, a wishlist e as reviews feitas pelo
 * utilizador. Permite editar o username, e fazer upload de um novo avatar
 * com um modal de recorte/crop circular (drag + zoom) que gera a imagem
 * final num <canvas> antes de a enviar para o backend. Usa um sistema de
 * toast (notificação temporária) para feedback de sucesso/erro.
 * --------------------------------------------------------------------------
 */
import { Component, inject, OnInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserDataService } from '../../core/services/user-data.service';
import { environment } from '../../../environments/environment';

interface SavedGame {
  gameId: number;
  gameName: string;
  gameImage: string;
  gameRating?: number;
}

interface UserReview {
  gameId: number;
  gameName: string;
  rating: number;
  comment: string;
  username?: string;
  avatar_url?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  // Referência ao <canvas> do template, usado para gerar a imagem final recortada
  @ViewChild('cropCanvas') cropCanvasRef!: ElementRef<HTMLCanvasElement>;

  private router = inject(Router);
  private authService = inject(AuthService);
  private userDataService = inject(UserDataService);
  private ngZone = inject(NgZone);

  username: string | null = null;
  avatarUrl: string | null = null;
  favorites: SavedGame[] = [];
  wishlist: SavedGame[] = [];
  reviews: UserReview[] = [];
  isLoading = true;

  isEditing = false;
  editUsername = '';

  // Estado do modal de crop (recorte de avatar)
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

  // Estado do toast (notificação temporária de sucesso/erro)
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  toastVisible = false;

  // Usado no template para desenhar as 5 estrelas de rating
  starsArray = [1, 2, 3, 4, 5];

  baseUrl = environment.baseUrl + '/';

  // Subscreve username/avatar do AuthService e carrega os dados do perfil
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

  // Carrega favoritos, wishlist e reviews do utilizador em paralelo
  loadProfileData(): void {
    this.isLoading = true;
    this.userDataService.getFavorites().subscribe({ next: (favs) => { this.favorites = favs as unknown as SavedGame[]; } });
    this.userDataService.getWishlist().subscribe({ next: (wish) => { this.wishlist = wish as unknown as SavedGame[]; } });
    this.userDataService.getReviews().subscribe({
      next: (revs) => { this.reviews = revs as unknown as UserReview[]; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  // Ativa/desativa o modo de edição do username
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
        // Mostra a imagem escolhida no modal e reinicia zoom/posição
        this.cropImageSrc = reader.result as string;
        this.cropScale = 1;
        this.cropOffsetX = 0;
        this.cropOffsetY = 0;
        this.showCropModal = true;
      };
      reader.readAsDataURL(this.originalFile);
    }
  }

  // Drag dentro do modal — início: guarda a posição inicial do rato e do offset atual
  onCropDragStart(event: MouseEvent): void {
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragStartOffsetX = this.cropOffsetX;
    this.dragStartOffsetY = this.cropOffsetY;
    event.preventDefault();
  }

  // Drag dentro do modal — movimento: atualiza o offset da imagem conforme o rato se move
  onCropDragMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.cropOffsetX = this.dragStartOffsetX + (event.clientX - this.dragStartX);
    this.cropOffsetY = this.dragStartOffsetY + (event.clientY - this.dragStartY);
  }

  // Drag dentro do modal — fim: termina o arrasto
  onCropDragEnd(): void {
    this.isDragging = false;
  }

  // Fecha o modal de crop sem guardar alterações
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
      // Recorta num círculo (clip), aplicando o mesmo zoom/offset usados na pré-visualização
      ctx.save();
      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.clip();

      // Calcula a escala base para a imagem cobrir totalmente o viewport (cover)
      const scaleToFit = Math.max(viewportSize / img.width, viewportSize / img.height);
      const baseW = img.width * scaleToFit;
      const baseH = img.height * scaleToFit;

      // Aplica o zoom extra escolhido pelo utilizador (cropScale)
      const scaledW = baseW * this.cropScale;
      const scaledH = baseH * this.cropScale;

      // Converte as coordenadas do viewport (CSS) para as coordenadas do canvas final
      const ratio = outputSize / viewportSize;
      const centerX = (outputSize - scaledW * ratio) / 2 + this.cropOffsetX * ratio;
      const centerY = (outputSize - scaledH * ratio) / 2 + this.cropOffsetY * ratio;

      ctx.drawImage(img, centerX, centerY, scaledW * ratio, scaledH * ratio);
      ctx.restore();

      // Converte o canvas para um ficheiro JPEG e envia-o para upload
      canvas.toBlob((blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        // Entra de novo na NgZone, já que o onload/toBlob corre fora da deteção de mudanças do Angular
        this.ngZone.run(() => {
          this.showCropModal = false;
          this.uploadAvatar(croppedFile);
        });
      }, 'image/jpeg', 0.92);
    };
    img.src = this.cropImageSrc;
  }

  // Envia o ficheiro de avatar já recortado para o backend
  private uploadAvatar(file: File): void {
    this.authService.uploadAvatar(file).subscribe({
      next: () => {
        this.showToast('Foto atualizada com sucesso!', 'success');
      },
      error: (err) => {
        this.showToast(err.error?.message || err.error?.error || 'Erro ao carregar a imagem.', 'error');
      }
    });
  }

  // Guarda as alterações do perfil (atualmente só o username)
  saveProfile(): void {
    this.saveUsername();
  }

  // Atualiza o username via AuthService, validando que não está vazio
  private saveUsername(): void {
    if (!this.editUsername || this.editUsername.trim() === '') return;

    this.authService.updateProfile({ username: this.editUsername }).subscribe({
      next: () => {
        this.isEditing = false;
        this.showToast('Perfil atualizado com sucesso!', 'success');
      },
      error: (err) => {
        this.showToast(err.error?.message || err.error?.error || 'Erro ao atualizar o perfil.', 'error');
      }
    });
  }

  // Mostra uma notificação temporária (toast) que desaparece sozinha após 5 segundos
  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    setTimeout(() => { this.toastVisible = false; }, 5000);
  }

  // Navega para o detalhe de um jogo (a partir dos favoritos/wishlist/reviews listados)
  goToGame(id: number): void {
    this.router.navigate(['/games', id]);
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

// 1. CORREÇÃO: Nomes exatos que o backend espera (camelCase)
export interface Game {
  gameId: number;
  gameName: string;
  gameImage: string;
  gameRating?: number; // Opcional
}

export interface Review {
  gameId: number;
  gameName?: string; // <-- ADICIONA ESTA LINHA
  rating: number;
  comment: string;
  username?: string;
  avatar_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3000/api';

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  // ==========================================
  // PERFIL
  // ==========================================
  updateProfile(formData: FormData): Observable<unknown> { // <-- Alterado de any para unknown
    // O FormData já leva o formato de ficheiro que o multer precisa,
    // só precisamos de adicionar o nosso Token de segurança!
    return this.http.put(`${this.apiUrl}/profile`, formData, { headers: this.getHeaders() });
  }

  // ==========================================
  // FAVORITOS
  // ==========================================
  getFavorites(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/favorites`, { headers: this.getHeaders() });
  }

  addFavorite(game: Game): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/favorites`, game, { headers: this.getHeaders() });
  }

  removeFavorite(gameId: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/favorites/${gameId}`, { headers: this.getHeaders() });
  }

  // ==========================================
  // WISHLIST
  // ==========================================
  getWishlist(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/wishlist`, { headers: this.getHeaders() });
  }

  addToWishlist(game: Game): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/wishlist`, game, { headers: this.getHeaders() });
  }

  removeFromWishlist(gameId: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/wishlist/${gameId}`, { headers: this.getHeaders() });
  }

  // ==========================================
  // REVIEWS
  // ==========================================
  
  // 1. (ADICIONAR) Ir buscar as reviews do utilizador para mostrar no Perfil
  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews`, { headers: this.getHeaders() });
  }

  // 2. O URL correto do backend para buscar reviews de um jogo
  getGameReviews(gameId: number): Observable<Review[]> { 
    return this.http.get<Review[]>(`${this.apiUrl}/reviews/${gameId}`, { headers: this.getHeaders() }); 
  }

  addReview(review: Review): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/reviews`, review, { headers: this.getHeaders() });
  }
}
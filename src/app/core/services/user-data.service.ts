/**
 * core/services/user-data.service.ts
 * --------------------------------------------------------------------------
 * Service responsável pelos dados pessoais do utilizador guardados no
 * NOSSO backend (não no RAWG): favoritos, wishlist e reviews, além da
 * atualização de perfil via FormData. Cada pedido é autenticado com o
 * token JWT obtido através do AuthService.
 * --------------------------------------------------------------------------
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

// 1. CORREÇÃO: Nomes exatos que o backend espera (camelCase)
export interface Game {
  gameId: number;
  gameName: string;
  gameImage: string;
  gameRating?: number; // Opcional
}

export interface Review {
  gameId: number;
  gameName?: string;
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
  private apiUrl = environment.apiUrl;

  // Monta o cabeçalho de autorização com o token atual do utilizador logado
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  // ==========================================
  // PERFIL
  // ==========================================
  // Atualiza o perfil (username e/ou avatar) usando FormData (suporta upload de ficheiro)
  updateProfile(formData: FormData): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/profile`, formData, { headers: this.getHeaders() });
  }

  // ==========================================
  // FAVORITOS
  // ==========================================
  // Lista os jogos favoritos do utilizador logado
  getFavorites(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/favorites`, { headers: this.getHeaders() });
  }

  // Adiciona um jogo aos favoritos
  addFavorite(game: Game): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/favorites`, game, { headers: this.getHeaders() });
  }

  // Remove um jogo dos favoritos, pelo seu gameId
  removeFavorite(gameId: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/favorites/${gameId}`, { headers: this.getHeaders() });
  }

  // ==========================================
  // WISHLIST
  // ==========================================
  // Lista os jogos na wishlist do utilizador logado
  getWishlist(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/wishlist`, { headers: this.getHeaders() });
  }

  // Adiciona um jogo à wishlist
  addToWishlist(game: Game): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/wishlist`, game, { headers: this.getHeaders() });
  }

  // Remove um jogo da wishlist, pelo seu gameId
  removeFromWishlist(gameId: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/wishlist/${gameId}`, { headers: this.getHeaders() });
  }

  // ==========================================
  // REVIEWS
  // ==========================================
  // Lista as reviews feitas pelo próprio utilizador logado (usado na página de Perfil)
  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews`, { headers: this.getHeaders() });
  }

  // Lista as reviews públicas de um jogo específico (usado na página de Detalhe)
  getGameReviews(gameId: number): Observable<Review[]> { 
    return this.http.get<Review[]>(`${this.apiUrl}/reviews/${gameId}`, { headers: this.getHeaders() }); 
  }

  // Cria uma nova review para um jogo
  addReview(review: Review): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/reviews`, review, { headers: this.getHeaders() });
  }
}
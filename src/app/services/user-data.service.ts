import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

interface Game {
  game_id: number;
  game_name: string;
  game_image: string;
  game_rating: number;
}

interface Review {
  game_id: number;
  game_name: string;
  rating: number;
  comment: string;
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

  // Favoritos
  getFavorites(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/favorites`, { headers: this.getHeaders() });
  }

  addFavorite(game: Game): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/favorites`, game, { headers: this.getHeaders() });
  }

  removeFavorite(gameId: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/favorites/${gameId}`, { headers: this.getHeaders() });
  }

  // Wishlist
  getWishlist(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/wishlist`, { headers: this.getHeaders() });
  }

  addToWishlist(game: Game): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/wishlist`, game, { headers: this.getHeaders() });
  }

  removeFromWishlist(gameId: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/wishlist/${gameId}`, { headers: this.getHeaders() });
  }

  // Reviews
  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews`, { headers: this.getHeaders() });
  }

  getGameReviews(gameId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews/game/${gameId}`, { headers: this.getHeaders() });
  }

  addReview(review: Review): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/reviews`, review, { headers: this.getHeaders() });
  }

  removeReview(gameId: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/reviews/${gameId}`, { headers: this.getHeaders() });
  }
}
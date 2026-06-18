import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RawgService {
  private http = inject(HttpClient);
  private apiKey = '25a159d8a2ed4f7faffbe7a8bf3b4572';
  private baseUrl = 'https://api.rawg.io/api';

  getGames(page = 1, search = '', genreId = '', platformId = '', ordering = ''): Observable<unknown> {
  let url = `${this.baseUrl}/games?key=${this.apiKey}&page=${page}&page_size=20`;
  if (search) url += `&search=${search}`;
  if (genreId) url += `&genres=${genreId}`;
  if (platformId) url += `&platforms=${platformId}`;
  if (ordering) url += `&ordering=${ordering}`;
  return this.http.get(url);
}

  getGameById(id: number): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/games/${id}?key=${this.apiKey}`);
  }

  getGenres(): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/genres?key=${this.apiKey}`);
  }

  getPlatforms(): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/platforms?key=${this.apiKey}&page_size=20`);
  }

  getGameScreenshots(id: number): Observable<unknown> {
  return this.http.get(`${this.baseUrl}/games/${id}/screenshots?key=${this.apiKey}`);
}

getSimilarGames(id: number): Observable<unknown> {
  return this.http.get(`${this.baseUrl}/games/${id}/game-series?key=${this.apiKey}`);
}
}
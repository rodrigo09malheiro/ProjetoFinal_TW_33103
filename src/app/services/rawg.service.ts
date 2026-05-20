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

  getGames(page = 1, search = ''): Observable<unknown> {
    let url = `${this.baseUrl}/games?key=${this.apiKey}&page=${page}&page_size=20`;
    if (search) {
      url += `&search=${search}`;
    }
    return this.http.get(url);
  }

  getGameById(id: number): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/games/${id}?key=${this.apiKey}`);
  }
}
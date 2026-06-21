/**
 * core/services/rawg.service.ts
 * --------------------------------------------------------------------------
 * Service responsável por toda a comunicação com a API externa RAWG
 * (catálogo de jogos). Centraliza a apiKey e o baseUrl, e expõe métodos
 * para listar jogos (com pesquisa/filtros/paginação), obter detalhes de
 * um jogo, géneros, plataformas, screenshots e jogos semelhantes.
 * --------------------------------------------------------------------------
 */
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

  // Lista jogos com suporte a paginação, pesquisa por nome, filtro por género/plataforma e ordenação
  getGames(page = 1, search = '', genreId = '', platformId = '', ordering = ''): Observable<unknown> {
  let url = `${this.baseUrl}/games?key=${this.apiKey}&page=${page}&page_size=20`;
  if (search) url += `&search=${search}`;
  if (genreId) url += `&genres=${genreId}`;
  if (platformId) url += `&platforms=${platformId}`;
  if (ordering) url += `&ordering=${ordering}`;
  return this.http.get(url);
}

  // Obtém os detalhes completos de um jogo específico, pelo seu ID
  getGameById(id: number): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/games/${id}?key=${this.apiKey}`);
  }

  // Lista todos os géneros disponíveis (usado nos filtros da listagem)
  getGenres(): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/genres?key=${this.apiKey}`);
  }

  // Lista as plataformas disponíveis (usado nos filtros da listagem)
  getPlatforms(): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/platforms?key=${this.apiKey}&page_size=20`);
  }

  // Obtém as screenshots de um jogo (galeria na página de detalhe)
  getGameScreenshots(id: number): Observable<unknown> {
  return this.http.get(`${this.baseUrl}/games/${id}/screenshots?key=${this.apiKey}`);
}

// Obtém jogos da mesma série/saga (secção "jogos semelhantes")
getSimilarGames(id: number): Observable<unknown> {
  return this.http.get(`${this.baseUrl}/games/${id}/game-series?key=${this.apiKey}`);
}
}
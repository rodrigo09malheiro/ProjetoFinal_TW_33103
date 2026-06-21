/**
 * features/game-list/game-list.component.ts
 * --------------------------------------------------------------------------
 * Componente da página de listagem de jogos. Vai buscar a lista de jogos
 * ao RawgService com suporte a pesquisa por nome, filtros (género e
 * plataforma), ordenação e paginação (incluindo "saltar" diretamente para
 * uma página). Também carrega as listas de géneros e plataformas
 * disponíveis, usadas para popular os filtros no template.
 * --------------------------------------------------------------------------
 */
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RawgService } from '../../core/services/rawg.service';

interface Game {
  id: number;
  name: string;
  background_image: string;
  rating: number;
  released: string;
}

interface FilterOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-list.component.html',
  styleUrl: './game-list.component.css'
})
export class GameListComponent implements OnInit {
  private rawgService = inject(RawgService);
  private router = inject(Router);

  games: Game[] = [];
  searchQuery = '';
  currentPage = 1;
  totalPages = 1;
  jumpToPage = 1;
  isLoading = false;
  pageSize = 20;
  skeletons = Array(20).fill(0); // usado no template para mostrar placeholders enquanto carrega

  genres: FilterOption[] = [];
  platforms: FilterOption[] = [];
  selectedGenre = '';
  selectedPlatform = '';
  ordering = '';

  // Ao iniciar, carrega a primeira página de jogos e as opções de filtro
  ngOnInit(): void {
    this.loadGames();
    this.loadGenres();
    this.loadPlatforms();
  }

  // Vai buscar os jogos da página atual, aplicando pesquisa/filtros/ordenação
  loadGames(): void {
    this.isLoading = true;
    this.rawgService.getGames(this.currentPage, this.searchQuery, this.selectedGenre, this.selectedPlatform, this.ordering).subscribe({
      next: (data: unknown) => {
        const response = data as { results: Game[], count: number };
        this.games = response.results;
        this.totalPages = Math.ceil(response.count / this.pageSize);
        this.jumpToPage = this.currentPage;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  // Carrega a lista de géneros disponíveis (popula o filtro de género)
  loadGenres(): void {
    this.rawgService.getGenres().subscribe({
      next: (data: unknown) => {
        const response = data as { results: FilterOption[] };
        this.genres = response.results;
      }
    });
  }

  // Carrega a lista de plataformas disponíveis (popula o filtro de plataforma)
  loadPlatforms(): void {
    this.rawgService.getPlatforms().subscribe({
      next: (data: unknown) => {
        const response = data as { results: FilterOption[] };
        this.platforms = response.results;
      }
    });
  }

  // Reinicia a paginação e refaz a pesquisa quando o utilizador pesquisa por nome
  onSearch(): void {
    this.currentPage = 1;
    this.loadGames();
  }

  // Remove todos os filtros/pesquisa/ordenação e volta à primeira página
  clearFilters(): void {
    this.selectedGenre = '';
    this.selectedPlatform = '';
    this.ordering = '';
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadGames();
  }

  // Navega para a página de detalhe do jogo selecionado
  goToDetail(id: number): void {
    this.router.navigate(['/games', id]);
  }

  // Avança para a página seguinte, se existir
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadGames();
    }
  }

  // Recua para a página anterior, se existir
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadGames();
    }
  }

  // Salta diretamente para a página indicada pelo utilizador (com validação de limites)
  onJumpToPage(): void {
    const page = Number(this.jumpToPage);
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadGames();
    } else {
      this.jumpToPage = this.currentPage;
    }
  }
}
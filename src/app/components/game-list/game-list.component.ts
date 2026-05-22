import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RawgService } from '../../services/rawg.service';

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
  skeletons = Array(20).fill(0);

  genres: FilterOption[] = [];
  platforms: FilterOption[] = [];
  selectedGenre = '';
  selectedPlatform = '';
  ordering = '';

  ngOnInit(): void {
    this.loadGames();
    this.loadGenres();
    this.loadPlatforms();
  }

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

  loadGenres(): void {
    this.rawgService.getGenres().subscribe({
      next: (data: unknown) => {
        const response = data as { results: FilterOption[] };
        this.genres = response.results;
      }
    });
  }

  loadPlatforms(): void {
    this.rawgService.getPlatforms().subscribe({
      next: (data: unknown) => {
        const response = data as { results: FilterOption[] };
        this.platforms = response.results;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadGames();
  }

  clearFilters(): void {
    this.selectedGenre = '';
    this.selectedPlatform = '';
    this.ordering = '';
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadGames();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/games', id]);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadGames();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadGames();
    }
  }

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
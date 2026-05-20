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
  isLoading = false;

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.isLoading = true;
    this.rawgService.getGames(this.currentPage, this.searchQuery).subscribe({
      next: (data: unknown) => {
        const response = data as { results: Game[] };
        this.games = response.results;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadGames();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/games', id]);
  }

  nextPage(): void {
    this.currentPage++;
    this.loadGames();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadGames();
    }
  }
}
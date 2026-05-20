import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RawgService } from '../../services/rawg.service';

interface GameDetail {
  id: number;
  name: string;
  background_image: string;
  rating: number;
  released: string;
  description_raw: string;
  genres: { name: string }[];
  platforms: { platform: { name: string } }[];
}

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-detail.component.html',
  styleUrl: './game-detail.component.css'
})
export class GameDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private rawgService = inject(RawgService);

  game: GameDetail | null = null;
  isLoading = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.isLoading = true;
    this.rawgService.getGameById(id).subscribe({
      next: (data: unknown) => {
        this.game = data as GameDetail;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/games']);
  }
}
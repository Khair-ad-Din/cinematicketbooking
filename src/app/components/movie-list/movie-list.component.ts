import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgOptimizedImage, RouterLink],
})
export class MovieListComponent {
  private movieService = inject(MovieService); // Inject the service

  movies = this.movieService.movies; // Access the movies signal
  loading = this.movieService.loading; // Acces loading signal from service

  constructor() {
    this.movieService.fetchMovies(); // Fetch movies when the component is initialized
  }
}

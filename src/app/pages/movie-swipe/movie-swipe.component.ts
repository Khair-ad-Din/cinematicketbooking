import { MovieService } from './../../services/movie.service';
import { CommonModule } from '@angular/common';
import { MovieSwipeCardComponent } from '../../components/movie-swipe-card/movie-swipe-card.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';

@Component({
  selector: 'app-movie-swipe',
  templateUrl: './movie-swipe.component.html',
  styleUrl: './movie-swipe.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MovieSwipeCardComponent],
})
export class MovieSwipeComponent {
  private MovieService = inject(MovieService);

  movies = this.MovieService.movies;
  loading = this.MovieService.loading;

  currentMovieIndex = 0;
  currentMovie = computed(() => {
    const movieList = this.movies();
    return movieList[this.currentMovieIndex] || null;
  });

  constructor() {
    this.MovieService.fetchMovies();
  }
}

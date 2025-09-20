import { MovieService } from './../../services/movie.service';
import { CommonModule } from '@angular/common';
import { MovieSwipeCardComponent } from '../../components/movie-swipe-card/movie-swipe-card.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
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

  currentMovieIndex = signal<number>(0);
  currentMovie = computed(() => {
    const movieList = this.movies();
    const index = this.currentMovieIndex();
    return movieList[index] || null;
  });

  nextMovie() {
    const MovieList = this.movies();
    const currentIndex = this.currentMovieIndex();

    if (currentIndex < MovieList.length - 1) {
      this.currentMovieIndex.set(currentIndex + 1);
    } else {
      this.currentMovieIndex.set(0);
    }
  }

  // Handle swipe completion from child
  onMovieRated(rating: string) {
    console.log('Movie rated: ', rating);
    this.nextMovie();
  }

  constructor() {
    this.MovieService.fetchMovies();
  }
}

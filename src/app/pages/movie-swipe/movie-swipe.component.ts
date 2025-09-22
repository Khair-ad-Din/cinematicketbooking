import { UserPreferencesService } from './../../services/user-preferences.service';
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
  private preferencesService = inject(UserPreferencesService);

  movies = this.MovieService.movies;
  loading = this.MovieService.loading;

  undoAvailable = this.preferencesService.undoAvailable;
  private lastMovieIndex = signal<number>(-1);

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
    const currentMovie = this.currentMovie();
    if (currentMovie) {
      // Store current index before moving to next movie
      this.lastMovieIndex.set(this.currentMovieIndex());
      // Save the preference
      this.preferencesService.addPreference(currentMovie, rating);

      // Show saved preferences (for testing)
      console.log(
        'All preferences: ',
        this.preferencesService.getUserPreferences().preferences
      );
    }
    this.nextMovie();
  }

  undoLastSwipe() {
    const undoneAction = this.preferencesService.undoLastAction();
    if (undoneAction && this.lastMovieIndex() >= 0) {
      // Go back to the preious movie
      this.currentMovieIndex.set(this.lastMovieIndex());
      this.lastMovieIndex.set(-1);
    }
  }

  constructor() {
    this.MovieService.fetchMovies();
  }
}

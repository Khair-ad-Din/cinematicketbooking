import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { RouterLink } from '@angular/router';
import { generate } from 'rxjs';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgOptimizedImage, RouterLink],
})
export class MovieListComponent {
  private movieService = inject(MovieService); // Inject the service

  searchTerm = signal<string>('');
  selectedGenres = signal<string[]>([]);
  minRating = signal<number>(0);

  // Signal Imports
  movies = this.movieService.movies; // Access the movies signal
  loading = this.movieService.loading; // Acces loading signal from service

  filteredMovies = computed(() => {
    const searchTerm = this.searchTerm();
    const selectedGenres = this.selectedGenres();
    const minRating = this.minRating();
    const allMovies = this.movies();

    return allMovies.filter((movie) => {
      const matchesSearchTerm = searchTerm
        ? movie.title.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchesSelectedGenres =
        selectedGenres.length > 0
          ? selectedGenres.every((selectedGenre) =>
              movie.genre.includes(selectedGenre)
            )
          : true;
      const matchesRating = minRating ? movie.rating >= minRating : true;

      return matchesSearchTerm && matchesSelectedGenres && matchesRating;
    });
  });

  uniqueGenres = computed(() => {
    const allGenres = this.movies().flatMap((movie) => movie.genre);
    return [...new Set(allGenres)];
  });

  constructor() {
    this.movieService.fetchMovies(); // Fetch movies when the component is initialized
  }

  onSearchTermChange($event: Event) {
    const searched_movie = ($event.target as HTMLInputElement).value;
    this.searchTerm.set(searched_movie);
  }

  onGenreCheckboxChange(genre: string, isChecked: boolean) {
    if (isChecked) {
      this.selectedGenres.update((prevGenres) => [...prevGenres, genre]);
    } else {
      this.selectedGenres.update((prevGenres) =>
        prevGenres.filter((prevGenre) => prevGenre !== genre)
      );
    }
  }

  onRatingChange($event: Event) {
    const rating = Number(($event.target as HTMLInputElement).value);
    this.minRating.set(rating);
  }
}

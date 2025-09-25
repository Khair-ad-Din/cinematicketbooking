import { MovieService } from './../../services/movie.service';
import { Movie } from './../../interfaces/movie';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { UserPreferencesService } from '../../services/user-preferences.service';

interface DashboardMovie {
  // From preferences
  movieId: number;
  title: string;
  rating: string;
  timestamp: Date;
  statusBadge: string;

  director?: string;
  cast?: string[];

  // From TMDB
  tmdbData?: {
    poster_path?: string;
    backdrop_path?: string;
    genre_ids: number[];
    genres?: string[];
    vote_average: number;
    release_date: string;
    overview: string; // Description
  };
}

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class UserDashboardComponent {
  private preferencesService = inject(UserPreferencesService);
  private movieService = inject(MovieService);

  userPreferences = computed(() =>
    this.preferencesService.getUserPreferences()
  );
  public userMoviesWithTMDB = signal<DashboardMovie[]>([]);

  // Filter signals (matching movie-list pattern)
  searchTerm = signal<string>('');
  selectedGenres = signal<string[]>([]);
  minRating = signal<number>(0);
  selectedStatuses = signal<string[]>([]);
  viewMode = signal<'grid' | 'list'>('grid');

  // Available filter options computed from movies
  public availableGenres = computed(() => {
    const movies = this.userMoviesWithTMDB();
    const genreSet = new Set<string>();
    movies.forEach((movie) => {
      movie.tmdbData?.genres?.forEach((genre) => genreSet.add(genre));
    });
    return Array.from(genreSet).sort();
  });

  // Status options for filter
  statusOptions = [
    { value: 'seen-liked', label: 'Seen & Liked' },
    { value: 'not-seen-liked', label: 'Want to Watch' },
    { value: 'disliked', label: 'Not Liked' },
    { value: 'skip', label: 'Skipped' },
  ];

  // Filtered movies (matching movie-list pattern)
  public filteredMovies = computed(() => {
    const searchTerm = this.searchTerm();
    const selectedGenres = this.selectedGenres();
    const minRating = this.minRating();
    const selectedStatuses = this.selectedStatuses();
    const allMovies = this.userMoviesWithTMDB();

    return allMovies.filter((movie) => {
      // Search term filter
      const matchesSearchTerm = searchTerm
        ? movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movie.director?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movie.cast?.some((actor) =>
            actor.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : true;

      // Genre filter (must match all selected genres)
      const matchesSelectedGenres =
        selectedGenres.length > 0
          ? selectedGenres.every((selectedGenre) =>
              movie.tmdbData?.genres?.includes(selectedGenre)
            )
          : true;

      // Rating filter (minimum rating)
      const matchesRating =
        minRating > 0 ? (movie.tmdbData?.vote_average ?? 0) >= minRating : true;

      // Status filter (match any selected status)
      const matchesSelectedStatuses =
        selectedStatuses.length > 0
          ? selectedStatuses.includes(movie.rating)
          : true;

      return (
        matchesSearchTerm &&
        matchesSelectedGenres &&
        matchesRating &&
        matchesSelectedStatuses
      );
    });
  });

  // Add constructor to fetch TMDB data when preferences change
  constructor() {
    effect(() => {
      const preferences = this.userPreferences().preferences;
      if (preferences.length === 0) {
        this.userMoviesWithTMDB.set([]);
        return;
      }

      // Fetch movie data for all movies
      const moviesWithDetails = preferences.map((pref) => {
        const movieDetails = this.movieService.getMovieById(pref.movieId);
        return {
          movieId: pref.movieId,
          title: pref.title,
          rating: pref.rating,
          timestamp: pref.timestamp,
          statusBadge: this.getStatusBadge(pref.rating),
          director: movieDetails?.director,
          cast: movieDetails?.cast,
          tmdbData: movieDetails
            ? {
                poster_path: movieDetails.posterUrl,
                genre_ids: [], // We'll map from movieDetails.genre
                genres: movieDetails.genre,
                vote_average: movieDetails.rating,
                release_date: movieDetails.releaseDate.toISOString(),
                overview: movieDetails.description,
              }
            : undefined,
        } as DashboardMovie;
      });

      this.userMoviesWithTMDB.set(moviesWithDetails);
    });
  }

  removeMovie(movie: DashboardMovie) {
    if (
      confirm(
        `Are you sure you want to remove "${movie.title}" from your collection?`
      )
    ) {
      this.preferencesService.removePreference(movie.movieId, movie.timestamp);
    }
  }

  private getStatusBadge(rating: string): string {
    switch (rating) {
      case 'seen-liked':
        return 'Seen & Liked';
      case 'not-seen-liked':
        return 'Want to Watch';
      case 'disliked':
        return 'Not Liked';
      case 'skip':
        return 'Skipped';
      default:
        return rating;
    }
  }

  // Filter event handlers (matching movie-list pattern)
  onSearchTermChange($event: Event) {
    const searchedMovie = ($event.target as HTMLInputElement).value;
    this.searchTerm.set(searchedMovie);
  }

  onGenreCheckboxChange(genre: string, $event: Event) {
    const isChecked = ($event.target as HTMLInputElement).checked;
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

  onStatusCheckboxChange(status: string, $event: Event) {
    const isChecked = ($event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedStatuses.update((prevStatuses) => [...prevStatuses, status]);
    } else {
      this.selectedStatuses.update((prevStatuses) =>
        prevStatuses.filter((prevStatus) => prevStatus !== status)
      );
    }
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedGenres.set([]);
    this.minRating.set(0);
    this.selectedStatuses.set([]);
  }

  toggleViewMode() {
    this.viewMode.set(this.viewMode() === 'grid' ? 'list' : 'grid');
  }
}

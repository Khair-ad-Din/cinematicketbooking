import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
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
export class MovieListComponent implements OnInit, AfterViewInit, OnDestroy {
  movieService = inject(MovieService); // Inject the service

  @ViewChild('scrollTrigger', { static: false }) scrollTrigger!: ElementRef;
  private observer!: IntersectionObserver;

  searchTerm = signal<string>('');
  selectedGenres = signal<string[]>([]);
  minRating = signal<number>(0);

  // Signal Imports
  movies = this.movieService.movies; // Access the movies signal
  loading = this.movieService.loading; // Acces loading signal from service

  showBackToTop = signal<boolean>(false);

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
  ngOnInit(): void {}

  ngAfterViewInit() {
    // Timeout needed for giving time to Angular for rendering scrollTrigger element before running ngAfterViewInit
    setTimeout(() => {
      this.setupInfiniteScroll();
      this.setupBackToTopButton();
    }, 100);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    window.removeEventListener('scroll', this.scrollHandler); // Clean up the scroll listener
  }

  onSearchTermChange($event: Event) {
    const searched_movie = ($event.target as HTMLInputElement).value;
    this.searchTerm.set(searched_movie);
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

  private setupInfiniteScroll() {
    // Watch for when user scrolls near the bottom trigger element
    this.observer = new IntersectionObserver(
      (entries) => {
        // When trigger comes into view AND we're not already loading more
        if (entries[0].isIntersecting && !this.movieService.loadingMore()) {
          // Tell service to fetch next page of movies
          this.movieService.loadMoreMovies();
        }
      },
      { threshold: 0.1 } // Trigger when 10% of element is visible
    );

    // Start watching the scroll trigger element at bottom of page
    if (this.scrollTrigger) {
      this.observer.observe(this.scrollTrigger.nativeElement);
    }
  }

  private scrollHandler = () => {
    // Show back-to-top button when user scrolled past aprox. first page
    this.showBackToTop.set(window.scrollY > window.innerHeight * 2);
  };

  private setupBackToTopButton() {
    // Listen for scroll events to show/hide back-to-top button
    window.addEventListener('scroll', this.scrollHandler);
  }

  scrollToTopAndCollapse() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    /* Delay needed as scroll animation and movie reset was happening simultaneously
     * and as scrool is smooth and reset is immediate, there was a visual-timing conflict.
     */
    setTimeout(() => {
      this.movieService.resetToFirstPage();
    }, 500);
  }
}

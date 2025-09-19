import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgOptimizedImage, RouterLink],
})
export class MovieDetailsComponent {
  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);
  private router = inject(Router);

  loading = this.movieService.loading;

  // Create a signal for the movie ID from the route params
  movieId = computed(() => Number(this.route.snapshot.paramMap.get('id')));

  // Create a computed signal for the selected movie
  movie = computed(() => {
    const id = this.movieId();
    return this.movieService.getMovieById(id);
  });

  // selectedShowtime = signal<string | null>(null);

  // onSelectShowtime(showtime: string) {
  //   this.selectedShowtime.set(showtime);
  //   console.log('Selected showtime: ', showtime);
  //   // TODO: Implement logic to proceed to seat selection in Phase 3
  // }

  // proceedToSeatSelection() {
  //   const movieId = this.movieId();
  //   const showtime = this.selectedShowtime();

  //   if (movieId && showtime) {
  //     this.router.navigate(['/movies', movieId, 'showtime', showtime]);
  //   } else {
  //     console.error('Cannot proceed: Movie ID or showtime not selected.');
  //   }
  // }
}

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-booking-confirmation',
  templateUrl: './booking-confirmation.component.html',
  styleUrl: './booking-confirmation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
})
export class BookingConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);

  bookingStatus = signal<'pending' | 'confirmed' | 'failed'>('pending');

  // Acces route parameters
  movieId = computed(() => this.route.snapshot.paramMap.get('movieId'));
  showtime = computed(() => this.route.snapshot.paramMap.get('showtime'));
  seatIdsString = computed(() => this.route.snapshot.paramMap.get('seatIds'));

  // Computed signal to get the movie details
  movie = computed(() => {
    const movieId = this.movieId();
    if (movieId) {
      return this.movieService.getMovieById(Number(movieId));
    }
    return undefined;
  });

  // Computed signal to get the selected seat Ids as an array
  selectedSeatIds = computed(() => {
    const seatIDsString = this.seatIdsString();
    if (seatIDsString) {
      return seatIDsString.split(',');
    }
    return [];
  });

  constructor() {
    // Log route parameters for verification
    console.log('Booking Confirmation - Movie ID:', this.movieId());
    console.log('Booking Confirmation - Showtime:', this.showtime());
    console.log(
      'Booking Confirmation - Seat IDs String:',
      this.seatIdsString()
    );
  }
  ngOnInit(): void {
    this.simulateBooking();
  }

  simulateBooking() {
    setTimeout(() => {
      this.bookingStatus.set('confirmed');
      console.log('Mock booking confirmed.');
    }, 2000);
  }
}

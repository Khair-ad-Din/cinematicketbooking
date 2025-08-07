import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { setThrowInvalidWriteToSignalError } from '@angular/core/primitives/signals';
import { ActivatedRoute, Router } from '@angular/router';

type SeatStatus = 'available' | 'selected' | 'booked';

interface Seat {
  id: string;
  status: SeatStatus;
}

@Component({
  selector: 'app-seat-selection',
  templateUrl: './seat-selection.component.html',
  styleUrl: './seat-selection.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class SeatSelectionComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  seatChart = signal<Seat[][]>([]);

  // Return an array of only the seats with status 'selected'
  selectedSeats = computed(() => {
    const selected: Seat[] = [];
    this.seatChart().forEach((row) => {
      row.forEach((seat) => {
        if (seat.status === 'selected') {
          selected.push(seat);
        }
      });
    });
    return selected;
  });

  selectedSeatIdsString = computed(() => {
    return this.selectedSeats()
      .map((seat) => seat.id)
      .join(',');
  });

  movieId = computed(() => Number(this.route.snapshot.paramMap.get('id')));
  showtime = computed(() => this.route.snapshot.paramMap.get('showtime'));

  constructor() {
    this.initializeSeatChart(5, 10);
    console.log(this.seatChart);

    // Log the route parameters (for testing)
    console.log('Movie ID from route:', this.movieId());
    console.log('Showtime from route:', this.showtime());
  }

  initializeSeatChart(rows: number, seatsPerRow: number) {
    const chart: Seat[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: Seat[] = [];
      for (let j = 0; j < seatsPerRow; j++) {
        // Generate seat ID like 'A1', 'A2', etc.
        // 65 means beginning of ASCII uppercase letters.
        const seatId = `${String.fromCharCode(65 + i)}${j + 1}`;
        row.push({ id: seatId, status: 'available' });
      }
      chart.push(row);
    }
    this.seatChart.set(chart);
  }

  // Method to handle seat selection
  onSelectSeat(seat: Seat) {
    if (seat.status === 'available') {
      this.seatChart.update((currentChart) => {
        return currentChart.map((row) =>
          row.map((currentSeat) =>
            currentSeat.id === seat.id
              ? { ...currentSeat, status: 'selected' }
              : currentSeat
          )
        );
      });
    } else if (seat.status === 'selected') {
      // If the seat is already selected, unselect it
      this.seatChart.update((currentChart) => {
        return currentChart.map((row) =>
          row.map((currentSeat) =>
            currentSeat.id === seat.id
              ? { ...currentSeat, status: 'available' }
              : currentSeat
          )
        );
      });
    }

    // Do nothing if the seat is booked
  }

  proceedToBooking() {
    const movieId = this.movieId();
    const showtime = this.showtime();
    const seatIds = this.selectedSeatIdsString();

    if (movieId && showtime && seatIds) {
      this.router.navigate([
        'booking-confirmation',
        movieId,
        showtime,
        seatIds,
      ]);
    } else {
      console.error(
        'Cannot proceed: Movie ID, showtime or selected seats missing'
      );
    }
  }
}

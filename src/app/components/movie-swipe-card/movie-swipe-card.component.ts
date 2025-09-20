import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
} from '@angular/core';
import { Movie } from '../../interfaces/movie';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-movie-swipe-card',
  templateUrl: './movie-swipe-card.component.html',
  styleUrl: './movie-swipe-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgOptimizedImage, RouterLink],
})
export class MovieSwipeCardComponent {
  @Input() movie!: Movie; //Receive movies from parent.

  isFlipped = signal<boolean>(false);

  flipCard() {
    this.isFlipped.update((current) => !current);
  }
}

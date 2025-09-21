import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
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
  @Output() movieRated = new EventEmitter<string>();

  isFlipped = signal<boolean>(false);

  private wasSwipe = false;

  private startX = 0;
  private startY = 0;
  private endX = 0;
  private endY = 0;
  private minSwipeDistance = 50; // Min pixels for a swipe.
  private isMouseDown = false;

  flipCard() {
    this.isFlipped.update((current) => !current);
  }

  onImageClick(event: Event) {
    console.log('Image clicked, wasSwipe:', this.wasSwipe);
    event.stopPropagation();
    console.log('Flipping card');
    if (!this.wasSwipe) {
      this.flipCard();
    } else {
      console.log('Ignoring click due to swipe');
    }
  }

  onTouchStart(event: TouchEvent) {
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
  }

  onTouchEnd(event: TouchEvent) {
    this.endX = event.changedTouches[0].clientX;
    this.endY = event.changedTouches[0].clientY;
    this.handleSwipe();
  }

  onMouseDown(event: MouseEvent) {
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.isMouseDown = true;
    event.preventDefault();
  }

  onMouseUp(event: MouseEvent) {
    this.endX = event.clientX;
    this.endY = event.clientY;
    this.handleSwipe();
    this.isMouseDown = false;
  }

  onMouseLeave(event: MouseEvent) {
    if (this.isMouseDown) {
      this.endX = event.clientX;
      this.endY = event.clientY;
      this.handleSwipe();
      this.isMouseDown = false;
    }
  }

  private handleSwipe() {
    const deltaX = this.endX - this.startX;
    const deltaY = this.endY - this.startY;

    // Without this, a click is considered a swipe
    const isActualSwipe =
      Math.abs(deltaX) > this.minSwipeDistance ||
      Math.abs(deltaY) > this.minSwipeDistance;

    if (isActualSwipe) {
      this.wasSwipe = true;
      console.log('Actual swipe detected, setting wasSwipe = true;');
      // Determines if horizontal or vertical swipe
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > this.minSwipeDistance) {
          if (deltaX > 0) {
            this.swipeRight(); // Not seen + Liked + Saved
          } else {
            this.swipeLeft(); // Not seen + Not Liked + Not Saved
          }
        }
      } else {
        // Vertical Swipe
        if (Math.abs(deltaY) > this.minSwipeDistance) {
          if (deltaY < 0) {
            this.swipeUp(); // Seen + Liked + Save
          } else {
            this.swipeDown(); // Seen + Not Liked + Not Saved
          }
        }
      }
      setTimeout(() => {
        this.wasSwipe = false;
        console.log('Reset wasSwipe to false');
      }, 300);
    } else {
      console.log('Not a swipe, just a click');
    }
  }

  swipeUp() {
    console.log('Seen + Liked + Save');
    this.movieRated.emit('seen-liked');
  }

  swipeDown() {
    console.log('Seen + Not Liked + Not Saved');
    this.movieRated.emit('seen-disliked');
  }

  swipeLeft() {
    console.log('Not seen + Not Liked + Not Saved');
    this.movieRated.emit('not-seen-disliked');
  }

  swipeRight() {
    console.log('Not seen + Liked + Saved');
    this.movieRated.emit('not-seen-liked');
  }
}

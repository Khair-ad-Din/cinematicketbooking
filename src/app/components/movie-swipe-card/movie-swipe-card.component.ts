import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  SimpleChanges,
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
  swipeDirection = signal<string>('');
  isAnimating = signal<boolean>(false);
  isDragging = signal<boolean>(false);
  currentDragX = signal<number>(0);
  currentDragY = signal<number>(0);

  private wasSwipe = false;

  private startX = 0;
  private startY = 0;
  private endX = 0;
  private endY = 0;
  public minSwipeDistance = 100; // Min pixels for a swipe.
  private isMouseDown = false;

  flipCard() {
    this.isFlipped.update((current) => !current);
  }

  onImageClick(event: Event) {
    // Calculate total movement during this interaction
    const totalMovement = Math.sqrt(
      Math.pow(this.endX - this.startX, 2) +
        Math.pow(this.endY - this.startY, 2)
    );

    event.stopPropagation();
    // TODO: Investigate why 5px is perfect for preventing unpretended flips accross all image.
    // Tried as first approach for testing and for some reason is perfect but my logic says it shouldn't be.
    if (!this.wasSwipe && totalMovement < 5) {
      this.flipCard();
    } else {
      console.log('Ignoring click due to movement:', totalMovement);
    }
  }

  onTouchStart(event: TouchEvent) {
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
    this.isDragging.set(true);
  }

  onTouchMove(event: TouchEvent) {
    const currentX = event.touches[0].clientX;
    const currentY = event.touches[0].clientY;
    this.currentDragX.set(currentX - this.startX);
    this.currentDragY.set(currentY - this.startY);
  }

  onTouchEnd(event: TouchEvent) {
    this.endX = event.changedTouches[0].clientX;
    this.endY = event.changedTouches[0].clientY;
    this.handleSwipe();
    this.isDragging.set(false);
    this.currentDragX.set(0);
    this.currentDragY.set(0);
  }

  onMouseDown(event: MouseEvent) {
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.isMouseDown = true;
    event.preventDefault();
    this.isDragging.set(true);
  }

  onMouseMove(event: MouseEvent) {
    if (this.isMouseDown) {
      const deltaX = event.clientX - this.startX;
      const deltaY = event.clientY - this.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > this.minSwipeDistance) {
        this.currentDragX.set(deltaX);
        this.currentDragY.set(deltaY);
      }
    }
  }

  onMouseUp(event: MouseEvent) {
    this.endX = event.clientX;
    this.endY = event.clientY;
    this.handleSwipe();
    this.isMouseDown = false;
    this.isDragging.set(false);
    this.currentDragX.set(0);
    this.currentDragY.set(0);
  }

  onMouseLeave(event: MouseEvent) {
    if (this.isMouseDown) {
      this.endX = event.clientX;
      this.endY = event.clientY;
      this.handleSwipe();
      this.isMouseDown = false;
      this.isDragging.set(false);
      this.currentDragX.set(0);
      this.currentDragY.set(0);
    }
  }

  ngOnChanges(change: SimpleChanges) {
    if (change['movie'] && !change['movie'].firstChange) {
      this.isFlipped.set(false);
    }
  }

  dragDistance() {
    const deltaX = this.currentDragX();
    const deltaY = this.currentDragY();
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  dragIndicatorText() {
    const deltaX = this.currentDragX();
    const deltaY = this.currentDragY();

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? '⭐ Want to watch' : '❌ Skip';
    } else {
      return deltaY < 0 ? '❤️ Loved it!' : '👎 Not for me';
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
      this.isAnimating.set(true);
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
        this.isAnimating.set(false);
        this.swipeDirection.set('');
      }, 300);
    } else {
      console.log('Not a swipe, just a click');
    }
  }

  swipeUp() {
    this.swipeDirection.set('up');
    this.movieRated.emit('seen-liked');
  }

  swipeDown() {
    this.swipeDirection.set('down');
    this.movieRated.emit('seen-disliked');
  }

  swipeLeft() {
    this.swipeDirection.set('left');
    this.movieRated.emit('not-seen-disliked');
  }

  swipeRight() {
    this.swipeDirection.set('right');
    this.movieRated.emit('not-seen-liked');
  }
}

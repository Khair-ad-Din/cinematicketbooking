import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieListComponent } from '../components/movie-list/movie-list.component';

@Component({
  selector: 'app-home',
  template: `
    <h2>Welcome to the Cinema Booking System</h2>
    <p>Browse movies and book your tickets!</p>
    <app-movie-list></app-movie-list>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MovieListComponent],
})
export class HomeComponent {}

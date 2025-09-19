import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieListComponent } from '../components/movie-list/movie-list.component';

@Component({
  selector: 'app-home',
  template: `
    <h2>Movie Recommender</h2>
    <app-movie-list></app-movie-list>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MovieListComponent],
})
export class HomeComponent {}

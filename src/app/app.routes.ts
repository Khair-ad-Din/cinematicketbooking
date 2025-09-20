import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { MovieDetailsComponent } from './components/movie-details/movie-details.component';
import { SeatSelectionComponent } from './components/seat-selection/seat-selection.component';
import { BookingConfirmationComponent } from './components/booking-confirmation/booking-confirmation.component';
import { MovieSwipeComponent } from './pages/movie-swipe/movie-swipe.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'movies/:id', component: MovieDetailsComponent },
  // { path: 'movies/:id/showtime/:showtime', component: SeatSelectionComponent },
  // {
  //   path: 'booking-confirmation/:movieId/:showtime/:seatIds',
  //   component: BookingConfirmationComponent,
  // },
  { path: 'swipe', component: MovieSwipeComponent },
  // Add more routes here later
];

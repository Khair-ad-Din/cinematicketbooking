import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { MovieDetailsComponent } from './components/movie-details/movie-details.component';
import { MovieSwipeComponent } from './pages/movie-swipe/movie-swipe.component';
import { ConfigProfileComponent } from './pages/config-profile/config-profile.component';
import { LoginComponent } from './components/auth/login/login/login.component';
import { RegisterComponent } from './components/auth/login/register/register.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { FriendsComponent } from './pages/friends/friends.component';
import { FriendProfile } from './pages/friend-profile/friend-profile';
import { SharedMovies } from './pages/shared-movies/shared-movies';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: HomeComponent },
  { path: 'movies/:id', component: MovieDetailsComponent },
  // { path: 'movies/:id/showtime/:showtime', component: SeatSelectionComponent },
  // {
  //   path: 'booking-confirmation/:movieId/:showtime/:seatIds',
  //   component: BookingConfirmationComponent,
  // },
  { path: 'swipe', component: MovieSwipeComponent },
  { path: 'dashboard', component: UserDashboardComponent },
  { path: 'config-profile', component: ConfigProfileComponent },
  { path: 'friends', component: FriendsComponent },
  { path: 'friend-profile/:id', component: FriendProfile },
  { path: 'shared-movies/:friendId', component: SharedMovies },
  // Add more routes here later
];

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TmdbResponse } from '../interfaces/tmdb-movie';

@Injectable({
  providedIn: 'root',
})
export class TmdbService {
  private apiKey = 'ff05b765a64ee68756f97dd070b05b12';
  private baseUrl = 'https://api.themoviedb.org/3';

  constructor(private http: HttpClient) {}

  getPopularMovies(page: number = 1): Observable<TmdbResponse> {
    return this.http.get<TmdbResponse>(
      `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&page=${page}`
    );
  }

  getMovieDetails(movieId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}`
    );
  }

  getMovieCredits(movieId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/movie/${movieId}/credits?api_key=${this.apiKey}`
    );
  }

  getMovieVideos(movieId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/movie/${movieId}/videos?api_key=${this.apiKey}`
    );
  }

  discoverMovies(params: any = {}): Observable<TmdbResponse> {
    const queryParams = new URLSearchParams({
      api_key: this.apiKey,
      ...params,
    });
    return this.http.get<TmdbResponse>(
      `${this.baseUrl}/discover/movie?${queryParams}`
    );
  }
}

import { UserStateService } from './user-state.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  UserProfile,
  UserSearchResult,
  UpdateProfileDto,
} from '../interfaces/social';
import { catchError, Observable, of, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private http = inject(HttpClient);
  private userStateService = inject(UserStateService);

  private readonly API_BASE = 'http://localhost:8080/api/profiles';

  // Signals for reactive state management
  private currentUserProfile = signal<UserProfile | null>(null);
  private isLoading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Public readonly signals
  public readonly userProfile = this.currentUserProfile.asReadonly();
  public readonly loading = this.isLoading.asReadonly();
  public readonly profileError = this.error.asReadonly();

  // Computed values
  public readonly isProfileComplete = computed(() => {
    const profile = this.currentUserProfile();
    return profile?.displayName && profile?.bio;
  });

  public readonly userStats = computed(() => {
    const profile = this.currentUserProfile();
    if (!profile) return null;

    return {
      movieCount: profile.movieCount,
      favoriteGenresCount: profile.favoriteGenres.length,
      friendsCount: 0, // Will be populated by friends service
      joinedDaysAgo: this.calculateDaysAgo(profile.joinedDate),
    };
  });

  constructor() {
    this.initializeProfile();
  }

  private initializeProfile() {
    const currentUserId = this.userStateService.getCurrentUserIdentifier();
    if (currentUserId && currentUserId !== 'anonymous-user') {
      this.loadCurrentUserProfile();
    }
  }

  // API Methods
  loadCurrentUserProfile(): Observable<UserProfile | null> {
    this.isLoading.set(true);
    this.error.set(null);

    const request = this.http.get<UserProfile>(`${this.API_BASE}/me`).pipe(
      tap((profile) => {
        this.currentUserProfile.set(profile);
        this.isLoading.set(false);
      }),
      catchError((error) => {
        console.error('Error loading user profile:', error);
        this.error.set('Failed to load profile');
        this.isLoading.set(false);
        return of(null);
      })
    );

    // Subscribe to execute the request
    request.subscribe();

    return request;
  }

  updateProfile(updates: UpdateProfileDto): Observable<UserProfile | null> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.put<UserProfile>(`${this.API_BASE}/me`, updates).pipe(
      tap((profile) => {
        if (profile) {
          this.currentUserProfile.set(profile);
        }
        this.isLoading.set(false);
      }),
      catchError((error) => {
        console.error('Error updating profile:', error);
        this.error.set('Failed to update profile');
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  getUserProfile(userId: string): Observable<UserProfile | null> {
    return this.http.get<UserProfile>(`${this.API_BASE}/${userId}`).pipe(
      catchError((error) => {
        console.error('Error loading user profile:', error);
        return of(null);
      })
    );
  }

  searchUsers(
    query: string,
    page: number = 0,
    size: number = 10
  ): Observable<UserSearchResult> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<UserSearchResult>(`${this.API_BASE}/search`, { params })
      .pipe(
        catchError((error) => {
          console.error('Error searching users:', error);
          return of({
            users: [],
            totalCount: 0,
            currentPage: 0,
            totalPages: 0,
          });
        })
      );
  }

  uploadAvatar(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http
      .post<{ avatarUrl: string }>(`${this.API_BASE}/avatar`, formData)
      .pipe(
        map((response) => response.avatarUrl),
        catchError((error) => {
          console.error('Error uploading avatar:', error);
          this.error.set('Failed to upload avatar');
          return of('');
        })
      );
  }

  // Utility Methods
  private calculateDaysAgo(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Profile validation
  validateProfile(profile: Partial<UserProfile>): string[] {
    const errors: string[] = [];

    if (profile.displayName && profile.displayName.length < 2) {
      errors.push('Display name must be at least 2 characters');
    }

    if (profile.bio && profile.bio.length > 500) {
      errors.push('Bio cannot exceed 500 characters');
    }

    if (profile.username && !/^[a-zA-Z0-9_]{3,20}$/.test(profile.username)) {
      errors.push(
        'Username must be 3-20 characters, letters, numbers and underscores only'
      );
    }

    return errors;
  }

  // Clear profile data (for logout)
  clearProfile() {
    this.currentUserProfile.set(null);
    this.error.set(null);
  }
}

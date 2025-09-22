import { Injectable, signal } from '@angular/core';
import { Movie } from '../interfaces/movie';

interface MoviePreference {
  movieId: number;
  title: string;
  rating: 'seen-liked' | 'disliked' | 'not-seen-liked' | 'skip';
  timestamp: Date;
}

interface UserPreferences {
  userId?: string; // null for anonymous, user ID for logged in
  sessionId: string; // Anonymous session tracking
  preferences: MoviePreference[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private preferences = signal<UserPreferences>(this.initializePreferences());
  // Future: Easy to add user login
  private currentUserId = signal<string | null>(null);

  private lastAction = signal<MoviePreference | null>(null);
  private canUndo = signal<boolean>(false);

  get undoAvailable() {
    return this.canUndo.asReadonly();
  }

  private generateSessionId(): string {
    return 'session-' + Date.now() + Math.random().toString(36).substring(2, 9);
  }

  private initializePreferences(): UserPreferences {
    const stored = localStorage.getItem('user-preferences');
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.createdAt = new Date(parsed.createdAt);
      parsed.updatedAt = new Date(parsed.updatedAt);
      parsed.preferences = parsed.preferences.map((pref: any) => ({
        ...pref,
        timestamp: new Date(pref.timestamp),
      }));
      return parsed;
    }

    return {
      sessionId: this.generateSessionId(),
      preferences: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  addPreference(movie: Movie, rating: string) {
    const newPreference: MoviePreference = {
      movieId: movie.id,
      title: movie.title,
      rating: rating as any, // Cast to the union type
      timestamp: new Date(),
    };

    this.lastAction.set(newPreference);
    this.canUndo.set(true);

    this.preferences.update((current) => {
      const updated = {
        ...current,
        preferences: [...current.preferences, newPreference],
        updatedAt: new Date(),
      };
      localStorage.setItem('user-preferences', JSON.stringify(updated));
      return updated;
    });
    // Future: Also sync to backend
  }

  getUserPreferences() {
    return this.preferences();
    // Future: Fetch from backend API
  }

  undoLastAction(): MoviePreference | null {
    const lastAction = this.lastAction();
    if (!lastAction || !this.canUndo()) return null;

    this.preferences.update((current) => {
      const updated = {
        ...current,
        preferences: current.preferences.filter(
          (pref) =>
            pref.movieId !== lastAction.movieId ||
            pref.timestamp !== lastAction.timestamp
        ),
        updatedAt: new Date(),
      };
      localStorage.setItem('user-preferences', JSON.stringify(updated));
      return updated;
    });

    this.lastAction.set(null);
    this.canUndo.set(false);

    return lastAction;
  }

  clearUserPreferences() {
    localStorage.removeItem('user-preferences');
    this.preferences.set(this.initializePreferences());
  }

  // Future: Migration methods
  // migrateAnonymousToUser(userId: string) {...}
  // syncWithBackend() {...}
}

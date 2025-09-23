import { UserStateService } from './user-state.service';
import { inject, Injectable, signal } from '@angular/core';
import { Movie } from '../interfaces/movie';

interface MoviePreference {
  movieId: number;
  title: string;
  rating: 'seen-liked' | 'disliked' | 'not-seen-liked' | 'skip';
  timestamp: Date;
}

interface UserPreferences {
  preferences: MoviePreference[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private userStateService = inject(UserStateService);
  private preferences = signal<UserPreferences>(this.initializePreferences());

  private lastAction = signal<MoviePreference | null>(null);
  private canUndo = signal<boolean>(false);

  get undoAvailable() {
    return this.canUndo.asReadonly();
  }

  private initializePreferences(): UserPreferences {
    const userIdentifier = this.userStateService.getCurrentUserIdentifier();
    const storageKey = `user-preferences-${userIdentifier}`;
    const stored = localStorage.getItem(storageKey);

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
      const userIdentifier = this.userStateService.getCurrentUserIdentifier();
      const storageKey = `user-preferences-${userIdentifier}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
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
      const userIdentifier = this.userStateService.getCurrentUserIdentifier();
      const storageKey = `user-preferences-${userIdentifier}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });

    this.lastAction.set(null);
    this.canUndo.set(false);

    return lastAction;
  }

  clearUserPreferences() {
    const userIdentifier = this.userStateService.getCurrentUserIdentifier();
    const storageKey = `user-preferences-${userIdentifier}`;
    localStorage.removeItem(storageKey);
    this.preferences.set(this.initializePreferences());
  }
}

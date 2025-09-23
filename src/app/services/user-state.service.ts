import { effect, inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';

interface UserSession {
  userId?: string;
  sessionId: string;
  isAuthenticated: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class UserStateService {
  private authService = inject(AuthService);

  private userSession = signal<UserSession>(this.initializeSession());

  constructor() {
    effect(() => {
      const currentUser = this.authService.user();
      const isAuthenticated = this.authService.authenticated();
      console.log('Auth state:', { currentUser, isAuthenticated });

      if (isAuthenticated && currentUser) {
        this.migrateToAuthenticatedUser(currentUser.id);
      } else {
        this.resetToAnonymous();
      }
    });
  }

  private generateSessionId(): string {
    return 'session-' + Date.now() + Math.random().toString(36).substring(2, 9);
  }

  private initializeSession(): UserSession {
    const stored = localStorage.getItem('user-session');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
      };
    }

    return {
      sessionId: this.generateSessionId(),
      isAuthenticated: false,
      createdAt: new Date(),
    };
  }

  private saveSession() {
    localStorage.setItem('user-session', JSON.stringify(this.userSession()));
  }

  private migrateToAuthenticatedUser(userId: string) {
    this.userSession.update((current) => {
      const updated = {
        ...current,
        userId,
        isAuthenticated: true,
      };
      this.saveSession();
      return updated;
    });
  }

  private resetToAnonymous() {
    const current = this.userSession();
    if (!current.isAuthenticated && !current.userId) {
      return; // Already anonymous, no need to update
    }
    this.userSession.update((current) => {
      const updated = {
        sessionId: current.sessionId, // Keep same session
        isAuthenticated: false,
        createdAt: current.createdAt,
      };
      this.saveSession();
      return updated;
    });
  }

  // Public API
  getCurrentUserIdentifier(): string {
    const session = this.userSession();
    return session.userId || session.sessionId;
  }

  getCurrentSession() {
    return this.userSession.asReadonly();
  }

  isAuthenticated(): boolean {
    return this.userSession().isAuthenticated;
  }

  getUserId(): string | null {
    return this.userSession().userId || null;
  }

  getSessionId(): string {
    return this.userSession().sessionId;
  }

  clearSession() {
    localStorage.removeItem('user-session');
    this.userSession.set(this.initializeSession());
  }
}

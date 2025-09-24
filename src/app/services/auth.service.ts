import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

export type AuthProvider =
  | 'email'
  | 'google'
  | 'facebook'
  | 'twitter'
  | 'instagram';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: AuthProvider;
  providerId?: string; // TODO: For account linking
  createdAt: Date;
}

export interface EmailCredentials {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  provider: AuthProvider;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string; // TODO: For future token refresh
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth'; // SpringBoot URL
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal<boolean>(false);

  constructor(private http: HttpClient) {
    this.checkStoredAuth();
  }

  // Getters
  get user() {
    return this.currentUser.asReadonly();
  }

  get authenticated() {
    return this.isAuthenticated.asReadonly();
  }

  // Check for store JWT on app init
  private checkStoredAuth() {
    const token = localStorage.getItem('auth-token');
    const user = localStorage.getItem('auth-user');

    if (token && user) {
      this.currentUser.set(JSON.parse(user));
      this.isAuthenticated.set(true);
    }
  }

  register(
    email: string,
    password: string,
    name: string
  ): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, {
      email,
      password,
      name,
      provider: 'email',
    });
  }

  // Email/Password Login
  login(email: string, password: string): Observable<AuthResponse> {
    const loginRequest: LoginRequest = {
      email: email,
      password: password,
      provider: 'email',
    };
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, loginRequest);
  }

  // Store auth data after successful login
  setAuthData(authResponse: AuthResponse) {
    localStorage.setItem('auth-token', authResponse.token);
    localStorage.setItem('auth-user', JSON.stringify(authResponse.user));
    this.currentUser.set(authResponse.user);
    this.isAuthenticated.set(true);
  }

  logout() {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  // Get JWT token for API calls
  getToken(): string | null {
    return localStorage.getItem('auth-token');
  }
}

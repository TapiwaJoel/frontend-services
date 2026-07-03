import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { TokenService } from './token.service';

/**
 * Mock Authentication Service
 * This service provides local authentication without any backend API calls.
 * Perfect for development and testing.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);

  public readonly currentUser$ = this.currentUserSubject.asObservable();

  public readonly isAuthenticated$ = this.currentUser$.pipe(
    map(user => !!user)
  );

  constructor(
    private tokenService: TokenService
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.tokenService.getToken();
    if (token) {
      // Load mock user from stored token
      this.checkAuth().subscribe();
    }
  }

  /**
   * Mock login - accepts any credentials and logs in successfully
   * No API calls are made
   */
  login(credentials: { email: string; password: string }): Observable<User> {
    // Create a mock user based on the credentials
    const mockUser: User = {
      id: '1',
      email: credentials.email,
      name: credentials.email.split('@')[0] || 'User'
    };

    // Create mock tokens
    const mockToken = 'mock-jwt-token-' + Date.now();
    const mockRefreshToken = 'mock-refresh-token-' + Date.now();

    // Simulate API delay
    return of({ user: mockUser, token: mockToken, refreshToken: mockRefreshToken }).pipe(
      delay(300), // Simulate network delay
      tap(response => {
        this.tokenService.setToken(response.token);
        this.tokenService.setRefreshToken(response.refreshToken);
        this.currentUserSubject.next(response.user);
      }),
      map(response => response.user)
    );
  }

  /**
   * Mock logout - clears local state
   * No API calls are made
   */
  logout(): Observable<void> {
    return of(void 0).pipe(
      delay(100),
      tap(() => {
        this.tokenService.clearTokens();
        this.currentUserSubject.next(null);
      })
    );
  }

  /**
   * Mock token refresh
   * No API calls are made
   */
  refreshToken(): Observable<string> {
    const mockToken = 'mock-jwt-token-refreshed-' + Date.now();
    const mockRefreshToken = 'mock-refresh-token-refreshed-' + Date.now();

    return of({ token: mockToken, refreshToken: mockRefreshToken }).pipe(
      delay(200),
      tap(response => {
        this.tokenService.setToken(response.token);
        this.tokenService.setRefreshToken(response.refreshToken);
      }),
      map(response => response.token)
    );
  }

  /**
   * Mock auth check - returns stored user
   * No API calls are made
   */
  checkAuth(): Observable<boolean> {
    const token = this.tokenService.getToken();

    if (!token) {
      return of(false);
    }

    // Create mock user from token
    const mockUser: User = {
      id: '1',
      email: 'user@example.com',
      name: 'Mock User'
    };

    return of({ user: mockUser }).pipe(
      delay(100),
      tap(response => {
        this.currentUserSubject.next(response.user);
      }),
      map(() => true)
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
}

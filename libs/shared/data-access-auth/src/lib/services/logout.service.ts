import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): Observable<void> {
    return this.authService.logout().pipe(
      tap(() => {
        // Navigate to login page after successful logout
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        // Even if the server request fails, clear local state
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
        return of(undefined);
      })
    );
  }
}

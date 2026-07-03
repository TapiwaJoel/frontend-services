import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@org/data-access-auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SmartNavigationService } from '../services/smart-navigation.service';

@Component({
  selector: 'org-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Login</h1>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              [(ngModel)]="username"
              required
              placeholder="Enter username"
            />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              required
              placeholder="Enter password"
            />
          </div>
          <button type="submit" class="login-button">Login</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      margin: 0 0 1.5rem 0;
      text-align: center;
      color: #333;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    .login-button {
      width: 100%;
      padding: 0.75rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .login-button:hover {
      background: #5568d3;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private smartNavigation = inject(SmartNavigationService);

  username = '';
  password = '';

  onSubmit() {
    // Simple mock login - in real app, you'd validate credentials
    const credentials = {
      email: this.username,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: async () => {
        await this.smartNavigation.navigateAfterLogin();
      },
      error: (error) => {
        console.error('Login failed', error);
      }
    });
  }
}

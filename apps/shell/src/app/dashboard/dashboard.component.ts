import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppSelectorComponent } from '../components/app-selector/app-selector.component';

@Component({
  selector: 'org-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AppSelectorComponent],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Shell Application</h1>
        <p>Centralized entry point for all remote applications</p>
      </div>

      <org-app-selector />
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 2rem 1rem;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 3rem;
      padding-top: 2rem;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    p {
      font-size: 1.125rem;
      color: #4a5568;
      margin: 0;
    }

    @media (max-width: 768px) {
      .dashboard-header {
        margin-bottom: 2rem;
        padding-top: 1rem;
      }

      h1 {
        font-size: 1.875rem;
      }

      p {
        font-size: 1rem;
      }
    }
  `]
})
export class DashboardComponent {}

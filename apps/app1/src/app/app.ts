import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule, RouterModule],
  selector: 'org-root',
  template: `
    <div class="app-container">
      <div class="app-header">
        <h1>App 1 - Feature Module</h1>
      </div>
      <div class="app-content">
        <p>This is the first remote application loaded via Module Federation.</p>
        <div class="feature-list">
          <h2>Features</h2>
          <ul>
            <li>Remote module loading</li>
            <li>Lazy loading support</li>
            <li>Independent deployment</li>
            <li>Shared dependencies</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .app-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .app-header h1 {
      margin: 0;
    }

    .app-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .app-content p {
      color: #666;
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }

    .feature-list h2 {
      color: #333;
      margin-bottom: 1rem;
    }

    .feature-list ul {
      list-style: none;
      padding: 0;
    }

    .feature-list li {
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      background: #f5f5f5;
      border-left: 4px solid #667eea;
      border-radius: 4px;
    }
  `]
})
export default class App {
  protected title = 'app1';
}

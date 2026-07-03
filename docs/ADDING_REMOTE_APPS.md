# Adding Remote Applications Guide

This guide provides step-by-step instructions for adding new remote applications to the micro-frontend monorepo.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Step-by-Step Guide](#step-by-step-guide)
- [Configuration Reference](#configuration-reference)
- [Testing Your Remote App](#testing-your-remote-app)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

Adding a new remote application involves:

1. Generating a new Angular application with NX
2. Configuring Native Federation
3. Converting to a pure remote module (no standalone capability)
4. Exposing components/modules
5. Updating the shell's federation manifest
6. Adding routes in the shell application
7. Adding to the app selector UI
8. Testing the integration

**Time to Complete**: ~15-20 minutes

**Important**: Remote applications in this architecture are **pure remote modules** that cannot run independently. They can ONLY be accessed through the shell application.

## Prerequisites

Before starting, ensure you have:

- Node.js 20.x or higher installed
- NX CLI knowledge (or follow the commands provided)
- Basic understanding of Angular routing
- Understanding of Module Federation concepts (see [ARCHITECTURE.md](../ARCHITECTURE.md))

## Step-by-Step Guide

### Step 1: Generate New Angular Application

Use the NX Angular generator to create a new application:

```bash
# Generate a new Angular application
npx nx g @nx/angular:app my-remote-app

# When prompted, select:
# - Standalone components: Yes
# - Routing: Yes
# - Stylesheet format: scss
# - E2E test runner: playwright
# - Linter: eslint
```

This creates:
```
apps/
├── my-remote-app/
│   ├── src/
│   ├── project.json
│   └── tsconfig.app.json
└── my-remote-app-e2e/
```

### Step 2: Configure Project Tags

Update the project tags in `apps/my-remote-app/project.json`:

```json
{
  "name": "my-remote-app",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "prefix": "org",
  "sourceRoot": "apps/my-remote-app/src",
  "tags": ["scope:my-remote-app", "type:app"],
  "targets": {
    // ... targets will be configured next
  }
}
```

### Step 3: Install Native Federation (If Not Already Installed)

The Native Federation plugin should already be in your workspace. Verify in `package.json`:

```json
{
  "devDependencies": {
    "@angular-architects/native-federation": "^22.0.3"
  }
}
```

If not present:

```bash
npm install @angular-architects/native-federation --save-dev
```

### Step 4: Configure Native Federation Build (Pure Remote Module)

Update `apps/my-remote-app/project.json` to use Native Federation as a **pure remote module**.

**Important**: Remote apps do NOT have serve targets. They are build-only and can only be accessed through the shell.

```json
{
  "name": "my-remote-app",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "prefix": "org",
  "sourceRoot": "apps/my-remote-app/src",
  "tags": ["scope:my-remote-app", "type:app"],
  "targets": {
    "build": {
      "executor": "@angular-architects/native-federation:build",
      "defaultConfiguration": "production",
      "options": {
        "cacheExternalArtifacts": true
      },
      "configurations": {
        "production": {
          "target": "my-remote-app:esbuild:production"
        },
        "development": {
          "target": "my-remote-app:esbuild:development",
          "dev": true
        }
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    },
    "esbuild": {
      "executor": "@angular/build:application",
      "outputs": ["{options.outputPath}"],
      "defaultConfiguration": "production",
      "options": {
        "outputPath": "dist/apps/my-remote-app",
        "browser": "apps/my-remote-app/src/main.ts",
        "tsConfig": "apps/my-remote-app/tsconfig.app.json",
        "inlineStyleLanguage": "scss",
        "assets": [
          {
            "glob": "**/*",
            "input": "apps/my-remote-app/public"
          }
        ],
        "styles": ["apps/my-remote-app/src/styles.scss"],
        "polyfills": ["es-module-shims"]
      },
      "configurations": {
        "production": {
          "budgets": [
            {
              "type": "initial",
              "maximumWarning": "500kb",
              "maximumError": "1mb"
            },
            {
              "type": "anyComponentStyle",
              "maximumWarning": "4kb",
              "maximumError": "8kb"
            }
          ],
          "outputHashing": "all"
        },
        "development": {
          "optimization": false,
          "extractLicenses": false,
          "sourceMap": true
        }
      }
    }
  }
}
```

**Key differences from standalone apps:**
- ❌ No `serve` target
- ❌ No `serve-static` target
- ❌ No `serve-original` target
- ✅ Only `build`, `lint`, and `esbuild` targets

### Step 5: Configure main.ts as Pure Remote Module

Update `apps/my-remote-app/src/main.ts` to be a pure remote module:

```typescript
// This is a pure remote module - no standalone bootstrap
// The shell application handles initialization and loading
// All exposed modules are defined in federation.config.mjs
```

**Remove** any `initFederation()` or `bootstrapApplication()` calls. The remote app should NOT bootstrap itself.

### Step 7: Configure Federation Settings

Create or update `apps/my-remote-app/federation.config.mjs`:

```javascript
import { withNativeFederation, shareAll } from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'my-remote-app',

  exposes: {
    './Component': './apps/my-remote-app/src/app/app.ts',
  },

  shared: {
    ...shareAll(
      { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package' },
      {
        overrides: {
          '@angular/core': {
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto',
            build: 'package',
            includeSecondaries: { keepAll: true }
          },
        },
      },
    ),
    '@org/shared/data-access-auth': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@org/shared/ui-common': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@org/shared/util-event-bus': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@org/shared/util-theming': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
  ],

  features: {
    denseChunking: true
  }
});
```

### Step 8: Create App Component

Update `apps/my-remote-app/src/app/app.ts`:

```typescript
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule, RouterModule],
  selector: 'org-root',
  template: `
    <div class="app-container">
      <div class="app-header">
        <h1>My Remote App</h1>
      </div>
      <div class="app-content">
        <p>This is a new remote application loaded via Module Federation.</p>
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
export class App {
  protected title = 'my-remote-app';
}

// IMPORTANT: Export as default for Native Federation
export default App;
```

**Critical**: The `export default App;` is required for Native Federation to expose the component.

#### 5.4 Create App Config

Update `apps/my-remote-app/src/app/app.config.ts`:

```typescript
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes)
  ],
};
```

#### 5.5 Create Routes

Update `apps/my-remote-app/src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  // Add your routes here
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.component').then(m => m.HomeComponent)
  }
];
```

### Step 6: Add Shared Library Dependencies (Optional)

If your remote app needs authentication, theming, or event bus:

```typescript
// apps/my-remote-app/src/app/app.config.ts
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { authInterceptor } from '@org/data-access-auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ],
};
```

Use shared services in your component:

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '@org/data-access-auth';
import { EventBusService } from '@org/util-event-bus';
import { ThemeService } from '@org/util-theming';

@Component({
  // ...
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private eventBus = inject(EventBusService);
  private themeService = inject(ThemeService);

  ngOnInit() {
    // Use shared services
    this.authService.currentUser$.subscribe(user => {
      console.log('Current user:', user);
    });

    this.eventBus.on('DATA_UPDATED').subscribe(event => {
      console.log('Data updated:', event);
    });
  }
}
```

### Step 9: Update Federation Manifest

Add your new remote app to the shell's federation manifest:

**File**: `apps/shell/public/federation.manifest.json`

```json
{
  "app1": "http://localhost:4201/remoteEntry.json",
  "app2": "http://localhost:4202/remoteEntry.json",
  "my-remote-app": "http://localhost:4203/remoteEntry.json"
}
```

**Note**: Since remote apps don't have their own serve targets, the port numbers in the manifest are used by the built remoteEntry.json files.

### Step 10: Add to Shell's Build Dependencies

Update the shell's serve configuration to automatically build your new remote app:

**File**: `apps/shell/project.json`

Find the `serve` target and add your app to the `dependsOn` array:

```json
{
  "serve": {
    "executor": "@angular-architects/native-federation:build",
    "dependsOn": ["app1:build", "app2:build", "my-remote-app:build"],
    "options": {
      "target": "shell:serve-original:development"
    }
  }
}
```

This ensures your remote app is built before the shell starts.

### Step 11: Add to App Selector UI

Update the app selector component to include your new remote app:

**File**: `apps/shell/src/app/components/app-selector/app-selector.component.ts`

```typescript
availableApps: RemoteApp[] = [
  {
    id: 'app1',
    name: 'Application 1',
    description: 'First remote application module',
    route: '/app1'
  },
  {
    id: 'app2',
    name: 'Application 2',
    description: 'Second remote application module',
    route: '/app2'
  },
  // NEW: Add your remote app here
  {
    id: 'my-remote-app',
    name: 'My Remote App',
    description: 'Description of your new remote application',
    route: '/my-remote-app'
  }
];
```

### Step 12: Add Route in Shell Application

Update the shell's route configuration to include the new remote:

**File**: `apps/shell/src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '@org/data-access-auth';
import { loadRemoteModule } from '@angular-architects/native-federation';

export const appRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'app1',
    canActivate: [authGuard],
    loadChildren: () =>
      loadRemoteModule('app1', './Component').then((m) => [
        {
          path: '',
          component: m.default,
        },
      ]),
  },
  {
    path: 'app2',
    canActivate: [authGuard],
    loadChildren: () =>
      loadRemoteModule('app2', './Component').then((m) => [
        {
          path: '',
          component: m.default,
        },
      ]),
  },
  // NEW: Add your remote app route
  {
    path: 'my-remote-app',
    canActivate: [authGuard],
    loadChildren: () =>
      loadRemoteModule('my-remote-app', './Component').then((m) => [
        {
          path: '',
          component: m.default,
        },
      ]),
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
```

## Testing Your Remote App

### Important: Testing Through the Shell

Since remote apps cannot run independently, all testing must be done through the shell application.

### Step 1: Build Your Remote App

First, build your remote app to ensure there are no compilation errors:

```bash
# Build only the remote app
npm exec nx build my-remote-app

# Or build all remote apps
npm run build:remotes
```

If the build succeeds, you'll see output similar to:

```
✔ Browser application bundle generation complete.
✔ Copying assets complete.
✔ Index html generation complete.

Output written to: dist/apps/my-remote-app
```

### Step 2: Start the Shell Application

Start the shell application (which will automatically build all remote apps including yours):

```bash
# Using npm script
npm start

# Or using nx directly
npm exec nx serve shell
```

The shell will start on `http://localhost:4200` and automatically build all remote apps (including yours) before serving.

### Step 3: Access Your Remote App

1. Open your browser to `http://localhost:4200`
2. Log in (use the authentication credentials)
3. You'll see the dashboard with the **app selector**
4. Click on your new remote app card to load it
5. OR navigate directly to `http://localhost:4200/my-remote-app`

### Step 4: Verify Integration

Check the following in your browser's Developer Tools:

✅ **Console Tab:**
- No errors during remote module loading
- No 404 errors for remoteEntry.json
- Application loads successfully

✅ **Network Tab:**
- `remoteEntry.json` loads successfully
- Remote app chunks load on demand
- No failed requests

✅ **Functionality:**
- Your remote app displays correctly
- Routing works within your app
- Shared services (auth, event bus, theme) work correctly
- Navigation back to dashboard works

### Common Issues During Testing

**Issue**: `Failed to fetch dynamically imported module`
- **Solution**: Ensure your remote app is built (check dist/apps/my-remote-app/)
- **Solution**: Verify federation manifest has correct URL

**Issue**: `Cannot find module './Component'`
- **Solution**: Ensure `app.ts` has `export default App;`
- **Solution**: Check federation.config.mjs exposes './Component'

**Issue**: Remote app doesn't appear in app selector
- **Solution**: Verify you added it to `app-selector.component.ts`
- **Solution**: Verify the route is defined in shell's `app.routes.ts`

## Configuration Reference

### Required Files for Remote Apps

| File | Purpose | Required |
|------|---------|----------|
| `apps/my-remote-app/project.json` | NX and Federation build configuration | ✅ Yes |
| `apps/my-remote-app/federation.config.mjs` | Native Federation configuration | ✅ Yes |
| `apps/my-remote-app/src/main.ts` | Entry point (should be empty for pure remotes) | ✅ Yes |
| `apps/my-remote-app/src/app/app.ts` | Root component (must export default) | ✅ Yes |
| `apps/my-remote-app/src/app/app.config.ts` | Application configuration | ⚠️ Optional |
| `apps/my-remote-app/src/app/app.routes.ts` | Route configuration | ⚠️ Optional |

**Important**: Remote apps do NOT have:
- ❌ No `bootstrap.ts` file
- ❌ No serve targets in `project.json`
- ❌ No `initFederation()` call in `main.ts`
- ❌ No `bootstrapApplication()` call

### Application Ports

| App | Port | Can Run Independently? |
|-----|------|----------------------|
| Shell | 4200 | ✅ Yes (main entry point) |
| App1 | N/A | ❌ No (pure remote module) |
| App2 | N/A | ❌ No (pure remote module) |
| Your New App | N/A | ❌ No (pure remote module) |

**Note**: Remote apps do not have their own ports since they cannot run independently. They are only built to generate `remoteEntry.json` files.

### TypeScript Path Mapping

If your remote app needs to be imported elsewhere, add it to `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@org/my-remote-app": ["apps/my-remote-app/src/index.ts"]
    }
  }
}
```

## Testing Your Remote App

### Unit Tests

```bash
# Run unit tests
npx nx test my-remote-app

# Run with coverage
npx nx test my-remote-app --coverage

# Run in watch mode
npx nx test my-remote-app --watch
```

### E2E Tests

```bash
# Run E2E tests
npx nx e2e my-remote-app-e2e

# Run in headed mode
npx nx e2e my-remote-app-e2e --headed

# Run in UI mode
npx nx e2e my-remote-app-e2e --ui
```

### Manual Testing Checklist

- [ ] Remote app loads in standalone mode (`http://localhost:4204`)
- [ ] Remote app loads in shell (`http://localhost:4200/my-remote-app`)
- [ ] Authentication works (if using `authGuard`)
- [ ] Shared services are accessible (auth, events, theme)
- [ ] Navigation works between shell and remote
- [ ] No console errors
- [ ] Styles are applied correctly
- [ ] Hot reload works during development

## Troubleshooting

### Issue: Remote App Not Loading

**Symptoms**: Blank page, console error "Cannot load remote module"

**Solutions**:
1. Verify the remote app is running (`npx nx serve my-remote-app`)
2. Check the federation manifest has the correct URL
3. Check browser console for specific errors
4. Verify the port in federation manifest matches the serve port

### Issue: Component Not Found

**Symptoms**: Error "Module './Component' not found"

**Solutions**:
1. Ensure the root component has `export default` at the end
2. Verify the component is exported from `app.ts`
3. Check the `loadRemoteModule` path is correct (`'./Component'`)

### Issue: Shared Services Not Working

**Symptoms**: Authentication state not shared, events not received

**Solutions**:
1. Verify services are marked with `providedIn: 'root'`
2. Check that the remote app imports shared libraries correctly
3. Ensure dependencies are shared in Native Federation config
4. Verify both apps use the same version of shared libraries

### Issue: Port Conflict

**Symptoms**: Error "Port 4204 is already in use"

**Solutions**:
1. Choose a different port in `project.json`
2. Kill the process using that port
3. Update the federation manifest with the new port

### Issue: Build Fails

**Symptoms**: Build errors during `npx nx build my-remote-app`

**Solutions**:
1. Run `npm install` to ensure all dependencies are installed
2. Check TypeScript errors: `npx nx typecheck my-remote-app`
3. Check for circular dependencies
4. Verify all imports are correct

### Issue: Hot Reload Not Working

**Symptoms**: Changes not reflected without full reload

**Solutions**:
1. Restart the dev server
2. Check for TypeScript errors
3. Clear the NX cache: `npx nx reset`
4. Verify file watchers are working

## Best Practices

### 1. Naming Conventions

- **App Names**: Use kebab-case (`my-remote-app`, not `MyRemoteApp`)
- **Component Selectors**: Use `org-` prefix (`org-my-component`)
- **Tags**: Use `scope:` and `type:` prefixes (`scope:my-remote-app`, `type:app`)

### 2. Port Management

- Document port assignments in a central location
- Use sequential port numbers (4201, 4202, 4203, ...)
- Don't hardcode ports in production configurations

### 3. Dependency Management

- Keep shared library versions in sync
- Use workspace-level dependencies when possible
- Avoid duplicating dependencies in remote apps

### 4. Component Design

- Keep remote components self-contained
- Minimize dependencies on shell
- Use event bus for cross-app communication
- Design for independent deployment

### 5. Error Handling

- Implement loading states
- Handle remote loading failures gracefully
- Provide fallback UI for network errors
- Log errors for debugging

Example:

```typescript
loadRemoteModule('my-remote-app', './Component')
  .then(m => m.default)
  .catch(error => {
    console.error('Failed to load remote app:', error);
    return ErrorComponent; // Fallback component
  });
```

### 6. Performance

- Lazy load remote apps only when needed
- Optimize bundle sizes
- Use OnPush change detection
- Preload likely-needed remotes

### 7. Testing

- Test remote app in isolation
- Test integration with shell
- Write E2E tests for critical flows
- Mock external dependencies

### 8. Documentation

- Document exposed modules
- Document required shared services
- Document environment variables
- Keep this guide updated

## Production Deployment

### Update Federation Manifest for Production

**File**: `apps/shell/public/federation.manifest.json`

```json
{
  "app1": "https://app1.example.com/remoteEntry.json",
  "app2": "https://app2.example.com/remoteEntry.json",
  "my-remote-app": "https://my-remote-app.example.com/remoteEntry.json"
}
```

### Build for Production

```bash
# Build the remote app
npx nx build my-remote-app --configuration=production

# Build the shell
npx nx build shell --configuration=production
```

### Deploy

1. Deploy remote app to its hosting location
2. Ensure `remoteEntry.json` is accessible
3. Update shell's federation manifest
4. Deploy shell application
5. Test the integration

## Example: Complete Remote App

Here's a complete example of a remote app with all best practices:

**apps/my-remote-app/src/app/app.ts**:

```typescript
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '@org/data-access-auth';
import { EventBusService } from '@org/util-event-bus';
import { ThemeService } from '@org/util-theming';

@Component({
  imports: [CommonModule, RouterModule],
  selector: 'org-root',
  template: `
    <div class="app-container">
      <div class="app-header">
        <h1>{{ title }}</h1>
        <p *ngIf="currentUser">Welcome, {{ currentUser.name }}!</p>
      </div>
      <div class="app-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [
    `
      .app-container {
        padding: 2rem;
      }
      .app-header {
        background: var(--primary-color);
        color: white;
        padding: 2rem;
        border-radius: 8px;
        margin-bottom: 2rem;
      }
    `,
  ],
})
export class App implements OnInit, OnDestroy {
  protected title = 'My Remote App';
  protected currentUser: any = null;

  private authService = inject(AuthService);
  private eventBus = inject(EventBusService);
  private themeService = inject(ThemeService);
  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Subscribe to auth state
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Listen for events
    this.eventBus.on('DATA_UPDATED')
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        console.log('Data updated:', event);
        this.handleDataUpdate(event);
      });

    // Set theme
    this.themeService.setTheme('my-remote-app');

    // Emit app loaded event
    this.eventBus.emit({
      type: 'APP_LOADED',
      payload: { appName: 'my-remote-app' },
      source: 'my-remote-app'
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleDataUpdate(event: any) {
    // Handle data updates from other apps
  }
}

export default App;
```

## Summary

You now know how to:
- Generate a new remote Angular application
- Configure Native Federation
- Expose components for remote loading
- Update the federation manifest
- Configure routes in the shell
- Test the integration
- Troubleshoot common issues
- Follow best practices

For more information:
- [README.md](../README.md) - Project overview
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Architecture details
- [Native Federation Docs](https://github.com/angular-architects/module-federation-plugin)

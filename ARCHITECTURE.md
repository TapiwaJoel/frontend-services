# Architecture Documentation

This document provides an in-depth technical overview of the micro-frontend architecture implemented in this Angular monorepo.

## Table of Contents

- [Overview](#overview)
- [Micro-Frontend Pattern](#micro-frontend-pattern)
- [Native Federation Deep Dive](#native-federation-deep-dive)
- [Singleton Service Pattern](#singleton-service-pattern)
- [Event Bus Communication](#event-bus-communication)
- [Theming System](#theming-system)
- [Authentication Flow](#authentication-flow)
- [Directory Structure Details](#directory-structure-details)
- [Dependency Graph](#dependency-graph)
- [Best Practices](#best-practices)
- [Performance Considerations](#performance-considerations)
- [Security Considerations](#security-considerations)

## Overview

This project implements a **micro-frontend architecture** using Angular and Native Federation with a **single entry point pattern**. The architecture enables:

- **Centralized Access**: All applications accessed through a single shell entry point
- **Independent Development**: Teams can develop applications independently
- **Independent Deployment**: Each application can be deployed separately
- **Runtime Integration**: Applications are composed at runtime in the browser
- **Technology Flexibility**: Each application can potentially use different versions
- **Scalability**: New applications can be added without affecting existing ones

### Core Concepts

1. **Shell Application (Host)**: The single orchestrator and entry point that loads remote applications
2. **Remote Applications**: Pure remote modules exposed via Native Federation (cannot run independently)
3. **Shared Libraries**: Common functionality shared across all applications
4. **Federation Manifest**: Registry of available remote applications
5. **Singleton Services**: Shared service instances across all applications

### Single Entry Point Pattern

This architecture enforces a **single entry point** through the shell application:

- **Shell-Only Access**: Remote applications (app1, app2, etc.) can ONLY be accessed through the shell
- **No Independent Running**: Remote applications cannot be started or accessed independently
- **App Selector UI**: Users select which application to run from the shell's dashboard
- **Centralized Authentication**: All authentication and routing is handled by the shell
- **Unified Navigation**: All inter-app navigation flows through the shell's routing system

#### Why Single Entry Point?

1. **Security**: Centralized authentication and authorization control
2. **Consistency**: Unified user experience and navigation
3. **Control**: Single point for access management and monitoring
4. **Simplicity**: Users only need to know one URL (the shell)
5. **Maintenance**: Easier to manage updates and deployments

## Micro-Frontend Pattern

### Architecture Style

This project uses the **Application Shell Pattern** combined with **Module Federation**:

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser Window                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                Shell Application                        │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Navigation, Auth, Layout                        │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  <router-outlet>                                 │  │ │
│  │  │  ┌────────────────────────────────────────────┐  │  │ │
│  │  │  │  Remote Application (Loaded on Demand)     │  │  │ │
│  │  │  │  • Independent bundle                       │  │  │ │
│  │  │  │  • Lazy loaded                              │  │  │ │
│  │  │  │  • Access to shared services                │  │  │ │
│  │  │  └────────────────────────────────────────────┘  │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Characteristics

1. **Runtime Composition**: Applications are composed at runtime, not build time
2. **Independent Bundles**: Each application produces its own JavaScript bundles
3. **Lazy Loading**: Remote applications are only loaded when navigated to
4. **Shared Dependencies**: Common libraries (Angular, RxJS) are shared to reduce bundle size
5. **Isolated Scope**: Each application has its own module scope but can access shared services

### Communication Patterns

This architecture implements three communication patterns:

1. **Shared State (Singleton Services)**
   - Authentication state
   - User information
   - Theme configuration

2. **Event Bus (Pub/Sub)**
   - Cross-application events
   - Decoupled communication
   - Type-safe event payloads

3. **Route Parameters**
   - Navigation between applications
   - URL-based state sharing

## Native Federation Deep Dive

### What is Native Federation?

Native Federation is a modern alternative to Webpack Module Federation that uses **native ES modules** and works with any build tool (esbuild, Vite, Rollup, etc.).

### How It Works

1. **Build Phase**:
   ```
   Remote Application Build
   ├── Generate application bundles
   ├── Generate remoteEntry.json
   │   └── Contains metadata about exposed modules
   └── Output to dist/apps/{app-name}
   ```

2. **Runtime Phase**:
   ```
   Shell Application
   ├── Read federation.manifest.json
   ├── Load remoteEntry.json from remote app
   ├── Download remote application chunks
   ├── Execute remote code in browser
   └── Instantiate remote components
   ```

### Federation Configuration

#### Shell Application (main.ts)

```typescript
import { initFederation } from '@angular-architects/native-federation';

// Initialize federation with manifest
initFederation('federation.manifest.json')
  .catch(err => console.error(err))
  .then(_ => import('./bootstrap'))
  .catch(err => console.error(err));
```

#### Federation Manifest (federation.manifest.json)

```json
{
  "app1": "http://localhost:4201/remoteEntry.json",
  "app2": "http://localhost:4202/remoteEntry.json"
}
```

This manifest tells the shell where to find remote applications:
- **Development**: Points to localhost with specific ports
- **Production**: Points to actual deployed URLs

#### Route Configuration (app.routes.ts)

```typescript
import { loadRemoteModule } from '@angular-architects/native-federation';

export const appRoutes: Routes = [
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
  }
];
```

### Module Exposure

Remote applications expose components/modules via their project configuration:

```json
{
  "targets": {
    "build": {
      "executor": "@angular-architects/native-federation:build",
      "options": {
        "cacheExternalArtifacts": true
      }
    }
  }
}
```

The Native Federation plugin automatically:
- Exposes the root component as `./Component`
- Creates a `remoteEntry.json` file
- Configures shared dependencies
- Handles version compatibility

### Development Workflow

#### Running the Application

To run the entire application stack:

```bash
# Start the shell (this automatically builds all remote apps first)
npm start
# or
npm exec nx serve shell
```

The shell's serve configuration includes a `dependsOn` array that automatically builds all remote applications before starting the shell:

```json
{
  "serve": {
    "executor": "@angular-architects/native-federation:build",
    "dependsOn": ["app1:build", "app2:build"],
    "options": {
      "target": "shell:serve-original:development"
    }
  }
}
```

**Important Notes:**
- The shell runs on port 4200 (configured in `serve-original` target)
- Remote apps do NOT have their own serve targets
- Remote apps are built (not served) to generate `remoteEntry.json` files
- All access to remote apps must go through the shell at `http://localhost:4200`

#### Remote Application Structure

Remote applications are configured as **pure remote modules**:

```typescript
// apps/app1/src/main.ts
// This is a pure remote module - no standalone bootstrap
// The shell application handles initialization and loading
// All exposed modules are defined in federation.config.mjs
```

Key differences from traditional applications:
- **No `initFederation()` call**: Remote apps don't initialize federation
- **No `bootstrapApplication()` call**: Remote apps don't bootstrap themselves
- **No serve targets**: Remote apps cannot be started independently
- **Build-only**: Remote apps are only built to generate federation bundles

#### Adding to App Selector

To add a new remote application to the app selector:

1. **Add to app selector component** (`apps/shell/src/app/components/app-selector/app-selector.component.ts`):

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
  // Add new app here
  {
    id: 'app3',
    name: 'Application 3',
    description: 'Third remote application module',
    route: '/app3'
  }
];
```

2. **Add to shell's serve dependencies** (`apps/shell/project.json`):

```json
{
  "serve": {
    "dependsOn": ["app1:build", "app2:build", "app3:build"]
  }
}
```

3. **Add route configuration** (see `docs/ADDING_REMOTE_APPS.md` for details)

### Dependency Sharing

Native Federation automatically shares common dependencies:

```typescript
// Automatically shared:
- @angular/core
- @angular/common
- @angular/router
- rxjs
- zone.js
```

**Singleton Behavior**: Shared dependencies are loaded once and reused across all applications, ensuring:
- Smaller bundle sizes
- Consistent versions
- Shared service instances (for services marked with `providedIn: 'root'`)

## Singleton Service Pattern

### Why Singletons Matter

In a micro-frontend architecture, certain services must be **singletons** to maintain consistent state across all applications:

- **AuthService**: One authentication state for all apps
- **EventBusService**: One event bus for inter-app communication
- **ThemeService**: One theme configuration

### How Singletons Work

Angular services with `providedIn: 'root'` become singletons when dependencies are shared:

```typescript
@Injectable({
  providedIn: 'root'  // This makes it a singleton
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // All apps share this same instance and state
}
```

### Singleton Flow

```
Shell Application (loads first)
  └── Creates AuthService instance
      ├── Stores in root injector
      └── Observable: currentUser$ = null

User logs in
  └── AuthService.login() called
      └── currentUser$ = { id: 1, name: "John" }

Remote App1 loads
  └── Injects AuthService
      └── Gets SAME instance from shell
          └── currentUser$ = { id: 1, name: "John" } ✓

Remote App2 loads
  └── Injects AuthService
      └── Gets SAME instance from shell
          └── currentUser$ = { id: 1, name: "John" } ✓
```

### Verifying Singleton Behavior

All services in `libs/shared/` are designed as singletons:

```typescript
// libs/shared/data-access-auth/src/lib/services/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService { }

// libs/shared/util-event-bus/src/lib/event-bus.service.ts
@Injectable({ providedIn: 'root' })
export class EventBusService { }

// libs/shared/util-theming/src/lib/theme.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeService { }
```

## Event Bus Communication

### Architecture

The Event Bus implements a **publish-subscribe pattern** for decoupled communication between applications:

```
┌─────────────┐         ┌─────────────────┐         ┌─────────────┐
│   Shell     │────────▶│   EventBus      │◀────────│   Remote    │
│ Application │         │   (Singleton)   │         │ Application │
└─────────────┘         └─────────────────┘         └─────────────┘
     │ emit()                   │                         │ on()
     │                          │                         │
     └──────────────────────────┼─────────────────────────┘
                                │
                        ┌───────▼────────┐
                        │  events$ (RxJS │
                        │   Observable)  │
                        └────────────────┘
```

### Implementation

#### Event Bus Service

```typescript
@Injectable({ providedIn: 'root' })
export class EventBusService {
  private eventSubject = new Subject<AppEvent>();
  public events$: Observable<AppEvent> = this.eventSubject.asObservable();

  emit(event: AppEvent): void {
    this.eventSubject.next({
      ...event,
      timestamp: event.timestamp || Date.now()
    });
  }

  on(eventType: string): Observable<AppEvent> {
    return this.events$.pipe(
      filter(event => event.type === eventType)
    );
  }
}
```

#### Event Model

```typescript
export interface AppEvent {
  type: string;        // Event identifier
  payload?: any;       // Event data
  timestamp?: number;  // When event occurred
  source?: string;     // Which app emitted it
}
```

### Usage Examples

#### Example 1: User Login Event

```typescript
// Shell application - emit event when user logs in
@Component({ ... })
export class LoginComponent {
  private eventBus = inject(EventBusService);
  private authService = inject(AuthService);

  login() {
    this.authService.login(credentials).subscribe(user => {
      this.eventBus.emit({
        type: 'USER_LOGGED_IN',
        payload: { userId: user.id, email: user.email },
        source: 'shell'
      });
    });
  }
}

// Remote application - listen for login event
@Component({ ... })
export class RemoteAppComponent {
  private eventBus = inject(EventBusService);

  ngOnInit() {
    this.eventBus.on('USER_LOGGED_IN').subscribe(event => {
      console.log('User logged in:', event.payload);
      this.loadUserData(event.payload.userId);
    });
  }
}
```

#### Example 2: Data Refresh Event

```typescript
// Remote App1 - notify others about data changes
export class DataFormComponent {
  private eventBus = inject(EventBusService);

  saveData() {
    this.dataService.save(data).subscribe(() => {
      this.eventBus.emit({
        type: 'DATA_UPDATED',
        payload: { entityId: data.id, entityType: 'item' },
        source: 'app1'
      });
    });
  }
}

// Remote App2 - refresh when data changes
export class DataListComponent {
  private eventBus = inject(EventBusService);

  ngOnInit() {
    this.eventBus.on('DATA_UPDATED').subscribe(event => {
      if (event.payload.entityType === 'item') {
        this.refreshDataList();
      }
    });
  }
}
```

### Event Types

Define event types as constants for type safety:

```typescript
// libs/shared/util-event-bus/src/lib/models/event-types.ts
export const EventTypes = {
  USER_LOGGED_IN: 'USER_LOGGED_IN',
  USER_LOGGED_OUT: 'USER_LOGGED_OUT',
  DATA_UPDATED: 'DATA_UPDATED',
  THEME_CHANGED: 'THEME_CHANGED',
  NOTIFICATION_SHOWN: 'NOTIFICATION_SHOWN'
} as const;

export type EventType = typeof EventTypes[keyof typeof EventTypes];
```

## Theming System

### Architecture

The theming system uses **CSS custom properties** with a centralized service:

```
┌──────────────────────────────────────────────────────────┐
│                  ThemeService (Singleton)                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │  setTheme(themeName)                               │  │
│  │  ├── Validate theme exists                         │  │
│  │  ├── Update document.documentElement               │  │
│  │  │   └── [data-theme="themeName"]                  │  │
│  │  └── Emit theme change event                       │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│                   CSS Custom Properties                   │
│  [data-theme="default"] {                                │
│    --primary-color: #667eea;                             │
│    --secondary-color: #764ba2;                           │
│  }                                                        │
│  [data-theme="app1"] {                                   │
│    --primary-color: #667eea;                             │
│    --secondary-color: #764ba2;                           │
│  }                                                        │
└──────────────────────────────────────────────────────────┘
```

### Implementation

#### Theme Service

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<string>('default');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  setTheme(themeName: string): void {
    if (!THEMES[themeName]) {
      console.warn(`Theme "${themeName}" not found.`);
      themeName = 'default';
    }
    document.documentElement.setAttribute('data-theme', themeName);
    this.currentThemeSubject.next(themeName);
  }

  setThemeFromRoute(route: string): void {
    const routeThemeMap: Record<string, string> = {
      '/app1': 'app1',
      '/app2': 'app2',
    };
    const baseRoute = '/' + route.split('/').filter(Boolean)[0];
    const themeName = routeThemeMap[baseRoute] || 'default';
    this.setTheme(themeName);
  }
}
```

#### Theme Configuration

```typescript
// libs/shared/util-theming/src/lib/themes/theme-config.ts
export interface Theme {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

export const THEMES: Record<string, Theme> = {
  default: {
    name: 'default',
    displayName: 'Default Theme',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      background: '#ffffff',
      text: '#333333'
    }
  },
  app1: { /* ... */ },
  app2: { /* ... */ }
};
```

#### CSS Implementation

```scss
// Global styles (e.g., styles.scss)
:root {
  // Default theme variables
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --background-color: #ffffff;
  --text-color: #333333;
}

[data-theme="app1"] {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  // ... other app1 colors
}

[data-theme="app2"] {
  --primary-color: #3b82f6;
  --secondary-color: #8b5cf6;
  // ... other app2 colors
}

// Component styles use CSS variables
.button {
  background-color: var(--primary-color);
  color: var(--text-color);
}
```

### Route-Based Theming

The shell application automatically changes themes based on the current route:

```typescript
// Shell app component
export class App implements OnInit {
  private router = inject(Router);
  private themeService = inject(ThemeService);

  ngOnInit() {
    // Set theme on initial load
    this.themeService.setThemeFromRoute(this.router.url);

    // Update theme on navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.themeService.setThemeFromRoute(event.url);
    });
  }
}
```

## Authentication Flow

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                       │
└─────────────────────────────────────────────────────────────┘

1. User visits protected route
   │
   ├──▶ authGuard.canActivate()
   │    ├── Check if user is authenticated
   │    └── If not, redirect to /login
   │
2. User submits login form
   │
   ├──▶ AuthService.login(credentials)
   │    ├── POST /api/auth/login
   │    ├── Receive { user, token, refreshToken }
   │    ├── TokenService.setToken(token)
   │    ├── TokenService.setRefreshToken(refreshToken)
   │    ├── Update currentUserSubject
   │    └── Emit USER_LOGGED_IN event
   │
3. User navigates to protected route
   │
   ├──▶ authGuard.canActivate()
   │    ├── User is authenticated ✓
   │    └── Allow access
   │
4. API request is made
   │
   ├──▶ authInterceptor.intercept()
   │    ├── Get token from TokenService
   │    ├── Add Authorization header
   │    └── If 401 response:
   │         ├── Try to refresh token
   │         └── Retry original request
   │
5. Token expires
   │
   ├──▶ authInterceptor detects 401
   │    ├── Call AuthService.refreshToken()
   │    ├── POST /api/auth/refresh
   │    ├── Receive new token
   │    ├── Update TokenService
   │    └── Retry original request
   │
6. User logs out
   │
   └──▶ AuthService.logout()
        ├── POST /api/auth/logout
        ├── TokenService.clearTokens()
        ├── Update currentUserSubject to null
        ├── Emit USER_LOGGED_OUT event
        └── Navigate to /login
```

### Key Components

#### 1. Auth Service

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.currentUser$.pipe(map(user => !!user));

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.tokenService.getToken();
    if (token) {
      this.checkAuth().subscribe();
    }
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.http.post<{ user: User; token: string }>('/api/auth/login', credentials)
      .pipe(
        tap(response => {
          this.tokenService.setToken(response.token);
          this.currentUserSubject.next(response.user);
        }),
        map(response => response.user)
      );
  }
}
```

#### 2. Token Service

```typescript
@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}
```

#### 3. Auth Guard

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};
```

#### 4. Auth Interceptor

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Handle token refresh
      }
      return throwError(() => error);
    })
  );
};
```

### Security Considerations

1. **Token Storage**: Tokens are stored in localStorage (consider httpOnly cookies for production)
2. **Token Refresh**: Automatic token refresh on 401 responses
3. **HTTPS Only**: Always use HTTPS in production
4. **CSRF Protection**: Implement CSRF tokens for state-changing operations
5. **XSS Prevention**: Sanitize user inputs, use Angular's built-in sanitization

## Directory Structure Details

### Application Structure

```
apps/
├── shell/                          # Host application
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.ts                    # Root component
│   │   │   ├── app.config.ts             # DI providers, router
│   │   │   ├── app.routes.ts             # Route configuration
│   │   │   ├── dashboard/                # Dashboard feature
│   │   │   └── login/                    # Login feature
│   │   ├── main.ts                       # Federation initialization
│   │   ├── bootstrap.ts                  # Application bootstrap
│   │   └── styles.scss                   # Global styles
│   ├── public/
│   │   └── federation.manifest.json      # Remote app registry
│   ├── project.json                      # NX configuration
│   └── tsconfig.app.json                 # TypeScript config
│
├── app1/                           # Remote application
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.ts                    # Exposed component
│   │   │   ├── app.config.ts
│   │   │   └── app.routes.ts
│   │   ├── main.ts                       # Entry point
│   │   └── bootstrap.ts
│   └── project.json                      # Federation config
│
└── {app}-e2e/                      # E2E tests
    ├── src/
    │   └── example.spec.ts
    └── playwright.config.ts
```

### Library Structure

```
libs/
└── shared/
    ├── data-access-auth/               # Authentication
    │   ├── src/
    │   │   ├── index.ts                      # Public API
    │   │   └── lib/
    │   │       ├── services/
    │   │       │   ├── auth.service.ts
    │   │       │   ├── token.service.ts
    │   │       │   └── logout.service.ts
    │   │       ├── guards/
    │   │       │   └── auth.guard.ts
    │   │       ├── interceptors/
    │   │       │   └── auth.interceptor.ts
    │   │       └── models/
    │   │           └── user.model.ts
    │   ├── project.json
    │   └── tsconfig.lib.json
    │
    ├── ui-common/                      # UI Components
    │   ├── src/
    │   │   ├── index.ts
    │   │   └── lib/
    │   │       ├── shell-layout/
    │   │       ├── notification/
    │   │       ├── banner/
    │   │       └── user-menu/
    │   └── project.json
    │
    ├── util-event-bus/                 # Event Bus
    │   └── [similar structure]
    │
    └── util-theming/                   # Theming
        └── [similar structure]
```

### Key Files

- **index.ts**: Public API of each library (barrel file)
- **project.json**: NX project configuration
- **tsconfig.base.json**: Path mappings for imports
- **federation.manifest.json**: Remote app registry

## Dependency Graph

### Conceptual Graph

```
┌─────────────────────────────────────────────────────────┐
│                   Shell Application                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Depends on:                                      │  │
│  │  • @org/data-access-auth                          │  │
│  │  • @org/ui-common                                 │  │
│  │  • @org/util-theming                              │  │
│  │  • @org/util-event-bus                            │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
┌─────────▼──────┐             ┌──────────▼──────┐
│  Remote App1   │             │  Remote App2     │
│  ┌──────────┐  │             │  ┌──────────┐   │
│  │ May use: │  │             │  │ May use: │   │
│  │ • auth   │  │             │  │ • auth   │   │
│  │ • events │  │             │  │ • events │   │
│  │ • theme  │  │             │  │ • theme  │   │
│  └──────────┘  │             │  └──────────┘   │
└────────────────┘             └─────────────────┘
          │                               │
          └───────────────┬───────────────┘
                          │
              ┌───────────▼──────────┐
              │  Shared Libraries    │
              │  ┌────────────────┐  │
              │  │ All libraries  │  │
              │  │ are available  │  │
              │  │ to all apps    │  │
              │  └────────────────┘  │
              └──────────────────────┘
```

### View Actual Graph

```bash
# Open interactive dependency graph
npx nx graph

# View specific project dependencies
npx nx graph --focus=shell

# Show affected projects
npx nx affected:graph
```

## Best Practices

### 1. Library Organization

**DO**:
- Keep libraries small and focused
- Use clear naming conventions: `{scope}/{type}-{name}`
- Export only what's needed via index.ts
- Document public APIs

**DON'T**:
- Create circular dependencies
- Export internal implementation details
- Mix concerns in a single library

### 2. Service Design

**DO**:
- Use `providedIn: 'root'` for singleton services
- Keep services stateless when possible
- Use RxJS for reactive state management
- Document service lifetime and scope

**DON'T**:
- Create service instances in constructors
- Store large amounts of data in memory
- Create tight coupling between services

### 3. Component Communication

**DO**:
- Use event bus for cross-app communication
- Use Angular services for same-app communication
- Keep event payloads small and serializable
- Document event types and payloads

**DON'T**:
- Pass large objects in events
- Create circular event dependencies
- Use events for synchronous operations

### 4. Performance

**DO**:
- Lazy load remote applications
- Use OnPush change detection
- Minimize bundle sizes
- Cache HTTP responses

**DON'T**:
- Load all remotes at startup
- Create memory leaks with subscriptions
- Bundle large assets with code

### 5. Testing

**DO**:
- Write unit tests for business logic
- Use E2E tests for critical user flows
- Mock external dependencies
- Test error scenarios

**DON'T**:
- Test implementation details
- Skip error handling tests
- Create brittle E2E tests

### 6. Module Federation

**DO**:
- Version your remote applications
- Use semantic versioning
- Test integration points
- Monitor production loading

**DON'T**:
- Break API contracts without versioning
- Deploy incompatible versions
- Assume remotes are always available

## Performance Considerations

### Bundle Size Optimization

1. **Tree Shaking**: Unused code is automatically removed
2. **Code Splitting**: Each route is a separate chunk
3. **Lazy Loading**: Remote apps load on-demand
4. **Shared Dependencies**: Common libraries loaded once

### Runtime Performance

1. **Change Detection**: Use OnPush strategy
2. **Virtual Scrolling**: For large lists
3. **Memoization**: Cache expensive computations
4. **Service Workers**: For caching and offline support

### Loading Performance

1. **Preloading**: Preload likely-needed remotes
2. **Caching**: Browser cache for static assets
3. **CDN**: Serve static files from CDN
4. **Compression**: Enable gzip/brotli

### Monitoring

```typescript
// Example: Monitor remote loading time
const startTime = performance.now();
loadRemoteModule('app1', './Component').then(() => {
  const loadTime = performance.now() - startTime;
  console.log(`App1 loaded in ${loadTime}ms`);
});
```

## Security Considerations

### Authentication Security

1. **Token Storage**:
   - Consider httpOnly cookies instead of localStorage
   - Implement token rotation
   - Set appropriate expiration times

2. **Authorization**:
   - Validate permissions server-side
   - Use route guards for client-side protection
   - Implement role-based access control

### XSS Prevention

1. **Input Sanitization**: Use Angular's DomSanitizer
2. **Content Security Policy**: Implement strict CSP headers
3. **Template Security**: Never use innerHTML with user input

### CSRF Protection

1. **CSRF Tokens**: Include CSRF tokens in state-changing requests
2. **SameSite Cookies**: Use SameSite=Strict for cookies

### Dependency Security

1. **Regular Updates**: Keep dependencies up to date
2. **Security Audits**: Run `npm audit` regularly
3. **Trusted Sources**: Only use trusted packages

### Federation Security

1. **HTTPS Only**: Always use HTTPS in production
2. **Integrity Checks**: Verify remote module integrity
3. **Error Handling**: Graceful fallbacks for loading failures

```typescript
// Example: Safe remote loading with fallback
loadRemoteModule('app1', './Component')
  .then(module => module.default)
  .catch(error => {
    console.error('Failed to load remote:', error);
    return FallbackComponent; // Show error state
  });
```

---

## Summary

This architecture provides:
- **Scalability**: Easy to add new applications
- **Independence**: Teams work autonomously
- **Performance**: Optimized loading and caching
- **Maintainability**: Clear separation of concerns
- **Flexibility**: Technology choices per application

For more information, see:
- [README.md](./README.md) - Getting started guide
- [docs/ADDING_REMOTE_APPS.md](./docs/ADDING_REMOTE_APPS.md) - Adding new applications

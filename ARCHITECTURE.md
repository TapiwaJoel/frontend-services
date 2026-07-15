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

1. **Shell Application (Host)**: The single orchestrator and entry point that loads remote applications (Port 4200)
2. **Remote Applications**: Pure remote modules organized in nested domain structure
   - **Umdzidzisi Domain**: website (4201), admin (4203), client (4205)
   - **Umtengesi Domain**: website (4202), admin (4204), client (4206)
3. **Shared Libraries**: Common functionality shared across all applications
4. **Federation Manifest**: Registry of all 6 available remote applications
5. **Singleton Services**: Shared service instances across all applications

### Single Entry Point Pattern

This architecture enforces a **single entry point** through the shell application:

- **Shell-Only Access**: All 6 remote applications can ONLY be accessed through the shell
- **No Independent Running**: Remote applications cannot be started or accessed independently
- **App Selector UI**: Users select which application to run from the shell's dashboard
- **Centralized Authentication**: All authentication and routing is handled by the shell
- **Unified Navigation**: All inter-app navigation flows through the shell's routing system
- **Domain Organization**: Applications organized by domain (umdzidzisi, umtengesi) with type variants (website, admin, client)

#### Why Single Entry Point?

1. **Security**: Centralized authentication and authorization control
2. **Consistency**: Unified user experience and navigation
3. **Control**: Single point for access management and monitoring
4. **Simplicity**: Users only need to know one URL (the shell)
5. **Maintenance**: Easier to manage updates and deployments

### Application Types

Each domain (umdzidzisi, umtengesi) contains three distinct application types, each serving a specific purpose:

#### 1. Website Applications (Ports 4201, 4202)

**Purpose**: Public-facing website applications

**Characteristics**:

- Customer-facing features and content
- Marketing and landing pages
- Public information and resources
- May have anonymous access with optional authentication
- SEO-optimized content
- Responsive design for all devices

**Use Cases**:

- Product catalogs
- Company information
- Blog and news articles
- Contact forms
- Public documentation

#### 2. Admin Applications (Ports 4203, 4204)

**Purpose**: Administrative portal applications

**Characteristics**:

- Internal management tools and interfaces
- System configuration and settings
- User and role management
- Content management capabilities
- Analytics and reporting dashboards
- Requires elevated permissions

**Use Cases**:

- System administration
- User account management
- Content publishing workflows
- System monitoring and logs
- Configuration management

#### 3. Client Applications (Ports 4205, 4206)

**Purpose**: Client dashboard applications

**Characteristics**:

- Authenticated user dashboards
- Personalized user experiences
- Client-specific features and data
- Self-service capabilities
- Account management
- Role-based access control

**Use Cases**:

- User profile management
- Personal dashboards
- Account settings
- Service usage tracking
- Support ticket management

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
  .catch((err) => console.error(err))
  .then((_) => import('./bootstrap'))
  .catch((err) => console.error(err));
```

#### Federation Manifest (federation.manifest.json)

```json
{
  "umdzidzisi-website": "http://localhost:4201/remoteEntry.json",
  "umdzidzisi-admin": "http://localhost:4203/remoteEntry.json",
  "umdzidzisi-client": "http://localhost:4205/remoteEntry.json",
  "umtengesi-website": "http://localhost:4202/remoteEntry.json",
  "umtengesi-admin": "http://localhost:4204/remoteEntry.json",
  "umtengesi-client": "http://localhost:4206/remoteEntry.json"
}
```

This manifest tells the shell where to find all 6 remote applications:

- **Development**: Points to localhost with dedicated ports (4201-4206)
- **Production**: Points to actual deployed URLs
- **Naming Convention**: `{domain}-{type}` format for clear identification

#### Route Configuration (app.routes.ts)

```typescript
import { loadRemoteModule } from '@angular-architects/native-federation';

export const appRoutes: Routes = [
  // Umdzidzisi Domain
  {
    path: 'umdzidzisi/website',
    canActivate: [authGuard],
    loadChildren: () => loadRemoteModule('umdzidzisi-website', './Component').then((m) => [{ path: '', component: m.default }]),
  },
  {
    path: 'umdzidzisi/admin',
    canActivate: [authGuard],
    loadChildren: () => loadRemoteModule('umdzidzisi-admin', './Component').then((m) => [{ path: '', component: m.default }]),
  },
  {
    path: 'umdzidzisi/client',
    canActivate: [authGuard],
    loadChildren: () => loadRemoteModule('umdzidzisi-client', './Component').then((m) => [{ path: '', component: m.default }]),
  },
  // Similar structure for umtengesi domain...
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

To run the application stack, you have several options:

```bash
# Start the shell with website remotes (umdzidzisi-website, umtengesi-website)
npm start

# Start specific domain applications
npm run umdzidzisi:website    # Shell + umdzidzisi-website
npm run umdzidzisi:admin      # Shell + umdzidzisi-admin
npm run umdzidzisi:client     # Shell + umdzidzisi-client

npm run umtengesi:website    # Shell + umtengesi-website
npm run umtengesi:admin      # Shell + umtengesi-admin
npm run umtengesi:client     # Shell + umtengesi-client
```

The shell's serve configuration includes a `dependsOn` array that automatically builds remote applications before starting:

```json
{
  "serve": {
    "executor": "@angular-architects/native-federation:build",
    "dependsOn": ["umdzidzisi-website:build", "umdzidzisi-admin:build", "umdzidzisi-client:build", "umtengesi-website:build", "umtengesi-admin:build", "umtengesi-client:build"],
    "options": {
      "target": "shell:serve-original:development"
    }
  }
}
```

**Important Notes:**

- The shell runs on port 4200 (configured in `serve-original` target)
- Each remote app has a dedicated port (4201-4206)
- Remote apps do NOT have their own serve targets
- Remote apps are built (not served) to generate `remoteEntry.json` files
- All access to remote apps must go through the shell at `http://localhost:4200`

#### Remote Application Structure

Remote applications are configured as **pure remote modules** in a nested structure:

```
apps/
├── umdzidzisi/                       # Umdzidzisi domain
│   ├── website/                # Port 4201
│   │   └── src/main.ts         # Pure remote module
│   ├── admin/                  # Port 4203
│   │   └── src/main.ts         # Pure remote module
│   └── client/                 # Port 4205
│       └── src/main.ts         # Pure remote module
│
├── umtengesi/                       # Umtengesi domain
│   ├── website/                # Port 4202
│   │   └── src/main.ts         # Pure remote module
│   ├── admin/                  # Port 4204
│   │   └── src/main.ts         # Pure remote module
│   └── client/                 # Port 4206
│       └── src/main.ts         # Pure remote module
│
└── e2e/                        # E2E test projects
    ├── shell/                  # E2E tests for shell application
    ├── umdzidzisi/                   # E2E tests for Umdzidzisi domain
    │   ├── website/            # E2E tests for umdzidzisi-website
    │   ├── admin/              # E2E tests for umdzidzisi-admin
    │   └── client/             # E2E tests for umdzidzisi-client
    └── umtengesi/                   # E2E tests for Umtengesi domain
        ├── website/            # E2E tests for umtengesi-website
        ├── admin/              # E2E tests for umtengesi-admin
        └── client/             # E2E tests for umtengesi-client
```

Each remote application's main.ts:

```typescript
// This is a pure remote module - no standalone bootstrap
// The shell application handles initialization and loading
// All exposed modules are defined in federation.config.mjs
```

Key differences from traditional applications:

- **No `initFederation()` call**: Remote apps don't initialize federation
- **No `bootstrapApplication()` call**: Remote apps don't bootstrap themselves
- **No serve targets**: Remote apps cannot be started independently
- **Build-only**: Remote apps are only built to generate federation bundles
- **Nested structure**: Organized by domain (umdzidzisi/umtengesi) and type (website/admin/client)

#### Adding to App Selector

To add a new remote application to the app selector:

1. **Add to app selector component** (`apps/shell/src/app/components/app-selector/app-selector.component.ts`):

```typescript
availableApps: RemoteApp[] = [
  // Umdzidzisi Domain
  {
    id: 'umdzidzisi-website',
    name: 'Umdzidzisi Website',
    description: 'Public-facing website for Umdzidzisi',
    route: '/umdzidzisi/website'
  },
  {
    id: 'umdzidzisi-admin',
    name: 'Umdzidzisi Admin',
    description: 'Administration portal for Umdzidzisi',
    route: '/umdzidzisi/admin'
  },
  {
    id: 'umdzidzisi-client',
    name: 'Umdzidzisi Client',
    description: 'Client dashboard for Umdzidzisi',
    route: '/umdzidzisi/client'
  },
  // Umtengesi Domain
  {
    id: 'umtengesi-website',
    name: 'Umtengesi Website',
    description: 'Public-facing website for Umtengesi',
    route: '/umtengesi/website'
  },
  // ... and so on
];
```

2. **Add to shell's serve dependencies** (`apps/shell/project.json`):

```json
{
  "serve": {
    "dependsOn": ["umdzidzisi-website:build", "umdzidzisi-admin:build", "umdzidzisi-client:build", "umtengesi-website:build", "umtengesi-admin:build", "umtengesi-client:build"]
  }
}
```

3. **Add route configuration** (see `documentation/ADDING_REMOTE_APPS.md` for details)

4. **Update federation manifest** with new remote's URL

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
  providedIn: 'root', // This makes it a singleton
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

Remote Umdzidzisi loads
  └── Injects AuthService
      └── Gets SAME instance from shell
          └── currentUser$ = { id: 1, name: "John" } ✓

Remote Umtengesi loads
  └── Injects AuthService
      └── Gets SAME instance from shell
          └── currentUser$ = { id: 1, name: "John" } ✓
```

### Verifying Singleton Behavior

All services in `libs/shared/` are designed as singletons:

```typescript
// libs/shared/data-access-auth/src/lib/services/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {}

// libs/shared/util-event-bus/src/lib/event-bus.service.ts
@Injectable({ providedIn: 'root' })
export class EventBusService {}

// libs/shared/util-theming/src/lib/theme.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeService {}
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
      timestamp: event.timestamp || Date.now(),
    });
  }

  on(eventType: string): Observable<AppEvent> {
    return this.events$.pipe(filter((event) => event.type === eventType));
  }
}
```

#### Event Model

```typescript
export interface AppEvent {
  type: string; // Event identifier
  payload?: any; // Event data
  timestamp?: number; // When event occurred
  source?: string; // Which app emitted it
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
// Remote Umdzidzisi - notify others about data changes
export class DataFormComponent {
  private eventBus = inject(EventBusService);

  saveData() {
    this.dataService.save(data).subscribe(() => {
      this.eventBus.emit({
        type: 'DATA_UPDATED',
        payload: { entityId: data.id, entityType: 'item' },
        source: 'umdzidzisi',
      });
    });
  }
}

// Remote Umtengesi - refresh when data changes
export class DataListComponent {
  private eventBus = inject(EventBusService);

  ngOnInit() {
    this.eventBus.on('DATA_UPDATED').subscribe((event) => {
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
  NOTIFICATION_SHOWN: 'NOTIFICATION_SHOWN',
} as const;

export type EventType = (typeof EventTypes)[keyof typeof EventTypes];
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
│  [data-theme="umdzidzisi"] {                                   │
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
      '/umdzidzisi': 'umdzidzisi',
      '/umtengesi': 'umtengesi',
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
      text: '#333333',
    },
  },
  umdzidzisi: {/* ... */},
  umtengesi: {/* ... */},
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

[data-theme='umdzidzisi'] {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  // ... other umdzidzisi colors
}

[data-theme='umtengesi'] {
  --primary-color: #3b82f6;
  --secondary-color: #8b5cf6;
  // ... other umtengesi colors
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
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
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
  public isAuthenticated$ = this.currentUser$.pipe(map((user) => !!user));

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
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
    return this.http.post<{ user: User; token: string }>('/api/auth/login', credentials).pipe(
      tap((response) => {
        this.tokenService.setToken(response.token);
        this.currentUserSubject.next(response.user);
      }),
      map((response) => response.user),
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
    queryParams: { returnUrl: state.url },
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
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Handle token refresh
      }
      return throwError(() => error);
    }),
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
├── shell/                          # Host application (port 4200)
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
│   │   └── federation.manifest.json      # Remote app registry (6 remotes)
│   ├── project.json                      # NX configuration
│   └── tsconfig.app.json                 # TypeScript config
│
├── umdzidzisi/                           # Umdzidzisi domain (nested structure)
│   ├── website/                    # Port 4201 - Public-facing website
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── app.ts                # Exposed component
│   │   │   │   ├── app.config.ts
│   │   │   │   └── app.routes.ts
│   │   │   └── main.ts                   # Empty - pure remote
│   │   └── project.json                  # Build-only config
│   │
│   ├── admin/                      # Port 4203 - Administration portal
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── app.ts
│   │   │   │   ├── app.config.ts
│   │   │   │   └── app.routes.ts
│   │   │   └── main.ts
│   │   └── project.json
│   │
│   └── client/                     # Port 4205 - Client dashboard
│       ├── src/
│       │   ├── app/
│       │   │   ├── app.ts
│       │   │   ├── app.config.ts
│       │   │   └── app.routes.ts
│       │   └── main.ts
│       └── project.json
│
├── umtengesi/                           # Umtengesi domain (nested structure)
│   ├── website/                    # Port 4202
│   ├── admin/                      # Port 4204
│   └── client/                     # Port 4206
│
└── e2e/                            # E2E test projects
    ├── shell/                      # E2E tests for shell application
    ├── umdzidzisi/                       # E2E tests for Umdzidzisi domain
    │   ├── website/                # E2E tests for umdzidzisi-website
    │   ├── admin/                  # E2E tests for umdzidzisi-admin
    │   └── client/                 # E2E tests for umdzidzisi-client
    └── umtengesi/                       # E2E tests for Umtengesi domain
        ├── website/                # E2E tests for umtengesi-website
        ├── admin/                  # E2E tests for umtengesi-admin
        └── client/                 # E2E tests for umtengesi-client
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
│  │  • @mushaviri/data-access-auth                          │  │
│  │  • @mushaviri/ui-common                                 │  │
│  │  • @mushaviri/util-theming                              │  │
│  │  • @mushaviri/util-event-bus                            │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
┌─────────▼──────┐             ┌──────────▼──────┐
│  Remote Umdzidzisi   │             │  Remote Umtengesi     │
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
loadRemoteModule('umdzidzisi', './Component').then(() => {
  const loadTime = performance.now() - startTime;
  console.log(`Umdzidzisi loaded in ${loadTime}ms`);
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
loadRemoteModule('umdzidzisi', './Component')
  .then((module) => module.default)
  .catch((error) => {
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
- [documentation/ADDING_REMOTE_APPS.md](./documentation/ADDING_REMOTE_APPS.md) - Adding new applications

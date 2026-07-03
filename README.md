# Frontend Services - Angular Micro-Frontend Monorepo

A production-ready Angular monorepo implementing a **single entry point micro-frontend architecture** using NX and Native Federation. This project demonstrates modern frontend architecture patterns with a centralized shell, pure remote modules, shared libraries, and seamless inter-application communication.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture Diagram](#architecture-diagram)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Shared Libraries](#shared-libraries)
- [Module Federation Configuration](#module-federation-configuration)
- [Testing](#testing)
- [Build and Deployment](#build-and-deployment)
- [Learn More](#learn-more)

## Project Overview

This repository showcases a **single entry point micro-frontend architecture** powered by Angular, NX, and Native Federation. It consists of:

- **Shell Application (Host)**: The single entry point that orchestrates and loads remote applications
- **Remote Applications (Pure Modules)**: Build-only remote modules that can ONLY be accessed through the shell
- **App Selector UI**: Dashboard interface for selecting which application to run
- **Shared Libraries**: Reusable code shared across applications (authentication, theming, event bus, UI components)
- **API Services**: Backend services with product data

### Single Entry Point Pattern

This architecture enforces **single entry point access**:
- ✅ All applications accessed through the shell at `http://localhost:4200`
- ✅ Remote apps are pure modules - cannot run independently
- ✅ App selector UI for choosing which application to run
- ✅ Centralized authentication and routing
- ✅ Unified user experience

### Technology Stack

- **Angular 21.2.9** - Modern Angular with standalone components
- **NX 23.0.1** - Monorepo tooling and build optimization
- **Native Federation** - Module Federation for Angular with native ESM support
- **TypeScript 5.9** - Type-safe development
- **SCSS** - Styling with theming support
- **Vitest** - Fast unit testing
- **Playwright** - End-to-end testing
- **Docker** - Containerization support

## Architecture Diagram

```
                         Browser: http://localhost:4200
┌──────────────────────────────────────────────────────────────────┐
│                    Shell Application (Port 4200)                  │
│                        ** SINGLE ENTRY POINT **                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  • Authentication & Authorization                          │  │
│  │  • App Selector Dashboard (Choose App1 or App2)            │  │
│  │  • Native Federation Orchestration                         │  │
│  │  • Centralized Routing                                     │  │
│  │  • Shared Service Singletons                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                 │                                 │
│                   Dynamically Loads on Demand                     │
│                                 ↓                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              <router-outlet>                               │  │
│  │  ┌──────────────────────┐    ┌──────────────────────┐     │  │
│  │  │   App 1 (Remote)     │ OR │   App 2 (Remote)     │     │  │
│  │  │  • Pure Module       │    │  • Pure Module       │     │  │
│  │  │  • Build-Only        │    │  • Build-Only        │     │  │
│  │  │  • No Standalone     │    │  • No Standalone     │     │  │
│  │  └──────────────────────┘    └──────────────────────┘     │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                 │
                  Uses Shared Libraries (Singletons)
                                 ↓
                  ┌───────────────────────────┐
                  │   Shared Libraries        │
                  ├───────────────────────────┤
                  │ • data-access-auth        │
                  │ • ui-common               │
                  │ • util-event-bus          │
                  │ • util-theming            │
                  └───────────────────────────┘

Key Points:
✅ Users access ONLY the shell at localhost:4200
✅ App selector UI lets users choose which app to run
✅ Remote apps (app1, app2) cannot run independently
✅ All authentication handled by shell
✅ Remote apps built automatically when shell starts
```

## Project Structure

```
frontend-services/
├── apps/
│   ├── shell/                    # Host application (port 4200)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── app.ts              # Root component
│   │   │   │   ├── app.config.ts       # Application configuration
│   │   │   │   ├── app.routes.ts       # Routing with lazy-loaded remotes
│   │   │   │   ├── login/              # Login component
│   │   │   │   └── dashboard/          # Dashboard component
│   │   │   ├── main.ts                 # Entry point with federation init
│   │   │   └── bootstrap.ts            # Bootstrap logic
│   │   ├── public/
│   │   │   └── federation.manifest.json # Remote app manifest
│   │   └── project.json                # NX project configuration
│   │
│   ├── app1/                     # Remote application 1 (pure remote module)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── app.ts              # Exposed component (export default)
│   │   │   │   ├── app.config.ts
│   │   │   │   └── app.routes.ts
│   │   │   └── main.ts                 # Empty - pure remote module
│   │   └── project.json                # Build-only (no serve targets)
│   │
│   ├── app2/                     # Remote application 2 (pure remote module)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── app.ts              # Exposed component
│   │   │   │   ├── app.config.ts
│   │   │   │   └── app.routes.ts
│   │   │   └── main.ts                 # Empty - pure remote module
│   │   └── project.json                # Build-only (no serve targets)
│   │
│   ├── api/                      # Backend API service
│   │   └── [Express API with product data]
│   │
│   ├── shell-e2e/                # E2E tests for shell
│   ├── app1-e2e/                 # E2E tests for app1
│   └── app2-e2e/                 # E2E tests for app2
│
├── libs/
│   └── shared/                   # Shared libraries
│       ├── data-access-auth/     # Authentication services
│       │   ├── services/
│       │   │   ├── auth.service.ts
│       │   │   ├── token.service.ts
│       │   │   └── logout.service.ts
│       │   ├── guards/
│       │   │   └── auth.guard.ts
│       │   └── interceptors/
│       │       └── auth.interceptor.ts
│       │
│       ├── ui-common/            # Common UI components
│       │   ├── shell-layout/
│       │   ├── notification/
│       │   ├── banner/
│       │   └── user-menu/
│       │
│       ├── util-event-bus/       # Event bus for inter-app communication
│       │   ├── event-bus.service.ts
│       │   └── models/
│       │       ├── app-event.model.ts
│       │       └── event-types.ts
│       │
│       └── util-theming/         # Theming system
│           ├── theme.service.ts
│           └── themes/
│               └── theme-config.ts
│
├── packages/
│   ├── shop/                     # Shop-specific libraries
│   │   ├── feature-products/
│   │   ├── feature-product-detail/
│   │   ├── data/
│   │   └── shared-ui/
│   ├── api/
│   │   └── products/             # Product API library
│   └── shared/
│       └── models/               # Shared data models
│
├── nx.json                       # NX workspace configuration
├── tsconfig.base.json            # TypeScript base configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## Key Features

### 1. Single Entry Point Architecture
- **Centralized Access**: All applications accessed through a single shell URL
- **App Selector UI**: Interactive dashboard for choosing which application to run
- **Pure Remote Modules**: Remote apps are build-only and cannot run independently
- **Automatic Builds**: Remote apps built automatically when shell starts
- **Unified Authentication**: Single authentication flow for all applications

### 2. Micro-Frontend Architecture
- **Independent Deployment**: Each application can be built and deployed separately
- **Runtime Loading**: Remote applications are loaded on-demand at runtime
- **Lazy Loading**: Routes lazy-load remote applications only when needed
- **Version Independence**: Different applications can use different versions (with caution)

### 3. Native Federation
- **Modern ESM**: Uses native ES modules instead of Webpack Module Federation
- **Build Tool Agnostic**: Works with esbuild, Vite, and other modern build tools
- **Optimized Loading**: Efficient chunk splitting and caching
- **Manifest-Based**: Central manifest file for remote application discovery

### 4. Shared Services (Singleton Pattern)
- **Authentication**: Centralized auth state shared across all applications
- **Event Bus**: Pub/sub pattern for inter-application communication
- **Theming**: Consistent theming across all micro-frontends
- **UI Components**: Shared component library

### 5. Authentication Flow
- **Route Guards**: Protect routes with authentication checks
- **Token Management**: JWT token storage and refresh logic
- **HTTP Interceptor**: Automatic token injection in API calls
- **Logout Service**: Coordinated logout across all applications

### 6. Theming System
- **Route-Based Themes**: Automatic theme switching based on active route
- **CSS Custom Properties**: Theme variables using CSS custom properties
- **Multiple Themes**: Support for default, app1, and app2 themes
- **Service-Based**: Centralized theme management

### 7. Event Bus Communication
- **Type-Safe Events**: TypeScript interfaces for event payloads
- **RxJS Observable**: Reactive event streams
- **Filtered Subscriptions**: Subscribe to specific event types
- **Cross-Application**: Communication between shell and remotes

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd frontend-services
```

2. **Install dependencies**
```bash
npm install
```

### Running the Application

#### Start the Application (Single Entry Point)

Since this uses a **single entry point architecture**, you only need to start the shell:

```bash
# Start the shell (automatically builds all remote apps)
npm start

# Or using nx directly
npm exec nx serve shell
```

The shell will:
1. Automatically build app1 and app2 (configured via `dependsOn` in `project.json`)
2. Start on `http://localhost:4200`
3. Show the app selector dashboard
4. Allow you to choose which remote app to run

**Access the application**: Open `http://localhost:4200` in your browser

#### How It Works

1. Navigate to `http://localhost:4200`
2. Log in (if authentication is configured)
3. You'll see the **App Selector** dashboard
4. Click on an app card to load that remote application
5. The remote app loads dynamically within the shell

#### Development Commands

```bash
# Start the complete system
npm start

# Build all remote apps only (without starting shell)
npm run build:remotes

# Build everything (shell + all remotes)
npm run build:all
```

**Important**: Remote applications (app1, app2) do NOT have serve targets and cannot be started independently. They are built automatically when the shell starts.

### Application Architecture

| Application | Port | Can Run Independently? | Purpose |
|------------|------|----------------------|---------|
| Shell (Host) | 4200 | ✅ Yes | Single entry point, app orchestrator |
| App1 (Remote) | N/A | ❌ No | Pure remote module, build-only |
| App2 (Remote) | N/A | ❌ No | Pure remote module, build-only |
| API (Optional) | 3000 | ✅ Yes | Backend API service |

## Development Workflow

### Creating Components

```bash
# Create a component in a specific application
npx nx g @nx/angular:component my-component --project=app1

# Create a component in a shared library
npx nx g @nx/angular:component my-component --project=ui-common
```

### Adding Dependencies

```bash
# Install a new package
npm install <package-name>

# The package will be available to all applications and libraries
```

### Linting

```bash
# Lint all projects
npx nx run-many --target=lint

# Lint specific project
npx nx lint shell

# Lint with auto-fix
npx nx lint shell --fix
```

### Type Checking

```bash
# Check TypeScript types across all projects
npx nx run-many --target=typecheck
```

### Visualizing Dependencies

```bash
# Open interactive project graph
npx nx graph

# View specific project details
npx nx show project shell --web
```

## Adding New Remote Apps

See the detailed guide in [docs/ADDING_REMOTE_APPS.md](docs/ADDING_REMOTE_APPS.md) for step-by-step instructions on adding new remote applications to the monorepo.

**Quick Overview:**

1. Generate a new Angular application
2. Configure Native Federation
3. Add exposed modules
4. Update federation manifest
5. Configure routing in shell
6. Test integration

## Shared Libraries

### @org/data-access-auth

**Purpose**: Centralized authentication logic

**Exports**:
- `AuthService` - Login, logout, token refresh, user state management
- `TokenService` - Token storage and retrieval
- `LogoutService` - Coordinated logout
- `authGuard` - Route guard function
- `authInterceptor` - HTTP interceptor for token injection
- `User` - User model interface

**Usage**:
```typescript
import { inject } from '@angular/core';
import { AuthService, authGuard } from '@org/data-access-auth';

// In routes
export const routes: Routes = [
  {
    path: 'protected',
    canActivate: [authGuard],
    component: ProtectedComponent
  }
];

// In component
export class LoginComponent {
  private authService = inject(AuthService);

  login() {
    this.authService.login({ email, password }).subscribe();
  }
}
```

### @org/ui-common

**Purpose**: Shared UI components

**Exports**:
- `ShellLayoutComponent` - Main layout wrapper
- `NotificationComponent` - Toast notifications
- `BannerComponent` - Banner messages
- `UserMenuComponent` - User menu dropdown
- `NotificationService` - Notification management
- `BannerService` - Banner management

**Usage**:
```typescript
import { NotificationService } from '@org/ui-common';

export class MyComponent {
  private notificationService = inject(NotificationService);

  showNotification() {
    this.notificationService.show('Success!', 'success');
  }
}
```

### @org/util-event-bus

**Purpose**: Inter-application communication

**Exports**:
- `EventBusService` - Central event bus
- `AppEvent` - Event model
- Event type constants

**Usage**:
```typescript
import { EventBusService, AppEvent } from '@org/util-event-bus';

export class RemoteApp {
  private eventBus = inject(EventBusService);

  ngOnInit() {
    // Subscribe to events
    this.eventBus.on('USER_LOGGED_IN').subscribe(event => {
      console.log('User logged in:', event.payload);
    });

    // Emit events
    this.eventBus.emit({
      type: 'DATA_UPDATED',
      payload: { data: 'value' },
      timestamp: Date.now()
    });
  }
}
```

### @org/util-theming

**Purpose**: Application theming

**Exports**:
- `ThemeService` - Theme management
- `Theme` - Theme model
- `THEMES` - Theme configurations

**Usage**:
```typescript
import { ThemeService } from '@org/util-theming';

export class App {
  private themeService = inject(ThemeService);

  ngOnInit() {
    // Set theme from route
    this.router.events.subscribe(() => {
      this.themeService.setThemeFromRoute(this.router.url);
    });

    // Manually set theme
    this.themeService.setTheme('app1');
  }
}
```

## Module Federation Configuration

### Federation Manifest

The shell application uses a manifest file to discover remote applications:

**Location**: `apps/shell/public/federation.manifest.json`

```json
{
  "app1": "http://localhost:4201/remoteEntry.json",
  "app2": "http://localhost:4202/remoteEntry.json"
}
```

In production, these URLs would point to your deployed remote applications.

### Loading Remote Modules

Remote applications are loaded using the `loadRemoteModule` function:

```typescript
import { loadRemoteModule } from '@angular-architects/native-federation';

export const routes: Routes = [
  {
    path: 'app1',
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

### Shared Dependencies

Common dependencies (Angular, RxJS, etc.) are shared between applications to avoid duplication:

- Automatically handled by Native Federation
- Singleton services are shared across applications
- Version compatibility is enforced

## Testing

### Unit Tests

```bash
# Run all unit tests
npx nx run-many --target=test

# Run tests for specific project
npx nx test shell

# Run tests with coverage
npx nx test shell --coverage

# Run tests in watch mode
npx nx test shell --watch
```

### E2E Tests

```bash
# Run all e2e tests
npx nx run-many --target=e2e

# Run e2e tests for specific app
npx nx e2e shell-e2e

# Run e2e tests in headed mode
npx nx e2e shell-e2e --headed

# Run e2e tests in UI mode
npx nx e2e shell-e2e --ui
```

### Test Structure

- **Unit Tests**: Located alongside source files (`.spec.ts`)
- **E2E Tests**: Separate projects (`*-e2e`) using Playwright
- **Test Setup**: Vitest for unit tests, Playwright for e2e

## Build and Deployment

### Building Applications

```bash
# Build all applications
npx nx run-many --target=build

# Build specific application (production)
npx nx build shell --configuration=production

# Build specific application (development)
npx nx build shell --configuration=development

# Build with source maps
npx nx build shell --source-map
```

### Build Output

Build artifacts are generated in the `dist/` directory:

```
dist/
├── apps/
│   ├── shell/
│   │   └── browser/          # Shell build output
│   ├── app1/
│   │   └── browser/          # App1 build output
│   ├── app2/
│   │   └── browser/          # App2 build output
│   └── api/                  # API build output
```

### Deployment Strategy

#### Option 1: Independent Deployment

Each application can be deployed to its own domain/subdomain:

```
shell.example.com    → Shell application
app1.example.com     → Remote app 1
app2.example.com     → Remote app 2
```

Update `federation.manifest.json` with production URLs:

```json
{
  "app1": "https://app1.example.com/remoteEntry.json",
  "app2": "https://app2.example.com/remoteEntry.json"
}
```

#### Option 2: Monolithic Deployment

Deploy all applications together under the same domain:

```
example.com/              → Shell
example.com/remotes/app1/ → App1
example.com/remotes/app2/ → App2
```

#### Docker Deployment

```bash
# Build Docker images
npx nx run api:docker:build

# Run Docker containers
npx nx run api:docker:run

# Use Nx Release for versioning
npx nx release
```

### Environment Configuration

Create environment-specific configuration files:

```typescript
// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com',
  federationManifest: '/assets/federation.manifest.json'
};
```

### Build Optimization

- **Code Splitting**: Automatic chunk splitting for optimal loading
- **Tree Shaking**: Unused code is removed
- **Minification**: Production builds are minified
- **Caching**: Build cache with NX for faster rebuilds

## Useful Commands

```bash
# Development
npx nx serve shell                          # Serve shell app
npx nx serve app1                           # Serve remote app1
npx nx run-many --target=serve --parallel   # Serve multiple apps

# Building
npx nx build shell --configuration=production   # Production build
npx nx run-many --target=build                  # Build all projects
npx nx affected --target=build                  # Build affected projects

# Testing
npx nx test shell                           # Unit tests
npx nx e2e shell-e2e                        # E2E tests
npx nx run-many --target=test               # All unit tests

# Code Quality
npx nx lint shell                           # Lint project
npx nx lint shell --fix                     # Lint with auto-fix
npx nx format:write                         # Format code

# Project Management
npx nx graph                                # View dependency graph
npx nx list                                 # List installed plugins
npx nx show project shell --web             # View project details
npx nx affected:graph                       # Show affected projects

# Generators
npx nx g @nx/angular:app my-app             # Generate app
npx nx g @nx/angular:lib my-lib             # Generate library
npx nx g @nx/angular:component my-comp      # Generate component
```

## Learn More

### Architecture & Patterns

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation
- [docs/ADDING_REMOTE_APPS.md](./docs/ADDING_REMOTE_APPS.md) - Guide for adding new remote apps

### NX Documentation

- [NX Documentation](https://nx.dev/docs)
- [Angular Monorepo Tutorial](https://nx.dev/docs/getting-started/tutorials/angular-monorepo-tutorial)
- [Module Boundaries](https://nx.dev/docs/features/enforce-module-boundaries)

### Native Federation

- [Native Federation Docs](https://github.com/angular-architects/module-federation-plugin/blob/main/libs/native-federation/README.md)
- [Angular Architects Blog](https://www.angulararchitects.io/en/blog/)

### Angular Resources

- [Angular Documentation](https://angular.dev)
- [Angular Style Guide](https://angular.dev/style-guide)

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Run `npx nx affected --target=test --target=lint`
5. Submit a pull request

## License

MIT

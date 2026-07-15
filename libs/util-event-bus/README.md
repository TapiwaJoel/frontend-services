# util-event-bus

A cross-app event bus service for Angular applications using RxJS. This library provides a singleton service for publishing and subscribing to events across different parts of your application.

## Features

- Singleton event bus service using Angular's `providedIn: 'root'`
- Type-safe event handling with RxJS
- Event filtering by type
- Automatic timestamp generation
- Predefined common event types

## Installation

This library is part of the monorepo and can be imported from `@mushaviri/util-event-bus`.

## Usage

### Importing

```typescript
import { EventBusService, AppEvent, EventTypes } from '@mushaviri/util-event-bus';
```

### Emitting Events

```typescript
import { Component } from '@angular/core';
import { EventBusService, EventTypes } from '@mushaviri/util-event-bus';

@Component({
  selector: 'app-login',
  template: '...',
})
export class LoginComponent {
  constructor(private eventBus: EventBusService) {}

  onLogin(user: any) {
    this.eventBus.emit({
      type: EventTypes.USER_LOGGED_IN,
      payload: { userId: user.id, username: user.name },
      source: 'LoginComponent',
    });
  }
}
```

### Subscribing to Events

#### Subscribe to All Events

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventBusService } from '@mushaviri/util-event-bus';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-event-logger',
  template: '...',
})
export class EventLoggerComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  constructor(private eventBus: EventBusService) {}

  ngOnInit() {
    this.subscription = this.eventBus.events$.subscribe((event) => {
      console.log('Event received:', event);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
```

#### Subscribe to Specific Event Types

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventBusService, EventTypes } from '@mushaviri/util-event-bus';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-handler',
  template: '...',
})
export class NotificationHandlerComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  constructor(private eventBus: EventBusService) {}

  ngOnInit() {
    this.subscription = this.eventBus.on(EventTypes.NOTIFICATION_SHOW).subscribe((event) => {
      // Handle notification
      this.showNotification(event.payload);
    });
  }

  showNotification(payload: any) {
    // Show notification logic
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
```

## API

### AppEvent Interface

```typescript
export interface AppEvent {
  type: string; // Event type identifier
  payload: any; // Event data
  source?: string; // Optional source identifier
  timestamp?: number; // Unix timestamp (auto-generated if not provided)
}
```

### EventBusService

#### Properties

- `events$: Observable<AppEvent>` - Observable stream of all events

#### Methods

- `emit(event: AppEvent): void` - Emit an event to all subscribers
- `on(eventType: string): Observable<AppEvent>` - Get an observable filtered by event type

### Predefined Event Types

```typescript
export const EventTypes = {
  USER_LOGGED_IN: 'USER_LOGGED_IN',
  USER_LOGGED_OUT: 'USER_LOGGED_OUT',
  NOTIFICATION_SHOW: 'NOTIFICATION_SHOW',
  THEME_CHANGED: 'THEME_CHANGED',
} as const;
```

## Custom Event Types

You can define custom event types for your application:

```typescript
// Define custom event types
export const CustomEventTypes = {
  DATA_LOADED: 'DATA_LOADED',
  DATA_UPDATED: 'DATA_UPDATED',
  ERROR_OCCURRED: 'ERROR_OCCURRED',
} as const;

// Use custom event types
this.eventBus.emit({
  type: CustomEventTypes.DATA_LOADED,
  payload: { data: [...] }
});
```

## Best Practices

1. **Memory Management**: Always unsubscribe from events in `ngOnDestroy` to prevent memory leaks
2. **Type Safety**: Consider creating specific interfaces for your event payloads
3. **Event Naming**: Use clear, descriptive event type names
4. **Source Tracking**: Include the `source` property to track where events originate
5. **Singleton Pattern**: The service is provided in root, ensuring a single instance across the app

## Examples

### Theme Change Example

```typescript
// Theme service emitting event
export class ThemeService {
  constructor(private eventBus: EventBusService) {}

  changeTheme(theme: 'light' | 'dark') {
    // Apply theme...

    this.eventBus.emit({
      type: EventTypes.THEME_CHANGED,
      payload: { theme },
      source: 'ThemeService',
    });
  }
}

// Component listening to theme changes
export class HeaderComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  constructor(private eventBus: EventBusService) {}

  ngOnInit() {
    this.subscription = this.eventBus.on(EventTypes.THEME_CHANGED).subscribe((event) => {
      this.updateHeaderTheme(event.payload.theme);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
```

## Testing

The service includes comprehensive unit tests. You can use the service in tests by injecting it:

```typescript
import { TestBed } from '@angular/core/testing';
import { EventBusService } from '@mushaviri/util-event-bus';

describe('MyComponent', () => {
  let eventBus: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // ...
    });
    eventBus = TestBed.inject(EventBusService);
  });

  it('should emit event', (done) => {
    eventBus.events$.subscribe((event) => {
      expect(event.type).toBe('TEST_EVENT');
      done();
    });

    eventBus.emit({ type: 'TEST_EVENT', payload: {} });
  });
});
```

## Architecture

The event bus uses a Subject from RxJS to create a pub/sub pattern:

- Events are emitted through a private `Subject<AppEvent>`
- Subscribers receive events through the public `events$` observable
- The `on()` method provides filtered observables for specific event types
- The service is a singleton (providedIn: 'root') ensuring all components share the same instance

## Running unit tests

Run `nx test util-event-bus` to execute the unit tests.

## License

This library is part of the web-apps monorepo.

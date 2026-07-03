import { TestBed } from '@angular/core/testing';
import { EventBusService } from './event-bus.service';
import { AppEvent } from './models/app-event.model';
import { EventTypes } from './models/event-types';

describe('EventBusService', () => {
  let service: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventBusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit events', (done) => {
    const testEvent: AppEvent = {
      type: EventTypes.USER_LOGGED_IN,
      payload: { userId: '123' },
      source: 'test'
    };

    service.events$.subscribe(event => {
      expect(event.type).toBe(EventTypes.USER_LOGGED_IN);
      expect(event.payload).toEqual({ userId: '123' });
      expect(event.source).toBe('test');
      expect(event.timestamp).toBeDefined();
      done();
    });

    service.emit(testEvent);
  });

  it('should filter events by type', (done) => {
    const loginEvent: AppEvent = {
      type: EventTypes.USER_LOGGED_IN,
      payload: { userId: '123' }
    };

    const logoutEvent: AppEvent = {
      type: EventTypes.USER_LOGGED_OUT,
      payload: { userId: '123' }
    };

    service.on(EventTypes.USER_LOGGED_IN).subscribe(event => {
      expect(event.type).toBe(EventTypes.USER_LOGGED_IN);
      expect(event.payload).toEqual({ userId: '123' });
      done();
    });

    service.emit(logoutEvent);
    service.emit(loginEvent);
  });

  it('should add timestamp if not provided', (done) => {
    const testEvent: AppEvent = {
      type: EventTypes.NOTIFICATION_SHOW,
      payload: { message: 'Test notification' }
    };

    service.events$.subscribe(event => {
      expect(event.timestamp).toBeDefined();
      expect(typeof event.timestamp).toBe('number');
      done();
    });

    service.emit(testEvent);
  });

  it('should preserve timestamp if provided', (done) => {
    const customTimestamp = 1234567890;
    const testEvent: AppEvent = {
      type: EventTypes.THEME_CHANGED,
      payload: { theme: 'dark' },
      timestamp: customTimestamp
    };

    service.events$.subscribe(event => {
      expect(event.timestamp).toBe(customTimestamp);
      done();
    });

    service.emit(testEvent);
  });

  it('should be a singleton', () => {
    const service1 = TestBed.inject(EventBusService);
    const service2 = TestBed.inject(EventBusService);
    expect(service1).toBe(service2);
  });
});

import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppEvent } from './models/app-event.model';

@Injectable({
  providedIn: 'root',
})
export class EventBusService {
  private eventSubject: Subject<AppEvent> = new Subject<AppEvent>();
  public events$: Observable<AppEvent> = this.eventSubject.asObservable();

  /**
   * Emits an event to all subscribers
   * @param event The event to emit
   */
  public emit(event: AppEvent): void {
    const eventWithMetadata: AppEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
    };
    this.eventSubject.next(eventWithMetadata);
  }

  /**
   * Returns an observable filtered by event type
   * @param eventType The type of event to listen for
   * @returns Observable of events matching the specified type
   */
  public on(eventType: string): Observable<AppEvent> {
    return this.events$.pipe(filter((event) => event.type === eventType));
  }
}

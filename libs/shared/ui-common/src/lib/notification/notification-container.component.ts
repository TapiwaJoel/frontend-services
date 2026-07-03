import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';
import { NotificationComponent } from './notification.component';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule, NotificationComponent],
  template: `
    <div class="notification-container">
      @for (notification of notifications$ | async; track notification.id) {
        <app-notification
          [notification]="notification"
          (dismiss)="onDismiss($event)">
        </app-notification>
      }
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 1000;
      max-width: 400px;
      width: 100%;
    }
  `]
})
export class NotificationContainerComponent {
  notifications$;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = this.notificationService.notifications$;
  }

  onDismiss(id: string): void {
    this.notificationService.dismiss(id);
  }
}

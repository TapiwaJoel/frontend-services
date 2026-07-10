import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';
import { NotificationComponent } from './notification.component';

@Component({
  selector: 'org-notification-container',
  standalone: true,
  imports: [CommonModule, NotificationComponent],
  template: `
    <div class="notification-container">
      @for (notification of notifications(); track notification.id) {
        <org-notification
          [notification]="notification"
          (dismiss)="onDismiss($event)">
        </org-notification>
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
  private notificationService = inject(NotificationService);
  notifications = this.notificationService.notifications;

  onDismiss(id: string): void {
    this.notificationService.dismiss(id);
  }
}

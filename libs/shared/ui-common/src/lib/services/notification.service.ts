import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSignal = signal<Notification[]>([]);
  public notifications = this.notificationsSignal.asReadonly();

  show(notification: Omit<Notification, 'id'>): void {
    const id = this.generateId();
    const newNotification: Notification = { id, ...notification };

    const currentNotifications = this.notificationsSignal();
    this.notificationsSignal.set([...currentNotifications, newNotification]);

    if (notification.duration) {
      setTimeout(() => {
        this.dismiss(id);
      }, notification.duration);
    }
  }

  dismiss(id: string): void {
    this.notificationsSignal.update(notifications =>
      notifications.filter(notification => notification.id !== id)
    );
  }

  clear(): void {
    this.notificationsSignal.set([]);
  }

  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

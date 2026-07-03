import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BannerAction {
  label: string;
  handler: () => void;
}

export interface Banner {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  dismissible: boolean;
  actions?: BannerAction[];
}

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private bannersSubject = new BehaviorSubject<Banner[]>([]);
  public banners$: Observable<Banner[]> = this.bannersSubject.asObservable();

  show(banner: Omit<Banner, 'id'>): void {
    const id = this.generateId();
    const newBanner: Banner = { id, ...banner };

    const currentBanners = this.bannersSubject.value;
    this.bannersSubject.next([...currentBanners, newBanner]);
  }

  dismiss(id: string): void {
    const currentBanners = this.bannersSubject.value;
    this.bannersSubject.next(
      currentBanners.filter(banner => banner.id !== id)
    );
  }

  clear(): void {
    this.bannersSubject.next([]);
  }

  private generateId(): string {
    return `banner-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

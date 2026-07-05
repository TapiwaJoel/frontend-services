import { Injectable, signal } from '@angular/core';

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
  private bannersSignal = signal<Banner[]>([]);
  public banners = this.bannersSignal.asReadonly();

  show(banner: Omit<Banner, 'id'>): void {
    const id = this.generateId();
    const newBanner: Banner = { id, ...banner };

    const currentBanners = this.bannersSignal();
    this.bannersSignal.set([...currentBanners, newBanner]);
  }

  dismiss(id: string): void {
    this.bannersSignal.update(banners =>
      banners.filter(banner => banner.id !== id)
    );
  }

  clear(): void {
    this.bannersSignal.set([]);
  }

  private generateId(): string {
    return `banner-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

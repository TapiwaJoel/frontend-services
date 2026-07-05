import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerService } from '../services/banner.service';
import { BannerComponent } from './banner.component';

@Component({
  selector: 'app-banner-container',
  standalone: true,
  imports: [CommonModule, BannerComponent],
  template: `
    <div class="banner-container">
      @for (banner of banners(); track banner.id) {
        <app-banner
          [banner]="banner"
          (dismiss)="onDismiss($event)">
        </app-banner>
      }
    </div>
  `,
  styles: [`
    .banner-container {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
  `]
})
export class BannerContainerComponent {
  private bannerService = inject(BannerService);
  banners = this.bannerService.banners;

  onDismiss(id: string): void {
    this.bannerService.dismiss(id);
  }
}

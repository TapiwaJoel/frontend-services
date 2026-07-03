import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RemoteDetectionService } from '../../services/remote-detection.service';

export interface RemoteApp {
  id: string;
  name: string;
  description: string;
  route: string;
  icon?: string;
}

@Component({
  selector: 'org-app-selector',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app-selector.component.html',
  styleUrls: ['./app-selector.component.scss']
})
export class AppSelectorComponent implements OnInit {
  private remoteDetection = inject(RemoteDetectionService);

  // All configured applications
  private allApps: RemoteApp[] = [
    {
      id: 'app1',
      name: 'Application 1',
      description: 'First remote application module',
      route: '/app1'
    },
    {
      id: 'app2',
      name: 'Application 2',
      description: 'Second remote application module',
      route: '/app2'
    }
  ];

  // Filtered list of actually available apps
  availableApps: RemoteApp[] = [];
  isLoading = true;
  noAppsAvailable = false;

  async ngOnInit() {
    await this.loadAvailableApps();
  }

  private async loadAvailableApps() {
    this.isLoading = true;

    // Get list of available remotes
    const availableRemoteNames = this.remoteDetection.getAvailableRemotesSync();

    // Filter apps to only show available ones
    this.availableApps = this.allApps.filter(app =>
      availableRemoteNames.includes(app.id)
    );

    this.noAppsAvailable = this.availableApps.length === 0;
    this.isLoading = false;
  }
}

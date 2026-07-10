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
      id: 'umdzidzisi-website',
      name: 'Umdzidzisi Website',
      description: 'Umdzidzisi public website module',
      route: '/umdzidzisi-website'
    },
    {
      id: 'umdzidzisi-admin',
      name: 'Umdzidzisi Admin',
      description: 'Umdzidzisi admin portal module',
      route: '/umdzidzisi-admin'
    },
    {
      id: 'umdzidzisi-client',
      name: 'Umdzidzisi Client',
      description: 'Umdzidzisi client application module',
      route: '/umdzidzisi-client'
    },
    {
      id: 'umtengesi-website',
      name: 'Umtengesi Website',
      description: 'Umtengesi public website module',
      route: '/umtengesi-website'
    },
    {
      id: 'umtengesi-admin',
      name: 'Umtengesi Admin',
      description: 'Umtengesi admin portal module',
      route: '/umtengesi-admin'
    },
    {
      id: 'umtengesi-client',
      name: 'Umtengesi Client',
      description: 'Umtengesi client application module',
      route: '/umtengesi-client'
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

    // Check which remotes are available
    await this.remoteDetection.checkAllRemotes();

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

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type AuthMode = 'none' | 'optional' | 'required';

export interface RemoteConfig {
  url: string;
  auth: {
    mode: AuthMode;
  };
}

export type RemoteConfiguration = Record<string, RemoteConfig | string>;

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private remotes: RemoteConfiguration = environment.remotes;

  /**
   * Get the authentication mode for a specific remote app
   * @param remoteName The name of the remote app (e.g., 'umdzidzisi-website')
   * @returns The auth mode: 'none', 'optional', or 'required'
   */
  getAuthMode(remoteName: string): AuthMode {
    const config = this.remotes[remoteName];

    // Handle legacy string format (backward compatibility)
    if (typeof config === 'string') {
      // Default to required for backward compatibility
      return 'required';
    }

    // Return auth mode from config
    return config?.auth?.mode || 'required';
  }

  /**
   * Get the URL for a specific remote app
   * @param remoteName The name of the remote app
   * @returns The remote entry URL
   */
  getRemoteUrl(remoteName: string): string {
    const config = this.remotes[remoteName];

    // Handle both string and object formats
    if (typeof config === 'string') {
      return config;
    }

    return config?.url || '';
  }

  /**
   * Get all remote URLs in the format needed for initFederation()
   * @returns Record of remote names to URLs
   */
  getRemoteUrls(): Record<string, string> {
    const urls: Record<string, string> = {};

    Object.entries(this.remotes).forEach(([name, config]) => {
      urls[name] = typeof config === 'string' ? config : config.url;
    });

    return urls;
  }

  /**
   * Get all configured remote names
   * @returns Array of remote names
   */
  getAllRemoteNames(): string[] {
    return Object.keys(this.remotes);
  }

  /**
   * Check if a remote exists in the configuration
   * @param remoteName The name of the remote app
   * @returns True if the remote is configured
   */
  hasRemote(remoteName: string): boolean {
    return remoteName in this.remotes;
  }
}

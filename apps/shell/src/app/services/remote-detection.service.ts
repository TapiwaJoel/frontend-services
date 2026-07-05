import { Injectable, signal } from '@angular/core';

export interface FederationManifest {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class RemoteDetectionService {
  private manifest: FederationManifest = {};
  private availableRemotesSignal = signal<string[]>([]);
  public availableRemotes = this.availableRemotesSignal.asReadonly();
  private checkCache = new Map<string, { available: boolean; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private readonly REQUEST_TIMEOUT = 5000; // 5 seconds

  constructor() {
    this.loadManifest();
  }

  /**
   * Load the federation manifest from public folder
   */
  private async loadManifest(): Promise<void> {
    try {
      const response = await fetch('/federation.manifest.json');
      this.manifest = await response.json();
      await this.checkAllRemotes();
    } catch (error) {
      console.error('Failed to load federation manifest:', error);
    }
  }

  /**
   * Check if a single remote is available
   */
  async checkRemoteAvailability(remoteName: string): Promise<boolean> {
    // Check cache first
    const cached = this.checkCache.get(remoteName);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.available;
    }

    const manifestUrl = this.manifest[remoteName];
    if (!manifestUrl) {
      return false;
    }

    try {
      // Attempt to fetch the remoteEntry.json file
      const response = await fetch(manifestUrl, {
        method: 'HEAD',
        mode: 'cors',
        signal: AbortSignal.timeout(this.REQUEST_TIMEOUT)
      });

      const available = response.ok;

      // Cache the result
      this.checkCache.set(remoteName, {
        available,
        timestamp: Date.now()
      });

      return available;
    } catch (error) {
      // If fetch fails, remote is not available
      this.checkCache.set(remoteName, {
        available: false,
        timestamp: Date.now()
      });
      return false;
    }
  }

  /**
   * Check all remotes and update the available remotes list
   */
  async checkAllRemotes(): Promise<Map<string, boolean>> {
    const remoteNames = Object.keys(this.manifest);
    const results = new Map<string, boolean>();

    const checks = remoteNames.map(async (name) => {
      const available = await this.checkRemoteAvailability(name);
      results.set(name, available);
      return { name, available };
    });

    await Promise.all(checks);

    // Update the available remotes list
    const availableNames = Array.from(results.entries())
      .filter(([_, available]) => available)
      .map(([name, _]) => name);

    this.availableRemotesSignal.set(availableNames);

    return results;
  }

  /**
   * Get available remotes synchronously (from last check)
   */
  getAvailableRemotesSync(): string[] {
    return this.availableRemotesSignal();
  }

  /**
   * Clear the cache and re-check all remotes
   */
  async refreshAvailability(): Promise<void> {
    this.checkCache.clear();
    await this.checkAllRemotes();
  }

  /**
   * Get all configured remotes (regardless of availability)
   */
  getAllConfiguredRemotes(): string[] {
    return Object.keys(this.manifest);
  }
}

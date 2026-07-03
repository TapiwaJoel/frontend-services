import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RemoteDetectionService } from './remote-detection.service';

@Injectable({
  providedIn: 'root'
})
export class SmartNavigationService {
  constructor(
    private router: Router,
    private remoteDetection: RemoteDetectionService
  ) {}

  /**
   * Navigate intelligently after login based on available remotes
   */
  async navigateAfterLogin(): Promise<void> {
    try {
      // Wait a bit for remotes to be detected (in case the check is still in progress)
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get available remotes
      const availableRemotes = this.remoteDetection.getAvailableRemotesSync();

      console.log('Available remotes:', availableRemotes);

      if (availableRemotes.length === 0) {
        // No remotes available - go to dashboard with error message
        console.warn('No remote applications are currently available');
        await this.router.navigate(['/dashboard'], {
          queryParams: { error: 'no-remotes' }
        });
      } else if (availableRemotes.length === 1) {
        // Only one remote available - auto-navigate to it
        const remoteName = availableRemotes[0];
        console.log(`Auto-navigating to ${remoteName}`);
        await this.router.navigate([`/${remoteName}`]);
      } else {
        // Multiple remotes available - show dashboard selector
        console.log('Multiple remotes available, showing dashboard');
        await this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Error during smart navigation:', error);
      // Fallback to dashboard on error
      await this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Navigate to a specific remote if it's available
   */
  async navigateToRemote(remoteName: string): Promise<boolean> {
    const available = await this.remoteDetection.checkRemoteAvailability(remoteName);

    if (available) {
      await this.router.navigate([`/${remoteName}`]);
      return true;
    } else {
      console.warn(`Remote ${remoteName} is not available`);
      return false;
    }
  }
}

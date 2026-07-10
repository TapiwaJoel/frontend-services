import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RemoteDetectionService } from './remote-detection.service';

@Injectable({
  providedIn: 'root'
})
export class SmartNavigationService {
  private router = inject(Router);
  private remoteDetection = inject(RemoteDetectionService);

  /**
   * Navigate intelligently after login based on available remotes
   */
  async navigateAfterLogin(): Promise<void> {
    try {
      // Check remotes sequentially and find the first available one
      const firstAvailableRemote = await this.remoteDetection.checkRemotesSequentially();

      console.log('First available remote:', firstAvailableRemote);

      if (!firstAvailableRemote) {
        // No remotes available - go to dashboard with error message
        console.warn('No remote applications are currently available');
        await this.router.navigate(['/dashboard'], {
          queryParams: { error: 'no-remotes' }
        });
      } else {
        // Navigate to the first available remote
        console.log(`Auto-navigating to ${firstAvailableRemote}`);
        await this.router.navigate([`/${firstAvailableRemote}`]);
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

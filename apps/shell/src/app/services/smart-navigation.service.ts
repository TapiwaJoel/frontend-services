import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RemoteDetectionService } from './remote-detection.service';

@Injectable({
  providedIn: 'root',
})
export class SmartNavigationService {
  private router: Router = inject(Router);
  private remoteDetection: RemoteDetectionService = inject(
    RemoteDetectionService,
  );

  /**
   * Navigate intelligently after login based on available remotes
   */
  public async navigateAfterLogin(): Promise<void> {
    try {
      // Check remotes sequentially and find the first available one
      const firstAvailableRemote: string | null =
        await this.remoteDetection.checkRemotesSequentially();

      if (!firstAvailableRemote) {
        // No remotes available - go to dashboard with error message
        console.warn('No remote applications are currently available');
        await this.router.navigate(['/dashboard'], {
          queryParams: { error: 'no-remotes' },
        });
      } else {
        // Navigate to the first available remote
        await this.router.navigate([`/${firstAvailableRemote}`]);
      }
    } catch (error: unknown) {
      console.error('Error during smart navigation:', error);
      // Fallback to dashboard on error
      await this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Navigate to a specific remote if it's available
   */
  public async navigateToRemote(remoteName: string): Promise<boolean> {
    const available: boolean =
      await this.remoteDetection.checkRemoteAvailability(remoteName);

    if (available) {
      await this.router.navigate([`/${remoteName}`]);
      return true;
    } else {
      console.warn(`Remote ${remoteName} is not available`);
      return false;
    }
  }
}

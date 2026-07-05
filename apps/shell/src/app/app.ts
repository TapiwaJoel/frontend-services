import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { ShellLayoutComponent } from '@org/ui-common';
import { NotificationContainerComponent } from '@org/ui-common';
import { BannerContainerComponent } from '@org/ui-common';
import { UserMenuComponent } from '@org/ui-common';
import { AuthService } from '@org/data-access-auth';
import { ThemeService } from '@org/util-theming';

@Component({
  selector: 'org-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ShellLayoutComponent,
    NotificationContainerComponent,
    BannerContainerComponent,
    UserMenuComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  protected title = 'shell';

  user = this.authService.currentUser;
  currentTheme = this.themeService.currentTheme;

  ngOnInit(): void {
    // Subscribe to router events to change theme based on route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.themeService.setThemeFromRoute(event.url);
      });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, Observable } from 'rxjs';
import { ShellLayoutComponent } from '@org/ui-common';
import { NotificationContainerComponent } from '@org/ui-common';
import { BannerContainerComponent } from '@org/ui-common';
import { UserMenuComponent } from '@org/ui-common';
import { AuthService } from '@org/data-access-auth';
import { ThemeService } from '@org/util-theming';
import { User } from '@org/data-access-auth';

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
  protected title = 'shell';

  user$: Observable<User | null>;
  currentTheme$: Observable<string>;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {
    this.user$ = this.authService.currentUser$;
    this.currentTheme$ = this.themeService.currentTheme$;
  }

  ngOnInit(): void {
    // Subscribe to router events to change theme based on route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.themeService.setThemeFromRoute(event.url);
      });
  }
}

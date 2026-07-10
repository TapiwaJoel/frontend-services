import { Injectable, signal } from '@angular/core';
import { THEMES } from './themes/theme-config';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentThemeSignal = signal<string>('default');
  public currentTheme = this.currentThemeSignal.asReadonly();

  constructor() {
    // Initialize with default theme on service creation
    this.setTheme('default');
  }

  /**
   * Sets the current theme by applying the data-theme attribute to the document element
   * @param themeName - The name of the theme to apply (must exist in THEMES configuration)
   */
  setTheme(themeName: string): void {
    if (!THEMES[themeName]) {
      console.warn(`Theme "${themeName}" not found. Falling back to default theme.`);
      themeName = 'default';
    }

    document.documentElement.setAttribute('data-theme', themeName);
    this.currentThemeSignal.set(themeName);
  }

  /**
   * Maps route paths to themes and applies the appropriate theme
   * This allows automatic theme switching based on the current route
   * @param route - The current route path
   */
  setThemeFromRoute(route: string): void {
    const routeThemeMap: Record<string, string> = {
      '/umdzidzisi': 'umdzidzisi',
      '/umtengesi': 'umtengesi',
    };

    // Extract the first segment of the route (e.g., '/umdzidzisi/dashboard' -> '/umdzidzisi')
    const baseRoute = '/' + route.split('/').filter(Boolean)[0];
    const themeName = routeThemeMap[baseRoute] || 'default';

    this.setTheme(themeName);
  }

  /**
   * Gets the current active theme name
   * @returns The name of the currently active theme
   */
  getCurrentTheme(): string {
    return this.currentThemeSignal();
  }

  /**
   * Gets the theme configuration object for a given theme name
   * @param themeName - The name of the theme
   * @returns The Theme configuration object or undefined if not found
   */
  getThemeConfig(themeName: string) {
    return THEMES[themeName];
  }

  /**
   * Gets all available themes
   * @returns Record of all theme configurations
   */
  getAllThemes() {
    return THEMES;
  }
}

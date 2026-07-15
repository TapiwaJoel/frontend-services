# Angular Component Class Member Organization

This skill enforces a consistent member ordering pattern for Angular components, services, and directives using modern Angular patterns (Angular 21+).

## When to Use This Skill

Use this skill when:

- Creating new Angular components, services, or directives
- Refactoring existing components to follow consistent code organization
- Performing code reviews to ensure consistent member ordering
- Organizing inject() calls, properties, signals, computed properties, and methods
- The user explicitly asks to organize or reorganize class members

---

## Member Organization Pattern

All Angular component/service/directive class members **MUST** follow this strict ordering:

1. **Private Service Injections** - All `inject()` calls for services
2. **Public Variable Declarations** - Public state variables and properties
3. **Signal Inputs and Outputs** - `input()` and `output()` signals
4. **Computed Properties** - `computed()` calls and derived state
5. **Constructor** - Only if needed for `effect()` or initialization
6. **Lifecycle Hooks** - `ngOnInit`, `ngAfterViewInit`, etc.
7. **Public Methods** - Public class methods
8. **Private Methods** - Private helper methods

---

## Detailed Guidelines

### 1. Private Service Injections

**Always place all `inject()` calls at the top of the class.**

```typescript
// ✅ CORRECT: All private inject() calls first, grouped together
@Component({...})
export class LoginComponent {
  // Injected services
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private themeService: ThemeService = inject(ThemeService);

  // ... rest of class
}
```

```typescript
// ❌ INCORRECT: Services mixed with other members
@Component({...})
export class LoginComponent {
  public username: string = '';
  private authService: AuthService = inject(AuthService);  // Wrong position

  public loginText = computed(() => '...');
  private router: Router = inject(Router);  // Wrong position
}
```

**Best Practice:** Add a comment `// Injected services` or `// Services` to clearly mark this section.

---

### 2. Public Variable Declarations

**Place simple public state variables after service injections.**

```typescript
// ✅ CORRECT: Public properties after services
@Component({...})
export class LoginComponent {
  // Injected services
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  // Public properties
  public username: string = '';
  public password: string = '';
  public isLoading: boolean = false;
  public errorMessage: string = '';
}
```

**Best Practice:** Add a comment `// Public properties` or `// State` to mark this section.

---

### 3. Signal Inputs and Outputs

**For components using Angular signals, place inputs and outputs after basic properties.**

```typescript
// ✅ CORRECT: Signal inputs and outputs in dedicated section
@Component({...})
export class UserProfileComponent {
  // Injected services
  private userService = inject(UserService);

  // Public properties
  public isEditing = false;

  // Signal inputs
  userId = input.required<string>();
  compact = input(false);
  showAvatar = input(true);

  // Signal outputs
  userUpdated = output<User>();
  editCanceled = output<void>();

  // Computed properties
  user = computed(() => this.userService.getUser(this.userId()));
}
```

**Best Practice:** Group inputs together, then outputs, with clear comments.

---

### 4. Computed Properties

**Place all `computed()` signals after basic properties and inputs/outputs.**

```typescript
// ✅ CORRECT: Computed signals after inputs/outputs
@Component({...})
export class DashboardComponent {
  // Injected services
  private themeService: ThemeService = inject(ThemeService);

  // Public properties
  public username: string = '';

  // Computed signals
  public currentThemeConfig: Signal<Theme> = computed(() =>
    this.themeService.currentThemeConfig()
  );
  public currentLogo: Signal<string> = computed(
    () => this.currentThemeConfig().logo || '/assets/logos/default-logo.svg'
  );
  public displayName: Signal<string> = computed(() => {
    const theme: Theme = this.currentThemeConfig();
    return theme.displayName || 'Application';
  });
}
```

```typescript
// ❌ INCORRECT: Computed properties mixed with basic properties
@Component({...})
export class DashboardComponent {
  public username: string = '';
  public currentLogo = computed(() => '...');  // Wrong position
  public password: string = '';
  public displayName = computed(() => '...');  // Wrong position
}
```

**Best Practice:** Add a comment `// Computed signals` or `// Computed properties` to mark this section.

---

### 5. Constructor (Optional)

**Only include a constructor if you need to set up `effect()` or perform initialization that can't be done in `ngOnInit`.**

```typescript
// ✅ CORRECT: Constructor for effects, after computed properties
@Component({...})
export class TodoListComponent {
  // Injected services
  private todoService = inject(TodoService);

  // Public properties
  filter = signal<'all' | 'active'>('all');

  // Computed properties
  filteredTodos = computed(() => {
    const currentFilter = this.filter();
    return this.todoService.todos().filter(todo =>
      currentFilter === 'all' || todo.status === currentFilter
    );
  });

  // Constructor for effects
  constructor() {
    effect(() => {
      console.log('Filter changed:', this.filter());
      this.saveFilterToLocalStorage(this.filter());
    });
  }

  // Lifecycle hooks
  ngOnInit(): void {
    this.loadTodos();
  }
}
```

**Best Practice:** Prefer `ngOnInit` over constructor when possible. Only use constructor for effects.

---

### 6. Lifecycle Hooks

**Place lifecycle hooks after constructor, in Angular's execution order.**

```typescript
// ✅ CORRECT: Lifecycle hooks in proper order
@Component({...})
export class MyComponent {
  // ... services, properties, computed

  // Lifecycle hooks
  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }
}
```

**Hook Order:**

1. `ngOnChanges`
2. `ngOnInit`
3. `ngDoCheck`
4. `ngAfterContentInit`
5. `ngAfterContentChecked`
6. `ngAfterViewInit`
7. `ngAfterViewChecked`
8. `ngOnDestroy`

**Best Practice:** Add a comment `// Lifecycle hooks` to mark this section.

---

### 7. Public Methods

**Place all public methods after lifecycle hooks.**

```typescript
// ✅ CORRECT: Public methods after lifecycle hooks
@Component({...})
export class LoginComponent {
  // ... services, properties, computed, lifecycle

  // Public methods
  public onSubmit(): void {
    const credentials = {
      email: this.username,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: () => this.handleLoginSuccess(),
      error: (error) => this.handleLoginError(error)
    });
  }

  public resetForm(): void {
    this.username = '';
    this.password = '';
    this.errorMessage = '';
  }

  // Private methods
  private handleLoginSuccess(): void {
    this.router.navigate(['/dashboard']);
  }

  private handleLoginError(error: Error): void {
    this.errorMessage = error.message;
  }
}
```

**Best Practice:** Add comments `// Public methods` and `// Private methods` to mark these sections.

---

### 8. Private Methods

**Place all private helper methods after public methods.**

```typescript
// ✅ CORRECT: Private methods last
@Component({...})
export class DataComponent {
  // ... services, properties, computed, lifecycle, public methods

  // Private methods
  private validateData(data: any[]): boolean {
    return data.length > 0 && data.every(item => item.id);
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  private calculateTotal(items: Item[]): number {
    return items.reduce((sum, item) => sum + item.price, 0);
  }
}
```

---

## Complete Example

Here's a full component demonstrating proper class member organization:

```typescript
import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@mushaviri/data-access-auth';
import { ThemeService, Theme } from '@mushaviri/util-theming';

@Component({
  selector: 'org-login',
  standalone: true,
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  // Injected services
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private themeService: ThemeService = inject(ThemeService);

  // Public properties
  public username: string = '';
  public password: string = '';
  public errorMessage = signal<string>('');
  public isLoading = signal<boolean>(false);

  // Computed signals
  public currentThemeConfig: Signal<Theme> = computed(() => this.themeService.currentThemeConfig());
  public currentLogo: Signal<string> = computed(() => this.currentThemeConfig().logo || '/assets/logos/default-logo.svg');
  public loginText: Signal<string> = computed(() => {
    const theme: Theme = this.currentThemeConfig();
    const displayName: string = (theme.displayName || 'your').toLowerCase();
    return `Sign in to ${displayName}`;
  });
  public canSubmit: Signal<boolean> = computed(() => this.username.length > 0 && this.password.length > 0 && !this.isLoading());

  // Lifecycle hooks
  ngOnInit(): void {
    this.checkExistingSession();
  }

  // Public methods
  public onSubmit(): void {
    if (!this.canSubmit()) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const credentials = {
      email: this.username,
      password: this.password,
    };

    this.authService.login(credentials).subscribe({
      next: async (): Promise<void> => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '';
        await this.handleLoginSuccess(returnUrl);
      },
      error: (error) => this.handleLoginError(error),
    });
  }

  public resetForm(): void {
    this.username = '';
    this.password = '';
    this.errorMessage.set('');
  }

  // Private methods
  private async handleLoginSuccess(returnUrl: string): Promise<void> {
    this.isLoading.set(false);

    if (returnUrl) {
      await this.router.navigateByUrl(returnUrl);
    } else {
      await this.router.navigate(['/dashboard']);
    }
  }

  private handleLoginError(error: Error): void {
    this.isLoading.set(false);
    this.errorMessage.set(error.message || 'Login failed. Please try again.');
  }

  private checkExistingSession(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }
}
```

---

## Anti-Patterns to Avoid

### ❌ INCORRECT: Random Member Ordering

```typescript
@Component({...})
export class BadComponent {
  // Bad: No organization, everything mixed together
  public doSomething(): void { }

  private service = inject(Service);

  public data = signal([]);

  ngOnInit(): void { }

  computed = computed(() => this.data());

  private router = inject(Router);

  public username = '';
}
```

### ✅ CORRECT: Proper Organization

```typescript
@Component({...})
export class GoodComponent {
  // Injected services
  private service = inject(Service);
  private router = inject(Router);

  // Public properties
  public username = '';
  public data = signal([]);

  // Computed signals
  computed = computed(() => this.data());

  // Lifecycle hooks
  ngOnInit(): void { }

  // Public methods
  public doSomething(): void { }
}
```

---

## Benefits of This Pattern

✨ **Consistency** - All components follow the same structure across the entire codebase

🎯 **Predictability** - Developers always know where to find specific types of members

📖 **Readability** - Clear separation of concerns makes code easier to understand

🔍 **Maintainability** - Easier to review, refactor, and debug code

⚡ **Efficiency** - Less time spent searching for class members

🛠️ **Best Practices** - Follows Angular modern patterns and community standards

---

## Quick Reference

**Standard Member Order:**

```typescript
@Component({...})
export class ComponentName {
  // 1. Injected services
  private [service] = inject([Service]);

  // 2. Public properties
  public [variable] = [value];

  // 3. Signal inputs/outputs (if applicable)
  [input] = input[.required]<Type>();
  [output] = output<Type>();

  // 4. Computed signals
  [computed] = computed(() => ...);

  // 5. Constructor (optional, for effects)
  constructor() { }

  // 6. Lifecycle hooks
  ngOnInit(): void { }

  // 7. Public methods
  public [method](): void { }

  // 8. Private methods
  private [method](): void { }
}
```

---

## Additional Notes

- **Comments are helpful** - Use section comments to clearly mark each group
- **Consistency over perfection** - If a component doesn't have all sections, maintain the order for sections that exist
- **Apply to all classes** - This pattern works for Components, Services, Directives, and Pipes
- **TypeScript accessibility modifiers** - Explicitly use `public` and `private` for clarity
- **Signals-first approach** - Prefer signals over traditional properties for reactive state

---

**Remember:** Consistent code organization is a sign of professional development and makes collaboration easier for the entire team.

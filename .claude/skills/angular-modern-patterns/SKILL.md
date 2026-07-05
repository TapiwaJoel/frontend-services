# Angular Modern Patterns Skill (Angular 21+)

This skill documents all modern Angular patterns that should be used throughout the codebase for Angular 21.2.9.

## When to Use This Skill

Use this skill when:
- Creating new Angular components, services, or guards
- Refactoring existing code to modern patterns
- Reviewing code for best practices
- Answering questions about Angular implementation

---

## 1. Control Flow Syntax (@if, @for, @switch)

**Use:** Built-in control flow instead of structural directives

### @if / @else

```typescript
// ❌ OLD
<div *ngIf="isLoading">Loading...</div>
<div *ngIf="user; else noUser">{{ user.name }}</div>

// ✅ NEW
@if (isLoading) {
  <div>Loading...</div>
}

@if (user) {
  <div>{{ user.name }}</div>
} @else {
  <div>Please log in</div>
}
```

### @for with track

```typescript
// ❌ OLD
<div *ngFor="let item of items; trackBy: trackById">
  {{ item.name }}
</div>

// ✅ NEW
@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
}

// For items without IDs, use $index
@for (item of items; track $index) {
  <div>{{ item }}</div>
}
```

### @switch / @case

```typescript
// ❌ OLD
<div [ngSwitch]="status">
  <div *ngSwitchCase="'pending'">Pending</div>
  <div *ngSwitchCase="'approved'">Approved</div>
  <div *ngSwitchDefault>Unknown</div>
</div>

// ✅ NEW
@switch (status) {
  @case ('pending') {
    <div>Pending</div>
  }
  @case ('approved') {
    <div>Approved</div>
  }
  @default {
    <div>Unknown</div>
  }
}
```

---

## 2. Functional Dependency Injection (inject)

**Use:** inject() function instead of constructor injection

```typescript
// ❌ OLD
@Component({...})
export class MyComponent {
  constructor(
    private myService: MyService,
    private router: Router
  ) {}
}

// ✅ NEW
@Component({...})
export class MyComponent {
  private myService = inject(MyService);
  private router = inject(Router);
}
```

### In Functional Guards

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

---

## 3. Signals for Reactive State

**Use:** Signals instead of BehaviorSubject for state management

### Basic Signal Pattern

```typescript
// ❌ OLD: BehaviorSubject
@Injectable({ providedIn: 'root' })
export class DataService {
  private dataSubject = new BehaviorSubject<Data[]>([]);
  public data$ = this.dataSubject.asObservable();

  updateData(data: Data[]): void {
    this.dataSubject.next(data);
  }
}

// ✅ NEW: Signals
@Injectable({ providedIn: 'root' })
export class DataService {
  private dataSignal = signal<Data[]>([]);
  public data = this.dataSignal.asReadonly();

  updateData(data: Data[]): void {
    this.dataSignal.set(data);
  }

  // Update based on current value
  addItem(item: Data): void {
    this.dataSignal.update(current => [...current, item]);
  }
}
```

### Signal Methods

```typescript
// Create signal
private count = signal(0);

// Set new value (replace)
this.count.set(10);

// Update based on current value
this.count.update(n => n + 1);

// Read current value
const value = this.count();

// Create readonly signal
public readonly counter = this.count.asReadonly();
```

### Using Signals in Templates

```typescript
// ❌ OLD: async pipe
@Component({
  template: `<div>{{ data$ | async }}</div>`
})
export class MyComponent {
  data$ = this.service.data$;
}

// ✅ NEW: Call signal as function
@Component({
  template: `<div>{{ data() }}</div>`
})
export class MyComponent {
  private service = inject(DataService);
  data = this.service.data;
}
```

---

## 4. Computed Signals for Derived State

**Use:** computed() for values derived from other signals

```typescript
@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSignal = signal<CartItem[]>([]);
  public items = this.itemsSignal.asReadonly();

  // Automatically recalculates when items changes
  public total = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.price, 0)
  );

  public itemCount = computed(() => this.itemsSignal().length);

  public isEmpty = computed(() => this.itemsSignal().length === 0);

  public hasExpensiveItems = computed(() =>
    this.itemsSignal().some(item => item.price > 100)
  );
}
```

### Chaining Computed Signals

```typescript
private users = signal<User[]>([]);

// First level computed
public activeUsers = computed(() =>
  this.users().filter(u => u.isActive)
);

// Second level computed (depends on activeUsers)
public activeAdmins = computed(() =>
  this.activeUsers().filter(u => u.role === 'admin')
);

// Combines multiple signals
public summary = computed(() => ({
  total: this.users().length,
  active: this.activeUsers().length,
  admins: this.activeAdmins().length
}));
```

---

## 5. Signal Inputs (Input as Signal)

**Use:** Signal-based inputs instead of decorator-based inputs

```typescript
// ❌ OLD
@Component({...})
export class UserCardComponent {
  @Input() user!: User;
  @Input() compact = false;
}

// ✅ NEW: Signal inputs
@Component({...})
export class UserCardComponent {
  user = input.required<User>();
  compact = input<boolean>(false); // with default value

  // Use in computed signals
  displayName = computed(() => {
    const u = this.user();
    return u.firstName + ' ' + u.lastName;
  });
}
```

### In Templates

```typescript
@Component({
  template: `
    <div class="user-card" [class.compact]="compact()">
      <h3>{{ user().name }}</h3>
      <p>{{ user().email }}</p>
      <span>{{ displayName() }}</span>
    </div>
  `
})
export class UserCardComponent {
  user = input.required<User>();
  compact = input(false);

  displayName = computed(() => {
    const u = this.user();
    return `${u.firstName} ${u.lastName}`;
  });
}
```

---

## 6. Signal Outputs (Output as Signal)

**Use:** output() for type-safe event emitters

```typescript
// ❌ OLD
@Component({...})
export class ButtonComponent {
  @Output() clicked = new EventEmitter<void>();
  @Output() valueChange = new EventEmitter<string>();

  handleClick(): void {
    this.clicked.emit();
  }
}

// ✅ NEW: Signal outputs
@Component({...})
export class ButtonComponent {
  clicked = output<void>();
  valueChange = output<string>();

  handleClick(): void {
    this.clicked.emit();
  }

  handleInput(value: string): void {
    this.valueChange.emit(value);
  }
}
```

---

## 7. Model Inputs (Two-Way Binding)

**Use:** model() for two-way binding with signals

```typescript
// ❌ OLD: Two-way binding with @Input/@Output
@Component({
  selector: 'app-counter',
  template: `
    <button (click)="decrement()">-</button>
    <span>{{ value }}</span>
    <button (click)="increment()">+</button>
  `
})
export class CounterComponent {
  @Input() value = 0;
  @Output() valueChange = new EventEmitter<number>();

  increment(): void {
    this.value++;
    this.valueChange.emit(this.value);
  }

  decrement(): void {
    this.value--;
    this.valueChange.emit(this.value);
  }
}

// ✅ NEW: Model signals
@Component({
  selector: 'app-counter',
  template: `
    <button (click)="decrement()">-</button>
    <span>{{ value() }}</span>
    <button (click)="increment()">+</button>
  `
})
export class CounterComponent {
  value = model<number>(0);

  increment(): void {
    this.value.update(v => v + 1);
  }

  decrement(): void {
    this.value.update(v => v - 1);
  }
}

// Usage with two-way binding
@Component({
  template: `<app-counter [(value)]="count" />`
})
export class ParentComponent {
  count = signal(5);
}
```

---

## 8. ViewChild and ContentChild as Signals

**Use:** Signal-based queries instead of decorator queries

```typescript
// ❌ OLD
@Component({...})
export class MyComponent implements AfterViewInit {
  @ViewChild('myInput') inputEl!: ElementRef<HTMLInputElement>;
  @ViewChild(ChildComponent) child!: ChildComponent;

  ngAfterViewInit(): void {
    this.inputEl.nativeElement.focus();
  }
}

// ✅ NEW: Signal queries
@Component({...})
export class MyComponent {
  inputEl = viewChild<ElementRef<HTMLInputElement>>('myInput');
  child = viewChild(ChildComponent);

  ngAfterViewInit(): void {
    // Signal queries are available immediately
    this.inputEl()?.nativeElement.focus();
  }

  // Can use in effects
  constructor() {
    effect(() => {
      const input = this.inputEl();
      if (input) {
        console.log('Input element available');
      }
    });
  }
}
```

### Required Queries

```typescript
// For required elements
inputEl = viewChild.required<ElementRef>('myInput');
child = viewChild.required(ChildComponent);

// Now you don't need the optional chaining
ngAfterViewInit(): void {
  this.inputEl().nativeElement.focus(); // No ? needed
}
```

---

## 9. Effect API for Side Effects

**Use:** effect() to run side effects when signals change

```typescript
@Component({...})
export class DataComponent {
  private dataService = inject(DataService);
  data = this.dataService.data;

  constructor() {
    // Runs whenever data signal changes
    effect(() => {
      const currentData = this.data();
      console.log('Data changed:', currentData);

      // Side effects like localStorage
      if (currentData.length > 0) {
        localStorage.setItem('lastData', JSON.stringify(currentData));
      }
    });
  }
}
```

### Effect with Cleanup

```typescript
constructor() {
  effect((onCleanup) => {
    const userId = this.currentUserId();

    // Subscribe to real-time updates
    const subscription = this.realtimeService.subscribe(userId);

    // Cleanup when userId changes or component destroyed
    onCleanup(() => {
      subscription.unsubscribe();
    });
  });
}
```

### Effect Options

```typescript
effect(() => {
  // Effect logic
}, {
  allowSignalWrites: true // Allow writing to signals within effect
});
```

---

## 10. DestroyRef for Cleanup

**Use:** DestroyRef instead of ngOnDestroy

```typescript
// ❌ OLD
@Component({...})
export class MyComponent implements OnDestroy {
  private subscription?: Subscription;

  ngOnInit(): void {
    this.subscription = this.service.data$.subscribe(data => {
      // handle data
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}

// ✅ NEW: DestroyRef
@Component({...})
export class MyComponent {
  private destroyRef = inject(DestroyRef);
  private service = inject(DataService);

  ngOnInit(): void {
    const subscription = this.service.data$.subscribe(data => {
      // handle data
    });

    // Automatically unsubscribes when component is destroyed
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
```

### With takeUntilDestroyed

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({...})
export class MyComponent {
  private service = inject(DataService);

  constructor() {
    // Automatically completes when component destroyed
    this.service.data$
      .pipe(takeUntilDestroyed())
      .subscribe(data => {
        // handle data
      });
  }
}
```

---

## 11. toSignal and toObservable Utilities

**Use:** Convert between Signals and Observables when needed

### toSignal - Observable to Signal

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

@Component({...})
export class MyComponent {
  private http = inject(HttpClient);

  // Convert HTTP Observable to Signal
  data = toSignal(
    this.http.get<Data[]>('/api/data'),
    { initialValue: [] } // Provide initial value
  );

  // Use in template like any signal
  // template: `<div>{{ data() }}</div>`
}
```

### toObservable - Signal to Observable

```typescript
import { toObservable } from '@angular/core/rxjs-interop';

@Component({...})
export class MyComponent {
  searchTerm = signal('');

  constructor() {
    // Convert signal to observable for RxJS operators
    toObservable(this.searchTerm)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => this.searchService.search(term))
      )
      .subscribe(results => {
        this.results.set(results);
      });
  }
}
```

---

## 12. Complete Service Example

```typescript
import { Injectable, signal, computed, effect } from '@angular/core';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  // Private writable signal
  private todosSignal = signal<Todo[]>([]);

  // Public readonly signal
  public todos = this.todosSignal.asReadonly();

  // Computed signals for derived state
  public totalCount = computed(() => this.todosSignal().length);

  public completedCount = computed(() =>
    this.todosSignal().filter(t => t.completed).length
  );

  public activeCount = computed(() =>
    this.todosSignal().filter(t => !t.completed).length
  );

  public highPriorityTodos = computed(() =>
    this.todosSignal().filter(t => t.priority === 'high' && !t.completed)
  );

  public completionPercentage = computed(() => {
    const total = this.totalCount();
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });

  // Persist to localStorage on changes
  constructor() {
    // Load from localStorage on init
    const stored = localStorage.getItem('todos');
    if (stored) {
      this.todosSignal.set(JSON.parse(stored));
    }

    // Save to localStorage whenever todos change
    effect(() => {
      const todos = this.todosSignal();
      localStorage.setItem('todos', JSON.stringify(todos));
    });
  }

  // CRUD operations
  addTodo(todo: Omit<Todo, 'id'>): void {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      ...todo
    };
    this.todosSignal.update(todos => [...todos, newTodo]);
  }

  updateTodo(id: string, changes: Partial<Todo>): void {
    this.todosSignal.update(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, ...changes } : todo
      )
    );
  }

  toggleComplete(id: string): void {
    this.todosSignal.update(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  deleteTodo(id: string): void {
    this.todosSignal.update(todos =>
      todos.filter(todo => todo.id !== id)
    );
  }

  clearCompleted(): void {
    this.todosSignal.update(todos =>
      todos.filter(todo => !todo.completed)
    );
  }

  setTodos(todos: Todo[]): void {
    this.todosSignal.set(todos);
  }

  // Synchronous getters
  getTodoById(id: string): Todo | undefined {
    return this.todosSignal().find(todo => todo.id === id);
  }
}
```

---

## 13. Complete Component Example

```typescript
import { Component, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from './todo.service';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="todo-app">
      <header>
        <h1>Todo List</h1>
        <p>{{ completionPercentage() }}% Complete</p>
      </header>

      <!-- Add todo form -->
      <div class="add-todo">
        <input
          #newTodoInput
          [(ngModel)]="newTodoTitle"
          (keyup.enter)="addTodo()"
          placeholder="What needs to be done?"
        />
        <select [(ngModel)]="newTodoPriority">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button (click)="addTodo()">Add</button>
      </div>

      <!-- Filter tabs -->
      <div class="filters">
        <button
          (click)="filter.set('all')"
          [class.active]="filter() === 'all'">
          All ({{ totalCount() }})
        </button>
        <button
          (click)="filter.set('active')"
          [class.active]="filter() === 'active'">
          Active ({{ activeCount() }})
        </button>
        <button
          (click)="filter.set('completed')"
          [class.active]="filter() === 'completed'">
          Completed ({{ completedCount() }})
        </button>
      </div>

      <!-- Todo list -->
      @if (isLoading()) {
        <div class="loading">Loading todos...</div>
      }

      @if (!isLoading() && filteredTodos().length === 0) {
        <div class="empty">
          @switch (filter()) {
            @case ('active') {
              <p>No active todos! 🎉</p>
            }
            @case ('completed') {
              <p>No completed todos yet</p>
            }
            @default {
              <p>Add your first todo above</p>
            }
          }
        </div>
      }

      @if (!isLoading() && filteredTodos().length > 0) {
        <ul class="todo-list">
          @for (todo of filteredTodos(); track todo.id) {
            <li [class.completed]="todo.completed">
              <input
                type="checkbox"
                [checked]="todo.completed"
                (change)="toggleTodo(todo.id)"
              />
              <span [class]="'priority-' + todo.priority">
                {{ todo.title }}
              </span>
              <button (click)="deleteTodo(todo.id)">Delete</button>
            </li>
          }
        </ul>

        <div class="actions">
          @if (completedCount() > 0) {
            <button (click)="clearCompleted()">
              Clear Completed ({{ completedCount() }})
            </button>
          }
        </div>
      }

      <!-- High priority alert -->
      @if (highPriorityTodos().length > 0) {
        <div class="alert">
          ⚠️ You have {{ highPriorityTodos().length }} high priority todo(s)
        </div>
      }
    </div>
  `,
  styles: [`
    .todo-list li.completed {
      text-decoration: line-through;
      opacity: 0.6;
    }
    .priority-high { color: red; }
    .priority-medium { color: orange; }
    .priority-low { color: gray; }
  `]
})
export class TodoListComponent {
  private todoService = inject(TodoService);

  // Expose service signals
  todos = this.todoService.todos;
  totalCount = this.todoService.totalCount;
  activeCount = this.todoService.activeCount;
  completedCount = this.todoService.completedCount;
  completionPercentage = this.todoService.completionPercentage;
  highPriorityTodos = this.todoService.highPriorityTodos;

  // Component state
  newTodoTitle = '';
  newTodoPriority: 'low' | 'medium' | 'high' = 'medium';
  filter = signal<'all' | 'active' | 'completed'>('all');
  isLoading = signal(false);

  // Computed filtered todos
  filteredTodos = computed(() => {
    const todos = this.todos();
    const currentFilter = this.filter();

    switch (currentFilter) {
      case 'active':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  });

  // Effect example: Log when filter changes
  constructor() {
    effect(() => {
      console.log('Current filter:', this.filter());
      console.log('Filtered todos:', this.filteredTodos().length);
    });
  }

  addTodo(): void {
    if (this.newTodoTitle.trim()) {
      this.todoService.addTodo({
        title: this.newTodoTitle.trim(),
        completed: false,
        priority: this.newTodoPriority
      });
      this.newTodoTitle = '';
      this.newTodoPriority = 'medium';
    }
  }

  toggleTodo(id: string): void {
    this.todoService.toggleComplete(id);
  }

  deleteTodo(id: string): void {
    this.todoService.deleteTodo(id);
  }

  clearCompleted(): void {
    this.todoService.clearCompleted();
  }
}
```

---

## 14. When to Use Signals vs Observables

### ✅ Use Signals For:
- Component/service state
- Synchronous derived values
- Form state
- UI state (loading, selected item, etc.)
- Configuration values
- Collections (lists, maps)

### ✅ Keep Observables For:
- HTTP requests (HttpClient)
- WebSocket streams
- Router events
- Form value changes (reactive forms)
- Complex async workflows with RxJS operators
- Third-party libraries that use Observables
- Intervals and timers

### 🔄 Bridge Between Them:
```typescript
// Observable → Signal
data = toSignal(this.http.get('/api/data'), { initialValue: [] });

// Signal → Observable
searchTerm$ = toObservable(this.searchTermSignal);
```

---

## Migration Checklist

### Templates
- [ ] Replace `*ngIf` with `@if/@else`
- [ ] Replace `*ngFor` with `@for` (with track)
- [ ] Replace `*ngSwitch` with `@switch/@case`
- [ ] Remove `| async` when consuming signals
- [ ] Call signals as functions: `signal()`

### Components
- [ ] Replace `constructor()` injection with `inject()`
- [ ] Replace `@Input()` with `input()` or `input.required()`
- [ ] Replace `@Output()` with `output()`
- [ ] Replace `@ViewChild()` with `viewChild()` or `viewChild.required()`
- [ ] Replace `[(ngModel)]` two-way binding with `model()`
- [ ] Replace `ngOnDestroy` with `DestroyRef.onDestroy()`
- [ ] Use `takeUntilDestroyed()` for Observable subscriptions

### Services
- [ ] Replace `BehaviorSubject` with `signal()`
- [ ] Replace `.asObservable()` with `.asReadonly()`
- [ ] Replace `.next()` with `.set()` or `.update()`
- [ ] Replace `.value` with `signal()`
- [ ] Create `computed()` for derived state
- [ ] Use `effect()` for side effects

### Guards & Interceptors
- [ ] Use functional guards (`CanActivateFn`)
- [ ] Use functional interceptors (`HttpInterceptorFn`)
- [ ] Use `inject()` for dependencies

---

## Summary

Modern Angular (21+) provides these patterns:

1. **@if/@for/@switch** - Control flow (replaces structural directives)
2. **inject()** - Dependency injection (replaces constructor)
3. **signal()** - Reactive state (replaces BehaviorSubject)
4. **computed()** - Derived state (auto-tracked, memoized)
5. **effect()** - Side effects when signals change
6. **input()/input.required()** - Signal inputs
7. **output()** - Type-safe outputs
8. **model()** - Two-way binding with signals
9. **viewChild()/contentChild()** - Signal-based queries
10. **DestroyRef** - Cleanup (replaces ngOnDestroy)
11. **toSignal()/toObservable()** - Bridge between paradigms

These result in:
- ✨ Less boilerplate
- 🎯 Better type safety
- ⚡ Improved performance
- 🧠 Simpler mental model
- 🛠️ More maintainable code

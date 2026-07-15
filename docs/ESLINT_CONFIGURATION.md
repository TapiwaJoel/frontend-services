# ESLint Configuration

This document describes the ESLint configuration for the web-apps workspace, including custom rules and best practices adopted from the backend-services project.

## Table of Contents

- [Overview](#overview)
- [Installed Plugins](#installed-plugins)
- [Custom Rules](#custom-rules)
- [Backend-Services Rules Adopted](#backend-services-rules-adopted)
- [Available Scripts](#available-scripts)
- [Configuration Files](#configuration-files)
- [Usage Examples](#usage-examples)

## Overview

The web-apps workspace uses ESLint 9 with the flat config format (`.mjs` files) and includes:

- Nx monorepo-specific rules
- Angular-specific linting (components, templates, directives)
- TypeScript strict rules
- Custom organizational rules
- Code quality rules from backend-services

## Installed Plugins

### Core Plugins

- `@nx/eslint-plugin` - Nx workspace and module boundary enforcement
- `angular-eslint` - Angular-specific linting rules
- `typescript-eslint` - TypeScript support and type checking
- `eslint-plugin-playwright` - E2E test best practices
- `eslint-plugin-unused-imports` - Detect and remove unused imports (from backend-services)

### Custom Plugin

- `org` - Custom organizational rules (located in `tools/eslint-rules/`)

## Custom Rules

### `org/no-inline-template-style`

**Purpose:** Enforces separation of Angular component templates and styles into dedicated files.

**Rationale:**

- Improves code maintainability and readability
- Enables better IDE support and syntax highlighting
- Facilitates easier testing and refactoring
- Promotes consistent project structure

**Configuration:**

```javascript
'org/no-inline-template-style': [
  'error',
  {
    allowInlineTemplateMaxLength: 0,  // No inline templates allowed
    allowInlineStyles: false           // No inline styles allowed
  }
]
```

**Examples:**

❌ **Bad - Inline Template:**

```typescript
@Component({
  selector: 'org-login',
  template: `<div>Login Form</div>`, // ERROR
  styles: [
    `
      div {
        color: red;
      }
    `,
  ], // ERROR
})
export class LoginComponent {}
```

✅ **Good - Separate Files:**

```typescript
@Component({
  selector: 'org-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {}
```

**Options:**

- `allowInlineTemplateMaxLength` (number, default: 0) - Maximum allowed template string length. Set to 0 to disallow all inline templates.
- `allowInlineStyles` (boolean, default: false) - Whether to allow inline styles.

## Angular Best Practice Rules

The following Angular-specific rules are enforced across all Angular projects:

### Performance Rules

- `@angular-eslint/prefer-on-push-component-change-detection: 'warn'` - Encourages OnPush change detection strategy for better performance
- `@angular-eslint/no-pipe-impure: 'error'` - Prevents impure pipes which can cause performance issues

### Code Quality Rules

- `@angular-eslint/component-class-suffix: 'error'` - Ensures component classes end with 'Component'
- `@angular-eslint/directive-class-suffix: 'error'` - Ensures directive classes end with 'Directive'
- `@angular-eslint/no-async-lifecycle-method: 'error'` - Lifecycle methods should not be async
- `@angular-eslint/no-lifecycle-call: 'error'` - Don't manually call lifecycle hooks

### Dependency Injection Rules

- `@angular-eslint/use-injectable-provided-in: 'error'` - Services should use `providedIn` syntax
- `@angular-eslint/no-forward-ref: 'warn'` - Avoid forward references

### Template Rules

- `@angular-eslint/template/use-track-by-function: 'warn'` - Requires trackBy function for *ngFor loops
- `@angular-eslint/template/no-call-expression: 'warn'` - No function calls in templates (performance)
- `@angular-eslint/template/button-has-type: 'error'` - Buttons must have explicit type attribute
- `@angular-eslint/template/no-inline-styles: 'error'` - No inline styles in templates
- `@angular-eslint/template/prefer-self-closing-tags: 'warn'` - Use self-closing tags where possible

## Backend-Services Rules Adopted

The following rules were adopted from the backend-services project to improve code quality:

### 1. Unused Imports Detection

**Rules:**

- `unused-imports/no-unused-imports: 'error'` - Automatically detect unused imports
- `unused-imports/no-unused-vars: 'error'` - Detect unused variables

**Benefits:**

- Cleaner codebase
- Smaller bundle sizes
- Easier to maintain and refactor

### 2. Console Statement Restrictions

**Rule:**

```javascript
'no-console': [
  'warn',
  {
    allow: ['warn', 'error']
  }
]
```

**Benefits:**

- Prevents console.log statements in production code
- Allows console.warn and console.error for legitimate logging
- Disabled in test files for debugging

### 3. TypeScript Strict Typing Rules

**Purpose:** Enforce explicit type annotations throughout the codebase for better type safety and code clarity.

**Rules:**

#### `@typescript-eslint/typedef`

Requires explicit type annotations on:

- Class properties: `username: string = '';`
- Function parameters: `function login(email: string, password: string)`
- Variable declarations: `const count: number = 0;`

**Exceptions:**

- Array destructuring: `const [a, b] = tuple` (allowed)
- Object destructuring: `const { x, y } = obj` (allowed)
- Arrow function parameters in callbacks: `arr.map(x => x * 2)` (allowed)

#### `@typescript-eslint/explicit-function-return-type`

Requires explicit return types on functions and methods:

```typescript
// ❌ Bad
function login(email, password) {
  return authService.login(email, password);
}

// ✅ Good
function login(email: string, password: string): Observable<User> {
  return authService.login(email, password);
}
```

**Exceptions:**

- Inline expressions: `const x = () => 5` (allowed - type inferred)
- Typed function expressions: `const fn: Handler = () => {}` (allowed)
- Higher-order functions: `fn(x => x)` (allowed)

#### `@typescript-eslint/explicit-module-boundary-types`

Enforces return types specifically on exported functions and class methods.

#### `@typescript-eslint/explicit-member-accessibility`

Requires explicit access modifiers (`public`, `private`, `protected`) on all class members.

**Examples:**

```typescript
// ❌ Bad - No access modifier
class LoginComponent {
  username = ''; // Error: Missing accessibility modifier
  password = ''; // Error: Missing accessibility modifier
  onSubmit() {} // Error: Missing accessibility modifier
}

// ✅ Good - Explicit modifiers
class LoginComponent {
  public username: string = '';
  public password: string = '';
  private authService = inject(AuthService);

  public onSubmit(): void {}
  private validate(): boolean {}
}
```

**Benefits:**

- Makes code intent explicit and clear
- Better encapsulation and information hiding
- Easier to understand public API vs internal implementation
- Prevents accidental exposure of internal members
- Improves code documentation
- Matches backend-services strict typing standards

**Configuration:** Set to `'explicit'` to require modifiers on ALL members including public ones.

**General Benefits of All TypeScript Strict Rules:**

- Better IDE autocomplete and IntelliSense
- Catches type errors at compile time
- Improves code documentation
- Makes refactoring safer
- Prevents accidental 'any' types

### 4. Module Boundary Enforcement

**Rule:** `@nx/enforce-module-boundaries`

**Constraints:**

- Applications can only depend on libraries
- Scoped libraries (umdzidzisi, umtengesi, shell) can only depend on shared libraries
- Type-based dependencies (feature → data-access/ui/util)

## Available Scripts

### Linting Scripts

```bash
# Lint all projects
npm run lint

# Lint all projects and auto-fix issues
npm run lint:fix

# Lint only affected projects (based on git changes)
npm run lint:affected

# Lint affected projects and auto-fix
npm run lint:affected:fix

# Lint specific project
npx nx lint <project-name>

# Lint specific project and auto-fix
npx nx lint <project-name> --fix
```

### Formatting Scripts

```bash
# Format all files
npm run format

# Check formatting without making changes
npm run format:check
```

## Configuration Files

### Root Configuration

- **File:** `/eslint.config.mjs`
- **Purpose:** Workspace-level ESLint configuration
- **Includes:**
  - Nx base configurations
  - TypeScript/JavaScript support
  - Custom plugin registration
  - Unused imports rules
  - Console restrictions

### Project-Level Configurations

#### Configuration Order (IMPORTANT!)

The order of configuration imports is crucial in ESLint flat config. Configs are merged from top to bottom, with later configs overriding earlier ones.

**Correct Order:**

```javascript
export default [
  ...baseConfig, // 1. Base rules FIRST
  ...nx.configs['flat/angular'], // 2. Angular rules override/extend base
  ...nx.configs['flat/angular-template'], // 3. Angular template rules
  {
    files: ['**/*.ts'],
    rules: {
      // 4. Project-specific overrides LAST
    },
  },
];
```

**Why this order matters:**

- Base config provides TypeScript, JavaScript, and general code quality rules
- Angular configs extend those rules with Angular-specific requirements
- Project-specific rules override everything else for custom requirements
- Incorrect order can cause rules to be disabled or overridden unintentionally

#### Angular Apps & Libraries

- **Files:** `apps/*/eslint.config.mjs`, `libs/*/eslint.config.mjs`
- **Includes:**
  - Base configuration (first!)
  - Angular-specific rules (`flat/angular`, `flat/angular-template`)
  - Component/directive naming conventions
  - Custom `no-inline-template-style` rule
  - Angular best practice rules (performance, code quality, DI)
  - Template best practice rules

#### E2E Test Projects

- **Files:** `apps/e2e/*/eslint.config.mjs`
- **Includes:**
  - Playwright-specific rules
  - Relaxed console restrictions
  - Inherits all root configuration

#### TypeScript-Only Libraries

- **Files:** `packages/shared/models/eslint.config.mjs`
- **Includes:**
  - Only root configuration (no Angular rules)

## Usage Examples

### Running Lint on Specific Projects

```bash
# Lint the shell application
npx nx lint shell

# Lint the ui-common library
npx nx lint ui-common

# Lint and auto-fix the shell application
npx nx lint shell --fix
```

### Checking for Inline Templates

The custom rule will automatically catch inline templates during linting:

```bash
npx nx lint shell
```

Output:

```
apps/shell/src/app/nx-welcome.ts
  7:3   error  Inline templates are not allowed. Use templateUrl with a separate .html file instead
  943:3 error  Inline styles are not allowed. Use styleUrl or styleUrls with separate .scss/.css files instead
```

### Fixing Unused Imports

```bash
# Auto-fix unused imports across all projects
npm run lint:fix

# Fix unused imports in specific project
npx nx lint data-access-auth --fix
```

## Custom Rule Development

Custom rules are located in `tools/eslint-rules/`:

```
tools/eslint-rules/
├── index.js                      # Rule registry
└── no-inline-template-style.js   # Custom rule implementation
```

### Adding New Custom Rules

1. Create a new rule file in `tools/eslint-rules/`
2. Export the rule from `tools/eslint-rules/index.js`
3. Add the rule to project ESLint configurations
4. Document the rule in this file

### Custom Rule Template

```javascript
module.exports = {
  meta: {
    type: 'problem', // or 'suggestion', 'layout'
    docs: {
      description: 'Rule description',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      messageId: 'Error message here',
    },
    schema: [], // Options schema
  },
  create(context) {
    return {
      // AST node visitors
    };
  },
};
```

## Migration Guide

### Converting Inline Templates to Separate Files

If you have existing components with inline templates, follow these steps:

1. **Run ESLint to identify violations:**

   ```bash
   npx nx lint <project-name>
   ```

2. **For each component with inline template:**
   - Create a new `.html` file (e.g., `component-name.component.html`)
   - Copy the template content from the `template:` property
   - Replace `template:` with `templateUrl: './component-name.component.html'`

3. **For each component with inline styles:**
   - Create a new `.scss` file (e.g., `component-name.component.scss`)
   - Copy the styles content from the `styles:` property
   - Replace `styles:` with `styleUrl: './component-name.component.scss'`

4. **Verify the fix:**
   ```bash
   npx nx lint <project-name>
   ```

## Best Practices

1. **Always run linting before committing:**

   ```bash
   npm run lint:affected
   ```

2. **Use auto-fix when possible:**

   ```bash
   npm run lint:affected:fix
   ```

3. **Keep template and style files co-located with components:**

   ```
   login/
   ├── login.component.ts
   ├── login.component.html
   ├── login.component.scss
   └── login.component.spec.ts
   ```

4. **Use meaningful component names that match file names**

5. **Follow Angular style guide for component structure**

## Troubleshooting

### Rule Not Working

If the custom rule isn't being applied:

1. Check that the project's `eslint.config.mjs` includes the rule
2. Verify the root `eslint.config.mjs` correctly imports the custom plugin
3. Ensure `tools/eslint-rules/index.js` exports the rule
4. Clear the Nx cache: `npx nx reset`

### Performance Issues

If linting is slow:

1. Use `lint:affected` instead of `lint` during development
2. Enable ESLint caching (already configured in `nx.json`)
3. Exclude unnecessary files in ESLint ignore patterns

### False Positives

If you encounter false positives:

1. Review the rule configuration in the project's `eslint.config.mjs`
2. Adjust rule options if needed
3. Use inline ESLint comments as a last resort:
   ```typescript
   // eslint-disable-next-line org/no-inline-template-style
   ```

## References

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Angular ESLint](https://github.com/angular-eslint/angular-eslint)
- [Nx ESLint Plugin](https://nx.dev/nx-api/eslint-plugin)
- [TypeScript ESLint](https://typescript-eslint.io/)

## Changelog

### 2026-07-12 (Phase 3 - TypeScript Strict Typing)

- ✅ Added `@typescript-eslint/typedef` rule (explicit type annotations)
- ✅ Added `@typescript-eslint/explicit-function-return-type` rule
- ✅ Added `@typescript-eslint/explicit-module-boundary-types` rule
- ✅ Added `@typescript-eslint/explicit-member-accessibility` rule (requires public/private/protected)
- ✅ Disabled `@typescript-eslint/no-inferrable-types` to avoid conflicts
- ✅ Updated documentation with TypeScript strict typing rules
- ⚠️ **Breaking Change**: Will catch hundreds of type annotation and access modifier violations

### 2026-07-12 (Phase 2 - Angular Best Practices)

- ✅ Fixed config order in all Angular projects (baseConfig now comes first)
- ✅ Added 8 essential Angular TypeScript rules:
  - Performance rules (OnPush, impure pipes)
  - Code quality rules (class suffixes, lifecycle methods)
  - Dependency injection rules (providedIn, forward refs)
- ✅ Added 5 Angular template best practice rules:
  - trackBy functions for *ngFor
  - No function calls in templates
  - Button type attributes
  - No inline styles in templates
  - Self-closing tag preferences
- ✅ Updated documentation with config order explanation
- ✅ Added Angular best practice rules section to docs

### 2026-07-12 (Phase 1 - Initial Setup)

- ✅ Added `eslint-plugin-unused-imports` from backend-services
- ✅ Created custom `org/no-inline-template-style` rule
- ✅ Added console statement restrictions (warn level)
- ✅ Updated all Angular project configs with custom rule
- ✅ Added lint helper scripts to package.json
- ✅ Documented ESLint configuration and custom rules

# Commit Conventions Reference

This skill provides comprehensive guidance on commit message conventions for this Nx monorepo workspace.

## Overview

This workspace uses **Conventional Commits** with strict enforcement via commitlint. All commit messages must follow a specific format and use approved scopes.

## Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Components

**Type** (required): The kind of change
**Scope** (required): The project/area affected
**Subject** (required): Short description in imperative mood
**Body** (optional): Detailed explanation
**Footer** (optional): Breaking changes, issue references

## Commit Types

### Feature Development

- **feat**: A new feature for the user
  - Example: `feat(shell): add navigation menu`
  - Example: `feat(ui-common): create button component`

### Bug Fixes

- **fix**: A bug fix for the user
  - Example: `fix(data-access-auth): resolve token expiration issue`
  - Example: `fix(umdzidzisi-client): correct dashboard layout`

### Code Improvements

- **refactor**: Code change that neither fixes a bug nor adds a feature
  - Example: `refactor(util-event-bus): simplify event emission logic`
  - Example: `refactor(shell): extract routing to separate module`

- **perf**: Performance improvement
  - Example: `perf(umtengesi-website): optimize image loading`
  - Example: `perf(ui-common): reduce bundle size`

### Non-Functional Changes

- **style**: Code formatting, whitespace, missing semicolons (NOT CSS changes!)
  - Example: `style(shell): format code with prettier`
  - Example: `style(workspace): fix eslint warnings`

- **test**: Adding or updating tests
  - Example: `test(data-access-auth): add login service tests`
  - Example: `test(umdzidzisi-admin): improve e2e coverage`

- **docs**: Documentation only changes
  - Example: `docs(workspace): update README with deployment guide`
  - Example: `docs(ui-common): add component usage examples`

### Infrastructure

- **build**: Changes to build system or external dependencies
  - Example: `build(workspace): update vite configuration`
  - Example: `build(shell): configure native federation`

- **ci**: Changes to CI configuration files and scripts
  - Example: `ci(workspace): add GitHub Actions workflow`
  - Example: `ci(workspace): optimize build pipeline`

- **chore**: Other changes that don't modify src or test files
  - Example: `chore(workspace): update gitignore`
  - Example: `chore(deps): update eslint config`

- **revert**: Reverts a previous commit
  - Example: `revert(shell): revert "add navigation menu"`

## Valid Scopes

### Applications (7 total)

```
shell                 - Main shell/host application
umdzidzisi-website    - Umdzidzisi public website
umdzidzisi-admin      - Umdzidzisi admin portal
umdzidzisi-client     - Umdzidzisi client dashboard
umtengesi-website    - Umtengesi public website
umtengesi-admin      - Umtengesi admin portal
umtengesi-client     - Umtengesi client dashboard
```

### Shared Libraries (5 total)

```
ui-common            - Common UI components (notifications, banners, etc.)
data-access-auth     - Authentication services and guards
util-event-bus       - Inter-app communication via event bus
util-theming         - Theming system and theme service
models               - Shared data models and interfaces
```

### Infrastructure (3 total)

```
deps                 - Package dependencies (package.json changes)
ci                   - CI/CD configuration and workflows
workspace            - Workspace-level configuration (nx.json, tsconfig, etc.)
```

## Subject Line Rules

### Writing Good Subjects

✅ **DO:**

- Use imperative mood: "add" not "added" or "adds"
- Start with lowercase
- Keep under 72 characters
- Be specific and descriptive
- Complete the sentence: "This commit will..."
- Omit period at the end

❌ **DON'T:**

- Use past tense: "added feature"
- Use present continuous: "adding feature"
- Be vague: "update stuff" or "fix things"
- Include issue numbers in subject (use footer)
- End with period

### Examples

✅ Good:

```
feat(shell): add user authentication flow
fix(ui-common): resolve notification z-index issue
refactor(data-access-auth): extract token logic to service
chore(deps): upgrade Angular to 21.2.9
```

❌ Bad:

```
feat(shell): Added user authentication flow.     ❌ Past tense, period
fix(ui-common): fixing notification bug          ❌ Present continuous
refactor(data-access-auth): updates              ❌ Vague
chore(deps): Updated stuff                       ❌ Not specific
```

## Commit Body Guidelines

The body should:

- Wrap at 72 characters per line
- Explain **what** and **why**, not **how**
- Use bullet points for multiple items
- Leave blank line between subject and body

Example:

```
feat(umdzidzisi-website): add user profile page

Implemented comprehensive profile management including:
- Avatar upload with image cropping
- Personal information editing
- Account settings management
- Activity history display

This addresses user feedback requesting better profile
customization options.
```

## Breaking Changes

If a commit introduces breaking changes, add a footer:

```
feat(data-access-auth): change login API signature

Updated login method to accept email instead of username
for consistency with backend changes.

BREAKING CHANGE: AuthService.login() now requires email
parameter instead of username. Update all login forms to
collect email addresses.
```

## Issue References

Link commits to issues using footers:

```
fix(umtengesi-client): resolve dashboard loading error

Fixed null pointer exception when user has no recent
activity to display.

Closes #456
Fixes #457
Relates to #458
```

## Common Scenarios

### Dependency Updates

```
chore(deps): upgrade Tailwind CSS to v4.3.3

Updated Tailwind for latest utility classes and bug fixes.
No breaking changes.
```

### Multiple Scopes Affected

**Option 1:** Use most significant scope

```
feat(shell): add global error handling

Also updated ui-common notification component.
```

**Option 2:** Use `workspace` for cross-cutting changes

```
refactor(workspace): standardize error handling patterns
```

### UI/Styling Changes

**Functional changes** (new feature or bug fix):

```
feat(umdzidzisi-website): redesign homepage layout
fix(ui-common): correct button alignment on mobile
```

**Non-functional formatting** (prettier, eslint):

```
style(workspace): format all files with prettier
```

### Configuration Changes

**Workspace-level config:**

```
chore(workspace): update nx.json cache settings
build(workspace): configure vite for native federation
```

**CI/CD changes:**

```
ci(workspace): add automated deployment workflow
ci(workspace): enable caching in GitHub Actions
```

## Validation

Before committing, ensure:

1. ✓ Type is valid (feat, fix, chore, etc.)
2. ✓ Scope matches allowed list
3. ✓ Subject is imperative mood
4. ✓ Subject is under 72 characters
5. ✓ Subject has no period
6. ✓ Body lines wrap at 72 characters
7. ✓ Breaking changes use BREAKING CHANGE footer
8. ✓ Commit follows format: `type(scope): subject`

The pre-commit hook will automatically validate these rules.

## Quick Reference Card

```
FORMAT:   type(scope): subject
TYPES:    feat|fix|refactor|perf|style|test|docs|build|ci|chore|revert
SCOPES:   shell|umdzidzisi-*|umtengesi-*|ui-common|data-access-auth|
          util-event-bus|util-theming|models|deps|ci|workspace
SUBJECT:  Imperative, lowercase, <72 chars, no period
BODY:     Wrap at 72 chars, explain what & why
FOOTER:   BREAKING CHANGE, issue refs (Closes #123)
```

## Tools & Automation

### Using `/commit` Command

For guided commit creation, use the `/commit` slash command which will:

- Analyze your changes
- Detect affected scopes
- Suggest commit type
- Guide you through message creation
- Validate before committing

### Manual Commits

```bash
# Always validate your message first
git commit -m "feat(shell): add navigation menu"

# For multi-line commits
git commit -m "feat(shell): add navigation menu

Implemented responsive navigation with mobile drawer
and desktop dropdown menus.

Closes #123"
```

### Bypassing Validation (Emergency Only)

```bash
# Skip commitlint (NOT RECOMMENDED)
git commit --no-verify -m "emergency fix"
```

## Examples by Scope

### Shell Application

```
feat(shell): add application selector dashboard
fix(shell): resolve routing conflict between remotes
refactor(shell): extract federation config to separate file
```

### Umdzidzisi Domain

```
feat(umdzidzisi-website): add contact form
fix(umdzidzisi-admin): correct user table pagination
perf(umdzidzisi-client): optimize chart rendering
```

### Umtengesi Domain

```
feat(umtengesi-website): implement product catalog
fix(umtengesi-admin): resolve permission check error
refactor(umtengesi-client): simplify dashboard layout
```

### Shared Libraries

```
feat(ui-common): add tooltip component
fix(data-access-auth): handle expired refresh token
refactor(util-event-bus): improve type safety
docs(util-theming): document theme customization
```

### Infrastructure

```
chore(deps): upgrade nx to 23.0.1
ci(workspace): add automated testing workflow
build(workspace): configure tailwind purging
```

## Anti-Patterns to Avoid

❌ **Vague messages:**

```
fix(shell): fix bug
chore(workspace): updates
```

❌ **Wrong type:**

```
style(ui-common): add new button component    ❌ Should be feat
docs(shell): fix typo in code                 ❌ Should be fix or style
```

❌ **Multiple scopes in one commit:**

```
feat(shell,ui-common,data-access-auth): add authentication
```

Better: Split into separate commits or use `workspace`

❌ **Subject issues:**

```
feat(shell): Added navigation.                ❌ Past tense, period
feat(shell): adding navigation                ❌ Present continuous
feat(shell): NAVIGATION MENU                  ❌ All caps
```

## Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- Workspace commitlint config: `commitlint.config.js`
- Workspace scopes: See `commitlint.config.js` → `rules.scope-enum`

---

**Pro Tip:** Use `/commit` command for interactive, guided commit creation that handles all validation automatically!

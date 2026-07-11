# Smart Commit Command

You are helping the user create a well-formatted commit message following Conventional Commits and this workspace's commitlint rules.

## Step 1: Analyze Current Changes

First, run these commands to understand what's changed:

```bash
git status
git diff --stat
```

Then examine the actual changes (focus on meaningful portions, not entire diffs for large files).

## Step 2: Detect Affected Scopes

Parse the changed file paths to identify affected projects:

**Applications:**

- `apps/shell/**` → `shell`
- `apps/umdzidzisi/website/**` → `umdzidzisi-website`
- `apps/umdzidzisi/admin/**` → `umdzidzisi-admin`
- `apps/umdzidzisi/client/**` → `umdzidzisi-client`
- `apps/umtengesi/website/**` → `umtengesi-website`
- `apps/umtengesi/admin/**` → `umtengesi-admin`
- `apps/umtengesi/client/**` → `umtengesi-client`

**Libraries:**

- `libs/**/ui-common/**` → `ui-common`
- `libs/**/data-access-auth/**` → `data-access-auth`
- `libs/**/util-event-bus/**` → `util-event-bus`
- `libs/**/util-theming/**` → `util-theming`
- `libs/**/models/**` or `packages/**/models/**` → `models`

**Infrastructure:**

- `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `npm-shrinkwrap.json` → `deps`
- `.github/workflows/**`, `.circleci/**`, `azure-pipelines.yml` → `ci`
- `nx.json`, `tsconfig.base.json`, workspace config files, `.claude/**` → `workspace`

If multiple scopes are affected, list them and ask the user which is primary.

## Step 3: Suggest Commit Type

Based on the changes, suggest the most appropriate type:

- **feat**: New feature or capability (new component, new route, new service)
- **fix**: Bug fix (fixing broken functionality)
- **refactor**: Code restructuring without changing behavior
- **perf**: Performance improvement
- **style**: Code formatting, whitespace, missing semicolons (NOT CSS/UI changes)
- **test**: Adding or updating tests
- **docs**: Documentation changes only
- **build**: Changes to build system or external dependencies
- **ci**: Changes to CI configuration or scripts
- **chore**: Other maintenance tasks (updating gitignore, cleanup, etc.)
- **revert**: Reverting a previous commit

**Important distinctions:**

- CSS/Tailwind changes = `feat` or `fix` (functional change)
- Code formatting = `style` (no functional change)
- Adding features = `feat`
- Fixing bugs = `fix`

## Step 4: Interactive Questions

Use the AskUserQuestion tool to gather information:

1. **Commit Type:** Present detected type as suggested option with all other types
2. **Scope:** Present detected scope(s) with option for custom
3. **Subject:** Ask for short description (suggest one based on changes)
4. **Body (optional):** Ask if they want to add detailed description
5. **Breaking Change (optional):** Ask if this introduces breaking changes
6. **Issue Reference (optional):** Ask for issue numbers if applicable

## Step 5: Validate Message

Before creating the commit, validate:

- ✓ Subject line is under 72 characters
- ✓ Subject uses imperative mood ("add" not "added" or "adds")
- ✓ Scope is in the allowed list (or user confirmed custom)
- ✓ No period at end of subject
- ✓ Body lines wrapped at 72 characters (if present)
- ✓ Follows format: `type(scope): subject`

## Step 6: Create Commit

Build the commit message in this format:

```
<type>(<scope>): <subject>

<body if provided>

<BREAKING CHANGE: description if applicable>
<Closes #issue if provided>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

Then execute:

```bash
# Stage files if needed
git add .

# Create commit
git commit -m "<full commit message>"

# Show status
git status
```

## Valid Scopes (Enforced by Commitlint)

**Applications:**

- shell
- umdzidzisi-website
- umdzidzisi-admin
- umdzidzisi-client
- umtengesi-website
- umtengesi-admin
- umtengesi-client

**Libraries:**

- ui-common
- data-access-auth
- util-event-bus
- util-theming
- models

**Infrastructure:**

- deps
- ci
- workspace

## Example Commits

```
feat(umdzidzisi-website): add user profile page

Implemented new profile page with edit functionality,
avatar upload, and settings management.

Closes #123

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

```
fix(data-access-auth): resolve token refresh race condition

Fixed issue where concurrent requests could trigger multiple
token refresh attempts, causing authentication failures.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

```
chore(deps): upgrade Tailwind CSS to v4.3.3

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Important Guidelines

- ALWAYS analyze actual changes before suggesting type/subject
- Use imperative mood ("add feature" not "added feature")
- Keep subject concise and descriptive
- Subject should complete: "This commit will..."
- For multiple scopes, choose the primary one or use `workspace`
- Breaking changes MUST include BREAKING CHANGE footer
- Validate scope against allowed list
- Be specific and meaningful in commit messages

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: apps/e2e/shell/src/example.spec.ts >> has title
- Location: apps/e2e/shell/src/example.spec.ts:3:5

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/", waiting until "load"

```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test';
  2 | 
  3 | test('has title', async ({ page }) => {
> 4 |   await page.goto('/');
    |              ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  5 | 
  6 |   // Expect h1 to contain a substring.
  7 |   expect(await page.locator('h1').innerText()).toContain('Welcome');
  8 | });
  9 | 
```
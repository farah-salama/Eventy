import { test as base, expect, type  Page } from '@playwright/test';

// Extend base test with custom fixtures
export const test = base.extend<{
  authenticatedPage: Page;
  adminPage: Page;
}>({
  // Fixture for logged-in regular user
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'new@eventy.com');
    await page.fill('input[name="password"]', 'newAcc123');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL(/.*login/);
    
    // Now pass the authenticated page to the test
    await use(page);
  },

  // Fixture for logged-in admin user
  adminPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@eventy.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL(/.*login/);
    
    await use(page);
  },
});

export { expect };
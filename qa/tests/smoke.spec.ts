import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  
  test('homepage loads successfully', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    
    // Check page title contains Eventy
    await expect(page).toHaveTitle(/Eventy/i);
    
    // Check banner is visible
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('can navigate to events page', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', {name: 'View all events'})).toBeVisible();
    
    // Click on Events link in navbar
    await page.click('text=view all events');
    
    // Verify URL changed
    await expect(page).toHaveURL(/.*events/);
    
    // Verify events page content loads
    await expect(page.getByRole('combobox').first()).toBeVisible();
  });
  
  test('can navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Click login button/link
    await page.click('text=Login');
    
    // Verify we're on login page
    await expect(page).toHaveURL(/.*login/);
    
    // Verify login form exists
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

});
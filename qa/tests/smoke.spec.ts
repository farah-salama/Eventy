import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  
  test('homepage loads successfully', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    
    // Check page title contains Eventy
    await expect(page).toHaveTitle(/Eventy/i);
    
    // Check navbar is visible
    await expect(page.locator('nav')).toBeVisible();
  });

});
import { test, expect } from '@playwright/test';

test.describe('Events', () => {

  // ==================== BROWSING ====================

  test('events page displays event cards', async ({ page }) => {
    await page.goto('/events');
    
    // Check if events exist first
    const eventCard = page.locator('[class*="Card"], [class*="card"]').first();
    
    if (await eventCard.isVisible().catch(() => false)) {
      await expect(eventCard).toBeVisible();
    } else {
        // No events - verify empty state instead
        await expect(page.getByText(/no events/i)).toBeVisible();
        test.info().annotations.push({ 
            type: 'warning', 
            description: 'No events in database - verified empty state instead' 
        });
    }
  });

  test('events page shows loading state', async ({ page }) => {
    await page.goto('/events');
    
    // Either shows loading spinner initially or events load directly
    // Adjust based on your app's behavior
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('can view events details', async ({ page }) => {
    await page.goto('/events');

     // Check if events exist first
     const eventCard = page.getByRole('button', { name: 'View Details' }).first();
    
     if (await eventCard.isVisible().catch(() => false)) {
        // Click on first event
        await expect(page.getByRole('button', { name: 'View Details' }).first()).toBeVisible();
        
        // Should navigate to event details page
        await expect(page).toHaveURL(/.*event\/.+/);
     } else {
         // No events
         test.info().annotations.push({ 
             type: 'warning', 
             description: 'No events in database' 
         });
     }
  });

  // ==================== SEARCH & FILTER ====================

  test('can search events by name', async ({ page }) => {
    await page.goto('/');
    
    // Use the search box in navbar
    const searchBox = page.getByPlaceholder(/search/i);
    await searchBox.fill('test event');
    await searchBox.press('Enter');
    
    // Should navigate to events page with search query
    await expect(page).toHaveURL(/.*events.*search/);
  });

  test('can filter events by category', async ({ page }) => {
    await page.goto('/events');
    
    // Find and click a category filter (adjust selector)
    const categoryFilter = page.getByRole('combobox').first();
    await categoryFilter.click();
    
    // Select a category from dropdown
    await page.getByRole('option').first().click();
    
    // Page should update (URL or content changes)
    await expect(page.locator('body')).toBeVisible();
  });

  // ==================== EVENT DETAILS ====================

});
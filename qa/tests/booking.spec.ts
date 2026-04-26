import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Booking', () => {

  // Helper to login before booking tests
  async function loginAsUser(page) {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'new@eventy.com');
    await page.fill('input[name="password"]', 'newAcc123');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL(/.*login/);
  }

  // ==================== UNAUTHENTICATED ====================

  test('unauthenticated user cannot book event', async ({ page }) => {
    await page.goto('/events');
    
    // Click first event
    await page.getByRole('button', { name: 'Book Now' }).first().click();
    await expect(page).toHaveURL(/login/);
  });
  
  test('unauthenticated user cannot view event details', async ({ page }) => {
    await page.goto('/events');
    
    // Click first event
    await page.getByRole('button', { name: 'View Details' }).first().click();
    // await expect(page).toHaveURL(/.*events\/.+/);
    await expect(page).toHaveURL(/login/);
  });

  // ==================== AUTHENTICATED BOOKING ====================

  test('authenticated user can view event details', async ({ page }) => {
    await loginAsUser(page);
    
    await page.goto('/events');
    await page.getByRole('button', { name: 'View Details' }).first().click();

    // Should show success message
    await expect(page).toHaveURL(/event/);
  });

  test('authenticated user can book event', async ({ page }) => {
    await loginAsUser(page);
    
    await page.goto('/events');
    await page.getByRole('button', { name: 'Book Now' }).first().click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Should show success message
    await expect(page.getByRole('heading', { name: 'Booking Successful!' })).toBeVisible();
  });

  test('user can view their bookings', async ({ page }) => {
    await loginAsUser(page);
    
    await page.goto('/booked-events');
    
    // Should show bookings page
    await expect(page).toHaveURL(/.*booked/);
    await expect(page.getByText('confirmed')).toBeVisible();
  });

  test('user can cancel a booking', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/booked-events');
    
    // Set up dialog handler BEFORE triggering it
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm'); // or 'alert'
      expect(dialog.message()).toContain('cancel'); // Check message
      await dialog.accept(); // Click "OK" / "Yes"
      // Or: await dialog.dismiss(); // Click "Cancel" / "No"
    });
    
    // Now click the cancel button
    const cancelButton = page.getByRole('button', { name: /cancel/i }).first();
    await cancelButton.click();
    
    // Verify booking was cancelled
    await expect(page.getByText(/cancelled/i).first()).toBeVisible();
  });

});
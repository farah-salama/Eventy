import { test, expect } from './fixtures';

test.describe.configure({ mode: 'serial' });

test.describe('Booking', () => {

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

  test('authenticated user can view event details', async ({ authenticatedPage }) => {    
    await authenticatedPage.goto('/events');
    await authenticatedPage.getByRole('button', { name: 'View Details' }).first().click();

    // Should show success message
    await expect(authenticatedPage).toHaveURL(/event/);
  });

  test('authenticated user can book event', async ({ authenticatedPage }) => {    
    await authenticatedPage.goto('/events');
    await authenticatedPage.getByRole('button', { name: 'Book Now' }).first().click();
    await authenticatedPage.getByRole('button', { name: 'Confirm' }).click();

    // Should show success message
    await expect(authenticatedPage.getByRole('heading', { name: 'Booking Successful!' })).toBeVisible();
  });

  test('user can view their bookings', async ({ authenticatedPage }) => {    
    await authenticatedPage.goto('/booked-events');
    
    // Should show bookings page
    await expect(authenticatedPage).toHaveURL(/.*booked/);
    await expect(authenticatedPage.getByText('confirmed')).toBeVisible();
  });

  test('user can cancel a booking', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/booked-events');
    
    // Set up dialog handler BEFORE triggering it
    authenticatedPage.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm'); // or 'alert'
      expect(dialog.message()).toContain('cancel'); // Check message
      await dialog.accept(); // Click "OK" / "Yes"
      // Or: await dialog.dismiss(); // Click "Cancel" / "No"
    });
    
    // Now click the cancel button
    const cancelButton = authenticatedPage.getByRole('button', { name: /cancel/i }).first();
    await cancelButton.click();
    
    // Verify booking was cancelled
    await expect(authenticatedPage.getByText(/cancelled/i).first()).toBeVisible();
  });

});
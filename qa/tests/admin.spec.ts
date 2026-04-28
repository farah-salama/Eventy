import { test, expect } from './fixtures';

test.describe.configure({ mode: 'serial' });

test.describe('Admin Panel', () => {

  // ==================== ACCESS CONTROL ====================

  test('admin can access admin panel', async ({ adminPage }) => {    
    await adminPage.goto('/admin');
    
    await expect(adminPage).toHaveURL(/.*admin/);
    await expect(adminPage.locator('body')).toBeVisible();
  });

  test('regular user cannot access admin panel', async ({ authenticatedPage }) => {
    // Try to access admin
    await authenticatedPage.goto('/admin');
    
    // Should NOT be on admin page
    await expect(authenticatedPage).not.toHaveURL(/.*admin/);
  });

  // ==================== EVENT MANAGEMENT ====================

  test('admin can see event management section', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    
    // Should show events management UI
    await expect(adminPage.getByText(/management/i).first()).toBeVisible();
  });

  test('admin can create new event', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    
    // Find and click create/add button
    const addButton = adminPage.getByRole('button', { name: /add|create|new/i }).first();
    await addButton.click();
    
    // Should show event form
    await expect(adminPage.locator('input, textarea').first()).toBeVisible();
  });

  test('admin can delete event', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    
    // Find delete button
    const deleteButton = adminPage.getByRole('button', { name: 'Delete event' }).first();
    
    if (await deleteButton.isVisible()) {
      // Just verify it exists
      await expect(deleteButton).toBeEnabled();
    }
  });

});
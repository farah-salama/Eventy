import { test, expect } from '@playwright/test';

test.describe('Login', () => {

  // ==================== POSITIVE TESTS ====================

  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'new@eventy.com');
    await page.fill('input[name="password"]', 'newAcc123');
    
    await page.click('button[type="submit"]');
    
    // Should redirect away from login page
    await expect(page).not.toHaveURL(/.*login/);
    
    // Should show user is logged in (navbar changes)
    await expect(page.getByRole('button', { name: 'New User' })).toBeVisible();
  });

  test('user can login and access protected routes', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'new@eventy.com');
    await page.fill('input[name="password"]', 'newAcc123');
    
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await expect(page).not.toHaveURL(/.*login/);
    
    // Navigate to a protected route (profile)
    await page.goto('/profile');
    
    // Should be able to access profile page
    await expect(page).toHaveURL(/.*profile/);
  });

  // ==================== NEGATIVE TESTS ====================

  test('login fails with invalid email', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'nonexistent@email.com');
    await page.fill('input[name="password"]', 'somepassword');
    
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.getByText(/invalid|incorrect|not found|error/i)).toBeVisible();
    
    // Should still be on login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('login fails with wrong password', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'new@eventy.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.getByText(/invalid|incorrect|wrong|error/i)).toBeVisible();
    
    // Should still be on login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('login fails with invalid email format', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'notanemail');
    await page.fill('input[name="password"]', 'password123');
    
    await page.click('button[type="submit"]');
    
    // Email input should be invalid (HTML5 validation)
    await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
    
    // Should still be on login page
    await expect(page).toHaveURL(/.*login/);
  });

  // ==================== EMPTY FIELD VALIDATION ====================

  test('login form validates empty email', async ({ page }) => {
    await page.goto('/login');
    
    // Only fill password
    await page.fill('input[name="password"]', 'password123');
    
    await page.click('button[type="submit"]');
    
    // Email input should be invalid (required)
    await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
    
    await expect(page).toHaveURL(/.*login/);
  });

  test('login form validates empty password', async ({ page }) => {
    await page.goto('/login');
    
    // Only fill email
    await page.fill('input[name="email"]', 'admin@eventy.com');
    
    await page.click('button[type="submit"]');
    
    // Password input should be invalid (required)
    await expect(page.locator('input[name="password"]:invalid')).toBeVisible();
    
    await expect(page).toHaveURL(/.*login/);
  });

  test('login form validates all empty fields', async ({ page }) => {
    await page.goto('/login');
    
    // Click submit without filling anything
    await page.click('button[type="submit"]');
    
    // Should still be on login page
    await expect(page).toHaveURL(/.*login/);
  });

  // ==================== UI/UX TESTS ====================

  test('login page has link to register', async ({ page }) => {
    await page.goto('/login');
    
    // Should have a link to registration
    const registerLink = page.getByRole('link', { name: 'Register here' });
    await expect(registerLink).toBeVisible();
    
    // Clicking it should go to register page
    await registerLink.click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('password field hides input', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.locator('input[name="password"]');
    
    // Password field should have type="password" (hides characters)
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // ==================== SECURITY TESTS ====================

  test('unauthenticated user cannot access protected routes', async ({ page }) => {
    // Try to access profile without logging in
    await page.goto('/profile');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('unauthenticated user cannot access admin panel', async ({ page }) => {
    // Try to access admin without logging in
    await page.goto('/admin');
    
    // Should be redirected to login or home
    await expect(page).not.toHaveURL(/.*admin/);
  });

  test('unauthorized user cannot access admin panel', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'new@eventy.com');
    await page.fill('input[name="password"]', 'newAcc123');
    
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await expect(page).not.toHaveURL(/.*login/);
    
    // Try to access admin without logging in
    await page.goto('/admin');
    
    // Should be redirected to login or home
    await expect(page).not.toHaveURL(/.*admin/);
  });

  // ==================== LOGOUT TEST ====================

  test('user can logout', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'new@eventy.com');
    await page.fill('input[name="password"]', 'newAcc123');
    await page.click('button[type="submit"]');
    
    // Wait for login
    await expect(page).not.toHaveURL(/.*login/);
    
    // Find and click logout (might be in a menu)
    // Adjust selector based on your actual UI
    await page.getByRole('button', { name: 'New User' }).click();
    const accountButton = page.getByRole('menuitem', { name: 'Logout' });
    await accountButton.click();
    
    // Should be logged out - check for login link or redirect
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
  });

});
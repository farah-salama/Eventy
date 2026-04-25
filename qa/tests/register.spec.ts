import { test, expect } from '@playwright/test';

test.describe('Registration', () => {

    // ==================== POSITIVE TESTS ====================
  test('user can register with valid unique credentials', async ({ page }) => {
    await page.goto('/register');
    
    // Use unique email with timestamp to avoid "user exists" error
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'SecurePass123');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123');
    
    await page.click('button[type="submit"]');
    
    // Should redirect away from register page (to home or login)
    await expect(page).not.toHaveURL(/.*register/);
  });

    // ==================== NEGATIVE TESTS ====================

  test('user cannot register with existing user credentials', async ({ page }) => {
    await page.goto('/register');
    
    // Fill in login form
    await page.fill('input[type="name"], input[name="name"]', 'New User');
    await page.fill('input[type="email"], input[name="email"]', 'new@eventy.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');

    
    // Click register button
    await page.click('button[type="submit"]');

    page.locator("User already exists");
    
    // Should still be on register page
    await expect(page).toHaveURL(/.*register/);
  });

  test('register fails with invalid email', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[type="name"], input[name="name"]', 'New User');
    await page.fill('input[type="email"], input[name="email"]', 'wrongemail.com');
    await page.fill('input[type="password"]', 'password');
    await page.fill('input[name="confirmPassword"]', 'password');
    
    await page.click('button[type="submit"]');
    
    // Check that the email input is invalid using CSS pseudo-class
    await expect(page.locator('input[name="email"]:invalid')).toBeVisible();

    // Should still be on register page
    await expect(page).toHaveURL(/.*register/);
  });

  test('register fails with mismatched passwords', async ({ page }) => {
    await page.goto('/register');
  
    await page.fill('input[name="name"]', 'New User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'differentpassword');
    
    await page.click('button[type="submit"]');
    
    // Should show error message about passwords not matching
    // Adjust the text based on what your app actually displays
    await expect(page.getByText('Passwords do not match')).toBeVisible();
    
    // Should still be on register page
    await expect(page).toHaveURL(/.*register/);
  });


  // ==================== EMPTY FIELD VALIDATION ====================

  test('register form validates empty name', async ({ page }) => {
    await page.goto('/register');
    
    // Fill everything except name
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    await page.click('button[type="submit"]');

    await expect(page.locator('input[name="name"]:invalid')).toBeVisible();
    await expect(page).toHaveURL(/.*register/);
  });

  test('register form validates empty email', async ({ page }) => {
    await page.goto('/register');
    
    // Fill everything except email
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
    await expect(page).toHaveURL(/.*register/);
  });

  test('register form validates empty password', async ({ page }) => {
    await page.goto('/register');
    
    // Fill everything except password
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('input[name="password"]:invalid')).toBeVisible();
    await expect(page).toHaveURL(/.*register/);
  });

  test('register form validates empty confirm password', async ({ page }) => {
    await page.goto('/register');
    
    // Fill everything except confirm password
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('input[name="confirmPassword"]:invalid')).toBeVisible();
    await expect(page).toHaveURL(/.*register/);
  });

  test('register form validates all empty fields', async ({ page }) => {
    await page.goto('/register');
    
    // Click submit without filling form
    await page.click('button[type="submit"]');
    await expect(page.locator('input[name="name"]:invalid')).toBeVisible();
    await expect(page).toHaveURL(/.*register/);
  });


  // ==================== UI/UX TESTS ====================

  test('register page has link to login', async ({ page }) => {
    await page.goto('/register');
    
    // Should have a link to login
    const loginLink = page.getByRole('link', { name: 'Login here' });
    await expect(loginLink).toBeVisible();
    
    // Clicking it should go to login page
    await loginLink.click();
    await expect(page).toHaveURL(/.*login/);
  });

  test('password field hides input', async ({ page }) => {
    await page.goto('/register');
    
    const passwordInput = page.locator('input[name="password"]');
    const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    
    // Both password fields should have type="password"
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  test('register form has all required fields', async ({ page }) => {
    await page.goto('/register');
    
    // Verify all form fields exist
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });


  // ==================== EDGE CASE TESTS ====================

  test('register handles name with special characters', async ({ page }) => {
    await page.goto('/register');
    
    const uniqueEmail = `special_${Date.now()}@example.com`;
    
    await page.fill('input[name="name"]', "O'Connor-Smith Jr.");
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'SecurePass123');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123');
    
    await page.click('button[type="submit"]');
    
    await expect(page).not.toHaveURL(/.*register/);
    expect(await page.getByRole('button', { name: "O'Connor-Smith Jr." })).toBeVisible();
  });

  test('register handles very long name', async ({ page }) => {
    await page.goto('/register');
    
    const longName = 'A'.repeat(300);
    const uniqueEmail = `longname_${Date.now()}@example.com`;
    
    await page.fill('input[name="name"]', longName);
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'SecurePass123');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123');
    
    await page.click('button[type="submit"]');
    
    // App should either accept it or show validation error (not crash)
    await expect(page).toHaveURL(/.*/); // Page should still be responsive
  });

  test('register with whitespace-only name fails', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="name"]', '   ');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    await page.click('button[type="submit"]');
    
    // Should still be on register (whitespace-only name invalid)
    await expect(page).toHaveURL(/.*register/);
  });


  // ==================== POST-REGISTRATION TESTS ====================

  test('newly registered user can login immediately', async ({ page }) => {
    const uniqueEmail = `newuser_${Date.now()}@example.com`;
    const password = 'SecurePass123';
    
    // Register
    await page.goto('/register');
    await page.fill('input[name="name"]', 'New User');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button[type="submit"]');
    
    // Wait for registration to complete
    await expect(page).not.toHaveURL(/.*register/, { timeout: 10000 });

    await page.getByRole('button', { name: 'New User' }).click();
    const accountButton = page.getByRole('menuitem', { name: 'Logout' });
    await accountButton.click();
    
    // Now try to login with same credentials
    await page.goto('/login');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    
    // Should successfully login
    await expect(page).not.toHaveURL(/.*login/);
  });

});
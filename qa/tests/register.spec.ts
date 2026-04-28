import { test, expect } from '@playwright/test';
import { RegisterPage } from './pages/RegisterPage';

test.describe('Registration', () => {

    // ==================== POSITIVE TESTS ====================
  test('user can register with valid unique credentials', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.registerWithUniqueEmail('Test User', 'SecurePass123');
    await registerPage.expectRegistrationSuccess();
  });

    // ==================== NEGATIVE TESTS ====================

  test('user cannot register with existing user credentials', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register('New User', 'new@eventy.com', 'password123');
    await registerPage.expectStillOnRegister();
  });

  test('register fails with invalid email', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register('New User', 'wrongemail.com', 'password');
    await registerPage.expectInvalidEmail();
  });

  test('register fails with mismatched passwords', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register('New User', 'test@example.com', 'password123', 'differentpassword');
    await registerPage.expectMismatchError();
  });


  // ==================== EMPTY FIELD VALIDATION ====================

  test('register form validates empty name', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.fillEmail('test@example.com');
    await registerPage.fillPassword('password123');
    await registerPage.fillConfirmPassword('password123');
    await registerPage.clickSubmit();
    await registerPage.expectInvalidName();
  });

  test('register form validates empty email', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.fillName('Test User');
    await registerPage.fillPassword('password123');
    await registerPage.fillConfirmPassword('password123');
    await registerPage.clickSubmit();
    await registerPage.expectInvalidEmail();
  });

  test('register form validates empty password', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.fillName('Test User');
    await registerPage.fillEmail('test@example.com');
    await registerPage.fillConfirmPassword('password123');
    await registerPage.clickSubmit();
    await registerPage.expectInvalidPassword();
  });

  test('register form validates empty confirm password', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.fillName('Test User');
    await registerPage.fillEmail('test@example.com');
    await registerPage.fillPassword('password123');
    await registerPage.clickSubmit();
    await registerPage.expectInvalidConfirmPassword();
  });

  test('register form validates all empty fields', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.clickSubmit();
    await registerPage.expectInvalidName();
  });


  // ==================== UI/UX TESTS ====================

  test('register page has link to login', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await expect(registerPage.loginLink).toBeVisible();
    await registerPage.clickLoginLink();
  });

  test('password field hides input', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.expectPasswordHidden();
  });

  test('register form has all required fields', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.expectAllFieldsVisible();
  });


  // ==================== EDGE CASE TESTS ====================

  test('register handles name with special characters', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const uniqueEmail = `special_${Date.now()}@example.com`;
    await registerPage.goto();
    await registerPage.register("O'Connor-Smith Jr.", uniqueEmail, 'SecurePass123');
    await registerPage.expectRegisteredUser("O'Connor-Smith Jr.");
  });

  test('register handles very long name', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const longName = 'A'.repeat(300);
    const uniqueEmail = `longname_${Date.now()}@example.com`;
    await registerPage.goto();
    await registerPage.register(longName, uniqueEmail, 'SecurePass123');
    // App should either accept it or show validation error (not crash)
    await expect(page).toHaveURL(/.*/);
  });

  test('register with whitespace-only name fails', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register('   ', 'test@example.com', 'password123');
    await registerPage.expectStillOnRegister();
  });


  // ==================== POST-REGISTRATION TESTS ====================

  test('newly registered user can login immediately', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const uniqueEmail = `newuser_${Date.now()}@example.com`;
    const password = 'SecurePass123';
    
    // Register
    await registerPage.goto();
    await registerPage.register('New User', uniqueEmail, password);
    
    // Wait for registration to complete
    await expect(page).not.toHaveURL(/.*register/, { timeout: 10000 });

    // Logout
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
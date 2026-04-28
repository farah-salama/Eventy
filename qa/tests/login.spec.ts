import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Login', () => {

  // ==================== POSITIVE TESTS ====================

  test('user can login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('new@eventy.com', 'newAcc123');
    await loginPage.expectLoggedIn('New User');
  });

  test('user can login and access protected routes', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAndWait('new@eventy.com', 'newAcc123');
    
    // Navigate to a protected route (profile)
    await page.goto('/profile');
    
    // Should be able to access profile page
    await expect(page).toHaveURL(/.*profile/);
  });

  // ==================== NEGATIVE TESTS ====================

  test('login fails with invalid email', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('nonexistent@email.com', 'somepassword');
    await loginPage.expectError();
  });

  test('login fails with wrong password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('new@eventy.com', 'wrongpassword');
    await loginPage.expectError();
  });

  test('login fails with invalid email format', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.fillEmail('notanemail');
    await loginPage.fillPassword('password123');
    await loginPage.clickSubmit();
    await loginPage.expectInvalidEmail();
  });

  // ==================== EMPTY FIELD VALIDATION ====================

  test('login form validates empty email', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.fillPassword('password123');
    await loginPage.clickSubmit();
    await loginPage.expectInvalidEmail();
  });

  test('login form validates empty password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.fillEmail('admin@eventy.com');
    await loginPage.clickSubmit();
    await loginPage.expectInvalidPassword();
  });

  test('login form validates all empty fields', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.clickSubmit();
    await expect(page).toHaveURL(/.*login/);
  });

  // ==================== UI/UX TESTS ====================

  test('login page has link to register', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(loginPage.registerLink).toBeVisible();
    await loginPage.clickRegisterLink();
  });

  test('password field hides input', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.expectPasswordHidden();
  });

  // ==================== SECURITY TESTS ====================

  test('unauthenticated user cannot access protected routes', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/.*login/);
  });

  test('unauthenticated user cannot access admin panel', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).not.toHaveURL(/.*admin/);
  });

  test('unauthorized user cannot access admin panel', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAndWait('new@eventy.com', 'newAcc123');
    
    // Try to access admin
    await page.goto('/admin');
    await expect(page).not.toHaveURL(/.*admin/);
  });

  // ==================== LOGOUT TEST ====================

  test('user can logout', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAndWait('new@eventy.com', 'newAcc123');
    await loginPage.logout();
  });

});
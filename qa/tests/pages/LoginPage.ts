import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;
  readonly userButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.getByText(/invalid|incorrect|not found|error/i);
    this.registerLink = page.getByRole('link', { name: 'Register here' });
    this.userButton = page.getByRole('button', { name: 'New User' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickSubmit() {
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();
  }

  async loginAndWait(email: string, password: string) {
    await this.login(email, password);
    await expect(this.page).not.toHaveURL(/.*login/);
  }

  async expectLoggedIn(username: string) {
    await expect(this.page).not.toHaveURL(/.*login/);
    await expect(this.page.getByRole('button', { name: username })).toBeVisible();
  }

  async expectError() {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.page).toHaveURL(/.*login/);
  }

  async expectInvalidEmail() {
    await expect(this.emailInput).toHaveAttribute('type', 'email');
    await expect(this.page.locator('input[name="email"]:invalid')).toBeVisible();
    await expect(this.page).toHaveURL(/.*login/);
  }

  async expectInvalidPassword() {
    await expect(this.page.locator('input[name="password"]:invalid')).toBeVisible();
    await expect(this.page).toHaveURL(/.*login/);
  }

  async expectPasswordHidden() {
    await expect(this.passwordInput).toHaveAttribute('type', 'password');
  }

  async clickRegisterLink() {
    await this.registerLink.click();
    await expect(this.page).toHaveURL(/.*register/);
  }

  async logout() {
    await this.userButton.click();
    const logoutButton = this.page.getByRole('menuitem', { name: 'Logout' });
    await logoutButton.click();
    await expect(this.page.getByRole('link', { name: /login/i })).toBeVisible();
  }
}

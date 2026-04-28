import { Page, Locator, expect } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;
  readonly errorMessage: Locator;
  readonly mismatchErrorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('input[name="name"]');
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.loginLink = page.getByRole('link', { name: 'Login here' });
    this.errorMessage = page.getByText(/user already exists|error/i);
    this.mismatchErrorMessage = page.getByText('Passwords do not match');
  }

  async goto() {
    await this.page.goto('/register');
  }

  async fillName(name: string) {
    await this.nameInput.fill(name);
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async fillConfirmPassword(confirmPassword: string) {
    await this.confirmPasswordInput.fill(confirmPassword);
  }

  async clickSubmit() {
    await this.submitButton.click();
  }

  async register(name: string, email: string, password: string, confirmPassword: string = password) {
    await this.fillName(name);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(confirmPassword);
    await this.clickSubmit();
  }

  async registerWithUniqueEmail(name: string, password: string) {
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    await this.register(name, uniqueEmail, password);
    return uniqueEmail;
  }

  async expectRegistrationSuccess() {
    await expect(this.page).not.toHaveURL(/.*register/);
  }

  async expectRegisteredUser(username: string) {
    await expect(this.page).not.toHaveURL(/.*register/);
    await expect(this.page.getByRole('button', { name: username })).toBeVisible();
  }

  async expectStillOnRegister() {
    await expect(this.page).toHaveURL(/.*register/);
  }

  async expectError() {
    await expect(this.errorMessage).toBeVisible();
    await this.expectStillOnRegister();
  }

  async expectMismatchError() {
    await expect(this.mismatchErrorMessage).toBeVisible();
    await this.expectStillOnRegister();
  }

  async expectInvalidEmail() {
    await expect(this.page.locator('input[name="email"]:invalid')).toBeVisible();
    await this.expectStillOnRegister();
  }

  async expectInvalidName() {
    await expect(this.page.locator('input[name="name"]:invalid')).toBeVisible();
    await this.expectStillOnRegister();
  }

  async expectInvalidPassword() {
    await expect(this.page.locator('input[name="password"]:invalid')).toBeVisible();
    await this.expectStillOnRegister();
  }

  async expectInvalidConfirmPassword() {
    await expect(this.page.locator('input[name="confirmPassword"]:invalid')).toBeVisible();
    await this.expectStillOnRegister();
  }

  async expectPasswordHidden() {
    await expect(this.passwordInput).toHaveAttribute('type', 'password');
    await expect(this.confirmPasswordInput).toHaveAttribute('type', 'password');
  }

  async clickLoginLink() {
    await this.loginLink.click();
    await expect(this.page).toHaveURL(/.*login/);
  }

  async expectAllFieldsVisible() {
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }
}

import { Page, Locator, expect } from '@playwright/test';

export class BookingPage {
  readonly page: Page;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;
  readonly successHeading: Locator;
  readonly confirmedStatus: Locator;
  readonly cancelledStatus: Locator;

  constructor(page: Page) {
    this.page = page;
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.successHeading = page.getByRole('heading', { name: 'Booking Successful!' });
    this.confirmedStatus = page.getByText('confirmed');
    this.cancelledStatus = page.getByText(/cancelled/i);
  }

  async goto() {
    await this.page.goto('/booked-events');
  }

  async expectOnBookingsPage() {
    await expect(this.page).toHaveURL(/.*booked/);
  }

  async clickConfirm() {
    await this.confirmButton.click();
  }

  async expectBookingSuccess() {
    await expect(this.successHeading).toBeVisible();
  }

  async expectConfirmedBookingsVisible() {
    await expect(this.confirmedStatus).toBeVisible();
  }

  async cancelFirstBooking() {
    // Set up dialog handler BEFORE triggering it
    this.page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('cancel');
      await dialog.accept();
    });
    
    await this.cancelButton.first().click();
  }

  async expectBookingCancelled() {
    await expect(this.cancelledStatus.first()).toBeVisible();
  }
}

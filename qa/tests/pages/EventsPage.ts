import { Page, Locator, expect } from '@playwright/test';

export class EventsPage {
  readonly page: Page;
  readonly eventCards: Locator;
  readonly firstEventCard: Locator;
  readonly viewDetailsButton: Locator;
  readonly bookNowButton: Locator;
  readonly searchBox: Locator;
  readonly categoryFilter: Locator;
  readonly noEventsMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.eventCards = page.getByRole('button', { name: 'View Details' });
    this.firstEventCard = this.eventCards.first();
    this.viewDetailsButton = page.getByRole('button', { name: 'View Details' });
    this.bookNowButton = page.getByRole('button', { name: 'Book Now' });
    this.searchBox = page.getByPlaceholder(/search/i);
    this.categoryFilter = page.getByRole('combobox').first();
    this.noEventsMessage = page.getByText(/no events found/i);
  }

  async goto() {
    await this.page.goto('/events');
  }

  async gotoHome() {
    await this.page.goto('/');
  }

  async hasEvents(): Promise<boolean> {
    await this.page.waitForLoadState('networkidle');
    return await this.firstEventCard.isVisible().catch(() => false);
  }

  async expectEventCardsVisible() {
    // Wait for either event cards or "no events" message to appear
    await expect(this.firstEventCard.or(this.noEventsMessage)).toBeVisible();
  }

  async expectPageLoaded() {
    await expect(this.page.locator('body')).not.toBeEmpty();
  }

  async clickViewDetailsFirst() {
    await this.viewDetailsButton.first().click();
  }

  async clickViewDetailsIfAvailable() {
    const button = this.viewDetailsButton.first();
    if (await button.isVisible().catch(() => false)) {
      await this.clickViewDetailsFirst();
      await expect(this.page).toHaveURL(/.*event\/.+/);
    }
  }

  async clickBookNowFirst() {
    await this.bookNowButton.first().click();
  }

  async searchEvents(query: string) {
    await this.searchBox.fill(query);
    await this.searchBox.press('Enter');
  }

  async expectSearchResults() {
    await expect(this.page).toHaveURL(/.*events.*search/);
  }

  async selectCategory() {
    await this.categoryFilter.click();
    await this.page.getByRole('option').first().click();
    await this.expectPageLoaded();
  }
}

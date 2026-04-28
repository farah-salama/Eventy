import { test, expect } from '@playwright/test';
import { EventsPage } from './pages/EventsPage';

test.describe('Events', () => {

  // ==================== BROWSING ====================

  test('events page displays event cards', async ({ page }) => {
    const eventsPage = new EventsPage(page);
    await eventsPage.goto();
    await eventsPage.expectEventCardsVisible();
    
    if (!await eventsPage.hasEvents()) {
      test.info().annotations.push({ 
        type: 'warning', 
        description: 'No events in database - verified empty state instead' 
      });
    }
  });

  test('events page shows loading state', async ({ page }) => {
    const eventsPage = new EventsPage(page);
    await eventsPage.goto();
    await eventsPage.expectPageLoaded();
  });

  test('can view events details', async ({ page }) => {
    const eventsPage = new EventsPage(page);
    await eventsPage.goto();
    await eventsPage.clickViewDetailsIfAvailable();
    
    if (!await eventsPage.hasEvents()) {
      test.info().annotations.push({ 
        type: 'warning', 
        description: 'No events in database' 
      });
    }
  });

  // ==================== SEARCH & FILTER ====================

  test('can search events by name', async ({ page }) => {
    const eventsPage = new EventsPage(page);
    await eventsPage.gotoHome();
    await eventsPage.searchEvents('test event');
    await eventsPage.expectSearchResults();
  });

  test('can filter events by category', async ({ page }) => {
    const eventsPage = new EventsPage(page);
    await eventsPage.goto();
    await eventsPage.selectCategory();
  });

  // ==================== EVENT DETAILS ====================

});
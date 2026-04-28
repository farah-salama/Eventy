import { test, expect } from './fixtures';
import { EventsPage } from './pages/EventsPage';
import { BookingPage } from './pages/BookingPage';

test.describe.configure({ mode: 'serial' });

test.describe('Booking', () => {

  // ==================== UNAUTHENTICATED ====================

  test('unauthenticated user cannot book event', async ({ page }) => {
    const eventsPage = new EventsPage(page);
    await eventsPage.goto();
    await eventsPage.clickBookNowFirst();
    await expect(page).toHaveURL(/login/);
  });
  
  test('unauthenticated user cannot view event details', async ({ page }) => {
    const eventsPage = new EventsPage(page);
    await eventsPage.goto();
    await eventsPage.clickViewDetailsFirst();
    await expect(page).toHaveURL(/login/);
  });

  // ==================== AUTHENTICATED BOOKING ====================

  test('authenticated user can view event details', async ({ authenticatedPage }) => {
    const eventsPage = new EventsPage(authenticatedPage);
    await eventsPage.goto();
    await eventsPage.clickViewDetailsFirst();
    await expect(authenticatedPage).toHaveURL(/event/);
  });

  test('authenticated user can book event', async ({ authenticatedPage }) => {
    const eventsPage = new EventsPage(authenticatedPage);
    const bookingPage = new BookingPage(authenticatedPage);
    
    await eventsPage.goto();
    await eventsPage.clickBookNowFirst();
    await bookingPage.clickConfirm();
    await bookingPage.expectBookingSuccess();
  });

  test('user can view their bookings', async ({ authenticatedPage }) => {
    const bookingPage = new BookingPage(authenticatedPage);
    await bookingPage.goto();
    await bookingPage.expectOnBookingsPage();
    await bookingPage.expectConfirmedBookingsVisible();
  });

  test('user can cancel a booking', async ({ authenticatedPage }) => {
    const bookingPage = new BookingPage(authenticatedPage);
    await bookingPage.goto();
    await bookingPage.cancelFirstBooking();
    await bookingPage.expectBookingCancelled();
  });

});
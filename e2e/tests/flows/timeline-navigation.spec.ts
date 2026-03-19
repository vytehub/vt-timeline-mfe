import { test, expect } from '@playwright/test';
import { TimelinePage } from '../../fixtures/pages';

test.describe('Timeline — Navigation', { tag: ['@flow'] }, () => {
  test('loads timeline home page', async ({ page }) => {
    const timeline = new TimelinePage(page);
    await timeline.navigate();
    await expect(timeline.mainContent).toBeVisible();
  });

  test('navigates to create event page', async ({ page }) => {
    await page.goto('/events/new');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible();
  });

  test('navigates to conflict rules page', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible();
  });

  test('navigates to create rule page', async ({ page }) => {
    await page.goto('/rules/new');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible();
  });

  test('navigates to bookings page', async ({ page }) => {
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible();
  });
});

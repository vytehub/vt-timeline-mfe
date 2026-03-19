import { test, expect } from '@playwright/test';

test.describe('Visual Regression — Timeline', { tag: ['@visual'] }, () => {
  test('timeline home — desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('timeline-home-desktop.png', {
      maxDiffPixels: 100,
      fullPage: true,
    });
  });

  test('timeline home — mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('timeline-home-mobile.png', {
      maxDiffPixels: 100,
      fullPage: true,
    });
  });

  test('conflict rules page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/rules');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('timeline-rules-desktop.png', {
      maxDiffPixels: 100,
      fullPage: true,
    });
  });

  test('bookings page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('timeline-bookings-desktop.png', {
      maxDiffPixels: 100,
      fullPage: true,
    });
  });
});

import { test, expect } from '@playwright/test';

test.describe('Performance — Timeline', { tag: ['@perf'] }, () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('timeline home loads within performance budget', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5_000);

    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          resolve(last ? last.startTime : 0);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        setTimeout(() => resolve(0), 3_000);
      });
    });

    if (lcp > 0) {
      expect(lcp).toBeLessThan(2_500);
    }
  });

  test('CLS is within acceptable range', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
            if (!layoutShift.hadRecentInput) {
              clsValue += layoutShift.value;
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => resolve(clsValue), 2_000);
      });
    });

    expect(cls).toBeLessThan(0.1);
  });

  test('no JavaScript errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(errors).toHaveLength(0);
  });
});

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  { name: 'Timeline Home', path: '/' },
  { name: 'Create Event', path: '/events/new' },
  { name: 'Conflict Rules', path: '/rules' },
  { name: 'Bookings', path: '/bookings' },
];

test.describe('Accessibility — Timeline', { tag: ['@a11y'] }, () => {
  for (const { name, path } of PAGES) {
    test(`${name} (${path}) has no critical or serious a11y violations`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const critical = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      );

      if (critical.length > 0) {
        const summary = critical.map(
          (v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} instance(s))`,
        );
        expect(critical, summary.join('\n')).toHaveLength(0);
      }
    });
  }
});

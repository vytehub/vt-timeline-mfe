import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class TimelinePage extends BasePage {
  readonly path = '/';

  get heading(): Locator {
    return this.page.locator('h1, h2').first();
  }

  get eventCards(): Locator {
    return this.page.locator('[data-testid="event-card"], .event-card, app-timeline-event');
  }

  get createEventButton(): Locator {
    return this.page.locator('a[href*="events/new"], button:has-text("Create"), button:has-text("New")');
  }
}

export class ConflictRulesPage extends BasePage {
  readonly path = '/rules';

  get heading(): Locator {
    return this.page.locator('h1, h2').first();
  }

  get ruleCards(): Locator {
    return this.page.locator('[data-testid="rule-card"], .rule-card, app-conflict-rule');
  }
}

export class BookingsPage extends BasePage {
  readonly path = '/bookings';

  get heading(): Locator {
    return this.page.locator('h1, h2').first();
  }

  get bookingCards(): Locator {
    return this.page.locator('[data-testid="booking-card"], .booking-card, app-booking-card');
  }
}

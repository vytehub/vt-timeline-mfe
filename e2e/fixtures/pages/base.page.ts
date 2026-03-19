import { type Page, type Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  abstract readonly path: string;

  get mainContent(): Locator {
    return this.page.locator('main');
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async takeSnapshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `e2e/snapshots/${name}.png`, fullPage: true });
  }
}

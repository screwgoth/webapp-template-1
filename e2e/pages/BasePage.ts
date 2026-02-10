import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  async waitForNavigation(url: string) {
    await this.page.waitForURL(url);
  }

  async getTitle() {
    return this.page.title();
  }

  async screenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }
}

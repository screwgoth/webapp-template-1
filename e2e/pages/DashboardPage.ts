import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly header: Locator;
  readonly sidebar: Locator;
  readonly userAvatar: Locator;
  readonly settingsLink: Locator;
  readonly logoutButton: Locator;
  readonly welcomeMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.locator('header');
    this.sidebar = page.locator('[role="complementary"], nav').first();
    this.userAvatar = page.getByRole('button', { name: /user menu/i }).or(page.locator('[class*="avatar"]').first());
    this.settingsLink = page.getByRole('link', { name: /settings/i });
    this.logoutButton = page.getByRole('menuitem', { name: /log out/i }).or(page.getByText(/log out/i));
    this.welcomeMessage = page.getByRole('heading');
  }

  async goto() {
    await super.goto('/dashboard');
  }

  async openUserMenu() {
    await this.userAvatar.click();
  }

  async logout() {
    await this.openUserMenu();
    await this.logoutButton.click();
  }

  async navigateToSettings() {
    await this.settingsLink.click();
  }

  async isOnDashboard() {
    return this.page.url().includes('/dashboard');
  }
}

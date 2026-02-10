import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SettingsPage extends BasePage {
  readonly profileTab: Locator;
  readonly appSettingsTab: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly saveProfileButton: Locator;
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly changePasswordButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.profileTab = page.getByRole('tab', { name: /profile/i });
    this.appSettingsTab = page.getByRole('tab', { name: /app settings/i });
    this.nameInput = page.getByLabel(/^name$/i).or(page.getByLabel(/full name/i));
    this.emailInput = page.getByLabel(/email/i);
    this.saveProfileButton = page.getByRole('button', { name: /save changes/i }).or(page.getByRole('button', { name: /update profile/i }));
    this.currentPasswordInput = page.getByLabel(/current password/i);
    this.newPasswordInput = page.getByLabel(/new password/i);
    this.confirmPasswordInput = page.getByLabel(/confirm.*password/i);
    this.changePasswordButton = page.getByRole('button', { name: /change password/i });
    this.successMessage = page.locator('[class*="success"]');
    this.errorMessage = page.locator('[class*="destructive"]');
  }

  async goto() {
    await super.goto('/settings');
  }

  async updateProfile(name?: string, email?: string) {
    if (name) {
      await this.nameInput.fill(name);
    }
    if (email) {
      await this.emailInput.fill(email);
    }
    await this.saveProfileButton.click();
  }

  async changePassword(currentPassword: string, newPassword: string) {
    await this.currentPasswordInput.fill(currentPassword);
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(newPassword);
    await this.changePasswordButton.click();
  }

  async switchToAppSettings() {
    await this.appSettingsTab.click();
  }

  async getSuccessMessage() {
    return this.successMessage.textContent();
  }
}

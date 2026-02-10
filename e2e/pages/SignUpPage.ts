import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SignUpPage extends BasePage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly createAccountButton: Locator;
  readonly signInLink: Locator;
  readonly errorMessage: Locator;
  readonly passwordStrength: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.getByLabel(/full name/i);
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/^password$/i);
    this.confirmPasswordInput = page.getByLabel(/confirm password/i);
    this.createAccountButton = page.getByRole('button', { name: /create account/i });
    this.signInLink = page.getByRole('link', { name: /sign in/i });
    this.errorMessage = page.locator('[class*="destructive"]');
    this.passwordStrength = page.getByText(/password strength/i);
  }

  async goto() {
    await super.goto('/signup');
  }

  async signUp(name: string, email: string, password: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.createAccountButton.click();
  }

  async getPasswordStrength() {
    return this.passwordStrength.textContent();
  }

  async getErrorMessage() {
    return this.errorMessage.textContent();
  }
}

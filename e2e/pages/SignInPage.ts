import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SignInPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly signInButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signUpLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/^password$/i);
    this.rememberMeCheckbox = page.getByLabel(/remember me/i);
    this.signInButton = page.getByRole('button', { name: /sign in/i });
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    this.signUpLink = page.getByRole('link', { name: /sign up/i });
    this.errorMessage = page.locator('[class*="destructive"]');
  }

  async goto() {
    await super.goto('/signin');
  }

  async signIn(email: string, password: string, rememberMe: boolean = false) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }
    await this.signInButton.click();
  }

  async getErrorMessage() {
    return this.errorMessage.textContent();
  }

  async isSignInButtonDisabled() {
    return this.signInButton.isDisabled();
  }
}

import { test, expect } from '@playwright/test';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { generateUniqueEmail, testData } from './fixtures/testData';

test.describe('Authentication Flow', () => {
  test.describe('Sign Up', () => {
    test('should successfully register a new user', async ({ page }) => {
      const signUpPage = new SignUpPage(page);
      const dashboardPage = new DashboardPage(page);

      await signUpPage.goto();

      const uniqueEmail = generateUniqueEmail();
      await signUpPage.signUp('New User', uniqueEmail, testData.strongPassword);

      // Should redirect to dashboard after successful registration
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(dashboardPage.welcomeMessage).toBeVisible();
    });

    test('should show password strength indicator', async ({ page }) => {
      const signUpPage = new SignUpPage(page);

      await signUpPage.goto();

      await signUpPage.passwordInput.fill(testData.weakPassword);
      await expect(signUpPage.passwordStrength).toContainText(/weak/i);

      await signUpPage.passwordInput.fill(testData.strongPassword);
      await expect(signUpPage.passwordStrength).toContainText(/strong/i);
    });

    test('should validate password mismatch', async ({ page }) => {
      const signUpPage = new SignUpPage(page);

      await signUpPage.goto();

      await signUpPage.nameInput.fill('Test User');
      await signUpPage.emailInput.fill(generateUniqueEmail());
      await signUpPage.passwordInput.fill(testData.strongPassword);
      await signUpPage.confirmPasswordInput.fill('DifferentPassword123!');
      await signUpPage.createAccountButton.click();

      await expect(signUpPage.errorMessage).toContainText(/don't match/i);
    });

    test('should reject existing email', async ({ page }) => {
      const signUpPage = new SignUpPage(page);

      // First registration
      const email = generateUniqueEmail();
      await signUpPage.goto();
      await signUpPage.signUp('First User', email, testData.strongPassword);

      // Wait for successful registration
      await expect(page).toHaveURL(/\/dashboard/);

      // Try to register again with same email
      await signUpPage.goto();
      await signUpPage.signUp('Second User', email, testData.strongPassword);

      await expect(signUpPage.errorMessage).toBeVisible();
    });

    test('should have working sign in link', async ({ page }) => {
      const signUpPage = new SignUpPage(page);

      await signUpPage.goto();
      await signUpPage.signInLink.click();

      await expect(page).toHaveURL(/\/signin/);
    });
  });

  test.describe('Sign In', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
      const signUpPage = new SignUpPage(page);
      const signInPage = new SignInPage(page);
      const dashboardPage = new DashboardPage(page);

      // Create a user first
      const email = generateUniqueEmail();
      const password = testData.strongPassword;

      await signUpPage.goto();
      await signUpPage.signUp('Test User', email, password);
      await expect(page).toHaveURL(/\/dashboard/);

      // Logout
      await dashboardPage.logout();
      await expect(page).toHaveURL(/\/signin/);

      // Login
      await signInPage.signIn(email, password);
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(dashboardPage.welcomeMessage).toBeVisible();
    });

    test('should reject invalid credentials', async ({ page }) => {
      const signInPage = new SignInPage(page);

      await signInPage.goto();
      await signInPage.signIn(testData.invalidCredentials.email, testData.invalidCredentials.password);

      await expect(signInPage.errorMessage).toBeVisible();
      await expect(page).toHaveURL(/\/signin/);
    });

    test('should support remember me functionality', async ({ page }) => {
      const signUpPage = new SignUpPage(page);
      const signInPage = new SignInPage(page);

      // Create a user
      const email = generateUniqueEmail();
      const password = testData.strongPassword;

      await signUpPage.goto();
      await signUpPage.signUp('Test User', email, password);
      await expect(page).toHaveURL(/\/dashboard/);

      // Logout
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.logout();

      // Login with remember me
      await signInPage.signIn(email, password, true);
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should show loading state during login', async ({ page }) => {
      const signUpPage = new SignUpPage(page);
      const signInPage = new SignInPage(page);

      // Create a user
      const email = generateUniqueEmail();
      const password = testData.strongPassword;

      await signUpPage.goto();
      await signUpPage.signUp('Test User', email, password);

      // Logout
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.logout();

      // Start login
      await signInPage.emailInput.fill(email);
      await signInPage.passwordInput.fill(password);
      await signInPage.signInButton.click();

      // Button should be disabled during loading
      await expect(signInPage.signInButton).toBeDisabled();
    });

    test('should have working forgot password link', async ({ page }) => {
      const signInPage = new SignInPage(page);

      await signInPage.goto();
      await signInPage.forgotPasswordLink.click();

      await expect(page).toHaveURL(/\/forgot-password/);
    });

    test('should have working sign up link', async ({ page }) => {
      const signInPage = new SignInPage(page);

      await signInPage.goto();
      await signInPage.signUpLink.click();

      await expect(page).toHaveURL(/\/signup/);
    });
  });

  test.describe('Logout', () => {
    test('should successfully logout', async ({ page }) => {
      const signUpPage = new SignUpPage(page);
      const dashboardPage = new DashboardPage(page);

      // Create and login user
      const email = generateUniqueEmail();
      await signUpPage.goto();
      await signUpPage.signUp('Test User', email, testData.strongPassword);

      // Verify on dashboard
      await expect(page).toHaveURL(/\/dashboard/);

      // Logout
      await dashboardPage.logout();

      // Should redirect to signin
      await expect(page).toHaveURL(/\/signin/);
    });
  });
});

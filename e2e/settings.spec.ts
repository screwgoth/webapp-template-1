import { test, expect } from '@playwright/test';
import { SignUpPage } from './pages/SignUpPage';
import { SignInPage } from './pages/SignInPage';
import { SettingsPage } from './pages/SettingsPage';
import { generateUniqueEmail, testData } from './fixtures/testData';

test.describe('Settings Page', () => {
  let userEmail: string;
  const userPassword = testData.strongPassword;

  test.beforeEach(async ({ page }) => {
    // Create and login a user before each test
    const signUpPage = new SignUpPage(page);
    userEmail = generateUniqueEmail();

    await signUpPage.goto();
    await signUpPage.signUp('Test User', userEmail, userPassword);
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to settings
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto();
  });

  test('should display settings page with tabs', async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await expect(settingsPage.profileTab).toBeVisible();
    await expect(settingsPage.appSettingsTab).toBeVisible();
  });

  test('should display profile information', async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await expect(settingsPage.nameInput).toBeVisible();
    await expect(settingsPage.emailInput).toBeVisible();
    await expect(settingsPage.nameInput).toHaveValue('Test User');
    await expect(settingsPage.emailInput).toHaveValue(userEmail);
  });

  test('should update user name', async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await settingsPage.nameInput.clear();
    await settingsPage.nameInput.fill('Updated Name');
    await settingsPage.saveProfileButton.click();

    // Check for success message or updated value
    await page.waitForTimeout(1000); // Wait for update

    // Reload to verify persistence
    await page.reload();
    await expect(settingsPage.nameInput).toHaveValue('Updated Name');
  });

  test('should update user email', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const newEmail = generateUniqueEmail();

    await settingsPage.emailInput.clear();
    await settingsPage.emailInput.fill(newEmail);
    await settingsPage.saveProfileButton.click();

    // Wait for update
    await page.waitForTimeout(1000);

    // Reload to verify persistence
    await page.reload();
    await expect(settingsPage.emailInput).toHaveValue(newEmail);
  });

  test('should change password successfully', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const signInPage = new SignInPage(page);
    const newPassword = 'NewPassword123!';

    // Change password
    await settingsPage.changePassword(userPassword, newPassword);

    // Should redirect to signin or show success
    await page.waitForTimeout(1000);

    // Try logging in with new password
    await signInPage.goto();
    await signInPage.signIn(userEmail, newPassword);

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should reject incorrect current password', async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await settingsPage.changePassword('WrongPassword123!', 'NewPassword123!');

    // Should show error
    await expect(settingsPage.errorMessage).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    // Start on profile tab
    await expect(settingsPage.profileTab).toHaveAttribute('data-state', 'active');

    // Switch to app settings
    await settingsPage.appSettingsTab.click();
    await expect(settingsPage.appSettingsTab).toHaveAttribute('data-state', 'active');

    // Switch back to profile
    await settingsPage.profileTab.click();
    await expect(settingsPage.profileTab).toHaveAttribute('data-state', 'active');
  });
});

test.describe('Settings - Responsive Layout', () => {
  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const signUpPage = new SignUpPage(page);
    const settingsPage = new SettingsPage(page);

    const email = generateUniqueEmail();
    await signUpPage.goto();
    await signUpPage.signUp('Test User', email, testData.strongPassword);

    await settingsPage.goto();
    await expect(settingsPage.profileTab).toBeVisible();
    await expect(settingsPage.nameInput).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    const signUpPage = new SignUpPage(page);
    const settingsPage = new SettingsPage(page);

    const email = generateUniqueEmail();
    await signUpPage.goto();
    await signUpPage.signUp('Test User', email, testData.strongPassword);

    await settingsPage.goto();
    await expect(settingsPage.profileTab).toBeVisible();
  });
});

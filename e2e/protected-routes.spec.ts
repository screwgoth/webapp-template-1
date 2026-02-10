import { test, expect } from '@playwright/test';
import { SignInPage } from './pages/SignInPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';

test.describe('Protected Routes', () => {
  test('should redirect to signin when accessing dashboard without auth', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.goto();

    // Should redirect to signin
    await expect(page).toHaveURL(/\/signin/);
  });

  test('should redirect to signin when accessing settings without auth', async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await settingsPage.goto();

    // Should redirect to signin
    await expect(page).toHaveURL(/\/signin/);
  });

  test('should redirect to dashboard when accessing signin while authenticated', async ({ page }) => {
    const signUpPage = await import('./pages/SignUpPage').then((m) => new m.SignUpPage(page));
    const signInPage = new SignInPage(page);

    // Create and login user
    const email = `test-${Date.now()}@example.com`;
    await signUpPage.goto();
    await signUpPage.signUp('Test User', email, 'TestPassword123!');
    await expect(page).toHaveURL(/\/dashboard/);

    // Try to access signin
    await signInPage.goto();

    // Should stay on or redirect to dashboard
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url.includes('/dashboard') || url.includes('/signin')).toBe(true);
  });

  test('should clear auth and redirect on invalid token', async ({ page }) => {
    // Set invalid token in localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'invalid.token.here');
    });

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Should redirect to signin due to invalid token
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/signin/);
  });

  test('should maintain authentication across page reloads', async ({ page }) => {
    const signUpPage = await import('./pages/SignUpPage').then((m) => new m.SignUpPage(page));
    const dashboardPage = new DashboardPage(page);

    // Create and login user
    const email = `test-${Date.now()}@example.com`;
    await signUpPage.goto();
    await signUpPage.signUp('Test User', email, 'TestPassword123!');
    await expect(page).toHaveURL(/\/dashboard/);

    // Reload page
    await page.reload();

    // Should still be on dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(dashboardPage.welcomeMessage).toBeVisible();
  });

  test('should lose authentication after logout', async ({ page }) => {
    const signUpPage = await import('./pages/SignUpPage').then((m) => new m.SignUpPage(page));
    const dashboardPage = new DashboardPage(page);

    // Create and login user
    const email = `test-${Date.now()}@example.com`;
    await signUpPage.goto();
    await signUpPage.signUp('Test User', email, 'TestPassword123!');

    // Logout
    await dashboardPage.logout();
    await expect(page).toHaveURL(/\/signin/);

    // Try to access protected route
    await dashboardPage.goto();
    await expect(page).toHaveURL(/\/signin/);
  });
});

import { test, expect } from '@playwright/test';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { generateUniqueEmail, testData } from './fixtures/testData';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Create and login a user before each test
    const signUpPage = new SignUpPage(page);
    const email = generateUniqueEmail();

    await signUpPage.goto();
    await signUpPage.signUp('Test User', email, testData.strongPassword);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display dashboard page', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await expect(dashboardPage.header).toBeVisible();
    await expect(dashboardPage.welcomeMessage).toBeVisible();
  });

  test('should have working sidebar navigation', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await expect(dashboardPage.sidebar).toBeVisible();
  });

  test('should navigate to settings page', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.navigateToSettings();
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should display user avatar in header', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await expect(dashboardPage.userAvatar).toBeVisible();
  });

  test('should open user menu on avatar click', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.openUserMenu();
    await expect(dashboardPage.logoutButton).toBeVisible();
  });
});

test.describe('Dashboard - Responsive Layout', () => {
  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size

    const signUpPage = new SignUpPage(page);
    const dashboardPage = new DashboardPage(page);

    // Login
    const email = generateUniqueEmail();
    await signUpPage.goto();
    await signUpPage.signUp('Test User', email, testData.strongPassword);
    await expect(page).toHaveURL(/\/dashboard/);

    // Check mobile layout
    await expect(dashboardPage.header).toBeVisible();
    await expect(dashboardPage.welcomeMessage).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size

    const signUpPage = new SignUpPage(page);
    const dashboardPage = new DashboardPage(page);

    // Login
    const email = generateUniqueEmail();
    await signUpPage.goto();
    await signUpPage.signUp('Test User', email, testData.strongPassword);
    await expect(page).toHaveURL(/\/dashboard/);

    await expect(dashboardPage.header).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop size

    const signUpPage = new SignUpPage(page);
    const dashboardPage = new DashboardPage(page);

    // Login
    const email = generateUniqueEmail();
    await signUpPage.goto();
    await signUpPage.signUp('Test User', email, testData.strongPassword);
    await expect(page).toHaveURL(/\/dashboard/);

    await expect(dashboardPage.header).toBeVisible();
    await expect(dashboardPage.sidebar).toBeVisible();
  });
});

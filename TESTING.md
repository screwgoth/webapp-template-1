# Testing Guide

This project includes comprehensive testing infrastructure across three layers: backend unit tests, frontend component tests, and end-to-end (E2E) tests.

## Table of Contents

- [Quick Start](#quick-start)
- [Backend Tests (Jest + Supertest)](#backend-tests)
- [Frontend Tests (Vitest + React Testing Library)](#frontend-tests)
- [E2E Tests (Playwright)](#e2e-tests)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Coverage](#coverage)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suites
npm run test:backend      # Backend unit tests
npm run test:frontend     # Frontend component tests
npm run test:e2e          # E2E tests with Playwright

# Run tests in watch mode
npm run test:watch

# Generate coverage reports
npm run test:coverage
```

## Backend Tests

**Framework:** Jest + Supertest + TypeScript  
**Location:** `backend/src/__tests__/`  
**Coverage Target:** 80%+

### What's Tested

- ✅ **Auth Routes:** Register, login, logout, refresh token, password management
- ✅ **User Routes:** Get/update/delete user profile
- ✅ **Health Check:** API health endpoint
- ✅ **Middleware:** Authentication, error handling
- ✅ **Utilities:** Password hashing, JWT token generation/verification

### Running Backend Tests

```bash
cd backend

# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Structure

```
backend/src/__tests__/
├── setup.ts                    # Test configuration
├── helpers.ts                  # Test utilities
├── routes/
│   ├── auth.routes.test.ts
│   ├── user.routes.test.ts
│   └── health.routes.test.ts
├── middleware/
│   ├── auth.middleware.test.ts
│   └── errorHandler.middleware.test.ts
└── utils/
    ├── password.test.ts
    └── jwt.test.ts
```

### Example Backend Test

```typescript
import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth.routes';

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
      })
      .expect(201);

    expect(response.body.data.user).toMatchObject({
      name: 'John Doe',
      email: 'john@example.com',
    });
    expect(response.body.data.accessToken).toBeDefined();
  });
});
```

## Frontend Tests

**Framework:** Vitest + React Testing Library  
**Location:** `frontend/src/__tests__/`  
**Coverage Target:** 70%+

### What's Tested

- ✅ **Auth Pages:** SignIn, SignUp, ForgotPassword
- ✅ **Contexts:** AuthContext with authentication flows
- ✅ **Services:** API client with interceptors
- ✅ **Form Validation:** Password strength, email validation
- ✅ **User Interactions:** Clicks, form submissions, navigation

### Running Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Watch mode
npm run test:watch

# UI mode (interactive)
npm run test:ui

# Coverage report
npm run test:coverage
```

### Test Structure

```
frontend/src/__tests__/
├── setup.ts              # Test configuration
├── test-utils.tsx        # Custom render with providers
├── mocks.ts              # Mock data and services
├── pages/
│   ├── SignIn.test.tsx
│   └── SignUp.test.tsx
├── contexts/
│   └── AuthContext.test.tsx
└── services/
    └── api.test.ts
```

### Example Frontend Test

```typescript
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { SignIn } from '@/pages/SignIn';

describe('SignIn Page', () => {
  it('allows user to sign in', async () => {
    const user = userEvent.setup();
    render(<SignIn />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });
});
```

## E2E Tests

**Framework:** Playwright  
**Location:** `e2e/`  
**Browsers:** Chromium, Firefox, WebKit

### What's Tested

- ✅ **User Registration:** Complete sign-up flow
- ✅ **Authentication:** Login with remember me, logout
- ✅ **Password Management:** Forgot password, change password
- ✅ **Dashboard:** Navigation and user interactions
- ✅ **Settings:** Profile updates, password changes
- ✅ **Protected Routes:** Redirect behavior
- ✅ **Responsive Design:** Desktop, tablet, mobile

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (headed mode)
npm run test:e2e:headed

# Run with Playwright UI (interactive)
npm run test:e2e:ui

# Run specific test file
npx playwright test auth.spec.ts

# Run on specific browser
npx playwright test --project=chromium
```

### Test Structure

```
e2e/
├── pages/                    # Page Object Models
│   ├── BasePage.ts
│   ├── SignInPage.ts
│   ├── SignUpPage.ts
│   ├── DashboardPage.ts
│   └── SettingsPage.ts
├── fixtures/
│   └── testData.ts          # Test data generators
├── auth.spec.ts             # Authentication flows
├── dashboard.spec.ts        # Dashboard tests
├── settings.spec.ts         # Settings page tests
└── protected-routes.spec.ts # Route protection tests
```

### Page Object Model Example

```typescript
export class SignInPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.signInButton = page.getByRole('button', { name: /sign in/i });
  }

  async signIn(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
```

## Running Tests

### Run All Tests

```bash
npm test
```

This runs:
1. Backend unit tests (Jest)
2. Frontend component tests (Vitest)
3. E2E tests (Playwright)

### Run Tests by Layer

```bash
npm run test:backend    # Backend only
npm run test:frontend   # Frontend only
npm run test:e2e        # E2E only
```

### Watch Mode (Development)

```bash
npm run test:watch      # Watch backend + frontend
```

Or run watch mode per workspace:

```bash
cd backend && npm run test:watch
cd frontend && npm run test:watch
```

### Coverage Reports

```bash
npm run test:coverage
```

Coverage reports are generated in:
- `backend/coverage/` - Backend coverage
- `frontend/coverage/` - Frontend coverage

Open `coverage/index.html` to view detailed reports.

## Writing Tests

### Backend Test Guidelines

1. **Use AAA Pattern** (Arrange, Act, Assert)
2. **Create Test Helpers** - Use `createTestUser()`, `createAuthenticatedUser()`
3. **Mock External Services** - Database mocking where appropriate
4. **Test Edge Cases** - Invalid input, auth failures, validation errors
5. **Clean Up** - Tests clean database before each run

### Frontend Test Guidelines

1. **Use Custom Render** - Import from `test-utils.tsx` for providers
2. **Test User Interactions** - Use `@testing-library/user-event`
3. **Mock API Calls** - Mock services in `mocks.ts`
4. **Query Best Practices** - Prefer `getByRole`, `getByLabelText`
5. **Avoid Implementation Details** - Test behavior, not internals

### E2E Test Guidelines

1. **Use Page Objects** - Encapsulate page interactions
2. **Generate Unique Data** - Use `generateUniqueEmail()` for test isolation
3. **Wait for Elements** - Use Playwright's auto-waiting
4. **Test Real Flows** - Complete user journeys
5. **Test Multiple Browsers** - Chromium, Firefox, WebKit

### Test Naming Convention

```typescript
describe('Feature/Component Name', () => {
  describe('Specific Functionality', () => {
    it('should do something when condition', async () => {
      // Test implementation
    });
  });
});
```

## Coverage

### Current Coverage Targets

- **Backend:** 80% (lines, functions, branches, statements)
- **Frontend:** 70% (lines, functions, branches, statements)

### View Coverage

```bash
# Backend
cd backend && npm run test:coverage
open coverage/index.html

# Frontend
cd frontend && npm run test:coverage
open coverage/index.html
```

### Excluded from Coverage

- Type definitions (`*.d.ts`)
- Configuration files (`*.config.*`)
- Main entry points (`main.tsx`, `index.ts`)
- Test files themselves

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run backend tests
        run: npm run test:backend
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/testdb

      - name: Run frontend tests
        run: npm run test:frontend

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Best Practices

### 1. Test Independence

- Each test should be independent
- Don't rely on test execution order
- Clean up after tests (database, localStorage)

### 2. Descriptive Test Names

```typescript
// ❌ Bad
it('works', () => { ... });

// ✅ Good
it('should redirect to dashboard after successful login', () => { ... });
```

### 3. Avoid Magic Values

```typescript
// ❌ Bad
await user.type(emailInput, 'test@example.com');

// ✅ Good
const testEmail = generateUniqueEmail();
await user.type(emailInput, testEmail);
```

### 4. Test One Thing

```typescript
// ❌ Bad - Testing multiple things
it('should register and update profile and delete account', () => { ... });

// ✅ Good - Separate tests
it('should register a new user', () => { ... });
it('should update user profile', () => { ... });
it('should delete user account', () => { ... });
```

### 5. Use Appropriate Queries

```typescript
// ❌ Bad - Implementation details
screen.getByClassName('submit-btn');

// ✅ Good - User-facing queries
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);
```

## Troubleshooting

### Backend Tests Failing

```bash
# Ensure database is running
docker compose up -d postgres

# Check DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost:5432/testdb

# Clear test database
npm run prisma:migrate -- reset
```

### Frontend Tests Failing

```bash
# Clear cache
npm run test:frontend -- --clearCache

# Check for stale mocks
vi.clearAllMocks() in beforeEach
```

### E2E Tests Failing

```bash
# Update browsers
npx playwright install

# Run in headed mode to debug
npm run test:e2e:headed

# Check if dev server is running
npm run dev:frontend
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://testingjavascript.com/)

## Support

For questions or issues with tests:
1. Check this guide first
2. Review test examples in the codebase
3. Open an issue with test output and error messages

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { SignIn } from '@/pages/SignIn';
import * as authService from '@/services/auth.service';
import { mockAuthResponse, mockApiError } from '../mocks';

vi.mock('@/services/auth.service');
vi.mock('@/services/user.service');

describe('SignIn Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders sign in form', () => {
    render(<SignIn />);

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders remember me checkbox', () => {
    render(<SignIn />);

    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
  });

  it('renders forgot password link', () => {
    render(<SignIn />);

    const forgotPasswordLink = screen.getByText(/forgot password/i);
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
  });

  it('renders sign up link', () => {
    render(<SignIn />);

    const signUpLink = screen.getByRole('link', { name: /sign up/i });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute('href', '/signup');
  });

  it('allows user to type email and password', async () => {
    const user = userEvent.setup();
    render(<SignIn />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('Password123!');
  });

  it('allows user to toggle remember me', async () => {
    const user = userEvent.setup();
    render(<SignIn />);

    const rememberMeCheckbox = screen.getByLabelText(/remember me/i) as HTMLInputElement;

    expect(rememberMeCheckbox.checked).toBe(false);

    await user.click(rememberMeCheckbox);
    expect(rememberMeCheckbox.checked).toBe(true);

    await user.click(rememberMeCheckbox);
    expect(rememberMeCheckbox.checked).toBe(false);
  });

  it('submits form with valid credentials', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);

    render(<SignIn />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      });
    });
  });

  it('displays loading state during submission', async () => {
    const user = userEvent.setup();
    vi.spyOn(authService, 'login').mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockAuthResponse), 100))
    );

    render(<SignIn />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('displays error message on failed login', async () => {
    const user = userEvent.setup();
    vi.spyOn(authService, 'login').mockRejectedValue(mockApiError('Invalid credentials'));

    render(<SignIn />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'WrongPassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('requires email field', async () => {
    const user = userEvent.setup();
    render(<SignIn />);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeRequired();
  });

  it('requires password field', async () => {
    render(<SignIn />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toBeRequired();
  });

  it('disables form inputs during loading', async () => {
    const user = userEvent.setup();
    vi.spyOn(authService, 'login').mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockAuthResponse), 100))
    );

    render(<SignIn />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/^password$/i)).toBeDisabled();
    expect(screen.getByLabelText(/remember me/i)).toBeDisabled();
  });
});

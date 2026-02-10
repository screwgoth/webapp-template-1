import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { SignUp } from '@/pages/SignUp';
import * as authService from '@/services/auth.service';
import { mockAuthResponse, mockApiError } from '../mocks';

vi.mock('@/services/auth.service');
vi.mock('@/services/user.service');

describe('SignUp Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders sign up form', () => {
    render(<SignUp />);

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders sign in link', () => {
    render(<SignUp />);

    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/signin');
  });

  it('allows user to fill out form', async () => {
    const user = userEvent.setup();
    render(<SignUp />);

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');

    expect(screen.getByLabelText(/full name/i)).toHaveValue('John Doe');
    expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com');
    expect(screen.getByLabelText(/^password$/i)).toHaveValue('Password123!');
    expect(screen.getByLabelText(/confirm password/i)).toHaveValue('Password123!');
  });

  it('shows password strength indicator', async () => {
    const user = userEvent.setup();
    render(<SignUp />);

    const passwordInput = screen.getByLabelText(/^password$/i);

    // Weak password
    await user.type(passwordInput, 'weak');
    expect(screen.getByText(/password strength:/i)).toBeInTheDocument();
    expect(screen.getByText(/weak/i)).toBeInTheDocument();

    // Clear and type medium password
    await user.clear(passwordInput);
    await user.type(passwordInput, 'Medium123');
    expect(screen.getByText(/medium/i)).toBeInTheDocument();

    // Clear and type strong password
    await user.clear(passwordInput);
    await user.type(passwordInput, 'Strong123!');
    expect(screen.getByText(/strong/i)).toBeInTheDocument();
  });

  it('validates password match', async () => {
    const user = userEvent.setup();
    render(<SignUp />);

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword123!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockRegister = vi.spyOn(authService, 'register').mockResolvedValue(mockAuthResponse);

    render(<SignUp />);

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
    });
  });

  it('displays loading state during submission', async () => {
    const user = userEvent.setup();
    vi.spyOn(authService, 'register').mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockAuthResponse), 100))
    );

    render(<SignUp />);

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
  });

  it('displays error message on failed registration', async () => {
    const user = userEvent.setup();
    vi.spyOn(authService, 'register').mockRejectedValue(
      mockApiError('User with this email already exists')
    );

    render(<SignUp />);

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/user with this email already exists/i)).toBeInTheDocument();
    });
  });

  it('requires all fields', () => {
    render(<SignUp />);

    expect(screen.getByLabelText(/full name/i)).toBeRequired();
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/^password$/i)).toBeRequired();
    expect(screen.getByLabelText(/confirm password/i)).toBeRequired();
  });

  it('disables form inputs during loading', async () => {
    const user = userEvent.setup();
    vi.spyOn(authService, 'register').mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockAuthResponse), 100))
    );

    render(<SignUp />);

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByLabelText(/full name/i)).toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/^password$/i)).toBeDisabled();
    expect(screen.getByLabelText(/confirm password/i)).toBeDisabled();
  });

  it('clears error message on new submission', async () => {
    const user = userEvent.setup();
    vi.spyOn(authService, 'register')
      .mockRejectedValueOnce(mockApiError('Error'))
      .mockResolvedValueOnce(mockAuthResponse);

    render(<SignUp />);

    // First submission with error
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    // Second submission should clear error
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });
});

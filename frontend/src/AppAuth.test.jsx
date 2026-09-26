import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import api from './services/api';

vi.mock('./services/api', () => ({
  default: {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    get: vi.fn(),
    post: vi.fn(),
  }
}));

describe('Authentication Lifecycle', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('9. Frontend handles session-expired response cleanly', async () => {
    // Set a fake token to simulate being logged in
    localStorage.setItem('token', 'fake-token');

    render(<App />);

    // Simulate the global API interceptor firing a 401 Unauthorized event
    window.dispatchEvent(new Event('auth-expired'));

    // The App should clear the token from localStorage
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
    });

    // We can also verify that we are redirected to Login (assuming Login page has a specific heading)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
    });
  });
});

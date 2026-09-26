import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleOAuthProvider } from '@react-oauth/google';
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
    localStorage.setItem('token', 'fake-token');

    render(
      <GoogleOAuthProvider clientId="test-client-id">
        <App />
      </GoogleOAuthProvider>
    );

    window.dispatchEvent(new Event('auth-expired'));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
    });
  });
});

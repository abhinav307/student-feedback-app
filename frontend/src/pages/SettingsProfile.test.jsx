import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Layout from '../components/Layout';
import Settings from './Settings';
import api from '../services/api';

vi.mock('../services/api');

const renderWithRouter = (ui) => {
  return render(
    <GoogleOAuthProvider clientId="test-client-id">
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

describe('Profile, Notifications, and Settings Features', () => {
  beforeEach(() => {
    api.get.mockImplementation((url) => {
      if (url === '/api/auth/me' || url === '/auth/me') return Promise.resolve({ data: { _id: '1', name: 'Test User', email: 'test@acme.com', organization: 'Test Corp' } });
      if (url === '/api/notifications' || url === '/notifications') return Promise.resolve({ data: [{ _id: '1', title: 'Test', message: 'Message', read: false, createdAt: new Date() }] });
      return Promise.resolve({ data: [] });
    });
    api.put.mockResolvedValue({ data: { _id: '1', name: 'Updated User', organization: 'Updated Corp' } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('1. Profile data loads and menu opens', async () => {
    renderWithRouter(<Layout setToken={() => {}} />);
    await waitFor(() => expect(screen.getByText('Test Corp')).toBeInTheDocument());
    
    const initialElement = screen.getByText('T');
    fireEvent.click(initialElement);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@acme.com')).toBeInTheDocument();
    });
  });

  test('5. Notification dropdown opens and shows real notifications', async () => {
    renderWithRouter(<Layout setToken={() => {}} />);
    
    await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument());
    
    const bellButtons = screen.getAllByRole('button').filter(b => b.innerHTML.includes('lucide-bell') || b.className.includes('lucide-bell') || b.parentElement.innerHTML.includes('lucide-bell'));
    
    // In case the structure is different, fallback to clicking the first button near the profile
    if (bellButtons.length > 0) {
        fireEvent.click(bellButtons[0]);
    } else {
        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[0]); // fallback
    }
    
    await waitFor(() => {
      expect(screen.getByText('Message')).toBeInTheDocument();
    });
  });

  test('3. Settings update persists', async () => {
    renderWithRouter(
      <Routes>
        <Route element={<Layout setToken={() => {}} />}>
          <Route path="/" element={<Settings />} />
        </Route>
      </Routes>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Corp')).toBeInTheDocument();
    });

    const orgInput = screen.getByDisplayValue('Test Corp');
    fireEvent.change(orgInput, { target: { value: 'Updated Corp', name: 'organization' } });
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(expect.stringContaining('auth/me'), expect.objectContaining({ organization: 'Updated Corp' }));
      expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
    });
  });
});

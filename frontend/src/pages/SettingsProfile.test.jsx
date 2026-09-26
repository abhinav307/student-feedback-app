import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import Settings from './Settings';
import api from '../services/api';

vi.mock('../services/api');

const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('Profile, Notifications, and Settings Features', () => {
  beforeEach(() => {
    api.get.mockImplementation((url) => {
      if (url === '/api/auth/me') return Promise.resolve({ data: { _id: '1', name: 'Test User', email: 'test@acme.com', organization: 'Test Corp' } });
      if (url === '/api/notifications') return Promise.resolve({ data: [{ _id: '1', title: 'Test', message: 'Message', read: false, createdAt: new Date() }] });
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
    
    const initialElement = screen.getByText('T'); // 'T' from Test User
    fireEvent.click(initialElement);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@acme.com')).toBeInTheDocument();
    });
  });

  test('5. Notification dropdown opens and shows real notifications', async () => {
    renderWithRouter(<Layout setToken={() => {}} />);
    
    // Wait for the bell count
    await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument());
    
    // Click Bell
    const bellButtons = screen.getAllByRole('button').filter(b => b.innerHTML.includes('lucide-bell'));
    fireEvent.click(bellButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
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

    // Layout fetches and sets context, Settings reads from context
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Corp')).toBeInTheDocument();
    });

    const orgInput = screen.getByDisplayValue('Test Corp');
    fireEvent.change(orgInput, { target: { value: 'Updated Corp', name: 'organization' } });
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/api/auth/me', expect.objectContaining({ organization: 'Updated Corp' }));
      expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
    });
  });
});

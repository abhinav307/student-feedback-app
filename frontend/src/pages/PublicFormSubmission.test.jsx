import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicForm from './PublicForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../services/api';

vi.mock('../services/api');

describe('PublicFormSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = (formMock) => {
    api.get.mockResolvedValueOnce({ data: formMock });
    render(
      <MemoryRouter initialEntries={['/form/test-id']}>
        <Routes>
          <Route path="/form/:publicId" element={<PublicForm />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders form and submits successfully', async () => {
    renderForm({
      title: 'Feedback',
      type: 'feedback',
      fields: [{ id: 'f1', type: 'text', label: 'Name', required: true }]
    });

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Your answer'), { target: { value: 'John' } });

    api.post.mockResolvedValueOnce({ data: { receiptId: 'REC-123' } });
    fireEvent.click(screen.getAllByRole('button', { name: /Submit Response/i })[0]);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        answers: [{ fieldId: 'f1', value: 'John' }]
      }));
    });
  });

  it('renders slider successfully', async () => {
    renderForm({
      title: 'Feedback',
      type: 'feedback',
      fields: [{ id: 'f2', type: 'slider', label: 'Rate it', min: 10, max: 50, step: 5, required: true }]
    });

    await waitFor(() => {
      expect(screen.getByText('Rate it')).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '30' } });

    api.post.mockResolvedValueOnce({ data: { receiptId: 'REC-123' } });
    fireEvent.click(screen.getAllByRole('button', { name: /Submit Response/i })[0]);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        answers: [{ fieldId: 'f2', value: 30 }]
      }));
    });
  });
});

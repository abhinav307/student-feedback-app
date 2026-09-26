import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicForm from './pages/PublicForm';

vi.mock('./services/api', () => {
  return {
    default: {
      get: vi.fn((url) => {
        return Promise.resolve({
          data: {
            _id: '123',
            title: 'Mocked Form Title',
            description: 'Mocked Description',
            type: 'feedback',
            fields: [
                { id: 'f1', type: 'text', label: 'Name Field', required: true }
            ],
            settings: { allowAnonymous: true },
            theme: {
                backgroundColor: '#ffffff',
                textColor: '#000000',
                buttonBgColor: '#000000',
                buttonTextColor: '#ffffff'
            }
          }
        });
      })
    }
  };
});

describe('Frontend React Components', () => {
    it('PublicForm renders the form title and fields from API', async () => {
        render(
            <MemoryRouter initialEntries={['/form/abc']}>
                <Routes>
                    <Route path="/form/:publicId" element={<PublicForm />} />
                </Routes>
            </MemoryRouter>
        );

        // It should eventually render the form title from the mock
        expect(await screen.findByText('Mocked Form Title')).toBeInTheDocument();
        expect(screen.getByText('Mocked Description')).toBeInTheDocument();
        expect(screen.getByText(/Name Field/i)).toBeInTheDocument();
    });
});

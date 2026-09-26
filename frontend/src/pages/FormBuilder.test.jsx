import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import FormBuilder from './FormBuilder';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn()
  }
}));

describe('FormBuilder', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.get.mockImplementation((url) => {
            if (url.includes('/forms/f1')) {
                return Promise.resolve({
                    data: {
                        _id: 'f1',
                        title: 'Test Builder Form',
                        description: 'Test Desc',
                        type: 'feedback',
                        status: 'draft',
                        fields: [
                            { id: 'field1', type: 'text', label: 'First Name', required: true }
                        ],
                        settings: {},
                        theme: {}
                    }
                });
            }
            return Promise.resolve({ data: {} });
        });
        
        api.put.mockResolvedValue({ data: { message: 'Saved' } });
    });

    const renderBuilder = (id) => {
        const { container } = render(
            <MemoryRouter initialEntries={[`/builder/${id}`]}>
                <Routes>
                    <Route path="/builder/:id" element={<FormBuilder />} />
                </Routes>
            </MemoryRouter>
        );
        return container;
    };

    it('renders form details and existing fields', async () => {
        const container = renderBuilder('f1');
        await waitFor(() => {
            expect(container.innerHTML).toContain('Test Builder Form');
            expect(container.innerHTML).toContain('First Name');
        });
    });

    it('allows saving the form which triggers api.put', async () => {
        const container = renderBuilder('f1');
        await waitFor(() => {
            expect(container.innerHTML).toContain('Test Builder Form');
        });

        const saveBtn = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(api.put).toHaveBeenCalled();
            expect(api.put.mock.calls[0][0]).toContain('/forms/f1');
            expect(api.put.mock.calls[0][1].title).toBe('Test Builder Form');
        });
    });
});

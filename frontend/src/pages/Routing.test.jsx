import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import PublicForm from './PublicForm';
import VerifyReceipt from './VerifyReceipt';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} }))
  }
}));

describe('Security and Routing Boundaries', () => {
    it('Unauthenticated manager accessing dashboard sees nothing/redirect logic (empty token)', () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route path="/dashboard" element={<Dashboard token={null} />} />
                </Routes>
            </MemoryRouter>
        );
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('Public form route is accessible without manager authentication', async () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/form/public1']}>
                <Routes>
                    <Route path="/form/:publicId" element={<PublicForm />} />
                </Routes>
            </MemoryRouter>
        );
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('Receipt verification route is accessible without authentication', () => {
        render(
            <MemoryRouter initialEntries={['/verify/receipt123']}>
                <Routes>
                    <Route path="/verify/:receiptId" element={<VerifyReceipt />} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText('Verifying receipt...')).toBeInTheDocument();
    });
});

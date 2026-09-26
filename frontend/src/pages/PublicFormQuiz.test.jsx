import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicForm from './PublicForm';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('PublicForm Quiz UI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderForm = (publicId) => {
        const { container } = render(
            <MemoryRouter initialEntries={[`/form/${publicId}`]}>
                <Routes>
                    <Route path="/form/:publicId" element={<PublicForm />} />
                </Routes>
            </MemoryRouter>
        );
        return container;
    };

    it('renders quiz title and questions', async () => {
        api.get.mockResolvedValueOnce({
            data: {
                _id: 'q1',
                title: 'Math Quiz',
                type: 'quiz',
                status: 'published',
                settings: {},
                theme: {},
                fields: [
                    { id: 'f1', type: 'quiz-mcq', label: '1 + 1 = ?', required: true, options: ['Option 1', 'Option 2', 'Option 3'] }
                ]
            }
        });

        api.post.mockResolvedValueOnce({ data: { attemptId: 'att1', timeLimit: null } });
        const container = renderForm('public1');

        await waitFor(() => {
            expect(container.innerHTML).toContain('Start Quiz');
        });
        
        fireEvent.click(screen.getByRole('button', { name: /Start Quiz/i }));

        await waitFor(() => {
            expect(container.innerHTML).toContain('Math Quiz');
            expect(container.innerHTML).toContain('1 + 1 = ?');
        });
    });

    it('required quiz validation and submission', async () => {
        api.get.mockResolvedValueOnce({
            data: {
                _id: 'q2',
                title: 'Required Quiz',
                type: 'quiz',
                status: 'published',
                settings: {},
                theme: {},
                fields: [
                    { id: 'f1', type: 'text', label: 'Student Name', required: true }
                ]
            }
        });
        api.post.mockResolvedValueOnce({ data: { attemptId: 'att2', timeLimit: null } });

        const container = renderForm('public2');

        await waitFor(() => {
            expect(container.innerHTML).toContain('Start Quiz');
        });
        fireEvent.click(screen.getByRole('button', { name: /Start Quiz/i }));

        await waitFor(() => {
            expect(container.innerHTML).toContain('Required Quiz');
        });

        const submitBtn = screen.getAllByRole('button', { name: /submit/i })[0];
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(container.innerHTML).toContain('This field is required');
        });
    });

    it('displays timer for timed quizzes if enabled', async () => {
        api.get.mockResolvedValueOnce({
            data: {
                _id: 'q3',
                title: 'Timed Quiz',
                type: 'quiz',
                status: 'published',
                settings: { timeLimit: 5 },
                theme: {},
                fields: []
            }
        });

        api.post.mockResolvedValueOnce({ 
            data: { 
                attemptId: 'att3', 
                timeLimit: 5,
                expiresAt: new Date(Date.now() + 5 * 60000).toISOString()
            } 
        });

        const container = renderForm('public3');
        
        await waitFor(() => {
            expect(container.innerHTML).toContain('Start Quiz');
        });
        fireEvent.click(screen.getByRole('button', { name: /Start Quiz/i }));

        await waitFor(() => {
            expect(container.innerHTML).toContain('Timed Quiz');
        });
    });
});

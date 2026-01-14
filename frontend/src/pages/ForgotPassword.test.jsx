import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import ForgotPassword from './ForgotPassword';

vi.mock('../api/axios', () => {
  return {
    default: {
      post: vi.fn()
    }
  };
});

import axios from '../api/axios';

describe('ForgotPassword', () => {
  it('submits email and shows generic success message', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        message: 'If an account with that email exists, we sent a password reset link.'
      }
    });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/email/i), 'a@example.com');
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(axios.post).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'a@example.com'
    });

    expect(
      await screen.findByText(/we sent a password reset link/i)
    ).toBeInTheDocument();
  });
});

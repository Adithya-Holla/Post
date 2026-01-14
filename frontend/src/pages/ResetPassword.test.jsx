import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import ResetPassword from './ResetPassword';

vi.mock('../api/axios', () => {
  return {
    default: {
      post: vi.fn()
    }
  };
});

import axios from '../api/axios';

describe('ResetPassword', () => {
  it('posts new password to reset endpoint and shows success', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Password reset successful' } });

    render(
      <MemoryRouter initialEntries={['/reset-password/testtoken1234567890']}>
        <Routes>
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/new password/i), 'NewPass123!');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'NewPass123!');
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(axios.post).toHaveBeenCalledWith('/auth/reset-password/testtoken1234567890', {
      password: 'NewPass123!'
    });

    expect(await screen.findByText(/password reset successful/i)).toBeInTheDocument();
  });
});

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import Register from './Register';

vi.mock('../api/axios', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn()
    }
  };
});

vi.mock('../context/AuthContext', () => {
  return {
    useAuth: () => ({
      register: vi.fn(async () => ({ success: true }))
    })
  };
});

import axios from '../api/axios';

describe('Register username availability', () => {
  it('shows available when API says available', async () => {
    axios.get.mockResolvedValueOnce({ data: { available: true } });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const input = screen.getByLabelText(/username/i);
    await userEvent.type(input, 'newuser');

    await new Promise((r) => setTimeout(r, 450));

    expect(axios.get).toHaveBeenCalledWith('/auth/check-username', {
      params: { username: 'newuser' }
    });

    expect(await screen.findByText(/username is available/i)).toBeInTheDocument();
  });

  it('shows taken when API says unavailable', async () => {
    axios.get.mockResolvedValueOnce({ data: { available: false } });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const input = screen.getByLabelText(/username/i);
    await userEvent.type(input, 'takenname');

    await new Promise((r) => setTimeout(r, 450));

    expect(await screen.findByText(/already taken/i)).toBeInTheDocument();
  });
});

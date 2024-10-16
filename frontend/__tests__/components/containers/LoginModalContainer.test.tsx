import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginModalContainer } from '../../../src/app/components/containers/LoginModalContainer';
import * as useAuthStoreModule from '../../../src/app/store/useAuthStore';

// useAuthStore のモックを作成
jest.mock('../../../src/app/store/useAuthStore');

describe('LoginModalContainer', () => {
  const mockLogin = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // useAuthStore のモックを正しく設定
    (useAuthStoreModule.useAuthStore as unknown as jest.Mock).mockImplementation(() => ({
      login: mockLogin,
    }));
  });

  it('renders LoginModal when isOpen is true', () => {
    render(<LoginModalContainer isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });

  it('calls login function and closes modal on successful login', async () => {
    mockLogin.mockResolvedValue(true);

    render(<LoginModalContainer isOpen={true} onClose={mockOnClose} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    
    await fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
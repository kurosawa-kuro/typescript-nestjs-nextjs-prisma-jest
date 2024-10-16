import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MicropostModalContainer } from '../../../src/app/components/containers/MicropostModalContainer';
import { getCategories } from '../../../src/app/actions/categories';
import { createMicropost } from '../../../src/app/actions/microposts';

// モックの設定
jest.mock('../../../src/app/actions/categories');
jest.mock('../../../src/app/actions/microposts');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

describe('MicropostModalContainer', () => {
  const mockCategories = [
    { id: 1, title: 'Category 1' },
    { id: 2, title: 'Category 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getCategories as jest.Mock).mockResolvedValue(mockCategories);
    localStorage.setItem('user', JSON.stringify({ id: 1 }));
  });

  it('fetches and displays categories', async () => {
    render(<MicropostModalContainer isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Category 1')).toBeInTheDocument();
      expect(screen.getByText('Category 2')).toBeInTheDocument();
    });
  });

  it('handles category fetch error', async () => {
    (getCategories as jest.Mock).mockResolvedValue(null);

    render(<MicropostModalContainer isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch categories')).toBeInTheDocument();
    });
  });

  it('allows selecting and deselecting categories', async () => {
    render(<MicropostModalContainer isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      const category1Button = screen.getByText('Category 1');
      fireEvent.click(category1Button);
      expect(category1Button).toHaveClass('bg-blue-500');

      fireEvent.click(category1Button);
      expect(category1Button).toHaveClass('bg-gray-200');
    });
  });

  it('submits form with selected categories', async () => {
    (createMicropost as jest.Mock).mockResolvedValue({ success: true });

    render(<MicropostModalContainer isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Category 1'));
      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Title' } });
      fireEvent.click(screen.getByText('Share'));
    });

    await waitFor(() => {
      expect(createMicropost).toHaveBeenCalledWith(expect.any(FormData));
      const formData = (createMicropost as jest.Mock).mock.calls[0][0];
      expect(formData.get('title')).toBe('Test Title');
      expect(formData.get('userId')).toBe('1');
      expect(formData.getAll('categoryIds[]')).toEqual(['1']);
    });
  });

  it('handles form submission error', async () => {
    (createMicropost as jest.Mock).mockResolvedValue({ success: false, error: 'Submission failed' });

    render(<MicropostModalContainer isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Share'));
    });

    await waitFor(() => {
      expect(screen.getByText('Submission failed')).toBeInTheDocument();
    });
  });

  it('handles missing user error', async () => {
    localStorage.removeItem('user');

    render(<MicropostModalContainer isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Share'));
    });

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it('handles image upload', async () => {
    render(<MicropostModalContainer isOpen={true} onClose={() => {}} />);

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText('Upload a file');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });
  });

  it('submits form with image', async () => {
    (createMicropost as jest.Mock).mockResolvedValue({ success: true });

    render(<MicropostModalContainer isOpen={true} onClose={() => {}} />);

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText('Upload a file');

    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Title' } });
    fireEvent.click(screen.getByText('Share'));

    await waitFor(() => {
      expect(createMicropost).toHaveBeenCalledWith(expect.any(FormData));
      const formData = (createMicropost as jest.Mock).mock.calls[0][0];
      expect(formData.get('title')).toBe('Test Title');
      expect(formData.get('image')).toEqual(file);
    });
  });

  it('handles unexpected error during form submission', async () => {
    (createMicropost as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

    render(<MicropostModalContainer isOpen={true} onClose={() => {}} />);

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Title' } });
    fireEvent.click(screen.getByText('Share'));

    await waitFor(() => {
      expect(screen.getByText('An error occurred while creating the micropost')).toBeInTheDocument();
    });
  });
  //   (createMicropost as jest.Mock).mockResolvedValue({ success: true });

  //   const onCloseMock = jest.fn();
  //   render(<MicropostModalContainer isOpen={true} onClose={onCloseMock} />);

  //   fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Title' } });
  //   fireEvent.click(screen.getByText('Category 1'));
  //   fireEvent.click(screen.getByText('Share'));

  //   await waitFor(() => {
  //     expect(onCloseMock).toHaveBeenCalled();
  //     expect(screen.queryByDisplayValue('Test Title')).not.toBeInTheDocument();
  //     expect(screen.getByText('Category 1')).toHaveClass('bg-gray-200');
  //   });
  // });
});
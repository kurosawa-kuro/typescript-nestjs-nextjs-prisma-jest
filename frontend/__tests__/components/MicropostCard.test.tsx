import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MicropostCard } from '../../src/app/components/microposts/MicropostCard';
import { MicroPost } from '../../src/app/types/models';

// Mock the next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt} src={props.src} onClick={props.onClick} onError={props.onError} />
  },
}));

describe('MicropostCard', () => {
  const mockPost: MicroPost = {
    id: 1,
    title: 'Test Post',
    imagePath: 'test/image.jpg',
    user: { id: 1, name: 'Test User', avatarPath: 'test/avatar.jpg' },
    categories: [{
      id: 1,
      title: 'abc'
    }],
  };

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders post with image correctly', () => {
    render(<MicropostCard post={mockPost} />);
    expect(screen.getByAltText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });

  it('renders "No image available" when imagePath is not provided', () => {
    const postWithoutImage = { ...mockPost, imagePath: null };
    render(<MicropostCard post={postWithoutImage} />);
    expect(screen.getByText('No image available')).toBeInTheDocument();
  });

  it('renders "Image failed to load" when image fails to load', () => {
    render(<MicropostCard post={mockPost} />);
    const img = screen.getByAltText('Test Post');
    
    fireEvent.error(img);

    expect(screen.getByText('Image failed to load')).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith('Image failed to load:', expect.any(String));
  });

  it('renders "Post not available" when post is undefined', () => {
    render(<MicropostCard post={undefined} />);
    expect(screen.getByText('Post not available')).toBeInTheDocument();
  });

  it('normalizes image path correctly', () => {
    const postWithWindowsPath = { ...mockPost, imagePath: 'test\\image.jpg' };
    render(<MicropostCard post={postWithWindowsPath} />);
    const img = screen.getByAltText('Test Post');
    expect(img).toHaveAttribute('src', expect.stringContaining('http://localhost:3001/uploads/test/image.jpg'));
  });

  it('calls onClick when the card is clicked', () => {
    const onClickMock = jest.fn();
    render(<MicropostCard post={mockPost} onClick={onClickMock} />);
    fireEvent.click(screen.getByText('Test Post'));
    expect(onClickMock).toHaveBeenCalledWith(mockPost);
  });

  it('handles full URL for imagePath correctly', () => {
    const postWithFullUrl = { ...mockPost, imagePath: 'https://example.com/image.jpg' };
    render(<MicropostCard post={postWithFullUrl} />);
    const img = screen.getByAltText('Test Post');
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('handles full URL for user.avatarPath correctly', () => {
    const postWithFullUrl = {
      ...mockPost,
      user: { ...mockPost.user, avatarPath: 'https://example.com/avatar.jpg' }
    };
    render(<MicropostCard post={postWithFullUrl} />);
    const img = screen.getByAltText(`${mockPost.user.name}'s avatar`);
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renders "Avatar failed" when avatar fails to load', () => {
    render(<MicropostCard post={mockPost} />);
    const avatar = screen.getByAltText(`${mockPost.user.name}'s avatar`);
    
    fireEvent.error(avatar);

    expect(screen.getByText('Avatar failed')).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith('Avatar failed to load:', expect.any(String));
  });

  it('renders "No Avatar" when user.avatarPath is not provided', () => {
    const postWithoutAvatar = { ...mockPost, user: { ...mockPost.user, avatarPath: null } };
    render(<MicropostCard post={postWithoutAvatar} />);
    expect(screen.getByText('No Avatar')).toBeInTheDocument();
  });
});
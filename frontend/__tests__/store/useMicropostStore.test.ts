import { renderHook, act } from '@testing-library/react';
import { useMicropostStore } from '../../src/app/store/useMicropostStore';
import { MicroPost } from '@/app/types/models';

describe('useMicropostStore', () => {
  beforeEach(() => {
    useMicropostStore.getState().setMicroPosts([]);
  });

  it('should initialize with empty microposts', () => {
    const { result } = renderHook(() => useMicropostStore());
    expect(result.current.MicroPosts).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set microposts', () => {
    const { result } = renderHook(() => useMicropostStore());
    const testMicroposts: MicroPost[] = [
      { id: 1, user: { id: 1, name: 'User1', avatarPath: '' }, title: 'Test Post 1', imagePath: '', categories: [] },
      { id: 2, user: { id: 2, name: 'User2', avatarPath: '' }, title: 'Test Post 2', imagePath: '', categories: [] },
    ];

    act(() => {
      result.current.setMicroPosts(testMicroposts);
    });

    expect(result.current.MicroPosts).toEqual(testMicroposts);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should add a new micropost', () => {
    const { result } = renderHook(() => useMicropostStore());
    const initialMicroposts: MicroPost[] = [
      { id: 1, user: { id: 1, name: 'User1', avatarPath: '' }, title: 'Test Post 1', imagePath: '', categories: [] },
    ];
    const newMicropost: MicroPost = { 
      id: 2, 
      user: { id: 2, name: 'User2', avatarPath: '' }, 
      title: 'New Post', 
      imagePath: '', 
      categories: [] 
    };

    act(() => {
      result.current.setMicroPosts(initialMicroposts);
    });

    act(() => {
      result.current.addMicroPost(newMicropost);
    });

    expect(result.current.MicroPosts).toEqual([newMicropost, ...initialMicroposts]);
  });
});
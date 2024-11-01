import { Category, MicropostView, User, UserProfile } from '@prisma/client';

export interface BasicMicropost {
  id: number;
  userId: number;
  title: string;
  imagePath: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  content: string;
  userId: number;
  micropostId: number;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, 'id' | 'name'> & {
    profile: Pick<UserProfile, 'avatarPath'>;
  };
}

export interface DetailedMicropost extends BasicMicropost {
  likesCount: number;
  user: Pick<User, 'id' | 'name'>;
  comments: Comment[];
  isLiked?: boolean;
  viewsCount: number;
  categories: Pick<Category, 'id' | 'name'>[];
}

export interface CategoryWithMicroposts {
  id: number;
  name: string;
  microposts: Array<{
    id: number;
    likesCount: number;
    viewsCount: number;
    isLiked: boolean;
  }>;
}

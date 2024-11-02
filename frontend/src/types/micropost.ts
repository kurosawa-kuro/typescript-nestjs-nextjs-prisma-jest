import { UserInfo } from './user';

export interface Comment {
  id: number;
  content: string;
  userId: number;
  micropostId: number;
  createdAt: string;
  updatedAt: string;
  user: Pick<UserInfo, 'id' | 'name'> & {
    profile: NonNullable<UserInfo['profile']>;
  };
}

export interface Category {
  id: number;
  name: string;
}

export interface Micropost {
  id: number;
  user: Pick<UserInfo, 'id' | 'name'> & {
    profile: NonNullable<UserInfo['profile']>;
  };
  title: string;
  imagePath: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  isLiked?: boolean;
  comments: Comment[];
  viewsCount: number;
  categories: Category[];
}

export interface NewMicropost {
  user: Pick<UserInfo, 'id' | 'name'> & {
    profile: NonNullable<UserInfo['profile']>;
  };
  title: string;
  imagePath: string;
}

export interface TimelineProps {
  microposts: Micropost[];
  currentPage: number;
  totalPages: number;
}

export interface CategoryRanking {
  id: number;
  name: string;
  count: number;
}
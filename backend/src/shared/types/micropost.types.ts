export interface Micropost {
  id: number;
  userId: number;
  title: string;
  imagePath: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
}


export interface Comment {
  id: number;
  content: string;
  userId: number;
  micropostId: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
  };
}

// export interface Micropost {
//   id: number;
//   user: Pick<UserInfo, 'id' | 'name'> & {
//     profile: NonNullable<UserInfo['profile']>;
//   };
//   title: string;
//   imagePath: string;
//   createdAt: string;
//   updatedAt: string;
//   likesCount: number;
//   comments: Comment[];
// }

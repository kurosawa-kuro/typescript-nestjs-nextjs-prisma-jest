export interface User {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
    isAdmin: boolean;
    avatarPath: string;
  }
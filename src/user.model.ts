export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
  avatarPath: string;
  // Add other user properties as needed
}


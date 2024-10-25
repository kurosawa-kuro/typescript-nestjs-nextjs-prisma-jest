import { Request } from 'express';
import { User } from '../features/users/entities/user.entity'; // Adjust the import path as needed

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

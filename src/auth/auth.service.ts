import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async register() {
    return { message: 'User registered successfully' };
  }

  async login() {
    return { message: 'User logged in successfully' };
  }

  async logout() {
    return { message: 'User logged out successfully' };
  }

  async me() {
    return { message: 'User information retrieved successfully' };
  }
}

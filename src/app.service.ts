import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  // model User {
  //   id            Int         @id @default(autoincrement())
  //   name          String
  //   email         String      @unique
  //   passwordHash  String
  //   isAdmin       Boolean     @default(false)
  //   avatarPath    String      @default("default_avatar.png")
  //   microposts    Micropost[]
  // }
  // Userテーブルにデータを追加するサンプルを教えてください。
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    // Implement user creation logic here
    return this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        passwordHash: userData.passwordHash,
        isAdmin: userData.isAdmin,
        avatarPath: userData.avatarPath,
      },
    });
  }

  // Userテーブルのデータを全て取得するサンプルを教えてください。
  async getAllUsers() {
    return this.prisma.user.findMany();
  }
}

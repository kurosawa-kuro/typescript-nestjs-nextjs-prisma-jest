import { Controller, Post, Body, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './user.model';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // id            Int         @id @default(autoincrement())
  // name          String
  // email         String      @unique
  // passwordHash  String
  // isAdmin       Boolean     @default(false)
  // avatarPath    String      @default("default_avatar.png")

  // ユーザー追加のAPIを作成してください。
  // パラメータはname, email, passwordHash, isAdmin, avatarPath
  // 返り値はUser
  @Post()
  async createUser(@Body() userData: Omit<User, 'id'>): Promise<User> {
    return this.appService.createUser(userData);
  }

  // ユーザー全取得のAPIを作成してください。
  // パラメータなし
  // 返り値はUserの配列
  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.appService.getAllUsers();
  }


}

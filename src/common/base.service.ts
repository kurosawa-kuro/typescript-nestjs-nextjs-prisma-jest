import { NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export abstract class BaseService<T> {
  protected abstract prisma: PrismaClient;
  protected abstract entityName: string;

  abstract create(data: Partial<T>): Promise<T>;

  abstract all(): Promise<T[]>;

  abstract findById(id: number): Promise<T>;

  abstract update(id: number, data: Partial<T>): Promise<T>;

  abstract destroy(id: number): Promise<void>;

  protected handleNotFound(id: number): never {
    throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
  }
}

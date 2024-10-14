import { NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export abstract class BaseService<T> {
  protected abstract prisma: PrismaClient;
  protected abstract entityName: string;

  abstract create(data: Partial<T>): Promise<T>;
  
  abstract all(): Promise<T[]>;
  
  abstract findById(id: string | number): Promise<T>;
  
  abstract update(id: string | number, data: Partial<T>): Promise<T>;
  
  abstract destroy(id: string | number): Promise<void>;

  protected handleNotFound(id: string | number): never {
    throw new NotFoundException(`${this.entityName} with id ${id} not found`);
  }
}

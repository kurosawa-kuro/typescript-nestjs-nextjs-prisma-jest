import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export abstract class BaseService<
  T,
  CreateInput,
  UpdateInput,
  WhereUniqueInput,
  WhereInput,
> {
  protected abstract entityName: string;

  constructor(protected prisma: PrismaService) {}

  async create(data: CreateInput): Promise<T> {
    return this.getRepository().create({ data }) as Promise<T>;
  }

  async all(): Promise<T[]> {
    return this.getRepository().findMany() as Promise<T[]>;
  }

  async findById(id: number): Promise<T> {
    const entity = (await this.getRepository().findUnique({
      where: { id } as WhereUniqueInput,
    })) as T | null;
    if (!entity) {
      this.handleNotFound(id);
    }
    return entity as T;
  }

  async update(id: number, data: UpdateInput): Promise<T> {
    try {
      return (await this.getRepository().update({
        where: { id } as WhereUniqueInput,
        data,
      })) as Promise<T>;
    } catch (error) {
      if (error.code === 'P2025') {
        this.handleNotFound(id);
      }
      throw error;
    }
  }

  async destroy(id: number): Promise<void> {
    try {
      await this.getRepository().delete({ where: { id } as WhereUniqueInput });
    } catch (error) {
      if (error.code === 'P2025') {
        this.handleNotFound(id);
      }
      throw error;
    }
  }

  async findFirst(where: WhereInput): Promise<T> {
    const entity = (await this.getRepository().findFirst({
      where,
    })) as T | null;
    if (!entity) {
      throw new NotFoundException(
        `${this.entityName} not found with criteria: ${JSON.stringify(where)}`,
      );
    }
    return entity;
  }

  protected handleNotFound(id: number): never {
    throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
  }

  protected abstract getRepository(): any;
}

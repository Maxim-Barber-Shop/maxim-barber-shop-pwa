/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse, PaginationParams, SortParams } from './types';

export class BaseService<T extends { id: string }> {
  protected model: any;

  constructor(model: any) {
    this.model = model;
  }

  async getAll(pagination?: PaginationParams, sort?: SortParams): Promise<ApiResponse<T[]>> {
    try {
      const orderBy = sort ? { [sort.column]: sort.ascending ? 'asc' : 'desc' } : undefined;

      const skip = pagination ? (pagination.page! - 1) * pagination.pageSize! : undefined;
      const take = pagination?.pageSize;

      const data = await this.model.findMany({
        where: { deletedAt: null },
        ...(orderBy && { orderBy }),
        ...(skip !== undefined && { skip }),
        ...(take && { take }),
      });

      return { data: data as T[], error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getById(id: string): Promise<ApiResponse<T>> {
    try {
      const data = await this.model.findFirst({
        where: { id, deletedAt: null },
      });

      if (!data) {
        return { data: null, error: 'Record not found' };
      }

      return { data: data as T, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<ApiResponse<T>> {
    try {
      const data = await this.model.create({
        data: item,
      });

      return { data: data as T, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async update(
    id: string,
    updates: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
  ): Promise<ApiResponse<T>> {
    try {
      const data = await this.model.update({
        where: { id },
        data: updates,
      });

      return { data: data as T, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      // Soft delete: set deletedAt to current timestamp
      await this.model.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async count(where?: any): Promise<ApiResponse<number>> {
    try {
      const count = await this.model.count({
        where: {
          deletedAt: null,
          ...where,
        },
      });
      return { data: count, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

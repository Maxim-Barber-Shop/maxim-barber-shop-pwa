import { prisma } from '@/lib/prisma';
import { BaseService } from '../base-service';
import { ApiResponse } from '../types';
import type { Store } from '@prisma/client';

class StoreService extends BaseService<Store> {
  constructor() {
    super(prisma.store);
  }

  async getWithHours(storeId: string): Promise<ApiResponse<Store & { hours: unknown[] }>> {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        include: {
          hours: {
            orderBy: { dayOfWeek: 'asc' },
          },
        },
      });

      if (!store) {
        return { data: null, error: 'Store not found' };
      }

      return { data: store as Store & { hours: unknown[] }, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getAllWithHours(): Promise<ApiResponse<Array<Store & { hours: unknown[] }>>> {
    try {
      const stores = await prisma.store.findMany({
        include: {
          hours: {
            orderBy: { dayOfWeek: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      });

      return { data: stores as Array<Store & { hours: unknown[] }>, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async searchByCity(city: string): Promise<ApiResponse<Store[]>> {
    try {
      const stores = await prisma.store.findMany({
        where: {
          address: {
            contains: city,
            mode: 'insensitive',
          },
        },
        orderBy: { name: 'asc' },
      });

      return { data: stores, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const storeService = new StoreService();

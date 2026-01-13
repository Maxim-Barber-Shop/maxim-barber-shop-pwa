import { prisma } from '@/lib/prisma';
import { BaseService } from '../base-service';
import { ApiResponse, PaginationParams, SortParams } from '../types';
import type { Service } from '@prisma/client';

class ServiceService extends BaseService<Service> {
  constructor() {
    super(prisma.service);
  }

  async getAll(pagination?: PaginationParams, sort?: SortParams): Promise<ApiResponse<Service[]>> {
    try {
      const orderBy = sort ? { [sort.column]: sort.ascending ? 'asc' : 'desc' } : undefined;

      const skip = pagination ? (pagination.page! - 1) * pagination.pageSize! : undefined;
      const take = pagination?.pageSize;

      const data = await prisma.service.findMany({
        where: { deletedAt: null },
        include: {
          barber: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          store: {
            select: {
              name: true,
            },
          },
        },
        ...(orderBy && { orderBy }),
        ...(skip !== undefined && { skip }),
        ...(take && { take }),
      });

      return { data: data as Service[], error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getByBarber(barberId: string, category?: string): Promise<ApiResponse<Service[]>> {
    try {
      const services = await prisma.service.findMany({
        where: {
          deletedAt: null,
          barberId,
          ...(category && { category: category as 'CAPELLI' | 'BARBA' | 'COMBO' }),
        },
        include: {
          barber: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          store: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      return { data: services, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getByCategory(category: string): Promise<ApiResponse<Service[]>> {
    try {
      const services = await prisma.service.findMany({
        where: {
          deletedAt: null,
          category: category as 'CAPELLI' | 'BARBA' | 'COMBO',
        },
        include: {
          barber: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          store: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      return { data: services, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getByPriceRange(minPrice: number, maxPrice: number): Promise<ApiResponse<Service[]>> {
    try {
      const services = await prisma.service.findMany({
        where: {
          deletedAt: null,
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
        },
        orderBy: { price: 'asc' },
      });

      return { data: services, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getByDuration(maxDuration: number): Promise<ApiResponse<Service[]>> {
    try {
      const services = await prisma.service.findMany({
        where: {
          deletedAt: null,
          durationMinutes: {
            lte: maxDuration,
          },
        },
        orderBy: { durationMinutes: 'asc' },
      });

      return { data: services, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const serviceService = new ServiceService();

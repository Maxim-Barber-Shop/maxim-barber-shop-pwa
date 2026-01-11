import { prisma } from '@/lib/prisma';
import { BaseService } from '../base-service';
import { ApiResponse } from '../types';
import type { Service } from '@prisma/client';

class ServiceService extends BaseService<Service> {
  constructor() {
    super(prisma.service);
  }

  async getByBarber(barberId: string): Promise<ApiResponse<Service[]>> {
    try {
      const services = await prisma.service.findMany({
        where: {
          barbers: {
            some: { barberId },
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

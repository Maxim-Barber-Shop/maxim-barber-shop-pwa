import { prisma } from '@/lib/prisma';
import { ApiResponse } from '../types';
import type { Blacklist } from '@prisma/client';

class BlacklistService {
  async getAll(): Promise<ApiResponse<Blacklist[]>> {
    try {
      const data = await prisma.blacklist.findMany({
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          appointment: {
            select: {
              id: true,
              startTime: true,
              service: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getById(id: string): Promise<ApiResponse<Blacklist>> {
    try {
      const data = await prisma.blacklist.findUnique({
        where: { id },
        include: {
          customer: true,
          appointment: true,
        },
      });

      if (!data) {
        return { data: null, error: 'Record not found' };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getByCustomerId(customerId: string): Promise<ApiResponse<Blacklist[]>> {
    try {
      const data = await prisma.blacklist.findMany({
        where: { customerId },
        include: {
          appointment: {
            select: {
              id: true,
              startTime: true,
              service: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async isBlacklisted(customerId: string): Promise<ApiResponse<boolean>> {
    try {
      const count = await prisma.blacklist.count({
        where: { customerId },
      });

      return { data: count > 0, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async create(item: Omit<Blacklist, 'id' | 'createdAt'>): Promise<ApiResponse<Blacklist>> {
    try {
      const data = await prisma.blacklist.create({
        data: item,
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      await prisma.blacklist.delete({
        where: { id },
      });

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const blacklistService = new BlacklistService();

import { prisma } from '@/lib/prisma';
import { ApiResponse } from '../types';
import type { BarberWeeklyHour } from '@prisma/client';

class BarberWeeklyHourService {
  async getAll(): Promise<ApiResponse<BarberWeeklyHour[]>> {
    try {
      const data = await prisma.barberWeeklyHour.findMany({
        include: {
          store: true,
          barber: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { dayOfWeek: 'asc' },
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getById(id: string): Promise<ApiResponse<BarberWeeklyHour>> {
    try {
      const data = await prisma.barberWeeklyHour.findUnique({
        where: { id },
        include: {
          store: true,
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

  async create(item: Omit<BarberWeeklyHour, 'id'>): Promise<ApiResponse<BarberWeeklyHour>> {
    try {
      const data = await prisma.barberWeeklyHour.create({
        data: item,
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async update(id: string, item: Partial<Omit<BarberWeeklyHour, 'id'>>): Promise<ApiResponse<BarberWeeklyHour>> {
    try {
      const data = await prisma.barberWeeklyHour.update({
        where: { id },
        data: item,
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      await prisma.barberWeeklyHour.delete({
        where: { id },
      });

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getByBarberId(barberId: string): Promise<ApiResponse<BarberWeeklyHour[]>> {
    try {
      const data = await prisma.barberWeeklyHour.findMany({
        where: { barberId },
        include: {
          store: true,
          barber: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { dayOfWeek: 'asc' },
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getByBarberIdAndDay(barberId: string, dayOfWeek: number): Promise<ApiResponse<BarberWeeklyHour[]>> {
    try {
      const data = await prisma.barberWeeklyHour.findMany({
        where: {
          barberId,
          dayOfWeek,
        },
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteByBarberId(barberId: string): Promise<ApiResponse<void>> {
    try {
      await prisma.barberWeeklyHour.deleteMany({
        where: { barberId },
      });

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const barberWeeklyHourService = new BarberWeeklyHourService();

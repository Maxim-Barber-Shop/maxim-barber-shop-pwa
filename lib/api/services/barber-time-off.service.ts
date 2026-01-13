import { prisma } from '@/lib/prisma';
import { ApiResponse } from '../types';
import type { BarberTimeOff } from '@prisma/client';

class BarberTimeOffService {
  async getAll(): Promise<ApiResponse<BarberTimeOff[]>> {
    try {
      const timeOffs = await prisma.barberTimeOff.findMany({
        include: {
          barber: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { startDate: 'desc' },
      });

      // For each time off, get affected appointments
      const dataWithAppointments = await Promise.all(
        timeOffs.map(async (timeOff) => {
          const appointments = await prisma.appointment.findMany({
            where: {
              barberId: timeOff.barberId,
              status: 'CONFIRMED',
              startTime: {
                gte: timeOff.startDate,
                lte: timeOff.endDate,
              },
            },
            include: {
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true,
                },
              },
              service: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: { startTime: 'asc' },
          });

          return {
            ...timeOff,
            affectedAppointments: appointments,
          };
        }),
      );

      return { data: dataWithAppointments, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getById(id: string): Promise<ApiResponse<BarberTimeOff>> {
    try {
      const data = await prisma.barberTimeOff.findUnique({
        where: { id },
      });

      if (!data) {
        return { data: null, error: 'Record not found' };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async create(item: Omit<BarberTimeOff, 'id' | 'createdAt'>): Promise<ApiResponse<BarberTimeOff>> {
    try {
      const data = await prisma.barberTimeOff.create({
        data: item,
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async update(
    id: string,
    item: Partial<Omit<BarberTimeOff, 'id' | 'createdAt'>>,
  ): Promise<ApiResponse<BarberTimeOff>> {
    try {
      const data = await prisma.barberTimeOff.update({
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
      await prisma.barberTimeOff.delete({
        where: { id },
      });

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getByBarberId(barberId: string): Promise<ApiResponse<BarberTimeOff[]>> {
    try {
      const data = await prisma.barberTimeOff.findMany({
        where: { barberId },
        orderBy: { startDate: 'desc' },
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getActiveTimeOff(barberId: string, date: Date): Promise<ApiResponse<BarberTimeOff[]>> {
    try {
      const data = await prisma.barberTimeOff.findMany({
        where: {
          barberId,
          startDate: { lte: date },
          endDate: { gte: date },
        },
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getUpcomingTimeOff(barberId: string): Promise<ApiResponse<BarberTimeOff[]>> {
    try {
      const now = new Date();
      const data = await prisma.barberTimeOff.findMany({
        where: {
          barberId,
          startDate: { gte: now },
        },
        orderBy: { startDate: 'asc' },
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const barberTimeOffService = new BarberTimeOffService();

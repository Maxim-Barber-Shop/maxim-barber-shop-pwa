import { prisma } from '@/lib/prisma';
import { BaseService } from '../base-service';
import { ApiResponse } from '../types';
import type { Appointment, AppointmentStatus } from '@prisma/client';

class AppointmentService extends BaseService<Appointment> {
  constructor() {
    super(prisma.appointment);
  }

  async getByCustomerId(customerId: string): Promise<ApiResponse<Appointment[]>> {
    try {
      const appointments = await prisma.appointment.findMany({
        where: { customerId },
        include: {
          barber: true,
          service: true,
          store: true,
        },
        orderBy: { startTime: 'desc' },
      });

      return { data: appointments, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getByBarberId(barberId: string): Promise<ApiResponse<Appointment[]>> {
    try {
      const appointments = await prisma.appointment.findMany({
        where: { barberId },
        include: {
          customer: true,
          service: true,
          store: true,
        },
        orderBy: { startTime: 'asc' },
      });

      return { data: appointments, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getByStatus(status: AppointmentStatus): Promise<ApiResponse<Appointment[]>> {
    try {
      const appointments = await prisma.appointment.findMany({
        where: { status },
        include: {
          customer: true,
          barber: true,
          service: true,
          store: true,
        },
        orderBy: { startTime: 'asc' },
      });

      return { data: appointments, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getByStoreId(storeId: string): Promise<ApiResponse<Appointment[]>> {
    try {
      const appointments = await prisma.appointment.findMany({
        where: { storeId },
        include: {
          customer: true,
          barber: true,
          service: true,
        },
        orderBy: { startTime: 'asc' },
      });

      return { data: appointments, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getUpcoming(customerId?: string): Promise<ApiResponse<Appointment[]>> {
    try {
      const appointments = await prisma.appointment.findMany({
        where: {
          startTime: { gte: new Date() },
          ...(customerId && { customerId }),
        },
        include: {
          customer: true,
          barber: true,
          service: true,
          store: true,
        },
        orderBy: { startTime: 'asc' },
      });

      return { data: appointments, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getByDateRange(startDate: Date, endDate: Date, storeId?: string): Promise<ApiResponse<Appointment[]>> {
    try {
      const appointments = await prisma.appointment.findMany({
        where: {
          startTime: { gte: startDate, lte: endDate },
          ...(storeId && { storeId }),
        },
        include: {
          customer: true,
          barber: true,
          service: true,
          store: true,
        },
        orderBy: { startTime: 'asc' },
      });

      return { data: appointments, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const appointmentService = new AppointmentService();

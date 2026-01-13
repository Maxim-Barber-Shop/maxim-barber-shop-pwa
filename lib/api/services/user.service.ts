import { prisma } from '@/lib/prisma';
import { BaseService } from '../base-service';
import { ApiResponse } from '../types';
import type { User, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

class UserService extends BaseService<User> {
  constructor() {
    super(prisma.user);
  }

  async getByPhone(phone: string): Promise<ApiResponse<User>> {
    try {
      const user = await prisma.user.findFirst({
        where: { phone, deletedAt: null },
      });

      if (!user) {
        return { data: null, error: 'User not found' };
      }

      return { data: user, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async searchByName(searchTerm: string): Promise<ApiResponse<User[]>> {
    try {
      const users = await prisma.user.findMany({
        where: {
          deletedAt: null,
          OR: [
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
      });

      return { data: users, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getByRole(role: UserRole): Promise<ApiResponse<User[]>> {
    try {
      const users = await prisma.user.findMany({
        where: { role, deletedAt: null },
        orderBy: { firstName: 'asc' },
      });

      return { data: users, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getBarbers(storeId?: string, excludeAdmin: boolean = false): Promise<ApiResponse<User[]>> {
    try {
      // If storeId is provided, we need to filter barbers who have hours at this store
      // Include admins unless explicitly excluded
      if (storeId) {
        if (excludeAdmin) {
          // Only barbers with hours at this store
          const barbers = await prisma.user.findMany({
            where: {
              role: 'BARBER' as UserRole,
              deletedAt: null,
              barberWeeklyHours: {
                some: { storeId },
              },
            },
            orderBy: { firstName: 'asc' },
          });
          return { data: barbers, error: null };
        } else {
          // Include both admins and barbers who have hours at this store
          const barbers = await prisma.user.findMany({
            where: {
              deletedAt: null,
              role: { in: ['BARBER', 'ADMIN'] as UserRole[] },
              barberWeeklyHours: {
                some: { storeId },
              },
            },
            orderBy: { firstName: 'asc' },
          });
          return { data: barbers, error: null };
        }
      }

      // If no storeId, return all barbers (and admins unless excluded)
      const barbers = await prisma.user.findMany({
        where: {
          role: excludeAdmin ? ('BARBER' as UserRole) : { in: ['BARBER', 'ADMIN'] as UserRole[] },
          deletedAt: null,
        },
        orderBy: { firstName: 'asc' },
      });

      return { data: barbers, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getCustomers(): Promise<ApiResponse<User[]>> {
    return this.getByRole('CUSTOMER');
  }

  // Override create to hash password before saving
  async create(item: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<ApiResponse<User>> {
    try {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(item.password, 10);

      const data = await prisma.user.create({
        data: {
          ...item,
          password: hashedPassword,
        },
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Override update to hash password if provided
  async update(id: string, item: Partial<User>): Promise<ApiResponse<User>> {
    try {
      // If password is being updated, hash it first
      const updateData = { ...item };
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const data = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const userService = new UserService();

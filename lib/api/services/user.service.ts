import { prisma } from '@/lib/prisma';
import { BaseService } from '../base-service';
import { ApiResponse } from '../types';
import type { User, UserRole } from '@prisma/client';

class UserService extends BaseService<User> {
  constructor() {
    super(prisma.user);
  }

  async getByPhone(phone: string): Promise<ApiResponse<User>> {
    try {
      const user = await prisma.user.findFirst({
        where: { phone },
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
        where: { role },
        orderBy: { firstName: 'asc' },
      });

      return { data: users, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getBarbers(): Promise<ApiResponse<User[]>> {
    return this.getByRole('BARBER');
  }

  async getCustomers(): Promise<ApiResponse<User[]>> {
    return this.getByRole('CUSTOMER');
  }
}

export const userService = new UserService();

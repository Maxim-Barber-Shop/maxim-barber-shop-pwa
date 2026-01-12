import { prisma } from '@/lib/prisma';
import { User, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth/jwt';

export interface RegisterData {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  role?: UserRole;
}

export interface LoginData {
  phone: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

class AuthService {
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { phone: data.phone },
      });

      if (existingUser) {
        return { data: null, error: 'Numero di telefono già registrato' };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          password: hashedPassword,
          role: data.role || UserRole.CUSTOMER,
        },
      });

      // Remove password from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        role: user.role,
        phone: user.phone,
      });

      return { data: { user: userWithoutPassword, token }, error: null };
    } catch (error) {
      console.error('Register error:', error);
      return { data: null, error: 'Errore durante la registrazione' };
    }
  }

  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    try {
      // Find user by phone
      const user = await prisma.user.findUnique({
        where: { phone: data.phone },
      });

      if (!user) {
        return { data: null, error: 'Numero di telefono o password non validi' };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(data.password, user.password);

      if (!isValidPassword) {
        return { data: null, error: 'Numero di telefono o password non validi' };
      }

      // Remove password from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        role: user.role,
        phone: user.phone,
      });

      return { data: { user: userWithoutPassword, token }, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { data: null, error: 'Errore durante il login' };
    }
  }
}

export const authService = new AuthService();

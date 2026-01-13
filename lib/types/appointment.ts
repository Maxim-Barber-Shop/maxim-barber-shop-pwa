export interface Store {
  id: string;
  name: string;
  address: string;
}

export type ServiceCategory = 'CAPELLI' | 'BARBA' | 'COMBO';

export interface Service {
  id: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
  discountedPrice?: number | null;
  category: ServiceCategory;
  barberId: string;
  storeId: string;
}

export interface Barber {
  id: string;
  firstName: string;
  lastName: string;
}

export interface BookingLimits {
  weeklyLimit: number;
  monthlyLimit: number;
  appointmentsThisWeek: number;
  appointmentsThisMonth: number;
  canBookThisWeek: boolean;
  canBookThisMonth: boolean;
  canBook: boolean;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export type AppointmentStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface AppointmentData {
  id: string;
  customerId: string;
  barberId: string;
  serviceId: string;
  storeId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
}

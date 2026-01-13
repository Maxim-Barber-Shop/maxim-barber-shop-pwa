// Export all services
export { userService } from './services/user.service';
export { appointmentService } from './services/appointment.service';
export { serviceService } from './services/service.service';
export { storeService } from './services/store.service';
export { barberWeeklyHourService } from './services/barber-weekly-hour.service';
export { barberTimeOffService } from './services/barber-time-off.service';
export { blacklistService } from './services/blacklist.service';

// Export types from Prisma
export type { User, Appointment, Service, Store, AppointmentStatus, UserRole } from '@prisma/client';

// Export API types
export type { ApiResponse, PaginationParams, SortParams } from './types';

// Export base service for creating new services
export { BaseService } from './base-service';

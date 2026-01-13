import { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '@/lib/api';
import type { Appointment } from '@prisma/client';

type AppointmentFilter = 'all' | 'upcoming';

interface UseAppointmentsOptions {
  customerId?: string;
  filter?: AppointmentFilter;
}

export function useAppointments(options: UseAppointmentsOptions = {}) {
  const { customerId, filter = 'all' } = options;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    let result;
    if (filter === 'upcoming') {
      result = await appointmentService.getUpcoming(customerId);
    } else if (customerId) {
      result = await appointmentService.getByCustomerId(customerId);
    } else {
      result = await appointmentService.getAll();
    }

    if (result.error) {
      setError(result.error);
    } else {
      setAppointments(result.data || []);
    }

    setLoading(false);
  }, [customerId, filter]);

  useEffect(() => {
    // fetchAppointments is memoized with useCallback, so this is safe
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAppointments();
  }, [fetchAppointments]);

  return { appointments, loading, error, refetch: fetchAppointments };
}

// Convenience wrapper for backward compatibility
export function useUpcomingAppointments(customerId?: string) {
  return useAppointments({ customerId, filter: 'upcoming' });
}

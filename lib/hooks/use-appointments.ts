import { useState, useEffect } from 'react';
import { appointmentService } from '@/lib/api';
import type { Appointment } from '@prisma/client';

export function useAppointments(customerId?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      const { data, error } = customerId
        ? await appointmentService.getByCustomerId(customerId)
        : await appointmentService.getAll();

      if (error) {
        setError(error);
      } else {
        setAppointments(data || []);
      }

      setLoading(false);
    }

    fetchAppointments();
  }, [customerId]);

  return { appointments, loading, error };
}

export function useUpcomingAppointments(customerId?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      const { data, error } = await appointmentService.getUpcoming(customerId);

      if (error) {
        setError(error);
      } else {
        setAppointments(data || []);
      }

      setLoading(false);
    }

    fetchAppointments();
  }, [customerId]);

  return { appointments, loading, error };
}

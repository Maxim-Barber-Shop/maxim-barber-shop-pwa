import { useState, useEffect } from 'react';
import { userService } from '@/lib/api';
import type { User } from '@prisma/client';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const { data, error } = await userService.getAll();

      if (error) {
        setError(error);
      } else {
        setUsers(data || []);
      }

      setLoading(false);
    }

    fetchUsers();
  }, []);

  return { users, loading, error };
}

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      if (!id) return;

      setLoading(true);
      const { data, error } = await userService.getById(id);

      if (error) {
        setError(error);
      } else {
        setUser(data);
      }

      setLoading(false);
    }

    fetchUser();
  }, [id]);

  return { user, loading, error };
}

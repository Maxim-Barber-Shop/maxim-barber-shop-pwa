import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

interface UseApiQueryOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
}

export function useApiQuery<T>(endpoint: string, params?: Record<string, string>, options: UseApiQueryOptions<T> = {}) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { enabled = true, onSuccess, onError } = options;

  const refetch = async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);
    const result = await apiClient.get<T>(endpoint, params);

    if (result.error) {
      setError(result.error);
      onError?.(result.error);
    } else {
      setData(result.data);
      if (result.data) {
        onSuccess?.(result.data);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, enabled]);

  return { data, error, isLoading, refetch };
}

interface UseApiMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export function useApiMutation<TData, TBody = unknown>(
  endpoint: string,
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'POST',
  options: UseApiMutationOptions<TData> = {},
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { onSuccess, onError } = options;

  const mutate = useCallback(
    async (body?: TBody, id?: string) => {
      setIsLoading(true);
      setError(null);

      const url = id ? `${endpoint}/${id}` : endpoint;
      const result = await apiClient.request<TData>(url, {
        method,
        body: method !== 'DELETE' ? body : undefined,
      });

      setIsLoading(false);

      if (result.error) {
        setError(result.error);
        onError?.(result.error);
      } else if (result.data) {
        onSuccess?.(result.data);
      }

      return result;
    },
    [endpoint, method, onSuccess, onError],
  );

  return { mutate, isLoading, error };
}

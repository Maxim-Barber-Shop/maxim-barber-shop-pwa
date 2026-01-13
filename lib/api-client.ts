type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string>;
}

interface ApiResult<T> {
  data: T | null;
  error: string | null;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }
    return url.toString();
  }

  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResult<T>> {
    const { method = 'GET', body, params } = options;
    const token = this.getToken();

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };

      if (body) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(this.buildUrl(endpoint, params), fetchOptions);

      const result = await response.json();

      if (!response.ok || result.error) {
        return { data: null, error: result.error || `Request failed with status ${response.status}` };
      }

      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Convenience methods
  get<T>(endpoint: string, params?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  post<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  patch<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  put<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

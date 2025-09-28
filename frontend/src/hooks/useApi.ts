'use client';

import { useState, useCallback } from 'react';
import { apiClient, ApiError } from '@/lib/api-client';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: ApiError) => void;
}

export function useApi<T = unknown>(
  endpoint: string,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (data?: unknown, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET') => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let response;
      switch (method) {
        case 'GET':
          response = await apiClient.get<T>(endpoint);
          break;
        case 'POST':
          response = await apiClient.post<T>(endpoint, data);
          break;
        case 'PUT':
          response = await apiClient.put<T>(endpoint, data);
          break;
        case 'DELETE':
          response = await apiClient.delete<T>(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      setState({
        data: response.data || null,
        loading: false,
        error: null,
      });

      if (options.onSuccess) {
        options.onSuccess(response.data);
      }

      return response.data;
    } catch (error) {
      const apiError = error instanceof ApiError ? error : new ApiError('Unknown error', 0);
      
      setState({
        data: null,
        loading: false,
        error: apiError.message,
      });

      if (options.onError) {
        options.onError(apiError);
      }

      throw apiError;
    }
  }, [endpoint, options]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export function useGet<T = unknown>(endpoint: string, options: UseApiOptions = {}) {
  const api = useApi<T>(endpoint, options);
  
  const get = useCallback((data?: unknown) => api.execute(data, 'GET'), [api]);
  
  return {
    ...api,
    get,
  };
}

export function usePost<T = unknown>(endpoint: string, options: UseApiOptions = {}) {
  const api = useApi<T>(endpoint, options);
  
  const post = useCallback((data?: unknown) => api.execute(data, 'POST'), [api]);
  
  return {
    ...api,
    post,
  };
}

export function usePut<T = unknown>(endpoint: string, options: UseApiOptions = {}) {
  const api = useApi<T>(endpoint, options);
  
  const put = useCallback((data?: unknown) => api.execute(data, 'PUT'), [api]);
  
  return {
    ...api,
    put,
  };
}

export function useDelete<T = unknown>(endpoint: string, options: UseApiOptions = {}) {
  const api = useApi<T>(endpoint, options);
  
  const del = useCallback((data?: unknown) => api.execute(data, 'DELETE'), [api]);
  
  return {
    ...api,
    delete: del,
  };
}

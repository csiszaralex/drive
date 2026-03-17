import type { ApiErrorResponse } from '@repo/shared-types';

export class ApiError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details?: string | string[];

  constructor(message: string, statusCode: number, errorCode: string, details?: string | string[]) {
    // Array of messages are usually validation errors, grab the first one as primary
    const primaryMessage = Array.isArray(message) ? message[0] : message;
    super(primaryMessage);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

interface ApiClientOptions extends RequestInit {
  responseType?: 'json' | 'text' | 'blob';
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { responseType, ...fetchOptions } = options;
  const url = `${import.meta.env.VITE_API_URL}${endpoint}`;
  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    let errorData: ApiErrorResponse | null = null;
    try {
      errorData = (await response.json()) as ApiErrorResponse;
    } catch {
      // Ignored, response is not valid JSON
    }

    if (errorData) {
      const errorMessage = Array.isArray(errorData.message)
        ? errorData.message.join('\n')
        : errorData.message;
      throw new ApiError(
        errorMessage || 'Ismeretlen hiba történt.',
        errorData.statusCode || response.status,
        errorData.errorCode || 'UNKNOWN_ERROR',
        errorData.message
      );
    }

    // Fallback if no JSON error data
    throw new ApiError('Szerverhiba történt a kérés során.', response.status, 'SERVER_ERROR');
  }

  // Not all successful requests have JSON bodies, e.g. 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  if (responseType === 'text') {
    return response.text() as unknown as T;
  }
  
  if (responseType === 'blob') {
    return response.blob() as unknown as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text() as unknown as T;
}

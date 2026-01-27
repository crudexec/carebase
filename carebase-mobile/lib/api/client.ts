import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { ApiError } from './types';

const TOKEN_KEY = 'auth_token';
const BASE_URL_KEY = 'api_base_url';

// Get the API URL based on environment
function getDefaultBaseUrl(): string {
  // Check for environment variable first (from app.config.js or .env)
  const envUrl = Constants.expoConfig?.extra?.apiUrl;
  if (envUrl) {
    return envUrl;
  }

  // For iOS Simulator, localhost works
  // For Android Emulator, use 10.0.2.2 (Android's alias for host machine)
  // For physical devices, you'll need to set the IP in app.config.js
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }
    return 'http://localhost:3000';
  }

  // Production URL (update this for production)
  return 'https://api.carebase.com';
}

const DEFAULT_BASE_URL = getDefaultBaseUrl();

export class APIClient {
  private static instance: APIClient;
  private baseUrl: string = DEFAULT_BASE_URL;
  private token: string | null = null;

  private constructor() {}

  static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  async initialize(): Promise<void> {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const storedBaseUrl = await SecureStore.getItemAsync(BASE_URL_KEY);

      if (storedToken) {
        this.token = storedToken;
      }
      if (storedBaseUrl) {
        this.baseUrl = storedBaseUrl;
      }
    } catch (error) {
      console.error('Failed to initialize API client:', error);
    }
  }

  async setBaseUrl(url: string): Promise<void> {
    this.baseUrl = url;
    await SecureStore.setItemAsync(BASE_URL_KEY, url);
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }

  async clearToken(): Promise<void> {
    this.token = null;
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: any;
      headers?: Record<string, string>;
      params?: Record<string, string | number | boolean | undefined>;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, headers = {}, params } = options;

    // Build URL with query params
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Build headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (this.token) {
      requestHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    // Make request
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle response
    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      throw new APIError(errorData.error, response.status, errorData.details);
    }

    // Handle empty response
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return response.json();
  }

  // Convenience methods
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: Record<string, string>
  ) {
    super(message);
    this.name = 'APIError';
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  get isForbidden(): boolean {
    return this.statusCode === 403;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  get isValidationError(): boolean {
    return this.statusCode === 400;
  }

  get isAlreadyError(): boolean {
    return this.message.toLowerCase().includes('already');
  }
}

export const api = APIClient.getInstance();

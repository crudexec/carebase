import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, APIError } from '../api/client';
import { endpoints } from '../api/endpoints';
import { User, LoginRequest, LoginResponse, SessionResponse } from '../api/types';
import { saveUser, getUser, clearUser } from './storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      // First try to get user from storage
      const storedUser = await getUser();
      if (storedUser && api.isAuthenticated()) {
        setUser(storedUser);
      }

      // Then verify with server
      if (api.isAuthenticated()) {
        const response = await api.get<SessionResponse>(endpoints.session);
        if (response.user) {
          setUser(response.user);
          await saveUser(response.user);
        } else {
          // Session invalid, clear everything
          await api.clearToken();
          await clearUser();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
      if (error instanceof APIError && error.isUnauthorized) {
        await api.clearToken();
        await clearUser();
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        await api.initialize();
        await refreshSession();
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [refreshSession]);

  const login = async (email: string, password: string) => {
    const response = await api.post<LoginResponse>(endpoints.login, {
      email,
      password,
    });

    await api.setToken(response.token);
    await saveUser(response.user);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await api.post(endpoints.logout);
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      await api.clearToken();
      await clearUser();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, authAPI, tokenManager } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = tokenManager.getToken();
    if (savedToken) {
      setToken(savedToken);
      // Fetch user data (token is automatically added by apiClient)
      authAPI
        .getCurrentUser()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // Invalid token, remove it
          tokenManager.removeToken();
          setToken(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    console.log('Login response:', response);
    console.log('Saving token:', response.access_token?.substring(0, 20) + '...');
    tokenManager.setToken(response.access_token);
    const savedToken = tokenManager.getToken();
    console.log('Token saved, verifying:', savedToken?.substring(0, 20) + '...');
    setToken(response.access_token);
    setUser(response.user);
  };

  const register = async (data: { name: string; email: string; phone: string; password: string }) => {
    await authAPI.register(data);
    // Auto login after registration
    await login(data.email, data.password);
  };

  const logout = () => {
    tokenManager.removeToken();
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, loading }}>
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


'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  default_currency: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token on mount
    const token = localStorage.getItem('auth-token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token));
        if (decoded.exp > Date.now()) {
          // Token is still valid
          setUser({
            id: decoded.userId,
            email: decoded.email,
            name: decoded.name || decoded.email.split('@')[0],
            default_currency: decoded.default_currency || 'CNY',
          });
        } else {
          // Token expired
          localStorage.removeItem('auth-token');
        }
      } catch (error) {
        console.error('Invalid auth token:', error);
        localStorage.removeItem('auth-token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '登录失败');
    }

    // Store token and user data
    localStorage.setItem('auth-token', data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        name, 
        email, 
        password,
        skipEmailVerification: true // 跳过邮箱验证
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '注册失败');
    }

    // 注册成功后自动登录
    if (data.token) {
      localStorage.setItem('auth-token', data.token);
      setUser(data.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
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
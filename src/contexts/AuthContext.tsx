import React, { createContext, useContext, useState, ReactNode } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Admin {
  id: string;
  name: string;
  email: string;
  created_at: string;
  is_super_admin: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentAdmin: Admin | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user is already logged in (from localStorage)
    return localStorage.getItem('glu_admin_auth') === 'true';
  });
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(() => {
    // Try to restore admin data from localStorage
    const adminData = localStorage.getItem('glu_admin_data');
    return adminData ? JSON.parse(adminData) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-291b20a9`;

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.admin) {
          localStorage.setItem('glu_admin_auth', 'true');
          localStorage.setItem('glu_admin_data', JSON.stringify(data.admin));
          setIsAuthenticated(true);
          setCurrentAdmin(data.admin);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('glu_admin_auth');
    localStorage.removeItem('glu_admin_data');
    setIsAuthenticated(false);
    setCurrentAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentAdmin, login, logout, isLoading }}>
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
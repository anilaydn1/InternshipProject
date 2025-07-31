import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '../types';
import ApiService from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already authenticated on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const isAuth = await ApiService.isAuthenticated();
      
      if (isAuth) {
        const storedUser = await ApiService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          // Try to fetch current user from API
          const currentUser = await ApiService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      const response = await ApiService.login(credentials);
      
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        setIsLoading(false); // Set loading to false immediately after success
        return { success: true, message: response.message };
      } else {
        setIsLoading(false);
        return { success: false, message: response.message };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, message: 'Giriş yapılırken bir hata oluştu.' };
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      const response = await ApiService.register(credentials);
      
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        setIsLoading(false); // Set loading to false immediately after success
        return { success: true, message: response.message };
      } else {
        setIsLoading(false);
        return { success: false, message: response.message };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, message: 'Kayıt olurken bir hata oluştu.' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await ApiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await ApiService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthenticatedUser } from '../types';
import { AUTH_KEY } from '../constants';

interface AuthContextType {
  currentUser: AuthenticatedUser | null;
  login: (usernameInput: string, passwordInput: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

// Mock users
const mockUsers: User[] = [
  { id: '1', username: 'admin', role: UserRole.ADMIN, name: 'Admin User' },
  { id: '2', username: 'quanly', role: UserRole.MANAGER, name: 'Manager User' },
  { id: '3', username: 'worker1', role: UserRole.WORKER, name: 'Worker Bee' },
];

// Mock passwords (in a real app, never store passwords like this)
const mockPasswords: { [username: string]: string } = {
  admin: '0896521537',
  quanly: 'evamosquanly',
  worker1: 'password',
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // For initial auth check

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_KEY);
    if (storedAuth) {
      try {
        const authenticatedUser = JSON.parse(storedAuth) as AuthenticatedUser;
        // Basic validation, in real app, you might re-validate token with backend
        if (authenticatedUser && authenticatedUser.token && authenticatedUser.id) {
           setCurrentUser(authenticatedUser);
        } else {
            localStorage.removeItem(AUTH_KEY);
        }
      } catch (error) {
        console.error("Failed to parse stored auth:", error);
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    setLoading(true);
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.username === usernameInput);
        if (user && mockPasswords[user.username] === passwordInput) {
          const authenticatedUser: AuthenticatedUser = {
            ...user,
            token: `mock-token-${Date.now()}` // Generate a mock token
          };
          setCurrentUser(authenticatedUser);
          localStorage.setItem(AUTH_KEY, JSON.stringify(authenticatedUser));
          setLoading(false);
          resolve(true);
        } else {
          setLoading(false);
          resolve(false);
        }
      }, 1000);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

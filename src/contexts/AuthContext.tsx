import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { generateUserColor } from '@/lib/auth';
import type { User } from '@/types/api';

interface AuthContextType {
  user: User | null;
  login: (name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('aztro-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('aztro-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (name: string) => {
    try {
      // Check if user already exists on server by name
      const response = await fetch('/api/users/by-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const existingUser = await response.json();
        setUser(existingUser);
        localStorage.setItem('aztro-user', JSON.stringify(existingUser));
      } else {
        // Create new user if doesn't exist
        const newUser: User = {
          id: crypto.randomUUID(),
          name,
          color: generateUserColor(name),
        };
        
        // Register new user on server
        const createResponse = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUser),
        });

        if (createResponse.ok) {
          const createdUser = await createResponse.json();
          setUser(createdUser);
          localStorage.setItem('aztro-user', JSON.stringify(createdUser));
        } else {
          // Fallback to local user if server fails
          setUser(newUser);
          localStorage.setItem('aztro-user', JSON.stringify(newUser));
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Fallback to local user
      const newUser: User = {
        id: crypto.randomUUID(),
        name,
        color: generateUserColor(name),
      };
      setUser(newUser);
      localStorage.setItem('aztro-user', JSON.stringify(newUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aztro-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

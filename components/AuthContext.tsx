'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface StudentProfile {
  _id: string;
  userId: string;
  college: string;
  degree: string;
  skills: string[];
}

interface CompanyProfile {
  _id: string;
  userId: string;
  companyName: string;
  website?: string;
  description?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'company';
  profile: StudentProfile | CompanyProfile | null;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredUser() {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem('placeme_user');
  if (!stored) return null;

  try {
    return JSON.parse(stored) as User;
  } catch {
    localStorage.removeItem('placeme_user');
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const loading = false;

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('placeme_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('placeme_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, loading }}>
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

import { loginApi, registerApi } from '@/services/authService';
import { LoginRequest, RegisterRequest, User } from '@/types/auth';
import { storageDelete, storageGet, storageSet } from '@/utils/storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const TOKEN_KEY = 'auth_token';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (req: LoginRequest) => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Uygulama açılışında kaydedilmiş token varsa oku
  useEffect(() => {
    (async () => {
      try {
        const stored = await storageGet(TOKEN_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as { token: string; user: User };
          if (isTokenExpired(parsed.token)) {
            await storageDelete(TOKEN_KEY);
          } else {
            setToken(parsed.token);
            setUser(parsed.user);
          }
        }
      } catch {
        // Bozuk depolama → temizle
        await storageDelete(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (req: LoginRequest) => {
    const res = await loginApi(req);
    await storageSet(TOKEN_KEY, JSON.stringify({ token: res.token, user: res.user }));
    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (req: RegisterRequest) => {
    const res = await registerApi(req);
    await storageSet(TOKEN_KEY, JSON.stringify({ token: res.token, user: res.user }));
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    await storageDelete(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

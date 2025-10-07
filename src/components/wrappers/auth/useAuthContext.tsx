'use client';

import { deleteCookie, getCookie, hasCookie, setCookie } from 'cookies-next';
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

const authSessionKey = '_CERT_GEN_AUTH_KEY_';

export function AuthProvider({ children }) {
  const getSession = () => {
    const fetchedCookie = getCookie(authSessionKey)?.toString();
    if (!fetchedCookie) return null;
    try {
      return JSON.parse(fetchedCookie);
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState(getSession());

  const saveSession = (userData) => {
    setCookie(authSessionKey, JSON.stringify(userData));
    setUser(userData);
  };

  const removeSession = () => {
    deleteCookie(authSessionKey);
    setUser(null);
  };

  const isAuthenticated = hasCookie(authSessionKey) && !!user;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      saveSession,
      removeSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}
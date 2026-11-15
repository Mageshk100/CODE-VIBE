import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginWithEmail,
  registerWithEmail,
  sendPasswordReset,
  logoutFirebase,
  auth
} from '../services/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';
import { apiClient, setTokenProvider } from '../services/apiClient';

const AuthContext = createContext();

const STORAGE_USER_KEY = 'codevibe_auth_user';
const STORAGE_TOKEN_KEY = 'codevibe_auth_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Register token provider with apiClient
  useEffect(() => {
    setTokenProvider(() => token);
    if (token) {
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  }, [user]);

  // Synchronize authenticated Firebase account with MySQL profile
  const syncWithBackend = async (idToken) => {
    const res = await apiClient.post('/auth/sync', {}, {
      headers: { 'Authorization': `Bearer ${idToken}` }
    });
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to synchronize user profile with database');
    }
    return res.data;
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { user: fbUser, idToken } = await loginWithEmail(email, password);
      setToken(idToken);

      // Verify ID token with Express backend and sync with MySQL
      const backendProfile = await syncWithBackend(idToken);

      const resolvedUser = {
        ...backendProfile,
        isLoggedIn: true,
        isGuest: false,
      };

      setUser(resolvedUser);
      return resolvedUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const { user: fbUser, idToken } = await registerWithEmail(email, password, name);
      setToken(idToken);

      // Verify ID token with Express backend and create MySQL user record
      const backendProfile = await syncWithBackend(idToken);

      const resolvedUser = {
        ...backendProfile,
        isLoggedIn: true,
        isGuest: false,
      };

      setUser(resolvedUser);
      return resolvedUser;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    return await sendPasswordReset(email);
  };

  const continueAsGuest = () => {
    const guestUser = {
      id: 'guest',
      name: 'Guest Explorer',
      email: 'guest@codevibe.local',
      role: 'guest',
      avatar: 'GE',
      isLoggedIn: false,
      isGuest: true,
    };
    setUser(guestUser);
    setToken(null);
    return guestUser;
  };

  const logout = async () => {
    await logoutFirebase();
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem('codevibe_active_session_id');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isLoggedIn: !!user && !user.isGuest && !!user.isLoggedIn,
        isGuest: !!user?.isGuest || !user,
        login,
        register,
        resetPassword,
        continueAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getAuthToken,
  setAuthToken,
  getStoredUser,
  setStoredUser,
  loginApi,
  refreshTokenApi,
  logoutApi,
  registerManagerApi,
  isAdmin as checkIsAdmin,
  isManager as checkIsManager,
  subscribeToAuth,
} from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getAuthToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Sync state with auth module events (e.g. background 401 refresh, manual updates)
  useEffect(() => {
    const unsubscribe = subscribeToAuth(({ user: newUser, token: newToken }) => {
      setToken(newToken);
      setUser(newUser);
    });
    return unsubscribe;
  }, []);

  // On mount: attempt silent token refresh using the HttpOnly cookie
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const response = await refreshTokenApi();
        if (isMounted && response && response.token) {
          setToken(response.token);
          if (response.user) {
            setUser(response.user);
          }
        }
      } catch {
        // Unauthenticated or cookie expired/missing - normal for logged out users
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const response = await loginApi(credentials);
      if (response && response.token) {
        setToken(response.token);
        setUser(response.user || null);
        return {
          success: true,
          message: response.message || 'Signed in successfully.',
          user: response.user,
        };
      } else {
        throw new Error(response?.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (managerData) => {
    setLoading(true);
    try {
      const result = await registerManagerApi(managerData);
      return { success: true, result, message: 'Manager account registered successfully.' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await logoutApi();
    } finally {
      setToken(null);
      setUser(null);
      setAuthToken(null);
      setStoredUser(null);
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setUser((prevUser) => {
      const newUser = { ...(prevUser || {}), ...updatedFields };
      setStoredUser(newUser);
      return newUser;
    });
  }, []);

  const isAuthenticated = Boolean(token && user);
  const isAdmin = checkIsAdmin(user);
  const isManager = checkIsManager(user);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isAdmin,
        isManager,
        loading,
        initialLoading,
        login,
        register,
        logout,
        updateUser,
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



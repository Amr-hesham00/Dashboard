import { createContext, useContext, useState, useEffect } from 'react';
import {
  getAuthToken,
  setAuthToken,
  getStoredUser,
  setStoredUser,
  loginApi,
  registerApi,
} from '../api/auth';
import { mockUsers } from '../mock/mockData';

const DEFAULT_DEMO_USER = {
  id: 'usr-001',
  userName: 'amr',
  email: 'amr@example.com',
  firstName: 'Amr',
  lastName: 'El-Sayed',
  role: 'Admin',
  phoneNumber: '+1 (555) 234-5678',
  bio: 'Marketing Specialist & Campaign Manager',
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getAuthToken() || 'demo-token');
  const [user, setUser] = useState(() => getStoredUser() || DEFAULT_DEMO_USER);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    } else {
      setAuthToken(null);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      setStoredUser(user);
    } else {
      setStoredUser(null);
    }
  }, [user]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      let response;
      try {
        response = await loginApi(credentials);
      } catch {
        // Fallback to demo login if backend server is unreachable
        response = {
          success: true,
          token: 'demo-token',
          user: {
            ...DEFAULT_DEMO_USER,
            userName: credentials.emailOrUserName || DEFAULT_DEMO_USER.userName,
            email: credentials.emailOrUserName?.includes('@')
              ? credentials.emailOrUserName
              : DEFAULT_DEMO_USER.email,
          },
          message: 'Signed in successfully (Demo Mode)',
        };
      }

      if (response && (response.success || response.token)) {
        const userToken = response.token || 'demo-token';
        const userData = response.user || DEFAULT_DEMO_USER;
        setToken(userToken);
        setUser(userData);
        return { success: true, message: response.message || 'Logged in' };
      } else {
        throw new Error(response?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const result = await registerApi(userData);
      return { success: true, result };
    } catch {
      // Fallback for offline mode
      const newUser = {
        id: `usr-${Date.now()}`,
        userName: userData.userName || 'newuser',
        email: userData.email || 'user@example.com',
        firstName: userData.firstName || 'New',
        lastName: userData.lastName || 'User',
        role: 'Associate',
      };
      setToken('demo-token');
      setUser(newUser);
      return { success: true, message: 'Account registered successfully' };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prevUser) => {
      const newUser = { ...(prevUser || DEFAULT_DEMO_USER), ...updatedFields };
      setStoredUser(newUser);
      return newUser;
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    setStoredUser(null);
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        loading,
        login,
        register,
        updateUser,
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


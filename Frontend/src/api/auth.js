// In-memory authentication state (NO localStorage/sessionStorage token persistence)
let inMemoryAccessToken = null;
let inMemoryUser = null;

// Clean up any deprecated localStorage auth tokens
try {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('auth_user');
} catch {
  // Ignore storage access errors in restricted environments
}

const API_BASE_URL = '/api';

// Subscribers for auth state changes (e.g. background token refresh or logout)
const authSubscribers = new Set();

function notifyAuthChange(user, token) {
  authSubscribers.forEach((callback) => {
    try {
      callback({ user, token, isAuthenticated: Boolean(token && user) });
    } catch (e) {
      console.error('Error in auth change subscriber:', e);
    }
  });
}

export function subscribeToAuth(callback) {
  authSubscribers.add(callback);
  return () => authSubscribers.delete(callback);
}

export function getAuthToken() {
  return inMemoryAccessToken;
}

export function setAuthToken(token) {
  inMemoryAccessToken = token || null;
  notifyAuthChange(inMemoryUser, inMemoryAccessToken);
}

export function getStoredUser() {
  return inMemoryUser;
}

export function setStoredUser(user) {
  inMemoryUser = user || null;
  notifyAuthChange(inMemoryUser, inMemoryAccessToken);
}

/**
 * Role helper utilities
 */
export function isAdmin(user) {
  if (!user) return false;
  const role = user.role;
  return role === 1 || role === '1' || role === 'Admin' || role === 'admin';
}

export function isManager(user) {
  if (!user) return false;
  const role = user.role;
  return role === 0 || role === '0' || role === 'Manager' || role === 'manager';
}

export function getRoleName(role) {
  if (role === 1 || role === '1' || role === 'Admin' || role === 'admin') return 'Admin';
  if (role === 0 || role === '0' || role === 'Manager' || role === 'manager') return 'Manager';
  if (role === 2 || role === '2' || role === 'Associate' || role === 'associate') return 'Associate';
  return role ? String(role) : 'User';
}

/**
 * Returns authorization headers with the current in-memory Bearer token
 */
export function getAuthHeaders(customHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (inMemoryAccessToken) {
    headers['Authorization'] = `Bearer ${inMemoryAccessToken}`;
  }

  return headers;
}

/**
 * Helper to parse backend error messages from responses
 */
async function parseErrorMessage(response) {
  try {
    const data = await response.json();
    if (data) {
      if (typeof data === 'string') return data;
      if (data.message) return data.message;
      if (data.errors && typeof data.errors === 'object') {
        const errorList = Object.values(data.errors).flat().filter(Boolean);
        if (errorList.length > 0) return errorList.join(', ');
      }
      if (data.title) return data.title;
    }
  } catch {
    // If body is not JSON, fallback to status text
  }

  if (response.status === 401) return 'Unauthorized: Invalid credentials or session expired.';
  if (response.status === 403) return 'Forbidden: You do not have permission to perform this action.';
  if (response.status === 404) return 'Resource not found.';
  if (response.status === 429) return 'Too many requests. Please slow down and try again.';
  if (response.status >= 500) return 'A server error occurred. Please try again later.';

  return `Request failed with status ${response.status}.`;
}

/**
 * Shared in-flight promise for refresh token requests to prevent concurrent calls
 */
let refreshPromise = null;

/**
 * Refresh access token using the backend HttpOnly cookie
 */
export async function refreshTokenApi() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/User/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorMsg = await parseErrorMessage(response);
        inMemoryAccessToken = null;
        inMemoryUser = null;
        notifyAuthChange(null, null);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (data && data.token) {
        inMemoryAccessToken = data.token;
        if (data.user) {
          inMemoryUser = data.user;
        }
        notifyAuthChange(inMemoryUser, inMemoryAccessToken);
        return data;
      } else {
        throw new Error('Refresh response did not contain a valid token.');
      }
    } catch (err) {
      inMemoryAccessToken = null;
      inMemoryUser = null;
      notifyAuthChange(null, null);
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Authenticate user with email/username and password
 */
export async function loginApi(credentials) {
  const response = await fetch(`${API_BASE_URL}/User/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      emailOrUserName: credentials.emailOrUserName?.trim(),
      password: credentials.password,
    }),
  });

  if (!response.ok) {
    const errorMsg = await parseErrorMessage(response);
    throw new Error(errorMsg);
  }

  const data = await response.json();
  if (data && data.token) {
    inMemoryAccessToken = data.token;
    inMemoryUser = data.user || null;
    notifyAuthChange(inMemoryUser, inMemoryAccessToken);
    return data;
  } else {
    throw new Error(data.message || 'Login failed.');
  }
}

/**
 * Sign out current user and invalidate backend refresh token session
 */
export async function logoutApi() {
  try {
    await fetch(`${API_BASE_URL}/User/Logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
  } catch (e) {
    console.warn('Backend logout call returned error:', e);
  } finally {
    inMemoryAccessToken = null;
    inMemoryUser = null;
    notifyAuthChange(null, null);
  }
}

/**
 * Register a new Manager (Admin only)
 */
export async function registerManagerApi(managerData) {
  const response = await fetch(`${API_BASE_URL}/User`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({
      userName: managerData.userName?.trim(),
      email: managerData.email?.trim(),
      firstName: managerData.firstName?.trim(),
      lastName: managerData.lastName?.trim(),
      password: managerData.password,
      confirmPassword: managerData.confirmPassword,
    }),
  });

  if (!response.ok) {
    const errorMsg = await parseErrorMessage(response);
    throw new Error(errorMsg);
  }

  return await response.json();
}

// Shared cache of in-flight GET request promises to deduplicate concurrent requests (e.g. from React StrictMode)
const inFlightRequests = new Map();

/**
 * Universal fetch wrapper with automatic 401 refresh interceptor and in-flight request deduplication
 */
export async function apiFetch(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  // Deduplicate identical in-flight GET requests (safe idempotent reads)
  if (method === 'GET' && !options.body && !options._isRetry) {
    const cacheKey = `${url}|${inMemoryAccessToken || ''}`;
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey).then((res) => res.clone());
    }

    const fetchPromise = rawApiFetch(url, options).finally(() => {
      inFlightRequests.delete(cacheKey);
    });

    inFlightRequests.set(cacheKey, fetchPromise);
    return fetchPromise.then((res) => res.clone());
  }

  return rawApiFetch(url, options);
}

async function rawApiFetch(url, options = {}) {
  const customHeaders = options.headers || {};
  const isRetry = Boolean(options._isRetry);

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const fetchOptions = {
    ...options,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(inMemoryAccessToken ? { Authorization: `Bearer ${inMemoryAccessToken}` } : {}),
      ...customHeaders,
    },
  };

  let response = await fetch(url, fetchOptions);

  // If 401 Unauthorized and not already retried and not an auth route
  if (
    response.status === 401 &&
    !isRetry &&
    !url.includes('/api/User/login') &&
    !url.includes('/api/User/refresh-token') &&
    !url.includes('/api/User/Logout')
  ) {
    try {
      await refreshTokenApi();

      // Retry the original request with new token
      const retryHeaders = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(inMemoryAccessToken ? { Authorization: `Bearer ${inMemoryAccessToken}` } : {}),
        ...customHeaders,
      };

      response = await fetch(url, {
        ...options,
        _isRetry: true,
        credentials: 'include',
        headers: retryHeaders,
      });
    } catch {
      // Refresh failed; response remains 401
    }
  }

  return response;
}

/**
 * Get list of all registered users (Admin only)
 */
export async function getAllUsersApi() {
  const response = await apiFetch(`${API_BASE_URL}/User`);
  if (!response.ok) {
    const errorMsg = await parseErrorMessage(response);
    throw new Error(errorMsg);
  }
  return await response.json();
}

/**
 * Update user information by ID (Admin/User)
 */
export async function updateUserApi(id, updateData) {
  const response = await apiFetch(`${API_BASE_URL}/User/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      email: updateData.email?.trim(),
      firstName: updateData.firstName?.trim(),
      lastName: updateData.lastName?.trim(),
      phoneNumber: updateData.phoneNumber?.trim() || null,
      role: updateData.role !== undefined ? Number(updateData.role) : undefined,
    }),
  });
  if (!response.ok) {
    const errorMsg = await parseErrorMessage(response);
    throw new Error(errorMsg);
  }
  return await response.json().catch(() => ({ success: true }));
}

/**
 * Change password for a user
 */
export async function changeUserPasswordApi(id, passwordData) {
  const response = await apiFetch(`${API_BASE_URL}/User/${id}/change-password`, {
    method: 'POST',
    body: JSON.stringify({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    }),
  });
  if (!response.ok) {
    const errorMsg = await parseErrorMessage(response);
    throw new Error(errorMsg);
  }
  return await response.json().catch(() => ({ success: true }));
}

/**
 * Delete a user by ID (Admin only)
 */
export async function deleteUserApi(id) {
  const response = await apiFetch(`${API_BASE_URL}/User/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorMsg = await parseErrorMessage(response);
    throw new Error(errorMsg);
  }
  return await response.json().catch(() => ({ success: true }));
}


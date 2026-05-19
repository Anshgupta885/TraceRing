/**
 * API Service for communicating with the backend.
 */

import axios from 'axios';

const API_BASE_URL = '/api';
const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_KEY = 'authUser';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 second timeout for large files
});

function getStoredToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function setStoredAuth(token, userData) {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
    if (userData) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
    }
  } catch {
    // Ignore storage errors so login flow does not break in restricted environments.
  }
}

export function getStoredAuthUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Re-attach token after full page reloads.
const bootToken = getStoredToken();
if (bootToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${bootToken}`;
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Upload CSV file for analysis
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error;
      throw new Error(axiosError.response?.data?.message || 'Failed to upload file');
    }
    throw error;
  }
}

/**
 * Get analysis by session ID
 */
export async function getAnalysis(sessionId) {
  try {
    const response = await api.get(`/analysis/${sessionId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error;
      throw new Error(axiosError.response?.data?.message || 'Failed to retrieve analysis');
    }
    throw error;
  }
}

/**
 * Get the authenticated user's analysis statistics and recent results
 */
export async function getUserResults() {
  try {
    const response = await api.get('/user/results');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error;
      throw new Error(axiosError.response?.data?.message || 'Failed to load user results');
    }
    throw error;
  }
}

/**
 * Download analysis as JSON file
 */
export async function downloadJSON(fraudAnalysis) {
  const downloadData = {
    suspicious_accounts: fraudAnalysis.suspicious_accounts,
    fraud_rings: fraudAnalysis.fraud_rings,
    summary: fraudAnalysis.summary,
  };

  const blob = new Blob([JSON.stringify(downloadData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `fraud-analysis-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Health check for backend
 */
export async function checkHealth() {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return response.status === 200;
  } catch {
    return false;
  }
}

/**
 * Register a new user
 */
export async function registerUser({ name, email, password, role = 'user' }) {
  try {
    const response = await api.post('/user/register', { name, email, password, role });
    // store token locally for subsequent requests if returned
    if (response.data && response.data.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    // persist user info for UI state
    setStoredAuth(response.data?.token, response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error;
      throw new Error(axiosError.response?.data?.message || 'Registration failed');
    }
    throw error;
  }
}

/**
 * Login existing user
 */
export async function loginUser({ email, password }) {
  try {
    const response = await api.post('/user/login', { email, password });
    // store token locally for subsequent requests
    if (response.data && response.data.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    setStoredAuth(response.data?.token, response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error;
      throw new Error(axiosError.response?.data?.message || 'Login failed');
    }
    throw error;
  }
}

/**
 * Logout user locally
 */
export function logoutUser() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  delete api.defaults.headers.common['Authorization'];
  localStorage.removeItem(AUTH_USER_KEY);
}

import axios from 'axios';
import toast from 'react-hot-toast';

// ==================== Axios Instance ====================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// ==================== Request Interceptor ====================
api.interceptors.request.use(
  (config) => {
    // Add auth token from localStorage if available (fallback)
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// ==================== Response Interceptor ====================
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.DEV) {
      console.log(`📥 ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    const { response, config } = error;
    const status = response?.status;
    const message = response?.data?.message || 'Something went wrong';

    // Log errors in development
    if (import.meta.env.DEV) {
      console.error(`❌ ${status} ${config?.url}`, response?.data);
    }

    // Handle specific error cases
    if (status === 401) {
      // Unauthorized - don't show toast for /auth/me (silent check)
      if (config?.url !== '/auth/me') {
        // Clear any stored auth data
        localStorage.removeItem('token');
        
        // Only show toast if not already on login page
        if (!window.location.pathname.includes('/login')) {
          toast.error('Session expired. Please login again.');
          
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        }
      }
    } else if (status === 403) {
      toast.error('You do not have permission to perform this action');
    } else if (status === 404) {
      // Silent for 404s - often used for checks
      if (!config?.url?.includes('/check')) {
        toast.error('Resource not found');
      }
    } else if (status === 429) {
      toast.error('Too many requests. Please wait a moment.');
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.');
    } else if (!response) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else if (status !== 400) {
      // Don't show toast for 400 (validation errors) - let components handle
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// ==================== Helper Methods ====================
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};

// ==================== Export ====================
export default api;
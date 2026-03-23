import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/proxy',
  withCredentials: true,
});

// Token getter — set by Providers.tsx once Clerk is loaded
let _getToken: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (getter: () => Promise<string | null>) => {
  _getToken = getter;
};

// Legacy helper kept for compatibility
export const setApiToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Interceptor: attach a fresh Clerk JWT to every outgoing request
api.interceptors.request.use(async (config) => {
  if (_getToken) {
    try {
      const token = await _getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Token fetch failed — request proceeds without auth header
    }
  }
  return config;
});

export default api;

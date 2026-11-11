import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// Attach access token to every request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('cd_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh on 401, and not on login/refresh endpoints
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/login') &&
      !original.url?.includes('/auth/refresh')
    ) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          });
        });
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem('cd_refresh_token');

      if (!refreshToken) {
        forceLogout();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccess = data?.data?.access_token;
        const newRefresh = data?.data?.refresh_token;

        if (newAccess) {
          localStorage.setItem('cd_access_token', newAccess);
          if (newRefresh) localStorage.setItem('cd_refresh_token', newRefresh);

          pendingQueue.forEach((cb) => cb(newAccess));
          pendingQueue = [];

          original.headers.Authorization = `Bearer ${newAccess}`;
          return apiClient(original);
        }
      } catch {
        forceLogout();
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

function forceLogout() {
  localStorage.removeItem('cd_access_token');
  localStorage.removeItem('cd_refresh_token');
  localStorage.removeItem('cd_user');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export default apiClient;
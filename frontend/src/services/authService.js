import { apiClient, ApiError } from './apiClient';

export const authService = {
  async login(email, password, remember = false) {
    try {
      const data = await apiClient.post('/auth/login', { email, password, remember });
      return {
        user: data.user,
        loginAt: data.loginAt,
        remember: data.remember,
      };
    } catch (err) {
      if (err instanceof ApiError) throw new Error(err.message);
      throw err;
    }
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignorar si la sesión ya expiró
    }
  },

  async getCurrentUser() {
    try {
      const data = await apiClient.get('/auth/me');
      return data.user;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return null;
      throw err;
    }
  },

  async getSessionInfo() {
    try {
      return await apiClient.get('/auth/me');
    } catch {
      return null;
    }
  },

  async updateProfile(userId, data) {
    try {
      return await apiClient.patch('/auth/profile', data);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) throw { errors: err.errors };
        throw new Error(err.message);
      }
      throw err;
    }
  },
};

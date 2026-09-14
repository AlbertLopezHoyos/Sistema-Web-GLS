const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export const apiClient = {
  async request(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    let body = null;
    const text = await res.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = { success: false, message: text };
      }
    }

    if (!res.ok) {
      throw new ApiError(
        body?.message || `Error ${res.status}`,
        res.status,
        body?.errors
      );
    }

    if (body && body.success === false) {
      throw new ApiError(body.message || 'Error en la solicitud', res.status, body.errors);
    }

    return body?.data !== undefined ? body.data : body;
  },

  get(path, params) {
    const qs = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))}` : '';
    return this.request(`${path}${qs}`);
  },

  post(path, data) {
    return this.request(path, { method: 'POST', body: JSON.stringify(data ?? {}) });
  },

  put(path, data) {
    return this.request(path, { method: 'PUT', body: JSON.stringify(data ?? {}) });
  },

  patch(path, data) {
    return this.request(path, { method: 'PATCH', body: JSON.stringify(data ?? {}) });
  },
};

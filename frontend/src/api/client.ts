const API_BASE = '/api';

export const apiClient = {
  async get(endpoint: string) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`API GET ${endpoint} failed, using store state:`, e);
      return null;
    }
  },

  async post(endpoint: string, data: any) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const dataJson = await res.json().catch(() => null);
      if (!res.ok) {
        const errorMsg = dataJson?.error || dataJson?.detail || `HTTP error! status: ${res.status}`;
        console.warn(`API POST ${endpoint} failed:`, errorMsg);
        return { success: false, error: errorMsg, ...dataJson };
      }
      return dataJson;
    } catch (e: any) {
      console.warn(`API POST ${endpoint} failed:`, e);
      return { success: false, error: e.message || 'Network error' };
    }
  },

  async put(endpoint: string, data: any) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`API PUT ${endpoint} failed:`, e);
      return null;
    }
  },

  async delete(endpoint: string) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return true;
    } catch (e) {
      console.warn(`API DELETE ${endpoint} failed:`, e);
      return false;
    }
  },
};

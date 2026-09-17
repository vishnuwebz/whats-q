const customBase = ((import.meta as any).env?.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '');
export const API_BASE = customBase ? (customBase.endsWith('/api') ? customBase : `${customBase}/api`) : '/api';

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

  async postFormData(endpoint: string, formData: FormData) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      const dataJson = await res.json().catch(() => null);
      if (!res.ok) {
        const errorMsg = dataJson?.error || dataJson?.detail || `HTTP error! status: ${res.status}`;
        console.warn(`API POST FormData ${endpoint} failed:`, errorMsg);
        return { success: false, error: errorMsg, ...dataJson };
      }
      return dataJson;
    } catch (e: any) {
      console.warn(`API POST FormData ${endpoint} failed:`, e);
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
      const dataJson = await res.json().catch(() => null);
      if (!res.ok) {
        const errorMsg = dataJson?.error || dataJson?.detail || `HTTP error! status: ${res.status}`;
        console.warn(`API PUT ${endpoint} failed:`, errorMsg);
        return { success: false, error: errorMsg, ...dataJson };
      }
      return dataJson;
    } catch (e: any) {
      console.warn(`API PUT ${endpoint} failed:`, e);
      return { success: false, error: e.message || 'Network error' };
    }
  },

  async patch(endpoint: string, data: any) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const dataJson = await res.json().catch(() => null);
      if (!res.ok) {
        const errorMsg = dataJson?.error || dataJson?.detail || `HTTP error! status: ${res.status}`;
        return { success: false, error: errorMsg, ...dataJson };
      }
      return dataJson;
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  },

  async delete(endpoint: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        console.warn(`API DELETE ${endpoint} failed:`, res.status);
        return false;
      }
      return true;
    } catch (e) {
      console.warn(`API DELETE ${endpoint} failed:`, e);
      return false;
    }
  },
};

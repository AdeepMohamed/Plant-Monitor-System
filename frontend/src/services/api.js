const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('plantcare_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse(res) {
  if (!res.ok) {
    let errorDetail = 'Request failed';
    try {
      const data = await res.json();
      errorDetail = data.detail || data.message || errorDetail;
    } catch (e) {
      errorDetail = res.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }
  if (res.status === 204) {
    return null;
  }
  return res.json();
}

export const api = {
  // Auth
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return handleResponse(res);
    },
    register: async (email, full_name, password) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name, password })
      });
      return handleResponse(res);
    },
    me: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    updateProfile: async (data) => {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    }
  },

  // Plants
  plants: {
    getAll: async (category) => {
      const url = category ? `${API_BASE}/plants?category=${encodeURIComponent(category)}` : `${API_BASE}/plants`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    getOne: async (plantId) => {
      const res = await fetch(`${API_BASE}/plants/${plantId}`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    create: async (plantData) => {
      const res = await fetch(`${API_BASE}/plants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(plantData)
      });
      return handleResponse(res);
    },
    update: async (plantId, plantData) => {
      const res = await fetch(`${API_BASE}/plants/${plantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(plantData)
      });
      return handleResponse(res);
    },
    delete: async (plantId) => {
      const res = await fetch(`${API_BASE}/plants/${plantId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    getAnalyses: async (plantId) => {
      const res = await fetch(`${API_BASE}/plants/${plantId}/analyses`, { headers: getAuthHeaders() });
      return handleResponse(res);
    }
  },

  // Plant Analyses (Gemini Multimodal)
  analyses: {
    analyze: async (file, plantId = null) => {
      const formData = new FormData();
      formData.append('image', file);
      if (plantId) {
        formData.append('plant_id', plantId);
      }
      const res = await fetch(`${API_BASE}/analyses/analyze`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });
      return handleResponse(res);
    },
    getAll: async (plantId = null) => {
      const url = plantId ? `${API_BASE}/analyses?plant_id=${plantId}` : `${API_BASE}/analyses`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    getOne: async (analysisId) => {
      const res = await fetch(`${API_BASE}/analyses/${analysisId}`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    linkPlant: async (analysisId, plantId) => {
      const formData = new FormData();
      formData.append('plant_id', plantId);
      const res = await fetch(`${API_BASE}/analyses/${analysisId}/link-plant`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: formData
      });
      return handleResponse(res);
    },
    delete: async (analysisId) => {
      const res = await fetch(`${API_BASE}/analyses/${analysisId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    downloadPdfUrl: (analysisId) => `${API_BASE}/analyses/${analysisId}/pdf`
  },

  // AI Assistant Chat
  chat: {
    sendMessage: async (message, sessionId = null, plantId = null) => {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ message, session_id: sessionId, plant_id: plantId })
      });
      return handleResponse(res);
    },
    getSessions: async () => {
      const res = await fetch(`${API_BASE}/chat/sessions`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    getSession: async (sessionId) => {
      const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    deleteSession: async (sessionId) => {
      const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // Dashboard
  dashboard: {
    getStats: async () => {
      const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    getRecentActivity: async () => {
      const res = await fetch(`${API_BASE}/dashboard/recent-activity`, { headers: getAuthHeaders() });
      return handleResponse(res);
    }
  },

  // Health & Gemini Diagnostics
  health: {
    check: async () => {
      const res = await fetch(`${API_BASE}/health`);
      return handleResponse(res);
    },
    getGeminiStatus: async () => {
      const res = await fetch(`${API_BASE}/gemini/status`);
      return handleResponse(res);
    },
    setGeminiKey: async (gemini_api_key) => {
      const res = await fetch(`${API_BASE}/gemini/set-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ gemini_api_key })
      });
      return handleResponse(res);
    }
  }
};

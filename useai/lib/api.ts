import axios from "axios";

// All API calls go through the Next.js server-side proxy to avoid CORS issues.
// The proxy route at /api/proxy/* forwards to the Railway backend.
const api = axios.create({
  baseURL: "/api/proxy",
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("useai_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Auth API ────────────────────────────────────────────
export const authAPI = {
  login: async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },

  signup: async (data: {
    name: string;
    business_name: string;
    email: string;
    password: string;
    website_url?: string;
  }) => {
    const res = await api.post("/auth/signup", {
      name: data.name,
      org_name: data.business_name,
      email: data.email,
      password: data.password,
    });
    return res.data;
  },

  me: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("useai_token");
      localStorage.removeItem("useai_user");
    }
  },
};

// ─── Knowledge Base API ──────────────────────────────────
export const knowledgeAPI = {
  uploadURL: async (url: string) => {
    const res = await api.post("/knowledge/url", { url });
    return res.data;
  },

  addUrl: async (url: string) => {
    const res = await api.post("/knowledge/url", { url });
    return res.data;
  },

  uploadPDF: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/knowledge/pdf", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  uploadPdf: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/knowledge/pdf", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  uploadText: async (text: string) => {
    const res = await api.post("/knowledge/manual", { text });
    return res.data;
  },

  addManual: async (title: string, content: string) => {
    const res = await api.post("/knowledge/manual", { text: `${title}\n\n${content}` });
    return res.data;
  },

  getItems: async () => {
    const res = await api.get("/knowledge/items");
    return res.data;
  },

  deleteItem: async (id: string) => {
    const res = await api.delete(`/knowledge/items/${id}`);
    return res.data;
  },

  getUnanswered: async () => {
    const res = await api.get("/knowledge/unanswered");
    return res.data;
  },

  answerQuestion: async (id: string, answer: string) => {
    const res = await api.post(`/knowledge/unanswered/${id}/answer`, { answer });
    return res.data;
  },

  getStatus: async (id: string) => {
    const res = await api.get(`/knowledge/status/${id}`);
    return res.data;
  },
};

// ─── WhatsApp API ────────────────────────────────────────
export const whatsappAPI = {
  connect: async () => {
    const res = await api.post("/whatsapp/connect");
    return res.data;
  },

  getStatus: async () => {
    const res = await api.get("/whatsapp/status");
    return res.data;
  },
};

// ─── Dashboard API ───────────────────────────────────────
export const dashboardAPI = {
  getStats: async () => {
    const res = await api.get("/dashboard/stats");
    return res.data;
  },

  getAnalytics: async () => {
    const res = await api.get("/dashboard/analytics");
    return res.data;
  },

  getConversations: async (params?: { limit?: number }) => {
    const res = await api.get("/dashboard/conversations", { params });
    return res.data;
  },

  getMessages: async (conversationId: string) => {
    const res = await api.get(
      `/dashboard/conversations/${conversationId}/messages`
    );
    return res.data;
  },

  assignConversation: async (conversationId: string) => {
    const res = await api.post(
      `/dashboard/conversations/${conversationId}/assign`
    );
    return res.data;
  },
};

// ─── Campaign API ────────────────────────────────────────
export const campaignAPI = {
  getAll: async () => {
    const res = await api.get("/campaigns");
    return res.data;
  },

  create: async (data: any) => {
    const res = await api.post("/campaigns", data);
    return res.data;
  },
};

export default api;

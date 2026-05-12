import { create } from "zustand";
import api from "../api/axios.js";

const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/register", { name, email, password });
      set({ user: res.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message, loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/login", { email, password });
      set({ user: res.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message, loading: false });
    }
  },

  logout: async () => {
    await api.post("/auth/logout");
    set({ user: null });
  },

  getMe: async () => {
    try {
      const res = await api.get("/auth/me");
      set({ user: res.data });
    } catch {
      set({ user: null });
    }
  },
}));

export default useAuthStore;
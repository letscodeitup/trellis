import { create } from "zustand";
import api from "../api/axios.js";

const useBoardStore = create((set) => ({
  orgs: [],
  boards: [],
  userRole: null,
  loading: false,
  error: null,

  getOrgs: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/orgs");
      set({ orgs: res.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message, loading: false });
    }
  },

  createOrg: async (name) => {
    try {
      const res = await api.post("/orgs", { name });
      set((state) => ({ orgs: [...state.orgs, res.data] }));
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message });
    }
  },

  getBoards: async (orgId) => {
    set({ loading: true });
    try {
      const res = await api.get(`/boards/${orgId}`);
      set({ boards: res.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message, loading: false });
    }
  },

  createBoard: async (orgId, data) => {
    try {
      const res = await api.post(`/boards/${orgId}`, data);
      set((state) => ({ boards: [...state.boards, res.data] }));
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message });
    }
  },

  deleteBoard: async (orgId, boardId) => {
    try {
      await api.delete(`/boards/${orgId}/${boardId}`);
      set((state) => ({
        boards: state.boards.filter((b) => b._id !== boardId),
      }));
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message });
      return false;
    }
  },

  setUserRole: (role) => set({ userRole: role }),
}));

export default useBoardStore;
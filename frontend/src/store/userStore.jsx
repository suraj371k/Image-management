import axios from "axios";
import { create } from "zustand";
import { backendUrl } from "../lib/backendUrl";

const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true, 
});

export const useUserStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  signupUser: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post("/api/user/register", data);
      set({ user: response.data, error: null, loading: false });
      return response.data; 
    } catch (error) {
      console.log("Error in signup:", error);
      const errorMessage = error.response?.data?.message || error.message || "Signup failed";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage); 
    }
  },

  loginUser: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post("/api/user/login", data);
      set({ user: response.data.user, error: null, loading: false });
      return response.data.user;
    } catch (error) {
      console.error("Error in login user ", error);
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  logoutUser: async () => {
    try {
      set({ loading: true, error: null });
      await api.post("/api/user/logout", {});
      set({ user: null, loading: false, error: null });
    } catch (error) {
      console.error("Error in logout user", error);
      set({ loading: false });
      throw error;
    }
  },

  fetchProfile: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get("/api/user/profile");
      set({ user: response.data.user, loading: false, error: null });
      return response.data.user;
    } catch (error) {
      console.error("Error fetching profile", error);
      if (error.response?.status === 401) {
        set({ user: null, loading: false, error: null });
      } else {
        const errorMessage = error.response?.data?.message || error.message || "Fetch profile failed";
        set({ loading: false, error: errorMessage });
      }
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearUser: () => {
    set({ user: null });
  }

}));
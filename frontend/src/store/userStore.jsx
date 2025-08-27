import axios from "axios";
import { create } from "zustand";
import { backendUrl } from "../lib/backendUrl";

export const useUserStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  signupUser: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post(
        `${backendUrl}/api/user/register`,
        data,
        { withCredentials: true }
      );
      set({ user: response.data, error: null, loading: false });
    } catch (error) {
      console.log("Error in signup:", error);
      set({
        loading: false,
        error:
          error.response?.data?.message || error.message || "Signup failed",
      });
      throw error;
    }
  },

  loginUser: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post(`${backendUrl}/api/user/login`, data, {
        withCredentials: true,
      });
      set({ user: response.data, error: null, loading: false });
    } catch (error) {
      console.error("Error in login user ", error);
      set({
        loading: false,
        error: error.response?.data?.message || error.message || "login failed",
      });
      throw error;
    }
  },

  logoutUser: async () => {
    try {
      set({ loading: true, error: null });
      await axios.post(
        `${backendUrl}/api/user/logout`,
        {},
        { withCredentials: true }
      );
      set({ user: null, loading: false, error: null });
    } catch (error) {
      console.error("Error in logout user", error);
      set({
        loading: false,
        error: error.response?.data?.message || error.message || "Logout failed",
      });
      throw error;
    }
  },

  fetchProfile: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get(
        `${backendUrl}/api/user/profile`,
        { withCredentials: true }
      );
      set({ user: response.data.user, loading: false, error: null });
      return response.data.user;
    } catch (error) {
      console.error("Error fetching profile", error);
      set({
        loading: false,
        error: error.response?.data?.message || error.message || "Fetch profile failed",
      });
      throw error;
    }
  },


}));

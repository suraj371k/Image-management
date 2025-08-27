import { create } from "zustand";
import axios from "axios";
import { backendUrl } from "../lib/backendUrl";

axios.defaults.withCredentials = true;


const useImageStore = create((set, get) => ({
  images: [],
  loading: false,
  error: null,
  pagination: {
    totalImages: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
  },

  // Upload Image
  uploadImage: async (formData) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post(`${backendUrl}/api/images/upload`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((state) => ({
        images: [res.data.image, ...state.images], // add new image in list
        loading: false,
      }));
      return res.data.image;
    } catch (error) {
      console.error("Upload image error:", error);
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  // Get User Images with Pagination
  getUserImages: async (page = 1, limit = 10) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(
        `${backendUrl}/api/images?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );
      set({
        images: res.data.images,
        pagination: res.data.pagination,
        loading: false,
      });
    } catch (error) {
      console.error("Get images error:", error);
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  // Search Images
  searchImages: async (query, page = 1, limit = 10) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(
        `${backendUrl}/api/images/search?query=${query}&page=${page}&limit=${limit}`,
        { withCredentials: true }
      );
      set({
        images: res.data.images,
        pagination: res.data.pagination,
        loading: false,
      });
    } catch (error) {
      console.error("Search images error:", error);
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  // Delete Image
  deleteImage: async (id) => {
    try {
      set({ loading: true, error: null });
      await axios.delete(`${backendUrl}/api/images/${id}`, {
        withCredentials: true,
      });
      set((state) => ({
        images: state.images.filter((img) => img._id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error("Delete image error:", error);
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  // Download Image
  downloadImage: async (id) => {
    try {
      const res = await axios.get(`${backendUrl}/api/images/download/${id}`, {
        withCredentials: true,
        responseType: "blob",
      });

      // create a blob download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;

      // Try to get filename from headers, fallback to "download.jpg"
      const contentDisposition = res.headers["content-disposition"];
      let fileName = "download.jpg";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match?.[1]) fileName = match[1];
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download image error:", error);
      set({ error: error.response?.data?.message || error.message });
    }
  },
}));

export default useImageStore;

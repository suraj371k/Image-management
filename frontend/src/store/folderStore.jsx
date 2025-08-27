import { create } from "zustand";
import axios from "axios";
import { backendUrl } from "../lib/backendUrl";
axios.defaults.withCredentials = true;

const useFolderStore = create((set, get) => ({
  folders: [],
  folderTree: [],
  currentFolder: {},
  currentFolderId: null,
  subfolders: [],
  images: [],
  loading: false,
  error: null,

  expandedFolders: {}, // Track which folders are expanded
  folderContents: {}, // Track contents of each folder
  selectedFolderId: null, // Track the currently selected folder

  // ✅ Set selected folder
  setSelectedFolder: (folderId) => {
    set({ selectedFolderId: folderId });
  },

  // ✅ Clear selected folder
  clearSelectedFolder: () => {
    set({ selectedFolderId: null });
  },

  createFolder: async (data) => {
    try {
      const { selectedFolderId } = get();
      set({ loading: true, error: null });

      // Prepare the folder data with the correct parent
      const folderData = {
        name: data.name,
        parent: selectedFolderId || null, // Use selected folder as parent, or null for root
      };

      console.log("Creating folder with data:", folderData); // Debug log

      const res = await axios.post(`${backendUrl}/api/folder`, folderData, {
        withCredentials: true,
      });

      console.log("Folder created successfully:", res.data); // Debug log

      // Update the UI based on where the folder was created
      if (selectedFolderId) {
        // If created inside a folder, refresh that folder's contents
        await get().getFolderChildren(selectedFolderId);
      } else {
        // If created at root, refresh the root folders list
        await get().getUserFolders();
      }

      set({ loading: false });
      return res.data.folder;
    } catch (err) {
      console.error("Error creating folder:", err);
      set({
        error: err.response?.data?.message || "Error creating folder",
        loading: false,
      });
      throw err; // Re-throw to handle in component
    }
  },
  // ✅ Toggle folder expansion
  toggleFolderExpansion: async (folderId) => {
    const { expandedFolders, getFolderChildren } = get();
    const isCurrentlyExpanded = expandedFolders[folderId];

    // If folder is not expanded, fetch its children
    if (!isCurrentlyExpanded) {
      await getFolderChildren(folderId);
    }

    set({
      expandedFolders: {
        ...expandedFolders,
        [folderId]: !isCurrentlyExpanded,
      },
    });
  },

  getUserFolders: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`${backendUrl}/api/folder`, {
        withCredentials: true,
      });
      set({ folders: res.data.folders, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Error fetching folders",
        loading: false,
      });
    }
  },

  updateFolder: async (id, data) => {
    try {
      set({ loading: true, error: null, currentFolderId: id }); // ✅ set folderId
      const res = await axios.put(`${backendUrl}/api/folder/${id}`, data, {
        withCredentials: true,
      });
      set((state) => ({
        folders: state.folders.map((f) => (f._id === id ? res.data.folder : f)),
        currentFolder: res.data.folder,
        loading: false,
      }));
      return res.data.folder;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Error updating folder",
        loading: false,
      });
    }
  },

  deleteFolder: async (id) => {
    try {
      set({ loading: true, error: null });
      await axios.delete(`${backendUrl}/api/folder/${id}`, {
        withCredentials: true,
      });
      set((state) => ({
        folders: state.folders.filter((f) => f._id !== id),
        loading: false,
        // reset if current folder is deleted
        currentFolderId:
          state.currentFolderId === id ? null : state.currentFolderId,
        currentFolder: state.currentFolderId === id ? {} : state.currentFolder,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || "Error deleting folder",
        loading: false,
      });
    }
  },

  getFolderChildren: async (id) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`${backendUrl}/api/folder/${id}/children`, {
        withCredentials: true,
      });

      const subfoldersWithCounts = res.data.subfolders.map((folder) => ({
        ...folder,
        subfolderCount: folder.subfolderCount || 0,
        imageCount: folder.imageCount || 0,
      }));

      set((state) => ({
        folderContents: {
          ...state.folderContents,
          [id]: {
            subfolders: subfoldersWithCounts,
            images: res.data.images,
          },
        },
        loading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || "Error fetching children",
        loading: false,
      });
    }
  },

  getFolder: async (id) => {
    try {
      set({ loading: true, error: null, currentFolderId: id });
      const res = await axios.get(`${backendUrl}/api/folder/${id}`, {
        withCredentials: true,
      });

      // Enhance folder with count information if not provided by backend
      const folderWithCounts = {
        ...res.data.folder,
        subfolderCount: res.data.folder.subfolderCount || 0,
        imageCount: res.data.folder.imageCount || 0,
      };

      set({ currentFolder: folderWithCounts, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Error fetching folder",
        loading: false,
      });
    }
  },
}));

export default useFolderStore;

// FolderList.jsx
import React, { useEffect, useState } from "react";
import useFolderStore from "../../store/folderStore";
import FolderItem from "./FolderItems";
import { 
  Folder, 
  Loader2,
  AlertCircle,
  FolderPlus,
  Plus,
  X
} from "lucide-react";

const FolderList = () => {
  const {
    getUserFolders,
    loading,
    error,
    folders,
    selectedFolderId,
    clearSelectedFolder,
    createFolder,
  } = useFolderStore();

  const [showCreateFolderInput, setShowCreateFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    getUserFolders();
  }, [getUserFolders]);

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      try {
        await createFolder({ name: newFolderName.trim() });
        setShowCreateFolderInput(false);
        setNewFolderName("");
        // Refresh the folders list to show the new folder
        await getUserFolders();
      } catch (error) {
        console.error("Failed to create folder:", error);
      }
    } else {
      setShowCreateFolderInput(false);
    }
  };

  const handleCreateFolderKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCreateFolder();
    } else if (e.key === 'Escape') {
      setShowCreateFolderInput(false);
      setNewFolderName("");
    }
  };

  if (loading && !folders.length) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin mr-2" />
      Loading folders...
    </div>
  );
  
  if (error) return (
    <div className="flex items-center p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200">
      <AlertCircle className="w-5 h-5 mr-2" />
      Error: {error}
    </div>
  );

  return (
    <div className="bg-gray-900 h-auto lg:min-h-screen text-gray-100 p-6 rounded-lg shadow-xl border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <Folder className="w-5 h-5 mr-2 text-blue-400" />
          Folders ({folders.length})
        </h2>
        
        {/* New Folder Button */}
        {!showCreateFolderInput && (
          <button
            onClick={() => setShowCreateFolderInput(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors text-sm"
          >
            <FolderPlus className="w-4 h-4" />
            New
          </button>
        )}
      </div>

      {/* Create Folder Input */}
      {showCreateFolderInput && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-gray-800 border border-gray-700 rounded-lg">
          <FolderPlus className="w-4 h-4 text-blue-400" />
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onBlur={handleCreateFolder}
            onKeyDown={handleCreateFolderKeyPress}
            placeholder="Enter folder name"
            autoFocus
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm flex-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreateFolder}
            className="p-2 text-green-400 hover:text-green-300 rounded hover:bg-gray-700"
            title="Create folder"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setShowCreateFolderInput(false);
              setNewFolderName("");
            }}
            className="p-2 text-red-400 hover:text-red-300 rounded hover:bg-gray-700"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {selectedFolderId && (
        <div className="flex items-center justify-between p-3 mb-4 bg-gray-800 rounded-lg">
          <span className="text-sm text-blue-300">A folder is selected</span>
          <button 
            onClick={clearSelectedFolder}
            className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
          >
            Clear Selection
          </button>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {folders.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-500">
            <Folder className="w-12 h-12 mx-auto mb-2 text-gray-600" />
            <p>No folders yet. Create your first folder!</p>
          </div>
        ) : (
          folders.map((folder) => (
            <FolderItem key={folder._id} folder={folder} />
          ))
        )}
      </div>
    </div>
  );
};

export default FolderList;
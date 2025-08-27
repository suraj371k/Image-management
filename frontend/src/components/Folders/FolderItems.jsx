// FolderItem.jsx
import React, { useState, useRef, useEffect } from "react";
import useFolderStore from "../../store/folderStore";
import useImageStore from "../../store/imageStore";
import {
  Folder,
  FolderOpen,
  Image as ImageIcon,
  MoreVertical,
  Edit,
  Trash2,
  Upload,
  ChevronRight,
  ChevronDown,
  File,
  Loader2,
  AlertCircle,
  Plus,
  FolderPlus
} from "lucide-react";

const FolderItem = ({ folder, depth = 0, isRoot = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [showImages, setShowImages] = useState(false);
  const [showCreateFolderInput, setShowCreateFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const menuRef = useRef(null);
  const renameInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const createFolderInputRef = useRef(null);
  
  const { 
    toggleFolderExpansion, 
    expandedFolders, 
    folderContents,
    loading,
    selectedFolderId,
    setSelectedFolder,
    deleteFolder,
    createFolder,
    createFolderInside,
    clearSelectedFolder,
    updateFolder,
    getUserFolders
  } = useFolderStore();

  const {
    uploadImage,
    loading: imageLoading,
    error: imageError
  } = useImageStore();
  
  const isExpanded = expandedFolders[folder._id];
  const isSelected = selectedFolderId === folder._id;
  const children = folderContents[folder._id]?.subfolders || [];
  const folderImages = folder.images || [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when renaming or creating folder
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
    
    if (showCreateFolderInput && createFolderInputRef.current) {
      createFolderInputRef.current.focus();
    }
  }, [isRenaming, showCreateFolderInput]);

  const handleFolderClick = (e) => {
    if (e.target.closest('.folder-menu') || e.target.closest('input')) {
      return;
    }
    toggleFolderExpansion(folder._id);
    setSelectedFolder(folder._id);
    setShowImages(!showImages);
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleRename = async () => {
    if (newName.trim() && newName !== folder.name) {
      try {
        await updateFolder(folder._id, { name: newName.trim() });
        setIsRenaming(false);
      } catch (error) {
        console.error("Failed to rename folder:", error);
      }
    } else {
      setIsRenaming(false);
      setNewName(folder.name);
    }
  };

  const handleRenameKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setNewName(folder.name);
    }
  };

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

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${folder.name}" and all its contents?`)) {
      try {
        await deleteFolder(folder._id);
        if (selectedFolderId === folder._id) {
          clearSelectedFolder();
        }
        setIsMenuOpen(false);
      } catch (error) {
        console.error("Failed to delete folder:", error);
      }
    }
  };

  const handleCreateInside = async () => {
    const folderName = prompt("Enter name for new folder:");
    if (folderName && folderName.trim()) {
      try {
        await createFolderInside(folder._id, folderName.trim());
        setIsMenuOpen(false);
      } catch (error) {
        console.error("Failed to create folder:", error);
      }
    }
  };

  const handleImageUpload = (e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
    setIsMenuOpen(false);
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let file of files) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folderId', folder._id);

      try {
        await uploadImage(formData);
      } catch (error) {
        console.error("Failed to upload image:", error);
      }
    }

    e.target.value = '';
  };

  return (
    <div className={`mb-1 ${isRoot ? '' : `ml-${depth * 4}`}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Create Folder Input (only shown for root) */}
      {isRoot && showCreateFolderInput && (
        <div className="flex items-center gap-2 p-3 mb-2 bg-gray-800 border border-gray-700 rounded-lg">
          <FolderPlus className="w-4 h-4 text-blue-400" />
          <input
            ref={createFolderInputRef}
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onBlur={handleCreateFolder}
            onKeyDown={handleCreateFolderKeyPress}
            placeholder="Enter folder name"
            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm flex-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreateFolder}
            className="p-1 text-green-400 hover:text-green-300"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setShowCreateFolderInput(false);
              setNewFolderName("");
            }}
            className="p-1 text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* New Folder Button (only shown for root) */}
      {isRoot && !showCreateFolderInput && (
        <button
          onClick={() => setShowCreateFolderInput(true)}
          className="flex items-center gap-2 p-3 mb-2 w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors text-gray-200"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Folder</span>
        </button>
      )}

      {/* Folder Card */}
      <div 
        className={`folder-card cursor-pointer p-3 rounded-lg transition-all duration-200 
          flex items-center justify-between gap-2
          ${isSelected ? 'bg-blue-900/30 border border-blue-700' : 'bg-gray-800 border border-gray-700'} 
          hover:bg-gray-700/50 hover:border-gray-600`}
        onClick={handleFolderClick}
      >
        {/* Folder Icon and Name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-blue-400">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
          <span className="text-blue-400">
            {isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
          </span>
          
          {isRenaming ? (
            <input
              ref={renameInputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleRenameKeyPress}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm flex-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <span className="font-medium truncate text-gray-100">
              {folder.name}
            </span>
          )}
        </div>

        {/* Folder Info and Menu */}
        <div className="flex items-center gap-2">
          {/* Folder counts */}
          <div className="flex gap-2 text-xs">
            {folder.children && folder.children.length > 0 && (
              <span className="bg-gray-700 px-2 py-1 rounded text-gray-300 flex items-center">
                <Folder className="w-3 h-3 mr-1" />
                {folder.children.length}
              </span>
            )}
            {folderImages.length > 0 && (
              <span className="bg-blue-900/30 px-2 py-1 rounded text-blue-300 flex items-center">
                <ImageIcon className="w-3 h-3 mr-1" />
                {folderImages.length}
              </span>
            )}
          </div>

          {/* Three-dot menu */}
          <div ref={menuRef} className="folder-menu relative">
            <button
              onClick={handleMenuToggle}
              className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 focus:outline-none transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 min-w-40 py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRenaming(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm text-gray-200 flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Rename
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateInside();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm text-gray-200 flex items-center border-t border-gray-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Folder Inside
                </button>

                <button
                  onClick={handleImageUpload}
                  disabled={imageLoading}
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm text-gray-200 flex items-center border-t border-gray-700 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {imageLoading ? 'Uploading...' : 'Upload Images'}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-red-900/20 text-sm text-red-400 flex items-center border-t border-gray-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
      {imageError && (
        <div className="mt-2 p-2 bg-red-900/20 border border-red-800 rounded text-red-300 text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          {imageError}
        </div>
      )}

      {/* Loading indicator */}
      {(loading || imageLoading) && isExpanded && (
        <div className="p-2 text-gray-400 text-sm flex items-center">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          {imageLoading ? 'Uploading images...' : 'Loading...'}
        </div>
      )}

      {/* Images in this folder */}
      {isExpanded && showImages && folderImages.length > 0 && (
        <div className="mt-2 ml-6 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
            <ImageIcon className="w-4 h-4 mr-2 text-blue-400" />
            Images in this folder:
          </h4>
          <div className="space-y-1">
            {folderImages.map((image, index) => (
              <div 
                key={image._id || index} 
                className="flex items-center gap-2 p-2 bg-gray-700/30 rounded border border-gray-600 text-sm hover:bg-gray-700/50 transition-colors text-gray-300"
              >
                <File className="w-4 h-4 text-blue-400" />
                <span className="flex-1 truncate">
                  {image.filename || image.name || `Image ${index + 1}`}
                </span>
                {image.size && (
                  <span className="text-xs text-gray-500">
                    {(image.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Child folders */}
      {isExpanded && children.length > 0 && (
        <div className="mt-1">
          {children.map((subfolder) => (
            <FolderItem 
              key={subfolder._id} 
              folder={subfolder} 
              depth={depth + 1} 
            />
          ))}
        </div>
      )}

      {/* No content message */}
      {isExpanded && children.length === 0 && folderImages.length === 0 && !loading && (
        <div className="mt-2 ml-6 p-3 text-gray-500 text-sm italic bg-gray-800/30 rounded border border-gray-700">
          This folder is empty. Use the menu to add folders or images.
        </div>
      )}
    </div>
  );
};

export default FolderItem;
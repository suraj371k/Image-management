import React, { useState, useEffect, useRef } from "react";
import useImageStore from "../store/imageStore";
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
  Upload,
  Grid,
  List,
  CheckSquare,
  Square,
  Trash2,
  Download,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Plus,
  Check,
  FileText,
} from "lucide-react";

const ImageGallery = () => {
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const fileInputRef = useRef(null);

  const {
    images,
    loading,
    error,
    pagination,
    getUserImages,
    deleteImage,
    downloadImage,
    searchImages,
  } = useImageStore();

  useEffect(() => {
    getUserImages(1, 12); // Load first page with 12 images
  }, [getUserImages]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      getUserImages(1, 12);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    await searchImages(searchQuery, 1, 12);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    getUserImages(1, 12);
  };

  const handlePageChange = (newPage) => {
    if (isSearching) {
      searchImages(searchQuery, newPage, 12);
    } else {
      getUserImages(newPage, 12);
    }
  };



  const handleImageSelect = (imageId) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
      toast.success("All images deselected");
    } else {
      setSelectedImages(new Set(images.map((img) => img._id)));
      toast.success("All images selected");
    }
  };

  const handleDeleteClick = (image) => {
    setImageToDelete(image);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (imageToDelete) {
      try {
        await deleteImage(imageToDelete._id);
        setShowDeleteModal(false);
        setImageToDelete(null);
        setSelectedImages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(imageToDelete._id);
          return newSet;
        });
        toast.success("Image deleted successfully");
      } catch (error) {
        toast.error("Failed to delete image");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return;

    if (window.confirm(`Delete ${selectedImages.size} selected images?`)) {
      try {
        for (const imageId of selectedImages) {
          await deleteImage(imageId);
        }
        setSelectedImages(new Set());
        toast.success(`Deleted ${selectedImages.size} images successfully`);
      } catch (error) {
        toast.error("Failed to delete some images");
      }
    }
  };

  const handleDownload = async (imageId) => {
    try {
      await downloadImage(imageId);
      toast.success("Download started");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && images.length === 0) {
    return (
      <div className="flex items-center  justify-center min-h-64 bg-gray-900 rounded-lg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-400">Loading images...</p>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1f2937",
              color: "#fff",
              border: "1px solid #374151",
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6  bg-gray-900 text-gray-100 min-h-screen">
 
      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1f2937",
            color: "#fff",
            border: "1px solid #374151",
          },
          success: {
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold flex items-center">
            <ImageIcon className="w-8 h-8 mr-2 text-blue-400" />
            My Images
            <span className="ml-2 text-lg font-normal text-gray-400">
              ({pagination.totalImages} total)
            </span>
          </h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search images by filename..."
              className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Search className="w-5 h-5" />
            Search
          </button>
        </form>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-700 overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Select All */}
            {images.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {selectedImages.size === images.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {selectedImages.size === images.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedImages.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {selectedImages.size} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {loading && images.length > 0 && (
        <div className="mb-4 flex items-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </div>
      )}

      {/* Images Grid/List */}
      {images.length === 0 && !loading ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            No images found
          </h3>
          <p className="text-gray-500 mb-4">
            {isSearching
              ? "Try adjusting your search terms"
              : "Upload your first images to get started"}
          </p>
          {!isSearching && (
            <p>s</p>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {images.map((image) => (
            <div
              key={image._id}
              className={`group relative ${
                viewMode === "grid"
                  ? "bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all border border-gray-700 overflow-hidden"
                  : "bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4 flex items-center gap-4"
              }`}
            >
              {/* Selection Checkbox */}
              <div
                className={`absolute ${
                  viewMode === "grid"
                    ? "top-2 left-2"
                    : "left-2 top-1/2 transform -translate-y-1/2"
                } z-10`}
              >
                <button
                  onClick={() => handleImageSelect(image._id)}
                  className={`p-1 rounded ${
                    selectedImages.has(image._id)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-900/80 text-transparent hover:text-gray-300 group-hover:text-gray-300"
                  }`}
                >
                  {selectedImages.has(image._id) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </div>

              {viewMode === "grid" ? (
                // Grid View
                <>
                  {/* Image */}
                  <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-700">
                    <img
                      src={
                        image.url || image.path || "/api/placeholder/300/300"
                      }
                      alt={image.name || "Image"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9Ii82YjcyODAiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=";
                      }}
                    />
                  </div>

                  {/* Image Info */}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-100 truncate mb-1 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0" />
                      <span className="truncate">
                        {image.name || `Image ${image._id.slice(-6)}`}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">
                      {image.size ? formatFileSize(image.size) : "Unknown size"}
                      {image.createdAt && ` • ${formatDate(image.createdAt)}`}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(image._id)}
                        className="flex-1 bg-blue-900/50 hover:bg-blue-800 text-blue-300 py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => handleDeleteClick(image)}
                        className="bg-red-900/50 hover:bg-red-800 text-red-300 p-2 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // List View
                <>
                  {/* Thumbnail */}
                  <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-700 ml-6">
                    <img
                      src={
                        image.url || image.path || "/api/placeholder/100/100"
                      }
                      alt={image.filename || "Image"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzZiNzI4MCIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+PC9zdmc+";
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-100 truncate flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0" />
                      <span className="truncate">
                        {image.filename || `Image ${image._id.slice(-6)}`}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-400">
                      {image.size ? formatFileSize(image.size) : "Unknown size"}
                      {image.createdAt &&
                        ` • Uploaded ${formatDate(image.createdAt)}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(image._id)}
                      className="bg-blue-900/50 hover:bg-blue-800 text-blue-300 py-2 px-4 rounded text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDeleteClick(image)}
                      className="bg-red-900/50 hover:bg-red-800 text-red-300 p-2 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1 || loading}
            className="px-3 py-2 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {[...Array(pagination.totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              disabled={loading}
              className={`px-3 py-2 rounded-lg ${
                pagination.currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "border border-gray-700 hover:bg-gray-800"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={
              pagination.currentPage === pagination.totalPages || loading
            }
            className="px-3 py-2 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && imageToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-gray-100 mb-2">
              Delete Image
            </h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to delete "
              {imageToDelete.filename || "this image"}"? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setImageToDelete(null);
                }}
                className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;

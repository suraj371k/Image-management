import { useState } from "react"
import useFolderStore from "../../store/folderStore"

const CreateFolder = () => {
  const [folderName, setFolderName] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const { createFolder, selectedFolderId, clearSelectedFolder, loading, folders, folderContents } = useFolderStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!folderName.trim()) return

    try {
      await createFolder({ name: folderName.trim() })
      setFolderName("")
    } catch (error) {
      console.error("Failed to create folder:", error)
    }
  }

  // Find the selected folder object for display
  const selectedFolder = selectedFolderId
    ? folders.find((f) => f._id === selectedFolderId) ||
      Object.values(folderContents)
        .flatMap((fc) => fc.subfolders)
        .find((f) => f._id === selectedFolderId)
    : null

  return (
    <div className="bg-black  p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Create New Folder</h1>
          <p className="text-gray-400 text-lg">Organize your files with a new folder</p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="folderName" className="block text-sm font-medium text-gray-300 mb-3">
                Folder Name
              </label>
              <div className="relative">
                <input
                  id="folderName"
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Enter a descriptive folder name..."
                  disabled={loading}
                  className={`
                    w-full px-4 py-4 bg-gray-800/50 border-2 rounded-xl text-white placeholder-gray-500
                    transition-all duration-300 ease-in-out
                    focus:outline-none focus:ring-0 focus:border-blue-500 focus:bg-gray-800/70
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${isFocused ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-gray-700"}
                    hover:border-gray-600 hover:bg-gray-800/60
                  `}
                />
                {/* Focus indicator */}
                <div
                  className={`
                  absolute inset-0 rounded-xl pointer-events-none
                  transition-all duration-300
                  ${isFocused ? "ring-2 ring-blue-500/30" : ""}
                `}
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading || !folderName.trim()}
              className={`
                w-full py-4 px-6 rounded-xl font-semibold text-white
                transition-all duration-300 ease-in-out transform
                focus:outline-none focus:ring-4 focus:ring-blue-500/30
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                ${
                  loading || !folderName.trim()
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
                }
              `}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Folder...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create Folder</span>
                </div>
              )}
            </button>
          </form>

          {/* Location Info Section */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="bg-gray-800/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Location
              </h3>

              {selectedFolderId ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-gray-300">
                      Creating inside:{" "}
                      <span className="text-white font-medium">"{selectedFolder?.name || "selected folder"}"</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelectedFolder}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-orange-400 bg-orange-400/10 border border-orange-400/20 rounded-lg hover:bg-orange-400/20 hover:border-orange-400/30 transition-all duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                      />
                    </svg>
                    Create at Root Instead
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-gray-300">
                      Creating at: <span className="text-white font-medium">Root level</span>
                    </span>
                  </div>
                  <div className="flex items-start space-x-2 text-sm text-gray-500">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Tip: Right-click on any folder to select it as the parent location</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  )
}

export default CreateFolder

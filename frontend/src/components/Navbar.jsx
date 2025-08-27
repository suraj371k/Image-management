import React, { useState } from "react";
import {
  Menu,
  X,
  Search,
  User,
  Settings,
  LogOut,
  ImageIcon,
  Folder,
  LogOutIcon,
  LogIn,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../store/userStore";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading, logoutUser } = useUserStore();
  return (
    <nav className="bg-black text-gray-200 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <Link to={"/"} className="flex-shrink-0 flex items-center">
              <ImageIcon className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-semibold">ImageVault</span>
            </Link>
          </div>

          {/* Right menu items */}
          <div className="hidden md:block">
            {user ? (
              <button
                onClick={() => logoutUser()}
                className="flex gap-1 items-center"
              >
                <LogOutIcon /> Logout
              </button>
            ) : (
              <Link className="flex gap-1 items-center" to={"/"}>
                {" "}
                <LogIn /> Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a
              href="#"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white bg-gray-900"
            >
              <ImageIcon className="h-5 w-5 mr-2" />
              Gallery
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <Folder className="h-5 w-5 mr-2" />
              Folders
            </a>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-800">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">
                  User Name
                </div>
                <div className="text-sm font-medium text-gray-400">
                  user@example.com
                </div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <a
                href="#"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </a>
              <a
                href="#"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign out
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

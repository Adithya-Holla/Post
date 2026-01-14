/**
 * Navbar Component
 * Main navigation bar with auth status and user menu
 */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location]);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
              Post
            </span>
          </Link>

          {/* Navigation Links & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Home Link */}
            <Link
              to="/"
              className={`relative px-3 py-2 rounded-lg font-medium transition-all duration-200 group ${
                isActive('/')
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <span className="relative z-10">Home</span>
              <span className={`absolute inset-0 bg-gray-900 rounded-lg transition-all duration-200 ${
                isActive('/') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}></span>
            </Link>

            {isAuthenticated ? (
              /* Profile Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-700"
                  />
                  <span className="text-gray-700 dark:text-gray-300 font-medium hidden sm:block">
                    {user.username}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden animate-slideDown">
                    <div className="p-4 border-b border-gray-800">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200 group"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-gray-800 transition-colors duration-200 group cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Auth Buttons */
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

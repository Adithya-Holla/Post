/**
 * Modal Component
 * Reusable modal dialog
 */
import React from 'react';

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 transition-opacity duration-200"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-gray-900 rounded-xl shadow-lg max-w-md w-full p-6 border border-gray-800 transform transition-all duration-200 animate-slideUp">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Title */}
          {title && (
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pr-8">{title}</h3>
          )}

          {/* Content */}
          <div className="text-gray-700 dark:text-gray-300">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default Modal;

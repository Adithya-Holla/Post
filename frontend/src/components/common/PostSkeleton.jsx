/**
 * PostSkeleton Component
 * Loading skeleton for post cards
 */
import React from 'react';

function PostSkeleton() {
  return (
    <div className="bg-gray-900 rounded-xl p-6 mb-4 border border-gray-800 animate-pulse">
      {/* Header */}
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/6"></div>
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-3 mb-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/6"></div>
      </div>
      
      {/* Action Bar */}
      <div className="flex items-center space-x-6 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-20"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-20"></div>
      </div>
    </div>
  );
}

export default PostSkeleton;

/**
 * AvatarUpload Component
 * Allows users to upload and preview their profile picture
 */
import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

function AvatarUpload() {
  const { user, updateAvatar } = useAuth();
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Supported: JPG, PNG, WEBP, HEIC, HEIF.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size too large. Maximum size is 5MB.');
      return;
    }

    setError('');
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    const result = await updateAvatar(selectedFile);
    
    if (result.success) {
      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      setError(result.message || 'Upload failed');
    }

    setUploading(false);
  };

  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Picture</h2>
      
      <div className="flex items-center space-x-6">
        {/* Current/Preview Avatar */}
        <div className="relative">
          <img
            src={preview || user.avatarUrl}
            alt={user.username}
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
          />
          {preview && (
            <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          {!selectedFile ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                onChange={handleFileSelect}
                className="sr-only"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
              >
                Choose Photo
              </label>
              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG, or WEBP. Max size 5MB.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Selected:</span> {selectedFile.name}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={uploading}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AvatarUpload;

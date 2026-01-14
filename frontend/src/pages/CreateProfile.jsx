/**
 * Create Profile Page
 * Shown after registration to upload avatar (optional) and continue to home.
 */
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImageCropper from '../components/common/ImageCropper';

function CreateProfile() {
  const { user, loading: authLoading, updateAvatar } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Supported: JPG, PNG, WEBP, HEIC, HEIF.');
      setTimeout(() => setUploadError(''), 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size too large. Maximum size is 5MB.');
      setTimeout(() => setUploadError(''), 3000);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageToCrop(objectUrl);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedFile) => {
    setShowCropper(false);
    if (imageToCrop) {
      try {
        URL.revokeObjectURL(imageToCrop);
      } catch {
        // ignore
      }
    }
    setImageToCrop(null);
    setUploading(true);
    setUploadError('');

    const result = await updateAvatar(croppedFile);

    if (!result.success) {
      setUploadError(result.message || 'Upload failed');
      setTimeout(() => setUploadError(''), 3000);
    } else {
      navigate('/');
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    if (imageToCrop) {
      try {
        URL.revokeObjectURL(imageToCrop);
      } catch {
        // ignore
      }
    }
    setImageToCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleContinue = () => {
    navigate('/');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-10 max-w-lg">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Create your profile</h1>
          <p className="text-gray-400 text-sm mb-6">Upload a profile picture (optional) to finish setup.</p>

          <div className="flex flex-col items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
              onChange={handleFileSelect}
              className="sr-only"
            />

            <button
              type="button"
              onClick={handleImageClick}
              className="relative group"
              disabled={uploading}
              aria-label="Upload profile picture"
            >
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-28 h-28 rounded-full object-cover border-2 border-gray-800 ring-2 ring-gray-800"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-semibold">{uploading ? 'Uploading…' : 'Change'}</span>
              </div>
            </button>

            {uploadError && (
              <div className="w-full mt-4 bg-red-900/20 border border-red-800 rounded-xl px-4 py-3">
                <p className="text-red-300 text-sm font-medium">{uploadError}</p>
              </div>
            )}

            <div className="w-full mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleContinue}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-lg transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>

        {showCropper && imageToCrop && (
          <ImageCropper imageSrc={imageToCrop} onCropComplete={handleCropComplete} onCancel={handleCropCancel} />
        )}
      </div>
    </div>
  );
}

export default CreateProfile;

/**
 * Profile Page
 * User profile displaying user info and their posts
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import PostComposer from '../components/post/PostComposer';
import PostCard from '../components/post/PostCard';
import ImageCropper from '../components/common/ImageCropper';

function Profile() {
  const { user, loading: authLoading, updateAvatar } = useAuth();
  const navigate = useNavigate();
  const { username } = useParams(); // For viewing other user's profiles
  const [profileUser, setProfileUser] = useState(null); // The user being viewed
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [bio, setBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [savingBio, setSavingBio] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const fileInputRef = useRef(null);

  const isOwnProfile = !username || (user && username === user.username);

  useEffect(() => {
    // Only require auth for /profile (own profile). Public profiles are viewable when logged out.
    if (!authLoading && !user && !username) {
      navigate('/login');
    }
  }, [user, authLoading, navigate, username]);

  useEffect(() => {
    const loadProfile = async () => {
      // Only wait for auth when rendering the private /profile view.
      if (authLoading && !username) return;

      const targetUsername = username || user?.username;
      if (!targetUsername) return;

      try {
        setLoading(true);
        setError(null);

        // Load profile user
        if (!isOwnProfile) {
          const profileRes = await axios.get(`/users/${targetUsername}`);
          setProfileUser(profileRes.data.user);
          setBio(profileRes.data.user.bio || 'Welcome to my profile! 👋 Sharing thoughts and ideas.');
        } else {
          setProfileUser(user);
          setBio(user?.bio || 'Welcome to my profile! 👋 Sharing thoughts and ideas.');
        }

        // Load posts
        const postsRes = await axios.get(`/users/${targetUsername}/posts`);
        setPosts(postsRes.data.posts || []);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [authLoading, user, username, isOwnProfile]);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(
      posts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Supported: JPG, PNG, WEBP, HEIC, HEIF.');
      setTimeout(() => setUploadError(''), 3000);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size too large. Maximum size is 5MB.');
      setTimeout(() => setUploadError(''), 3000);
      return;
    }

    // Show cropper (use object URL for better mobile reliability)
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

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      const response = await axios.put('/auth/bio', { bio: bioInput });
      setBio(response.data.user.bio);
      setIsEditingBio(false);
    } catch (error) {
      console.error('Error updating bio:', error);
      alert(error.response?.data?.message || 'Failed to update bio');
    } finally {
      setSavingBio(false);
    }
  };

  if (authLoading || !user) {
    // When viewing a public profile while logged out, allow render.
    if (username) {
      // fall through to page render; loading state handled below
    } else {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 dark:border-blue-400 border-t-transparent absolute top-0 left-0"></div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Profile Header Section */}
        <div className="bg-gray-900 rounded-lg shadow overflow-hidden mb-8 border border-gray-800">
          {/* Cover */}
          <div className="h-24 bg-gray-900 border-b border-gray-800" />
          
          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-6">
              {/* Avatar with Upload */}
              <div className="relative group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                  onChange={handleFileSelect}
                  className="sr-only"
                />
                <div
                  onClick={isOwnProfile ? handleImageClick : undefined}
                  className={`relative ${isOwnProfile ? 'cursor-pointer' : ''}`}
                >
                  <img
                    src={profileUser?.avatarUrl || user?.avatarUrl}
                    alt={profileUser?.username || user?.username || 'User'}
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-800 ring-2 ring-gray-800"
                  />
                  
                  {/* Hover Overlay with Edit Icon - Only for Own Profile */}
                  {isOwnProfile && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg
                        className="w-8 h-8 text-white mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-white text-xs font-semibold">
                        {uploading ? 'Uploading...' : 'Edit'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* User Info */}
              <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white">
                    {profileUser?.username || user?.username || username}
                  </h1>
                  {isOwnProfile && (
                    <span className="px-3 py-1 bg-gray-800 text-gray-200 text-xs font-semibold rounded-full border border-gray-700">
                      You
                    </span>
                  )}
                </div>
                {isOwnProfile && user?.email && (
                  <p className="text-gray-600 dark:text-gray-400 text-base mb-3">
                    {user.email}
                  </p>
                )}
                {/* Bio Section */}
                {isEditingBio ? (
                  <div className="space-y-2">
                    <textarea
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      maxLength={200}
                      className="w-full max-w-2xl px-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-700 dark:text-gray-300 resize-none"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveBio}
                        disabled={savingBio}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        {savingBio ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setBioInput(bio);
                          setIsEditingBio(false);
                        }}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                        {bioInput.length}/200
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 max-w-2xl group">
                    <p className="text-gray-700 dark:text-gray-300 text-sm flex-1">
                      {bio}
                    </p>
                    {isOwnProfile && (
                      <button
                        onClick={() => {
                          setBioInput(bio);
                          setIsEditingBio(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                        title="Edit bio"
                      >
                        <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Upload Error */}
            {uploadError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                <p className="text-red-700 dark:text-red-300 text-sm font-medium flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {uploadError}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Post Composer - Only for Own Profile */}
        {isOwnProfile && (
          <div className="mb-8 animate-fadeIn">
            <PostComposer onPostCreated={handlePostCreated} />
          </div>
        )}

        {/* Posts Section */}
        <div className="mb-8">
          {/* Posts Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              {isOwnProfile ? 'Your Posts' : `${profileUser?.username || username}'s Posts`}
            </h2>
            {!loading && posts.length > 0 && (
              <span className="px-4 py-2 bg-gray-900 text-gray-200 text-sm font-semibold rounded-full border border-gray-800">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </span>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 dark:border-blue-400 border-t-transparent absolute top-0 left-0"></div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-6">
              <p className="text-red-800 dark:text-red-300 font-medium">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && posts.length === 0 && (
            <div className="bg-gray-900 rounded-lg shadow p-12 text-center border border-gray-800">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="h-10 w-10 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {isOwnProfile ? 'No posts yet' : 'No posts available'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {isOwnProfile ? 'Share your first post above!' : 'This user hasn\'t posted anything yet.'}
              </p>
            </div>
          )}

          {/* Posts Grid */}
          {!loading && !error && posts.length > 0 && (
            <div className="space-y-0 animate-fadeIn">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={handlePostDeleted}
                  onUpdate={handlePostUpdated}
                  showActions={isOwnProfile}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}

export default Profile;

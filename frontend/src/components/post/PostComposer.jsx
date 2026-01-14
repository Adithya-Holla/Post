/**
 * PostComposer Component
 * Form for creating new posts (shown to all users, but requires auth to post)
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Modal from '../common/Modal';

const DRAFT_KEY = 'postDraft';

function PostComposer({ onPostCreated }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      setContent(draft);
    }
  }, []);

  // Save draft to localStorage whenever content changes
  useEffect(() => {
    if (content.trim()) {
      localStorage.setItem(DRAFT_KEY, content);
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [content]);

  const maxLength = 280;
  const remainingChars = maxLength - content.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || content.length > maxLength) return;

    // Check if user is authenticated
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await axios.post('/posts', { content });
      setContent('');
      localStorage.removeItem(DRAFT_KEY); // Clear draft after successful post
      if (onPostCreated) {
        onPostCreated(response.data.post);
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    setShowAuthModal(false);
    navigate('/login');
  };

  const handleRegisterRedirect = () => {
    setShowAuthModal(false);
    navigate('/register');
  };

  return (
    <>
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            {user && (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-10 h-10 rounded-full ring-2 ring-blue-200 dark:ring-blue-900/50"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {user ? `What's on your mind, ${user.username}?` : "Share your thoughts"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Share your ideas with the community
              </p>
            </div>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write something amazing..."
              className="w-full px-5 py-4 border border-gray-800 bg-gray-950 text-gray-100 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors duration-200 text-base leading-relaxed"
              rows="4"
              disabled={submitting}
            />
            
            {/* Character count badge */}
            <div className="absolute bottom-4 right-4">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                remainingChars < 0
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 scale-110'
                  : remainingChars < 20
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
                {remainingChars}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 flex items-center justify-end">
            <button
              type="submit"
              disabled={submitting || !content.trim() || remainingChars < 0}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {/* Auth Required Modal */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign In Required"
      >
        <div className="space-y-6">
          <p>
            You are not signed in. Please log in or create an account to create posts.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleLoginRedirect}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              Log In
            </button>
            <button
              onClick={handleRegisterRedirect}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 font-medium"
            >
              Sign Up
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default PostComposer;

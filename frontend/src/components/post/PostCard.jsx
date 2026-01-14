/**
 * PostCard Component
 * Displays a single post with author info, content, likes, and comments
 */
import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';
import Modal from '../common/Modal';
import CommentSection from './CommentSection';
import { getSocket } from '../../config/socket';

function PostCard({ post, showActions = false, onDelete, onUpdate }) {
  const { user, isAuthenticated } = useAuth();
  const { id, author, createdAt, updatedAt } = post;
  
  const [content, setContent] = useState(post.content);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [liked, setLiked] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [showComments, setShowComments] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(updatedAt);

  const isOwner = user && author.id === user.id;
  const maxLength = 280;
  const remainingChars = maxLength - editContent.length;
  const wasEdited = lastUpdated && createdAt !== lastUpdated;

  // Listen for socket events for real-time updates
  useEffect(() => {
    const socket = getSocket();

    const handlePostLiked = (data) => {
      if (data.postId === id) {
        setLikesCount(data.likesCount);
      }
    };

    const handlePostCommented = (data) => {
      if (data.postId === id) {
        setCommentsCount(data.commentsCount);
      }
    };

    socket.on('post:liked', handlePostLiked);
    socket.on('post:commented', handlePostCommented);

    return () => {
      socket.off('post:liked', handlePostLiked);
      socket.off('post:commented', handlePostCommented);
    };
  }, [id]);

  const handleLikeClick = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    try {
      const response = await axios.post(`/posts/${id}/like`);
      setLikesCount(response.data.likesCount);
      setLiked(response.data.liked);
    } catch (error) {
      console.error('Error toggling like:', error);
      alert(error.response?.data?.message || 'Failed to like post');
    }
  };

  const handleCommentClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setShowComments(!showComments);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditContent(content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editContent.length > maxLength) return;

    setUpdating(true);
    try {
      const response = await axios.put(`/posts/${id}`, { content: editContent });
      setContent(editContent);
      setLastUpdated(response.data.post.updatedAt);
      setIsEditing(false);
      if (onUpdate) {
        onUpdate(response.data.post);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert(error.response?.data?.message || 'Failed to update post');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/posts/${id}`);
      setShowDeleteModal(false);
      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(error.response?.data?.message || 'Failed to delete post');
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-gray-900 rounded-xl p-6 mb-4 border border-gray-800">
        {/* Author Info */}
        <div className="flex items-start space-x-3 mb-4">
          <img
            src={author.avatarUrl}
            alt={author.username}
            className="w-12 h-12 rounded-full flex-shrink-0 ring-2 ring-gray-200 dark:ring-gray-700"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {author.username}
                </h3>
                <span className="text-gray-500 dark:text-gray-400 text-sm flex-shrink-0">
                  {formatDistanceToNow(new Date(wasEdited ? lastUpdated : createdAt), { addSuffix: true })}
                  {wasEdited && <span className="ml-1">(edited)</span>}
                </span>
              </div>
              {showActions && isOwner && !isEditing && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleEditClick}
                    className="text-gray-400 hover:text-blue-400 p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                    title="Edit post"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                    title="Delete post"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Post Content - Edit Mode */}
        {isEditing ? (
          <div className="mb-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none transition-all duration-200"
              rows="3"
              disabled={updating}
            />
            <div className="flex items-center justify-between mt-3">
              <span
                className={`text-sm font-medium ${
                  remainingChars < 0
                    ? 'text-red-500 dark:text-red-400'
                    : remainingChars < 20
                    ? 'text-orange-500 dark:text-orange-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {remainingChars} characters remaining
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelEdit}
                  disabled={updating}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-sm font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={updating || !editContent.trim() || remainingChars < 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 text-sm font-medium transition-colors duration-200"
                >
                  {updating ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Post Content - View Mode */
          <div className="mb-4">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words text-lg leading-relaxed">{content}</p>
          </div>
        )}

        {/* Action Bar */}
        {!isEditing && (
          <div className="flex items-center space-x-6 text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              onClick={handleLikeClick}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium ${
                liked 
                  ? 'text-red-400 bg-gray-800' 
                  : 'hover:text-red-400 hover:bg-gray-800'
              }`}
            >
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  liked ? 'animate-heartbeat' : ''
                }`}
                fill={liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{likesCount}</span>
            </button>

            <button
              onClick={handleCommentClick}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium ${
                showComments 
                  ? 'text-blue-400 bg-gray-800' 
                  : 'hover:text-blue-400 hover:bg-gray-800'
              }`}
            >
              <svg
                className="w-5 h-5"
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
              <span>{commentsCount}</span>
            </button>
          </div>
        )}

        {/* Comment Section */}
        {showComments && <CommentSection postId={id} />}
      </div>

      {/* Auth Required Modal */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign In Required"
      >
        <p className="mb-6">
          You are not signed in. Please log in or create an account to interact with posts.
        </p>
        <div className="flex space-x-3">
          <a
            href="/login"
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center font-medium transition-colors duration-200"
          >
            Log In
          </a>
          <a
            href="/register"
            className="flex-1 px-4 py-2.5 border-2 border-blue-600 text-blue-400 rounded-lg hover:bg-gray-800 text-center font-medium transition-colors duration-200"
          >
            Sign Up
          </a>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !deleting && setShowDeleteModal(false)}
        title="Delete Post"
      >
        <p className="mb-6">
          Are you sure you want to delete this post? This action cannot be undone.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium disabled:opacity-50 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors duration-200"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </>
  );
}

export default PostCard;

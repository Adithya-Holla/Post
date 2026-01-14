/**
 * CommentSection Component
 * Displays comments with likes, replies support
 */
import React, { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

function CommentItem({ comment, postId }) {
  const { user, isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [repliesCount, setRepliesCount] = useState(comment.repliesCount || 0);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated) return;

    // Optimistic update
    const wasLiked = liked;
    const previousCount = likesCount;
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);

    try {
      const response = await axios.post(`/posts/${postId}/comments/${comment.id}/like`);
      setLikesCount(response.data.likesCount);
      setLiked(response.data.liked);
    } catch (error) {
      setLiked(wasLiked);
      setLikesCount(previousCount);
      console.error('Error liking comment:', error);
    }
  };

  const fetchReplies = async () => {
    if (replies.length > 0) {
      setShowReplies(!showReplies);
      return;
    }

    setLoadingReplies(true);
    try {
      const response = await axios.get(`/posts/${postId}/comments/${comment.id}/replies`);
      setReplies(response.data.replies);
      setShowReplies(true);
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      const response = await axios.post(`/posts/${postId}/comments/${comment.id}/replies`, {
        text: replyText
      });
      setReplies([...replies, response.data.reply]);
      setRepliesCount(repliesCount + 1);
      setReplyText('');
      setShowReplies(true);
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="flex gap-3 group">
      <img
        src={comment.author.avatarUrl}
        alt={comment.author.username}
        className="w-9 h-9 rounded-full flex-shrink-0 ring-2 ring-gray-700 object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="bg-gray-900 rounded-xl px-4 py-3 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm text-white">
              {comment.author.username}
            </span>
            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {comment.text}
          </p>
        </div>
        
        {/* Comment Actions */}
        <div className="flex items-center gap-4 mt-2 ml-4">
          <button
            onClick={handleLike}
            disabled={!isAuthenticated}
            className={`flex items-center gap-1 text-xs font-medium transition-colors duration-200 ${
              liked
                ? 'text-red-500'
                : 'text-gray-400 hover:text-red-500'
            } disabled:cursor-not-allowed`}
          >
            <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {likesCount > 0 && <span>{likesCount}</span>}
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-xs font-medium text-gray-400 hover:text-blue-400 transition-colors duration-200"
            >
              Reply
            </button>
          )}

          {repliesCount > 0 && (
            <button
              onClick={fetchReplies}
              disabled={loadingReplies}
              className="text-xs font-medium text-gray-400 hover:text-blue-400 transition-colors duration-200"
            >
              {loadingReplies ? 'Loading...' : showReplies ? 'Hide' : `View ${repliesCount} ${repliesCount === 1 ? 'reply' : 'replies'}`}
            </button>
          )}
        </div>

        {/* Reply Input */}
        {showReplies && isAuthenticated && (
          <form onSubmit={handleReplySubmit} className="mt-3 ml-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={submittingReply || !replyText.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {submittingReply ? '...' : 'Reply'}
              </button>
            </div>
          </form>
        )}

        {/* Replies List */}
        {showReplies && replies.length > 0 && (
          <div className="mt-3 ml-4 space-y-3">
            {replies.map((reply) => (
              <ReplyItem key={reply.id} reply={reply} postId={postId} commentId={comment.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReplyItem({ reply, postId, commentId }) {
  const { user, isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reply.likesCount || 0);

  const handleLike = async () => {
    if (!isAuthenticated) return;

    const wasLiked = liked;
    const previousCount = likesCount;
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);

    try {
      const response = await axios.post(`/posts/${postId}/comments/${commentId}/replies/${reply.id}/like`);
      setLikesCount(response.data.likesCount);
      setLiked(response.data.liked);
    } catch (error) {
      setLiked(wasLiked);
      setLikesCount(previousCount);
      console.error('Error liking reply:', error);
    }
  };

  return (
    <div className="flex gap-2">
      <img
        src={reply.author.avatarUrl}
        alt={reply.author.username}
        className="w-7 h-7 rounded-full flex-shrink-0 ring-2 ring-gray-700 object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="bg-gray-800 rounded-lg px-3 py-2 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-xs text-white">
              {reply.author.username}
            </span>
            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-gray-200 text-xs leading-relaxed whitespace-pre-wrap break-words">
            {reply.text}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-1 ml-3">
          <button
            onClick={handleLike}
            disabled={!isAuthenticated}
            className={`flex items-center gap-1 text-xs font-medium transition-colors duration-200 ${
              liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            } disabled:cursor-not-allowed`}
          >
            <svg className="w-3 h-3" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {likesCount > 0 && <span>{likesCount}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/posts/${postId}/comments`);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const response = await axios.post(`/posts/${postId}/comments`, {
        text: commentText
      });
      // Add new comment with animation
      setComments([response.data.comment, ...comments]);
      setCommentText('');
      setIsFocused(false);
      inputRef.current?.blur();
    } catch (error) {
      console.error('Error posting comment:', error);
      alert(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5">
        <svg
          className="w-5 h-5 text-gray-600 dark:text-gray-400"
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
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Comments {comments.length > 0 && (
            <span className="text-gray-500 dark:text-gray-400 font-normal">
              ({comments.length})
            </span>
          )}
        </h3>
      </div>

      {/* Comment Input */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-10 h-10 rounded-full flex-shrink-0 ring-2 ring-gray-200 dark:ring-gray-700 object-cover"
            />
            <div className="flex-1">
              <div className={`relative transition-all duration-300 ${
                isFocused ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
              } rounded-xl overflow-hidden`}>
                <textarea
                  ref={inputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Write a comment..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                  rows={isFocused ? "3" : "2"}
                  disabled={submitting}
                />
                {/* Character Counter */}
                {isFocused && (
                  <div className="absolute bottom-3 left-4 text-xs text-gray-400 dark:text-gray-500 animate-fadeIn">
                    {commentText.length} / 500
                  </div>
                )}
              </div>
              
              {/* Action Buttons - Only show when focused or has text */}
              {(isFocused || commentText.trim()) && (
                <div className="mt-3 flex justify-end gap-2 animate-slideUp">
                  <button
                    type="button"
                    onClick={() => {
                      setCommentText('');
                      setIsFocused(false);
                      inputRef.current?.blur();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !commentText.trim()}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {submitting ? 'Posting...' : 'Comment'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      )}

      {/* Login Prompt for Non-authenticated Users */}
      {!user && (
        <div className="mb-6 p-4 bg-gray-900 border border-gray-800 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
            <a href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Log in
            </a>
            {' '}or{' '}
            <a href="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              sign up
            </a>
            {' '}to comment
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 dark:border-gray-700"></div>
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 dark:border-blue-400 border-t-transparent absolute top-0 left-0"></div>
          </div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400 dark:text-gray-500"
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
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            No comments yet
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
            Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentSection;

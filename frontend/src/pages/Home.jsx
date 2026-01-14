/**
 * Home Page
 * Main feed displaying all posts (public access)
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import PostCard from '../components/post/PostCard';
import PostComposer from '../components/post/PostComposer';
import PostSkeleton from '../components/common/PostSkeleton';

function Home() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/posts');
        setPosts(response.data.posts);
        setError(null);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Header - Only shown to authenticated users */}
      {isAuthenticated && (
        <div className="border-b border-gray-800 bg-gray-950">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome to <span className="text-blue-400">Post</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Share your thoughts, connect with others, and explore what's happening
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Post Composer */}
        <PostComposer onPostCreated={handlePostCreated} />

        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
            Latest Posts
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} in the feed
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-4">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-6 flex items-start space-x-3">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-red-800 dark:text-red-300 font-semibold mb-1">Unable to load posts</h3>
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div className="bg-gray-900 rounded-lg shadow p-12 text-center border border-gray-800">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-6">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-400"
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
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No posts yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Be the first to share something amazing!</p>
            {isAuthenticated && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Use the composer above to create your first post
              </p>
            )}
          </div>
        )}

        {/* Posts Feed */}
        {!loading && !error && posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;

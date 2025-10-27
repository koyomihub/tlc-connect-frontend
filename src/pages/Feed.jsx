import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { feedAPI } from '../services/api';
import PostCard from '../../components/Posts/PostCard';
import CreatePost from '../../components/Posts/CreatePost';
import FollowPeople from '../../components/Social/FollowPeople';
import { Loader, RefreshCw } from 'lucide-react';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = async () => {
    try {
      const response = await feedAPI.getFeed();
      setPosts(response.data.posts.data);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  const handleNewPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your feed</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin text-primary-600" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Your Feed</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          <CreatePost onPostCreated={handleNewPost} />

          <div className="space-y-6 mt-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="text-primary-600" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-4">
                  Your feed is empty. Follow more users or create your first post!
                </p>
              </div>
            ) : (
              posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </div>
        </div>

        {/* Sidebar - Follow People */}
        <div className="lg:col-span-1">
          <FollowPeople />
        </div>
      </div>
    </div>
  );
};

export default Feed;
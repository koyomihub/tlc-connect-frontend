import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { threadsAPI } from '../../services/api';
import { MessageSquare, Plus, Users, Clock, Loader, Send, User } from 'lucide-react';
import { AvatarImage } from '../../utils/avatarHelper';

const Threads = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [postingReply, setPostingReply] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingThread, setCreatingThread] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'

  const loadThreads = async (tab = 'all') => {
    try {
      console.log(`Loading ${tab} threads...`);
      setLoading(true);
      
      let response;
      if (tab === 'my') {
        // Load only user's threads using the fixed route
        response = await threadsAPI.getMyThreads();
      } else {
        // Load all threads
        response = await threadsAPI.getThreads();
      }
      
      console.log(`${tab} threads response:`, response.data);
      setThreads(response.data.threads?.data || response.data.data || []);
    } catch (error) {
      console.error(`Error loading ${tab} threads:`, error);
    } finally {
      setLoading(false);
    }
  };

  const loadThreadReplies = async (threadId) => {
    try {
      console.log('Loading thread replies for:', threadId);
      const response = await threadsAPI.getThread(threadId);
      console.log('Thread response:', response.data);
      setSelectedThread(response.data.thread);
      setReplies(response.data.replies.data);
    } catch (error) {
      console.error('Error loading thread:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadThreads(activeTab);
    }
  }, [user, activeTab]);

  const handleCreateThread = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const threadData = {
      title: formData.get('title'),
      content: formData.get('content'),
      tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
    };

    console.log('Sending thread data:', threadData);

    setCreatingThread(true);
    try {
      const response = await threadsAPI.createThread(threadData);
      console.log('Thread creation response:', response.data);
      await loadThreads(activeTab);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating thread:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setCreatingThread(false);
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    
    // Store content and clear immediately
    const content = replyContent;
    if (!content.trim() || !selectedThread || postingReply) return;

    // Clear form IMMEDIATELY
    setReplyContent('');
    setPostingReply(true);

    try {
      const response = await threadsAPI.addReply(selectedThread.id, content);
      console.log('Reply response:', response.data);
      
      // Force state update by creating new array
      setReplies(prev => [...prev, { ...response.data.reply }]);
      
      // Update thread count
      setThreads(prev => prev.map(thread => 
        thread.id === selectedThread.id 
          ? { ...thread, comments_count: (thread.comments_count || 0) + 1 }
          : thread
      ));

      console.log('Reply added successfully!');
      
    } catch (error) {
      console.error('Error adding reply:', error);
      // If error, restore the content so user can try again
      setReplyContent(content);
      alert('Failed to add reply. Please try again.');
    } finally {
      setPostingReply(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Debug effect to monitor state
  useEffect(() => {
    console.log('Current state:', { 
      replyContent, 
      postingReply, 
      repliesCount: replies.length,
      selectedThreadId: selectedThread?.id,
      activeTab,
      threadsCount: threads.length
    });
  }, [replyContent, postingReply, replies, selectedThread, activeTab, threads]);

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view threads</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin text-primary-600" size={32} />
          <span className="ml-2 text-gray-600">Loading threads...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Discussion Threads</h1>
          <p className="text-gray-600">Join conversations and share your thoughts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Plus size={18} />
          <span>New Thread</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Threads List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors ${
                  activeTab === 'all'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Threads
              </button>
              <button
                onClick={() => setActiveTab('my')}
                className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors ${
                  activeTab === 'my'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Threads
              </button>
            </div>

            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                {activeTab === 'all' ? 'All Threads' : 'My Threads'} ({threads.length})
              </h2>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {threads.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">
                    {activeTab === 'all' ? 'No threads yet' : 'You haven\'t created any threads yet'}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    {activeTab === 'all' ? 'Start the first discussion!' : 'Create your first thread to get started!'}
                  </p>
                </div>
              ) : (
                threads.map(thread => (
                  <div
                    key={thread.id}
                    onClick={() => loadThreadReplies(thread.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedThread?.id === thread.id ? 'bg-primary-50 border-primary-200' : ''
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {thread.title || (thread.content ? thread.content.substring(0, 100) + (thread.content.length > 100 ? '...' : '') : 'No title')}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <AvatarImage
                          src={thread.user?.avatar}
                          alt={thread.user?.name}
                          className="w-5 h-5 rounded-full"
                          fallbackName={thread.user?.name}
                        />
                        <span>{thread.user?.name}</span>
                        {activeTab === 'all' && thread.user_id === user.id && (
                          <User size={12} className="text-primary-600" title="Your thread" />
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <MessageSquare size={14} />
                          <span>{thread.comments_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{formatDate(thread.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Thread Detail */}
        <div className="lg:col-span-2">
          {selectedThread ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Thread Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <AvatarImage
                      src={selectedThread.user?.avatar}
                      alt={selectedThread.user?.name}
                      className="w-10 h-10 rounded-full"
                      fallbackName={selectedThread.user?.name}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedThread.user?.name}</h3>
                      <p className="text-sm text-gray-500">{formatDate(selectedThread.created_at)}</p>
                    </div>
                    {selectedThread.user_id === user.id && (
                      <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full font-medium">
                        Your thread
                      </span>
                    )}
                  </div>
                </div>
                {selectedThread.title && (
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedThread.title}</h2>
                )}
                <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
                  {selectedThread.content}
                </p>
                {selectedThread.tags && selectedThread.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedThread.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Replies */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Replies ({replies.length})
                </h4>
                
                {replies.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600">No replies yet</p>
                    <p className="text-gray-500 text-sm mt-2">Be the first to reply!</p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-6">
                    {replies.map(reply => (
                      <div key={reply.id} className="flex space-x-3">
                        <AvatarImage
                          src={reply.user?.avatar}
                          alt={reply.user?.name}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                          fallbackName={reply.user?.name}
                        />
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-sm text-gray-900">
                                {reply.user?.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(reply.created_at)}
                              </span>
                            </div>
                            <p className="text-gray-800 text-sm">{reply.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                <form onSubmit={handleAddReply} className="flex items-start space-x-3">
                  <AvatarImage
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full flex-shrink-0 mt-3"
                    fallbackName={user.name}
                  />
                  <div className="flex-1 flex items-center space-x-3">
                    <div className="flex-1">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        rows="2"
                        disabled={postingReply}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={postingReply || !replyContent.trim()}
                      className="bg-primary-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 h-[54px] min-w-[80px] transition-colors"
                    >
                      {postingReply ? (
                        <>
                          <Loader className="animate-spin" size={18} />
                          <span className="hidden sm:inline">...</span>
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          <span className="hidden sm:inline">Reply</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <MessageSquare className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Thread</h3>
              <p className="text-gray-600">Choose a thread from the list to view the discussion</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Thread Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Thread</h2>
            <form onSubmit={handleCreateThread}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter thread title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    name="content"
                    required
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    placeholder="What would you like to discuss?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="discussion, help, question"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingThread}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                >
                  {creatingThread ? 'Creating...' : 'Create Thread'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Threads;
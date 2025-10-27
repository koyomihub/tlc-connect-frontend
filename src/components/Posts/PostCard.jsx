import React, { useState } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal, Send } from 'lucide-react';
import { reactionsAPI, postsAPI } from "../../services/api";
import { useAuth } from '../../context/AuthContext';
import { AvatarImage } from '../../utils/avatarHelper.jsx';

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post.is_liked ?? false);
  const [likeCount, setLikeCount] = useState(post.reactions_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [liking, setLiking] = useState(false);
  const { user } = useAuth();

  const handleLike = async () => {
    if (liking) return;
    
    setLiking(true);
    try {
      if (isLiked) {
        // Unlike the post
        const response = await reactionsAPI.removeReaction(post.id);
        setLikeCount(response.data.reactions_count);
        setIsLiked(false);
      } else {
        // Like the post
        const response = await reactionsAPI.addReaction(post.id, 'like');
        setLikeCount(response.data.reactions_count);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      const postUrl = `${window.location.origin}/post/${post.id}`;
      await navigator.clipboard.writeText(postUrl);
      alert('Post link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing post:', error);
      alert('Failed to copy link. Please try again.');
    }
  };

  const loadComments = async () => {
    if (comments.length > 0) return;
    
    setLoadingComments(true);
    try {
      const response = await postsAPI.getComments(post.id);
      setComments(response.data.comments.data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleShowComments = () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      loadComments();
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setPostingComment(true);
    try {
      const response = await postsAPI.addComment(post.id, commentContent.trim());
      setComments(prev => [...prev, response.data.comment]);
      setCommentContent('');
      post.comments_count = response.data.comments_count;
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setPostingComment(false);
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img {...getAvatarProps(user.avatar, user.name, user.name, "w-8 h-8 rounded-full")} />
          <div>
            <h3 className="font-semibold text-gray-900">{post.user?.name}</h3>
            <p className="text-sm text-gray-500">
              {formatDate(post.created_at)}
            </p>
          </div>
        </div>
        
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
        
        {post.media && post.media.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {post.media.map((media, index) => (
              <img
                key={index}
                src={media}
                alt="Post media"
                className="rounded-lg w-full h-48 object-cover"
              />
            ))}
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <div className="flex items-center space-x-4">
          <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
          <span>{post.comments_count || 0} {post.comments_count === 1 ? 'comment' : 'comments'}</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <button
          onClick={handleLike}
          disabled={liking}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors flex-1 justify-center ${
            isLiked 
              ? 'text-red-600 bg-red-50' 
              : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
          } disabled:opacity-50`}
        >
          <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
          <span>{liking ? '...' : 'Like'}</span>
        </button>
        
        <button 
          onClick={handleShowComments}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors flex-1 justify-center"
        >
          <MessageCircle size={20} />
          <span>Comment</span>
        </button>
        
        <button 
          onClick={handleShare}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors flex-1 justify-center"
        >
          <Share size={20} />
          <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 mt-4 pt-4">
          <div className="flex space-x-3 mb-4">
            <img {...getAvatarProps(user.avatar, user.name, user.name, "w-8 h-8 rounded-full")} />
            <form onSubmit={handleAddComment} className="flex-1 flex space-x-2">
              <input
                type="text"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={postingComment}
              />
              <button
                type="submit"
                disabled={postingComment || !commentContent.trim()}
                className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </div>

          <div className="space-y-3">
            {loadingComments ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="flex space-x-3">
                  <img {...getAvatarProps(user.avatar, user.name, user.name, "w-8 h-8 rounded-full")} />
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <h4 className="font-semibold text-sm">{comment.user?.name}</h4>
                      <p className="text-gray-800 text-sm">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
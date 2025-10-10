import React, { useState } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react';

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.reactions_count || 0);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
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
          <img
            src={post.user?.avatar || '/default-avatar.png'}
            alt={post.user?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
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
        
        {/* Post Media */}
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
          <span>{likeCount} likes</span>
          <span>{post.comments_count || 0} comments</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isLiked 
              ? 'text-red-600 bg-red-50' 
              : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
          <span>Like</span>
        </button>
        
        <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors">
          <MessageCircle size={20} />
          <span>Comment</span>
        </button>
        
        <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors">
          <Share size={20} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
import React, { useState, useEffect } from 'react';
import { followAPI } from "../../services/api";
import { UserPlus, UserCheck, Loader, Users } from 'lucide-react';
import { AvatarImage } from '../../utils/avatarHelper.jsx';

const FollowPeople = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState({});

  const loadSuggestions = async () => {
    try {
      const response = await followAPI.getSuggestions();
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      setFollowing(prev => ({ ...prev, [userId]: true }));
      
      const response = await followAPI.toggleFollow(userId);
      
      setSuggestions(prev => 
        prev.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                followers_count: response.data.followers_count,
                is_following: response.data.is_following 
              }
            : user
        )
      );
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setFollowing(prev => ({ ...prev, [userId]: false }));
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users size={20} />
          Follow People
        </h3>
        <div className="flex justify-center items-center py-8">
          <Loader className="animate-spin text-primary-600" size={24} />
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users size={20} />
          Follow People
        </h3>
        <div className="text-center py-8">
          <UserPlus className="mx-auto text-gray-400 mb-3" size={32} />
          <p className="text-gray-600">No suggestions available</p>
          <p className="text-gray-500 text-sm mt-2">Follow users to see their posts in your feed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Users size={20} />
        Follow People
      </h3>
      <div className="space-y-4">
        {suggestions.map(user => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <img {...getAvatarProps(user.avatar, user.name, user.name, "w-8 h-8 rounded-full")} />
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-gray-900 truncate">{user.name}</h4>
                <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                {user.bio && (
                  <p className="text-xs text-gray-600 truncate mt-1">{user.bio}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleFollow(user.id)}
              disabled={following[user.id]}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors flex-shrink-0 ${
                user.is_following
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              } disabled:opacity-50`}
            >
              {following[user.id] ? (
                <Loader className="animate-spin" size={16} />
              ) : user.is_following ? (
                <UserCheck size={16} />
              ) : (
                <UserPlus size={16} />
              )}
              <span className="hidden sm:inline">
                {user.is_following ? 'Following' : 'Follow'}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowPeople;
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI, mediaAPI } from '../services/api';
import { MapPin, Link, Calendar, Users, Edit3, Save, Camera, Loader } from 'lucide-react';
import PostCard from '../components/Posts/PostCard';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Ensure avatar URL is properly formatted
  const getAvatarUrl = (avatar) => {
    if (!avatar) return '/default-avatar.png';
    if (avatar.startsWith('http')) return avatar;
    if (avatar.startsWith('/')) return avatar; // Already a public path
    return `http://localhost:8000/storage/${avatar.replace('public/', '')}`;
  };

  const loadProfile = async () => {
    try {
      const [profileResponse] = await Promise.all([
        profileAPI.getProfile(),
      ]);

      setProfile(profileResponse.data);
      setStats(profileResponse.data.stats);
      setPosts(profileResponse.data.posts || []);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const profileData = {
      name: formData.get('name'),
      username: formData.get('username'),
      bio: formData.get('bio'),
      location: formData.get('location'),
      website: formData.get('website'),
      headline: formData.get('headline'),
    };

    setSaving(true);
    try {
      await profileAPI.updateProfile(profileData);
      await loadProfile();
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await mediaAPI.uploadAvatar(formData);
      
      // Update local user state with new avatar
      if (response.data.avatar_url) {
        const updatedUser = { ...user, avatar: response.data.avatar_url };
        updateUser(updatedUser);
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        
        // Reload profile
        await loadProfile();
        alert('Profile picture updated successfully!');
      } else if (response.data.success) {
        // Handle alternative success response format
        const updatedUser = { ...user, avatar: response.data.avatar_url || user.avatar };
        updateUser(updatedUser);
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        await loadProfile();
        alert('Profile picture updated successfully!');
      } else {
        throw new Error('Upload failed - no avatar URL returned');
      }
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      
      let errorMessage = 'Failed to upload profile picture. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
        </div>
      </div>
    );
  }

  if (loading || !profile || !stats) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-xl mb-6"></div>
          <div className="h-24 bg-gray-200 rounded-xl mb-6"></div>
        </div>
      </div>
    );
  }

  const currentUser = profile.user || user;
  const userProfile = profile.profile || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Cover Photo & Avatar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-primary-500 to-primary-600 relative">
            {userProfile.cover_photo ? (
              <img
                src={userProfile.cover_photo}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary-500 to-primary-600"></div>
            )}
          </div>
          
          <div className="px-6 pb-6">
            {/* Profile Picture and User Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 mb-4 pt-4">
              {/* Profile Picture - Only show edit overlay when editing */}
              <div className="relative -mt-24 sm:-mt-20">
                <div className="relative">
                  <img
                    src={getAvatarUrl(currentUser.avatar)}
                    alt={currentUser.name}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-lg object-cover bg-gray-200"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                      e.target.onerror = null; // Prevent infinite loop
                    }}
                  />
                  {/* Only show camera icon when editing mode is active */}
                  {editing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="text-white p-3 rounded-full bg-primary-600 hover:bg-primary-700 transition-colors"
                      >
                        {uploadingAvatar ? (
                          <Loader className="animate-spin" size={20} />
                        ) : (
                          <Camera size={20} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex-1 mt-4 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{currentUser.name}</h1>
                    <p className="text-gray-600 text-lg mb-2">@{currentUser.username}</p>
                    {userProfile.headline && (
                      <p className="text-xl text-gray-700 font-medium">{userProfile.headline}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors mt-4 sm:mt-0 w-full sm:w-auto justify-center"
                  >
                    <Edit3 size={18} />
                    <span className="font-medium">{editing ? 'Cancel' : 'Edit Profile'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bio & Info */}
            {editing ? (
              <form onSubmit={handleSaveProfile} className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={currentUser.name}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      defaultValue={currentUser.username}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Headline
                  </label>
                  <input
                    type="text"
                    name="headline"
                    defaultValue={userProfile.headline}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    defaultValue={currentUser.bio}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      defaultValue={currentUser.location}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      defaultValue={currentUser.website}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2 transition-colors"
                  >
                    <Save size={18} />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 mt-6">
                {currentUser.bio && (
                  <p className="text-gray-700 text-lg leading-relaxed">{currentUser.bio}</p>
                )}
                
                {/* Followers & Following Counts */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="font-medium">{stats.followers_count} followers</span>
                  <span className="text-gray-300">•</span>
                  <span className="font-medium">{stats.following_count} following</span>
                </div>

                <div className="flex flex-wrap gap-6 text-base text-gray-600">
                  {currentUser.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin size={18} />
                      <span>{currentUser.location}</span>
                    </div>
                  )}
                  {currentUser.website && (
                    <div className="flex items-center space-x-2">
                      <Link size={18} />
                      <a href={currentUser.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">
                        {currentUser.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar size={18} />
                    <span>Joined {new Date(currentUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-primary-600 mb-1">{stats.posts_count}</div>
            <div className="text-xs text-gray-600 font-medium">Posts</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-primary-600 mb-1">{stats.threads_count}</div>
            <div className="text-xs text-gray-600 font-medium">Threads</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-primary-600 mb-1">{stats.groups_count}</div>
            <div className="text-xs text-gray-600 font-medium">Groups</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-primary-600 mb-1">{stats.replies_count}</div>
            <div className="text-xs text-gray-600 font-medium">Comments</div>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h2>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 text-lg">No posts yet</p>
              <p className="text-gray-500 mt-2">Start sharing your thoughts with the community!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
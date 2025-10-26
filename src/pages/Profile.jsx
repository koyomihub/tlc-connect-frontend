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

  // Fixed avatar URL handling
  const getAvatarUrl = (avatar) => {
    if (!avatar || avatar === 'default-avatar.png' || avatar.includes('default-avatar')) {
      return '/default-avatar.png';
    }
    
    // If it's already a full URL, return as is
    if (avatar.startsWith('http')) {
      return avatar;
    }
    
    // If it's a storage path, construct the full URL
    if (avatar.startsWith('users/avatars/') || avatar.startsWith('storage/')) {
      const baseUrl = import.meta.env.VITE_API_URL;
      // Remove 'storage/' prefix if present and ensure proper URL
      const cleanPath = avatar.replace('storage/', '');
      return `${baseUrl}/storage/${cleanPath}`;
    }
    
    // Default fallback
    return '/default-avatar.png';
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getProfile();
      
      if (response.data) {
        setProfile(response.data);
        setStats(response.data.stats || {
          posts_count: 0,
          threads_count: 0,
          groups_count: 0,
          replies_count: 0,
          followers_count: 0,
          following_count: 0
        });
        setPosts(response.data.posts || []);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Set default stats if API fails
      setStats({
        posts_count: 0,
        threads_count: 0,
        groups_count: 0,
        replies_count: 0,
        followers_count: 0,
        following_count: 0
      });
      setPosts([]);
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
      const response = await profileAPI.updateProfile(profileData);
      
      // Update auth context user data
      const updatedUser = { 
        ...user, 
        name: profileData.name,
        username: profileData.username,
        bio: profileData.bio,
        location: profileData.location,
        website: profileData.website
      };
      updateUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      // Reload profile data
      await loadProfile();
      setEditing(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Failed to update profile. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors).flat().join(', ');
      }
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, GIF)');
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

      console.log('Uploading avatar...', file);
      const response = await mediaAPI.uploadAvatar(formData);
      console.log('Upload response:', response.data);
      
      let avatarUrl = '';
      
      // Handle different response formats
      if (response.data.avatar_url) {
        avatarUrl = response.data.avatar_url;
      } else if (response.data.avatar) {
        avatarUrl = response.data.avatar;
      } else if (response.data.paths?.url) {
        avatarUrl = response.data.paths.url;
      } else if (response.data.user?.avatar) {
        avatarUrl = response.data.user.avatar;
      } else if (response.data.success) {
        // Try to get avatar from the response data
        avatarUrl = response.data.avatar_url || response.data.avatar;
      }
      
      if (avatarUrl) {
        console.log('New avatar URL:', avatarUrl);
        const updatedUser = { ...user, avatar: avatarUrl };
        updateUser(updatedUser);
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        await loadProfile();
        alert('Profile picture updated successfully!');
      } else {
        console.error('No avatar URL in response:', response.data);
        throw new Error('No avatar URL returned from server');
      }
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      
      let errorMessage = 'Failed to upload profile picture. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
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

  const handleCoverPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('cover_photo', file);

      const response = await profileAPI.uploadCoverPhoto(formData);
      
      if (response.data.cover_photo_url) {
        await loadProfile();
        alert('Cover photo updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading cover photo:', error);
      alert('Failed to upload cover photo. Please try again.');
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-xl mb-6"></div>
          <div className="flex items-start space-x-6">
            <div className="w-32 h-32 bg-gray-200 rounded-full -mt-16"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentUser = profile?.user || user;
  const userProfile = profile?.profile || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Cover Photo & Avatar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Cover Photo with Upload Option */}
          <div className="h-48 bg-gradient-to-r from-primary-500 to-primary-600 relative group">
            {userProfile.cover_photo ? (
              <img
                src={userProfile.cover_photo}
                alt="Cover"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary-500 to-primary-600"></div>
            )}
            
            {editing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <input
                  type="file"
                  id="cover-photo"
                  accept="image/*"
                  onChange={handleCoverPhotoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="cover-photo"
                  className="bg-white text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <Camera size={18} className="inline mr-2" />
                  {userProfile.cover_photo ? 'Change Cover' : 'Add Cover Photo'}
                </label>
              </div>
            )}
          </div>
          
          <div className="px-6 pb-6">
            {/* Profile Picture and User Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 mb-4 pt-4">
              {/* Profile Picture */}
              <div className="relative -mt-24 sm:-mt-20">
                <div className="relative group">
                  <img
                    src={getAvatarUrl(currentUser.avatar)}
                    alt={currentUser.name}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-lg object-cover bg-gray-200"
                    onError={(e) => {
                      console.log('Avatar load failed, using default');
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  {/* Show camera icon when editing mode is active */}
                  {editing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
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
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      {currentUser.name || 'User'}
                    </h1>
                    <p className="text-gray-600 text-lg mb-2">
                      @{currentUser.username || 'username'}
                    </p>
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
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={currentUser.name}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      defaultValue={currentUser.username}
                      required
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
                    defaultValue={userProfile.headline || ''}
                    placeholder="e.g. Software Developer at Company"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    defaultValue={currentUser.bio || ''}
                    rows="4"
                    placeholder="Tell us about yourself..."
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
                      defaultValue={currentUser.location || ''}
                      placeholder="e.g. New York, NY"
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
                      defaultValue={currentUser.website || ''}
                      placeholder="https://example.com"
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
                {(currentUser.bio || userProfile.bio) && (
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {currentUser.bio || userProfile.bio}
                  </p>
                )}
                
                {/* Followers & Following Counts */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="font-medium">{stats?.followers_count || 0} followers</span>
                  <span className="text-gray-300">•</span>
                  <span className="font-medium">{stats?.following_count || 0} following</span>
                </div>

                <div className="flex flex-wrap gap-6 text-base text-gray-600">
                  {(currentUser.location || userProfile.location) && (
                    <div className="flex items-center space-x-2">
                      <MapPin size={18} />
                      <span>{currentUser.location || userProfile.location}</span>
                    </div>
                  )}
                  {(currentUser.website || userProfile.website) && (
                    <div className="flex items-center space-x-2">
                      <Link size={18} />
                      <a 
                        href={currentUser.website || userProfile.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary-600 hover:underline font-medium"
                      >
                        {(currentUser.website || userProfile.website).replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar size={18} />
                    <span>
                      Joined {new Date(currentUser.created_at || user.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-primary-600 mb-1">{stats?.posts_count || 0}</div>
            <div className="text-xs text-gray-600 font-medium">Posts</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-primary-600 mb-1">{stats?.threads_count || 0}</div>
            <div className="text-xs text-gray-600 font-medium">Threads</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-primary-600 mb-1">{stats?.groups_count || 0}</div>
            <div className="text-xs text-gray-600 font-medium">Groups</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-primary-600 mb-1">{stats?.replies_count || 0}</div>
            <div className="text-xs text-gray-600 font-medium">Comments</div>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h2>
          {!posts || posts.length === 0 ? (
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
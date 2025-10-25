import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/api/login', credentials),
  register: (userData) => api.post('/api/register', userData),
  getProfile: () => api.get('/api/profile'),
};

export const feedAPI = {
  getFeed: () => api.get('/api/feed'),
  createPost: (postData) => api.post('/api/feed', postData),
};

export const groupsAPI = {
  getGroups: () => api.get('/api/groups'),
  getMyGroups: () => api.get('/api/groups/my'),
  getGroup: (groupId) => api.get(`/api/groups/${groupId}`),
  createGroup: (groupData) => api.post('/api/groups', groupData),
  joinGroup: (groupId) => api.post(`/api/groups/${groupId}/join`),
  leaveGroup: (groupId) => api.post(`/api/groups/${groupId}/leave`),
  getGroupMessages: (groupId) => api.get(`/api/groups/${groupId}/messages`),
  sendGroupMessage: (groupId, content) => api.post(`/api/groups/${groupId}/messages`, { content }),
  
  // Invitation methods
  getMutualFollowers: (groupId) => api.get(`/api/groups/${groupId}/mutual-followers`),
  inviteUser: (groupId, inviteData) => api.post(`/api/groups/${groupId}/invite`, inviteData),
  getInvitations: (groupId) => api.get(`/api/groups/${groupId}/invitations`),
  acceptInvitation: (groupId) => api.post(`/api/groups/${groupId}/invitations/accept`),
  declineInvitation: (groupId) => api.post(`/api/groups/${groupId}/invitations/decline`),
  cancelInvitation: (groupId, invitationId) => api.delete(`/api/groups/${groupId}/invitations/${invitationId}`),
  getUserInvitations: () => api.get('/api/user/invitations'),
};

export const threadsAPI = {
  getThreads: () => api.get('/api/threads'),
  getMyThreads: () => api.get('/api/my/threads'),
  createThread: (threadData) => api.post('/api/threads', threadData),
  getThread: (threadId) => api.get(`/api/threads/${threadId}`),
  addReply: (threadId, content) => api.post(`/api/threads/${threadId}/replies`, { content }),
};

export const profileAPI = {
  getProfile: (username) => api.get(`/api/profile/${username || ''}`),
  updateProfile: (profileData) => api.put('/api/profile', profileData),
  getPosts: (username) => api.get(`/api/profile/${username}/posts`),
  getThreads: (username) => api.get(`/api/profile/${username}/threads`),
};

export const followAPI = {
  getSuggestions: () => api.get('/api/users/suggestions'),
  follow: (userId) => api.post(`/api/users/${userId}/follow`),
  unfollow: (userId) => api.post(`/api/users/${userId}/unfollow`),
  toggleFollow: (userId) => api.post(`/api/users/${userId}/toggle-follow`),
  getFollowers: (userId) => api.get(`/api/users/${userId}/followers`),
  getFollowing: (userId) => api.get(`/api/users/${userId}/following`),
};

export const mediaAPI = {
  uploadAvatar: (formData) => api.post('/api/upload/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  uploadPostMedia: (formData) => api.post('/api/upload/post-media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteAvatar: () => api.delete('/api/avatar'),
};

export const reactionsAPI = {
  addReaction: (postId, type) => api.post(`/api/posts/${postId}/reactions`, { type }),
  removeReaction: (postId) => api.delete(`/api/posts/${postId}/reactions`),
  toggleLike: (postId) => api.post(`/api/posts/${postId}/toggle-like`),
};

export const postsAPI = {
  getPosts: () => api.get('/api/posts'),
  createPost: (postData) => api.post('/api/posts', postData),
  addComment: (postId, content) => api.post(`/api/posts/${postId}/comments`, { content }),
  getComments: (postId) => api.get(`/api/posts/${postId}/comments`),
};

export const notificationsAPI = {
  getNotifications: () => api.get('/api/notifications'),
  markAsRead: (id = null) => {
    if (id) {
      return api.post(`/api/notifications/${id}/mark-as-read`);
    }
    return api.post('/api/notifications/mark-as-read');
  },
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
};

export const userActivityAPI = {
  getPosts: (username) => api.get(`/api/profile/${username}/posts`),
  getThreads: (username) => api.get(`/api/profile/${username}/threads`),
  getReplies: (username) => api.get(`/api/profile/${username}/replies`),
  getLikedPosts: (username) => api.get(`/api/profile/${username}/liked-posts`),
  getGroups: (username) => api.get(`/api/profile/${username}/groups`),
  getStats: (username) => api.get(`/api/profile/${username}/stats`),
};

export default api;
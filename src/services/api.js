import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Added this line
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
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  getProfile: () => api.get('/profile'),
};

export const feedAPI = {
  getFeed: () => api.get('/feed'),
  createPost: (postData) => api.post('/feed', postData),
};

export const groupsAPI = {
  getGroups: () => api.get('/groups'),
  getMyGroups: () => api.get('/groups/my'),
  getGroup: (groupId) => api.get(`/groups/${groupId}`),
  createGroup: (groupData) => api.post('/groups', groupData),
  joinGroup: (groupId) => api.post(`/groups/${groupId}/join`),
  leaveGroup: (groupId) => api.post(`/groups/${groupId}/leave`),
  getGroupMessages: (groupId) => api.get(`/groups/${groupId}/messages`),
  sendGroupMessage: (groupId, content) => api.post(`/groups/${groupId}/messages`, { content }),
  
  // Invitation methods
  getMutualFollowers: (groupId) => api.get(`/groups/${groupId}/mutual-followers`),
  inviteUser: (groupId, inviteData) => api.post(`/groups/${groupId}/invite`, inviteData),
  getInvitations: (groupId) => api.get(`/groups/${groupId}/invitations`),
  acceptInvitation: (groupId) => api.post(`/groups/${groupId}/invitations/accept`),
  declineInvitation: (groupId) => api.post(`/groups/${groupId}/invitations/decline`),
  cancelInvitation: (groupId, invitationId) => api.delete(`/groups/${groupId}/invitations/${invitationId}`),
  getUserInvitations: () => api.get('/user/invitations'), // Added this line
};

export const threadsAPI = {
  getThreads: () => api.get('/threads'),
  getMyThreads: () => api.get('/my/threads'), // ADD THIS LINE - FIXES THE ISSUE
  createThread: (threadData) => api.post('/threads', threadData),
  getThread: (threadId) => api.get(`/threads/${threadId}`),
  addReply: (threadId, content) => api.post(`/threads/${threadId}/replies`, { content }),
};

export const profileAPI = {
  getProfile: (username) => api.get(`/profile/${username || ''}`),
  updateProfile: (profileData) => api.put('/profile', profileData),
  getPosts: (username) => api.get(`/profile/${username}/posts`),
  getThreads: (username) => api.get(`/profile/${username}/threads`),
};

export const followAPI = {
  getSuggestions: () => api.get('/users/suggestions'),
  follow: (userId) => api.post(`/users/${userId}/follow`),
  unfollow: (userId) => api.post(`/users/${userId}/unfollow`),
  toggleFollow: (userId) => api.post(`/users/${userId}/toggle-follow`),
  getFollowers: (userId) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId) => api.get(`/users/${userId}/following`),
};

export const mediaAPI = {
  uploadAvatar: (formData) => api.post('/upload/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  uploadPostMedia: (formData) => api.post('/upload/post-media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteAvatar: () => api.delete('/avatar'),
};

export const reactionsAPI = {
  addReaction: (postId, type) => api.post(`/posts/${postId}/reactions`, { type }),
  removeReaction: (postId) => api.delete(`/posts/${postId}/reactions`),
  toggleLike: (postId) => api.post(`/posts/${postId}/toggle-like`),
};

export const postsAPI = {
  getPosts: () => api.get('/posts'),
  createPost: (postData) => api.post('/posts', postData),
  addComment: (postId, content) => api.post(`/posts/${postId}/comments`, { content }),
  getComments: (postId) => api.get(`/posts/${postId}/comments`),
};

export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id = null) => {
    if (id) {
      return api.post(`/notifications/${id}/mark-as-read`);
    }
    return api.post('/notifications/mark-as-read');
  },
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export const userActivityAPI = {
  getPosts: (username) => api.get(`/profile/${username}/posts`),
  getThreads: (username) => api.get(`/profile/${username}/threads`),
  getReplies: (username) => api.get(`/profile/${username}/replies`),
  getLikedPosts: (username) => api.get(`/profile/${username}/liked-posts`),
  getGroups: (username) => api.get(`/profile/${username}/groups`),
  getStats: (username) => api.get(`/profile/${username}/stats`),
};

export default api;
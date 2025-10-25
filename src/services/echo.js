import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Initialize Echo with authentication
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    auth: {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
    },
    authEndpoint: import.meta.env.VITE_API_URL + '/broadcasting/auth'
});

// Points system real-time listeners
export const listenToPointsUpdates = (userId, callback) => {
    return window.Echo.private(`points.${userId}`)
        .listen('.points.updated', (e) => {
            console.log('Points updated:', e);
            callback(e);
        });
};

export const stopListeningToPoints = (userId) => {
    window.Echo.leave(`points.${userId}`);
};

// Helper to get current user ID from localStorage
export const getCurrentUserId = () => {
    try {
        const userData = localStorage.getItem('user_data');
        if (userData) {
            const user = JSON.parse(userData);
            return user.id;
        }
    } catch (error) {
        console.error('Error getting user ID:', error);
    }
    return null;
};

// Thread replies listeners
export const listenToThreadReplies = (threadId, callback) => {
    return window.Echo.private(`thread.${threadId}`)
        .listen('reply.added', (e) => {
            console.log('New reply received:', e);
            callback(e.reply);
        });
};

export const stopListeningToThread = (threadId) => {
    window.Echo.leave(`thread.${threadId}`);
};

// Post reactions listeners
export const listenToPostReactions = (postId, callback) => {
    return window.Echo.private(`post.${postId}`)
        .listen('reaction.added', (e) => {
            console.log('New reaction:', e);
            callback(e.reaction, e.reactions_count);
        });
};

export default window.Echo;
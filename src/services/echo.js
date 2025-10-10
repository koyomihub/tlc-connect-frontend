import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

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
    authEndpoint: 'http://localhost:8000/broadcasting/auth'
});

// Export helper functions for real-time updates
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

// Listen for notifications
if (window.currentUserId) {
    window.Echo.private(`user.${window.currentUserId}.notifications`)
        .notification((notification) => {
            console.log('New notification:', notification);
            showNotification(notification);
            updateNotificationBadge();
        });

    // Listen for new posts in feed
    window.Echo.private(`user.${window.currentUserId}.feed`)
        .listen('post.created', (e) => {
            console.log('New post in feed:', e.post);
            prependToFeed(e.post);
        });
}

// Listen for post reactions
export function listenToPostReactions(postId) {
    return window.Echo.private(`post.${postId}`)
        .listen('reaction.added', (e) => {
            console.log('New reaction:', e.reaction);
            updateReactions(e.reaction, e.reactions_count);
        });
}

// Listen for new replies (legacy function - keeping for compatibility)
export function listenToThreadRepliesOld(threadId) {
    return window.Echo.private(`post.${threadId}`)
        .listen('reply.added', (e) => {
            console.log('New reply:', e.reply);
            appendReply(e.reply);
        });
}

// Helper functions for UI updates
function showNotification(notification) {
    // Create and show notification UI
    const notificationElement = document.createElement('div');
    notificationElement.className = 'notification alert alert-info';
    notificationElement.innerHTML = `
        <strong>${notification.data.message}</strong>
    `;
    
    const notificationContainer = document.getElementById('notifications-container');
    if (notificationContainer) {
        notificationContainer.appendChild(notificationElement);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notificationElement.remove();
        }, 5000);
    }
}

function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (badge) {
        const currentCount = parseInt(badge.textContent) || 0;
        badge.textContent = currentCount + 1;
        badge.style.display = 'inline';
    }
}

function prependToFeed(post) {
    const feedContainer = document.getElementById('feed-container');
    if (feedContainer) {
        const postElement = createPostElement(post);
        feedContainer.insertBefore(postElement, feedContainer.firstChild);
    }
}

function updateReactions(reaction, reactionsCount) {
    const reactionButton = document.querySelector(`[data-post-id="${reaction.post_id}"]`);
    const reactionCount = document.querySelector(`[data-post-id="${reaction.post_id}"] .reaction-count`);
    
    if (reactionButton && reactionCount) {
        reactionCount.textContent = reactionsCount;
    }
}

function appendReply(reply) {
    const repliesContainer = document.querySelector(`[data-thread-id="${reply.parent_id}"] .replies-container`);
    if (repliesContainer) {
        const replyElement = createReplyElement(reply);
        repliesContainer.appendChild(replyElement);
    }
}

function createPostElement(post) {
    // Implementation for creating post HTML element
    return document.createElement('div');
}

function createReplyElement(reply) {
    // Implementation for creating reply HTML element
    return document.createElement('div');
}
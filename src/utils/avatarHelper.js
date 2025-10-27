// src/utils/avatarHelper.js

/**
 * Get consistent avatar URL across the entire application
 */
export const getAvatarUrl = (avatar, userName = 'User') => {
  // If no avatar or default avatar, use placeholder
  if (!avatar || avatar === 'default-avatar.png' || avatar.includes('default-avatar')) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=128`;
  }
  
  // If it's already a full URL (Cloudinary or other), return as is
  if (avatar.startsWith('http')) {
    return avatar;
  }
  
  // If it's base64 data URL, return as is
  if (avatar.startsWith('data:')) {
    return avatar;
  }
  
  // If it's a local storage path (for development)
  if (avatar.startsWith('users/avatars/')) {
    const baseUrl = import.meta.env.VITE_API_URL;
    return `${baseUrl}/storage/${avatar}`;
  }
  
  // Final fallback to placeholder
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=128`;
};

/**
 * Avatar Image component with consistent error handling
 */
export const AvatarImage = ({ src, alt, className = '', fallbackName = 'User', ...props }) => {
  const handleError = (e) => {
    console.log('Avatar load failed, using fallback for:', alt || fallbackName);
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || fallbackName)}&background=random&color=fff&size=128`;
    e.target.onerror = null; // Prevent infinite loop
  };

  return (
    <img
      src={getAvatarUrl(src, alt || fallbackName)}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
};
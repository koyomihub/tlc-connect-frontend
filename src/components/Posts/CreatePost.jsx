import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { feedAPI } from '../../services/api';
import { Send, Image, X, Loader } from 'lucide-react';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Check if all files are images
      const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        setError('Please select only image files');
        return;
      }

      // Check file types (only allow jpeg, png, jpg, gif)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      const invalidTypes = files.filter(file => !allowedTypes.includes(file.type));
      if (invalidTypes.length > 0) {
        setError('Only JPEG, PNG, JPG, and GIF files are allowed');
        return;
      }

      // Check file sizes (max 10MB each to match backend)
      const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError('Image sizes should be less than 10MB each');
        return;
      }

      // Limit to 1 image (since backend only handles single file)
      if (selectedImages.length + files.length > 1) {
        setError('You can only upload 1 image per post');
        return;
      }

      setSelectedImages(prev => [...prev, ...files]);
      
      // Create previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && selectedImages.length === 0) {
      setError('Please write something or add an image to post');
      return;
    }

    setPosting(true);
    setError('');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append content if available
      if (content.trim()) {
        formData.append('content', content.trim());
      }
      
      // Append media file if available
      if (selectedImages.length > 0) {
        formData.append('media', selectedImages[0]);
      }
      
      // Append is_public as integer (1 for true, 0 for false) - Laravel will cast to boolean
      formData.append('is_public', 1);

      // Use the API call with FormData
      const response = await feedAPI.createPost(formData);

      // Clear the form
      setContent('');
      setSelectedImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Notify parent component about the new post
      if (onPostCreated) {
        onPostCreated(response.data.post);
      }
      
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = Object.values(error.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to create post. Please try again.');
      }
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex space-x-4">
        <img
          src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random&color=fff&size=128`}
          alt={user?.name}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random&color=fff&size=128`;
          }}
        />
        
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'there'}?`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              rows="3"
              disabled={posting}
            />
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative inline-block">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="rounded-lg h-32 w-auto object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept=".jpeg,.jpg,.png,.gif"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-500 hover:text-primary-600 transition-colors"
                  disabled={posting || selectedImages.length >= 1}
                >
                  <Image size={20} />
                </button>
                <span className="text-sm text-gray-500">
                  {selectedImages.length}/1 image
                </span>
              </div>
              
              <button
                type="submit"
                disabled={posting || (!content.trim() && selectedImages.length === 0)}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {posting ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Post</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
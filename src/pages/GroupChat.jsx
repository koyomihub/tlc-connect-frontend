import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { groupsAPI } from '../../services/api';
import { Send, Loader, ArrowLeft, Users } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { AvatarImage } from '../../utils/avatarHelper';

const GroupChat = () => {
  const { user } = useAuth();
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadGroupData = async () => {
    try {
      const response = await groupsAPI.getGroup(groupId);
      setGroup(response.data.group);
      
      // Load group messages
      const messagesResponse = await groupsAPI.getGroupMessages(groupId);
      setMessages(messagesResponse.data.messages.data || []);
    } catch (error) {
      console.error('Error loading group data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && groupId) {
      loadGroupData();
    }
  }, [user, groupId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const content = newMessage;
    setNewMessage('');
    setSending(true);

    try {
      const response = await groupsAPI.sendGroupMessage(groupId, content);
      setMessages(prev => [...prev, response.data.message]);
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(content); // Restore message if failed
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin text-primary-600" size={32} />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Group not found</h2>
          <button
            onClick={() => navigate('/groups')}
            className="text-primary-600 hover:text-primary-700"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/groups')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="text-primary-600" size={24} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
              <p className="text-gray-600">{group.members_count} members</p>
            </div>
            <span className={`px-3 py-1 text-sm rounded-full ${
              group.is_public 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {group.is_public ? 'Public' : 'Private'}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No messages yet</p>
              <p className="text-gray-500 text-sm mt-2">Start the conversation!</p>
            </div>
          ) : (
            messages.map(message => (
              <div
                key={message.id}
                className={`flex space-x-3 ${
                  message.user_id === user.id ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <AvatarImage
                  src={message.user?.avatar}
                  alt={message.user?.name}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  fallbackName={message.user?.name}
                />
                <div className={`max-w-xs lg:max-w-md ${
                  message.user_id === user.id ? 'text-right' : ''
                }`}>
                  <div className={`rounded-lg p-3 ${
                    message.user_id === user.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 ${
                    message.user_id === user.id ? 'justify-end' : ''
                  }`}>
                    <span>{message.user?.name}</span>
                    <span>•</span>
                    <span>{formatTime(message.created_at)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
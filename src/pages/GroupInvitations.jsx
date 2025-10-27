import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { groupsAPI } from '../../services/api';
import { Mail, Users, Check, X, Loader } from 'lucide-react';
import { AvatarImage } from '../../utils/avatarHelper.jsx';

const GroupInvitations = () => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);

  const loadInvitations = async () => {
    try {
      const response = await groupsAPI.getUserInvitations();
      // The invitations are now in response.data.invitations.data
      setInvitations(response.data.invitations.data || []);
      setPendingInvitationsCount(response.data.invitations.total || 0);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadInvitations();
    }
  }, [user]);

  const handleAccept = async (groupId) => {
    try {
      const response = await groupsAPI.acceptInvitation(groupId);
      await loadInvitations(); // Refresh the list
      // Update the counter with the response data
      if (response.data.pending_count !== undefined) {
        setPendingInvitationsCount(response.data.pending_count);
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert(error.response?.data?.message || 'Failed to accept invitation');
    }
  };

  const handleDecline = async (groupId) => {
    try {
      const response = await groupsAPI.declineInvitation(groupId);
      await loadInvitations(); // Refresh the list
      // Update the counter with the response data
      if (response.data.pending_count !== undefined) {
        setPendingInvitationsCount(response.data.pending_count);
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
      alert(error.response?.data?.message || 'Failed to decline invitation');
    }
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Mail className="text-primary-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Group Invitations</h1>
          {pendingInvitationsCount > 0 && (
            <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
              {pendingInvitationsCount}
            </span>
          )}
        </div>

        {invitations.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending invitations</h3>
            <p className="text-gray-600">You don't have any pending group invitations.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map(invitation => (
              <div key={invitation.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Users className="text-primary-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{invitation.group?.name}</h3>
                      <p className="text-sm text-gray-600">{invitation.group?.description}</p>
                      <p className="text-xs text-gray-500">
                        Invited by {invitation.inviter?.name} • {new Date(invitation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAccept(invitation.group.id)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center space-x-2"
                    >
                      <Check size={16} />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleDecline(invitation.group.id)}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                    >
                      <X size={16} />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupInvitations;
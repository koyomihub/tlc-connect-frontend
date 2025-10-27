import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { groupsAPI } from '../../services/api';
import { Users, UserPlus, Mail, Loader, ArrowLeft, MessageSquare } from 'lucide-react';
import { AvatarImage } from '../../utils/avatarHelper.jsx';

const GroupDetail = () => {
  const { user } = useAuth();
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [mutualFollowers, setMutualFollowers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviting, setInviting] = useState(false);

  const loadGroupData = async () => {
    try {
      const response = await groupsAPI.getGroup(groupId);
      setGroup(response.data.group);

      if (response.data.is_owner) {
        const mutualResponse = await groupsAPI.getMutualFollowers(groupId);
        setMutualFollowers(mutualResponse.data.mutual_followers);

        const invitationsResponse = await groupsAPI.getInvitations(groupId);
        setInvitations(invitationsResponse.data.invitations.data || []);
      }
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

  const handleInviteUser = async (inviteeId) => {
    setInviting(true);
    try {
      await groupsAPI.inviteUser(groupId, { invitee_id: inviteeId });
      await loadGroupData(); // Refresh the data to show the new invitation
      setShowInviteModal(false);
    } catch (error) {
      console.error('Error inviting user:', error);
      alert(error.response?.data?.message || 'Failed to invite user');
    } finally {
      setInviting(false);
    }
  };

  const handleAcceptInvitation = async () => {
    try {
      const response = await groupsAPI.acceptInvitation(groupId);
      // Refresh the group data to update the invitation status
      await loadGroupData();
      navigate(`/groups/${groupId}/chat`);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert(error.response?.data?.message || 'Failed to accept invitation');
    }
  };

  const handleDeclineInvitation = async () => {
    try {
      const response = await groupsAPI.declineInvitation(groupId);
      // Refresh the group data to update the invitation status
      await loadGroupData();
      navigate('/groups');
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

  const isOwner = group.owner_id === user.id;
  const isMember = group.is_member;
  const hasPendingInvitation = group.has_pending_invitation;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/groups')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="text-primary-600" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                <p className="text-gray-600">{group.members_count} members</p>
              </div>
            </div>
            <span className={`px-3 py-2 text-sm rounded-full ${
              group.is_public 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {group.is_public ? 'Public' : 'Private'}
            </span>
          </div>

          <p className="text-gray-700 mb-4">{group.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users size={16} />
              <span>Owned by {group.owner?.name}</span>
            </div>

            <div className="flex items-center space-x-3">
              {hasPendingInvitation && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleAcceptInvitation}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    Accept Invitation
                  </button>
                  <button
                    onClick={handleDeclineInvitation}
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    Decline
                  </button>
                </div>
              )}

              {isMember && (
                <button
                  onClick={() => navigate(`/groups/${groupId}/chat`)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center space-x-2"
                >
                  <MessageSquare size={16} />
                  <span>Enter Chat</span>
                </button>
              )}

              {isOwner && !group.is_public && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <UserPlus size={16} />
                  <span>Invite Members</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Invitations Section (for owner) */}
      {isOwner && invitations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Mail size={20} />
              <span>Pending Invitations ({invitations.length})</span>
            </h3>
            <div className="space-y-3">
              {invitations.map(invitation => (
                <div key={invitation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img {...getAvatarProps(user.avatar, user.name, user.name, "w-8 h-8 rounded-full")} />
                    <div>
                      <p className="font-medium text-gray-900">{invitation.invitee?.name}</p>
                      <p className="text-sm text-gray-500">Invited {new Date(invitation.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Invite to Group</h2>
            <p className="text-gray-600 mb-4">Invite mutual followers to your private group</p>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {mutualFollowers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No mutual followers available to invite</p>
              ) : (
                mutualFollowers.map(follower => (
                  <div key={follower.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img {...getAvatarProps(user.avatar, user.name, user.name, "w-8 h-8 rounded-full")} />
                      <div>
                        <p className="font-medium text-gray-900">{follower.name}</p>
                        <p className="text-sm text-gray-500">@{follower.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInviteUser(follower.id)}
                      disabled={inviting}
                      className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 disabled:opacity-50"
                    >
                      Invite
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;
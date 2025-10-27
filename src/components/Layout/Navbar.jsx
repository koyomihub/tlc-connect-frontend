import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Users, MessageSquare, DollarSign, User, Mail, LogOut } from 'lucide-react';
import { groupsAPI } from '../../services/api';
import { AvatarImage } from '../../utils/avatarHelper.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);

  const loadPendingInvitationsCount = async () => {
    if (!user) return;
    
    try {
      const response = await groupsAPI.getUserInvitations();
      // The total count is now in response.data.invitations.total
      setPendingInvitationsCount(response.data.invitations.total || 0);
    } catch (error) {
      console.error('Error loading invitations count:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadPendingInvitationsCount();
    }
  }, [user]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TLC</span>
              </div>
              <span className="font-bold text-gray-900">TLC-Connect</span>
            </Link>
          </div>

          {/* Navigation Links - Arranged in requested order */}
          <div className="flex items-center space-x-1">
            {/* Feed */}
            <NavLink
              to="/feed"
              icon={Home}
              label="Feed"
              isActive={isActive('/feed')}
            />
            
            {/* Threads */}
            <NavLink
              to="/threads"
              icon={MessageSquare}
              label="Threads"
              isActive={isActive('/threads')}
            />
            
            {/* Groups */}
            <NavLink
              to="/groups"
              icon={Users}
              label="Groups"
              isActive={isActive('/groups')}
            />
            
            {/* Earn */}
            <NavLink
              to="/earn"
              icon={DollarSign}
              label="Earn"
              isActive={isActive('/earn')}
            />
            
            {/* Invitations Link with Badge */}
            <NavLink
              to="/invitations"
              icon={Mail}
              label="Invitations"
              isActive={isActive('/invitations')}
              badgeCount={pendingInvitationsCount}
            />

            {/* Profile */}
            <NavLink
              to="/profile"
              icon={User}
              label="Profile"
              isActive={isActive('/profile')}
            />
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img {...getAvatarProps(user.avatar, user.name, user.name, "w-8 h-8 rounded-full")} />
              <span className="text-sm text-gray-700">Hello, {user.name}</span>
            </div>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// NavLink Component
const NavLink = ({ to, icon: Icon, label, isActive, badgeCount = 0 }) => {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
        isActive
          ? 'bg-primary-100 text-primary-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
      
      {/* Badge for invitations count */}
      {badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
    </Link>
  );
};

export default Navbar;
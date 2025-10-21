import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, MessageSquare, Heart, Zap } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Users,
      title: 'Join Communities',
      description: 'Connect with like-minded people in specialized groups and communities.'
    },
    {
      icon: MessageSquare,
      title: 'Start Discussions',
      description: 'Create threads and engage in meaningful conversations with other members.'
    },
    {
      icon: Heart,
      title: 'Build Connections',
      description: 'Follow users, react to posts, and grow your professional network.'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Get instant notifications and stay updated with live feed updates.'
    }
  ];

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="text-primary-600">TLC-Connect</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your professional social network for connecting, sharing, and growing together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/feed"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Go to Feed
              </Link>
              <Link
                to="/groups"
                className="border border-primary-600 text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                Explore Groups
              </Link>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-primary-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen py-12">
          <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Connect. Share.{' '}
              <span className="text-primary-600">Grow.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join TLC-Connect - the professional social network where meaningful connections happen. 
              Share your thoughts, join communities, and grow your network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="border border-primary-600 text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors text-center"
              >
                Log In
              </Link>
            </div>
          </div>
          
          <div className="lg:w-1/2 flex justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">TLC</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Welcome to TLC-Connect</h2>
                  <p className="text-gray-600 mt-2">Join our growing community</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg">
                    <Users className="text-primary-600" size={20} />
                    <span className="text-sm text-gray-700">402+ Active Users</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg">
                    <MessageSquare className="text-primary-600" size={20} />
                    <span className="text-sm text-gray-700">362+ Communities</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg">
                    <Heart className="text-primary-600" size={20} />
                    <span className="text-sm text-gray-700">1,349+ Posts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
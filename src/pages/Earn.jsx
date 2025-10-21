import React, { useState, useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import { DollarSign, TrendingUp, Clock, Calendar, Zap, Target } from 'lucide-react';
import { listenToPointsUpdates, stopListeningToPoints, getCurrentUserId } from "../services/echo";

const Earn = () => {
  const { user } = useAuth();
  const [pointsData, setPointsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [usingPolling, setUsingPolling] = useState(false);

  useEffect(() => {
    fetchPointsData();
    
    // Try WebSocket first, fallback to polling if it fails
    try {
      setupWebSocket();
    } catch (error) {
      console.log('WebSocket failed, using polling instead:', error);
      setupPolling();
    }

    // Cleanup function
    return () => {
      const userId = getCurrentUserId();
      if (userId) {
        stopListeningToPoints(userId);
      }
    };
  }, []);

  const fetchPointsData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/earn/points', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPointsData(data);
    } catch (error) {
      console.error('Error fetching points data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    const userId = getCurrentUserId();
    if (userId && window.Echo) {
      console.log('Setting up WebSocket for points updates...');
      const pointsListener = listenToPointsUpdates(userId, (data) => {
        console.log('Real-time points update received:', data);
        setPointsData(prev => ({
          ...prev,
          points_balance: data.points_balance,
          analytics: {
            ...prev.analytics,
            breakdown: data.points_breakdown
          }
        }));
      });

      return () => {
        stopListeningToPoints(userId);
        if (pointsListener && typeof pointsListener.stop === 'function') {
          pointsListener.stop();
        }
      };
    } else {
      throw new Error('User ID or Echo not available');
    }
  };

  const setupPolling = () => {
    setUsingPolling(true);
    console.log('Setting up polling for points updates...');
    
    // Poll every 10 seconds
    const interval = setInterval(fetchPointsData, 10000);
    
    return () => clearInterval(interval);
  };

  const handleClaimPoints = async () => {
    setClaiming(true);
    try {
      const response = await fetch('http://localhost:8000/api/earn/claim', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      alert(data.message);
      fetchPointsData(); // Refresh data
    } catch (error) {
      console.error('Error claiming points:', error);
      alert('Error claiming points. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Handle case where pointsData is null
  if (!pointsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load points data</h2>
          <button 
            onClick={fetchPointsData}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { points_balance, analytics } = pointsData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Connection Status */}
        {usingPolling && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded-md">
            <p className="text-yellow-800 text-sm">
              ⚠️ Using polling updates (WebSocket unavailable). Points will update every 10 seconds.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Earn $TLC</h1>
          <p className="text-gray-600">Earn points by being active in the community</p>
        </div>

        {/* Main Points Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Balance</h2>
              <div className="flex items-baseline space-x-2 mt-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                <span className="text-4xl font-bold text-gray-900">{points_balance}</span>
                <span className="text-xl text-gray-600">$TLC</span>
              </div>
            </div>
            <button
              onClick={handleClaimPoints}
              disabled={claiming}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {claiming ? 'Claiming...' : 'Claim Points'}
            </button>
          </div>
        </div>

        {/* Points Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">This Hour</p>
                <p className="text-xl font-bold text-gray-900">
                  {analytics?.breakdown?.hour || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-6 w-6 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-xl font-bold text-gray-900">
                  {analytics?.breakdown?.today || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-xl font-bold text-gray-900">
                  {analytics?.breakdown?.week || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-xl font-bold text-gray-900">
                  {analytics?.breakdown?.month || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How to Earn Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">How to Earn $TLC</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <Target className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-2">Create Posts</h4>
              <p className="text-gray-600 text-sm">Earn {analytics?.rates?.post_created || 0.2} $TLC for each post you create</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <Target className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-2">Receive Likes</h4>
              <p className="text-gray-600 text-sm">Earn {analytics?.rates?.post_liked || 0.1} $TLC for each like on your posts</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <Target className="h-8 w-8 text-purple-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-2">Comment</h4>
              <p className="text-gray-600 text-sm">Earn {analytics?.rates?.comment_created || 0.01} $TLC for each comment you make</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {analytics?.recent_transactions?.length > 0 ? (
              analytics.recent_transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {transaction.type?.replace('_', ' ') || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`text-right ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <p className="font-semibold">
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </p>
                    <p className="text-sm">$TLC</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earn;
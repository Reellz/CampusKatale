import { useEffect, useState } from "react";
import axios from "axios";

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;
const API = `${STRAPI_URL}/api/stats`;

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    listings: 0,
    messages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(API);
        
        // Ensure to get the expected data structure
        if (res.data && typeof res.data === 'object') {
          setStats({
            users: Number(res.data.users) || 0,
            listings: Number(res.data.listings) || 0,
            messages: Number(res.data.messages) || 0
          });
        } else {
          throw new Error('Invalid data structure from API');
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError('Failed to load dashboard data');
        // Set fallback data
        setStats({ users: 0, listings: 0, messages: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Safe card data with proper value handling
  const cardData = [
    {
      title: "Total Users",
      value: stats.users,
      icon: "👥",
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100"
    },
    {
      title: "Total Listings",
      value: stats.listings,
      icon: "📦",
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-gradient-to-br from-green-50 to-green-100"
    },
    {
      title: "Messages",
      value: stats.messages,
      icon: "💬",
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100"
    }
  ];

  // Safe number formatting function
  const formatNumber = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 font-[Lexend]">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#97C040]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 font-[Lexend]">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto mt-8">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-red-500 text-xl">⚠️</span>
            </div>
            <h2 className="text-lg font-semibold text-red-800">Error Loading Data</h2>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-[Lexend]">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your platform overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cardData.map((card, index) => (
          <div 
            key={index}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] group"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {formatNumber(card.value)}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Updated just now
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-[#97C040] to-[#7ca532] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">U{item}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New user registration</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-gradient-to-br from-[#97C040] to-[#7ca532] text-white rounded-xl hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]">
              <span className="block text-sm font-medium">Manage Users</span>
            </button>
            <button className="p-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-[1.02]">
              <span className="block text-sm font-medium">View Listings</span>
            </button>
            <button className="p-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-[1.02]">
              <span className="block text-sm font-medium">Analytics</span>
            </button>
            <button className="p-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-[1.02]">
              <span className="block text-sm font-medium">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
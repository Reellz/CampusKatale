import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:1337/api/stats";

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    listings: 0,
    messages: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const res = await axios.get(API);
      setStats(res.data);
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8 font-[Lexend]">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-xl shadow hover:border-[#97C040] border transition">
          <h2 className="text-lg font-semibold">Total Users</h2>
          <p className="text-3xl mt-2">{stats.users}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:border-[#97C040] border transition">
          <h2 className="text-lg font-semibold">Total Listings</h2>
          <p className="text-3xl mt-2">{stats.listings}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:border-[#97C040] border transition">
          <h2 className="text-lg font-semibold">Messages</h2>
          <p className="text-3xl mt-2">{stats.messages}</p>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;

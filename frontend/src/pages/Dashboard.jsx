import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaUsers, FaFileAlt, FaCommentDots, FaEnvelope, FaFileInvoiceDollar } from 'react-icons/fa';

const StatCard = ({ title, count, icon, color }) => (
  <div className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${color} flex items-center justify-between`}>
    <div>
      <p className="text-gray-500 text-sm uppercase font-semibold">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800 mt-1">{count}</h3>
    </div>
    <div className={`text-4xl opacity-20 ${color.replace('border-', 'text-')}`}>
      {icon}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    registered_users: 0,
    total_posts: 0,
    not_approved_posts: 0,
    inquiries_count: 0,
    pending_quotations_count: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/dashboard/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats');
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Registered Users"
          count={stats.registered_users}
          icon={<FaUsers />}
          color="border-blue-500"
        />
        <StatCard
          title="Total Posts"
          count={stats.total_posts}
          icon={<FaFileAlt />}
          color="border-green-500"
        />
        <StatCard
          title="Pending Posts"
          count={stats.not_approved_posts}
          icon={<FaFileAlt />}
          color="border-yellow-500"
        />
        <StatCard
          title="Inquiries"
          count={stats.inquiries_count}
          icon={<FaEnvelope />}
          color="border-purple-500"
        />
        <StatCard
          title="Pending Quotations"
          count={stats.pending_quotations_count}
          icon={<FaFileInvoiceDollar />}
          color="border-red-500"
        />
      </div>
    </div>
  );
};

export default Dashboard;

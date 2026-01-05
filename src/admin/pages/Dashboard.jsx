import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    blogs: 0,
    quotations: 0,
    pendingQuotations: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projects, blogs, quotations] = await Promise.all([
          axios.get('/api/projects'),
          axios.get('/api/blogs'),
          axios.get('/api/quotations')
        ]);

        setStats({
          projects: projects.data.length,
          blogs: blogs.data.length,
          quotations: quotations.data.length,
          pendingQuotations: quotations.data.filter(q => q.status === 'PENDING').length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-white">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm uppercase">Total Projects</h3>
          <p className="text-3xl font-bold text-accent mt-2">{stats.projects}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm uppercase">Total Blogs</h3>
          <p className="text-3xl font-bold text-accent mt-2">{stats.blogs}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm uppercase">Total Quotations</h3>
          <p className="text-3xl font-bold text-accent mt-2">{stats.quotations}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm uppercase">Pending Quotations</h3>
          <p className="text-3xl font-bold text-red-500 mt-2">{stats.pendingQuotations}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

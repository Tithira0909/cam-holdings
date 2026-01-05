import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);

  const fetchQuotations = async () => {
    try {
      const res = await axios.get('/api/quotations');
      setQuotations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/quotations/${id}`, { status });
      fetchQuotations();
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors = {
    'PENDING': 'text-yellow-500',
    'CONTACTED': 'text-blue-500',
    'APPROVED': 'text-green-500',
    'REJECTED': 'text-red-500',
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-white">Quotations</h1>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-400">
            <thead className="bg-gray-900 text-gray-200 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(q.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{q.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{q.email}</td>
                  <td className="px-6 py-4 text-sm max-w-xs truncate" title={q.message}>{q.message}</td>
                  <td className={`px-6 py-4 whitespace-nowrap font-bold text-xs ${statusColors[q.status] || 'text-white'}`}>
                    {q.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <select
                      value={q.status}
                      onChange={(e) => updateStatus(q.id, e.target.value)}
                      className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-accent"
                    >
                       <option value="PENDING">Pending</option>
                       <option value="CONTACTED">Contacted</option>
                       <option value="APPROVED">Approved</option>
                       <option value="REJECTED">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
              {quotations.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No quotations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Quotations;

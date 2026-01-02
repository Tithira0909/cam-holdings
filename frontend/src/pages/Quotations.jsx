import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const { data } = await api.get('/quotations');
      setQuotations(data);
    } catch (err) {
      toast.error('Failed to fetch quotations');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/quotations/${id}/status`, { status });
      toast.success('Status updated');
      fetchQuotations();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        await api.delete(`/quotations/${id}`);
        toast.success('Quotation deleted');
        fetchQuotations();
      } catch (err) {
        toast.error('Failed to delete quotation');
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Customer Quotations</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotations.map((quote) => (
              <tr key={quote.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{quote.id}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-lg">{quote.details}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <select
                    value={quote.status}
                    onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                    className={`rounded border-gray-300 text-sm font-semibold py-1 px-2 border focus:ring focus:ring-opacity-50
                      ${quote.status === 'Approved' ? 'text-green-800 bg-green-100' :
                        quote.status === 'Rejected' ? 'text-red-800 bg-red-100' : 'text-yellow-800 bg-yellow-100'}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDelete(quote.id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Quotations;

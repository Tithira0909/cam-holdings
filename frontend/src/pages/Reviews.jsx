import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get('/reviews');
      setReviews(data);
    } catch (err) {
      toast.error('Failed to fetch reviews');
    }
  };

  const handleStatusChange = async (id, isApproved) => {
    try {
      await api.patch(`/reviews/${id}/status`, { is_approved: isApproved });
      toast.success(`Review ${isApproved ? 'approved' : 'hidden'}`);
      fetchReviews();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/reviews/${id}`);
        toast.success('Review deleted');
        fetchReviews();
      } catch (err) {
        toast.error('Failed to delete review');
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.map((review) => (
              <tr key={review.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{review.customer_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-500">{'★'.repeat(review.rating)}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{review.comment}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${review.is_approved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {review.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {!review.is_approved ? (
                    <button onClick={() => handleStatusChange(review.id, true)} className="text-green-600 hover:text-green-900 mr-4" title="Approve">
                      <FaCheck />
                    </button>
                  ) : (
                    <button onClick={() => handleStatusChange(review.id, false)} className="text-yellow-600 hover:text-yellow-900 mr-4" title="Hide">
                      <FaTimes />
                    </button>
                  )}
                  <button onClick={() => handleDelete(review.id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reviews;

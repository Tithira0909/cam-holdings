import React, { useState, useEffect } from 'react';
import api from '../../lib/api';

const Services = () => {
  const [services, setServices] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    service_type_id: '',
    estimated_cost: '',
    description: '',
    status: 'draft',
    image: null
  });

  useEffect(() => {
    fetchServices();
    fetchServiceTypes();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await api.get('/admin/services');
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceTypes = async () => {
    try {
      const data = await api.get('/admin/service-types');
      setServiceTypes(data);
    } catch (error) {
      console.error('Error fetching service types:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        service_type_id: service.service_type_id,
        estimated_cost: service.estimated_cost || '',
        description: service.description || '',
        status: service.status,
        image: null // Don't reset image unless changed
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        service_type_id: '',
        estimated_cost: '',
        description: '',
        status: 'draft',
        image: null
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('service_type_id', formData.service_type_id);
    data.append('estimated_cost', formData.estimated_cost);
    data.append('description', formData.description);
    data.append('status', formData.status);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      if (editingService) {
        await api.put(`/admin/services/${editingService.id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/admin/services', data, {
             headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setShowModal(false);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await api.delete(`/admin/services/${id}`);
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  // Helper to construct image URL
  const getImageUrl = (path) => {
    if (!path) return '/placeholder.svg'; // Fallback
    if (path.startsWith('http')) return path;
    // Normalize path to ensure it starts with /uploads/
    const cleanPath = path.replace(/^uploads\//, '');
    return `http://localhost:3000/uploads/${cleanPath}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Service Listings</h1>
        <button
          onClick={() => openModal()}
          className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold py-2 px-4 rounded transition-colors"
        >
          Add New Item
        </button>
      </div>

      <div className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-900 text-gray-400 border-b border-neutral-700 text-sm uppercase tracking-wider">
              <th className="p-4">Image</th>
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Est. Cost</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700">
            {loading ? (
              <tr><td colSpan="6" className="p-4 text-center text-gray-500">Loading...</td></tr>
            ) : services.length === 0 ? (
              <tr><td colSpan="6" className="p-4 text-center text-gray-500">No services found.</td></tr>
            ) : (
              services.map((service) => (
                <tr key={service.id} className="hover:bg-neutral-700/50 transition-colors">
                  <td className="p-4">
                    <img
                      src={getImageUrl(service.image_url)}
                      alt={service.name}
                      className="w-16 h-12 object-cover rounded border border-neutral-600"
                    />
                  </td>
                  <td className="p-4 text-white font-medium">{service.name}</td>
                  <td className="p-4 text-gray-300">{service.service_type_name}</td>
                  <td className="p-4 text-gray-300">{service.estimated_cost || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      service.status === 'published' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {service.status === 'published' ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openModal(service)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {editingService ? 'Edit Service Listing' : 'Add New Service Listing'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Title / Property Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:border-yellow-600 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Category *</label>
                  <select
                    name="service_type_id"
                    value={formData.service_type_id}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:border-yellow-600 outline-none transition-colors"
                  >
                    <option value="">Select Category</option>
                    {serviceTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Estimated Cost (Optional)</label>
                <input
                  type="text"
                  name="estimated_cost"
                  value={formData.estimated_cost}
                  onChange={handleInputChange}
                  placeholder="e.g. $1.2M - $1.5M"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:border-yellow-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Short Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:border-yellow-600 outline-none transition-colors"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:border-yellow-600 outline-none transition-colors"
                  >
                    <option value="draft">Draft (Inactive)</option>
                    <option value="published">Active (Published)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Main Image</label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-gray-300 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-neutral-700 file:text-white hover:file:bg-neutral-600"
                  />
                  {editingService && editingService.image_url && !formData.image && (
                     <p className="text-xs text-gray-500 mt-1">Current: {editingService.image_url.split(/[/\\]/).pop()}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-neutral-800 space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-6 rounded transition-colors"
                >
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;

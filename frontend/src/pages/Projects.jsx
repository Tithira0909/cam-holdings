import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { FaTrash, FaPlus, FaImages } from 'react-icons/fa';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: '', images: [] });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      toast.error('Failed to fetch projects');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${id}`);
        toast.success('Project deleted');
        fetchProjects();
      } catch (err) {
        toast.error('Failed to delete project');
      }
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, images: Array.from(e.target.files) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    formData.images.forEach(image => {
      data.append('images', image);
    });

    try {
      await api.post('/projects', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Project created');
      setIsModalOpen(false);
      setFormData({ title: '', description: '', category: '', images: [] });
      fetchProjects();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700">
          <FaPlus className="mr-2" /> Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow overflow-hidden">
            {project.images && JSON.parse(project.images).length > 0 ? (
              <img
                src={`http://localhost:5000/${JSON.parse(project.images)[0]}`}
                alt={project.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                <FaImages size={32} />
              </div>
            )}
            <div className="p-4">
              <span className="text-xs font-semibold text-blue-600 uppercase">{project.category}</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1">{project.title}</h3>
              <p className="text-gray-500 text-sm mt-2 line-clamp-2">{project.description}</p>
              <button
                onClick={() => handleDelete(project.id)}
                className="mt-4 text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
              >
                <FaTrash className="mr-1" /> Delete Project
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Project</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full border p-2 rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full border p-2 rounded"
                rows="3"
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full border p-2 rounded"
              />
              <div>
                <label className="block text-sm text-gray-600 mb-1">Images</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;

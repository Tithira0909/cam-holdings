import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', image_url: '' });
  const [isEditing, setIsEditing] = useState(null);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`/api/projects/${isEditing}`, formData);
      } else {
        await axios.post('/api/projects', formData);
      }
      setFormData({ title: '', description: '', image_url: '' });
      setIsEditing(null);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await axios.delete(`/api/projects/${id}`);
        fetchProjects();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEdit = (project) => {
    setFormData({ title: project.title, description: project.description, image_url: project.image_url });
    setIsEditing(project.id);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-white">Manage Projects</h1>

      <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-accent">{isEditing ? 'Edit Project' : 'Add New Project'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-accent focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-accent focus:outline-none"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Image URL</label>
            <input
              type="text"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-accent focus:outline-none"
            />
          </div>
          <button type="submit" className="bg-accent text-primary px-6 py-2 rounded font-bold hover:bg-yellow-600 transition-colors">
            {isEditing ? 'Update Project' : 'Add Project'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => { setIsEditing(null); setFormData({ title: '', description: '', image_url: '' }); }}
              className="ml-4 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            {project.image_url && (
              <img src={project.image_url} alt={project.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-3">{project.description}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(project)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;

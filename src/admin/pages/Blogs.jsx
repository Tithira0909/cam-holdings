import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [formData, setFormData] = useState({ title: '', content: '', author: '', image_url: '' });
  const [isEditing, setIsEditing] = useState(null);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get('/api/blogs');
      setBlogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`/api/blogs/${isEditing}`, formData);
      } else {
        await axios.post('/api/blogs', formData);
      }
      setFormData({ title: '', content: '', author: '', image_url: '' });
      setIsEditing(null);
      fetchBlogs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await axios.delete(`/api/blogs/${id}`);
        fetchBlogs();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEdit = (blog) => {
    setFormData({ title: blog.title, content: blog.content, author: blog.author, image_url: blog.image_url });
    setIsEditing(blog.id);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-white">Manage Blogs</h1>

      <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-accent">{isEditing ? 'Edit Blog' : 'Add New Blog'}</h2>
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
            <label className="block text-gray-400 mb-1">Author</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-accent focus:outline-none"
              rows="5"
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
            {isEditing ? 'Update Blog' : 'Add Blog'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => { setIsEditing(null); setFormData({ title: '', content: '', author: '', image_url: '' }); }}
              className="ml-4 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {blogs.map((blog) => (
          <div key={blog.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 p-6">
             <div className="flex justify-between items-start">
               <div>
                  <h3 className="text-xl font-bold text-white mb-2">{blog.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">By {blog.author} | {new Date(blog.created_at).toLocaleDateString()}</p>
               </div>
               <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(blog)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(blog.id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
             </div>
            <p className="text-gray-300 whitespace-pre-line">{blog.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blogs;

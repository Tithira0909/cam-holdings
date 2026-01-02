import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings/site');
      setSettings(data);
    } catch (err) {
      toast.error('Failed to fetch settings');
    }
  };

  const handleUpdate = async (key, value) => {
    try {
      await api.post('/settings/site', { key, value });
      toast.success('Site setting updated');
      fetchSettings();
    } catch (err) {
      toast.error('Failed to update setting');
    }
  };

  const handleAddNew = (e) => {
    e.preventDefault();
    if (newKey && newValue) {
      handleUpdate(newKey, newValue);
      setNewKey('');
      setNewValue('');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Site Settings</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Setting</h2>
        <form onSubmit={handleAddNew} className="flex gap-4">
          <input
            type="text"
            placeholder="Key (e.g., contact_email)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Add</button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setting Key</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {settings.map((setting) => (
              <tr key={setting.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{setting.setting_key}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <input
                    type="text"
                    defaultValue={setting.setting_value}
                    onBlur={(e) => handleUpdate(setting.setting_key, e.target.value)}
                    className="border-gray-300 border rounded px-2 py-1 w-full"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-500">
                  Blur to save
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Settings;

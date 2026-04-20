import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock, RefreshCw, Check, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const APIKeyManagement = () => {
  const [apiConfigs, setApiConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    provider: 'openai',
    api_key: '',
    is_active: true
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch API configurations
  useEffect(() => {
    fetchApiConfigs();
  }, []);

  const fetchApiConfigs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/accounts/api-configuration/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setApiConfigs(response.data);
    } catch (error) {
      console.error('Error fetching API configs:', error);
      setMessage('Failed to load API configurations');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.api_key) {
      setMessage('Please enter an API key');
      setMessageType('error');
      return;
    }

    try {
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };

      if (editingId) {
        // Update existing
        const response = await axios.patch(
          `${API_BASE_URL}/accounts/api-configuration/${editingId}/`,
          {
            api_key: formData.api_key,
            is_active: formData.is_active
          },
          { headers }
        );
        setMessage('API configuration updated successfully');
        setMessageType('success');
      } else {
        // Create new
        const response = await axios.post(
          `${API_BASE_URL}/accounts/api-configuration/`,
          formData,
          { headers }
        );
        setMessage('API configuration added successfully');
        setMessageType('success');
      }

      // Reset form and refresh
      setFormData({ provider: 'openai', api_key: '', is_active: true });
      setShowForm(false);
      setEditingId(null);
      fetchApiConfigs();
    } catch (error) {
      const errorMsg = error.response?.data?.api_key?.[0] || error.response?.data?.error || 'Failed to save configuration';
      setMessage(errorMsg);
      setMessageType('error');
    }
  };

  const testConnection = async (configId) => {
    setTestLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/accounts/api-configuration/test_connection/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setMessage(`✓ ${response.data.message} - ${response.data.models_available ? 'Models available' : 'No models'}`);
      setMessageType('success');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Connection test failed';
      setMessage(errorMsg);
      setMessageType('error');
    } finally {
      setTestLoading(false);
    }
  };

  const deleteConfig = async (configId) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        await axios.delete(
          `${API_BASE_URL}/accounts/api-configuration/${configId}/`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setMessage('Configuration deleted successfully');
        setMessageType('success');
        fetchApiConfigs();
      } catch (error) {
        setMessage('Failed to delete configuration');
        setMessageType('error');
      }
    }
  };

  const handleEdit = (config) => {
    setFormData({
      provider: config.provider,
      api_key: '',
      is_active: config.is_active
    });
    setEditingId(config.id);
    setShowForm(true);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Lock className="w-8 h-8" />
          API Key Management
        </h1>
        <p className="text-gray-600">Manage your OpenAI API keys for the chatbot and analytics features</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${
          messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {messageType === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message}
        </div>
      )}

      <button
        onClick={() => {
          setShowForm(!showForm);
          setEditingId(null);
          setFormData({ provider: 'openai', api_key: '', is_active: true });
        }}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        {showForm ? 'Cancel' : '+ Add API Key'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Provider</label>
            <select
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              disabled={editingId !== null}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="openai">OpenAI</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">API Key</label>
            <input
              type="password"
              value={formData.api_key}
              onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
              placeholder={editingId ? 'Leave blank to keep current key' : 'sk-...'}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your API key is securely stored and never shared. Get it from https://platform.openai.com/api-keys
            </p>
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm font-medium">Set as active configuration</label>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            {editingId ? 'Update' : 'Add'} API Configuration
          </button>
        </form>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Active Configurations</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading configurations...</div>
        ) : apiConfigs.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            No API configurations yet. Add one to enable the chatbot and analytics features.
          </div>
        ) : (
          apiConfigs.map((config) => (
            <div key={config.id} className={`border rounded-lg p-4 ${config.is_active ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{config.provider_display}</h3>
                  <p className={`text-sm ${config.is_active ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                    {config.is_active ? '✓ Active' : 'Inactive'}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  <p>Key: {config.api_key_masked}</p>
                  <p>Updated: {new Date(config.updated_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => testConnection(config.id)}
                  disabled={testLoading}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Test Connection
                </button>
                <button
                  onClick={() => handleEdit(config)}
                  className="flex-1 px-3 py-2 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
                >
                  Update
                </button>
                <button
                  onClick={() => deleteConfig(config.id)}
                  className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default APIKeyManagement;

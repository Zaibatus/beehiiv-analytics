import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ApiConfigForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    apiKey: '',
    publicationId: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      console.log('Sending request to save config...', `${API_URL}/api/config`);
      const response = await fetch(`${API_URL}/api/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Response:', response.status, data);

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
      }

      // If successful, navigate to subscribers page
      navigate('/subscribers');
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container max-w-md w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-pink-700 mb-2">API Configuration</h2>
        <p className="text-gray-600">Enter your Beehiiv API credentials below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="apiKey" className="form-label">
            API Key
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <input
              type="password"
              id="apiKey"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your API key"
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Your API key will be encrypted and stored securely
          </p>
        </div>
        
        <div className="form-group">
          <label htmlFor="publicationId" className="form-label">
            Publication ID
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="publicationId"
              name="publicationId"
              value={formData.publicationId}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your publication ID"
              required
              autoComplete="off"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Found in your Beehiiv publication settings
          </p>
        </div>

        <button 
          type="submit" 
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}

export default ApiConfigForm; 
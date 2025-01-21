import React, { useState } from 'react';
import './ApiCredentialsForm.css';

const ApiCredentialsForm = ({ onSubmit }) => {
  const [credentials, setCredentials] = useState({
    apiKey: '',
    publicationId: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(credentials);
  };

  return (
    <div className="credentials-container">
      <form onSubmit={handleSubmit} className="credentials-form">
        <h2>Connect to Beehiiv</h2>
        <div className="form-group">
          <label htmlFor="apiKey">API Key</label>
          <input
            type="password"
            id="apiKey"
            value={credentials.apiKey}
            onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
            placeholder="Enter your Beehiiv API key"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="publicationId">Publication ID</label>
          <input
            type="text"
            id="publicationId"
            value={credentials.publicationId}
            onChange={(e) => setCredentials({ ...credentials, publicationId: e.target.value })}
            placeholder="Enter your Publication ID"
            required
          />
        </div>
        <button type="submit">Connect</button>
      </form>
    </div>
  );
};

export default ApiCredentialsForm; 
import React, { useState } from 'react';
import './ApiCredentialsForm.css';

/**
* A form component to collect API credentials and handle submission.
* @example
* onSubmit({ apiKey: 'yourApiKey', publicationId: 'yourPublicationId' })
* // Calls the onSubmit function with provided credentials
* @param {function} {onSubmit} - Callback function invoked with the credentials when the form is submitted.
* @returns {JSX.Element} A form for entering API key and publication ID with a submit button.
* @description
*   - Utilizes React `useState` to manage form input values for `apiKey` and `publicationId`.
*   - Prevents default form submission behavior using `e.preventDefault()`.
*   - The component is styled with a className of "credentials-container" and each form element is wrapped in a "form-group".
*/
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
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ConfigPage from './pages/ConfigPage';
import SubscribersPage from './pages/SubscribersPage';
import React from 'react';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ConfigPage />} />
        <Route path="/subscribers" element={<SubscribersPage />} />
      </Routes>
    </Router>
  );
}

export default App;

import React from 'react';
import SubscriberStats from './SubscriberStats';

const SubscriberStats = ({ subscribers }) => {
  // Calculate basic statistics
  const totalSubscribers = subscribers?.length || 0;
  const activeSubscribers = subscribers?.filter(sub => sub.status === 'active').length || 0;
  const inactiveSubscribers = totalSubscribers - activeSubscribers;

  return (
    <div className="stats-container">
      <div className="stat-box">
        <h3>Total Subscribers</h3>
        <p>{totalSubscribers}</p>
      </div>
      <div className="stat-box">
        <h3>Active Subscribers</h3>
        <p>{activeSubscribers}</p>
      </div>
      <div className="stat-box">
        <h3>Inactive Subscribers</h3>
        <p>{inactiveSubscribers}</p>
      </div>
    </div>
  );
};

export default SubscriberStats; 
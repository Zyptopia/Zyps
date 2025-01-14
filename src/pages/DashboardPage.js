import React from 'react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  return (
    <div className="page-content">
      <h1>Welcome to your Dashboard!</h1>
      <Link to="/data-input">Go to Data Input Page</Link>
    </div>
  );
};

export default DashboardPage;

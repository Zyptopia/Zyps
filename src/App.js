import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Firebase v9+ modular imports
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ZypsEarningsCalculator from './pages/ZypsEarningsCalculator';
import AboutPage from './pages/AboutPage';
import DataInputPage from './pages/DataInputPage'; // Import the data input page
import LoginPage from './pages/LoginPage'; // Import the login page
import DashboardPage from './pages/DashboardPage'; // Add a new dashboard page
import './styles/App.css';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth(); // Get Firebase Auth instance
    const unsubscribe = onAuthStateChanged(auth, setUser); // Listen for auth state changes
    return () => unsubscribe(); // Clean up listener when the component is unmounted
  }, []);

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />  {/* Public pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/calculator" element={<ZypsEarningsCalculator />} />
        <Route path="/login" element={<LoginPage />} />  {/* Login page (only accessible at /login) */}
        
        {/* Protected route for DataInputPage */}
        <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
        
        {/* If the user is logged in, they are redirected to the dashboard */}
        <Route path="/data-input" element={user ? <DataInputPage /> : <Navigate to="/login" />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;

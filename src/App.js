import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'; // Added useLocation
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getAnalytics, logEvent } from 'firebase/analytics'; // Import Firebase Analytics
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ZypsEarningsCalculator from './pages/CalculatorPage';
import HistoricalZypsPage from './pages/HistoricalZypsPage';
import AboutZyptoPage from './pages/AboutZyptoPage';
import AboutPage from './pages/AboutPage';
import DataInputPage from './pages/DataInputPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import './styles/App.css';

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const analytics = getAnalytics();
    logEvent(analytics, 'page_view', {
      page_path: location.pathname,
    });
  }, [location]);

  return null;
};

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <AnalyticsTracker />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Zyps" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/calculator" element={<ZypsEarningsCalculator />} />
        <Route path="/historical" element={<HistoricalZypsPage />} />
        <Route path="/about-zypto" element={<AboutZyptoPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/data-input" element={user ? <DataInputPage /> : <Navigate to="/login" />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;

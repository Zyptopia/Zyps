// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import Header from './components/Header';
import Footer from './components/Footer';
import SeoHelmet from './components/SeoHelmet';

import HomePage from './pages/HomePage';
import ZypsEarningsCalculator from './pages/CalculatorPage';
import AboutPage from './pages/AboutPage';
import DataInputPage from './pages/DataInputPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HistoricalPage from './pages/HistoricalZypsPage';
import AboutZyptoPage from './pages/AboutZyptoPage';
import VaultKeyCardPage from './pages/VaultKeyCardPage';
import GetStartedPage from './pages/GetStartedPage';
import FAQPage from './pages/FaqPage';
import AnalyticsPage from './pages/AnalyticsPage';
import StatsPage from './pages/StatsPage';


import './styles/App.css';

// Guard that sets robots noindex on private paths
function RobotsGuard() {
  const location = useLocation();
  useEffect(() => {
    const privatePaths = ['/dashboard', '/analytics', '/data-input'];
    const noindex = privatePaths.some((p) => location.pathname.startsWith(p));
    const tag = document.head.querySelector('meta[name="robots"]') || (() => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'robots');
      document.head.appendChild(m);
      return m;
    })();
    tag.setAttribute('content', noindex ? 'noindex, nofollow' : 'index, follow');
  }, [location.pathname]);
  return null;
}

const App = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  return (
    <Router>
      {/* Site-wide SEO defaults */}
      <SeoHelmet
        title="Zyptopia.org – Community data, calculators & guides for Zypto"
        description="Independent, community-run tools for Zypto users: daily reward history, calculators, neutral guides, and Vault Key Card overview."
        canonical="https://www.zyptopia.org/"
      />
      <RobotsGuard />

      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/get-started" element={<GetStartedPage />} />
        <Route path="/calculator" element={<ZypsEarningsCalculator />} />
        <Route path="/historical" element={<HistoricalPage />} />
        <Route path="/about-zypto" element={<AboutZyptoPage />} />
        <Route path="/vault-key-card" element={<VaultKeyCardPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/stats" element={<StatsPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/data-input" element={user ? <DataInputPage /> : <Navigate to="/login" />} />
        <Route path="/analytics" element={user ? <AnalyticsPage /> : <Navigate to="/login" />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;

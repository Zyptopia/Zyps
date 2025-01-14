import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ZypsEarningsCalculator from './pages/ZypsEarningsCalculator';
import AboutPage from './pages/AboutPage';
import DataInputPage from './pages/DataInputPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import './styles/App.css';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/calculator" element={<ZypsEarningsCalculator />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/data-input" element={user ? <DataInputPage /> : <Navigate to="/login" />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;

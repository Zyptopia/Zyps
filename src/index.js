// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { app, db } from './firebase';
import { initAnalytics, initEventMirroring } from './analytics';

initAnalytics(app);

// Mirror a curated set of events to Firestore for the admin dashboard
initEventMirroring(db, {
  sample: 1, // set to 0.5 to halve writes if you want
  // events: [...] // keep default list or customise
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();

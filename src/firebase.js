// src/firebase.js

// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";      // Firestore database
import { getAnalytics, logEvent as fbLogEvent } from "firebase/analytics"; // Analytics + logEvent helper

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjJIYqMoPhIXGYxb8FO1Dr7BssmJA-PYQ",
  authDomain: "zyptopia-7a4dc.firebaseapp.com",
  projectId: "zyptopia-7a4dc",
  storageBucket: "zyptopia-7a4dc.firebasestorage.app",
  messagingSenderId: "521640938004",
  appId: "1:521640938004:web:6dea338ae8a7a3106a7501",
  measurementId: "G-4FBN7FGWTL"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Analytics
const analytics = getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app);

// Wrap logEvent so you can import it directly:
function logEvent(eventName, params) {
  return fbLogEvent(analytics, eventName, params);
}

// Export everything you need across your codebase
export { app, db, analytics, logEvent };

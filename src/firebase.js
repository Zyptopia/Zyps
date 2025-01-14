// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";  // Firestore
import { getAnalytics } from "firebase/analytics";  // Optional, if using Analytics

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);  // Only if you're using analytics

// Initialize Firestore
const db = getFirestore(app);

// Export Firestore db
export { db };
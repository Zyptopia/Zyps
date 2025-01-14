import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'; // Firebase v9+ imports
import { useNavigate } from 'react-router-dom'; // Use react-router for navigation

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard'); // Redirect to the dashboard page after successful login
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/dashboard'); // Redirect to the dashboard page after Google login
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="page-content">
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message if there is one */}

      {/* Email and Password login form */}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login with Email</button>
      </form>

      {/* Google login button */}
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  );
};

export default LoginPage;

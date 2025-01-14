import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link for client-side navigation
import { getAuth, signOut } from 'firebase/auth';

function Header() {
  const auth = getAuth(); // Get Firebase Auth instance
  const navigate = useNavigate(); // Hook for navigation

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign the user out
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      alert('Error logging out: ' + error.message); // Show error if sign-out fails
    }
  };

  return (
    <header className="App-header">
      <div className="header-container">
        <h1 className="logo">Zyptopia</h1>
        <nav className="navigation">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          {/* Show the Data Input link and Log Out button only if the user is logged in */}
          {auth.currentUser && (
            <>
              <Link to="/data-input" className="nav-link">Data Input</Link>
              <button onClick={handleLogout} className="nav-button">Log Out</button>
            </>
          )}
          {/* Added "Download Zypto App" link */}
          <a href="https://ref.zypto.com/ZRxWOW84IOb" target="_blank" rel="noopener noreferrer" className="nav-link">
            Download Zypto App
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Header;

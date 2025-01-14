import React from 'react';
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

function Menu({ handleLogout }) {
  const auth = getAuth();

  return (
    <nav className="navigation">
      <Link to="/" className="nav-link">Home</Link>
      <Link to="/about" className="nav-link">About</Link>
      {auth.currentUser && (
        <>
          <Link to="/data-input" className="nav-link">Data Input</Link>
          <button onClick={handleLogout} className="nav-button">Log Out</button>
        </>
      )}
      <a href="https://ref.zypto.com/ZRxWOW84IOb" target="_blank" rel="noopener noreferrer" className="nav-link">
        Download Zypto App
      </a>
    </nav>
  );
}

export default Menu;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import Logo from './Logo'; // Import the Logo component
import Menu from './Menu'; // Import the Menu component

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
        <Logo />  {/* Logo component */}
        <Menu handleLogout={handleLogout} />  {/* Menu component */}
      </div>
    </header>
  );
}

export default Header;

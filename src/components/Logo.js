import React from 'react';
import logo from '../assets/logo.png';  // Use ../ to go up one level


function Logo() {
  return (
    <div className="logo-container">
      <img src={logo} alt="Zypto Logo" className="logo" />
    </div>
  );
}

export default Logo;

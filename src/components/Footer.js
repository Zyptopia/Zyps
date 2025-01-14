import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link for client-side navigation

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="App-footer">
      <p>
        <strong>Disclaimer</strong><br />
        This is a community-driven site and is not affiliated with Zypto or the Zypto company. 
        All content is for informational purposes only and does not constitute financial advice. 
        Use this site at your own risk.
      </p>
      <p>© {currentYear} Zyptopia. All rights reserved.</p>
      <p> <Link to="/login" className="nav-link">Login</Link></p>
    </footer>
  );
};

export default Footer;

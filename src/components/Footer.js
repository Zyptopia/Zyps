import React from 'react';

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
    </footer>
  );
};

export default Footer;

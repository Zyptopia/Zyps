import React from 'react';

const AboutPage = () => (
  <div className="page-content">
    <h1>About Zyptopia</h1>
    <h2>Disclaimer</h2>
    <p>
      This website is a community-driven project and is not affiliated, associated, authorized, endorsed by, 
      or in any way officially connected with Zypto or the Zypto company. All trademarks, service marks, 
      and company names or logos appearing on the site are the property of their respective owners.
    </p>
    <p>
      The information provided on this website is for informational and educational purposes only and 
      should not be construed as financial advice. The creators of this site are not financial advisors, 
      and any decisions you make based on the content provided are made at your own risk. Always conduct 
      your own research or consult with a licensed financial advisor before making investment decisions.
    </p>
    <p>
      The content, design, and functionality of this website are protected by copyright law. Unauthorized 
      use, reproduction, or distribution of any part of this website without prior written consent is strictly prohibited.
    </p>
    <p>
      Learn more about the Zypto token{" "}
      <a 
        href="https://zypto.com" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ color: '#00BFFF', textDecoration: 'none' }}
      >
         here
      </a>.
    </p>
  </div>
);

export default AboutPage;

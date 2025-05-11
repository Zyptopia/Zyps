// src/pages/AboutPage.js
import React from 'react';

export default function AboutPage() {
  return (
    <div className="page-content">
      {/* Page Title */}
      <h1 className="page-title">About Zyptopia</h1>

      {/* Site Disclaimer Card */}
      <section className="info-card">
        <h2>Site Disclaimer</h2>
        <p>
          Zyptopia is an independent, community-driven site and is not affiliated with,
          endorsed by, or officially connected to the Zypto company. All trademarks,
          service marks, and company names on this site are the property of their respective owners.
        </p>
      </section>

      {/* Informational Purposes Card */}
      <section className="info-card">
        <h2>Informational Purposes Only</h2>
        <p>
          The content on Zyptopia is for educational and informational purposes only and
          should not be construed as financial advice. We are not certified financial advisors.
          Always conduct your own research or consult with a licensed professional
          before making investment decisions.
        </p>
      </section>

      {/* Copyright & Usage Card */}
      <section className="info-card">
        <h2>Copyright & Restrictions</h2>
        <p>
          All content, design, and functionality on Zyptopia are protected by copyright law.
          Unauthorized use, reproduction, or distribution of any part of this site
          without prior written consent is strictly prohibited.
        </p>
      </section>

      {/* Official Source Card */}
      <section className="info-card">
        <h2>Learn More</h2>
        <p>
          For official information on the Zypto token, products, and services,
          please visit{' '}
          <a
            href="https://zypto.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#00BFFF', fontWeight: 'bold' }}
          >
            Zypto.com
          </a>.
        </p>
      </section>
    </div>
  );
}

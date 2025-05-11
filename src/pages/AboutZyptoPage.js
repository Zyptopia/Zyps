// src/pages/AboutZyptoPage.js

import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { logEvent } from '../firebase';

export default function AboutZyptoPage() {
  // Analytics: track page view
  useEffect(() => {
    logEvent('page_view', { page: 'about_zypto' });
  }, []);

  const cardStyle = {
    backgroundColor: '#282c34',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    color: '#fff',
    boxSizing: 'border-box',
    width: '100%',
  };
  const containerStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem 1rem',
  };
  const navStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  };
  const linkStyle = { color: '#61dafb', textDecoration: 'none', fontWeight: 'bold' };
  const footnoteStyle = {
    fontSize: '0.65rem',
    color: '#fff',
    lineHeight: '1.4',
    marginTop: '1rem',
    textAlign: 'center',
  };

  return (
    <>
      <Helmet>
        <title>Learn More About Zypto – Zyptopia</title>
        <meta
          name="description"
          content="Dive into Zypto's mission, app features, rewards hub, and Vault Key Card. Independent guide by Zyptopia."
        />
        <meta property="og:title" content="Learn More About Zypto – Zyptopia" />
        <meta
          property="og:description"
          content="Comprehensive overview of Zypto's ecosystem: token, app, rewards, cold storage, and solutions."
        />
        <meta property="og:url" content="https://www.zyptopia.org/about-zypto" />
        <meta property="og:image" content="https://www.zyptopia.org/assets/about-zypto-og.png" />
      </Helmet>

      <div style={containerStyle} className="page-content">
        {/* Independence Disclaimer */}
        <p style={{ color: '#ccc', fontStyle: 'italic', textAlign: 'center' }}>
          Zyptopia.org is an independent, community-created site and is not affiliated with, endorsed by,{' '}
          or officially connected to Zypto. For official information, visit{' '}
          <a href="https://zypto.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00BFFF' }}>
            Zypto.com
          </a>
          .
        </p>

        {/* Page Header */}
        <h1 style={{ textAlign: 'center', color: '#00BFFF', marginBottom: '1rem' }}>Learn About Zypto</h1>

        {/* Quick Navigation */}
        <h3 style={{ textAlign: 'center', color: '#fff', marginBottom: '0.5rem' }}>Quick Links</h3>
        <div style={navStyle}>
          <a href="#mission" style={linkStyle}>
            Mission
          </a>
          <a href="#app" style={linkStyle}>
            App & Wallet
          </a>
          <a href="#rewards" style={linkStyle}>
            Rewards Hub
          </a>
          <a href="#vault" style={linkStyle}>
            Vault Key Card
          </a>
          <a href="#solutions" style={linkStyle}>
            Solutions
          </a>
          <a href="#roadmap" style={linkStyle}>
            Roadmap
          </a>
          <a href="#community" style={linkStyle}>
            Community
          </a>
        </div>

        {/* Mission */}
        <section id="mission" style={cardStyle}>
          <h2>Company Mission & Background</h2>
          <p>
            Founded in 2021 as a licensed EU Virtual Asset Service Provider, Zypto’s mission is to make
            cryptocurrency intuitive, secure, and accessible for everyone. Their open-source wallet undergoes
            continuous third-party audits to uphold top-tier security standards.<sup>1</sup>
          </p>
          <p>
            With offices in Europe and global partnerships, Zypto balances compliance (KYC/AML) with self-custody
            freedom—empowering users to choose between non-custodial and optional custodial services.
          </p>
        </section>

        {/* App & Wallet */}
        <section id="app" style={cardStyle}>
          <h2>The Zypto App & Multi-Chain Wallet</h2>
          <p>
            The Zypto App integrates over 100 blockchains—including Ethereum, Bitcoin, and Solana—into one unified
            interface with features such as:
          </p>
          <ul style={{ listStylePosition: 'inside', color: '#ccc', margin: '0 auto 1rem', textAlign: 'left' }}>
            <li>
              <span role="img" aria-label="lock">
                🔒
              </span>{' '}
              Fast, 30-second self-custody wallet setup
            </li>
            <li>
              <span role="img" aria-label="exchange">
                🔄
              </span>{' '}
              One-click, low-fee token swaps via integrated DEXs
            </li>
            <li>
              <span role="img" aria-label="chart">
                📊
              </span>{' '}
              Real-time portfolio analytics, price alerts, and watchlists
            </li>
            <li>
              <span role="img" aria-label="fiat">
                💱
              </span>{' '}
              Fiat on/off ramps in 50+ countries
            </li>
          </ul>
          <p>
            Estimate your Zyp rewards with the{' '}
            <Link to="/calculator" style={{ color: '#61dafb', fontWeight: 'bold' }}>
              Earnings Calculator
            </Link>
            .
          </p>
          <p>
            <a
              href="https://ref.zypto.com/ZRxWOW84IOb"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#00BFFF', fontWeight: 'bold' }}
              onClick={() => logEvent('promo_click', { item: 'download_app' })}
            >
              Download the Zypto App now
            </a>
          </p>
        </section>

        {/* Rewards Hub */}
        <section id="rewards" style={cardStyle}>
          <h2>Zypto Token & Zyp Rewards Hub</h2>
          <p>
            Holding the native Zypto token grants daily <strong>Zyp rewards</strong>, funded by network
            transaction fees. Rewards auto-deposit into your Rewards Hub for review and spending options.
            <sup>2</sup>
          </p>
          <p>
            View the complete reward history in the{' '}
            <Link to="/historical-zyps" style={{ color: '#61dafb', fontWeight: 'bold' }}>
              Historical Zyps Table
            </Link>
            .
          </p>
        </section>

        {/* Vault Key Card */}
        <section id="vault" style={cardStyle}>
          <h2>Vault Key Card Cold Storage</h2>
          <p>
            The Zypto Vault Key Card is an NFC-powered cold storage card that keeps private keys offline until
            you tap and authenticate. Features include:<sup>3</sup>
          </p>
          <ul style={{ listStylePosition: 'inside', color: '#ccc', margin: '0 auto 1rem', textAlign: 'left' }}>
            <li>
              <span role="img" aria-label="wireless">
                📶
              </span>{' '}
              NFC-only operation—no Bluetooth or cables required
            </li>
            <li>
              <span role="img" aria-label="lock">
                🔐
              </span>{' '}
              Three-factor authentication: Card tap, biometric unlock, and PIN
            </li>
            <li>
              <span role="img" aria-label="medal">
                🥇
              </span>{' '}
              Aerospace-grade metal construction with NFC-blocking sleeve
            </li>
            <li>
              <span role="img" aria-label="mobile">
                📱
              </span>{' '}
              Direct integration with the Zypto App—no extra software
            </li>
          </ul>
          <p>
            <a
              href="https://ref.zypto.com/ZRxWOW84IOb"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#00BFFF', fontWeight: 'bold' }}
              onClick={() => logEvent('promo_click', { item: 'order_vault_card' })}
            >
              Order your Vault Key Card now
            </a>
            .
          </p>
        </section>

        {/* Solutions */}
        <section id="solutions" style={cardStyle}>
          <h2>Personal & Business Solutions</h2>
          <p>Zypto’s modular platform serves both individuals and enterprises, offering:</p>
          <ul style={{ listStylePosition: 'inside', color: '#ccc', margin: '0 auto 1rem', textAlign: 'left' }}>
            <li>
              <span role="img" aria-label="person">
                👤
              </span>{' '}
              Self-custody wallet, swap, staking, and NFT marketplace
            </li>
            <li>
              <span role="img" aria-label="office">
                🏢
              </span>{' '}
              White-label wallet SDKs, payment APIs, and custodial services
            </li>
          </ul>
          <p>
            Explore enterprise offerings at{' '}
            <a
              href="https://zypto.com/business/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#00BFFF' }}
            >
              zypto.com/business
            </a>
            .
          </p>
        </section>

        {/* Roadmap */}
        <section id="roadmap" style={cardStyle}>
          <h2>Zypto Foundation & Roadmap</h2>
          <p>
            The Zypto Foundation funds open-source grants, educational programs, and security audits to
            strengthen the ecosystem. Upcoming milestones include multi-signature support and real-world asset
            tokenization.<sup>4</sup>
          </p>
        </section>

        {/* Community */}
        <section id="community" style={cardStyle}>
          <h2>Community & Resources</h2>
          <p>Stay connected via the official blog and foundation portal:</p>
          <ul style={{ listStylePosition: 'inside', color: '#ccc', margin: '0 auto 1rem', textAlign: 'left' }}>
            <li>
              <a href="https://zypto.com/blog/" style={{ color: '#00BFFF' }}>
                zypto.com/blog
              </a>
            </li>
            <li>
              <a href="https://zypto.foundation/" style={{ color: '#00BFFF' }}>
                zypto.foundation
              </a>
            </li>
          </ul>
          <p>
            Ready to begin?{' '}
            <a
              href="https://ref.zypto.com/ZRxWOW84IOb"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#00BFFF', fontWeight: 'bold' }}
              onClick={() => logEvent('promo_click', { item: 'download_zypto_app_footer' })}
            >
              Download Now
            </a>
            .
          </p>
          <div style={footnoteStyle}>
            <p>^1 Audits & security: zypto.com/security</p>
            <p>^2 Rewards hub details: zypto.com/crypto-app/rewards-hub</p>
            <p>^3 Card specs: zypto.com/crypto-app/vault-key-card</p>
            <p>^4 Roadmap overview: zypto.com/zypto-company/roadmap</p>
          </div>
        </section>
      </div>
    </>
  );
}

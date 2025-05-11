import React from 'react';
import './PromoBanner.css';
import cardImage from '../assets/vault-key-card-promo.png';
import { analytics } from '../firebase';
import { logEvent } from 'firebase/analytics';
import { Link } from 'react-router-dom';

export default function PromoBanner() {
  return (
    <div className="promo-banner">
      <img
        src={cardImage}
        alt="Zypto Vault Key Card"
        className="promo-banner__img"
      />
      <div className="promo-banner__content">
        <h3>Vault Key Card</h3>
        <p>Secure your Crypto offline with NFC cold storage.</p>
        <div className="promo-banner__btn-group">
          {/* Internal Link to our new About Zypto page */}
          <Link
            to="/about-zypto#vault"
            className="promo-banner__btn"
            onClick={() => {
              logEvent(analytics, 'promo_click', { promo: 'vault_key_card_learn_more' });
            }}
          >
            Learn More
          </Link>
          {/* External referral link */}
          <a
            href="https://ref.zypto.com/ZRxWOW84IOb"
            target="_blank"
            rel="noopener noreferrer"
            className="promo-banner__btn"
            onClick={() => {
              logEvent(analytics, 'promo_click', { promo: 'vault_key_card_get_yours' });
            }}
          >
            Get Yours
          </a>
        </div>
      </div>
    </div>
);
}

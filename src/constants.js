// src/constants.js
// Single source of truth for your referral link + UTM tagging helpers.

const BASE = "https://ref.zypto.com/ZRxWOW84IOb"; // <-- your referral link

export const REFERRAL_URL = BASE;

export const REF_BY_PLACEMENT = (placement) =>
  `${BASE}?utm_source=zyptopia&utm_medium=referral&utm_campaign=site_cta&utm_content=${encodeURIComponent(
    placement || "unknown"
  )}`;

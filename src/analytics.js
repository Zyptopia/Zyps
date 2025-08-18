// src/analytics.js
// Analytics: GA4 + optional Firestore mirroring for admin dashboard.
// Respects Do Not Track and supports local opt-out via setAnalyticsOptOut(true).

let analytics = null;

// --- Firestore mirroring state ---
let mirror = {
  db: null,
  sample: 1, // 1.0 = all events, 0.5 = 50% sampling, etc.
  events: new Set([
    'page_view',
    'cta_click',
    'calculator_used',
    'mini_calc_used',
    'calculator_tab_selected',
    'historical_search',
    'historical_sort',
    'historical_page',
    'historical_custom_holdings',
    'internal_nav',
    'external_nav',
    'analytics_opt_toggle',
  ]),
};

function getOrCreateSid() {
  try {
    const key = 'zyptopia_sid';
    let sid = localStorage.getItem(key);
    if (!sid) {
      sid = crypto && crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now();
      localStorage.setItem(key, sid);
    }
    return sid;
  } catch {
    return 'unknown';
  }
}

export function initAnalytics(firebaseApp) {
  try {
    if (typeof window === 'undefined') return;

    const dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1';
    const optedOut = localStorage.getItem('zyptopia_analytics_optout') === '1';
    if (dnt || optedOut) return;

    import('firebase/analytics').then(({ getAnalytics, isSupported }) => {
      isSupported().then((ok) => {
        if (!ok) return;
        analytics = getAnalytics(firebaseApp);
      });
    });
  } catch {
    // noop
  }
}

// Call this once to enable Firestore mirroring of events (for your admin dashboard)
export function initEventMirroring(db, options = {}) {
  mirror.db = db;
  if (typeof options.sample === 'number') mirror.sample = options.sample;
  if (Array.isArray(options.events)) mirror.events = new Set(options.events);
}

export function trackEvent(name, params = {}) {
  try {
    if (analytics) {
      import('firebase/analytics').then(({ logEvent }) => {
        logEvent(analytics, name, params);
      });
    }
  } catch {
    // noop
  }
  maybeMirror(name, params);
}

export function trackPageView(pathname, extra = {}) {
  const page_location = typeof window !== 'undefined' && window.location ? window.location.href : '';
  trackEvent('page_view', { page_location, page_path: pathname, ...extra });
}

export function setAnalyticsOptOut(on = true) {
  localStorage.setItem('zyptopia_analytics_optout', on ? '1' : '0');
}

function maybeMirror(name, params) {
  try {
    if (!mirror.db) return;
    if (!mirror.events.has(name)) return;
    if (Math.random() > mirror.sample) return;

    const sid = getOrCreateSid();
    const ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : 'unknown';

    import('firebase/firestore').then(({ addDoc, collection, serverTimestamp }) => {
      addDoc(collection(mirror.db, 'events'), {
        name,
        params: params || {},
        ts: serverTimestamp(),
        sid,
        ua,
      }).catch(() => {});
    });
  } catch {
    // noop
  }
}

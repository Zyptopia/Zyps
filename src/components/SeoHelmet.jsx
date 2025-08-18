// src/components/SeoHelmet.js
import React, { useEffect } from 'react';

function setOrCreateTag(selector, tagName, attrs = {}) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(tagName);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => {
    if (v == null) el.removeAttribute(k);
    else el.setAttribute(k, v);
  });
  return el;
}

export default function SeoHelmet({
  title,
  description,
  canonical,
  jsonLd,              // array of JSON objects
  noindex = false,
  openGraphImage,      // absolute URL if you have one
}) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    // Description
    if (description) {
      setOrCreateTag('meta[name="description"]', 'meta', { name: 'description', content: description });
    }

    // Robots
    setOrCreateTag('meta[name="robots"]', 'meta', {
      name: 'robots',
      content: noindex ? 'noindex, nofollow' : 'index, follow'
    });

    // Canonical
    if (canonical) {
      let link = document.head.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    // Open Graph / Twitter (basic)
    if (title) {
      setOrCreateTag('meta[property="og:title"]', 'meta', { property: 'og:title', content: title });
      setOrCreateTag('meta[name="twitter:title"]', 'meta', { name: 'twitter:title', content: title });
    }
    if (description) {
      setOrCreateTag('meta[property="og:description"]', 'meta', { property: 'og:description', content: description });
      setOrCreateTag('meta[name="twitter:description"]', 'meta', { name: 'twitter:description', content: description });
    }
    if (openGraphImage) {
      setOrCreateTag('meta[property="og:image"]', 'meta', { property: 'og:image', content: openGraphImage });
      setOrCreateTag('meta[name="twitter:image"]', 'meta', { name: 'twitter:image', content: openGraphImage });
      setOrCreateTag('meta[name="twitter:card"]', 'meta', { name: 'twitter:card', content: 'summary_large_image' });
    }

    // JSON-LD
    const injected = [];
    if (Array.isArray(jsonLd) && jsonLd.length) {
      jsonLd.forEach((obj) => {
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.textContent = JSON.stringify(obj);
        document.head.appendChild(s);
        injected.push(s);
      });
    }

    return () => {
      // restore title on unmount (optional)
      if (title) document.title = prevTitle;
      injected.forEach((n) => n.remove());
    };
  }, [title, description, canonical, noindex, openGraphImage, jsonLd]);

  return null;
}

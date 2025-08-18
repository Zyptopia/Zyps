// src/components/ShareGraphButton.jsx
import React, { useState } from 'react';
import { trackEvent } from '../analytics';

export default function ShareGraphButton({
  targetId = 'shareable-graph',
  filename = 'zyptopia-graph.png',
  shareText = 'Daily Zypto rewards — explore more at https://www.zyptopia.org',
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function handleShare() {
    setBusy(true); setErr('');
    try {
      const node = document.getElementById(targetId);
      if (!node) throw new Error(`Graph container not found (id="${targetId}")`);

      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(node, {
        backgroundColor: null,
        useCORS: true,
        scale: window.devicePixelRatio < 2 ? 2 : 1.5
      });

      // simple branded ribbon
      const padded = document.createElement('canvas');
      padded.width = canvas.width;
      padded.height = canvas.height + 80;
      const ctx = padded.getContext('2d');
      ctx.fillStyle = 'rgba(18,22,28,1)'; ctx.fillRect(0,0,padded.width,padded.height);
      ctx.drawImage(canvas, 0, 0);
      ctx.fillStyle = 'rgba(22,27,34,.95)'; ctx.fillRect(0, canvas.height, padded.width, 80);
      ctx.font = '600 28px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
      ctx.fillStyle = 'rgba(255,255,255,.95)';
      ctx.fillText('zyptopia.org — community data & calculators', 32, canvas.height + 52);

      const blob = await new Promise(res => padded.toBlob(res, 'image/png', 0.92));

      // 1) Best case: native Web Share with files (mobile Chrome/Edge etc.)
      if (blob && navigator.canShare) {
        const file = new File([blob], filename, { type: 'image/png' });
        if (navigator.canShare({ files: [file], text: shareText })) {
          await navigator.share({ files: [file], text: shareText });
          trackEvent('share_graph', { method: 'webshare' });
          setBusy(false);
          return;
        }
      }

      // 2) Fallback (desktop & X limitations):
      //    Open a prefilled X compose (cannot auto-attach image via URL).
      //    We also trigger a download so the user can drop the image in the compose.
      const urlText = encodeURIComponent(shareText);
      const tweetUrl = `https://twitter.com/intent/tweet?text=${urlText}`;
      window.open(tweetUrl, '_blank', 'noopener');

      // Download the image for quick attach
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
      }

      trackEvent('share_graph', { method: 'twitter_fallback' });
    } catch (e) {
      setErr(e.message || 'Failed to share image.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
      <button
        className="btn btn-primary"
        onClick={handleShare}
        disabled={busy}
        style={{
          padding: '.5rem .85rem',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,.18)',
          background: 'linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.10))',
          fontWeight: 800
        }}
        title="Create a share image and post"
      >
        {busy ? 'Preparing…' : 'Share graph'}
      </button>
      {err ? <span style={{ color: '#f99', fontSize: '.9rem' }}>{err}</span> : null}
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { useVideoEmbed } from '@/hooks/useVideoEmbed';

interface VideoPlayerProps {
  url: string;
  className?: string;
}

// ── TikTok embed ───────────────────────────────────────────────────────────────
function TikTokEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // نحقن السكريبت مرة وحدة
    if (!document.querySelector('script[src*="tiktok.com/embed"]')) {
      const s = document.createElement('script');
      s.src = 'https://www.tiktok.com/embed.js';
      s.async = true;
      document.body.appendChild(s);
    } else {
      // إذا السكريبت موجود نشغّل render يدوياً
      (window as any)?.instgrm?.Embeds?.process?.();
    }
  }, [url]);

  return (
    <div ref={ref} style={{ maxWidth: '100%', overflow: 'hidden' }}>
      <blockquote
        className="tiktok-embed"
        cite={url}
        data-video-id={url.match(/video\/(\d+)/)?.[1] ?? ''}
        style={{ maxWidth: '100%', minWidth: 280 }}
      >
        <section />
      </blockquote>
    </div>
  );
}

// ── Twitter/X embed ────────────────────────────────────────────────────────────
function TwitterEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!document.querySelector('script[src*="platform.twitter.com"]')) {
      const s = document.createElement('script');
      s.src = 'https://platform.twitter.com/widgets.js';
      s.async = true;
      s.charset = 'utf-8';
      document.body.appendChild(s);
    } else {
      (window as any)?.twttr?.widgets?.load(ref.current);
    }
  }, [url]);

  return (
    <div ref={ref}>
      <blockquote className="twitter-video" data-dnt="true">
        <a href={url} />
      </blockquote>
    </div>
  );
}

// ── منصة لا تدعم embed ─────────────────────────────────────────────────────────
function UnsupportedEmbed({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 16px',
        borderRadius: 10,
        border: '1px solid #e8e3d8',
        background: '#faf8f4',
        color: '#525248',
        fontSize: 13,
        fontWeight: 500,
        textDecoration: 'none',
      }}
    >
      <ExternalLink size={15} />
      فتح {label} في تاب جديد
    </a>
  );
}

// ── الكومبوننت الرئيسي ─────────────────────────────────────────────────────────
export function VideoPlayer({ url, className }: VideoPlayerProps) {
  const embed = useVideoEmbed(url);

  if (!embed) return null;

  const containerStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    background: '#000',
  };

  const iframeStyle: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    border: 'none',
    display: 'block',
  };

  // ── YouTube / Vimeo / Instagram ── iframe
  if (embed.isIframe && embed.embedUrl) {
    return (
      <div style={containerStyle} className={className}>
        <iframe
          src={embed.embedUrl}
          style={iframeStyle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          title="video"
        />
      </div>
    );
  }

  // ── TikTok ── script embed
  if (embed.type === 'tiktok') {
    return (
      <div className={className}>
        <TikTokEmbed url={embed.originalUrl} />
      </div>
    );
  }

  // ── Twitter/X ── script embed
  if (embed.type === 'twitter') {
    return (
      <div className={className}>
        <TwitterEmbed url={embed.originalUrl} />
      </div>
    );
  }

  // ── Snapchat ── لا يدعم embed
  if (embed.type === 'snapchat') {
    return (
      <div className={className}>
        <UnsupportedEmbed url={embed.originalUrl} label="Snapchat" />
      </div>
    );
  }

  // ── فيديو مباشر (mp4, webm, blob...) ──
  if (embed.isDirectVideo && embed.directUrl) {
    return (
      <div style={containerStyle} className={className}>
        <video
          src={embed.directUrl}
          controls
          playsInline
          style={{ width: '100%', maxHeight: 520, display: 'block' }}
        >
          متصفحك لا يدعم تشغيل الفيديو
        </video>
      </div>
    );
  }

  // ── fallback ──
  return (
    <div className={className}>
      <UnsupportedEmbed url={embed.originalUrl} label="الفيديو" />
    </div>
  );
}
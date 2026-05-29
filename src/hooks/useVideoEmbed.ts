'use client';

/**
 * useVideoEmbed
 * ─────────────
 * يأخذ أي رابط فيديو ويرجع كيفية عرضه صح
 *
 * يدعم:
 *  - YouTube  (youtu.be / watch?v= / shorts / live)
 *  - TikTok   (vm.tiktok / www.tiktok)
 *  - Instagram (Reels / TV / p/)
 *  - Snapchat  (spotlight)
 *  - Twitter/X (status)
 *  - Vimeo
 *  - فيديو مرفوع مباشر (.mp4 / .webm / .mov / blob: / etc.)
 */

export type VideoType =
  | 'youtube'
  | 'tiktok'
  | 'instagram'
  | 'snapchat'
  | 'twitter'
  | 'vimeo'
  | 'direct'
  | 'unknown';

export interface VideoEmbed {
  type: VideoType;
  /** للـ iframe (YouTube, Vimeo) */
  embedUrl?: string;
  /** للـ oEmbed / script embed (TikTok, Instagram, Twitter) */
  oEmbedHtml?: string;
  /** للفيديو المباشر <video> */
  directUrl?: string;
  /** رابط الصفحة الأصلية للفتح في تاب جديد */
  originalUrl: string;
  /** هل يحتاج iframe */
  isIframe: boolean;
  /** هل يحتاج <video> tag */
  isDirectVideo: boolean;
  /** هل يحتاج script embed خارجي */
  isScriptEmbed: boolean;
}

// ── مساعدات التعرف ────────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

function isTikTok(url: string): boolean {
  return /tiktok\.com|vm\.tiktok\.com/.test(url);
}

function isInstagram(url: string): boolean {
  return /instagram\.com\/(reel|p|tv)\//.test(url);
}

function isSnapchat(url: string): boolean {
  return /snapchat\.com\/spotlight\/|t\.snapchat\.com\//.test(url);
}

function isTwitter(url: string): boolean {
  return /(?:twitter|x)\.com\/.+\/status\//.test(url);
}

function isDirectVideo(url: string): boolean {
  return (
    /\.(mp4|webm|ogg|mov|m4v|ogv)(\?.*)?$/i.test(url) ||
    url.startsWith('blob:') ||
    url.startsWith('data:video')
  );
}

// ── الدالة الرئيسية ────────────────────────────────────────────────────────────

export function parseVideoUrl(url: string): VideoEmbed {
  if (!url) {
    return {
      type: 'unknown',
      originalUrl: url,
      isIframe: false,
      isDirectVideo: false,
      isScriptEmbed: false,
    };
  }

  const clean = url.trim();

  // YouTube
  const ytId = extractYouTubeId(clean);
  if (ytId) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`,
      originalUrl: clean,
      isIframe: true,
      isDirectVideo: false,
      isScriptEmbed: false,
    };
  }

  // Vimeo
  const vimeoId = extractVimeoId(clean);
  if (vimeoId) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`,
      originalUrl: clean,
      isIframe: true,
      isDirectVideo: false,
      isScriptEmbed: false,
    };
  }

  // TikTok — يحتاج script embed
  if (isTikTok(clean)) {
    return {
      type: 'tiktok',
      originalUrl: clean,
      isIframe: false,
      isDirectVideo: false,
      isScriptEmbed: true,
    };
  }

  // Instagram — يحتاج script embed
  if (isInstagram(clean)) {
    // نقل الرابط لـ /embed/
    const embedUrl = clean.replace(/(instagram\.com\/(reel|p|tv)\/[^/?]+).*/, '$1/embed/');
    return {
      type: 'instagram',
      embedUrl,
      originalUrl: clean,
      isIframe: true,
      isDirectVideo: false,
      isScriptEmbed: false,
    };
  }

  // Snapchat — لا يدعم embed، نفتح في تاب جديد
  if (isSnapchat(clean)) {
    return {
      type: 'snapchat',
      originalUrl: clean,
      isIframe: false,
      isDirectVideo: false,
      isScriptEmbed: false,
    };
  }

  // Twitter/X — يحتاج script embed
  if (isTwitter(clean)) {
    return {
      type: 'twitter',
      originalUrl: clean,
      isIframe: false,
      isDirectVideo: false,
      isScriptEmbed: true,
    };
  }

  // فيديو مباشر
  if (isDirectVideo(clean)) {
    return {
      type: 'direct',
      directUrl: clean,
      originalUrl: clean,
      isIframe: false,
      isDirectVideo: true,
      isScriptEmbed: false,
    };
  }

  // مجهول — نحاول نشغله كـ video مباشر
  return {
    type: 'unknown',
    directUrl: clean,
    originalUrl: clean,
    isIframe: false,
    isDirectVideo: true,
    isScriptEmbed: false,
  };
}

// ── الهوك ─────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';

export function useVideoEmbed(url: string | null | undefined): VideoEmbed | null {
  return useMemo(() => {
    if (!url) return null;
    return parseVideoUrl(url);
  }, [url]);
}
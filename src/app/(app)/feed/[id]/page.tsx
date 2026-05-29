'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Post } from '@/types';
import { api } from '@/lib/api';
import { PostCard } from '@/components/posts/PostCard';
import { CommentsSection } from '@/components/comments/CommentsSection';
import { PostSkeleton } from '@/components/ui/Skeleton';

/* ─────────────────────────────────────────
   Same fonts as FeedPage — already loaded if
   you added the import to your layout/global CSS.
   @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
───────────────────────────────────────── */

const FONT_DISPLAY = "'Lora', Georgia, serif";
const FONT_BODY    = "'DM Sans', system-ui, sans-serif";

// ── shared design tokens (keep in sync with FeedPage / move to tokens.ts) ──────
const token = {
  bg:        '#faf8f4',
  surface:   '#ffffff',
  surfaceAlt:'#f5f2ec',
  border:    '#e8e3d8',
  borderHov: '#d4cfc4',
  textPri:   '#1a1916',
  textSec:   '#5a5750',
  textMuted: '#9a9890',
  accent:    '#2c2b26',
  accentTxt: '#f5f3ee',
};

// ── back link ──────────────────────────────────────────────────────────────────
function BackLink() {
  return (
    <Link
      href="/feed"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: FONT_BODY,
        fontSize: 13,
        fontWeight: 400,
        color: token.textMuted,
        textDecoration: 'none',
        marginBottom: 24,
        transition: 'color 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = token.textSec)}
      onMouseLeave={(e) => (e.currentTarget.style.color = token.textMuted)}
    >
      <ArrowLeft size={15} />
      Back to feed
    </Link>
  );
}

// ── comments container ─────────────────────────────────────────────────────────
function CommentsCard({ postId }: { postId: string }) {
  return (
    <div
      style={{
        marginTop: 12,
        background: token.surface,
        border: `0.5px solid ${token.border}`,
        borderRadius: 14,
        padding: '20px 22px',
      }}
    >
      {/* header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        paddingBottom: 14,
        borderBottom: `0.5px solid ${token.border}`,
      }}>
        <MessageCircle size={16} color={token.textMuted} />
        <h2 style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 17,
          fontWeight: 400,
          color: token.textPri,
          margin: 0,
        }}>
          Comments
        </h2>
      </div>

      <CommentsSection postId={postId} />
    </div>
  );
}

// ── not-found state ────────────────────────────────────────────────────────────
function PostNotFound() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '64px 24px',
      background: token.surface,
      border: `0.5px solid ${token.border}`,
      borderRadius: 14,
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: token.surfaceAlt,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 14px',
      }}>
        <MessageCircle size={20} color={token.textMuted} />
      </div>
      <p style={{
        fontFamily: FONT_DISPLAY,
        fontSize: 18,
        color: token.textPri,
        margin: '0 0 6px',
      }}>
        Post not found
      </p>
      <p style={{
        fontFamily: FONT_BODY,
        fontSize: 13,
        color: token.textMuted,
        margin: '0 0 20px',
      }}>
        This post may have been deleted or never existed.
      </p>
      <Link
        href="/feed"
        style={{
          fontFamily: FONT_BODY,
          fontSize: 13,
          fontWeight: 500,
          color: token.accentTxt,
          background: token.accent,
          border: 'none',
          borderRadius: 8,
          padding: '8px 20px',
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        Back to feed
      </Link>
    </div>
  );
}

// ── post wrapper — adds the styled card shell around PostCard ──────────────────
function PostWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: token.surface,
      border: `0.5px solid ${token.border}`,
      borderLeft: `2.5px solid #c8bfa8`,   // warm accent — matches FeedPage newest-post style
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

// ── page ───────────────────────────────────────────────────────────────────────
export default function PostDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const [post, setPost]       = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Post>(`/posts/${id}`)
      .then(({ data }) => setPost(data))
      .catch(() => toast.error('Post not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = () => router.push('/feed');
  const handleUpdate = (updated: Post) => setPost(updated);

  return (
    <div
      style={{
        fontFamily: FONT_BODY,
        background: token.bg,
        minHeight: '100vh',
        padding: '32px 24px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <BackLink />

        {loading ? (
          <PostSkeleton />
        ) : post ? (
          <>
            <PostWrapper>
              <PostCard
                post={post}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                showCommentToggle={false}
              />
            </PostWrapper>

            <CommentsCard postId={post.id} />
          </>
        ) : (
          <PostNotFound />
        )}
      </div>
    </div>
  );
}
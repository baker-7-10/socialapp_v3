'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Trash2, MoreHorizontal, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Post } from '@/types';
import { api, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Avatar } from '@/components/ui/Avatar';
import { VideoPlayer } from '@/components/ui/Videoplayer'; // ← جديد
import clsx from 'clsx';

interface PostCardProps {
  post: Post;
  onDelete?: (id: string) => void;
  onUpdate?: (post: Post) => void;
  showCommentToggle?: boolean;
}

export function PostCard({ post, onDelete, onUpdate, showCommentToggle = true }: PostCardProps) {
  const { user } = useAuthStore();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isOwner = user?.id === post.authorId;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    const wasLiked = liked;
    setLiked(!liked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    try {
      if (wasLiked) {
        await api.delete(`/posts/${post.id}/like`);
      } else {
        await api.post(`/posts/${post.id}/like`);
      }
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
      toast.error('Failed to update like');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/posts/${post.id}`);
      onDelete?.(post.id);
      toast.success('Post deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
      setShowMenu(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setEditLoading(true);
    try {
      const { data } = await api.patch<Post>(`/posts/${post.id}`, {
        content: editContent,
      });
      onUpdate?.(data);
      setEditing(false);
      toast.success('Post updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <article
      className="rounded-xl border transition-shadow hover:shadow-md animate-fade-in"
      style={{ background: '#ffffff', borderColor: 'var(--border)' }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <Link href={`/users/${post.author.id}`} className="flex items-center gap-3 group">
            <Avatar src={post.author.avatarUrl} username={post.author.username} size="md" />
            <div>
              <p className="text-sm font-semibold group-hover:underline" style={{ color: '#0d0d0d' }}>
                @{post.author.username}
              </p>
              <p className="text-xs" style={{ color: '#a8a89e' }}>
                {timeAgo}
              </p>
            </div>
          </Link>

          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: '#a8a89e' }}
                onMouseEnter={(e) => {
                  (e.currentTarget).style.background = '#f5f0e8';
                  (e.currentTarget).style.color = '#525248';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget).style.background = 'transparent';
                  (e.currentTarget).style.color = '#a8a89e';
                }}
              >
                <MoreHorizontal size={16} />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 top-8 z-10 rounded-lg shadow-lg border py-1 w-36 animate-scale-in"
                  style={{ background: '#ffffff', borderColor: 'var(--border)' }}
                >
                  <button
                    onClick={() => { setEditing(true); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors"
                    style={{ color: '#525248' }}
                    onMouseEnter={(e) => ((e.currentTarget).style.background = '#f5f0e8')}
                    onMouseLeave={(e) => ((e.currentTarget).style.background = 'transparent')}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors"
                    style={{ color: '#d94f3d' }}
                    onMouseEnter={(e) => ((e.currentTarget).style.background = '#fff0ee')}
                    onMouseLeave={(e) => ((e.currentTarget).style.background = 'transparent')}
                  >
                    <Trash2 size={14} /> {deleteLoading ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {editing ? (
          <div className="mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm resize-none"
              style={{
                background: '#faf8f3',
                border: '1.5px solid #c8a96e',
                color: '#0d0d0d',
                outline: 'none',
                minHeight: '80px',
              }}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleEdit}
                disabled={editLoading}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: '#0d0d0d', color: '#faf8f3' }}
              >
                {editLoading ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => { setEditing(false); setEditContent(post.content); }}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: '#f5f0e8', color: '#525248' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#1a1a12', whiteSpace: 'pre-wrap' }}>
            {post.content}
          </p>
        )}

        {/* ── فيديو (أي نوع) ── */}
        {post.videoUrl && !editing && (
          <div className="mb-3">
            <VideoPlayer url={post.videoUrl} />
          </div>
        )}

        {/* صورة */}
        {post.imageUrl && !editing && (
          <img
            src={post.imageUrl}
            alt="Post image"
            className="w-full rounded-lg mb-3 object-cover"
            style={{ maxHeight: '360px' }}
          />
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t" style={{ borderColor: '#f0ebe0' }}>
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={clsx('flex items-center gap-1.5 text-sm transition-all py-1')}
            style={{ color: liked ? '#d94f3d' : '#a8a89e' }}
          >
            <Heart
              size={16}
              fill={liked ? '#d94f3d' : 'none'}
              className={likeLoading ? 'animate-pulse-soft' : ''}
            />
            <span className="text-xs">{likeCount}</span>
          </button>

          {showCommentToggle && (
            <Link
              href={`/feed/${post.id}`}
              className="flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: '#a8a89e' }}
            >
              <MessageCircle size={16} />
              <span className="text-xs">{post.commentCount}</span>
            </Link>
          )}
        </div>
      </div>

      {showMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />
      )}
    </article>
  );
}
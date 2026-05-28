'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { Post, PaginatedResponse } from '@/types';
import { api } from '@/lib/api';
import { PostCard } from '@/components/posts/PostCard';
import { CreatePostForm } from '@/components/posts/CreatePostForm';
import { PostSkeleton } from '@/components/ui/Skeleton';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async (p = 1) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const { data } = await api.get<PaginatedResponse<Post>>(`/posts?page=${p}&limit=10`);
      if (p === 1) setPosts(data.data);
      else setPosts((prev) => [...prev, ...data.data]);
      setTotalPages(data.meta.totalPages);
    } catch {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleCreated = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
  };

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdate = (updated: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next);
  };

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-6">
        <h1
          className="text-3xl mb-1"
          style={{ fontFamily: 'var(--font-display)', color: '#0d0d0d' }}
        >
          Your Feed
        </h1>
        <p className="text-sm" style={{ color: '#a8a89e' }}>
          What people are saying today
        </p>
      </div>

      {/* Create post */}
      <CreatePostForm onCreated={handleCreated} />

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <PostSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl border"
          style={{ background: '#ffffff', borderColor: 'var(--border)' }}
        >
          <p
            className="text-2xl mb-2"
            style={{ fontFamily: 'var(--font-display)', color: '#0d0d0d' }}
          >
            Nothing here yet
          </p>
          <p className="text-sm" style={{ color: '#a8a89e' }}>
            Be the first to post something!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>

          {page < totalPages && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e0dbd0',
                  color: '#525248',
                }}
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Loading…
                  </>
                ) : (
                  'Load more'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

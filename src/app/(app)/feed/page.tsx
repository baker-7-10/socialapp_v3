'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { usePostsStore } from '@/lib/store';
import { PostCard } from '@/components/posts/PostCard';
import { CreatePostForm } from '@/components/posts/CreatePostForm';
import { PostSkeleton } from '@/components/ui/Skeleton';

export default function FeedPage() {
  const { posts, fetchPosts, deletePost, updatePost, isLoading, error, currentPage, totalPages } = usePostsStore();
  const [localLoading, setLocalLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const loadInitialPosts = async () => {
      setLocalLoading(true);
      await fetchPosts(1, 10);
      setLocalLoading(false);
    };
    loadInitialPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleDelete = (id: string) => {
    deletePost(id);
  };

  const handleUpdate = () => {
    // Update is handled by the store
  };

  const handleCreated = async () => {
    // Reset to first page after creating a post
    await fetchPosts(1, 10);
  };

  const loadMore = async () => {
    setLoadingMore(true);
    await fetchPosts(currentPage + 1, 10);
    setLoadingMore(false);
  };

  const loading = localLoading || isLoading;

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

          {currentPage < totalPages && (
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

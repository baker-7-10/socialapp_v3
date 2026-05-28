'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Post } from '@/types';
import { api } from '@/lib/api';
import { PostCard } from '@/components/posts/PostCard';
import { CommentsSection } from '@/components/comments/CommentsSection';
import { PostSkeleton } from '@/components/ui/Skeleton';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
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
    <div className="animate-fade-in">
      <Link
        href="/feed"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: '#a8a89e' }}
      >
        <ArrowLeft size={16} />
        Back to feed
      </Link>

      {loading ? (
        <PostSkeleton />
      ) : post ? (
        <>
          <PostCard
            post={post}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            showCommentToggle={false}
          />

          <div
            className="mt-6 rounded-xl border p-5"
            style={{ background: '#ffffff', borderColor: 'var(--border)' }}
          >
            <h2
              className="text-lg mb-4"
              style={{ fontFamily: 'var(--font-display)', color: '#0d0d0d' }}
            >
              Comments
            </h2>
            <CommentsSection postId={post.id} />
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <p style={{ color: '#a8a89e' }}>Post not found</p>
        </div>
      )}
    </div>
  );
}

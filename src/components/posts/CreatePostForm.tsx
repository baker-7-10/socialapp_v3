'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Image, Send, X } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Post } from '@/types';
import { Avatar } from '@/components/ui/Avatar';

interface CreatePostFormProps {
  onCreated: (post: Post) => void;
}

export function CreatePostForm({ onCreated }: CreatePostFormProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const maxChars = 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const payload: { content: string; imageUrl?: string } = { content: content.trim() };
      if (imageUrl.trim()) payload.imageUrl = imageUrl.trim();
      const { data } = await api.post<Post>('/posts', payload);
      onCreated(data);
      setContent('');
      setImageUrl('');
      setShowImageInput(false);
      toast.success('Posted!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const remaining = maxChars - content.length;
  const isOverLimit = remaining < 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border p-5 mb-6"
      style={{ background: '#ffffff', borderColor: 'var(--border)' }}
    >
      <div className="flex gap-3">
        {user && (
          <Avatar src={user.avatarUrl} username={user.username} size="md" className="flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={maxChars + 50}
            className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none"
            style={{ color: '#0d0d0d', minHeight: '80px' }}
          />

          {showImageInput && (
            <div className="flex items-center gap-2 mb-3 animate-slide-down">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 rounded-lg text-xs"
                style={{
                  background: '#faf8f3',
                  border: '1.5px solid #e0dbd0',
                  color: '#0d0d0d',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => { setShowImageInput(false); setImageUrl(''); }}
                className="p-1.5 rounded-lg"
                style={{ color: '#a8a89e' }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#f0ebe0' }}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className="p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1.5"
                style={{
                  color: showImageInput ? '#c8a96e' : '#a8a89e',
                  background: showImageInput ? '#f5edd8' : 'transparent',
                }}
              >
                <Image size={16} />
                <span>Image</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="text-xs"
                style={{ color: isOverLimit ? '#d94f3d' : remaining < 50 ? '#c8a96e' : '#a8a89e' }}
              >
                {remaining}
              </span>
              <button
                type="submit"
                disabled={loading || !content.trim() || isOverLimit}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: (!content.trim() || isOverLimit || loading) ? '#d0d0c8' : '#0d0d0d',
                  color: '#faf8f3',
                  cursor: (!content.trim() || isOverLimit || loading) ? 'not-allowed' : 'pointer',
                }}
              >
                <Send size={12} />
                {loading ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Edit2, Save, X, MapPin, Globe, Users, FileText, Camera
} from 'lucide-react';
import { User, Post, PaginatedResponse } from '@/types';
import { api, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { PostCard } from '@/components/posts/PostCard';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton, PostSkeleton } from '@/components/ui/Skeleton';

type Tab = 'posts';

export default function ProfilePage() {
  const { user, setAuth, token } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    avatarUrl: '',
    coverUrl: '',
    pronouns: '',
  });

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get<User>('/users/me');
      setProfile(data);
      setForm({
        displayName: data.displayName || '',
        bio: data.bio || '',
        location: data.location || '',
        website: data.website || '',
        avatarUrl: data.avatarUrl || '',
        coverUrl: data.coverUrl || '',
        pronouns: data.pronouns || '',
      });
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get<PaginatedResponse<Post>>('/posts?page=1&limit=20');
      // Filter to own posts
      const myPosts = data.data.filter((p) => p.authorId === user.id);
      setPosts(myPosts);
    } catch {
      // silently fail
    } finally {
      setLoadingPosts(false);
    }
  }, [user]);

  useEffect(() => { fetchProfile(); fetchPosts(); }, [fetchProfile, fetchPosts]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch<User>('/users/me', form);
      setProfile(data);
      if (token) setAuth(data, token);
      setEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = (id: string) => setPosts((p) => p.filter((post) => post.id !== id));
  const handleUpdatePost = (updated: Post) =>
    setPosts((p) => p.map((post) => (post.id === updated.id ? updated : post)));

  if (loadingProfile) {
    return (
      <div className="animate-fade-in">
        <div className="rounded-xl border overflow-hidden mb-6" style={{ background: '#ffffff', borderColor: 'var(--border)' }}>
          <Skeleton className="h-36 w-full rounded-none" />
          <div className="px-5 pb-5">
            <div className="-mt-8 mb-4">
              <Skeleton className="w-16 h-16 rounded-full" />
            </div>
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-64 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="space-y-4">{[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}</div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="animate-fade-in">
      {/* Profile card */}
      <div
        className="rounded-xl border overflow-hidden mb-6"
        style={{ background: '#ffffff', borderColor: 'var(--border)' }}
      >
        {/* Cover */}
        <div
          className="h-36 relative"
          style={{
            background: profile.coverUrl
              ? `url(${profile.coverUrl}) center/cover`
              : 'linear-gradient(135deg, #0d0d0d 0%, #3a3a32 100%)',
          }}
        >
          {editing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="w-full px-5">
                <label className="block text-xs text-white/70 mb-1">Cover image URL</label>
                <input
                  type="url"
                  value={form.coverUrl}
                  onChange={(e) => setForm((f) => ({ ...f, coverUrl: e.target.value }))}
                  placeholder="https://…"
                  className="w-full px-3 py-2 rounded-lg text-xs"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', outline: 'none' }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-5">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div className="relative">
              <Avatar src={profile.avatarUrl} username={profile.username} size="xl" className="ring-4" style={{ '--tw-ring-color': '#ffffff' } as React.CSSProperties} />
              {editing && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#c8a96e' }}>
                  <Camera size={10} color="#fff" />
                </div>
              )}
            </div>
            <div>
              {editing ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: '#f5f0e8', color: '#525248' }}
                  >
                    <X size={12} /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: '#0d0d0d', color: '#faf8f3' }}
                  >
                    <Save size={12} /> {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: '#f5f0e8', color: '#525248', border: '1.5px solid #e0dbd0' }}
                >
                  <Edit2 size={12} /> Edit profile
                </button>
              )}
            </div>
          </div>

          {/* Name / bio */}
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#525248' }}>Display name</label>
                <input
                  value={form.displayName}
                  onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: '#faf8f3', border: '1.5px solid #e0dbd0', color: '#0d0d0d', outline: 'none' }}
                  placeholder="Your display name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#525248' }}>Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                  style={{ background: '#faf8f3', border: '1.5px solid #e0dbd0', color: '#0d0d0d', outline: 'none', minHeight: '80px' }}
                  placeholder="Tell us about yourself"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#525248' }}>Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ background: '#faf8f3', border: '1.5px solid #e0dbd0', color: '#0d0d0d', outline: 'none' }}
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#525248' }}>Pronouns</label>
                  <input
                    value={form.pronouns}
                    onChange={(e) => setForm((f) => ({ ...f, pronouns: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ background: '#faf8f3', border: '1.5px solid #e0dbd0', color: '#0d0d0d', outline: 'none' }}
                    placeholder="they/them"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#525248' }}>Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: '#faf8f3', border: '1.5px solid #e0dbd0', color: '#0d0d0d', outline: 'none' }}
                  placeholder="https://yoursite.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#525248' }}>Avatar URL</label>
                <input
                  type="url"
                  value={form.avatarUrl}
                  onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: '#faf8f3', border: '1.5px solid #e0dbd0', color: '#0d0d0d', outline: 'none' }}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold" style={{ color: '#0d0d0d', fontFamily: 'var(--font-display)' }}>
                  {profile.displayName || profile.username}
                </h1>
                {profile.pronouns && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f5edd8', color: '#9a7840' }}>
                    {profile.pronouns}
                  </span>
                )}
              </div>
              <p className="text-sm mb-2" style={{ color: '#a8a89e' }}>@{profile.username}</p>
              {profile.bio && (
                <p className="text-sm mb-3 leading-relaxed" style={{ color: '#3a3a32' }}>
                  {profile.bio}
                </p>
              )}
              <div className="flex flex-wrap gap-3 mb-4">
                {profile.location && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: '#7a7a72' }}>
                    <MapPin size={12} /> {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs transition-colors"
                    style={{ color: '#c8a96e' }}
                  >
                    <Globe size={12} /> {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 pt-3 border-t" style={{ borderColor: '#f0ebe0' }}>
                {[
                  { label: 'Posts', value: profile._count?.posts ?? 0, icon: FileText },
                  { label: 'Followers', value: profile._count?.followers ?? 0, icon: Users },
                  { label: 'Following', value: profile._count?.following ?? 0, icon: Users },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <Icon size={13} style={{ color: '#a8a89e' }} />
                    <span className="text-sm font-bold" style={{ color: '#0d0d0d' }}>{value}</span>
                    <span className="text-xs" style={{ color: '#a8a89e' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* My posts */}
      <div className="mb-4">
        <h2 className="text-lg" style={{ fontFamily: 'var(--font-display)', color: '#0d0d0d' }}>
          My Posts
        </h2>
      </div>

      {loadingPosts ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}</div>
      ) : posts.length === 0 ? (
        <div
          className="text-center py-10 rounded-xl border"
          style={{ background: '#ffffff', borderColor: 'var(--border)' }}
        >
          <p className="text-sm" style={{ color: '#a8a89e' }}>No posts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={handleDeletePost} onUpdate={handleUpdatePost} />
          ))}
        </div>
      )}
    </div>
  );
}

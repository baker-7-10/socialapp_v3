'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Globe, Users, FileText, UserPlus, UserMinus } from 'lucide-react';
import toast from 'react-hot-toast';
import { User, Post, PaginatedResponse } from '@/types';
import { api, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { PostCard } from '@/components/posts/PostCard';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton, PostSkeleton } from '@/components/ui/Skeleton';

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: me } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get<User>(`/users/${id}`);
      setProfile(data);
      setFollowerCount(data._count?.followers ?? 0);
    } catch {
      toast.error('User not found');
    } finally {
      setLoadingProfile(false);
    }
  }, [id]);

  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await api.get<PaginatedResponse<Post>>('/posts?page=1&limit=50');
      const userPosts = data.data.filter((p) => p.authorId === id);
      setPosts(userPosts);
    } catch {
      // silently fail
    } finally {
      setLoadingPosts(false);
    }
  }, [id]);

  const fetchFollowers = useCallback(async () => {
    if (!me) return;
    try {
      const { data } = await api.get<PaginatedResponse<User>>(`/users/${me.id}/following`);
      const isFollowing = data.data.some((u) => u.id === id);
      setFollowing(isFollowing);
    } catch {
      // silently fail
    }
  }, [id, me]);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
    fetchFollowers();
  }, [fetchProfile, fetchPosts, fetchFollowers]);

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    const was = following;
    setFollowing(!was);
    setFollowerCount((c) => (was ? c - 1 : c + 1));
    try {
      if (was) {
        await api.delete(`/users/${id}/follow`);
        toast.success('Unfollowed');
      } else {
        await api.post(`/users/${id}/follow`);
        toast.success('Following!');
      }
    } catch (err) {
      setFollowing(was);
      setFollowerCount((c) => (was ? c + 1 : c - 1));
      toast.error(getErrorMessage(err));
    } finally {
      setFollowLoading(false);
    }
  };

  const isMe = me?.id === id;

  if (isMe) {
    return (
      <div className="text-center py-16">
        <p style={{ color: '#a8a89e' }}>
          This is your profile.{' '}
          <Link href="/profile" style={{ color: '#c8a96e' }}>
            Go to profile
          </Link>
        </p>
      </div>
    );
  }

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
            <Skeleton className="h-4 w-full mb-1" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p style={{ color: '#a8a89e' }}>User not found</p>
        <Link href="/feed" className="text-sm mt-2 inline-block" style={{ color: '#c8a96e' }}>← Back to feed</Link>
      </div>
    );
  }

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

      {/* Profile card */}
      <div
        className="rounded-xl border overflow-hidden mb-6"
        style={{ background: '#ffffff', borderColor: 'var(--border)' }}
      >
        {/* Cover */}
        <div
          className="h-36"
          style={{
            background: profile.coverUrl
              ? `url(${profile.coverUrl}) center/cover`
              : 'linear-gradient(135deg, #0d0d0d 0%, #3a3a32 100%)',
          }}
        />

        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-8 mb-4">
            <Avatar src={profile.avatarUrl} username={profile.username} size="xl" />
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: following ? '#f5f0e8' : '#0d0d0d',
                color: following ? '#525248' : '#faf8f3',
                border: following ? '1.5px solid #e0dbd0' : 'none',
              }}
            >
              {following ? (
                <><UserMinus size={14} /> Unfollow</>
              ) : (
                <><UserPlus size={14} /> Follow</>
              )}
            </button>
          </div>

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
                className="flex items-center gap-1 text-xs"
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
              { label: 'Followers', value: followerCount, icon: Users },
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
      </div>

      {/* Posts */}
      <div className="mb-4">
        <h2 className="text-lg" style={{ fontFamily: 'var(--font-display)', color: '#0d0d0d' }}>
          Posts
        </h2>
      </div>
      {loadingPosts ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 rounded-xl border" style={{ background: '#ffffff', borderColor: 'var(--border)' }}>
          <p className="text-sm" style={{ color: '#a8a89e' }}>No posts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
